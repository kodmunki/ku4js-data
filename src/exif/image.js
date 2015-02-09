$.image = {
    dataUrlFromSrc: function(src, func, scp, options) {
        var scope = (!$.exists(scp) || $.isObjectLiteral(scp)) ? this : scp;
        $.image.blobFromSrc(src, function(blob) {
            var fileReader = new FileReader();
            fileReader.onload = function() { func.call(scope, fileReader.result); };
            fileReader.readAsDataURL(blob);
        },  scp, options);

    },
    blobFromSrc: function (src, func, scp, options) {
        var scope = (!$.exists(scp) || $.isObjectLiteral(scp)) ? this : scp,
            opts = ($.isObjectLiteral(scp)) ? scp : ($.exists(options)) ? options : { },
            mimeType = opts.mimeType || "image/jpeg",
            image = document.createElement("img");

        image.onload = function () {

            var exif = (/data:image\/.*;base64,/.test(src)) ? $.exif().readExifDataInDataUrl(src) : {},
                orientation = exif.Orientation,
                imageWidth = ($.exists(image.naturalWidth)) ? image.naturalWidth : image.width,
                imageHeight = ($.exists(image.naturalHeight)) ? image.naturalHeight : image.height,
                imageRect = $.rectangle($.point.zero(), $.point(imageWidth, imageHeight)),
                maxDims = ($.exists(opts.maxDims)) ? $.coord.parse(opts.maxDims).value() : {x:imageWidth, y:imageHeight},
                maxRect = $.rectangle($.point.zero(), maxDims),
                aspectDims = imageRect.aspectToFit(maxRect).dims(),
                aspectWidth = aspectDims.x(),
                aspectHeight = aspectDims.y(),
                aspectCanvasWidth = (orientation == 6 || orientation == 8) ? aspectHeight : aspectWidth,
                aspectCanvasHeight = (orientation == 6 || orientation == 8) ? aspectWidth : aspectHeight,
                aspectCanvas = document.createElement("canvas");

            aspectCanvas.width = aspectCanvasWidth;
            aspectCanvas.height = aspectCanvasHeight;

            var aspectContext = aspectCanvas.getContext("2d");

            if (!$.isNumber(orientation) || orientation == 1) {
                aspectContext.drawImage(image, 0, 0, aspectWidth, aspectHeight);
            }
            else {
                var radians = Math.PI / 180, rotation;
                switch (orientation) {
                    case 3: rotation = 180 * radians; break;
                    case 6: rotation = 90 * radians; break;
                    case 8: rotation = -90 * radians; break;
                    default: rotation = 0;
                }
                aspectContext.translate(aspectCanvasWidth / 2, aspectCanvasHeight / 2);
                aspectContext.rotate(rotation);
                aspectContext.drawImage(image, -aspectCanvasHeight / 2, -aspectCanvasWidth / 2, aspectWidth, aspectHeight);
            }

            var dataUrl = aspectCanvas.toDataURL(mimeType, 1.0),
                blob = $.blob.parseDataUrl(dataUrl);

            func.call(scope, blob);
        };
        image.crossorigin="anonymous";
        image.src = src;
    },
    dataUrlFromFile: function(file, func, scp, options) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $.image.dataUrlFromSrc(e.target.result, function(blob) {
                blob.lastModified = file.lastModified;
                blob.lastModifiedDate = file.lastModifiedDate;
                blob.name = file.name;
                func.call(scp, blob);
            }, this, options);
        };
        reader.readAsDataURL(file);
    },
    blobFromFile: function (file, func, scp, options) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $.image.blobFromSrc(e.target.result, function(blob) {
                blob.lastModified = file.lastModified;
                blob.lastModifiedDate = file.lastModifiedDate;
                blob.name = file.name;
                func.call(scp, blob);
            }, this, options);
        };
        reader.readAsDataURL(file);
    }
};