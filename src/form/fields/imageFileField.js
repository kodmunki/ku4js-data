function imageFileField(selector) {
    imageFileField.base.call(this, selector);
}

imageFileField.prototype = {
    maxDims: function(value) { return this.property("maxDims", $.point.parse(value)); },
    $readFiles: function(func, scp) {
        var files = $.list(this.files()),
            maxDims = this._maxDims,
            resizedFiles = $.list(),
            fileCount = this.fileCount(),
            scope = scp || this;

        if(!$.exists(maxDims) || files.isEmpty()) func.call(scope, this.files());
        else
        {
            function callback() { func.call(scope, resizedFiles.toArray()); }

            files.each(function (file) {

                var image = document.createElement("img"),
                    sourceCanvas = document.createElement("canvas"),
                    sourceContext = sourceCanvas.getContext("2d"),
                    reader = new FileReader();

                reader.onload = function (e) {
                    fileCount --;


                    //NEED to pull this so that you can use it for ajax functions in the browser plugin
                    image.src = e.target.result;
                    image.onload = function() {

                        sourceContext.drawImage(image, 0, 0);

                        var exif = $.exif().readExifDataInImageResult(e.target.result),
                            orientation = exif.Orientation,
                            maxRect = $.rectangle($.point.zero(), maxDims),
                            imageWidth = ($.exists(image.naturalWidth)) ? image.naturalWidth : image.width,
                            imageHeight = ($.exists(image.naturalHeight)) ? image.naturalHeight : image.height,
                            imageRect = $.rectangle($.point.zero(), $.point(imageWidth, imageHeight)),
                            aspectDims = imageRect.aspectToFit(maxRect).dims(),
                            aspectWidth = aspectDims.x(),
                            aspectHeight = aspectDims.y(),
                            aspectCanvasWidth = (orientation == 6 || orientation == 8) ? aspectHeight : aspectWidth,
                            aspectCanvasHeight = (orientation == 6 || orientation == 8) ? aspectWidth : aspectHeight,
                            aspectCanvas = document.createElement("canvas");

                        aspectCanvas.width = aspectCanvasWidth;
                        aspectCanvas.height = aspectCanvasHeight;

                        var aspectContext = aspectCanvas.getContext("2d");

                        if(!$.isNumber(orientation) || orientation == 1) {
                            aspectContext.drawImage(image, 0, 0, aspectWidth, aspectHeight);
                        }
                        else {
                            var radians = Math.PI/180, rotation;

                            switch (orientation) {
                                case 3: rotation = 180 * radians; break;
                                case 6: rotation = 90 * radians; break;
                                case 8: rotation = -90 * radians; break;
                                default: rotation = 0;
                            }
                            aspectContext.translate(aspectCanvasWidth/2, aspectCanvasHeight/2);
                            aspectContext.rotate(rotation);
                            aspectContext.drawImage(image, -aspectCanvasHeight/2, -aspectCanvasWidth/2, aspectWidth, aspectHeight);
                        }

                        var dataUrl = aspectCanvas.toDataURL("image/jpeg", 1.0),
                            blob = $.blob.parseDataUrl(dataUrl);

                        blob.lastModified = file.lastModified;
                        blob.lastModifiedDate = file.lastModifiedDate;
                        blob.name = file.name;

                        resizedFiles.add(blob);
                        if (fileCount < 1) callback();
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    }
};
$.Class.extend(imageFileField, field);
$.imageFileField = function(selector){ return new imageFileField(selector); };
$.imageFileField.Class = imageFileField;