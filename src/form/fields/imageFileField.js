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

                    image.src = e.target.result;
                    sourceContext.drawImage(image, 0, 0);

                    var maxRect = $.rectangle($.point.zero(), maxDims),
                        imageRect = $.rectangle($.point.zero(), $.point(image.width, image.height)),
                        aspectDims = imageRect.aspectToFit(maxRect).dims(),
                        aspectWidth = aspectDims.x(),
                        aspectHeight = aspectDims.y(),
                        aspectCanvas = document.createElement("canvas");

                    aspectCanvas.width = aspectWidth;
                    aspectCanvas.height = aspectHeight;

                    var aspectContext = aspectCanvas.getContext("2d");
                    aspectContext.drawImage(image, 0, 0, aspectWidth, aspectHeight);

                    var dataUrl = aspectCanvas.toDataURL("image/png"),
                        blob = dataUriToBlob(dataUrl);

                    blob.lastModified = file.lastModified;
                    blob.lastModifiedDate = file.lastModifiedDate;
                    blob.name = file.name;

                    resizedFiles.add(blob);
                    if(fileCount < 1) callback();
                };
                reader.readAsDataURL(file);
            });
        };
    }


};
$.Class.extend(imageFileField, field);
$.imageFileField = function(selector){ return new imageFileField(selector); };
$.imageFileField.Class = imageFileField;

function dataUriToBlob(dataUri) {
    //NOTE: Convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataUri.split(',')[0].indexOf('base64') >= 0)
        byteString = $.str.decodeBase64(dataUri.split(',')[1]);
    else
        byteString = decodeURIComponent(dataUri.split(',')[1]);

    //Note: Separate out the mime component
    var mimeString = dataUri.split(',')[0].split(':')[1].split(';')[0];

    //NOTE: Write the bytes of the string to a typed array
    var unitArray = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        unitArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([unitArray], {type:mimeString});
}