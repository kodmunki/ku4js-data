function binaryFile(byteString) {
    this._byteString = byteString || "";
}
binaryFile.prototype = {
    getByteAt: function(index) { return this._byteString.charCodeAt(index); },
    getLength: function() { return this._byteString.length; },
    getStringAt: function(a, b) { return this._byteString.substring(a, a + b); },
    getShortAt: function(offset, isBigEndian) {
        var byteString = this._byteString,
            intShort = isBigEndian
                ? (byteString.charCodeAt(offset) << 8) + byteString.charCodeAt(offset + 1)
                : (byteString.charCodeAt(offset + 1) << 8) + byteString.charCodeAt(offset);

        return (intShort < 0) ? intShort + 65536 : intShort;
    },
    getLongAt: function(offset, isBigEndian) {
        var byteString = this._byteString,
            byte1 = byteString.charCodeAt(offset),
            byte2 = byteString.charCodeAt(offset + 1),
            byte3 = byteString.charCodeAt(offset + 2),
            byte4 = byteString.charCodeAt(offset + 3),
            intLong = isBigEndian
                ? (((((byte1 << 8) + byte2) << 8) + byte3) << 8) + byte4
                : (((((byte4 << 8) + byte3) << 8) + byte2) << 8) + byte1;

        return (intLong < 0) ? intLong + 4294967296 : intLong;
    },
    getSLongAt: function(offset, isBigEndian) {
        var uintLong = this.getLongAt(offset, isBigEndian);
        return (uintLong > 2147483647) ? uintLong - 4294967296 : uintLong;
    },
    toBlob: function(contentType) {
        var _contentType = contentType || '',
            byteString = this._byteString,
            sliceSize = 512,
            byteArrays = [];

        for (var offset = 0; offset < byteString.length; offset += sliceSize) {
            var slice = byteString.slice(offset, offset + sliceSize),
                slices = new Array(slice.length);
                
            for (var i = 0; i < slice.length; i++)
                slices[i] = slice.charCodeAt(i);

            var byteArray = new Uint8Array(slices);
            byteArrays.push(byteArray);
        }
       return new Blob(byteArrays, {type: _contentType});
    }
};

binaryFile.parseDataUrl = function(byteStringUrl) {
    var base64Data = byteStringUrl.replace(/byteString:image\/.*;base64,/, ""),
        byteString = $.str.decodeBase64(base64Data);

    return new binaryFile(byteString);
};

$.binaryFile = function(byteString) { return new binaryFile(byteString); };