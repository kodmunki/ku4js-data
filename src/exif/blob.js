$.blob = {
    create: function(binaryArray, mimeType) {
        try{
          return new Blob([binaryArray], { type: mimeType });
        }
        catch(e){
            var blobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder,
                isTypeError = e.name == "TypeError",
                isInvalidState = e.name == "InvalidStateError";

            if(isTypeError && $.exists(blobBuilder)){
                var builder = new blobBuilder();
                builder.append(binaryArray.buffer);
                return builder.getBlob(mimeType);
            }

            return (isInvalidState)
                ? new Blob([binaryArray.buffer], {type : mimeType})
                : null;
        }
    },
    parseDataUri: function(dataUri) {
        var dataArray = dataUri.split(','),
            byteString = (dataArray[0].indexOf('base64') >= 0)
                ? $.str.decodeBase64(dataArray[1])
                : decodeURIComponent(dataArray[1]),

            dataLength = byteString.length,
            mimeString = dataArray[0].split(':')[1].split(';')[0],
            unitArray = new Uint8Array(dataLength);

        for (var i = 0; i < dataLength; i++)
            unitArray[i] = byteString.charCodeAt(i);

        return $.blob.create(unitArray, mimeString);
    }
};