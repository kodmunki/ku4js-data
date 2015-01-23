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
                fileCount --;

                var reader = new FileReader();

                reader.onload = function(e) {
                    $.image.blobFromSrc(e.target.result, function(blob) {
                        blob.lastModified = file.lastModified;
                        blob.lastModifiedDate = file.lastModifiedDate;
                        blob.name = file.name;

                        resizedFiles.add(blob);
                        if (fileCount < 1) callback();
                    }, {
                        maxDims: maxDims
                    });
                };
                reader.readAsDataURL(file);
            });
        }
    }
};
$.Class.extend(imageFileField, field);
$.imageFileField = function(selector){ return new imageFileField(selector); };
$.imageFileField.Class = imageFileField;