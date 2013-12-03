(function(l){$=l;function service(){service.base.call(this);this._processId=$.uid("svc");this._onSuccess=$.observer();this._onError=$.observer();this._onComplete=$.observer();this._lock=$.lock();this._isLocal=false;this.GET().text().xhr().async().unlock()}service.prototype={processId:function(){return this.get("processId")},verb:function(verb){return this.property("verb",verb)},callType:function(callType){return this.property("callType",callType)},responseType:function(responseType){return this.property("responseType",responseType)},uri:function(uri){return this.property("uri",uri)},contentType:function(contentType){return this.property("contentType",contentType)},maxAttempts:function(maxAttempts){return this.property("maxAttempts",maxAttempts)},isLocal:function(isLocal){return this.property("isLocal",isLocal)},strategy:function(strategy){if($.exists(strategy)){strategy.context(this)}return this.property("strategy",strategy)},isAsync:function(){return/ASYNC/i.test(this.callType())},isPost:function(){return/POST/i.test(this.verb())},isLocked:function(){return this._lock.isLocked()},isBusy:function(){return this._isBusy},onSuccess:function(f,s,id){this._onSuccess.add(f,s,id);return this},onError:function(f,s,id){this._onError.add(f,s,id);return this},onComplete:function(f,s,id){this._onComplete.add(f,s,id);return this},removeListener:function(id){this._onSuccess.add(id);this._onError.add(id);this._onComplete.add(id);return this},clearListeners:function(){this._onSuccess.clear();this._onError.clear();this._onComplete.clear();return this},OPTIONS:function(){return this.verb("OPTIONS")},GET:function(){return this.verb("GET")},HEAD:function(){return this.verb("HEAD")},POST:function(){return this.verb("POST")},PUT:function(){return this.verb("PUT")},DELETE:function(){return this.verb("DELETE")},TRACE:function(){return this.verb("TRACE")},CONNECT:function(){return this.verb("CONNECT")},xhr:function(){return this.strategy(new xhr())},xss:function(){return this.strategy(new xss())},sync:function(){return this.callType("sync")},async:function(){return this.callType("async")},text:function(){return this.responseType("responseText")},xml:function(){return this.responseType("responseXML")},success:function(response){this._onSuccess.notify(response,this._processId);return this},error:function(response){this._onError.notify(response,this._processId);return this},complete:function(response){this._onComplete.notify(response,this._processId);this._isBusy=false;return this},lock:function(){this._lock.lock();return this},unlock:function(){this._lock.unlock();return this},abort:function(){if(!this._isBusy){return this}this.strategy().abort();return this},call:function(params){if(this.isLocked()){return this}this._isBusy=true;this.strategy().call(params,this._readSettings());return this},_readSettings:function(){return{contentType:this._contentType}}};$.Class.extend(service,$.Class);$.service=function(){return new service()};$.service.noCache=function(dto){var noCache=$.dto({noCache:$.uid()});if(!$.exists(dto)){return noCache}return dto.merge(noCache)};function xhr(){xhr.base.call(this);this._isOk=function(status){return/[23]\d{2}/.test(status)||this.context().isLocal()};this._isAborted=function(status){return !/\d{3}/.test(status)};this._attempts=0}xhr.prototype={context:function(context){return this.property("context",context)},abort:function(){try{this._xhr.abort()}catch(e){}},call:function(params,settings){this._xhr=xhr_createXhr();var context=this.context(),isPost=context.isPost(),xhr=this._xhr,paramsExist=$.exists(params);format=(isPost||!paramsExist)?"{0}":"{0}?{1}",postParams=(isPost)?params:null,paramLength=(paramsExist)?params.length:0;me=this;if(!$.exists(xhr)){context.error(new Error("Ajax not supported"))}xhr.open(context.verb(),$.str.format(format,context.uri(),params),context.isAsync());if(isPost){var contentType=(!settings.contentType)?"application/x-www-form-urlencoded":settings.contentType;xhr.setRequestHeader("Content-type",contentType);xhr.setRequestHeader("Content-length",paramLength);xhr.setRequestHeader("Connection","close")}xhr.onreadystatechange=function(){if(xhr.readyState>3){var response=xhr[context.responseType()],status=xhr.status;if(me._isAborted(status)){return}if(me._isOk(status)){context.success(response).complete(response);return}if(me._attempts<context.maxAttempts()){me.call(params);return}context.error(response).complete(response)}};xhr.send(postParams)}};$.Class.extend(xhr,$.Class);function xhr_createXhr(){return($.exists(XMLHttpRequest))?new XMLHttpRequest():($.exists(window.ActiveXObject))?(function(){var v=["MSXML2.Http6.0","MSXML2.Http5.0","MSXML2.Http4.0","MSXML2.Http3.0","MSXML2.Http"];for(var n in v){try{return new ActiveXObject(v[n])}catch(e){}}return null})():null}function xss(){xss.base.call(this);this._head=document.documentElement.getElementsByTagName("head")[0]}xss.prototype={context:function(context){return this.property("context",context)},abort:function(){try{this._head.removeChild(this._script)}catch(e){}},call:function(params){var context=this.context(),head=document.documentElement.getElementsByTagName("head")[0],format="{0}?ku4jXssOnSuccess=kodmunki.{1}&ku4jXssOnError=kodmunki.{2}&ku4jXssOnComplete=kodmunki.{3}{4}",procId=context.processId(),success=procId+"_success",error=procId+"_error",complete=procId+"_complete",parameters=($.exists(params))?"&"+params:"",location=$.str.format(format,context.uri(),success,error,complete,parameters);this._script=$.create({script:{src:location,language:"javascript",type:"text/javascript"}});kodmunki[success]=function(){context.success.apply(context,arguments)};kodmunki[error]=function(){context.error.apply(context,arguments)};kodmunki[complete]=function(){context.complete.apply(context,arguments)};this._head.appendChild(this._script)}};$.Class.extend(xss,$.Class);function cookie(){cookie.base.call(this)}cookie.prototype={name:function(name){return this.property("name",name)},expires:function(expires){return this.property("expires",expires)},domain:function(domain){return this.property("domain",domain)},path:function(path){return this.property("path",path)},isSecure:function(isSecure){return this.property("isSecure",isSecure)},erase:function(){this.expires(new Date("1/1/2000"));this.save();return this},save:function(obj){document.cookie=$.cookie.serialize(obj,{name:this._name,expires:this._expires,path:this._path,domain:this._domain,isSecure:this._isSecure});return this}};$.Class.extend(cookie,$.Class);$.cookie=function(params){var p=params||{},o=($.isString(p))?cookie_defaultParams.replicate().merge({name:p}).toObject():cookie_defaultParams.replicate().merge(p).toObject();return(new cookie()).name(o.name).expires(o.expires).path(o.path).domain(o.domain).isSecure(o.isSecure)};$.cookie.erase=function(name){$.cookie.load(name).erase()};$.cookie.load=function(name){var o=($.isObject(name))?name:{name:name};p=cookie_defaultParams.replicate().merge(o).toObject();return $.cookie(p)};$.cookie.find=function(name){var c=document.cookie.split("; "),i=c.length;while(i--){var cke=c[i].split("=");if(cke[0]===name){return c[i]}}return null};$.cookie.serialize=function(obj,params){var pms=params||{},o=cookie_defaultParams.replicate().merge(pms).toObject(),n=o.name,e=o.expires,p=o.path,d=o.domain,s=o.isSecure,I=cookie_buildInfoPair(n,escape($.json.serialize(obj))),E=($.isDate(e))?cookie_buildInfoPair("; expires",e.toGMTString()):"",P=(!p)?"":cookie_buildInfoPair("; path",escape(p)),D=(!d)?"":cookie_buildInfoPair("; domain",escape(d)),S=(!s)?"":"; secure";return I+E+P+D+S};$.cookie.deserialize=function(cookie){try{var ck=(/;/.test(cookie))?cookie.substring(0,cookie.search(";")).split("="):cookie.split("="),kv={key:ck[0],value:ck[1]};return $.json.deserialize(unescape(kv.value))}catch(e){throw $.exception("arg",$.str.format("Cannot deserialize {0}",cookie))}};var cookie_defaultParams=$.hash({name:$.uid("COOKIE"),expires:$.dayPoint.today().nextYear().toDate(),path:"/",domain:null,isSecure:false});var cookie_buildInfoPair=function(k,v){return k+"="+v};function dto(obj){dto.base.call(this,obj)}dto.prototype={name:function(name){return this.set("name",name)},toJson:function(){return $.json.serialize(this.$h)},toQueryString:function(){return $.queryString.serialize(this.$h)},saveAs:function(name){if(!name){throw $.exception("arg","$.dto.saveAs requires a name")}$.cookie(name).save(this.$h);this._name=name;return this},save:function(){var name=this._name||$.uid("dto");this.saveAs(name);return name},erase:function(){var name=this._name;if($.exists(name)){$.cookie.erase(name)}return this},replicate:function(){return $.dto($.replicate(this.$h))}};$.Class.extend(dto,$.hash.Class);$.dto=function(obj){return new dto(obj)};$.dto.parseJson=function(str){return $.dto($.json.deserialize(str))};$.dto.parseQueryString=function(str){return $.dto($.queryString.deserialize(str))};$.dto.serialize=function(name){try{return new dto($.cookie.deserialize($.cookie.find(name))).name(name)}catch(e){return null}};if(!$.exists($.json)){$.json={}}$.json.serialize=function(obj){if($.isNull(obj)){return null}if($.isUndefined(obj)){return undefined}if(!$.isArray(obj)&&!$.isObject(obj)){return obj.toString()}var r=[],f=($.isArray(obj))?"[{0}]":"{{0}}";for(var n in obj){var o=obj[n];if($.isFunction(o)){continue}var v=($.isUndefined(o))?'"undefined"':($.isNumber(o))?o:($.isString(o))?'"'+json_serializeString(o)+'"':$.json.serialize(o);r[r.length]=(($.isObject(obj)&&!$.isArray(obj))?('"'+n+'":'):"")+v}return $.str.format(f,r)};$.json.deserialize=function(str){if($.isObject(str)){return str}if($.isString(str)){try{return eval("("+json_deserializeString(str)+")")}catch(e){return str}}return undefined};function json_serializeString(str){return str.replace(/\\/g,"\\\\").replace(/\"/g,'\\"').replace(/\//g,"/").replace(/\f/g,"\\f").replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\t/g,"\\t")}function json_deserializeString(str){return str.replace(/\\\//g,"/").replace(/\\\\f/g,"\\f").replace(/\\\\n/g,"\\n").replace(/\\\\r/g,"\\r").replace(/\\\\t/g,"\\t")}if(!$.exists($.queryString)){$.queryString={}}$.queryString.serialize=function(obj){var r="",e=encodeURIComponent;for(var n in obj){r+=$.str.format("&{0}={1}",e(n),e($.json.serialize(obj[n])))}return r.replace(/^\&/,"")};$.queryString.deserialize=function(str){var q=str.replace(/.*\?/,""),o={},kvs=q.split("&");if(!/\??\w+=\w+/.test(str)){return null}for(var n in kvs){var d=decodeURIComponent,kv=(kvs[n]).split("=");o[d(kv[0])]=$.json.deserialize(d(kv[1]))}return o};function abstractField(){abstractField.base.call(this);this._onIsValid=$.observer();this._onInvalid=$.observer();this.spec($.spec(function(){return true})).optional()}abstractField.prototype={$read:function(){return},$write:function(){return},$clear:function(){return},value:function(value){if(!$.exists(value)){return this.$read()}this.$write(value);return this},clear:function(){return this.$clear()},optional:function(){this._optionSpec=$.fields.specs.optional;this._operand="or";return this},required:function(){this._optionSpec=$.fields.specs.required;this._operand="and";return this},spec:function(spec){return this.property("spec",spec)},isValid:function(){var b=this._optionSpec[this._operand](this.spec()).isSatisfiedBy(this.value()),o=(b)?this._onIsValid:this._onInvalid;o.notify(this);return b},isEmpty:function(){return $.isEmpty(this.value())},onIsValid:function(f,s,id){this._onIsValid.add(f,s,id);return this},onInvalid:function(f,s,id){this._onInvalid.add(f,s,id);return this}};$.Class.extend(abstractField,$.Class);function field(selector){field.base.call(this);var query=$(selector);if(query.length>1){$.str.format("$.field requires unique node.")}if(!$.exists(query[0])){throw new Error($.str.format("$.field requires selector for a valid DOM node."))}this.dom(query[0]).spec($.spec(function(){return true})).optional()}field.prototype={$read:function(){return this.dom().value},$write:function(value){this.dom().value=value},$clear:function(){this.dom().value="";return this},dom:function(dom){return this.property("dom",dom)}};$.Class.extend(field,abstractField);$.field=function(selector){return new field(selector)};$.field.Class=field;function checkbox(dom){checkbox.base.call(this,dom)}checkbox.prototype={$read:function(){var d=this.dom();return(d.checked)?d.value:""},$write:function(value){var d=this.dom();d.checked=(d.value==value)},$clear:function(){this.uncheck();return this},check:function(){this.dom().checked=true;return this},uncheck:function(){this.dom().checked=false;return this}};$.Class.extend(checkbox,field);$.checkbox=function(dom){return new checkbox(dom)};$.checkbox.Class=checkbox;function radioset(){radioset.base.call(this);this._radios=$.list()}radioset.prototype={$read:function(){var rv=[];this._radios.each(function(r){if(r.checked){rv.push(r.value)}});return rv.toString()},$write:function(value){var v=($.isString(value))?value.split(","):value,vlist=$.list(v);this._radios.each(function(r){r.checked=vlist.contains(r.value)})},$clear:function(){this._radios.each(function(r){r.checked=false})},add:function(dom){this._radios.add(dom);return this},listNodes:function(){return this._radios}};$.Class.extend(radioset,abstractField);$.radioset=function(){return new radioset()};$.radioset.Class=radioset;function select(dom){select.base.call(this,dom);this._opts=function(){return $.list(this.dom().options)};if(this.dom().multiple){this.multiple()}else{this.single()}}select.prototype={$read:function(){var rv=[];this._opts().each(function(opt){if(opt.selected){rv.push(opt.value)}});return rv.toString()},$write:function(value){return(this._multiple)?select_writeMultiple(this,value):select_writeSingle(this,value)},multiple:function(){this._multiple=true;return this},single:function(){this._multiple=false;return this},addOptgroup:function(){this.dom().appendChild(document.createElement("optgroup"));return this},addOption:function(k,v,index,isOptGroup){var dom=this.dom(),option=document.createElement("option"),idx=index||null,opt=($.exists(idx))?dom.options[idx]:null;option.text=k;option.value=v;if(isOptGroup){dom.getElementsByTagName("optgroup")[index].appendChild(option)}else{try{dom.add(option,opt)}catch(ex){dom.add(option,idx)}}return this},removeOption:function(index){this.dom().remove(index);return this}};$.Class.extend(select,field);$.select=function(dom){return new select(dom)};$.select.Class=select;function select_writeSingle(select,value){select._opts().each(function(opt){opt.selected=(opt.value==value)});return select}function select_writeMultiple(select,value){var v=($.isString(value))?value.split(","):value,vlist=$.list(v);select._opts().each(function(opt){opt.selected=vlist.contains(opt.value)});return select}function form(){form.base.call(this);this._onSubmit=$.observer();this._fields=$.hash()}form.prototype={$submit:function(){return},name:function(name){return this.property("name",name)},fields:function(){return this._fields},listFields:function(){return this._fields.listValues()},findField:function(name){return this._fields.findValue(name)},isEmpty:function(){var v=true;$.list(this._fields.values()).each(function(f){if(!f.isEmpty()){v=false}});return v},isValid:function(){var v=true;$.list(this._fields.values()).each(function(f){if(!f.isValid()){v=false}});return v},submit:function(){var values=this.read();this._onSubmit.notify(this);this.$submit(values)},onSubmit:function(f,s,id){this._onSubmit.add(f,s,id);return this},add:function(n,f){this._fields.add(n,f);return this},remove:function(n){this._fields.remove(n);return this},clear:function(){this._fields.each(function(f){f.value.clear()});return this},read:function(){var dto=$.dto();this._fields.each(function(o){var k=o.key,v=o.value;if($.exists(v.read)){dto.merge(v.read())}if($.exists(v.value)){dto.add(k,v.value())}});return dto},write:function(dto){if(!$.exists(dto)){return this}this._fields.each(function(o){var field=o.value;if($.exists(field.write)){field.write(dto)}if($.exists(field.value)){field.value(dto.find(o.key))}});return this},saveAs:function(name){this.read().saveAs(name);this._name=name;return this},save:function(){var name=this._name||$.uid("form");this.saveAs(name);return name},erase:function(){var name=this._name;if($.exists(name)){$.dto.serialize(name).erase()}return this},load:function(name){if($.isString(name)){this._name=name}var n=this._name;return($.exists(n))?this.write($.dto.serialize(n)):this}};$.Class.extend(form,$.Class);$.form=function(){return new form()};$.form.Class=form;$.fields={specs:(function(){var value={};try{value.required=$.spec(function(v){return(!$.isNullOrEmpty(v))&&/^.+$/.test(v)}),value.optional=$.spec(function(v){return $.isNullOrEmpty(v)}),value.currency=$.spec(function(v){return/^[\w\$]?(\d+|(\d{1,3}(,\d{3})*))(\.\d{2})?$/.test(v)});value.date=$.spec(function(v){return/^\d{1,2}\/\d{1,2}\/(\d{2}|\d{4})$/.test(v)});value.alpha=$.spec(function(v){return/^[A-Za-z]+$/.test(v)});value.numeric=$.spec(function(v){return/^\d+$/.test(v)});value.alphaNumeric=$.spec(function(v){return/^[A-Za-z\d]+$/.test(v)});value.phone=$.spec(function(v){return/^\d{10,11}|(((1\s)?\(\d{3}\)\s?)|((1\-)?\d{3}\-))\d{3}\-\d{4}$/.test(v)});value.ssn=$.spec(function(v){return/^(\d{9}|(\d{3}\-\d{2}\-\d{4}))$/.test(v)});value.email=$.spec(function(v){return/^\w+(\.\w+)?@\w+(\.\w+)?\.[A-Za-z0-9]{2,}$/.test(v)})}catch(e){}finally{return value}})()}})(jQuery);