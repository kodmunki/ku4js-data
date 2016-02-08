function imageFileField(selector) {
    imageFileField.base.call(this, selector);
}

imageFileField.prototype = {
    maxDims: function(value) { return this.property("maxDims", $.point.parse(value)); },
    $write: function(){ },
    $readFiles: function(func, scp) {
        var files = $.list(this.files()),
            maxDims = this._maxDims,
            resizedFiles = $.list(),
            fileCount = this.fileCount(),
            scope = scp || this;

        if(!$.exists(maxDims) || files.isEmpty()) func.call(scope, this.files());
        else files.each(function (file) {
            fileCount--;
            $.image.blobFromFile(file, function(blob) {
                resizedFiles.add(blob);
                if (fileCount < 1) func.call(scope, resizedFiles.toArray());
            }, this, { maxDims: maxDims });
        });

    }
};
$.Class.extend(imageFileField, field);
$.imageFileField = function(selector){ return new imageFileField(selector); };
$.imageFileField.Class = imageFileField;