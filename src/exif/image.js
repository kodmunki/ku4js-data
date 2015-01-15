function image(imageResult) {
    this._imageResult = imageResult;
}
image.prototype = {
    toBinaryFile: function() {
        return binaryFile.parseImageResult(this._imageResult);
    }
};