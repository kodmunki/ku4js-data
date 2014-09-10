var multipartBoundary = "----------V2ymHFg03ehbqgZCaKO6jy",
    multipartBoundaryFormat =  "\r\n--{0}\r\n",
    multipartClosingBoundaryFormat = "\r\n--{0}--\r\n",
    formDataTemplate = "Content-Disposition: form-data; name=\"{0}\"\r\n\r\n{1}",
    fileDataTemplate = "Content-Disposition: form-data; name=\"{0}\"; filename=\"{1}\"\r\nContent-Type: {2}\r\n\r\n{3}",
    ecodedDataTemplate = "Content-Disposition: form-data; name=\"{0}\"; filename=\"{1}\"\r\nContent-Type: {2}\r\nContent-Transfer-Encoding: {3}\r\n\r\n{4}";

function multipartForm() {
    this._data = "";
}

multipartForm.prototype = {
    boundary: function() { return multipartBoundary; },
    addData: function(name, data) {
        return this._addData($.str.format(formDataTemplate, name, data));
    },
    addTextFile: function(name, fileName, contentType, data) {
        return this._addData($.str.format(fileDataTemplate, name, fileName, contentType, data));
    },
    addImageFile: function(name, fileName, contentType, data) {
        return this._addData($.str.format(ecodedDataTemplate, name, fileName, contentType, data, "binary"));
    },
    _addData: function(data) {
        this._data += $.str.build($.str.format(multipartBoundaryFormat, this.boundary()), data);
        return this;
    },
    read: function() {
        return $.str.build(this._data, $.str.format(multipartClosingBoundaryFormat, this.boundary()));
    }
};

$.multipartForm = function() { return new multipartForm(); };