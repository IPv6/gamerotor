// Cross-browser logger, http://benalman.com/projects/javascript-debug-console-log/
window.debug=(function(){var i=this,b=Array.prototype.slice,d=i.console,h={},f,g,m=9,c=["error","warn","info","debug","log"],l="assert clear count dir dirxml exception group groupCollapsed groupEnd profile profileEnd table time timeEnd trace".split(" "),j=l.length,a=[];while(--j>=0){(function(n){h[n]=function(){m!==0&&d&&d[n]&&d[n].apply(d,arguments)}})(l[j])}j=c.length;while(--j>=0){(function(n,o){h[o]=function(){var q=b.call(arguments),p=[o].concat(q);a.push(p);e(p);if(!d||!k(n)){return}d.firebug?d[o].apply(i,q):d[o]?d[o](q):d.log(q)}})(j,c[j])}function e(n){if(f&&(g||!d||!d.log)){f.apply(i,n)}}h.setLevel=function(n){m=typeof n==="number"?n:9};function k(n){return m>0?m>n:c.length+m<=n}h.setCallback=function(){var o=b.call(arguments),n=a.length,p=n;f=o.shift()||null;g=typeof o[0]==="boolean"?o.shift():false;p-=typeof o[0]==="number"?o.shift():n;while(p<n){e(a[p++])}};return h})();
function core_dump_obj(obj,indent){if(!indent){indent = "";};var str = "";var type = typeof( obj );if (obj instanceof Array){str = indent + "(Array)\n";for (var i = 0; i < obj.length; i++){str += indent + "[ " + i + " ]  ->  " + core_dump_obj( obj[ i ], indent + " " );};str += "\n";}else if (type == "object"){str = indent + "(Object)\n";for (var i in obj ){str += indent + i + ":  ->  " + core_dump_obj( obj[ i ], indent + " " );};str += "\n";}else if (type == "function"){str = "";}else{str += obj;str += "\n";}return str;};
function core_log(msg,obj){if(obj){if($ && $.toJSON){msg=msg+"\nDump="+$.toJSON(obj);}else{msg=msg+"\nCoreDump="+core_dump_obj(obj);}};debug.log(msg);};//core_dump_obj
function core_log_stacktrace(msg){try{throw new Error("core_log_stacktrace")}catch(e) {console.log(msg);console.log(e.stack);}};

function core_load_css(filename){var fileref=document.createElement("link");fileref.setAttribute("rel", "stylesheet");fileref.setAttribute("type", "text/css"); fileref.setAttribute("href", filename);document.getElementsByTagName("head")[0].appendChild(fileref)};

// Core functions
function core_coalesce(obj,def)
{
	// && !isNaN(obj)
	if(typeof(obj)!="undefined" && obj != null){
		// Type coalescing
		if(typeof(def)=="string"){
			obj = ""+obj;
		}
		if(typeof(def)=="number"){
			obj = Number(obj);
		}
		return obj;
	};
	if(typeof(def) != "undefined"){
		return def;
	};
	return null;
};
function core_len(obj){
	if(typeof(obj)=="undefined" || obj == null){
		return 0;
	}
	if(typeof(obj)=="string"){
		return obj.length;
	}
	if(typeof(obj)=="object" && obj.length){
		return obj.length;
	}
	return 0;
}
function core_str_replace(what, search, replace) {
	if(core_coalesce(what) == null || core_coalesce(search) == null){
		return "";
	}
	replace = core_coalesce(replace,"");
	return what.split(search).join(replace);
}
function core_clone_to(o_from,o_to){
	if(core_coalesce(o_from) == null || core_coalesce(o_to) == null){
		return;
	}
	for (var i in o_from ){
		if(typeof(i)!="number"){
			if(core_len(i)<1){
				continue;
			}
		}
		o_to[i]=o_from[i];
	};
};
function core_obj2flash(obj)
{
	// IE7+swfobject killing "" ''
	reply_json = $.toJSON(obj);
	reply_json = encodeURIComponent(reply_json);
	reply_json = core_str_replace(reply_json,'\'','%27');
	return reply_json;
};
var forms_cnt = 0;
function core_navigate_url_via_form(url,paramsArray,submit_method,target_name)
{
	forms_cnt = forms_cnt+1;
	var forma = $('<form/>').attr({'action': url, 'method': submit_method, 'id': 'id_navigate_url_via_post'+forms_cnt, 'target': target_name});
	if (paramsArray){
		for (param in paramsArray){
			forma.append($('<input/>').attr({'type': 'hidden', 'name': param, 'value': paramsArray[param]}));
		}
	}
	$('body').append(forma).find('#id_navigate_url_via_post'+forms_cnt).submit();
}

function core_bdate2age(bdate,format)
{
	// f1: dd.mm.yyyy -> age
	// f2: 1981-04-23 -> age
    if(bdate == null || bdate.length == 0){
        return 0;
    }
    var parts = [];
	if(format == 2){
		parts = bdate.split("-");
		parts[0] = core_coalesce(parts[0],0);
		parts[1] = core_coalesce(parts[1],0);
		parts[2] = core_coalesce(parts[2],0);
		var tmp = parts[0];
		parts[0] = parts[2];
		parts[2] = tmp;
	}else{
		parts = bdate.split(".");
	}
    //console.log(parts);
    if(parts.length < 3){
        return 0;
    }
    parts[0] = parseInt(parts[0]);
    parts[1] = parseInt(parts[1]);
    parts[2] = parseInt(parts[2]);
    if(parts[2]<1900){
        parts[2] = parts[2]+1900;
    }
    var parts_as_date = new Date(parts[2],parts[1],parts[0]);
    var diff_ms = (new Date()).getTime()-parts_as_date.getTime();
    if(diff_ms<=0){
        return 0;
    }
    return parseInt(diff_ms/1000/(60*60*24*365));
}

function core_urlstring2map(str)
{
	if(core_len(str) == 0 || $ == null || $.url == null){
		return  {};
	}
	return $.url("http://fake/?"+str).param();
}

function core_getinstring(s, prefix, suffix) {
	var i = 0;
	if(prefix){
		i = s.indexOf(prefix);
		if (i >= 0) {
			s = s.substring(i + prefix.length);
		}
		else {
			return '';
		}
	}
	if (suffix) {
		i = s.indexOf(suffix);
		if (i >= 0) {
			s = s.substring(0, i);
		}
		else {
			return '';
		}
	}
	return s;
}

function core_SimulateEvent(element, eventName)
{
	if(element == null){
		return -2;
	}
	var eventMatchers = {
		'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
		'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
	}
	var defaultOptions = {
		pointerX: 0,
		pointerY: 0,
		button: 0,
		ctrlKey: false,
		altKey: false,
		shiftKey: false,
		metaKey: false,
		bubbles: true,
		cancelable: true
	}
	var options = core_extend(defaultOptions, arguments[2] || {});
	var oEvent, eventType = null;
	for (var name in eventMatchers)
	{
		if (eventMatchers[name].test(eventName)) { eventType = name; break; }
	}

	if (!eventType){
		//throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
		return -1;
	}
	//if (eventType == "click" && element.click) {
	//	element.click();
	//	return 1;
	//}else 
	if (document.createEvent)
	{
		oEvent = document.createEvent(eventType);
		if (eventType == 'HTMLEvents')
		{
			oEvent.initEvent(eventName, options.bubbles, options.cancelable);
		}
		else
		{
			oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
				options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
				options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
		}
		element.dispatchEvent(oEvent);
		return 2;
	}
	else if(document.createEventObject)
	{
		options.clientX = options.pointerX;
		options.clientY = options.pointerY;
		var evt = document.createEventObject();
		oEvent = core_extend(evt, options);
		element.fireEvent('on' + eventName, oEvent);
		return 3;
	}
	return 0;
}

function core_extend(destination, source) {
	for (var property in source)
	  destination[property] = source[property];
	return destination;
}

function core_padstring(val,len) {
	val = String(val);
	while (val.length < len) val = "0" + val;
	return val;
}

function core_trim(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}
