$.image = {
    binaryFileFromSrc: function() {

    },
    blobFromSrc: function (src, onLoad, scp, options) {

        var scope = (!$.exists(scp) || $.isObjectLiteral(scp)) ? this : scp,
            opts = ($.isObjectLiteral(scp)) ? scp : ($.exists(options)) ? options : { },
            mimeType = opts.mimeType || "image/jpeg",
            image = document.createElement("img"),
            sourceCanvas = document.createElement("canvas"),
            sourceContext = sourceCanvas.getContext("2d");

        image.onload = function () {

            sourceContext.drawImage(image, 0, 0);

            var sourceDataUrl = sourceCanvas.toDataURL(mimeType, 1.0),
                exif = $.exif().readExifDataInDataUrl(sourceDataUrl),
                orientation = exif.Orientation,
                imageWidth = ($.exists(image.naturalWidth)) ? image.naturalWidth : image.width,
                imageHeight = ($.exists(image.naturalHeight)) ? image.naturalHeight : image.height,
                imageRect = $.rectangle($.point.zero(), $.point(imageWidth, imageHeight)),
                maxDims = opts.maxDims || {x:imageWidth, y:imageHeight},
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

            onLoad.call(scope, blob);
        };
        image.crossorigin="anonymous";
        image.src = src;
    }
};