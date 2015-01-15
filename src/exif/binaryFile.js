function binaryFile(data) {
    this._data = data;
}
binaryFile.prototype = {
    getByteAt: function(index) { return this._data.charCodeAt(index); },
    getLength: function() { return this._data.length; },
    getStringAt: function(a, b) { return this._data.substring(a, a + b); },
    getShortAt: function(offset, isBigEndian) {
        var data = this._data,
            intShort = isBigEndian
                ? (data.charCodeAt(offset) << 8) + data.charCodeAt(offset + 1)
                : (data.charCodeAt(offset + 1) << 8) + data.charCodeAt(offset);

        return (intShort < 0) ? intShort + 65536 : intShort;
    },
    getLongAt: function(offset, isBigEndian) {
        var data = this._data,
            byte1 = data.charCodeAt(offset),
            byte2 = data.charCodeAt(offset + 1),
            byte3 = data.charCodeAt(offset + 2),
            byte4 = data.charCodeAt(offset + 3),
            intLong = isBigEndian
                ? (((((byte1 << 8) + byte2) << 8) + byte3) << 8) + byte4
                : (((((byte4 << 8) + byte3) << 8) + byte2) << 8) + byte1;

        return (intLong < 0) ? intLong + 4294967296 : intLong;
    },
    getSLongAt: function(offset, isBigEndian) {
        var uintLong = this.getLongAt(offset, isBigEndian);
        return (uintLong > 2147483647) ? uintLong - 4294967296 : uintLong;
    }
};

binaryFile.parseImageResult = function(result) {
    var base64Data = result.replace(/data:image\/.*;base64,/, ""),
        data = $.str.decodeBase64(base64Data);

    return new binaryFile(data);
};