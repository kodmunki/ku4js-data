var exif = {
    isValidJpeg: function(file) {
        return $.exists(file) && (file.getByteAt(0) == 0xFF || file.getByteAt(1) == 0xD8);
    },

    readExifDataInImageResult: function(result) {
        if(!$.exists(result)) throw $.ku4exception("EXIF", "Cannot get exif data for an invalid image result.");
        var file = binaryFile.parseImageResult(result);
        return exif.readExifDataInJpeg(file);
    },

    readExifDataInJpeg: function (file) {

        if(!exif.isValidJpeg(file)) return invalidExifReturnValue();

        var fileLength = file.getLength(), offset = 2, marker;

        function isValidMarkerOffset(file, offset) { return file.getByteAt(offset) == 0xFF }

        function isFfe1Marker(marker) { return marker == 22400 || marker == 225; }

        while (offset < fileLength) {
            if (!isValidMarkerOffset(file, offset)) return invalidExifReturnValue();;

            marker = file.getByteAt(offset + 1);

            var offsetPlus4 = offset + 4,
                intShort = file.getShortAt(offset + 2, true),
                intShortPlus2 = intShort + 2,
                intShortMinus2 = intShort - 2;

            if (isFfe1Marker(marker))
                return exif.readExifData(file, offsetPlus4, intShortMinus2);

            offset += intShortPlus2;
        }

        return invalidExifReturnValue();;
    },

    readExifData: function (file, start) {

        if(!isValidExif(file, start)) return {};

        var tiffOffset = start + 6,
            isBigEndian = file.getShortAt(tiffOffset) == 0x4D4D;

        if (!isValidTiff(file, tiffOffset, isBigEndian)) return {};

        //NOTE: tags should be a property and return the valid tags.

        var tiffTags = exif.readTiffTags(file, tiffOffset, isBigEndian),

            exifTags = ($.exists(tiffTags.ExifIFDPointer))
                ? exif.readExifTags(file, tiffOffset, tiffTags.ExifIFDPointer, isBigEndian) : {},

            gpsTags = ($.exists(tiffTags.GPSInfoIFDPointer))
                ? exif.readGpsTags(file, tiffOffset, tiffTags.GPSInfoIFDPointer, isBigEndian) : {};

        return $.hash().merge(tiffTags).merge(exifTags).merge(gpsTags).toObject();
    },

    readTiffTags: function(file, offset, isBigEndian) {
        return exif.readTags(file, offset, offset + 8, TIFF_TAGS, isBigEndian);
    },

    readExifTags: function(file, offset, exifIfdPointer, isBigEndian) {
        var exifTags = exif.readTags(file, offset, offset + exifIfdPointer, EXIF_TAGS, isBigEndian),
            tags = {};

        for (var tag in exifTags) {
            if(exifTags.hasOwnProperty(tag)) {
                var data = exifTags[tag];
                if(!$.exists(data)) continue;
                switch (tag) {
                    case "FileSource" :
                        exifTags[tag] = META_TAGS[tag][data];
                        break;
                    case "ExifVersion" :
                    case "FlashpixVersion" :
                        exifTags[tag] = String.fromCharCode(data[0], data[1], data[2], data[3]);
                        break;
                    case "ComponentsConfiguration" :
                        var components = META_TAGS.Components;
                        exifTags[tag] = components[data[0]] + components[data[1]] + components[data[2]] + components[data[3]];
                        break;
                }
                tags[tag] = exifTags[tag];
            }
        }
        return tags;
    },

    readGpsTags: function(file, offset, gpsInfoIfdPointer, isBigEndian) {
        var gpsTags = exif.readTags(file, offset, offset + gpsInfoIfdPointer, GPS_TAGS, isBigEndian),
            tags = {};

        for (var tag in gpsTags) {
            if (gpsTags.hasOwnProperty(tag)) {
                var data = gpsTags[tag];
                if(!$.exists(data)) continue;
                switch (tag) {
                    case "GPSVersionID" :
                        gpsTags[tag] = data[0] + "." + data[1] + "." + data[2] + "." + data[3];
                        break;
                }
                tags[tag] = gpsTags[tag];
            }
        }
        return tags
    },

    readTags: function(file, tiffStart, dirStart, strings, isBigEndian) {
        var entries = file.getShortAt(dirStart, isBigEndian),
            tags = {},
            entryOffset, tag;

        for (var i = 0; i < entries; i++) {
            entryOffset = dirStart + i * 12 + 2;

            tag = strings[file.getShortAt(entryOffset, isBigEndian)] || "UNDEF_Proprietary_data_" + dirStart + "_" + i;
            tags[tag] = exif.readTagValue(file, entryOffset, tiffStart, dirStart, isBigEndian);
        }
        return tags;
    },

    readTagValue: function (file, entryOffset, tiffStart, dirStart, isBigEndian) {
        var type = file.getShortAt(entryOffset + 2, isBigEndian),
            numValues = file.getLongAt(entryOffset + 4, isBigEndian),
            valueOffset = file.getLongAt(entryOffset + 8, isBigEndian) + tiffStart,
            offset, numerator, denominator, vals, i;

        switch (type) {
            case 2:
                offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                return file.getStringAt(offset, numValues - 1);
            case 3: //NOTE: intShort, 16 bit int
                if (numValues == 1) {
                    return file.getShortAt(entryOffset + 8, isBigEndian);
                }
                else {
                    offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (i = 0; i < numValues; i++) {

                        vals[i] = file.getShortAt(offset + 2 * i, isBigEndian);
                    }
                    return vals;
                }
            case 4: //NOTE: long, 32 bit int
                if (numValues == 1) {
                    return file.getLongAt(entryOffset + 8, isBigEndian);
                }
                else {
                    vals = [];
                    for (i = 0; i < numValues; i++) {
                        vals[i] = file.getLongAt(valueOffset + 4 * i, isBigEndian);
                    }
                    return vals;
                }
            case 5: //NOTE: rational = two long values, first is numerator, second is denominator
                if (numValues == 1) {
                    numerator = file.getLongAt(valueOffset, isBigEndian);
                    denominator = file.getLongAt(valueOffset + 4, isBigEndian);
                    return numerator/denominator;
                }
                else {
                    vals = [];
                    for (i = 0; i < numValues; i++) {
                        numerator = file.getLongAt(valueOffset + 8 * i, isBigEndian);
                        denominator = file.getLongAt(valueOffset + 4 + 8 * i, isBigEndian);
                        vals[i] = numerator/denominator;
                    }
                    return vals;
                }
            case 7:
                if (numValues == 1) {
                    return file.getByteAt(entryOffset + 8, isBigEndian);
                }
                else {
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (i = 0; i < numValues; i++) {
                        vals[i] = file.getByteAt(offset + i);
                    }
                    return vals;
                }
            case 9:
                if (numValues == 1) {
                    return file.getSLongAt(entryOffset + 8, isBigEndian);
                }
                else {
                    vals = [];
                    for (i = 0; i < numValues; i++) {
                        vals[i] = file.getSLongAt(valueOffset + 4 * i, isBigEndian);
                    }
                    return vals;
                }
            case 10:
                if (numValues == 1) {
                    return file.getSLongAt(valueOffset, isBigEndian) / file.getSLongAt(valueOffset + 4, isBigEndian);
                }
                else {
                    vals = [];
                    for (i = 0; i < numValues; i++) {
                        vals[n] = file.getSLongAt(valueOffset + 8 * i, isBigEndian) / file.getSLongAt(valueOffset + 4 + 8 * i, isBigEndian);
                    }
                    return vals;
                }
            default: return null
        }
    }
};

function isValidExif (file, charIndex) {
    return (file.getStringAt(charIndex, 4) == "Exif");
}

function isValidTiff (file, offset, isBigEndian) {
    return (file.getShortAt(offset + 2, isBigEndian) == 0x002A) ||
           (file.getLongAt(offset + 4, isBigEndian) == 0x00000008)
}

function invalidExifReturnValue () {
    return { "__INVALID_FILE__": "Cannot read EXIF data." };
}

$.exif = function() {
    return exif;
};