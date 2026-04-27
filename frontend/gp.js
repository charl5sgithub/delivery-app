(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.GlobalPayments = factory());
}(this, (function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, basedir, module) {
		return module = {
			path: basedir,
			exports: {},
			require: function (path, base) {
				return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
			}
		}, fn(module, module.exports), module.exports;
	}

	function getAugmentedNamespace(n) {
		if (n.__esModule) return n;
		var a = Object.defineProperty({}, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	self.fetch||(self.fetch=function(e,n){return n=n||{},new Promise(function(t,s){var r=new XMLHttpRequest,o=[],u=[],i={},a=function(){return {ok:2==(r.status/100|0),statusText:r.statusText,status:r.status,url:r.responseURL,text:function(){return Promise.resolve(r.responseText)},json:function(){return Promise.resolve(r.responseText).then(JSON.parse)},blob:function(){return Promise.resolve(new Blob([r.response]))},clone:a,headers:{keys:function(){return o},entries:function(){return u},get:function(e){return i[e.toLowerCase()]},has:function(e){return e.toLowerCase()in i}}}};for(var c in r.open(n.method||"get",e,!0),r.onload=function(){r.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,function(e,n,t){o.push(n=n.toLowerCase()),u.push([n,t]),i[n]=i[n]?i[n]+","+t:t;}),t(a());},r.onerror=s,r.withCredentials="include"==n.credentials,n.headers)r.setRequestHeader(c,n.headers[c]);r.send(n.body||null);})});

	if (!Array.prototype.forEach) {
	    Array.prototype.forEach = function (fn) {
	        for (var i = 0; i < this.length; i++) {
	            fn(this[i], i, this);
	        }
	    };
	}

	var byteLength_1 = byteLength;
	var toByteArray_1 = toByteArray;
	var fromByteArray_1 = fromByteArray;

	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

	var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	for (var i = 0, len = code.length; i < len; ++i) {
	  lookup[i] = code[i];
	  revLookup[code.charCodeAt(i)] = i;
	}

	// Support decoding URL-safe base64 strings, as Node.js does.
	// See: https://en.wikipedia.org/wiki/Base64#URL_applications
	revLookup['-'.charCodeAt(0)] = 62;
	revLookup['_'.charCodeAt(0)] = 63;

	function getLens (b64) {
	  var len = b64.length;

	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }

	  // Trim off extra bytes after placeholder bytes are found
	  // See: https://github.com/beatgammit/base64-js/issues/42
	  var validLen = b64.indexOf('=');
	  if (validLen === -1) validLen = len;

	  var placeHoldersLen = validLen === len
	    ? 0
	    : 4 - (validLen % 4);

	  return [validLen, placeHoldersLen]
	}

	// base64 is 4/3 + up to two characters of the original data
	function byteLength (b64) {
	  var lens = getLens(b64);
	  var validLen = lens[0];
	  var placeHoldersLen = lens[1];
	  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
	}

	function _byteLength (b64, validLen, placeHoldersLen) {
	  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
	}

	function toByteArray (b64) {
	  var tmp;
	  var lens = getLens(b64);
	  var validLen = lens[0];
	  var placeHoldersLen = lens[1];

	  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));

	  var curByte = 0;

	  // if there are placeholders, only get up to the last complete 4 chars
	  var len = placeHoldersLen > 0
	    ? validLen - 4
	    : validLen;

	  var i;
	  for (i = 0; i < len; i += 4) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 18) |
	      (revLookup[b64.charCodeAt(i + 1)] << 12) |
	      (revLookup[b64.charCodeAt(i + 2)] << 6) |
	      revLookup[b64.charCodeAt(i + 3)];
	    arr[curByte++] = (tmp >> 16) & 0xFF;
	    arr[curByte++] = (tmp >> 8) & 0xFF;
	    arr[curByte++] = tmp & 0xFF;
	  }

	  if (placeHoldersLen === 2) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 2) |
	      (revLookup[b64.charCodeAt(i + 1)] >> 4);
	    arr[curByte++] = tmp & 0xFF;
	  }

	  if (placeHoldersLen === 1) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 10) |
	      (revLookup[b64.charCodeAt(i + 1)] << 4) |
	      (revLookup[b64.charCodeAt(i + 2)] >> 2);
	    arr[curByte++] = (tmp >> 8) & 0xFF;
	    arr[curByte++] = tmp & 0xFF;
	  }

	  return arr
	}

	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] +
	    lookup[num >> 12 & 0x3F] +
	    lookup[num >> 6 & 0x3F] +
	    lookup[num & 0x3F]
	}

	function encodeChunk (uint8, start, end) {
	  var tmp;
	  var output = [];
	  for (var i = start; i < end; i += 3) {
	    tmp =
	      ((uint8[i] << 16) & 0xFF0000) +
	      ((uint8[i + 1] << 8) & 0xFF00) +
	      (uint8[i + 2] & 0xFF);
	    output.push(tripletToBase64(tmp));
	  }
	  return output.join('')
	}

	function fromByteArray (uint8) {
	  var tmp;
	  var len = uint8.length;
	  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
	  var parts = [];
	  var maxChunkLength = 16383; // must be multiple of 3

	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
	  }

	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1];
	    parts.push(
	      lookup[tmp >> 2] +
	      lookup[(tmp << 4) & 0x3F] +
	      '=='
	    );
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
	    parts.push(
	      lookup[tmp >> 10] +
	      lookup[(tmp >> 4) & 0x3F] +
	      lookup[(tmp << 2) & 0x3F] +
	      '='
	    );
	  }

	  return parts.join('')
	}

	var base64Js = {
		byteLength: byteLength_1,
		toByteArray: toByteArray_1,
		fromByteArray: fromByteArray_1
	};

	var base64 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.base64decode = exports.base64encode = void 0;

	function base64encode(text) {
	    var i;
	    var len = text.length;
	    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
	    var u8array = new Arr(len);
	    for (i = 0; i < len; i++) {
	        u8array[i] = text.charCodeAt(i);
	    }
	    return base64Js.fromByteArray(u8array);
	}
	exports.base64encode = base64encode;
	function base64decode(text) {
	    var u8Array = base64Js.toByteArray(text);
	    var i;
	    var len = u8Array.length;
	    var bStr = "";
	    for (i = 0; i < len; i++) {
	        bStr += String.fromCharCode(u8Array[i]);
	    }
	    return bStr;
	}
	exports.base64decode = base64decode;
	window.btoa = window.btoa || base64encode;
	window.atob = window.atob || base64decode;

	});

	var json2 = createCommonjsModule(function (module, exports) {
	/* -----------------------------------------------------------------------------
	This file is based on or incorporates material from the projects listed below
	(collectively, "Third Party Code"). Microsoft is not the original author of the
	Third Party Code. The original copyright notice and the license, under which
	Microsoft received such Third Party Code, are set forth below. Such licenses
	and notices are provided for informational purposes only. Microsoft, not the
	third party, licenses the Third Party Code to you under the terms of the
	Apache License, Version 2.0. See License.txt in the project root for complete
	license information. Microsoft reserves all rights not expressly granted under
	the Apache 2.0 License, whether by implication, estoppel or otherwise.
	----------------------------------------------------------------------------- */
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.JSON = void 0;
	/*
	    json2.js
	    2011-10-19

	    Public Domain.

	    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

	    See http://www.JSON.org/js.html

	    This code should be minified before deployment.
	    See http://javascript.crockford.com/jsmin.html

	    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
	    NOT CONTROL.

	    This file creates a global JSON object containing two methods: stringify
	    and parse.

	        JSON.stringify(value, replacer, space)
	            value       any JavaScript value, usually an object or array.

	            replacer    an optional parameter that determines how object
	                        values are stringified for objects. It can be a
	                        function or an array of strings.

	            space       an optional parameter that specifies the indentation
	                        of nested structures. If it is omitted, the text will
	                        be packed without extra whitespace. If it is a number,
	                        it will specify the number of spaces to indent at each
	                        level. If it is a string (such as "\t" or "&nbsp;"),
	                        it contains the characters used to indent at each level.

	            This method produces a JSON text from a JavaScript value.

	            When an object value is found, if the object contains a toJSON
	            method, its toJSON method will be called and the result will be
	            stringified. A toJSON method does not serialize: it returns the
	            value represented by the name/value pair that should be serialized,
	            or undefined if nothing should be serialized. The toJSON method
	            will be passed the key associated with the value, and this will be
	            bound to the value

	            For example, this would serialize Dates as ISO strings.

	                Date.prototype.toJSON = function (key) {
	                    function f(n) {
	                        // Format integers to have at least two digits.
	                        return n < 10 ? "0" + n : n;
	                    }

	                    return this.getUTCFullYear()   + "-" +
	                         f(this.getUTCMonth() + 1) + "-" +
	                         f(this.getUTCDate())      + "T" +
	                         f(this.getUTCHours())     + ":" +
	                         f(this.getUTCMinutes())   + ":" +
	                         f(this.getUTCSeconds())   + "Z";
	                };

	            You can provide an optional replacer method. It will be passed the
	            key and value of each member, with this bound to the containing
	            object. The value that is returned from your method will be
	            serialized. If your method returns undefined, then the member will
	            be excluded from the serialization.

	            If the replacer parameter is an array of strings, then it will be
	            used to select the members to be serialized. It filters the results
	            such that only members with keys listed in the replacer array are
	            stringified.

	            Values that do not have JSON representations, such as undefined or
	            functions, will not be serialized. Such values in objects will be
	            dropped; in arrays they will be replaced with null. You can use
	            a replacer function to replace those with JSON values.
	            JSON.stringify(undefined) returns undefined.

	            The optional space parameter produces a stringification of the
	            value that is filled with line breaks and indentation to make it
	            easier to read.

	            If the space parameter is a non-empty string, then that string will
	            be used for indentation. If the space parameter is a number, then
	            the indentation will be that many spaces.

	            Example:

	            text = JSON.stringify(["e", {pluribus: "unum"}]);
	            // text is "["e",{"pluribus":"unum"}]"

	            text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
	            // text is "[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]"

	            text = JSON.stringify([new Date()], function (key, value) {
	                return this[key] instanceof Date ?
	                    "Date(" + this[key] + ")" : value;
	            });
	            // text is "["Date(---current time---)"]"

	        JSON.parse(text, reviver)
	            This method parses a JSON text to produce an object or array.
	            It can throw a SyntaxError exception.

	            The optional reviver parameter is a function that can filter and
	            transform the results. It receives each of the keys and values,
	            and its return value is used instead of the original value.
	            If it returns what it received, then the structure is not modified.
	            If it returns undefined then the member is deleted.

	            Example:

	            // Parse the text. Values that look like ISO date strings will
	            // be converted to Date objects.

	            myData = JSON.parse(text, function (key, value) {
	                let a;
	                if (typeof value === "string") {
	                    a =
	/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
	                    if (a) {
	                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
	                            +a[5], +a[6]));
	                    }
	                }
	                return value;
	            });

	            myData = JSON.parse("["Date(09/09/2001)"]", function (key, value) {
	                let d;
	                if (typeof value === "string" &&
	                        value.slice(0, 5) === "Date(" &&
	                        value.slice(-1) === ")") {
	                    d = new Date(value.slice(5, -1));
	                    if (d) {
	                        return d;
	                    }
	                }
	                return value;
	            });

	    This is a reference implementation. You are free to copy, modify, or
	    redistribute.
	*/
	/*jslint evil: true, regexp: true */
	/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
	    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
	    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
	    lastIndex, length, parse, prototype, push, replace, slice, stringify,
	    test, toJSON, toString, valueOf
	*/
	// create a JSON object only if one does not already exist. We create the
	// methods in a closure to avoid creating global variables.
	exports.JSON = {};
	(function () {
	    function f(n) {
	        // format integers to have at least two digits.
	        return n < 10 ? "0" + n : n;
	    }
	    if (typeof Date.prototype.toJSON !== "function") {
	        Date.prototype.toJSON = function (_KEY) {
	            return isFinite(this.valueOf())
	                ? this.getUTCFullYear() +
	                    "-" +
	                    f(this.getUTCMonth() + 1) +
	                    "-" +
	                    f(this.getUTCDate()) +
	                    "T" +
	                    f(this.getUTCHours()) +
	                    ":" +
	                    f(this.getUTCMinutes()) +
	                    ":" +
	                    f(this.getUTCSeconds()) +
	                    "Z"
	                : "";
	        };
	        var strProto = String.prototype;
	        var numProto = Number.prototype;
	        numProto.JSON = strProto.JSON = Boolean.prototype.toJSON = function (_KEY) {
	            return this.valueOf();
	        };
	    }
	    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	    // tslint:disable-next-line
	    var esc = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	    var gap;
	    var indent;
	    var meta = {
	        // table of character substitutions
	        "\b": "\\b",
	        "\t": "\\t",
	        "\n": "\\n",
	        "\f": "\\f",
	        "\r": "\\r",
	        '"': '\\"',
	        "\\": "\\\\",
	    };
	    var rep;
	    function quote(quoteStr) {
	        // if the string contains no control characters, no quote characters, and no
	        // backslash characters, then we can safely slap some quotes around it.
	        // otherwise we must also replace the offending characters with safe escape
	        // sequences.
	        esc.lastIndex = 0;
	        return esc.test(quoteStr)
	            ? '"' +
	                quoteStr.replace(esc, function (a) {
	                    var c = meta[a];
	                    return typeof c === "string"
	                        ? c
	                        : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
	                }) +
	                '"'
	            : '"' + quoteStr + '"';
	    }
	    function str(key, holder) {
	        // produce a string from holder[key].
	        var i; // the loop counter.
	        var k; // the member key.
	        var v; // the member value.
	        var length;
	        var mind = gap;
	        var partial;
	        var value = holder[key];
	        // if the value has a toJSON method, call it to obtain a replacement value.
	        if (value &&
	            typeof value === "object" &&
	            typeof value.toJSON === "function") {
	            value = value.toJSON(key);
	        }
	        // if we were called with a replacer function, then call the replacer to
	        // obtain a replacement value.
	        if (typeof rep === "function") {
	            value = rep.call(holder, key, value);
	        }
	        // what happens next depends on the value"s type.
	        switch (typeof value) {
	            case "string":
	                return quote(value);
	            case "number":
	                // json numbers must be finite. Encode non-finite numbers as null.
	                return isFinite(value) ? String(value) : "null";
	            case "boolean":
	            case "null":
	                // if the value is a boolean or null, convert it to a string. Note:
	                // typeof null does not produce "null". The case is included here in
	                // the remote chance that this gets fixed someday.
	                return String(value);
	            // if the type is "object", we might be dealing with an object or an array or
	            // null.
	            case "object":
	                // due to a specification blunder in ECMAScript, typeof null is "object",
	                // so watch out for that case.
	                if (!value) {
	                    return "null";
	                }
	                // make an array to hold the partial: string[] results of stringifying this object value.
	                gap += indent;
	                partial = [];
	                // is the value an array?
	                if (Object.prototype.toString.apply(value, []) === "[object Array]") {
	                    // the value is an array. Stringify every element. Use null as a placeholder
	                    // for non-JSON values.
	                    length = value.length;
	                    for (i = 0; i < length; i += 1) {
	                        partial[i] = str(i.toString(), value) || "null";
	                    }
	                    // join all of the elements together, separated with commas, and wrap them in
	                    // brackets.
	                    v =
	                        partial.length === 0
	                            ? "[]"
	                            : gap
	                                ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
	                                : "[" + partial.join(",") + "]";
	                    gap = mind;
	                    return v;
	                }
	                // if the replacer is an array, use it to select the members to be stringified.
	                if (rep && typeof rep === "object") {
	                    length = rep.length;
	                    for (i = 0; i < length; i += 1) {
	                        if (typeof rep[i] === "string") {
	                            k = rep[i];
	                            v = str(k, value);
	                            if (v) {
	                                partial.push(quote(k) + (gap ? ": " : ":") + v);
	                            }
	                        }
	                    }
	                }
	                else {
	                    // otherwise, iterate through all of the keys in the object.
	                    for (k in value) {
	                        if (Object.prototype.hasOwnProperty.call(value, k)) {
	                            v = str(k, value);
	                            if (v) {
	                                partial.push(quote(k) + (gap ? ": " : ":") + v);
	                            }
	                        }
	                    }
	                }
	                // join all of the member texts together, separated with commas,
	                // and wrap them in braces.
	                v =
	                    partial.length === 0
	                        ? "{}"
	                        : gap
	                            ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
	                            : "{" + partial.join(",") + "}";
	                gap = mind;
	                return v;
	        }
	        return undefined;
	    }
	    // if the JSON object does not yet have a stringify method, give it one.
	    if (typeof exports.JSON.stringify !== "function") {
	        exports.JSON.stringify = function (value, replacer, space) {
	            // the stringify method takes a value and an optional replacer, and an optional
	            // space parameter, and returns a JSON text. The replacer can be a function
	            // that can replace values, or an array of strings that will select the keys.
	            // a default replacer method can be provided. Use of the space parameter can
	            // produce text that is more easily readable.
	            var i;
	            gap = "";
	            indent = "";
	            // if the space parameter is a number, make an indent string containing that
	            // many spaces.
	            if (typeof space === "number") {
	                for (i = 0; i < space; i += 1) {
	                    indent += " ";
	                }
	                // if the space parameter is a string, it will be used as the indent string.
	            }
	            else if (typeof space === "string") {
	                indent = space;
	            }
	            // if there is a replacer, it must be a function or an array.
	            // otherwise, throw an error.
	            rep = replacer;
	            if (replacer &&
	                typeof replacer !== "function" &&
	                (typeof replacer !== "object" || typeof replacer.length !== "number")) {
	                throw new Error("JSON.stringify");
	            }
	            // make a fake root object containing our value under the key of "".
	            // return the result of stringifying the value.
	            return str("", { "": value });
	        };
	    }
	    // if the JSON object does not yet have a parse method, give it one.
	    if (typeof exports.JSON.parse !== "function") {
	        exports.JSON.parse = function (text, reviver) {
	            // the parse method takes a text and an optional reviver function, and returns
	            // a JavaScript value if the text is a valid JSON text.
	            var j;
	            function walk(holder, key) {
	                // the walk method is used to recursively walk the resulting structure so
	                // that modifications can be made.
	                var k;
	                var v;
	                var value = holder[key];
	                if (value && typeof value === "object") {
	                    for (k in value) {
	                        if (Object.prototype.hasOwnProperty.call(value, k)) {
	                            v = walk(value, k);
	                            value[k] = v;
	                        }
	                    }
	                }
	                return reviver.call(holder, key, value);
	            }
	            // parsing happens in four stages. In the first stage, we replace certain
	            // unicode characters with escape sequences. JavaScript handles many characters
	            // incorrectly, either silently deleting them, or treating them as line endings.
	            text = String(text);
	            cx.lastIndex = 0;
	            if (cx.test(text)) {
	                text = text.replace(cx, function (a) {
	                    return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
	                });
	            }
	            // in the second stage, we run the text against regular expressions that look
	            // for non-JSON patterns. We are especially concerned with "()" and "new"
	            // because they can cause invocation, and "=" because it can cause mutation.
	            // but just to be safe, we want to reject all unexpected forms.
	            // we split the second stage into 4 regexp operations in order to work around
	            // crippling inefficiencies in IE"s and Safari"s regexp engines. First we
	            // replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
	            // replace all simple value tokens with "]" characters. Third, we delete all
	            // open brackets that follow a colon or comma or that begin the text. Finally,
	            // we look to see that the remaining characters are only whitespace or "]" or
	            // "," or ":" or "{" or "}". If that is so, then the text is safe for eval.
	            if (/^[\],:{}\s]*$/.test(text
	                .replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
	                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
	                .replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
	                // in the third stage we use the eval function to compile the text into a
	                // javascript structure. The "{" operator is subject to a syntactic ambiguity
	                // in JavaScript: it can begin a block or an object literal. We wrap the text
	                // in parens to eliminate the ambiguity.
	                // tslint:disable-next-line:function-constructor
	                j = new Function("return (" + text + ")")();
	                // in the optional fourth stage, we recursively walk the new structure, passing
	                // each name/value pair to a reviver function for possible transformation.
	                return typeof reviver === "function" ? walk({ "": j }, "") : j;
	            }
	            // if the text is not JSON parseable, then a SyntaxError is thrown.
	            throw new SyntaxError("JSON.parse");
	        };
	    }
	})();

	});

	var json = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	window.JSON = window.JSON || json2.JSON;

	});

	// ES5 15.2.3.9
	// http://es5.github.com/#x15.2.3.9
	if (!Object.freeze) {
	    Object.freeze = function (object) {
	        if (Object(object) !== object) {
	            throw new TypeError("Object.freeze can only be called on Objects.");
	        }
	        // this is misleading and breaks feature-detection, but
	        // allows "securable" code to "gracefully" degrade to working
	        // but insecure code.
	        return object;
	    };
	}
	// detect a Rhino bug and patch it
	try {
	    Object.freeze(function () { return undefined; });
	}
	catch (exception) {
	    Object.freeze = (function (freezeObject) {
	        return function (object) {
	            if (typeof object === "function") {
	                return object;
	            }
	            else {
	                return freezeObject(object);
	            }
	        };
	    })(Object.freeze);
	}

	if (!Object.prototype.hasOwnProperty) {
	    Object.prototype.hasOwnProperty = function (prop) {
	        return typeof this[prop] !== "undefined";
	    };
	}
	if (!Object.getOwnPropertyNames) {
	    Object.getOwnPropertyNames = function (obj) {
	        var keys = [];
	        for (var key in obj) {
	            if (typeof obj.hasOwnProperty !== "undefined" &&
	                obj.hasOwnProperty(key)) {
	                keys.push(key);
	            }
	        }
	        return keys;
	    };
	}

	// Source: https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/prepend
	(function (arr) {
	    arr.forEach(function (item) {
	        if (item.hasOwnProperty("prepend")) {
	            return;
	        }
	        Object.defineProperty(item, "prepend", {
	            configurable: true,
	            enumerable: true,
	            writable: true,
	            value: function prepend() {
	                var argArr = Array.prototype.slice.call(arguments);
	                var docFrag = document.createDocumentFragment();
	                argArr.forEach(function (argItem) {
	                    var isNode = argItem instanceof Node;
	                    docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
	                });
	                this.insertBefore(docFrag, this.firstChild);
	            },
	        });
	    });
	})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

	/**
	 * @this {Promise}
	 */
	function finallyConstructor(callback) {
	  var constructor = this.constructor;
	  return this.then(
	    function(value) {
	      // @ts-ignore
	      return constructor.resolve(callback()).then(function() {
	        return value;
	      });
	    },
	    function(reason) {
	      // @ts-ignore
	      return constructor.resolve(callback()).then(function() {
	        // @ts-ignore
	        return constructor.reject(reason);
	      });
	    }
	  );
	}

	function allSettled(arr) {
	  var P = this;
	  return new P(function(resolve, reject) {
	    if (!(arr && typeof arr.length !== 'undefined')) {
	      return reject(
	        new TypeError(
	          typeof arr +
	            ' ' +
	            arr +
	            ' is not iterable(cannot read property Symbol(Symbol.iterator))'
	        )
	      );
	    }
	    var args = Array.prototype.slice.call(arr);
	    if (args.length === 0) return resolve([]);
	    var remaining = args.length;

	    function res(i, val) {
	      if (val && (typeof val === 'object' || typeof val === 'function')) {
	        var then = val.then;
	        if (typeof then === 'function') {
	          then.call(
	            val,
	            function(val) {
	              res(i, val);
	            },
	            function(e) {
	              args[i] = { status: 'rejected', reason: e };
	              if (--remaining === 0) {
	                resolve(args);
	              }
	            }
	          );
	          return;
	        }
	      }
	      args[i] = { status: 'fulfilled', value: val };
	      if (--remaining === 0) {
	        resolve(args);
	      }
	    }

	    for (var i = 0; i < args.length; i++) {
	      res(i, args[i]);
	    }
	  });
	}

	// Store setTimeout reference so promise-polyfill will be unaffected by
	// other code modifying setTimeout (like sinon.useFakeTimers())
	var setTimeoutFunc = setTimeout;

	function isArray(x) {
	  return Boolean(x && typeof x.length !== 'undefined');
	}

	function noop() {}

	// Polyfill for Function.prototype.bind
	function bind(fn, thisArg) {
	  return function() {
	    fn.apply(thisArg, arguments);
	  };
	}

	/**
	 * @constructor
	 * @param {Function} fn
	 */
	function Promise$1(fn) {
	  if (!(this instanceof Promise$1))
	    throw new TypeError('Promises must be constructed via new');
	  if (typeof fn !== 'function') throw new TypeError('not a function');
	  /** @type {!number} */
	  this._state = 0;
	  /** @type {!boolean} */
	  this._handled = false;
	  /** @type {Promise|undefined} */
	  this._value = undefined;
	  /** @type {!Array<!Function>} */
	  this._deferreds = [];

	  doResolve(fn, this);
	}

	function handle(self, deferred) {
	  while (self._state === 3) {
	    self = self._value;
	  }
	  if (self._state === 0) {
	    self._deferreds.push(deferred);
	    return;
	  }
	  self._handled = true;
	  Promise$1._immediateFn(function() {
	    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
	    if (cb === null) {
	      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
	      return;
	    }
	    var ret;
	    try {
	      ret = cb(self._value);
	    } catch (e) {
	      reject(deferred.promise, e);
	      return;
	    }
	    resolve(deferred.promise, ret);
	  });
	}

	function resolve(self, newValue) {
	  try {
	    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
	    if (newValue === self)
	      throw new TypeError('A promise cannot be resolved with itself.');
	    if (
	      newValue &&
	      (typeof newValue === 'object' || typeof newValue === 'function')
	    ) {
	      var then = newValue.then;
	      if (newValue instanceof Promise$1) {
	        self._state = 3;
	        self._value = newValue;
	        finale(self);
	        return;
	      } else if (typeof then === 'function') {
	        doResolve(bind(then, newValue), self);
	        return;
	      }
	    }
	    self._state = 1;
	    self._value = newValue;
	    finale(self);
	  } catch (e) {
	    reject(self, e);
	  }
	}

	function reject(self, newValue) {
	  self._state = 2;
	  self._value = newValue;
	  finale(self);
	}

	function finale(self) {
	  if (self._state === 2 && self._deferreds.length === 0) {
	    Promise$1._immediateFn(function() {
	      if (!self._handled) {
	        Promise$1._unhandledRejectionFn(self._value);
	      }
	    });
	  }

	  for (var i = 0, len = self._deferreds.length; i < len; i++) {
	    handle(self, self._deferreds[i]);
	  }
	  self._deferreds = null;
	}

	/**
	 * @constructor
	 */
	function Handler(onFulfilled, onRejected, promise) {
	  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
	  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
	  this.promise = promise;
	}

	/**
	 * Take a potentially misbehaving resolver function and make sure
	 * onFulfilled and onRejected are only called once.
	 *
	 * Makes no guarantees about asynchrony.
	 */
	function doResolve(fn, self) {
	  var done = false;
	  try {
	    fn(
	      function(value) {
	        if (done) return;
	        done = true;
	        resolve(self, value);
	      },
	      function(reason) {
	        if (done) return;
	        done = true;
	        reject(self, reason);
	      }
	    );
	  } catch (ex) {
	    if (done) return;
	    done = true;
	    reject(self, ex);
	  }
	}

	Promise$1.prototype['catch'] = function(onRejected) {
	  return this.then(null, onRejected);
	};

	Promise$1.prototype.then = function(onFulfilled, onRejected) {
	  // @ts-ignore
	  var prom = new this.constructor(noop);

	  handle(this, new Handler(onFulfilled, onRejected, prom));
	  return prom;
	};

	Promise$1.prototype['finally'] = finallyConstructor;

	Promise$1.all = function(arr) {
	  return new Promise$1(function(resolve, reject) {
	    if (!isArray(arr)) {
	      return reject(new TypeError('Promise.all accepts an array'));
	    }

	    var args = Array.prototype.slice.call(arr);
	    if (args.length === 0) return resolve([]);
	    var remaining = args.length;

	    function res(i, val) {
	      try {
	        if (val && (typeof val === 'object' || typeof val === 'function')) {
	          var then = val.then;
	          if (typeof then === 'function') {
	            then.call(
	              val,
	              function(val) {
	                res(i, val);
	              },
	              reject
	            );
	            return;
	          }
	        }
	        args[i] = val;
	        if (--remaining === 0) {
	          resolve(args);
	        }
	      } catch (ex) {
	        reject(ex);
	      }
	    }

	    for (var i = 0; i < args.length; i++) {
	      res(i, args[i]);
	    }
	  });
	};

	Promise$1.allSettled = allSettled;

	Promise$1.resolve = function(value) {
	  if (value && typeof value === 'object' && value.constructor === Promise$1) {
	    return value;
	  }

	  return new Promise$1(function(resolve) {
	    resolve(value);
	  });
	};

	Promise$1.reject = function(value) {
	  return new Promise$1(function(resolve, reject) {
	    reject(value);
	  });
	};

	Promise$1.race = function(arr) {
	  return new Promise$1(function(resolve, reject) {
	    if (!isArray(arr)) {
	      return reject(new TypeError('Promise.race accepts an array'));
	    }

	    for (var i = 0, len = arr.length; i < len; i++) {
	      Promise$1.resolve(arr[i]).then(resolve, reject);
	    }
	  });
	};

	// Use polyfill for setImmediate for performance gains
	Promise$1._immediateFn =
	  // @ts-ignore
	  (typeof setImmediate === 'function' &&
	    function(fn) {
	      // @ts-ignore
	      setImmediate(fn);
	    }) ||
	  function(fn) {
	    setTimeoutFunc(fn, 0);
	  };

	Promise$1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
	  if (typeof console !== 'undefined' && console) {
	    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
	  }
	};

	var src = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': Promise$1
	});

	var Promise$2 = /*@__PURE__*/getAugmentedNamespace(src);

	var promise = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });

	window.Promise =
	    window.Promise || Promise$2.default || Promise$2;

	});

	if (!String.prototype.repeat) {
	    String.prototype.repeat = function (length) {
	        var result = "";
	        for (var i = 0; i < length; i++) {
	            result += this;
	        }
	        return result;
	    };
	}

	var polyfills = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });










	});

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation.

	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */
	/* global Reflect, Promise */

	var extendStatics = function(d, b) {
	    extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return extendStatics(d, b);
	};

	function __extends(d, b) {
	    extendStatics(d, b);
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	}

	var __assign = function() {
	    __assign = Object.assign || function __assign(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign.apply(this, arguments);
	};

	function __awaiter(thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	}

	function __generator(thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	    function verb(n) { return function (v) { return step([n, v]); }; }
	    function step(op) {
	        if (f) throw new TypeError("Generator is already executing.");
	        while (_) try {
	            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	            if (y = 0, t) op = [op[0] & 2, t.value];
	            switch (op[0]) {
	                case 0: case 1: t = op; break;
	                case 4: _.label++; return { value: op[1], done: false };
	                case 5: _.label++; y = op[1]; op = [0]; continue;
	                case 7: op = _.ops.pop(); _.trys.pop(); continue;
	                default:
	                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                    if (t[2]) _.ops.pop();
	                    _.trys.pop(); continue;
	            }
	            op = body.call(thisArg, _);
	        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
	        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	    }
	}

	function __spreadArrays() {
	    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
	    for (var r = Array(s), k = 0, i = 0; i < il; i++)
	        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
	            r[k] = a[j];
	    return r;
	}

	/**
	 * Adds an alert letting the user know they're in sandbox mode
	 *
	 * @param target
	 *
	 */
	function addSandboxAlert(target, insertBefore) {
	    var el = document.createElement("div");
	    var text = document.createTextNode("This page is currently in sandbox/test mode. Do not use real/active card numbers.");
	    el.appendChild(text);
	    el.className = "sandbox-warning";
	    el.style.display = "block";
	    el.style.width = "100%";
	    el.style.marginBottom = "5px";
	    el.style.color = "#fff";
	    el.style.backgroundColor = "#770000";
	    el.style.padding = "8px 5px";
	    el.style.fontFamily = "Verdana";
	    el.style.fontWeight = "100";
	    el.style.fontSize = "12px";
	    el.style.textAlign = "center";
	    el.style.boxSizing = "border-box";
	    if (typeof target === "string") {
	        var element = document.querySelector(target);
	        if (!element) {
	            throw new Error("Credit card form target does not exist");
	        }
	        target = element;
	    }
	    if (!target) {
	        return;
	    }
	    if (insertBefore) {
	        target.insertBefore(el, insertBefore);
	    }
	    else {
	        target.insertBefore(el, target.firstChild);
	    }
	}

	var options = {};

	var actionNormalizeResponse = (function (data) {
	    if (data.error && data.reasons) {
	        return {
	            error: data.error,
	            reasons: data.reasons,
	        };
	    }
	    if (!data.GetTokenResult || !data.GetTokenResult.IsSuccessful) {
	        var message = (data.GetTokenResult || {}).ErrorMessage || "Unexpected error";
	        var reasons = [{ code: "INVALID_REQUEST", message: message }];
	        return {
	            error: true,
	            reasons: reasons,
	        };
	    }
	    var response = {
	        details: {},
	        paymentReference: data.GetTokenResult.Token,
	    };
	    return response;
	});

	var tokenTypes = {
	    check: "2",
	    credit: "1",
	};
	var actionTokenize = (function (url, env, data) { return __awaiter(void 0, void 0, void 0, function () {
	    var request, headers, resp, e_1;
	    return __generator(this, function (_a) {
	        switch (_a.label) {
	            case 0:
	                request = {
	                    merchantName: options.merchantName,
	                };
	                if (data["card-number"]) {
	                    request.tokenData = data["card-number"].replace(/\s/g, "");
	                    request.type = tokenTypes.credit;
	                }
	                else if (data["account-number"]) {
	                    request.tokenData = data["account-number"] + "|" + data["routing-number"];
	                    request.type = tokenTypes.check;
	                }
	                _a.label = 1;
	            case 1:
	                _a.trys.push([1, 3, , 4]);
	                headers = {
	                    "Content-Type": "application/json",
	                };
	                return [4 /*yield*/, fetch(url, {
	                        body: JSON.stringify(request),
	                        credentials: "omit",
	                        headers: typeof Headers !== "undefined" ? new Headers(headers) : headers,
	                        method: "POST",
	                    })];
	            case 2:
	                resp = _a.sent();
	                return [2 /*return*/, resp.json()];
	            case 3:
	                e_1 = _a.sent();
	                return [2 /*return*/, {
	                        error: true,
	                        reasons: [{ code: e_1.name, message: e_1.message }],
	                    }];
	            case 4: return [2 /*return*/];
	        }
	    });
	}); });

	var actionValidateData = (function (data) {
	    var errors = [];
	    if (!data["card-number"] && !data["card-track"] && !data["account-number"]) {
	        if (!data["card-number"]) {
	            errors.push({
	                code: "INVALID_CARD_NUMBER",
	                message: "The card number is invalid.",
	            });
	        }
	        else if (!data["account-number"]) {
	            errors.push({
	                code: "INVALID_ACCOUNT_NUMBER",
	                message: "The account number is invalid",
	            });
	        }
	    }
	    if (data["account-number"] && !data["routing-number"]) {
	        errors.push({
	            code: "INVALID_ROUTING_NUMBER",
	            message: "The routing number is invalid",
	        });
	    }
	    return errors;
	});

	var supports = {
	    tokenization: {
	        cardNotPresent: true,
	        eCheck: true,
	    },
	};
	var domains = {
	    production: "https://heartlandpaymentservices.net",
	    sandbox: "https://staging.heartlandpaymentservices.net",
	};
	var urls = {
	    tokenization: function (prod) {
	        return (prod ? domains.production : domains.sandbox) + "/QuickPayService/QuickPayService.svc/GetToken";
	    },
	};
	var actions = {
	    normalizeResponse: actionNormalizeResponse,
	    tokenize: actionTokenize,
	    validateData: actionValidateData,
	};
	var requiredSettings = ["merchantName"];
	var getEnv = function () {
	    return options.env || "production";
	};

	var billpay = /*#__PURE__*/Object.freeze({
		__proto__: null,
		supports: supports,
		urls: urls,
		actions: actions,
		requiredSettings: requiredSettings,
		getEnv: getEnv
	});

	var actionNormalizeResponse$1 = (function (data) {
	    if (data.error && data.reasons) {
	        return {
	            error: data.error,
	            reasons: data.reasons,
	        };
	    }
	    // TODO: parse these properly
	    if (data.errors) {
	        var reasons = [];
	        for (var i in data.errors) {
	            if (!data.errors.hasOwnProperty(i)) {
	                continue;
	            }
	            var reason = data.errors[i];
	            var serverErrorType = reason.code === "SERVER_REQUIRED" ? "missing" : "invalid";
	            var code = "ERROR";
	            var message = "An unknown error has occurred. Details: " + reason.error_Code + " - " + reason.reason;
	            if (reason.reason === "cardnumber") {
	                code = "INVALID_CARD_NUMBER";
	                message = "The card number is " + serverErrorType;
	            }
	            else if (reason.reason === "expirationdate") {
	                code = "INVALID_CARD_EXPIRATION";
	                message = "The card expiration date is " + serverErrorType;
	            }
	            else if (reason.reason === "cvv") {
	                code = "INVALID_CARD_SECURITY_CODE";
	                message = "The card security code is " + serverErrorType;
	            }
	            reasons.push({
	                code: code,
	                message: message,
	            });
	        }
	        return {
	            error: true,
	            reasons: reasons,
	        };
	    }
	    var response = {
	        paymentReference: data.token,
	    };
	    return response;
	});

	var actionTokenize$1 = (function (url, env, data) { return __awaiter(void 0, void 0, void 0, function () {
	    var request, exp, headers, resp, e_1;
	    return __generator(this, function (_a) {
	        switch (_a.label) {
	            case 0:
	                request = {
	                    merchantApiKey: data.webApiKey,
	                };
	                if (data["card-number"]) {
	                    request.cardnumber = data["card-number"].replace(/\s/g, "");
	                }
	                if (data["card-cvv"]) {
	                    request.cvv = data["card-cvv"];
	                }
	                if (data["card-expiration"] &&
	                    data["card-expiration"].indexOf(" / ") !== -1) {
	                    exp = data["card-expiration"].split(" / ");
	                    request.expirationmonth = exp[0] || "";
	                    request.expirationyear = (exp[1] || "").substr(2, 2);
	                }
	                if (data["card-holder-name"]) {
	                    request.cardholder = data["card-holder-name"];
	                }
	                _a.label = 1;
	            case 1:
	                _a.trys.push([1, 3, , 4]);
	                headers = {
	                    "Content-Type": "application/json",
	                };
	                return [4 /*yield*/, fetch(url, {
	                        body: JSON.stringify(request),
	                        credentials: "omit",
	                        headers: typeof Headers !== "undefined" ? new Headers(headers) : headers,
	                        method: "POST",
	                    })];
	            case 2:
	                resp = _a.sent();
	                return [2 /*return*/, resp.json()];
	            case 3:
	                e_1 = _a.sent();
	                return [2 /*return*/, {
	                        error: true,
	                        reasons: [{ code: e_1.name, message: e_1.message }],
	                    }];
	            case 4: return [2 /*return*/];
	        }
	    });
	}); });

	var actionValidateData$1 = (function (data) {
	    var errors = [];
	    if (!data["card-number"]) {
	        errors.push({
	            code: "INVALID_CARD_NUMBER",
	            message: "The card number is invalid.",
	        });
	    }
	    if (!data["card-cvv"]) {
	        errors.push({
	            code: "INVALID_CARD_SECURITY_CODE",
	            message: "The card security code is invalid.",
	        });
	    }
	    if (!data["card-expiration"]) {
	        errors.push({
	            code: "INVALID_CARD_EXPIRATION",
	            message: "The card expiration is invalid.",
	        });
	    }
	    return errors;
	});

	var supports$1 = {
	    apm: {
	        applePay: false,
	        googlePay: false,
	    },
	    consumerAuthentication: false,
	    tokenization: {
	        cardNotPresent: true,
	        cardPresent: false,
	        eCheck: false,
	        gift: false,
	    },
	};
	var domains$1 = {
	    // Genius Checkout has an automatic sandbox feature for developer / partner accounts
	    production: "https://ecommerce.merchantware.net",
	    sandbox: "https://ecommerce.merchantware.net",
	};
	var urls$1 = {
	    tokenization: function (prod) {
	        return (prod ? domains$1.production : domains$1.sandbox) + "/v1/api/tokens";
	    },
	};
	var actions$1 = {
	    normalizeResponse: actionNormalizeResponse$1,
	    tokenize: actionTokenize$1,
	    validateData: actionValidateData$1,
	};
	var requiredSettings$1 = ["webApiKey"];
	var getEnv$1 = function () {
	    return options.env || "production";
	};

	var genius = /*#__PURE__*/Object.freeze({
		__proto__: null,
		supports: supports$1,
		urls: urls$1,
		actions: actions$1,
		requiredSettings: requiredSettings$1,
		getEnv: getEnv$1
	});

	var actionNormalizeResponse$2 = (function (data) {
	    if (data.error && data.reasons) {
	        return {
	            error: data.error,
	            reasons: data.reasons,
	        };
	    }
	    if (data.action) {
	        var reasons = [];
	        switch (data.action) {
	            case "action-error":
	                reasons.push({
	                    code: "INVALID_REQUEST",
	                    message: data.payload,
	                });
	                break;
	            case "hpp-api-timeout-error":
	                reasons.push({
	                    code: "API_ERROR",
	                    message: data.payload,
	                });
	                break;
	            default:
	                for (var i in data.payload) {
	                    if (!data.payload.hasOwnProperty(i)) {
	                        continue;
	                    }
	                    var reason = data.payload[i];
	                    var code = "";
	                    switch (reason.errorCode) {
	                        case "INVALID_CARDNUMBER":
	                            code = "INVALID_CARD_NUMBER";
	                            break;
	                        case "INVALID_EXPIRY_DATE":
	                            code = "INVALID_CARD_EXPIRATION";
	                            break;
	                        case "INVALID_SECURITY_CODE":
	                            code = "INVALID_CARD_SECURITY_CODE";
	                            break;
	                        case "INVALID_CARDHOLDER_NAME":
	                            code = "INVALID_CARD_HOLDER_NAME";
	                            break;
	                    }
	                    reasons.push({
	                        code: code,
	                        message: reason.errorMessage,
	                    });
	                }
	                break;
	        }
	        return {
	            error: true,
	            reasons: reasons,
	        };
	    }
	    return {
	        customerReference: atob(data.SAVED_PAYER_REF),
	        details: {
	            cardholderName: atob(data.SAVED_PMT_NAME),
	            orderId: atob(data.ORDER_ID),
	        },
	        paymentReference: atob(data.SAVED_PMT_REF),
	        requestId: atob(data.PASREF),
	    };
	});

	var loadedFrames = {};

	var PostMessage = /** @class */ (function () {
	    function PostMessage() {
	    }
	    PostMessage.prototype.post = function (data, target) {
	        data.source = data.source || {};
	        data.source.name = window.name || "parent";
	        if (!loadedFrames) {
	            return;
	        }
	        var frame = loadedFrames[target];
	        if (!frame) {
	            return;
	        }
	        var targetNode = frame.frame;
	        var targetUrl = frame.url;
	        try {
	            if (typeof frame.targetNode !== "undefined") {
	                targetNode = frame.targetNode;
	            }
	        }
	        catch (e) {
	            /* */
	        }
	        var win = target === "parent" ? parent : targetNode.contentWindow || targetNode;
	        if (typeof win.postMessage === "undefined") {
	            return;
	        }
	        win.postMessage(JSON.stringify(data), targetUrl);
	    };
	    PostMessage.prototype.receive = function (callback) {
	        return new Promise(function (resolve) {
	            var cb = function (m) {
	                try {
	                    var d = JSON.parse(m.data);
	                    if (callback) {
	                        callback.call(callback, d);
	                    }
	                    else {
	                        resolve(d);
	                    }
	                }
	                catch (e) {
	                    /* */
	                }
	            };
	            if (window.addEventListener) {
	                window.addEventListener("message", cb, false);
	            }
	            else {
	                window.attachEvent("onmessage", cb);
	            }
	        });
	    };
	    return PostMessage;
	}());
	var postMessage = new PostMessage();

	var setup = false;
	var actionSetup = (function () { return __awaiter(void 0, void 0, void 0, function () {
	    return __generator(this, function (_a) {
	        if (setup) {
	            return [2 /*return*/];
	        }
	        setup = true;
	        // keep `pm.receive` call in callback version to ensure we receive the
	        // hash request
	        postMessage.receive(function (data) { return __awaiter(void 0, void 0, void 0, function () {
	            var hashed;
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0:
	                        if (!(data.type === "gateway:globalpayments:hash" && options.hash)) return [3 /*break*/, 2];
	                        return [4 /*yield*/, options.hash(data.data)];
	                    case 1:
	                        hashed = _a.sent();
	                        postMessage.post({
	                            data: hashed,
	                            id: data.id,
	                            type: "gateway:globalpayments:hash-result",
	                        }, data.id);
	                        _a.label = 2;
	                    case 2: return [2 /*return*/];
	                }
	            });
	        }); });
	        return [2 /*return*/];
	    });
	}); });

	var eventEmitter = createCommonjsModule(function (module, exports) {
	/// see https://gist.github.com/mudge/5830382
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.EventEmitter = void 0;
	/* Polyfill indexOf. */
	var indexOf;
	if (typeof Array.prototype.indexOf === "function") {
	    indexOf = function (haystack, needle) { return haystack.indexOf(needle); };
	}
	else {
	    indexOf = function (haystack, needle) {
	        var length = haystack.length;
	        var i = 0;
	        var idx = -1;
	        var found = false;
	        while (i < length && !found) {
	            if (haystack[i] === needle) {
	                idx = i;
	                found = true;
	            }
	            i++;
	        }
	        return idx;
	    };
	}
	var EventEmitter = /** @class */ (function () {
	    function EventEmitter() {
	        this.events = {};
	    }
	    EventEmitter.prototype.on = function (event, listener) {
	        if (typeof this.events[event] !== "object") {
	            this.events[event] = [];
	        }
	        this.events[event].push(listener);
	    };
	    EventEmitter.prototype.off = function (event, listener) {
	        var idx;
	        if (typeof this.events[event] === "object") {
	            idx = indexOf(this.events[event], listener);
	            if (idx > -1) {
	                this.events[event].splice(idx, 1);
	            }
	        }
	    };
	    EventEmitter.prototype.emit = function (event) {
	        var args = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            args[_i - 1] = arguments[_i];
	        }
	        var i;
	        var listeners;
	        var length;
	        if (typeof this.events[event] === "object") {
	            listeners = this.events[event].slice();
	            length = listeners.length;
	            for (i = 0; i < length; i++) {
	                listeners[i].apply(this, args);
	            }
	        }
	    };
	    EventEmitter.prototype.once = function (event, listener) {
	        var that = this;
	        // tslint:disable-next-line:only-arrow-functions
	        this.on(event, function g() {
	            that.off(event, g);
	            listener.apply(that, arguments);
	        });
	    };
	    return EventEmitter;
	}());
	exports.EventEmitter = EventEmitter;

	});

	var generateGuid_1 = createCommonjsModule(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.generateGuid = void 0;
	function generateGuid() {
	    var S4 = function () {
	        // tslint:disable-next-line:no-bitwise
	        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	    };
	    return "" + S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
	}
	exports.generateGuid = generateGuid;

	});

	var lib = createCommonjsModule(function (module, exports) {
	var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
	    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(eventEmitter, exports);
	__exportStar(generateGuid_1, exports);

	});

	var paymentFieldId = "secure-payment-field";

	var actionOnload = (function (url) {
	    // build request
	    var orderId = btoa(lib.generateGuid()).substring(0, 22);
	    var date = new Date();
	    var month = date.getUTCMonth() + 1;
	    var day = date.getUTCDate();
	    var hours = date.getUTCHours();
	    var mins = date.getUTCMinutes();
	    var secs = date.getUTCSeconds();
	    var timestamp = date.getUTCFullYear().toString() +
	        (month < 10 ? "0" + month.toString() : month.toString()).toString() +
	        (day < 10 ? "0" + day.toString() : day.toString()) +
	        (hours < 10 ? "0" + hours.toString() : hours.toString()) +
	        (mins < 10 ? "0" + mins.toString() : mins.toString()) +
	        (secs < 10 ? "0" + secs.toString() : secs.toString());
	    var href = window.location.protocol + "//" + window.location.host;
	    var data = {
	        ACCOUNT: options.account || "",
	        AUTO_SETTLE_FLAG: "0",
	        CARD_STORAGE_ENABLE: "1",
	        CURRENCY: "EUR",
	        HPP_LISTENER_URL: href,
	        HPP_POST_DIMENSIONS: href,
	        HPP_POST_RESPONSE: href,
	        HPP_VERSION: "2",
	        MERCHANT_ID: options.merchantId || "",
	        MERCHANT_RESPONSE_URL: href,
	        ORDER_ID: orderId,
	        PAYER_EXIST: (options.customerExists === true && "1") || "0",
	        TIMESTAMP: timestamp,
	        VALIDATE_CARD_ONLY: (options.validateOnly === false && "0") || "1",
	    };
	    if (options.customerExists) {
	        data.PAYER_REF = options.customerReference; // opt config
	    }
	    return getHashResult(data)
	        .then(function (request) {
	        submitHppRequest(url, request);
	        return getHppReadyState(orderId);
	    })
	        .then(function () { return orderId; });
	});
	var createIframe = function (orderId) {
	    var frame = document.createElement("iframe");
	    frame.setAttribute("name", "global-payments-rxp-" + orderId);
	    frame.setAttribute("id", "global-payments-rxp-" + orderId);
	    frame.setAttribute("height", "0");
	    frame.setAttribute("width", "0");
	    frame.style.display = "none";
	    frame.style.opacity = "0";
	    return frame;
	};
	var getHashResult = function (data) {
	    var field = document.getElementById(paymentFieldId);
	    if (!field) {
	        return Promise.reject({
	            error: true,
	            reasons: [{ code: "ERROR", message: "Missing field" }],
	        });
	    }
	    postMessage.post({
	        data: data,
	        id: field.getAttribute("data-id"),
	        type: "gateway:globalpayments:hash",
	    }, "parent");
	    // keep `pm.receive` call in callback version to ensure we receive the
	    // hash request
	    return new Promise(function (resolve) {
	        postMessage.receive(function (d) {
	            if (d.type === "gateway:globalpayments:hash-result") {
	                resolve(d.data);
	            }
	        });
	    });
	};
	var submitHppRequest = function (url, request) {
	    var iframe = createIframe(request.ORDER_ID);
	    var form = document.createElement("form");
	    form.method = "POST";
	    form.action = url;
	    for (var prop in request) {
	        if (Object.prototype.hasOwnProperty.call(request, prop)) {
	            var el = document.createElement("input");
	            el.type = "hidden";
	            el.name = prop;
	            el.value = request[prop];
	            form.appendChild(el);
	        }
	    }
	    // add to dom + submit
	    document.body.appendChild(iframe);
	    if (!iframe.contentWindow) {
	        throw new Error("Source iframe loaded incorrectly");
	    }
	    if (typeof iframe.contentWindow.document.body !== "undefined") {
	        iframe.contentWindow.document.body.appendChild(form);
	    }
	    else {
	        iframe.contentWindow.document.appendChild(form);
	    }
	    form.submit();
	};
	var getHppReadyState = function (orderId) {
	    return new Promise(function (resolve, reject) {
	        var timeout = setTimeout(function () {
	            reject({
	                error: true,
	                reasons: [{ code: "TIMEOUT", message: "HPP setup timeout" }],
	            });
	        }, 30000);
	        postMessage.receive(function (message) {
	            clearTimeout(timeout);
	            var action = message.action || "";
	            if (action === "hpp-listener-loaded") {
	                if (message.payload) {
	                    resolve(orderId);
	                }
	                else {
	                    reject({
	                        error: true,
	                        reasons: [{ code: "ERROR", message: "HPP setup failure" }],
	                    });
	                }
	            }
	        });
	    });
	};

	var actionTokenize$2 = (function (url, env, data) { return __awaiter(void 0, void 0, void 0, function () {
	    var orderId, e_1, iframe, win, month, year, exp, request;
	    return __generator(this, function (_a) {
	        switch (_a.label) {
	            case 0:
	                _a.trys.push([0, 2, , 3]);
	                return [4 /*yield*/, actionOnload(url)];
	            case 1:
	                orderId = _a.sent();
	                return [3 /*break*/, 3];
	            case 2:
	                e_1 = _a.sent();
	                return [2 /*return*/, Promise.reject(e_1)];
	            case 3:
	                iframe = document.getElementById("global-payments-rxp-" + orderId);
	                if (!iframe) {
	                    return [2 /*return*/, Promise.reject("Source iframe missing")];
	                }
	                win = iframe.contentWindow;
	                if (!win) {
	                    return [2 /*return*/, Promise.reject("Source iframe loaded incorrectly")];
	                }
	                month = "";
	                year = "";
	                if (data["card-expiration"] &&
	                    data["card-expiration"].indexOf(" / ") !== -1) {
	                    exp = data["card-expiration"].split(" / ");
	                    month = exp[0] || "";
	                    year = (exp[1] || "").substr(2, 2);
	                }
	                request = {
	                    action: "populate-form-fields",
	                    payload: {
	                        pas_cccvc: data["card-cvv"],
	                        pas_ccmonth: month,
	                        pas_ccname: data["card-holder-name"],
	                        pas_ccnum: data["card-number"].replace(/\s/g, ""),
	                        pas_ccyear: year,
	                    },
	                };
	                // todo: fix postMessage origin
	                win.postMessage(JSON.stringify(request), "*");
	                // keep `pm.receive` call in callback version to ensure we receive the
	                // hash request
	                return [2 /*return*/, new Promise(function (resolve) {
	                        postMessage.receive(function (payload) {
	                            if (typeof payload.action !== "undefined" ||
	                                (typeof payload.SHA1HASH !== "undefined" &&
	                                    payload.ORDER_ID === btoa(orderId))) {
	                                resolve(payload);
	                            }
	                        });
	                    })];
	        }
	    });
	}); });

	var actionValidateData$2 = (function (data) {
	    var errors = [];
	    if (!data["card-number"]) {
	        errors.push({
	            code: "INVALID_CARD_NUMBER",
	            message: "The card number is invalid.",
	        });
	    }
	    if (!data["card-cvv"]) {
	        errors.push({
	            code: "INVALID_CARD_SECURITY_CODE",
	            message: "The card security code is invalid.",
	        });
	    }
	    if (!data["card-expiration"]) {
	        errors.push({
	            code: "INVALID_CARD_EXPIRATION",
	            message: "The card expiration is invalid.",
	        });
	    }
	    if (!data["card-holder-name"]) {
	        errors.push({
	            code: "INVALID_CARD_HOLDER_NAME",
	            message: "The card holder name is invalid.",
	        });
	    }
	    return errors;
	});

	var supports$2 = {
	    apm: {
	        applePay: true,
	        googlePay: false,
	    },
	    consumerAuthentication: true,
	    tokenization: {
	        cardNotPresent: true,
	        cardPresent: false,
	        eCheck: false,
	        gift: false,
	    },
	};
	var domains$2 = {
	    production: "https://pay.realexpayments.com",
	    sandbox: "https://pay.sandbox.realexpayments.com",
	};
	var urls$2 = {
	    tokenization: function (prod) {
	        return (prod ? domains$2.production : domains$2.sandbox) + "/pay";
	    },
	};
	var getEnv$2 = function () {
	    var def = "production";
	    return options.env || def;
	};
	var actions$2 = {
	    normalizeResponse: actionNormalizeResponse$2,
	    setup: actionSetup,
	    tokenize: actionTokenize$2,
	    validateData: actionValidateData$2,
	};
	var requiredSettings$2 = [
	    "merchantId",
	    "account",
	    // "hash",
	    "env",
	];

	var globalpayments = /*#__PURE__*/Object.freeze({
		__proto__: null,
		supports: supports$2,
		urls: urls$2,
		getEnv: getEnv$2,
		actions: actions$2,
		requiredSettings: requiredSettings$2
	});

	/**
	 * typeByNumber
	 *
	 * Helper function to grab the ICardType for a given card number.
	 *
	 * @param cardNumber - The card number
	 */
	function typeByNumber(cardNumber) {
	    var cardType;
	    if (!cardNumber) {
	        return undefined;
	    }
	    if (cardNumber.replace(/^\s+|\s+$/gm, "").length < 4) {
	        return undefined;
	    }
	    for (var i in cardTypes) {
	        if (!cardTypes.hasOwnProperty(i)) {
	            continue;
	        }
	        cardType = cardTypes[i];
	        if (cardType && cardType.regex && cardType.regex.test(cardNumber)) {
	            break;
	        }
	    }
	    return cardType;
	}
	/**
	 * typeByTrack
	 *
	 * @param data - track data
	 * @param isEncrypted - (default: false)
	 * @param trackNumber
	 */
	function typeByTrack(data, isEncrypted, trackNumber) {
	    if (isEncrypted === void 0) { isEncrypted = false; }
	    var cardNumber = "";
	    if (isEncrypted && trackNumber && trackNumber === "02") {
	        cardNumber = data.split("=")[0];
	    }
	    else {
	        var temp = data.split("%");
	        if (temp[1]) {
	            temp = temp[1].split("^");
	            if (temp[0]) {
	                cardNumber = temp[0].toString().substr(1);
	            }
	        }
	    }
	    return typeByNumber(cardNumber);
	}
	/**
	 * luhnCheck
	 *
	 * Runs a mod 10 check on a given card number.
	 *
	 * @param cardNumber - The card number
	 */
	function luhnCheck(cardNumber) {
	    var odd = true;
	    var i = 0;
	    var sum = 0;
	    var digit;
	    if (!cardNumber) {
	        return false;
	    }
	    var digits = cardNumber.split("").reverse();
	    var length = digits.length;
	    for (i; i < length; i++) {
	        digit = parseInt(digits[i], 10);
	        odd = !odd;
	        if (odd) {
	            digit *= 2;
	        }
	        if (digit > 9) {
	            digit -= 9;
	        }
	        sum += digit;
	    }
	    return sum % 10 === 0;
	}
	var cardTypes = [
	    {
	        code: "visa",
	        format: /(\d{1,4})/g,
	        lengths: [16, 18, 19],
	        regex: /^4/,
	    },
	    {
	        code: "mastercard",
	        format: /(\d{1,4})/g,
	        lengths: [16],
	        regex: /^(5[1-5]|2[2-7])/,
	    },
	    {
	        code: "amex",
	        format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
	        lengths: [15],
	        regex: /^3[47]/,
	    },
	    {
	        code: "diners",
	        format: /(\d{1,4})(\d{1,6})?(\d{1,4})?/,
	        lengths: [14, 16, 19],
	        regex: /^3[0689]/,
	    },
	    {
	        code: "discover",
	        format: /(\d{1,4})/g,
	        lengths: [16, 19],
	        regex: /^6([045]|22)/,
	    },
	    {
	        code: "jcb",
	        format: /(\d{1,4})/g,
	        lengths: [16, 17, 18, 19],
	        regex: /^35/,
	    },
	    {
	        code: "unknown",
	        format: /(\d{1,4})/g,
	        lengths: [19],
	        regex: /^[0-9]/,
	    },
	];

	var actionNormalizeResponse$3 = (function (data) {
	    if (data.error && data.reasons) {
	        return {
	            error: data.error,
	            reasons: data.reasons,
	        };
	    }
	    if (data.error_code) {
	        var reasons = [
	            {
	                code: data.error_code,
	                message: data.detailed_error_description,
	            },
	        ];
	        return {
	            error: true,
	            reasons: reasons,
	        };
	    }
	    var response = {
	        details: {
	            accountId: data.account_id,
	            accountName: data.account_name,
	            fingerprint: data.fingerprint,
	            fingerprintPresenceIndicator: data.fingerprint_presence_indicator,
	            merchantId: data.merchant_id,
	            merchantName: data.merchant_name,
	            reference: data.reference
	        },
	        paymentReference: data.id
	    };
	    if (data.card && data.card.masked_number_last4) {
	        response.details.cardNumber = data.card.masked_number_last4;
	    }
	    if (data.card && data.card.brand) {
	        response.details.cardType = cardTypeOfGpApiBrand(data.card.brand);
	    }
	    return response;
	});
	var cardTypeOfGpApiBrand = function (brand) {
	    if (cardTypes.map(function (ct) { return ct.code; }).indexOf(brand.toLocaleLowerCase())) {
	        return brand.toLocaleLowerCase();
	    }
	    return brand;
	};

	var actionTokenize$3 = (function (url, env, data) { return __awaiter(void 0, void 0, void 0, function () {
	    var request, exp, headers, resp, e_1;
	    return __generator(this, function (_a) {
	        switch (_a.label) {
	            case 0:
	                request = {
	                    reference: options.reference || lib.generateGuid(),
	                    usage_mode: "SINGLE",
	                };
	                if (options.accountName) {
	                    request.account_name = options.accountName;
	                }
	                if (data["card-number"]) {
	                    request.card = request.card || {};
	                    request.card.number = data["card-number"].replace(/\s/g, "");
	                }
	                if (data["card-cvv"]) {
	                    request.card = request.card || {};
	                    request.card.cvv = data["card-cvv"];
	                }
	                if (data["card-expiration"] &&
	                    data["card-expiration"].indexOf(" / ") !== -1) {
	                    exp = data["card-expiration"].split(" / ");
	                    request.card = request.card || {};
	                    request.card.expiry_month = exp[0] || "";
	                    request.card.expiry_year = (exp[1] || "").length === 2 ? (exp[1] || "") : (exp[1] || "").substr(2, 2);
	                }
	                if (data["card-holder-name"]) {
	                    request.name = data["card-holder-name"];
	                }
	                if (options.enableCardFingerPrinting) {
	                    request.fingerprint_mode = "ALWAYS";
	                }
	                _a.label = 1;
	            case 1:
	                _a.trys.push([1, 3, , 4]);
	                headers = {
	                    "Accept": "application/json",
	                    "Authorization": "Bearer " + (options.accessToken || ""),
	                    "Content-Type": "application/json",
	                    "X-GP-Version": options.apiVersion || "2020-10-22",
	                };
	                return [4 /*yield*/, fetch(url, {
	                        body: JSON.stringify(request),
	                        credentials: "omit",
	                        headers: typeof Headers !== "undefined" ? new Headers(headers) : headers,
	                        method: "POST",
	                    })];
	            case 2:
	                resp = _a.sent();
	                return [2 /*return*/, resp.json()];
	            case 3:
	                e_1 = _a.sent();
	                return [2 /*return*/, {
	                        error: true,
	                        reasons: [{ code: e_1.name, message: e_1.message }],
	                    }];
	            case 4: return [2 /*return*/];
	        }
	    });
	}); });

	var actionValidateData$3 = (function (data) {
	    var errors = [];
	    if (!data["card-number"]) {
	        errors.push({
	            code: "INVALID_CARD_NUMBER",
	            message: "The card number is invalid.",
	        });
	    }
	    if (data["card-holder-name"] && data["card-holder-name"].length > 100) {
	        errors.push({
	            code: "TOO_LONG_DATA",
	            message: "The card holder name is too long",
	        });
	    }
	    if (options.requireCardHolderName) {
	        if (!data["card-holder-name"]) {
	            errors.push({
	                code: "INVALID_CARD_HOLDER_NAME",
	                message: "The card holder is mandatory",
	            });
	        }
	    }
	    return errors;
	});

	var INSTALLMENTS_KEY = 'installments';
	var INSTALLMENTS_CONFIG_DEFAULT_CHANNEL = 'CNP';
	var INSTALLMENTS_CONFIG_DEFAULT_ENTRY_MODE = 'ECOM';

	var actionQueryInstallmentPlans = (function (url, _env, data) { return __awaiter(void 0, void 0, void 0, function () {
	    var headers, requestBody, resp, e_1;
	    return __generator(this, function (_a) {
	        switch (_a.label) {
	            case 0:
	                headers = createHeaders();
	                requestBody = createRequestBody(data);
	                _a.label = 1;
	            case 1:
	                _a.trys.push([1, 3, , 4]);
	                return [4 /*yield*/, fetch(url, {
	                        body: JSON.stringify(requestBody),
	                        credentials: "omit",
	                        headers: headers,
	                        method: "POST",
	                    })];
	            case 2:
	                resp = _a.sent();
	                return [2 /*return*/, resp.json()];
	            case 3:
	                e_1 = _a.sent();
	                return [2 /*return*/, {
	                        error: true,
	                        reasons: [{ code: e_1.name, message: e_1.message }],
	                    }];
	            case 4: return [2 /*return*/];
	        }
	    });
	}); });
	function createHeaders() {
	    var headers = {
	        "Accept": "application/json",
	        "Authorization": "Bearer " + (options.accessToken || ""),
	        "Content-Type": "application/json",
	        "X-GP-Version": options.apiVersion || "2020-10-22",
	    };
	    return typeof Headers !== "undefined" ? new Headers(headers) : headers;
	}
	function createRequestBody(data) {
	    var cardNumber = data.number, amount = data.amount, brand = data.brand, expiryMonth = data.expiryMonth, expiryYear = data.expiryYear;
	    var _a = options.installments || {}, channel = _a.channel, country = _a.country, mcc = _a.mcc, currency = _a.currency;
	    var request = {
	        reference: options.reference || lib.generateGuid(),
	        "account_id": options.account,
	        channel: channel ? channel : INSTALLMENTS_CONFIG_DEFAULT_CHANNEL,
	        amount: amount,
	        currency: currency,
	        country: country,
	    };
	    if (mcc) {
	        request = __assign({ mcc: mcc }, request);
	    }
	    if (cardNumber) {
	        request["payment_method"] = request["payment_method"] || {};
	        var paymentMethod = request["payment_method"];
	        paymentMethod["entry_mode"] = INSTALLMENTS_CONFIG_DEFAULT_ENTRY_MODE;
	        paymentMethod.card = paymentMethod.card || {};
	        paymentMethod.card.number = cardNumber.replace(/\s/g, "");
	        paymentMethod.card.brand = brand;
	        paymentMethod.card["expiry_month"] = expiryMonth;
	        paymentMethod.card["expiry_year"] = expiryYear;
	    }
	    return request;
	}

	var version = "1.9.29";

	var getEnv$3 = (function () {
	    return options.env || "production";
	});

	var getAssetBaseUrl = (function (result) {
	    var majorVersion = version.split(".")[0] || version[0];
	    switch (getEnv$3()) {
	        case "local":
	            return "http://localhost:7777/dist/";
	        case "qa":
	            return "https://js-qa.np-hpp.globalpay.com/v" + majorVersion + "/";
	        case "sandbox":
	            return "https://js-cert.globalpay.com/v" + majorVersion + "/";
	        case "production":
	            return "https://js.globalpay.com/v" + majorVersion + "/";
	        default:
	            return result;
	    }
	});

	var supports$3 = {
	    apm: {
	        applePay: true,
	        clickToPay: true,
	        googlePay: true,
	    },
	    binCheck: {
	        hsaFsa: false,
	        surcharge: false,
	    },
	    consumerAuthentication: false,
	    tokenization: {
	        cardNotPresent: true,
	        cardPresent: true,
	        eCheck: false,
	        gift: false,
	    },
	};
	var domains$3 = {
	    production: "https://apis.globalpay.com",
	    qa: "https://apis-qa.globalpay.com",
	    sandbox: "https://apis.sandbox.globalpay.com",
	};
	var urls$3 = {
	    assetBaseUrl: getAssetBaseUrl,
	    tokenization: function (prod) {
	        var domain = prod ? domains$3.production : domains$3.sandbox;
	        if (options.env && options.env === "qa") {
	            domain = domains$3.qa;
	        }
	        var endpoint = "payment-methods";
	        if (options.merchantId) {
	            endpoint = "merchants/" + options.merchantId + "/" + endpoint;
	        }
	        return domain + "/ucp/" + endpoint;
	    },
	    queryInstallmentPlans: function (prod) {
	        var domain = prod ? domains$3.production : domains$3.sandbox;
	        if (options.env && (options.env === "qa")) {
	            domain = domains$3.qa;
	        }
	        var endpoint = "installments";
	        if (options.merchantId) {
	            endpoint = "merchants/" + options.merchantId + "/" + endpoint;
	        }
	        return domain + "/ucp/" + endpoint;
	    }
	};
	var actions$3 = {
	    normalizeResponse: actionNormalizeResponse$3,
	    tokenize: actionTokenize$3,
	    validateData: actionValidateData$3,
	    queryInstallmentPlans: actionQueryInstallmentPlans,
	};
	var requiredSettings$3 = ["accessToken"];

	var gpApi = /*#__PURE__*/Object.freeze({
		__proto__: null,
		supports: supports$3,
		urls: urls$3,
		actions: actions$3,
		requiredSettings: requiredSettings$3,
		getEnv: getEnv$3
	});

	var actionNormalizeResponse$4 = (function (data) {
	    if (data.error && data.reasons) {
	        return {
	            error: data.error,
	            reasons: data.reasons,
	        };
	    }
	    if (data.error) {
	        var reasons = [];
	        switch (data.error.param) {
	            case "card.number":
	                reasons.push({
	                    code: "INVALID_CARD_NUMBER",
	                    message: data.error.message,
	                });
	                break;
	            case "card.exp_month":
	            case "card.exp_year":
	                reasons.push({
	                    code: "INVALID_CARD_EXPIRATION_DATE",
	                    message: data.error.message,
	                });
	                break;
	        }
	        return {
	            error: true,
	            reasons: reasons,
	        };
	    }
	    var response = {
	        details: {},
	        paymentReference: data.token_value,
	    };
	    if (data.card && data.card.number) {
	        response.details.cardNumber = data.card.number;
	    }
	    if (data.is_fsahsa) {
	        response.details.isHsaFsa = data.is_fsahsa === "Y";
	    }
	    if (data.surcharge_allowed) {
	        response.details.canSurcharge = data.surcharge_allowed === "Y";
	    }
	    return response;
	});

	var actionTokenize$4 = (function (url, env, data) { return __awaiter(void 0, void 0, void 0, function () {
	    var request, exp, headers, resp, e_1;
	    return __generator(this, function (_a) {
	        switch (_a.label) {
	            case 0:
	                request = {
	                    object: "token",
	                    token_type: "supt",
	                };
	                if (data["card-number"]) {
	                    request.card = request.card || {};
	                    request.card.number = data["card-number"].replace(/\s/g, "");
	                }
	                if (data["card-cvv"]) {
	                    request.card = request.card || {};
	                    request.card.cvc = data["card-cvv"];
	                }
	                if (data["card-expiration"] &&
	                    data["card-expiration"].indexOf(" / ") !== -1) {
	                    exp = data["card-expiration"].split(" / ");
	                    request.card = request.card || {};
	                    request.card.exp_month = exp[0] || "";
	                    request.card.exp_year = exp[1] || "";
	                }
	                // TODO: Properly accept encrypted track data
	                if (data["card-track"]) {
	                    request.card = request.card || {};
	                    request.card.track_method = "swipe";
	                    request.card.track = data["card-track"];
	                }
	                if (data["account-number"]) {
	                    request.ach = request.ach || {};
	                    request.ach.account_number = data["account-number"];
	                }
	                if (data["routing-number"]) {
	                    request.ach = request.ach || {};
	                    request.ach.routing_number = data["routing-number"];
	                }
	                if (data["bin-check-hsafsa"]) {
	                    request.fsahsa_req = "Y";
	                }
	                if (data["bin-check-surcharge"]) {
	                    request.surchargeable_req = "Y";
	                }
	                _a.label = 1;
	            case 1:
	                _a.trys.push([1, 3, , 4]);
	                headers = {
	                    "Content-Type": "application/json",
	                };
	                return [4 /*yield*/, fetch(url, {
	                        body: JSON.stringify(request),
	                        credentials: "omit",
	                        headers: typeof Headers !== "undefined" ? new Headers(headers) : headers,
	                        method: "POST",
	                    })];
	            case 2:
	                resp = _a.sent();
	                return [2 /*return*/, resp.json()];
	            case 3:
	                e_1 = _a.sent();
	                return [2 /*return*/, {
	                        error: true,
	                        reasons: [{ code: e_1.name, message: e_1.message }],
	                    }];
	            case 4: return [2 /*return*/];
	        }
	    });
	}); });

	var actionValidateData$4 = (function (data) {
	    var errors = [];
	    if (!data["card-number"] && !data["card-track"] && !data["account-number"]) {
	        if (!data["card-number"]) {
	            errors.push({
	                code: "INVALID_CARD_NUMBER",
	                message: "The card number is invalid.",
	            });
	        }
	        else if (!data["account-number"]) {
	            errors.push({
	                code: "INVALID_ACCOUNT_NUMBER",
	                message: "The account number is invalid",
	            });
	        }
	    }
	    if (data["account-number"] && !data["routing-number"]) {
	        errors.push({
	            code: "INVALID_ROUTING_NUMBER",
	            message: "The routing number is invalid",
	        });
	    }
	    return errors;
	});

	var supports$4 = {
	    apm: {
	        applePay: true,
	        googlePay: false,
	    },
	    binCheck: {
	        hsaFsa: true,
	        surcharge: true,
	    },
	    consumerAuthentication: true,
	    tokenization: {
	        cardNotPresent: true,
	        cardPresent: true,
	        eCheck: true,
	        gift: true,
	    },
	};
	var domains$4 = {
	    production: "https://api.heartlandportico.com",
	    sandbox: "https://cert.api2.heartlandportico.com",
	};
	var urls$4 = {
	    tokenization: function (prod) {
	        return prod
	            ? domains$4.production + "/SecureSubmit.v1/api/token"
	            : domains$4.sandbox + "/Hps.Exchange.PosGateway.Hpf.v1/api/token";
	    },
	};
	var actions$4 = {
	    normalizeResponse: actionNormalizeResponse$4,
	    tokenize: actionTokenize$4,
	    validateData: actionValidateData$4,
	};
	var requiredSettings$4 = ["publicApiKey"];
	var getEnv$4 = function () {
	    var key = options.publicApiKey || "";
	    var def = "production";
	    if (options.env && options.env === "local") {
	        return options.env;
	    }
	    if (!key) {
	        return def;
	    }
	    var parts = key.split("_");
	    if (!parts[1]) {
	        return def;
	    }
	    switch (parts[1]) {
	        case "cert":
	            return "sandbox";
	        case "prod":
	        default:
	            return def;
	    }
	};

	var heartland = /*#__PURE__*/Object.freeze({
		__proto__: null,
		supports: supports$4,
		urls: urls$4,
		actions: actions$4,
		requiredSettings: requiredSettings$4,
		getEnv: getEnv$4
	});

	var actionNormalizeResponse$5 = (function (data) {
	    return data;
	});

	var actionTokenize$5 = (function (url, env, data) { return __awaiter(void 0, void 0, void 0, function () {
	    var request, exp, environment, headers, resp, e_1;
	    return __generator(this, function (_a) {
	        switch (_a.label) {
	            case 0:
	                request = {};
	                if (data["card-number"]) {
	                    request.card = request.card || {};
	                    request.card.card_number = data["card-number"].replace(/\s+/g, "");
	                }
	                if (data["card-cvv"]) {
	                    request.card = request.card || {};
	                    request.card.card_security_code = data["card-cvv"];
	                }
	                if (data["card-expiration"] &&
	                    data["card-expiration"].indexOf(" / ") !== -1) {
	                    exp = data["card-expiration"].split(" / ");
	                    request.card = request.card || {};
	                    request.card.expiry_month = exp[0] || "";
	                    request.card.expiry_year = exp[1].slice(-2) || "";
	                }
	                // TODO: Properly accept encrypted track data
	                if (data["card-track"]) {
	                    request.card = request.card || {};
	                    request.card.track_method = "swipe";
	                    request.card.track = data["card-track"];
	                }
	                if (data["account-number"]) {
	                    request.ach = request.ach || {};
	                    request.ach.account_number = data["account-number"];
	                }
	                if (data["routing-number"]) {
	                    request.ach = request.ach || {};
	                    request.ach.routing_number = data["routing-number"];
	                }
	                _a.label = 1;
	            case 1:
	                _a.trys.push([1, 3, , 4]);
	                environment = env !== "local" ? env : "dev";
	                headers = {
	                    "Content-Type": "application/json",
	                    "X-GP-Api-Key": options["X-GP-Api-Key"],
	                    "X-GP-Environment": "" + environment,
	                    /* tslint:disable:no-bitwise */
	                    "X-GP-Request-Id": "PFC-" +
	                        "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (character) {
	                            var random = Math.floor(Math.random() * 16);
	                            var value = character === "x" ? random : (random & 0x3) | 0x8;
	                            return value.toString(16);
	                        }),
	                    /* tslint:enable:no-bitwise */
	                    "X-GP-Version": "2019-08-22",
	                };
	                return [4 /*yield*/, fetch(url, {
	                        body: JSON.stringify(request),
	                        credentials: "omit",
	                        headers: typeof Headers !== "undefined" ? new Headers(headers) : headers,
	                        method: "POST",
	                    })];
	            case 2:
	                resp = _a.sent();
	                return [2 /*return*/, resp.json()];
	            case 3:
	                e_1 = _a.sent();
	                return [2 /*return*/, {
	                        error: true,
	                        reasons: [{ code: e_1.name, message: e_1.message }],
	                    }];
	            case 4: return [2 /*return*/];
	        }
	    });
	}); });

	var actionValidateData$5 = (function (data) {
	    var errors = [];
	    var cardNumber = data["card-number"].replace(/\s+/g, "");
	    // The error message here is irrelevant - actual 'invalid_input' error is generated in tokenize.ts.
	    // For type compatibility reason, this code is preserved here.
	    // if (!data["card-number"] && !data["card-track"] && !data["account-number"]) {
	    if (cardNumber.length < 13 || cardNumber.length > 19) {
	        errors.push({
	            code: "invalid_input",
	            // @ts-ignore
	            detail: [
	                {
	                    data_path: "/card/card_number",
	                    description: "Invalid data",
	                },
	            ],
	            message: "Invalid input data.",
	        });
	    }
	    return errors;
	});

	var getEnv$5 = (function () {
	    return options["X-GP-Environment"] || "local";
	});

	var getAssetBaseUrl$1 = (function (result) {
	    var majorVersion = version.split(".")[0] || version[0];
	    switch (getEnv$5()) {
	        case "local":
	            return "http://localhost:8080/v" + majorVersion + "/";
	        case "dev":
	            return "https://js.dev.paygateway.com/secure_payment/v" + majorVersion + "/";
	        case "pqa":
	            return "https://js.pqa.paygateway.com/secure_payment/v" + majorVersion + "/";
	        case "qa":
	            return "https://js.qa.paygateway.com/secure_payment/v" + majorVersion + "/";
	        case "test":
	            return "https://js.test.paygateway.com/secure_payment/v" + majorVersion + "/";
	        case "prod":
	            return "https://js.paygateway.com/secure_payment/v" + majorVersion + "/";
	        case "GP":
	            return result;
	        default:
	            return result;
	    }
	});

	var supports$5 = {
	    apm: {
	        applePay: true,
	        googlePay: false,
	    },
	    consumerAuthentication: true,
	    tokenization: {
	        cardNotPresent: true,
	        cardPresent: true,
	        eCheck: true,
	        gift: true,
	    },
	};
	/* tslint:disable:object-literal-sort-keys */
	var domains$5 = {
	    local: "https://api-sandbox.dev.paygateway.com",
	    dev: "https://api.dev.paygateway.com",
	    pqa: "https://api.dev.paygateway.com",
	    qa: "https://api.qa.paygateway.com",
	    test: "https://api.pit.paygateway.com",
	    prod: "https://api.paygateway.com",
	};
	/* tslint:enable:object-literal-sort-keys */
	var urls$5 = {
	    assetBaseUrl: getAssetBaseUrl$1,
	    tokenization: function (prod) {
	        return domains$5[getEnv$5()] + "/tokenization/temporary_tokens";
	    },
	};
	var actions$5 = {
	    normalizeResponse: actionNormalizeResponse$5,
	    tokenize: actionTokenize$5,
	    validateData: actionValidateData$5,
	};
	var requiredSettings$5 = ["X-GP-Api-Key", "X-GP-Environment"];

	var openedge = /*#__PURE__*/Object.freeze({
		__proto__: null,
		supports: supports$5,
		urls: urls$5,
		actions: actions$5,
		requiredSettings: requiredSettings$5,
		getEnv: getEnv$5
	});

	var actionNormalizeResponse$6 = (function (data) {
	    if (data.error && data.reasons) {
	        return {
	            error: data.error,
	            reasons: data.reasons,
	        };
	    }
	    // TODO: parse these properly
	    if (["FAIL", "FAILURE"].indexOf(data.status) !== -1) {
	        return {
	            error: true,
	            reasons: [
	                {
	                    code: "ERROR",
	                    message: data.responseCode + ": " + data.message,
	                },
	            ],
	        };
	    }
	    var response = {
	        paymentReference: data.tsepToken,
	        requestId: data.transactionId,
	    };
	    return response;
	});

	var actionTokenize$6 = (function (url, enbv, data) {
	    var getRequest = function () {
	        var request = {
	            cvv2: data["card-cvv"],
	            deviceID: window.getDeviceId(),
	            manifest: window.getManifest(),
	            uniqueKeyIdentifier: window.getKeyId(),
	        };
	        if (data["card-number"]) {
	            request.encCardNumber = window.encryptTsepCard(data["card-number"].replace(/\s/g, ""));
	        }
	        if (data["card-expiration"] &&
	            data["card-expiration"].indexOf(" / ") !== -1) {
	            request.expirationDate = data["card-expiration"].replace(" / ", "/");
	        }
	        return request;
	    };
	    return new Promise(function (resolve, reject) {
	        var scriptId = "tsep-entry-script";
	        var cardId = "tsep-cardNumDiv";
	        var timeout = setTimeout(function () {
	            reject({
	                error: true,
	                reasons: [{ code: "TIMEOUT", message: "TransIT setup timeout" }],
	            });
	        }, 30000);
	        var cleanup = function () {
	            clearTimeout(timeout);
	            [cardId, scriptId].forEach(function (id) {
	                var el = document.getElementById(id);
	                if (!el || !el.parentNode) {
	                    return;
	                }
	                el.parentNode.removeChild(el);
	            });
	        };
	        try {
	            // handle tsep response
	            window.tsepHandler = function (eventType, eventData) {
	                // tsep's input fields aren't being used, so this should
	                // be the only event to capture in order to handle load errors
	                if (eventType === "ErrorEvent") {
	                    cleanup();
	                    reject({
	                        error: true,
	                        reasons: [
	                            {
	                                code: "ERROR",
	                                message: eventData.responseCode + ": " + eventData.message,
	                            },
	                        ],
	                    });
	                }
	            };
	            // add holder for tsep card number input
	            var card = document.createElement("div");
	            card.hidden = true;
	            card.style.display = "none";
	            card.id = cardId;
	            document.body.appendChild(card);
	            // add new script on page
	            var script = document.createElement("script");
	            script.id = scriptId;
	            script.src = url;
	            script.defer = true;
	            script.onload = function (e) {
	                if (!window.onload) {
	                    return;
	                }
	                window.onload(e);
	            };
	            document.body.appendChild(script);
	            // tsep doesn't expose a way to hook into the library's load event,
	            // so we create an interval to check manually
	            var interval_1 = setInterval(function () {
	                var cardEl = document.getElementById(cardId.substr(0, cardId.length - 3));
	                // presence of the card element ensures tsep.js is loaded
	                // presence of `cryptTsep` ensures jsencrypt.js is loaded
	                if (!cardEl || !window.cryptTsep) {
	                    return;
	                }
	                // tsep has loaded, so continue on after stopping the interval
	                clearInterval(interval_1);
	                var headers = {
	                    "Content-Type": "application/json",
	                };
	                fetch(options.tsepHost + "/transit-tsep-web/generateTsepToken", {
	                    body: JSON.stringify(getRequest()),
	                    credentials: "omit",
	                    headers: typeof Headers !== "undefined" ? new Headers(headers) : headers,
	                    method: "POST",
	                })
	                    .then(function (resp) {
	                    cleanup();
	                    resolve(resp.json());
	                })["catch"](function (e) {
	                    cleanup();
	                    reject(e);
	                });
	            }, 100);
	        }
	        catch (e) {
	            return reject({
	                error: true,
	                reasons: [{ code: e.name, message: e.message }],
	            });
	        }
	    });
	});

	var actionValidateData$6 = (function (data) {
	    var errors = [];
	    if (!data["card-number"]) {
	        errors.push({
	            code: "INVALID_CARD_NUMBER",
	            message: "The card number is invalid.",
	        });
	    }
	    if (!data["card-cvv"]) {
	        errors.push({
	            code: "INVALID_CARD_SECURITY_CODE",
	            message: "The card security code is invalid.",
	        });
	    }
	    if (!data["card-expiration"]) {
	        errors.push({
	            code: "INVALID_CARD_EXPIRATION",
	            message: "The card expiration is invalid.",
	        });
	    }
	    return errors;
	});

	var supports$6 = {
	    apm: {
	        applePay: false,
	        googlePay: false,
	    },
	    consumerAuthentication: false,
	    tokenization: {
	        cardNotPresent: true,
	        cardPresent: false,
	        eCheck: false,
	        gift: false,
	    },
	};
	var domains$6 = {
	    // Genius Checkout has an automatic sandbox feature for developer / partner accounts
	    production: "https://gateway.transit-pass.com",
	    sandbox: "https://stagegw.transnox.com",
	};
	var urls$6 = {
	    tokenization: function (prod) {
	        options.tsepHost = prod ? domains$6.production : domains$6.sandbox;
	        return options.tsepHost + "/transit-tsep-web/jsView/" + options.deviceId + "?" + options.manifest;
	    },
	};
	var actions$6 = {
	    normalizeResponse: actionNormalizeResponse$6,
	    tokenize: actionTokenize$6,
	    validateData: actionValidateData$6,
	};
	var requiredSettings$6 = ["deviceId", "manifest"];
	var getEnv$6 = function () {
	    return options.env || "production";
	};

	var transit = /*#__PURE__*/Object.freeze({
		__proto__: null,
		supports: supports$6,
		urls: urls$6,
		actions: actions$6,
		requiredSettings: requiredSettings$6,
		getEnv: getEnv$6
	});

	var availableGateways = {
	    billpay: billpay,
	    genius: genius,
	    globalpayments: globalpayments,
	    gpApi: gpApi,
	    heartland: heartland,
	    openedge: openedge,
	    transit: transit,
	};

	var configHasAllRequiredSettings = function (settings) {
	    var totalSettings = settings.length;
	    var count = 0;
	    for (var i = 0; i < totalSettings; i++) {
	        var setting = settings[i];
	        if (options.hasOwnProperty(setting) && options[setting] !== undefined) {
	            count++;
	        }
	    }
	    return count === totalSettings;
	};
	var getGateway = (function () {
	    for (var key in availableGateways) {
	        if (!availableGateways.hasOwnProperty(key)) {
	            continue;
	        }
	        var gateway = availableGateways[key];
	        if (configHasAllRequiredSettings(gateway.requiredSettings)) {
	            return gateway;
	        }
	    }
	    return undefined;
	});

	/**
	 * Creates a single object by merging a `source` (default) and `properties`
	 * obtained elsewhere. Any properties in `properties` will overwrite
	 * matching properties in `source`.
	 *
	 * @param source
	 * @param properties
	 */
	function objectAssign(source, properties) {
	    var destination = {};
	    if (!source) {
	        source = {};
	    }
	    for (var property in source) {
	        if (source.hasOwnProperty(property)) {
	            destination[property] = source[property];
	        }
	    }
	    for (var property in properties) {
	        if (properties.hasOwnProperty(property)) {
	            destination[property] = properties[property];
	        }
	    }
	    return destination;
	}

	/**
	 * addStylesheet
	 *
	 * Creates a `style` node in the DOM with the given `css`.
	 *
	 * @param css
	 * @param id
	 */
	function addStylesheet(css, id) {
	    var el = document.createElement("style");
	    var elements = document.getElementsByTagName("head");
	    if (id) {
	        if (document.getElementById(id)) {
	            return;
	        }
	        el.id = id;
	    }
	    el.type = "text/css";
	    if (el.styleSheet) {
	        // for IE
	        el.styleSheet.cssText = css;
	    }
	    else {
	        el.appendChild(document.createTextNode(css));
	    }
	    if (elements && elements[0]) {
	        elements[0].appendChild(el);
	    }
	}
	/**
	 * json2css
	 *
	 * Converts a JSON node to text representing CSS.
	 *
	 * @param json
	 */
	function json2css(json) {
	    var css = "";
	    var attributes = jsonAttributes(json);
	    var children = jsonChildren(json);
	    var i;
	    var j;
	    var key;
	    var value;
	    if (attributes) {
	        var attributesLength = attributes.length;
	        for (i = 0; i < attributesLength; i++) {
	            key = attributes[i];
	            value = json[key];
	            if (isArray$1(value)) {
	                var arrLength = value.length;
	                for (j = 0; j < arrLength; j++) {
	                    css += key + ":" + value[j] + ";";
	                }
	            }
	            else {
	                css += key + ":" + value + ";";
	            }
	        }
	    }
	    if (children) {
	        var childrenLength = children.length;
	        for (i = 0; i < childrenLength; i++) {
	            key = children[i];
	            value = json[key];
	            css += key + "{" + json2css(value) + "}";
	        }
	    }
	    return css;
	}
	function isArray$1(obj) {
	    return Object.prototype.toString.call(obj) === "[object Array]";
	}
	function jsonAttributes(json) {
	    var keys = [];
	    for (var key in json) {
	        if (json.hasOwnProperty(key) &&
	            (typeof json[key] === "string" || isArray$1(json[key]))) {
	            keys.push(key);
	        }
	    }
	    return keys;
	}
	function jsonChildren(json) {
	    var keys = [];
	    for (var key in json) {
	        if (json.hasOwnProperty(key) &&
	            !(typeof json[key] === "string" || isArray$1(json[key]))) {
	            keys.push(key);
	        }
	    }
	    return keys;
	}

	var assetBaseUrl = (function () {
	    var majorVersion = version.split(".")[0] || version[0];
	    var result = "https://js.globalpay.com/v" + majorVersion + "/";
	    var gateway = getGateway();
	    if (gateway && gateway.urls.assetBaseUrl) {
	        return gateway.urls.assetBaseUrl(result);
	    }
	    switch (options.env) {
	        case "local":
	            return "http://localhost:7777/dist/";
	        case "qa":
	            return "https://js-qa.np-hpp.globalpay.com/v" + majorVersion + "/";
	        case "sandbox":
	            return "https://js-cert.globalpay.com/v" + majorVersion + "/";
	        case "production":
	            return "https://js.globalpay.com/v" + majorVersion + "/";
	        default:
	            return result;
	    }
	});

	var styles = function (assetBaseUrl) {
	    return {
	        "apple-pay-button": {
	            "--apple-pay-button-width": "100%",
	            "--apple-pay-button-height": "50px",
	            "--apple-pay-button-border-radius": "3px",
	            "--apple-pay-button-padding": "0px 0px",
	            "--apple-pay-button-box-sizing": "border-box",
	            display: "block",
	            margin: "5px 0",
	        }
	    };
	};

	var styles$1 = function (assetBaseUrl) {
	    var imageBase = assetBaseUrl + "images/";
	    return {
	        ".secure-payment-form .ctp-panel": {
	            border: "0.5px solid #BCBFC8",
	            "box-shadow": "0px 1px 1px rgba(0, 0, 0, 0.25)",
	            "border-radius": "3px",
	            "container-type": "inline-size",
	            "font-family": "GPCommerce",
	            "margin-bottom": "20px",
	        },
	        ".secure-payment-form div[class^='credit-card'].apm-active ~ div:not([class$='shield']):not([class$='logo'])": {
	            display: "none",
	        },
	        ".secure-payment-form .ctp-panel .ctp-button": {
	            "align-items": "center",
	            background: "transparent url(" + imageBase + "ctp-coloured-cards.svg) no-repeat 16px 20px",
	            cursor: "pointer",
	            display: "flex",
	            flex: "none",
	            "flex-direction": "row",
	            "flex-grow": "1",
	            order: "0",
	            padding: "16px 50px 16px 78px",
	            position: "relative",
	            "white-space": "nowrap"
	        },
	        ".secure-payment-form .ctp-panel .ctp-header": {
	            width: "100%",
	        },
	        ".secure-payment-form .ctp-panel .ctp-button .heading": {
	            "font-family": "GPCommerce",
	            "font-weight": "600",
	            "line-height": "22px",
	            "font-size": "12px"
	        },
	        ".secure-payment-form .ctp-panel .ctp-button .ctp-icon": {
	            background: "transparent url(" + imageBase + "ctp.svg) no-repeat 50% 50%",
	            "background-size": "90%",
	            width: "25px",
	            height: "15px",
	            margin: "0 5px",
	            display: "inline-flex",
	            "vertical-align": "middle",
	            flex: "none",
	            order: "0",
	            "flex-grow": "0",
	        },
	        ".secure-payment-form .ctp-panel .ctp-button .subheading": {
	            margin: "5px 0 0 0",
	            "font-family": "Roboto, sans-serif",
	            "font-weight": "400",
	            "font-size": "12px",
	            "line-height": "19px",
	            "color": "#687282",
	        },
	        ".secure-payment-form div[class^='ctp'] .card-brands": {
	            background: "transparent url(" + imageBase + "card-brands.svg) no-repeat center right",
	            padding: "0px",
	            width: "108px",
	            height: "19px",
	            display: "inline-flex",
	            "vertical-align": "middle",
	            flex: "none",
	            order: "0",
	            "flex-grow": "0"
	        },
	        ".secure-payment-form .ctp-info-tooltip": {
	            width: "16px",
	            height: "16px",
	            display: "inline-flex",
	            "vertical-align": "middle",
	            overflow: "hidden",
	            background: "transparent url(" + imageBase + "info.svg) no-repeat center center",
	            margin: "0 5px",
	            "white-space": "normal"
	        },
	        ".secure-payment-form .ctp-info-tooltip-content": {
	            visibility: "hidden",
	            width: "282px",
	            "background-color": "#fff",
	            color: "#474B57",
	            "text-align": "left",
	            "border-radius": "3px",
	            border: "solid 1px #BCBFC8",
	            padding: "8px 8px",
	            position: "absolute",
	            "z-index": "99999999",
	            "margin-left": "-133px",
	            "margin-top": "25px",
	            opacity: "0",
	            transition: "opacity 0.3s",
	            "font-family": "GPCommerce",
	            "font-size": "0.79em",
	            "font-weight": "400",
	            "box-shadow": "0 3px 6px rgba(0, 0, 0, 0.1)",
	        },
	        ".secure-payment-form .ctp-info-tooltip-content .ctp-icon": {
	            "margin-left": "0!important"
	        },
	        ".secure-payment-form .ctp-info-tooltip .ctp-heading": {
	            "max-width": "350px",
	            margin: "0 auto",
	        },
	        ".secure-payment-form .ctp-info-tooltip-content ul": {
	            padding: "0",
	            "margin-bottom": "0"
	        },
	        ".secure-payment-form .ctp-info-tooltip-content li": {
	            padding: "3px 5px 3px 50px",
	            "font-size": "12px",
	            "line-height": "19px",
	            "list-style": "none",
	        },
	        ".secure-payment-form .ctp-info-tooltip-content li.smart-checkout": {
	            background: "transparent url(" + imageBase + "ctp-shopping-cart.svg) no-repeat left center",
	        },
	        ".secure-payment-form .ctp-info-tooltip-content li.faster-checkout": {
	            background: "transparent url(" + imageBase + "ctp-check.svg) no-repeat left center",
	        },
	        ".secure-payment-form .ctp-info-tooltip-content li.industry-standards": {
	            background: "transparent url(" + imageBase + "ctp-lock.svg) no-repeat left center",
	        },
	        ".secure-payment-form .ctp-info-tooltip .top-arrow": {
	            position: "absolute",
	            "margin-top": "-12px",
	            background: "#fff",
	            width: "4px",
	            left: "50%",
	            "margin-left": "-2px",
	            border: "solid #BCBFC8",
	            "border-width": "0 1px 1px 0",
	            "display": "inline-block",
	            padding: "3px",
	            transform: "rotate(-135deg)",
	            "-webkit-transform": "rotate(-135deg)",
	            "z-index": "9999",
	        },
	        ".secure-payment-form .ctp-info-tooltip-content li .ctp-icon": {
	            "background-size": "80%!important",
	            width: "20px!important",
	            height: "10px!important",
	            margin: "0 0 0 2px!important",
	        },
	        ".secure-payment-form .ctp-info-tooltip-content strong": {
	            "font-size": "16px",
	            "vertical-align": "middle",
	        },
	        ".secure-payment-form .ctp-info-tooltip:hover .ctp-info-tooltip-content": {
	            visibility: "visible",
	            opacity: "1",
	        },
	        "@container (min-width: 408px)": {
	            ".secure-payment-form .ctp-panel .ctp-button .heading": {
	                "font-size": "14px"
	            },
	            ".secure-payment-form .ctp-panel .right-arrow": {
	                "border-width": "0 3px 3px 0",
	            },
	            ".secure-payment-form .ctp-panel .ctp-button .ctp-icon": {
	                width: "28px",
	                height: "18px",
	                "background-size": "100%"
	            }
	        },
	        ".secure-payment-form .apm-active .ctp-panel .ctp-button": {
	            cursor: "default",
	        },
	        ".secure-payment-form.apm-active .ctp-panel .ctp-button": {
	            cursor: "default",
	        },
	        ".secure-payment-form .ctp-panel .ctp-button:after": {
	            content: "",
	            position: "absolute",
	            width: "20px",
	            height: "20px",
	            border: "solid black",
	            "border-width": "0 3px 3px 0",
	            "display": "inline-block",
	            padding: "3px",
	            transform: "rotate(-45deg)",
	            "-webkit-transform": "rotate(-45deg)",
	        },
	        ".secure-payment-form .ctp-panel .right-arrow": {
	            position: "absolute",
	            background: "#fff",
	            right: "20px",
	            border: "solid #242729",
	            "border-width": "0 4px 4px 0",
	            "display": "inline-block",
	            padding: "8px",
	            transform: "rotate(-45deg)",
	            "-webkit-transform": "rotate(-45deg)",
	            "z-index": "9999",
	            top: "50%",
	            "margin-top": "-8px",
	        },
	        ".secure-payment-form .apm-active .right-arrow": {
	            display: "none",
	        },
	        ".secure-payment-form.apm-active .right-arrow": {
	            display: "none",
	        },
	        // Styles for signinlayout
	        "#ctp-wrapper #header": {
	            display: "none!important",
	        },
	        "#ctp-wrapper .logindiv .tooltip": {
	            display: "none!important",
	        },
	        "#ctp-wrapper .logindiv .lblemailInput": {
	            display: "none!important",
	        },
	        "#ctp-wrapper #verifyVisa .VerificationLabel": {
	            "font-size": "14px",
	            "font-family": "GPCommerce",
	            "line-height": "25px"
	        },
	        "#ctp-wrapper #verifyVisa label": {
	            display: "inline-block",
	            "font-size": "14px",
	            "font-family": "GPCommerce",
	            margin: "0"
	        },
	        "#ctp-wrapper .blue-button label": {
	            "font-size": "18px",
	            "line-height": "27px",
	            "font-family": "GPCommerce",
	            margin: "0"
	        },
	        "#ctp-wrapper .cardhdr label": {
	            margin: "0",
	            display: "inline-block",
	            "font-size": "14px",
	            "line-height": "37px"
	        },
	        "#ctp-wrapper .cardhdr label.crdSelectuser": {
	            margin: "0 5px",
	        },
	        "#ctp-wrapper button label": {
	            margin: "0!important",
	            "font-size": "14px!important"
	        },
	        "#ctp-wrapper .quitbanner > svg": {
	            display: "none"
	        },
	        "#ctp-wrapper #footer": {
	            display: "none!important",
	        },
	        "#ctp-wrapper .signinlayout": {
	            "max-width": "350px",
	            "min-height": "200px"
	        },
	        ".secure-payment-form.apm-active .signinlayout": {
	            "min-height": "250px!important"
	        },
	        "#ctp-wrapper .rsdcode": {
	            "font-size": "14px",
	            "font-weight": "700",
	            margin: "0!important"
	        },
	        "#ctp-wrapper .footerLabelDiv label": {
	            "font-size": "14px",
	            "font-weight": "700",
	            "margin-top": "0",
	            "margin-bottom": "40px"
	        },
	        "#ctp-wrapper .logindiv": {
	            "min-height": "160px",
	        },
	        "#ctp-wrapper .VerificationLabel label": {
	            display: "inline-block",
	            margin: "0",
	            "font-size": "14px"
	        },
	        "#ctp-wrapper .VerificationLabel #userMobileMC": {
	            margin: "0 5px",
	        },
	        "#ctp-wrapper .transctcardlabel": {
	            margin: "0",
	            "font-size": "14px"
	        },
	        "#ctp-wrapper .TransitionLabel": {
	            "font-size": "14px",
	            "line-height": "22px",
	            "text-align": "center",
	            float: "none",
	            margin: "0",
	        },
	    };
	};

	var styles$2 = function (assetBaseUrl) {
	    return {
	        "#googlePay": {
	            height: "50px",
	            margin: "5px 0",
	        }
	    };
	};

	// tslint:disable:object-literal-key-quotes
	var fieldStyles = function (assetBaseUrl) {
	    var imageBase = assetBaseUrl + "images/";
	    return {
	        "#secure-payment-field": {
	            "-o-transition": "border-color ease-in-out .15s,box-shadow ease-in-out .15s",
	            "-webkit-box-shadow": "inset 0 1px 1px rgba(0,0,0,.075)",
	            "-webkit-transition": "border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s",
	            "background-color": "#fff",
	            border: "1px solid #ccc",
	            "border-radius": "0px",
	            "box-shadow": "inset 0 1px 1px rgba(0,0,0,.075)",
	            "box-sizing": "border-box",
	            color: "#555",
	            display: "block",
	            "font-family": "sans-serif",
	            "font-size": "14px",
	            height: "50px",
	            "line-height": "1.42857143",
	            margin: "0 .5em 0 0",
	            "max-width": "100%",
	            outline: "0",
	            padding: "6px 12px",
	            transition: "border-color ease-in-out .15s,box-shadow ease-in-out .15s",
	            "vertical-align": "baseline",
	            width: "100% ",
	        },
	        "#secure-payment-field:focus": {
	            border: "1px solid #3989e3",
	            "box-shadow": "none",
	            height: "50px",
	            outline: "none",
	        },
	        "#secure-payment-field[type=button]": {
	            "-moz-user-select": "none",
	            "-ms-touch-action": "manipulation",
	            "-ms-user-select": "none",
	            "-webkit-user-select": "none",
	            "background-color": "#36b46e",
	            "background-image": "none",
	            border: "0px solid transparent",
	            "box-sizing": "border-box",
	            color: "#fff",
	            cursor: "pointer",
	            display: "inline-block",
	            "font-family": "sans-serif",
	            "font-size": "14px",
	            "font-weight": "400",
	            "line-height": "1.42857143",
	            "margin-bottom": "0",
	            padding: "6px 12px",
	            "text-align": "center",
	            "text-transform": "uppercase",
	            "touch-action": "manipulation",
	            "user-select": "none",
	            "vertical-align": "middle",
	            "white-space": "nowrap",
	        },
	        "#secure-payment-field[type=button]:focus": {
	            "background-color": "#258851",
	            color: "#ffffff",
	            outline: "none",
	        },
	        "#secure-payment-field[type=button]:hover": {
	            "background-color": "#258851",
	        },
	        ".card-cvv": {
	            background: "transparent url(" + imageBase + "cvv.png) no-repeat right",
	            "background-size": "63px 40px",
	        },
	        ".card-cvv.card-type-amex": {
	            background: "transparent url(" + imageBase + "cvv-amex.png) no-repeat right",
	            "background-size": "63px 40px",
	        },
	        "img.card-number-icon": {
	            background: "transparent url(" + imageBase + "logo-unknown@2x.png) no-repeat",
	            "background-size": "100%",
	            width: "65px",
	            height: "40px",
	            right: "12px",
	            top: "50%",
	            "margin-top": "-20px",
	            "background-position": "50% 50%"
	        },
	        "img.card-number-icon[src$='/gp-cc-generic.svg']": {
	            background: "transparent url(" + imageBase + "logo-mastercard@2x.png) no-repeat",
	            "background-size": "120%",
	            "background-position-y": "bottom"
	        },
	        "img.card-number-icon.invalid.card-type-amex": {
	            background: "transparent url(" + imageBase + "logo-amex@2x.png) no-repeat 140%",
	            "background-size": "80%",
	            "background-position-y": "87%"
	        },
	        "img.card-number-icon.invalid.card-type-discover": {
	            background: "transparent url(" + imageBase + "logo-discover@2x.png) no-repeat",
	            "background-size": "115%",
	            "background-position-y": "95%",
	            width: "80px"
	        },
	        "img.card-number-icon.invalid.card-type-jcb": {
	            background: "transparent url(" + imageBase + "logo-jcb@2x.png) no-repeat 175%",
	            "background-size": "90%",
	            "background-position-y": "85%"
	        },
	        "img.card-number-icon.invalid.card-type-mastercard": {
	            background: "transparent url(" + imageBase + "logo-mastercard@2x.png) no-repeat",
	            "background-size": "120%",
	            "background-position-y": "bottom"
	        },
	        "img.card-number-icon.invalid.card-type-visa": {
	            background: "transparent url(" + imageBase + "logo-visa@2x.png) no-repeat ",
	            "background-size": "120%",
	            "background-position-y": "bottom"
	        },
	        "img.card-number-icon.valid.card-type-amex": {
	            background: "transparent url(" + imageBase + "logo-amex@2x.png) no-repeat 140%",
	            "background-size": "80%",
	            "background-position-y": "-6px"
	        },
	        "img.card-number-icon.valid.card-type-discover": {
	            background: "transparent url(" + imageBase + "logo-discover@2x.png) no-repeat",
	            "background-size": "115%",
	            "background-position-y": "-5px",
	            width: "80px"
	        },
	        "img.card-number-icon.valid.card-type-jcb": {
	            background: "transparent url(" + imageBase + "logo-jcb@2x.png) no-repeat 175%",
	            "background-size": "90%",
	            "background-position-y": "-5px"
	        },
	        "img.card-number-icon.valid.card-type-mastercard": {
	            background: "transparent url(" + imageBase + "logo-mastercard@2x.png) no-repeat",
	            "background-size": "120%",
	            "background-position-y": "-1px"
	        },
	        "img.card-number-icon.valid.card-type-visa": {
	            background: "transparent url(" + imageBase + "logo-visa@2x.png) no-repeat",
	            "background-size": "120%",
	            "background-position-y": "-1px"
	        },
	        ".card-number::-ms-clear": {
	            display: "none",
	        },
	        "input[placeholder]": {
	            "letter-spacing": "3px",
	        },
	    };
	};
	var parentStyles = function (assetBaseUrl) {
	    var imageBase = assetBaseUrl + "images/";
	    return __assign(__assign(__assign({ ".secure-payment-form": {
	            "font-family": "sans-serif",
	        }, ".secure-payment-form label": {
	            color: "#555",
	            "font-size": "13px",
	            "font-weight": "bold",
	            "line-height": "1.5",
	            "text-transform": "uppercase",
	        }, ".secure-payment-form #ss-banner": {
	            background: "transparent url(" + imageBase + "shield-and-logos@2x.png) no-repeat left center",
	            "background-size": "280px 34px",
	            height: "40px",
	            "margin-bottom": "7px",
	        }, ".secure-payment-form div[class$='-shield']": {
	            flex: "1 1 auto",
	            "margin-right": "16px",
	            float: "left"
	        }, ".secure-payment-form div[class$='-shield'] .ssl-text-logo": {
	            border: "1px solid #468000",
	            "border-radius": "3px",
	            width: "89px",
	            height: "26px",
	            "text-align": "center",
	            margin: "0"
	        }, ".secure-payment-form div[class$='-shield'] .ssl-logo_ico": {
	            width: "19px",
	            height: "18px",
	            "margin-top": "1px",
	            "vertical-align": "middle"
	        }, ".secure-payment-form div[class$='-shield'] .ssl-msg": {
	            "font-size": "8px",
	            "font-weight": "600",
	            "font-family": "Open sans,sans-serif",
	            color: "#468000",
	            "line-height": "9px",
	            display: "inline-block",
	            "vertical-align": "middle",
	            "text-align": "center",
	            "margin-left": "6px",
	            "margin-right": "7px",
	            "margin-top": "1px"
	        }, ".secure-payment-form div[class$='-logo']": {
	            flex: "1 1 auto",
	            "margin-left": "16px",
	            width: "110px",
	            height: "23px",
	            "text-align": "right",
	            float: "right"
	        }, ".secure-payment-form div[class$='-logo'] .security-msg": {
	            color: "#707689",
	            "font-size": "8px",
	            display: "inline-block",
	            "vertical-align": "middle",
	            "margin-right": "2px"
	        }, ".secure-payment-form div[class$='-logo'] img": {
	            "vertical-align": "middle"
	        }, ".secure-payment-form div": {
	            display: "block",
	        }, ".secure-payment-form iframe": {
	            width: "300px",
	        }, ".secure-payment-form .form-row": {
	            "margin-top": "10px",
	        }, ".secure-payment-form .form-wrapper": {
	            display: "block",
	            margin: "10px auto",
	            width: "300px",
	        }, ".secure-payment-form .tooltip, .secure-payment-form .tooltip-content": {
	            display: "none",
	        }, ".secure-payment-form .other-cards-label": {
	            "border-bottom": "1px solid #BCBFC8",
	            "text-align": "center",
	            margin: "20px 0 20px",
	            position: "relative",
	        }, ".secure-payment-form .other-cards-label span": {
	            "text-align": "center",
	            padding: "0 10px",
	            background: "#fff",
	            position: "absolute",
	            color: "#9296A5",
	            width: "auto",
	            left: "50%",
	            "-webkit-transform": "translateX(-50%)",
	            "-moz-transform": "translateX(-50%)",
	            "-ms-transform": "translateX(-50%)",
	            "-o-transform": "translateX(-50%)",
	            transform: "translateX(-50%)",
	            margin: "-10px auto",
	            "font-family": "GPCommerce",
	            "font-size": "16px",
	            "white-space": "nowrap",
	        }, ".secure-payment-form .hidden": {
	            display: "none!important",
	        } }, styles()), styles$1(assetBaseUrl)), styles$2());
	};

	var styles$3 = function (_assetBaseUrl) {
	    return {
	        ".secure-payment-form .modal-overlay": {
	            background: "#0000006e",
	            position: "fixed",
	            top: "0",
	            left: "0",
	            margin: "0 auto",
	            width: "100%",
	            height: "100%",
	            display: "flex",
	            "justify-content": "center",
	            "align-items": "center",
	            "z-index": "9999",
	        },
	        ".secure-payment-form .modal-wrapper": {
	            "font-family": "GPCommerce",
	            background: "#FFFFFF",
	            "border-width": "0px",
	            "border-radius": "8px",
	            overflow: "hidden",
	        },
	    };
	};

	var styles$4 = function (assetBaseUrl) {
	    var imageBase = assetBaseUrl + "images/";
	    var customColors = {
	        azureBaseBlue: '#148EE6',
	        azure25Blue: '#004A80',
	        azure31Blue: '#005C9E',
	        azure39Blue: '#0074C7',
	        azure61LightBlue: '#2B9AEC',
	        azure76LightBlue: '#85CCFF',
	        azure95LightBlue: '#E5F4FF',
	        warmGreyBase: '#7E7C7E',
	        warmGrey95: '#F2F2F2',
	        panelBackgroundGray: '#F5F5F5',
	        coolGreyBase: '#707689',
	        coolGrey16: '#25262D',
	        coolGrey20: '#2E3038',
	        coolGrey25: '#394046',
	        coolGrey39: '#5A5E6D',
	        coolGrey61: '#9296A5',
	        coolGrey95: '#F1F2F4',
	        linkHoverBlue: '#0027AE',
	        linkActiveBlue: '#6583EA',
	    };
	    return __assign({ ".secure-payment-form .credit-card-installments": {
	            "font-family": "GPCommerce",
	        }, ".secure-payment-form .installment-issuer-panel": {
	            background: customColors.panelBackgroundGray,
	            display: "flex",
	            "flex-direction": "column",
	            "max-width": "50%",
	            "padding": "12px",
	            margin: "24px",
	            gap: "8px",
	            width: "432px",
	        }, ".secure-payment-form .installment-issuer-panel-header": {
	            display: "flex",
	            "justify-content": "space-between",
	            "align-items": "center",
	        }, ".secure-payment-form .installment-issuer-panel-title": {
	            color: customColors.coolGrey20,
	            "font-style": "normal",
	            "font-weight": "700",
	            "line-height": "34px",
	            "font-size": "medium",
	        }, ".secure-payment-form .installment-issuer-panel-content": {
	            color: customColors.coolGrey39,
	            "font-style": "normal",
	            "font-weight": "400",
	            "line-height": "12.64px",
	            "font-size": "regular",
	        }, ".secure-payment-form .installment-panel": {
	            "max-width": "50%",
	            "margin-bottom": "10px",
	        }, ".secure-payment-form .installment-plans-title": {
	            color: customColors.coolGrey20,
	            "font-style": "normal",
	            "font-weight": "700",
	            "line-height": "34px",
	            "font-size": "x-large",
	            margin: "20px 0",
	        }, ".secure-payment-form .installment-plans-subtitle": {
	            color: customColors.coolGrey20,
	            "font-style": "normal",
	            "font-weight": "400",
	            "line-height": "24px",
	            "font-size": "1em",
	        }, ".secure-payment-form .installment-plan-details": {
	            "border-top": "1px solid " + customColors.coolGrey95,
	            "border-bottom": "1px solid " + customColors.coolGrey95,
	            padding: "5px 0",
	        }, ".secure-payment-form .installment-plan-monthly-amount": {
	            color: customColors.coolGrey16,
	            "font-style": "normal",
	            "font-weight": "700",
	            "line-height": "55px",
	            "font-size": "2.28em",
	        }, ".secure-payment-form .installment-options, .installment-panel": {
	            display: "flex",
	            "flex-direction": "column",
	            padding: "10px",
	            width: "100%",
	        }, ".secure-payment-form .installment-options": {
	            background: customColors.azure95LightBlue,
	            margin: "5px 0",
	            padding: "20px 25px",
	            "border-radius": "2px",
	        }, ".secure-payment-form .installment-plan-options-title": {
	            color: customColors.coolGrey20,
	            "font-style": "normal",
	            "font-weight": "700",
	            "line-height": "21px",
	            "font-size": "medium",
	        }, ".secure-payment-form .installment-options-content": {
	            color: customColors.coolGrey39,
	            "font-style": "normal",
	            "font-weight": "400",
	            "line-height": "21px",
	            "font-size": "regular",
	            "margin": "15px 0 5px 0",
	        }, ".secure-payment-form .installment-term-selector-title": {
	            "text-align": "center",
	            "padding": "10px 0 0 0",
	        }, ".secure-payment-form .installment-panel-header": {
	            "text-align": "center",
	            display: "flex",
	            "flex-direction": "column",
	        }, ".secure-payment-form .installment-panel-content": {
	            "margin": "5px 0",
	        }, ".secure-payment-form .installment-panel-footer": {
	            "text-align": "center",
	            display: "flex",
	            "flex-direction": "column",
	        }, ".secure-payment-form .installment-field-value-item": {
	            color: customColors.coolGrey25,
	            "font-style": "normal",
	            "font-weight": "400",
	            "line-height": "21px",
	            "font-size": "small",
	            margin: "12px 0",
	        }, ".secure-payment-form .installment-field-value-item, .installment-options-header": {
	            display: "flex",
	            "flex-direction": "row",
	            "justify-content": "space-between",
	        }, ".secure-payment-form .installment-link": {
	            background: "none",
	            border: "none",
	            color: customColors.azure39Blue,
	            "font-style": "normal",
	            "font-weight": "400",
	            "text-decoration": "underline",
	            "line-height": "21px",
	            "font-size": "medium",
	            padding: "0px",
	            cursor: "pointer",
	        }, ".secure-payment-form .installment-link:hover": {
	            color: customColors.linkHoverBlue,
	        }, ".secure-payment-form .installment-link:active": {
	            color: customColors.linkActiveBlue,
	        }, ".secure-payment-form .installment-link:focus": {
	            color: customColors.linkActiveBlue,
	            border: "1px solid " + customColors.azure76LightBlue,
	        }, ".secure-payment-form .installment-step-container": {
	            display: "flex",
	            "justify-content": "center",
	        }, ".secure-payment-form .installment-base-action-button-wrapper": {
	            display: "flex",
	            "justify-content": "center",
	            "flex-wrap": "wrap",
	        }, ".secure-payment-form .installment-base-action-button, .installment-button-explore-plans, .installment-button-learn-more, .installment-button-month-term, .installment-button-pay": {
	            "border-radius": "4px",
	            width: "386px",
	            height: "44px",
	            padding: "10px",
	            color: "#ffffff",
	            "font-weight": "500",
	            "font-size": "1em",
	            "line-height": "24px",
	            "font-style": "normal",
	            border: "0px",
	            cursor: "pointer",
	            "margin-top": "20px",
	            "margin-bottom": "20px",
	            display: "flex",
	            "justify-content": "center",
	            "align-items": "center",
	            gap: "10px",
	        }, ".secure-payment-form .installment-button-explore-plans": {
	            background: customColors.azure25Blue,
	            "margin-bottom": "12px",
	        }, ".secure-payment-form .installment-button-explore-plans:hover": {
	            background: customColors.azure31Blue,
	        }, ".secure-payment-form .installment-button-explore-plans:active": {
	            background: customColors.azure61LightBlue,
	        }, ".secure-payment-form .installment-button-explore-plans:focus": {
	            background: customColors.azure25Blue,
	            border: "2px solid " + customColors.azure76LightBlue,
	        }, ".secure-payment-form .installment-button-learn-more": {
	            background: 'none',
	            color: customColors.coolGrey25,
	            "font-weight": "400",
	            "font-size": "regular",
	            "line-height": "21px",
	            "margin": "0 0",
	        }, ".secure-payment-form .installment-button-learn-more::after": {
	            content: "url(\"" + imageBase + "info.svg\")",
	            "padding-top": "7px",
	            filter: " grayscale(1)",
	        }, ".secure-payment-form .installment-button-learn-more:hover": {
	            color: customColors.azure39Blue,
	        }, ".secure-payment-form .installment-button-learn-more:active": {
	            color: customColors.coolGrey61,
	        }, ".secure-payment-form .installment-button-learn-more:focus": {
	            color: customColors.coolGrey61,
	            border: "1px solid " + customColors.azure76LightBlue,
	        }, ".secure-payment-form .installment-button-month-term": {
	            background: customColors.azure39Blue,
	            width: "40px",
	            height: "40px",
	            "font-weight": "700",
	            margin: "15px 10px",
	        }, ".secure-payment-form .installment-unselected": {
	            background: customColors.warmGrey95,
	            color: customColors.warmGreyBase,
	        }, ".secure-payment-form .installment-unselected:hover": {
	            border: "2px solid " + customColors.azure76LightBlue,
	        }, ".secure-payment-form .installment-button-pay": {
	            background: customColors.azure25Blue,
	            height: "47px",
	            padding: "10px 28px",
	        }, ".secure-payment-form .installment-button-pay:hover": {
	            background: customColors.azure31Blue,
	        }, ".secure-payment-form .installment-button-pay:active": {
	            background: customColors.azure61LightBlue,
	        }, ".secure-payment-form .installment-button-pay:focus": {
	            background: customColors.azure25Blue,
	            border: "2px solid " + customColors.azure76LightBlue,
	        }, ".secure-payment-form .installment-button-pay::before": {
	            content: "url(\"" + imageBase + "gp-lock-alt.svg\")",
	            "margin-right": "5px",
	        }, ".secure-payment-form .provided-by": {
	            "font-style": "normal",
	            "font-weight": "400",
	            "font-size": "12.64px",
	            "line-height": "19px",
	            color: customColors.coolGreyBase,
	            margin: "5px 0",
	        }, 
	        // Dialog content styles
	        ".secure-payment-form .installment-learn-more-content": {
	            width: "408px",
	        }, ".secure-payment-form .installment-learn-more-header": {
	            display: "flex",
	            padding: "28px",
	            "justify-content": "space-between",
	            "align-items": "flex-start",
	            background: customColors.azure61LightBlue,
	        }, ".secure-payment-form .installment-learn-more-header-title": {
	            "font-style": "normal",
	            "font-size": "1.125em",
	            "line-height": "27px",
	            color: "#FFFFFF",
	        }, ".secure-payment-form .installment-learn-more-body": {
	            display: "flex",
	            margin: "0px 24px 28px 24px",
	            "flex-direction": "column",
	            "align-items": "center",
	        }, ".secure-payment-form .installment-learn-more-body ul": {
	            color: customColors.coolGrey25,
	            "font-style": "regular",
	            "font-weight": "400",
	            "line-height": "24px",
	            padding: " 0px 20px",
	            "margin-top": "28px",
	        }, ".secure-payment-form .installment-learn-more-link": {
	            color: customColors.coolGrey25,
	            "font-style": "normal",
	            "font-weight": "400",
	            "line-height": "21px",
	            "text-decoration-line": "underline",
	            margin: "12px 0",
	        }, ".secure-payment-form .installment-button-close": {
	            background: "none",
	            border: "none",
	            padding: "0px",
	            cursor: "pointer",
	        }, ".secure-payment-form .installment-button-close::after": {
	            content: "url(\"" + imageBase + "cross-grey.svg\")",
	        }, ".secure-payment-form .term-and-condition-title": {
	            display: "flex",
	            "align-items": "center",
	            "font-style": "normal",
	            "font-weight": "700",
	        }, ".secure-payment-form .term-and-condition-title::before": {
	            content: "url(\"" + imageBase + "info-circle.svg\")",
	            "margin-right": "5px",
	        }, ".secure-payment-form .term-and-condition-link": {
	            color: customColors.azure61LightBlue,
	            "font-style": "normal",
	            "font-weight": "400",
	            "line-height": "19px",
	            "text-decoration-line": "underline",
	        } }, styles$3());
	};

	var styles$5 = function (assetBaseUrl) {
	    return __assign({}, styles$4(assetBaseUrl));
	};

	// tslint:disable:object-literal-key-quotes
	// tslint:disable:object-literal-sort-keys
	var fieldStyles$1 = function (assetBaseUrl) {
	    var imageBase = assetBaseUrl + "images/";
	    return {
	        "*": {
	            "box-sizing": "border-box",
	        },
	        "::-webkit-input-placeholder": {
	            color: "#767676",
	        },
	        "::-ms-input-placeholder": {
	            color: "#767676",
	        },
	        "::-moz-input-placeholder": {
	            color: "#767676",
	            opacity: 1,
	        },
	        ":-moz-input-placeholder": {
	            color: "#9296A5",
	            opacity: 1,
	        },
	        ":-moz-placeholder": {
	            color: "#767676",
	            opacity: "1",
	        },
	        "::-moz-placeholder": {
	            color: "#767676",
	            opacity: "1"
	        },
	        "#secure-payment-field": {
	            width: "100%",
	            height: "40px",
	            padding: "12px",
	            border: "1px solid #5a5e6d",
	            "border-radius": "0",
	            "font-size": "0.89em",
	            "font-weight": "400",
	            color: "#394046",
	        },
	        "#secure-payment-field:focus": {
	            border: "1px solid #2B9AEC",
	            outline: "none",
	        },
	        "#secure-payment-field:hover": {
	            border: "1px solid #2B9AEC",
	            outline: "none",
	        },
	        "#secure-payment-field[type=button]": {
	            "background-color": "#0071ba",
	            color: "white",
	            padding: "8px",
	            border: "none",
	            width: "100%",
	            "border-radius": "2px",
	            cursor: "pointer",
	            "font-size": "1.125em",
	            "font-weight": "500",
	            height: "48px",
	            "text-align": "center",
	            "vertical-align": "middle",
	            "text-transform": "uppercase"
	        },
	        "#secure-payment-field[type=button]:focus": {
	            border: "2px solid #08385b",
	            outline: "none",
	        },
	        "#secure-payment-field[type=button]:hover": {
	            "background-color": "#015a94",
	        },
	        "#secure-payment-field[type=button]::before": {
	            content: "url(\"" + imageBase + "gp-lock.svg\")",
	            "margin-right": "5px",
	        },
	        ".card-cvv": {
	            background: "transparent url(" + imageBase + "cvv.png) no-repeat right 10px center",
	            "background-size": "20px",
	        },
	        ".card-cvv.card-type-amex": {
	            "background-image": "url(" + imageBase + "cvv-amex.png)",
	        },
	        "img.card-number-icon": {
	            background: "transparent url(" + imageBase + "gp-cc-generic.svg) no-repeat right center",
	            right: "10px",
	            top: "50%",
	            width: "24px",
	            height: "16px",
	            "margin-top": "-8px",
	            "background-size": "20px",
	        },
	        "img.card-number-icon.card-type-amex": {
	            "background-image": "url(" + imageBase + "gp-cc-amex.svg)",
	        },
	        "img.card-number-icon.card-type-discover": {
	            "background-image": "url(" + imageBase + "gp-cc-discover.svg)",
	        },
	        "img.card-number-icon.card-type-jcb": {
	            "background-image": "url(" + imageBase + "gp-cc-jcb.svg)",
	        },
	        "img.card-number-icon.card-type-mastercard": {
	            "background-image": "url(" + imageBase + "gp-cc-mastercard.svg)",
	        },
	        "img.card-number-icon.card-type-visa": {
	            "background-image": "url(" + imageBase + "gp-cc-visa.svg)",
	        },
	        "img.card-number-icon.card-type-diners": {
	            "background-image": "url(" + imageBase + "gp-cc-diners.svg)",
	        },
	        ".card-number::-ms-clear": {
	            display: "none",
	        },
	    };
	};
	var parentStyles$1 = function (assetBaseUrl) {
	    var imageBase = assetBaseUrl + "images/";
	    var fontBase = assetBaseUrl + "fonts/";
	    return __assign(__assign(__assign(__assign({ ".secure-payment-form": {
	            display: "flex",
	            "-ms-flex-wrap": "wrap",
	            "flex-wrap": "wrap",
	        }, ".secure-payment-form *": {
	            "box-sizing": "border-box",
	        }, ".secure-payment-form label": {
	            margin: "16px 0",
	            display: "block",
	            "font-size": "0.79em",
	            "font-weight": "500",
	            "font-family": "GPCommerce"
	        }, ".secure-payment-form > div": {
	            flex: "100%",
	        }, ".secure-payment-form .credit-card-card-cvv iframe": {
	            width: "90%",
	            float: "left",
	        }, ".secure-payment-form div[class$='-shield']": {
	            flex: "1 1 auto",
	            "margin-right": "16px"
	        }, ".secure-payment-form div[class$='-shield'] .ssl-text-logo": {
	            border: "1px solid #468000",
	            "border-radius": "3px",
	            width: "89px",
	            height: "26px",
	            "text-align": "center",
	            margin: "0"
	        }, ".secure-payment-form div[class$='-shield'] .ssl-logo_ico": {
	            width: "19px",
	            height: "18px",
	            "margin-top": "1px",
	            "vertical-align": "middle"
	        }, ".secure-payment-form div[class$='-shield'] .ssl-msg": {
	            "font-size": "8px",
	            "font-weight": "600",
	            "font-family": "Open sans,sans-serif",
	            color: "#468000",
	            "line-height": "9px",
	            display: "inline-block",
	            "vertical-align": "middle",
	            "text-align": "center",
	            "margin-left": "6px",
	            "margin-right": "7px",
	            "margin-top": "1px"
	        }, ".secure-payment-form div[class$='-logo']": {
	            flex: "1 1 auto",
	            "margin-left": "16px",
	            width: "100px",
	            height: "23px",
	            "text-align": "right"
	        }, ".secure-payment-form div[class$='-logo'] .security-msg": {
	            color: "#707689",
	            "font-size": "8px",
	            display: "inline-block",
	            "vertical-align": "middle",
	            "margin-right": "2px"
	        }, ".secure-payment-form div[class$='-logo'] img": {
	            "vertical-align": "middle"
	        }, ".secure-payment-form .credit-card-submit": {
	            margin: "32px 0 16px 0",
	        }, ".secure-payment-form iframe": {
	            "min-height": "40px",
	            width: "100%",
	        }, ".secure-payment-form .tooltip": {
	            position: "relative",
	            width: "10%",
	            height: "40px",
	            border: "1px solid #5a5e6d",
	            "border-left": "none",
	            color: "#474B57",
	            float: "right",
	            "background-size": "20px",
	            background: "transparent url(" + imageBase + "gp-fa-question-circle.svg) no-repeat center center",
	        }, ".secure-payment-form .tooltip:focus": {
	            border: "1px solid #2B9AEC",
	            outline: "none",
	        }, ".secure-payment-form .tooltip:hover": {
	            border: "1px solid #2B9AEC",
	            outline: "none",
	        }, ".secure-payment-form .tooltip-content": {
	            visibility: "hidden",
	            width: "200px",
	            "background-color": "#fff",
	            color: "#474B57",
	            "text-align": "left",
	            "border-radius": "3px",
	            border: "solid 1px #5a5e6d",
	            padding: "8px 8px",
	            position: "absolute",
	            "z-index": "99999999",
	            right: "70%",
	            opacity: "0",
	            transition: "opacity 0.3s",
	            "font-size": "0.79em",
	            "font-weight": "400",
	            "margin-top": "30px",
	            overflow: "hidden",
	            "box-shadow": "0 3px 6px rgba(0, 0, 0, 0.1)",
	        }, ".secure-payment-form .tooltip:hover > .tooltip-content": {
	            visibility: "visible",
	            opacity: "1",
	        }, ".secure-payment-form .tooltip:focus > .tooltip-content": {
	            visibility: "visible",
	            opacity: "1",
	        }, ".secure-payment-form .other-cards-label": {
	            "border-bottom": "1px solid #5a5e6d",
	            "text-align": "center",
	            margin: "40px 0 20px",
	            position: "relative",
	        }, ".secure-payment-form .other-cards-label span": {
	            "text-align": "center",
	            padding: "0 10px",
	            background: "#fff",
	            position: "absolute",
	            color: "#9296A5",
	            width: "auto",
	            left: "50%",
	            "-webkit-transform": "translateX(-50%)",
	            "-moz-transform": "translateX(-50%)",
	            "-ms-transform": "translateX(-50%)",
	            "-o-transform": "translateX(-50%)",
	            transform: "translateX(-50%)",
	            margin: "-10px auto",
	            "font-family": "GPCommerce",
	            "font-size": "16px",
	            "white-space": "nowrap",
	        }, ".secure-payment-form .hidden": {
	            display: "none!important",
	        }, "@font-face": {
	            "font-family": "GPCommerce",
	            src: "url(\"" + fontBase + "GPCommerce-Regular.woff2\") format(\"woff2\")",
	        }, "@media(min-width: 800px)": {
	            ".secure-payment-form .credit-card-card-expiration": {
	                flex: "1 1 auto",
	                "margin-right": "16px",
	            },
	            ".secure-payment-form .credit-card-card-cvv": {
	                flex: "1 1 auto",
	                "margin-left": "16px",
	            },
	        } }, styles$5(assetBaseUrl)), styles()), styles$1(assetBaseUrl)), styles$2());
	};

	// tslint:disable:object-literal-key-quotes
	var fieldStyles$2 = function (assetBaseUrl) {
	    var imageBase = assetBaseUrl + "images/";
	    return {
	        html: {
	            "font-size": "62.5%",
	        },
	        body: {
	            "font-size": "1.4rem",
	        },
	        "#secure-payment-field-wrapper": {
	            postition: "relative",
	        },
	        "#secure-payment-field": {
	            "-o-transition": "border-color ease-in-out .15s,box-shadow ease-in-out .15s",
	            "-webkit-box-shadow": "inset 0 1px 1px rgba(0,0,0,.075)",
	            "-webkit-transition": "border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s",
	            "background-color": "#fff",
	            border: "1px solid #cecece",
	            "border-radius": "2px",
	            "box-shadow": "none",
	            "box-sizing": "border-box",
	            display: "block",
	            "font-family": "Roboto, sans-serif",
	            "font-size": "11px",
	            "font-smoothing": "antialiased",
	            height: "35px",
	            margin: "5px 0 10px 0",
	            "max-width": "100%",
	            outline: "0",
	            padding: "0 10px",
	            transition: "border-color ease-in-out .15s,box-shadow ease-in-out .15s",
	            "vertical-align": "baseline",
	            width: "100%",
	        },
	        "#secure-payment-field:focus": {
	            border: "1px solid lightblue",
	            "box-shadow": "0 1px 3px 0 #cecece",
	            outline: "none",
	        },
	        "#secure-payment-field[type=button]": {
	            "text-align": "center",
	            "text-transform": "none",
	            "white-space": "nowrap",
	        },
	        "#secure-payment-field[type=button]:focus": {
	            outline: "none",
	        },
	        ".card-cvv": {
	            background: "transparent url(" + imageBase + "/cvv.png) no-repeat right",
	            "background-size": "60px",
	        },
	        ".card-cvv.card-type-amex": {
	            background: "transparent url(" + imageBase + "/cvv-amex.png) no-repeat right",
	            "background-size": "60px",
	        },
	        "img.card-number-icon": {
	            background: "transparent url(" + imageBase + "logo-unknown@2x.png) no-repeat",
	            "background-size": "100%",
	            width: "60px",
	            height: "30px",
	            right: "0",
	            top: "50%",
	            "margin-top": "-21px",
	            "background-position": "50% 50%"
	        },
	        "img.card-number-icon[src$='/gp-cc-generic.svg']": {
	            background: "transparent url(" + imageBase + "logo-mastercard@2x.png) no-repeat",
	            "background-size": "120%",
	            "background-position-y": "bottom"
	        },
	        "img.card-number-icon.invalid.card-type-amex": {
	            background: "transparent url(" + imageBase + "logo-amex@2x.png) no-repeat 100%",
	            "background-size": "60%",
	            "background-position-y": "88%"
	        },
	        "img.card-number-icon.invalid.card-type-discover": {
	            background: "transparent url(" + imageBase + "logo-discover@2x.png) no-repeat",
	            "background-size": "115%",
	            "background-position-y": "88%",
	            width: "80px",
	            right: "5px"
	        },
	        "img.card-number-icon.invalid.card-type-jcb": {
	            background: "transparent url(" + imageBase + "logo-jcb@2x.png) no-repeat 105%",
	            "background-size": "75%",
	            "background-position-y": "85%"
	        },
	        "img.card-number-icon.invalid.card-type-mastercard": {
	            background: "transparent url(" + imageBase + "logo-mastercard@2x.png) no-repeat",
	            "background-size": "100%",
	            "background-position": "6px 99%"
	        },
	        "img.card-number-icon.invalid.card-type-visa": {
	            background: "transparent url(" + imageBase + "logo-visa@2x.png) no-repeat ",
	            "background-size": "120%",
	            "background-position": "-4px 91%"
	        },
	        "img.card-number-icon.valid.card-type-amex": {
	            background: "transparent url(" + imageBase + "logo-amex@2x.png) no-repeat 100%",
	            "background-size": "60%",
	            "background-position-y": "-3px"
	        },
	        "img.card-number-icon.valid.card-type-discover": {
	            background: "transparent url(" + imageBase + "logo-discover@2x.png) no-repeat",
	            "background-size": "115%",
	            "background-position-y": "-10px",
	            width: "80px",
	            right: "5px"
	        },
	        "img.card-number-icon.valid.card-type-jcb": {
	            background: "transparent url(" + imageBase + "logo-jcb@2x.png) no-repeat 105%",
	            "background-size": "75%",
	            "background-position-y": "-5px"
	        },
	        "img.card-number-icon.valid.card-type-mastercard": {
	            background: "transparent url(" + imageBase + "logo-mastercard@2x.png) no-repeat",
	            "background-size": "100%",
	            "background-position": "6px -1px"
	        },
	        "img.card-number-icon.valid.card-type-visa": {
	            background: "transparent url(" + imageBase + "logo-visa@2x.png) no-repeat",
	            "background-size": "120%",
	            "background-position": "-4px -4px"
	        },
	        ".card-number::-ms-clear": {
	            display: "none",
	        },
	        "input[placeholder]": {
	            "letter-spacing": ".5px",
	        },
	    };
	};
	var parentStyles$2 = function (assetBaseUrl) {
	    var imageBase = assetBaseUrl + "images/";
	    return __assign(__assign(__assign({ ".secure-payment-form": {
	            "font-family": "sans-serif",
	            width: "300px",
	        }, ".secure-payment-form label": {
	            color: "#555",
	            "font-size": "13px",
	            "font-weight": "bold",
	            "line-height": "1.5",
	            "text-transform": "uppercase",
	        }, ".secure-payment-form #ss-banner": {
	            background: "transparent url(" + imageBase + "/shield-and-logos@2x.png) no-repeat left center",
	            "background-size": "280px 34px",
	            height: "40px",
	            "margin-bottom": "7px",
	        }, ".secure-payment-form div[class$='-shield']": {
	            flex: "1 1 auto",
	            "margin-right": "16px",
	            float: "left"
	        }, ".secure-payment-form div[class$='-shield'] .ssl-text-logo": {
	            border: "1px solid #468000",
	            "border-radius": "3px",
	            width: "89px",
	            height: "26px",
	            "text-align": "center",
	            margin: "0"
	        }, ".secure-payment-form div[class$='-shield'] .ssl-logo_ico": {
	            width: "19px",
	            height: "18px",
	            "margin-top": "1px",
	            "vertical-align": "middle"
	        }, ".secure-payment-form div[class$='-shield'] .ssl-msg": {
	            "font-size": "8px",
	            "font-weight": "600",
	            "font-family": "Open sans,sans-serif",
	            color: "#468000",
	            "line-height": "9px",
	            display: "inline-block",
	            "vertical-align": "middle",
	            "text-align": "center",
	            "margin-left": "6px",
	            "margin-right": "7px",
	            "margin-top": "1px"
	        }, ".secure-payment-form div[class$='-logo']": {
	            flex: "1 1 auto",
	            "margin-left": "16px",
	            width: "110px",
	            height: "23px",
	            "text-align": "right",
	            float: "right"
	        }, ".secure-payment-form div[class$='-logo'] .security-msg": {
	            color: "#707689",
	            "font-size": "8px",
	            display: "inline-block",
	            "vertical-align": "middle",
	            "margin-right": "2px"
	        }, ".secure-payment-form div[class$='-logo'] img": {
	            "vertical-align": "middle"
	        }, ".secure-payment-form div": {
	            display: "block",
	        }, ".secure-payment-form iframe": {
	            "min-height": "3.6rem",
	        }, ".secure-payment-form .form-row": {
	            "margin-top": "10px",
	        }, ".secure-payment-form .form-wrapper": {
	            display: "block",
	            margin: "10px auto",
	        }, ".secure-payment-form input": fieldStyles$2(assetBaseUrl)["#secure-payment-field"], ".secure-payment-form input:focus": fieldStyles$2(assetBaseUrl)["#secure-payment-field:focus"], ".secure-payment-form .tooltip, .secure-payment-form .tooltip-content": {
	            display: "none",
	        }, ".secure-payment-form .other-cards-label": {
	            "border-bottom": "1px solid #BCBFC8",
	            "text-align": "center",
	            margin: "20px 0 20px",
	            position: "relative",
	        }, ".secure-payment-form .other-cards-label span": {
	            "text-align": "center",
	            padding: "0 10px",
	            background: "#fff",
	            position: "absolute",
	            color: "#9296A5",
	            width: "auto",
	            left: "50%",
	            "-webkit-transform": "translateX(-50%)",
	            "-moz-transform": "translateX(-50%)",
	            "-ms-transform": "translateX(-50%)",
	            "-o-transform": "translateX(-50%)",
	            transform: "translateX(-50%)",
	            margin: "-10px auto",
	            "font-family": "GPCommerce",
	            "font-size": "16px",
	            "white-space": "nowrap",
	        }, ".secure-payment-form .hidden": {
	            display: "none!important",
	        } }, styles()), styles$1(assetBaseUrl)), styles$2());
	};

	var buildUrl = (function (queryString) {
	    var gateway = getGateway();
	    if (!gateway) {
	        return "";
	    }
	    var base = gateway.urls.tokenization(gateway.getEnv(options) === "production");
	    if (!queryString) {
	        return base;
	    }
	    var query = "?";
	    for (var param in queryString) {
	        if (queryString.hasOwnProperty(param) && queryString[param]) {
	            query += param + "=" + encodeURIComponent(queryString[param]) + "&";
	        }
	    }
	    return base + query;
	});

	var tokenize = (function (data) {
	    var gateway = getGateway();
	    if (!gateway) {
	        return Promise.reject({
	            error: true,
	            reasons: [
	                { code: "INVALID_CONFIGURATION", message: "no gateway available" },
	            ],
	        });
	    }
	    var errors = gateway.actions.validateData(data);
	    if (errors.length > 0) {
	        return Promise.reject({ error: true, reasons: errors });
	    }
	    if (options.webApiKey) {
	        data.webApiKey = options.webApiKey;
	    }
	    if (gateway.supports.binCheck &&
	        gateway.supports.binCheck.hsaFsa &&
	        options.binCheck &&
	        options.binCheck.hsaFsa) {
	        data["bin-check-hsafsa"] = true;
	    }
	    if (gateway.supports.binCheck &&
	        gateway.supports.binCheck.surcharge &&
	        options.binCheck &&
	        options.binCheck.surcharge) {
	        data["bin-check-surcharge"] = true;
	    }
	    return new Promise(function (resolve, reject) {
	        var query;
	        if (gateway.requiredSettings.indexOf("publicApiKey") !== -1) {
	            query = {
	                api_key: options.publicApiKey,
	            };
	        }
	        gateway.actions
	            .tokenize(buildUrl(query), options.env || "", data)
	            .then(gateway.actions.normalizeResponse)
	            .then(function (resp) {
	            if (resp.error) {
	                reject(resp);
	                return;
	            }
	            resp = resp;
	            if (gateway.requiredSettings.indexOf("X-GP-Api-Key") !== -1) {
	                resolve(resp);
	                return;
	            }
	            if (data["card-number"]) {
	                var cardNumber = data["card-number"].replace(/\D/g, "");
	                var bin = cardNumber.substr(0, 6);
	                var last4 = cardNumber.substr(-4);
	                var type = typeByNumber(cardNumber);
	                resp.details = resp.details || {};
	                resp.details.cardNumber =
	                    bin + "*".repeat(cardNumber.length - 10) + last4;
	                resp.details.cardBin = bin;
	                resp.details.cardLast4 = last4;
	                resp.details.cardType = type ? type.code : "unknown";
	                resp.details.cardSecurityCode = !!data["card-cvv"];
	            }
	            if (data["card-expiration"] &&
	                data["card-expiration"].indexOf(" / ") !== -1) {
	                var exp = data["card-expiration"].split(" / ");
	                resp.details = resp.details || {};
	                resp.details.expiryMonth = exp[0] || "";
	                resp.details.expiryYear = exp[1] || "";
	            }
	            if (data["card-holder-name"]) {
	                resp.details = resp.details || {};
	                // matches PaymentRequest spec naming for cardholder name
	                resp.details.cardholderName =
	                    resp.details.cardholderName || data["card-holder-name"];
	            }
	            if (data["card-track"]) {
	                var cardTrack = data["card-track"];
	                var type = typeByTrack(cardTrack);
	                resp.details = resp.details || {};
	                resp.details.cardType = type ? type.code : "unknown";
	            }
	            if (data["account-number"]) {
	                var accountNumber = data["account-number"].replace(/\D/g, "");
	                var last4 = accountNumber.substr(-4);
	                resp.details = resp.details || {};
	                resp.details.accountNumber =
	                    "*".repeat(accountNumber.length - 4) + last4;
	                resp.details.accountLast4 = last4;
	            }
	            resolve(resp);
	        })["catch"](reject);
	    });
	});

	// Holds global state and functions for managing iframe
	var bus = new lib.EventEmitter();

	var internal = /*#__PURE__*/Object.freeze({
		__proto__: null,
		bus: bus,
		tokenize: tokenize,
		loadedFrames: loadedFrames,
		options: options,
		postMessage: postMessage
	});

	var CardNumber = /** @class */ (function () {
	    function CardNumber() {
	    }
	    CardNumber.prototype.format = function (cardNumber) {
	        cardNumber = cardNumber.replace(/\D/g, "");
	        var type = typeByNumber(cardNumber);
	        if (!type) {
	            return cardNumber;
	        }
	        var matches = cardNumber.match(type.format);
	        if (!matches) {
	            return cardNumber;
	        }
	        if (!type.format.global) {
	            matches.shift();
	        }
	        return matches.join(" ").replace(/^\s+|\s+$/gm, "");
	    };
	    return CardNumber;
	}());

	var Expiration = /** @class */ (function () {
	    function Expiration() {
	    }
	    Expiration.prototype.format = function (exp, final) {
	        if (final === void 0) { final = false; }
	        var pat = /^\D*(\d{1,2})(\D+)?(\d{1,4})?/;
	        var groups = exp.match(pat);
	        var month;
	        var del;
	        var year;
	        if (!groups) {
	            return "";
	        }
	        month = groups[1] || "";
	        del = groups[2] || "";
	        year = groups[3] || "";
	        if (year.length > 0) {
	            del = " / ";
	        }
	        else if (month.length === 2 || del.length > 0) {
	            del = " / ";
	        }
	        else if (month.length === 1 && month !== "0" && month !== "1") {
	            del = " / ";
	        }
	        if (month.length === 1 && del !== "") {
	            month = "0" + month;
	        }
	        if (final && year.length === 2) {
	            year = new Date().getFullYear().toString().slice(0, 2) + year;
	        }
	        return month + del + year;
	    };
	    return Expiration;
	}());

	var CardNumber$1 = /** @class */ (function () {
	    function CardNumber() {
	    }
	    CardNumber.prototype.validate = function (cardNumber) {
	        if (!cardNumber) {
	            return false;
	        }
	        cardNumber = cardNumber.replace(/[-\s]/g, "");
	        var type = typeByNumber(cardNumber);
	        if (!type) {
	            return false;
	        }
	        return (luhnCheck(cardNumber) && type.lengths.indexOf(cardNumber.length) !== -1);
	    };
	    return CardNumber;
	}());

	var Cvv = /** @class */ (function () {
	    function Cvv() {
	    }
	    Cvv.prototype.validate = function (cvv, isAmex) {
	        if (!cvv) {
	            return false;
	        }
	        cvv = cvv.replace(/^\s+|\s+$/g, "");
	        if (!/^\d+$/.test(cvv)) {
	            return false;
	        }
	        if (typeof isAmex !== "undefined" && isAmex === true) {
	            return cvv.length === 4;
	        }
	        if (typeof isAmex !== "undefined" && isAmex === false) {
	            return cvv.length === 3;
	        }
	        return 3 <= cvv.length && cvv.length <= 4;
	    };
	    return Cvv;
	}());

	var Expiration$1 = /** @class */ (function () {
	    function Expiration() {
	    }
	    Expiration.prototype.validate = function (exp) {
	        var m;
	        var y;
	        if (!exp) {
	            return false;
	        }
	        var split = exp.split("/");
	        m = split[0], y = split[1];
	        if (!m || !y) {
	            return false;
	        }
	        m = m.replace(/^\s+|\s+$/g, "");
	        y = y.replace(/^\s+|\s+$/g, "");
	        if (!/^\d+$/.test(m)) {
	            return false;
	        }
	        if (!/^\d+$/.test(y)) {
	            return false;
	        }
	        if (y.length === 2) {
	            y = new Date().getFullYear().toString().slice(0, 2) + y;
	        }
	        var month = parseInt(m, 10);
	        var year = parseInt(y, 10);
	        if (!(1 <= month && month <= 12)) {
	            return false;
	        }
	        // creates date as 1 day past end of
	        // expiration month since JS months
	        // are 0 indexed
	        return new Date(year, month, 1) > new Date();
	    };
	    return Expiration;
	}());

	var Ev = /** @class */ (function () {
	    function Ev() {
	    }
	    Ev.listen = function (node, eventName, callback) {
	        if (document.addEventListener !== undefined) {
	            node.addEventListener(eventName, callback, false);
	        }
	        else {
	            if (node === document) {
	                document.documentElement.attachEvent("onpropertychange", function (e) {
	                    if (e.propertyName === eventName) {
	                        callback(e);
	                    }
	                });
	            }
	            else {
	                node.attachEvent("on" + eventName, callback);
	            }
	        }
	    };
	    Ev.trigger = function (node, eventName) {
	        if (document.createEvent !== undefined) {
	            var event_1 = document.createEvent("Event");
	            event_1.initEvent(eventName, true, true);
	            node.dispatchEvent(event_1);
	        }
	        else {
	            document.documentElement[eventName]++;
	        }
	    };
	    Ev.ignore = function (eventName, callback) {
	        if (document.removeEventListener !== undefined) {
	            document.removeEventListener(eventName, callback, false);
	        }
	        else {
	            document.documentElement.detachEvent("onpropertychange", function (e) {
	                if (e.propertyName === eventName) {
	                    callback(e);
	                }
	            });
	        }
	    };
	    return Ev;
	}());

	/**
	 * Provides integrators helper functions for working with events.
	 */
	var Events = /** @class */ (function () {
	    function Events() {
	    }
	    /**
	     * addHandler
	     *
	     * Adds an `event` handler for a given `target` element.
	     *
	     * @param target
	     * @param event
	     * @param callback
	     */
	    Events.addHandler = function (target, event, callback) {
	        var node;
	        if (typeof target === "string") {
	            node = document.getElementById(target);
	        }
	        else {
	            node = target;
	        }
	        if (!node) {
	            return;
	        }
	        if (document.addEventListener !== undefined) {
	            node.addEventListener(event, callback, false);
	        }
	        else {
	            Ev.listen(node, event, callback);
	        }
	    };
	    /**
	     * removeHandler
	     *
	     * Removes an `event` handler for a given `target` element.
	     *
	     * @param target
	     * @param event
	     * @param callback
	     */
	    Events.removeHandler = function (target, event, callback) {
	        var node;
	        if (typeof target === "string") {
	            node = document.getElementById(target);
	        }
	        else {
	            node = target;
	        }
	        if (!node) {
	            return;
	        }
	        if (document.removeEventListener !== undefined) {
	            node.removeEventListener(event, callback, false);
	        }
	        else {
	            Ev.ignore(event, callback);
	        }
	    };
	    /**
	     * trigger
	     *
	     * Fires off an `event` for a given `target` element.
	     *
	     * @param name
	     * @param target
	     */
	    Events.trigger = function (name, target) {
	        if (document.createEvent) {
	            var event_1 = document.createEvent("Event");
	            event_1.initEvent(name, true, true);
	            target.dispatchEvent(event_1);
	        }
	        else {
	            Ev.trigger(target, name);
	        }
	    };
	    return Events;
	}());

	var InstallmentEvents;
	(function (InstallmentEvents) {
	    InstallmentEvents["CardInstallmentsFieldValidated"] = "card-installments-field-validated";
	    InstallmentEvents["CardInstallmentsRequestStart"] = "card-installments-request-start";
	    InstallmentEvents["CardInstallmentsRequestCompleted"] = "card-installments-request-completed";
	    InstallmentEvents["CardInstallmentsRequestFailed"] = "card-installments-request-failed";
	    InstallmentEvents["CardInstallmentsHide"] = "card-installments-hide";
	    InstallmentEvents["CardInstallmentsRequestData"] = "card-installments-request-data";
	    InstallmentEvents["CardInstallmentsPassData"] = "card-installments-pass-data";
	    InstallmentEvents["CardInstallmentsAccumulateData"] = "card-installments-accumulate-data";
	})(InstallmentEvents || (InstallmentEvents = {}));
	var InstallmentAvailableStatus;
	(function (InstallmentAvailableStatus) {
	    InstallmentAvailableStatus["Available"] = "AVAILABLE";
	    InstallmentAvailableStatus["NotAvailable"] = "NOT_AVAILABLE";
	})(InstallmentAvailableStatus || (InstallmentAvailableStatus = {}));
	var InstallmentTermModes;
	(function (InstallmentTermModes) {
	    InstallmentTermModes["APR"] = "APR";
	    InstallmentTermModes["FEE"] = "FEE";
	})(InstallmentTermModes || (InstallmentTermModes = {}));

	var Card = /** @class */ (function () {
	    function Card() {
	    }
	    /**
	     * addType
	     *
	     * Adds a class to the target element with the card type
	     * inferred from the target"s current value.
	     *
	     * @param e
	     */
	    Card.addType = function (e) {
	        var _a;
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var type = typeByNumber(target.value);
	        var classList = target.className.split(" ");
	        var length = classList.length;
	        var assetBaseUrl$1 = assetBaseUrl();
	        var icon = (_a = target.parentNode) === null || _a === void 0 ? void 0 : _a.querySelector('img');
	        var i = 0;
	        var c = "";
	        for (i; i < length; i++) {
	            c = classList[i];
	            if (c && c.indexOf("card-type-") !== -1) {
	                delete classList[i];
	            }
	        }
	        var id = target.getAttribute("data-id");
	        if (type) {
	            classList.push("card-type-" + type.code);
	            classList = classList.filter(function (str) { return str !== ''; });
	            if (id) {
	                postMessage.post({
	                    data: { cardType: type.code },
	                    id: id,
	                    type: "ui:iframe-field:card-type",
	                }, "parent");
	            }
	            if (icon) {
	                icon.setAttribute('alt', type.code.charAt(0).toUpperCase() + type.code.slice(1) + " Card");
	            }
	            else {
	                icon.setAttribute('alt', 'Generic Card');
	            }
	        }
	        else {
	            icon.setAttribute('alt', 'Generic Card');
	        }
	        classList = classList.filter(function (str) { return str !== ''; });
	        var classListIcon = classList.filter(function (str) { return (str !== '' && str !== 'card-number'); });
	        icon.className = classListIcon.join(" ");
	        icon.classList.add('card-number-icon');
	        target.className = classList.join(" ");
	    };
	    /**
	     * formatNumber
	     *
	     * Formats a target element"s value based on the
	     * inferred card type"s formatting regex.
	     *
	     * @param e
	     */
	    Card.formatNumber = function (e) {
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var value = target.value;
	        var prevAction = target.getAttribute("data-prev");
	        target.setAttribute("data-prev", "" + e.keyCode);
	        // If the previous action was with the backespace key, we should let the cursor on the same place
	        if (prevAction === "8") {
	            return;
	        }
	        if (value.length === 0) {
	            return;
	        }
	        var formatted = new CardNumber().format(value);
	        target.value = formatted;
	        if (!target.setSelectionRange) {
	            return;
	        }
	        var cursor = target.selectionStart || 0;
	        // copy and paste, space inserted on formatter
	        if (value.length < formatted.length) {
	            cursor += formatted.length - value.length;
	        }
	        // check if before new inserted digit is a space
	        if (value.charAt(cursor) === " " && formatted.charAt(cursor - 1) === " ") {
	            cursor += 1;
	        }
	        // allow backspace
	        if (e.keyCode === 8) {
	            cursor = target.selectionStart || cursor;
	        }
	        target.setSelectionRange(cursor, cursor);
	    };
	    /**
	     * formatExpiration
	     *
	     * Formats a target element"s value.
	     *
	     * @param e
	     */
	    Card.formatExpiration = function (e) {
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var value = target.value;
	        // allow: delete, backspace
	        if ([46, 8].indexOf(e.keyCode) !== -1 ||
	            // allow: Ctrl+V
	            (e.keyCode === 86 && e.ctrlKey === true) ||
	            // allow: home, end, left, right
	            (e.keyCode >= 35 && e.keyCode <= 39) ||
	            // allow: weird Android/Chrome issue
	            e.keyCode === 229) {
	            return;
	        }
	        // used for triggering the keyup event on safari
	        var isSafari = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
	        target.value = new Expiration().format(value, e.type === "blur" || (e.type === "keyup" && target !== document.activeElement && isSafari));
	    };
	    /**
	     * restrictLength
	     *
	     * Restricts input in a target element to a
	     * certain length data.
	     *
	     * @param length
	     */
	    Card.restrictLength = function (length) {
	        return function (e) {
	            var target = (e.currentTarget
	                ? e.currentTarget
	                : e.srcElement);
	            var value = target.value;
	            // allow: backspace, delete, tab, escape, ctrl and enter
	            if ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
	                // allow: Ctrl+A
	                (e.keyCode === 65 && e.ctrlKey === true) ||
	                // allow: Ctrl+V
	                (e.keyCode === 86 && e.ctrlKey === true) ||
	                // allow: home, end, left, right
	                (e.keyCode >= 35 && e.keyCode <= 39)) {
	                // let it happen, don"t do anything
	                return;
	            }
	            if (value.length >= length) {
	                e.preventDefault ? e.preventDefault() : (e.returnValue = false);
	            }
	        };
	    };
	    /**
	     * restrictCardNumberLength
	     *
	     * Restricts input in a target element to a
	     * certain length data.
	     *
	     * @param length
	     */
	    Card.restrictCardNumberLength = function (e) {
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var value = target.value;
	        var cardType = typeByNumber(value);
	        // allow: backspace, delete, tab, escape, ctrl and enter
	        if ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
	            // allow: Ctrl+A
	            (e.keyCode === 65 && e.ctrlKey === true) ||
	            // allow: Ctrl+V
	            (e.keyCode === 86 && e.ctrlKey === true) ||
	            // allow: home, end, left, right
	            (e.keyCode >= 35 && e.keyCode <= 39)) {
	            // let it happen, don"t do anything
	            return;
	        }
	        var maxValue = function (max, curr) { return Math.max(max, curr); };
	        if (value.replace(/\D/g, "").length >=
	            (cardType ? cardType.lengths.reduce(maxValue) : 19)) {
	            e.preventDefault ? e.preventDefault() : (e.returnValue = false);
	        }
	    };
	    /**
	     * restrictNumeric
	     *
	     * Restricts input in a target element to only
	     * numeric data.
	     *
	     * @param e
	     */
	    Card.restrictNumeric = function (e) {
	        // allow: backspace, delete, tab, escape, ctrl and enter
	        if ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
	            // allow: Ctrl+A
	            (e.keyCode === 65 && e.ctrlKey === true) ||
	            // allow: Ctrl+V
	            (e.keyCode === 86 && e.ctrlKey === true) ||
	            // allow: home, end, left, right
	            (e.keyCode >= 35 && e.keyCode <= 39) ||
	            // allow: weird Android/Chrome issue
	            e.keyCode === 229) {
	            // let it happen, don"t do anything
	            return;
	        }
	        // ensure that it is a number and stop the keypress
	        if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
	            (e.keyCode < 96 || e.keyCode > 105)) {
	            e.preventDefault ? e.preventDefault() : (e.returnValue = false);
	        }
	    };
	    /**
	     * deleteProperly
	     *
	     * Places cursor on the correct position to
	     * let the browser delete the digit instead
	     * of the space.
	     *
	     * @param e
	     */
	    Card.deleteProperly = function (e) {
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var value = target.value;
	        if (!target.setSelectionRange) {
	            return;
	        }
	        var cursor = target.selectionStart || 0;
	        // allow: delete, backspace
	        if ([46, 8].indexOf(e.keyCode) !== -1 &&
	            // if space to be deleted
	            value.charAt(cursor - 1) === " ") {
	            // placing cursor before space to delete digit instead
	            target.setSelectionRange(cursor - 1, cursor - 1);
	        }
	    };
	    /**
	     * validateNumber
	     *
	     * Validates a target element"s value based on the
	     * inferred card type"s validation regex. Adds a
	     * class to the target element to note `valid` or
	     * `invalid`.
	     *
	     * @param e
	     */
	    Card.validateNumber = function (e) {
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var id = target.getAttribute("data-id");
	        var value = target.value.replace(/[-\s]/g, "");
	        var cardType = typeByNumber(value);
	        var classList = target.className.split(" ");
	        var length = classList.length;
	        var c = "";
	        for (var i = 0; i < length; i++) {
	            c = classList[i];
	            if (c.indexOf("valid") !== -1) {
	                delete classList[i];
	            }
	        }
	        if (new CardNumber$1().validate(value)) {
	            classList.push("valid");
	            if (id) {
	                postMessage.post({
	                    data: { valid: true },
	                    id: id,
	                    type: "ui:iframe-field:card-number-test",
	                }, "parent");
	            }
	        }
	        else {
	            var maxValue = function (max, curr) { return Math.max(max, curr); };
	            if (cardType && value.length < cardType.lengths.reduce(maxValue)) {
	                classList.push("possibly-valid");
	            }
	            classList.push("invalid");
	            if (id) {
	                postMessage.post({
	                    data: { valid: false },
	                    id: id,
	                    type: "ui:iframe-field:card-number-test",
	                }, "parent");
	            }
	        }
	        classList = classList.filter(function (str) { return str !== ''; });
	        target.className = classList.join(" ");
	    };
	    /**
	     * validateCvv
	     *
	     * Validates a target element"s value based on the
	     * possible CVV lengths. Adds a class to the target
	     * element to note `valid` or `invalid`.
	     *
	     * @param e
	     */
	    Card.validateCvv = function (e) {
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var id = target.getAttribute("data-id");
	        var value = target.value;
	        var classList = target.className.split(" ");
	        var length = classList.length;
	        var c = "";
	        var cardType = "unknown";
	        for (var i = 0; i < length; i++) {
	            c = classList[i];
	            if (c.indexOf("valid") !== -1) {
	                delete classList[i];
	            }
	            if (c.indexOf("card-type-") !== -1) {
	                cardType = c.replace("card-type-", "");
	            }
	        }
	        var isAmex = cardType === "amex";
	        var maxLength = isAmex ? 4 : 3;
	        if (value.length < maxLength) {
	            classList.push("possibly-valid");
	        }
	        if (new Cvv().validate(value, cardType === "unknown" ? undefined : isAmex)) {
	            classList.push("valid");
	            if (id) {
	                postMessage.post({
	                    data: { valid: true },
	                    id: id,
	                    type: "ui:iframe-field:card-cvv-test",
	                }, "parent");
	            }
	        }
	        else {
	            classList.push("invalid");
	            if (id) {
	                postMessage.post({
	                    data: { valid: false },
	                    id: id,
	                    type: "ui:iframe-field:card-cvv-test",
	                }, "parent");
	            }
	        }
	        target.className = classList.join(" ").replace(/^\s+|\s+$/gm, "");
	    };
	    /**
	     * validateExpiration
	     *
	     * Validates a target element"s value based on the
	     * current date. Adds a class to the target element
	     * to note `valid` or `invalid`.
	     *
	     * @param e
	     */
	    Card.validateExpiration = function (e) {
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var id = target.getAttribute("data-id");
	        var value = target.value;
	        var classList = target.className.split(" ");
	        var length = classList.length;
	        var c = "";
	        for (var i = 0; i < length; i++) {
	            c = classList[i];
	            if (c.indexOf("valid") !== -1) {
	                delete classList[i];
	            }
	        }
	        var _a = value.split(" / "), month = _a[0], year = _a[1];
	        if (!month || !year || month.length < 2 || year.length < 4) {
	            classList.push("possibly-valid");
	        }
	        if (new Expiration$1().validate(value)) {
	            classList.push("valid");
	            if (id) {
	                postMessage.post({
	                    data: { valid: true },
	                    id: id,
	                    type: "ui:iframe-field:card-expiration-test",
	                }, "parent");
	            }
	        }
	        else {
	            classList.push("invalid");
	            if (id) {
	                postMessage.post({
	                    data: { valid: false },
	                    id: id,
	                    type: "ui:iframe-field:card-expiration-test",
	                }, "parent");
	            }
	        }
	        target.className = classList.join(" ").replace(/^\s+|\s+$/gm, "");
	    };
	    /**
	     * validateInstallmentFields
	     *
	     * Validates a target element"s value based on the
	     * availability of use installment plans.
	     *
	     * @param e
	     */
	    Card.validateInstallmentFields = function (e, fieldType) {
	        if (!options.installments)
	            return;
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var value = target.value;
	        var id = target.getAttribute("data-id");
	        if (!id)
	            return;
	        var installmentFieldValid = false;
	        if (fieldType === "card-number") {
	            installmentFieldValid = new CardNumber$1().validate(value);
	        }
	        if (fieldType === "card-expiration") {
	            installmentFieldValid = new Expiration$1().validate(value);
	        }
	        if (fieldType === "card-cvv") {
	            var CARD_TYPE_UNKNOWN = "unknown";
	            var CARD_TYPE_CLASS_PREFIX_1 = "card-type-";
	            var classList = target.className.split(" ");
	            var cardTypeClass = classList.filter(function (c) { return new RegExp("/" + CARD_TYPE_CLASS_PREFIX_1 + "\\b", 'g').test(c); })[0];
	            var cardType = cardTypeClass ? cardTypeClass.replace(CARD_TYPE_CLASS_PREFIX_1, "") : CARD_TYPE_UNKNOWN;
	            installmentFieldValid = new Cvv().validate(value, cardType === CARD_TYPE_UNKNOWN ? undefined : cardType === "amex");
	        }
	        if (installmentFieldValid)
	            return;
	        var eventType = "ui:iframe-field:" + InstallmentEvents.CardInstallmentsHide;
	        postMessage.post({
	            data: { value: value, id: id },
	            id: id,
	            type: eventType,
	        }, "parent");
	    };
	    /**
	     * postInstallmentFieldValidatedEvent
	     *
	     * Post an event when an installment related card field is validated
	     *
	     * @param e
	     */
	    Card.postInstallmentFieldValidatedEvent = function (e) {
	        if (!options.installments)
	            return;
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var value = target.value;
	        var id = target.getAttribute("data-id");
	        if (!id)
	            return;
	        var eventType = "ui:iframe-field:" + InstallmentEvents.CardInstallmentsFieldValidated;
	        postMessage.post({
	            data: { value: value, id: id },
	            id: id,
	            type: eventType,
	        }, "parent");
	    };
	    /**
	     * attachNumberEvents
	     *
	     * @param selector
	     */
	    Card.attachNumberEvents = function (selector) {
	        var el = document.querySelector(selector);
	        if (!el) {
	            return;
	        }
	        Events.addHandler(el, "keydown", Card.restrictNumeric);
	        Events.addHandler(el, "keydown", Card.restrictCardNumberLength);
	        Events.addHandler(el, "input", Card.restrictCardNumberLength);
	        // value on input it's formatted after being fully entered
	        Events.addHandler(el, "keydown", Card.formatNumber);
	        Events.addHandler(el, "keyup", Card.formatNumber);
	        Events.addHandler(el, "keydown", Card.deleteProperly);
	        Events.addHandler(el, "input", Card.validateNumber);
	        Events.addHandler(el, "input", Card.addType);
	        Events.addHandler(el, "blur", Card.postInstallmentFieldValidatedEvent);
	        Events.addHandler(el, "input", function (e) { Card.validateInstallmentFields(e, "card-number"); });
	    };
	    /**
	     * attachExpirationEvents
	     *
	     * @param selector
	     */
	    Card.attachExpirationEvents = function (selector) {
	        var el = document.querySelector(selector);
	        if (!el) {
	            return;
	        }
	        Events.addHandler(el, "keydown", Card.restrictNumeric);
	        Events.addHandler(el, "keydown", Card.restrictLength(9));
	        Events.addHandler(el, "keyup", Card.formatExpiration);
	        Events.addHandler(el, "blur", Card.formatExpiration);
	        Events.addHandler(el, "input", Card.validateExpiration);
	        Events.addHandler(el, "blur", Card.validateExpiration);
	        Events.addHandler(el, "blur", Card.postInstallmentFieldValidatedEvent);
	        Events.addHandler(el, "input", function (e) { Card.validateInstallmentFields(e, "card-expiration"); });
	    };
	    /**
	     * attachCvvEvents
	     *
	     * @param selector
	     */
	    Card.attachCvvEvents = function (selector) {
	        var el = document.querySelector(selector);
	        if (!el) {
	            return;
	        }
	        el.setAttribute("maxlength", "3");
	        Events.addHandler(el, "keydown", Card.restrictNumeric);
	        Events.addHandler(el, "keydown", Card.restrictLength(4));
	        Events.addHandler(el, "input", Card.validateCvv);
	        Events.addHandler(el, "blur", Card.validateCvv);
	        Events.addHandler(el, "blur", Card.postInstallmentFieldValidatedEvent);
	        Events.addHandler(el, "input", function (e) { Card.validateInstallmentFields(e, "card-cvv"); });
	    };
	    return Card;
	}());
	if (!Array.prototype.indexOf) {
	    Array.prototype.indexOf = function (obj, start) {
	        for (var i = start || 0, j = this.length; i < j; i++) {
	            if (this[i] === obj) {
	                return i;
	            }
	        }
	        return -1;
	    };
	}

	/**
	 * Once data is accumulated from the other hosted fields,
	 * the `card-number` / `account-number` hosted field initiates
	 * the tokenization request with the configured gateway.
	 *
	 */
	var actionAccumulateDataAndTokenize = (function (id, type, data) {
	    // only `card-number` and `account-number` should perform
	    // these tokenization requests
	    if (type !== "card-number" && type !== "account-number") {
	        return;
	    }
	    var w = window;
	    // maintain field data until all data is obtained
	    w.dataContents = w.dataContents || {};
	    w.dataContents[data.data.type] = data.data.value;
	    if (!w.dataReceivedFields) {
	        w.dataReceivedFields = ["submit"];
	    }
	    w.dataReceivedFields.push(data.data.type);
	    var installment = data.data.installment;
	    // proceed with tokenization once we have all expected field data
	    if (JSON.stringify(w.dataFields.sort()) ===
	        JSON.stringify(w.dataReceivedFields.sort())) {
	        var field = document.getElementById(paymentFieldId);
	        var value = field && field.value ? field.value : "";
	        tokenize({
	            "account-number": window.name === "account-number" && value,
	            "card-cvv": w.dataContents["card-cvv"] !== undefined && w.dataContents["card-cvv"],
	            "card-expiration": w.dataContents["card-expiration"] !== undefined &&
	                w.dataContents["card-expiration"],
	            "card-holder-name": w.dataContents["card-holder-name"] !== undefined &&
	                w.dataContents["card-holder-name"],
	            "card-number": window.name === "card-number" && value,
	            "routing-number": w.dataContents["routing-number"] !== undefined &&
	                w.dataContents["routing-number"],
	        })
	            .then(function (response) {
	            w.dataContents = undefined;
	            w.dataReceivedFields = undefined;
	            postMessage.post({
	                data: __assign(__assign({}, response), { details: __assign(__assign({}, (response.details)), (installment ? { installment: installment } : {})) }),
	                id: id,
	                type: "ui:iframe-field:token-success",
	            }, "parent");
	        })["catch"](function (response) {
	            w.dataContents = undefined;
	            w.dataReceivedFields = undefined;
	            postMessage.post({
	                data: response,
	                id: id,
	                type: "ui:iframe-field:token-error",
	            }, "parent");
	        });
	    }
	});

	var actionAccumulateInstallmentData = (function (id, _type, data) {
	    var w = window;
	    w.installmentData = w.installmentData || {};
	    w.installmentData[data.data.type] = data.data.value;
	    var installmentData = {
	        cardNumber: w.installmentData['card-number'],
	        cardExpiration: w.installmentData['card-expiration'],
	        cardCvv: w.installmentData['card-cvv'],
	    };
	    var cardNumber = installmentData.cardNumber, cardExpiration = installmentData.cardExpiration, cardCvv = installmentData.cardCvv;
	    if (!cardNumber
	        || !new CardNumber$1().validate(cardNumber)
	        || !cardExpiration
	        || !new Expiration$1().validate(cardExpiration)
	        || !cardCvv
	        || cardCvv && cardCvv.length < 3) {
	        return;
	    }
	    var eventType = "ui:iframe-field:" + InstallmentEvents.CardInstallmentsRequestStart;
	    postMessage.post({
	        data: installmentData,
	        id: id,
	        type: eventType,
	    }, "parent");
	});

	/**
	 * Once initiated, the hosted field accepts track data via a
	 * human input device (HID) into a hidden text field
	 *
	 * @param id ID of the hosted field
	 */
	var actionCardTrackButtonClick = (function (id) {
	    var el = document.getElementById(paymentFieldId + "-data");
	    if (el && el.parentNode) {
	        el.parentNode.removeChild(el);
	    }
	    el = document.createElement("input");
	    el.id = paymentFieldId + "-data";
	    el.type = "text";
	    var container = document.querySelector(".extra-div-2");
	    if (!container) {
	        throw new Error("TODO");
	    }
	    container.style.height = "0px";
	    container.style.width = "0px";
	    container.style.overflow = "hidden";
	    container.appendChild(el);
	    var button = document.getElementById(paymentFieldId);
	    var originalButtonText = button && button.innerText ? button.innerText : "Read Card";
	    if (button && button.firstChild) {
	        button.replaceChild(document.createTextNode("Waiting..."), button.firstChild);
	    }
	    el.focus();
	    postMessage.post({
	        id: id,
	        type: "ui:iframe-field:waiting-for-data",
	    }, "parent");
	    Events.addHandler(el, "keydown", function (e) {
	        // HID will follow track data with an `<ENTER>` keystroke.
	        // Wait until that keystroke to continue.
	        if (e.keyCode !== 13) {
	            return;
	        }
	        postMessage.post({
	            id: id,
	            type: "ui:iframe-field:data-received",
	        }, "parent");
	        e.preventDefault();
	        var field = document.getElementById(paymentFieldId + "-data");
	        var value = field && field.value ? field.value : "";
	        // Once track data has been received by the hosted field,
	        // we perform the tokenization
	        tokenize({
	            "card-track": value,
	        })
	            .then(function (response) {
	            if (button && button.firstChild) {
	                button.replaceChild(document.createTextNode(originalButtonText), button.firstChild);
	            }
	            field.blur();
	            postMessage.post({
	                data: response,
	                id: id,
	                type: "ui:iframe-field:token-success",
	            }, "parent");
	        })["catch"](function (response) {
	            if (button && button.firstChild) {
	                button.replaceChild(document.createTextNode(originalButtonText), button.firstChild);
	            }
	            field.blur();
	            postMessage.post({
	                data: response,
	                id: id,
	                type: "ui:iframe-field:token-error",
	            }, "parent");
	        });
	    });
	});

	/**
	 * Gets the value of the `card-cvv` hosted field
	 *
	 * @param id ID of the hosted field
	 * @param type Field type of the hosted field
	 * @returns
	 */
	var actionGetCvv = (function (id, type) {
	    var el = document.getElementById(paymentFieldId);
	    if (!el) {
	        return;
	    }
	    // While we only expose a function for the `card-cvv`
	    // hosted field, we validate the type once again for
	    // safe measure.
	    if (type !== "card-cvv") {
	        return;
	    }
	    if (!el.value) {
	        return;
	    }
	    // We also validate that the configured gateway is only
	    // TransIT or Heartland Bill Pay.
	    var isTransit = options.deviceId && options.manifest;
	    var isBillPay = options.merchantName;
	    postMessage.post({
	        data: isTransit || isBillPay ? el.value : null,
	        id: id,
	        type: "ui:iframe-field:get-cvv",
	    }, "parent");
	});

	/**
	 * Completes a payment via the PaymentRequest API
	 * after the integrator performs the server-side
	 * authorization request. This is triggered in the parent
	 * window, but the PaymentRequest functionality and
	 * data only exists within the hoted field.
	 *
	 * @param id ID of the hosted field
	 * @param data Payment status from the integrator
	 */
	var actionPaymentRequestComplete = (function (id, data) { return __awaiter(void 0, void 0, void 0, function () {
	    return __generator(this, function (_a) {
	        if (!window.globalPaymentResponse) {
	            postMessage.post({
	                data: {
	                    code: "ERROR",
	                    message: "Missing PaymentResponse object",
	                },
	                id: id,
	                type: "ui:iframe-field:error",
	            }, "parent");
	            return [2 /*return*/];
	        }
	        window.globalPaymentResponse
	            .complete(data.data.status)
	            .then(function () {
	            postMessage.post({
	                id: id,
	                type: "ui:iframe-field:payment-request-completed",
	            }, "parent");
	        })["catch"](function (e) {
	            postMessage.post({
	                data: {
	                    code: "ERROR",
	                    message: e.message,
	                },
	                id: id,
	                type: "ui:iframe-field:error",
	            }, "parent");
	        });
	        return [2 /*return*/];
	    });
	}); });

	/**
	 * Initiates a payment card via the PaymentRequest API
	 * to leverage card data stored in a cardholder's
	 * browser, tokenizing it via the configured gateway
	 * implementation. This is triggered in the parent
	 * window, but the PaymentRequest functionality and
	 * data only exists within the hosted field.
	 *
	 * @param id ID of the hosted field
	 * @param data PaymentRequest details
	 */
	var actionPaymentRequestStart = (function (id, data) { return __awaiter(void 0, void 0, void 0, function () {
	    var response, request, e_1, code, token, d, cardNumber, bin, last4, type, e_2;
	    return __generator(this, function (_a) {
	        switch (_a.label) {
	            case 0:
	                _a.trys.push([0, 2, , 3]);
	                request = new PaymentRequest(data.data.instruments, data.data.details, data.data.options);
	                return [4 /*yield*/, request.show()];
	            case 1:
	                response = _a.sent();
	                // Store the original response on the hosted field's
	                // window for later completion
	                window.globalPaymentResponse = response;
	                return [3 /*break*/, 3];
	            case 2:
	                e_1 = _a.sent();
	                code = "ERROR";
	                if (e_1.name !== "Error") {
	                    code = e_1.name.replace("Error", "_Error").toUpperCase();
	                }
	                postMessage.post({
	                    data: {
	                        code: code,
	                        message: e_1.message,
	                    },
	                    id: id,
	                    type: "ui:iframe-field:token-error",
	                }, "parent");
	                return [2 /*return*/];
	            case 3:
	                _a.trys.push([3, 5, , 6]);
	                return [4 /*yield*/, tokenize({
	                        "card-cvv": response.details.cardSecurityCode || "",
	                        "card-expiration": (response.details.expiryMonth || "") +
	                            " / " +
	                            (response.details.expiryYear || ""),
	                        "card-holder-name": response.details.cardholderName || "",
	                        "card-number": response.details.cardNumber || "",
	                    })];
	            case 4:
	                token = _a.sent();
	                d = response.toJSON();
	                cardNumber = response.details.cardNumber.replace(/\D/g, "");
	                bin = cardNumber.substr(0, 6);
	                last4 = cardNumber.substr(-4);
	                type = typeByNumber(cardNumber);
	                d.details = d.details || {};
	                d.details.cardNumber = bin + "*".repeat(cardNumber.length - 10) + last4;
	                d.details.cardBin = bin;
	                d.details.cardLast4 = last4;
	                d.details.cardType = type ? type.code : "unknown";
	                d.details.cardSecurityCode = !!response.details.cardSecurityCode;
	                token.details = d.details;
	                token.methodName = d.methodName;
	                token.payerEmail = d.payerEmail;
	                token.payerName = d.payerName;
	                token.payerPhone = d.payerPhone;
	                token.requestId = d.requestId;
	                token.shippingAddress = d.shippingAddress;
	                token.shippingOption = d.shippingOption;
	                postMessage.post({
	                    data: token,
	                    id: id,
	                    type: "ui:iframe-field:token-success",
	                }, "parent");
	                return [3 /*break*/, 6];
	            case 5:
	                e_2 = _a.sent();
	                response.complete("fail");
	                postMessage.post({
	                    data: e_2,
	                    id: id,
	                    type: "ui:iframe-field:token-error",
	                }, "parent");
	                return [3 /*break*/, 6];
	            case 6: return [2 /*return*/];
	        }
	    });
	}); });

	/**
	 * Causes the hosted field to send its data to the `card-number`
	 * field for tokenization when triggered by the
	 * `ui:iframe-field:request-data` event.
	 *
	 * @param id ID of the hosted field
	 * @param type Field type of the hosted field
	 * @param data Information about the recipient hosted field
	 */
	var actionRequestData = (function (id, type, data) {
	    // track list of fields for which we have received data
	    if (!window.dataReceivedFields) {
	        window.dataReceivedFields = ["submit"];
	    }
	    var field = document.getElementById(paymentFieldId);
	    var value = field && field.value ? field.value : "";
	    if (type === "card-number" || type === "account-number") {
	        // ignore to prevent these fields from leaking their data
	        // but store expected list of fields
	        window.dataFields = data.data.fields;
	        value = "";
	    }
	    var installment = data.data.installment;
	    postMessage.post({
	        data: __assign({ target: data.data.target, type: type,
	            value: value }, (installment ? { installment: installment } : {})),
	        id: id,
	        type: "ui:iframe-field:pass-data",
	    }, "parent");
	});

	var actionRequestInstallmentData = (function (id, type, data) {
	    var field = document.getElementById(paymentFieldId);
	    var value = field && field.value ? field.value : "";
	    postMessage.post({
	        data: {
	            target: data.data.target,
	            type: type,
	            value: value,
	        },
	        id: id,
	        type: "ui:iframe-field:" + InstallmentEvents.CardInstallmentsPassData,
	    }, "parent");
	});

	/**
	 * Sets the class list of a hosted field to include
	 * the card type inferred from the `card-number` field
	 * emitting the `ui:iframe-field:card-type` through
	 * the parent window.
	 *
	 * @param cardType The inferred card type
	 * @returns
	 */
	var actionSetCardType = (function (cardType) {
	    var el = document.getElementById(paymentFieldId);
	    if (!el) {
	        return;
	    }
	    // Work with the element's className for backwards
	    // compatibility
	    var classList = el.className.split(" ");
	    var length = classList.length;
	    var i = 0;
	    var c = "";
	    for (i; i < length; i++) {
	        c = classList[i];
	        if (c && c.indexOf("card-type-") !== -1) {
	            delete classList[i];
	        }
	    }
	    if (cardType) {
	        classList.push("card-type-" + cardType);
	    }
	    el.className = classList.join(" ");
	});

	/**
	 * Sets input focus on the hosted field
	 */
	var actionSetFocus = (function () {
	    var el = document.getElementById(paymentFieldId);
	    if (!el) {
	        return;
	    }
	    el.focus();
	});

	/**
	 * Escapes all potentially dangerous characters, so that the
	 * resulting string can be safely inserted into attribute or
	 * element text.
	 *
	 * @param value
	 * @returns escaped text
	 */
	function encodeEntities(value) {
	    return value
	        .replace(/&/g, "&amp;")
	        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function (v) {
	        var hi = v.charCodeAt(0);
	        var low = v.charCodeAt(1);
	        return "&#" + ((hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000) + ";";
	    })
	        .replace(/([^\#-~é| |!])/g, function (v) {
	        return "&#" + v.charCodeAt(0) + ";";
	    })
	        .replace(/</g, "&lt;")
	        .replace(/>/g, "&gt;");
	}

	/**
	 * Sets the label of a hosted field
	 *
	 * @param text The desired input label
	 */
	var actionSetLabel = (function (text) {
	    var el = document.getElementById(paymentFieldId);
	    if (!el) {
	        return;
	    }
	    // Set the label on the input via aria-label
	    el.setAttribute("aria-label", encodeEntities(text));
	    // ... and on the main landmark via aria-label
	    document
	        .querySelectorAll("main")
	        .forEach(function (e) { return e.setAttribute("aria-label", encodeEntities(text)); });
	    // ... and also on the hidden label element via its text content
	    document
	        .querySelectorAll("#" + paymentFieldId + "-label")
	        .forEach(function (e) { return (e.textContent = encodeEntities(text)); });
	});

	var dotPlaceholders = [
	    "•••• •••• •••• ••••",
	    "···· ···· ···· ····",
	    "•••••••••",
	    "·········",
	    "••••",
	    "····",
	    "•••",
	    "···",
	];

	/**
	 * Sets the placeholder text of a hosted field
	 *
	 * @param placeholder The desired palceholder text
	 */
	var actionSetPlaceholder = (function (placeholder) {
	    var el = document.getElementById(paymentFieldId);
	    if (!el) {
	        return;
	    }
	    // Determine if the placeholder text should be encoded
	    if (dotPlaceholders.indexOf(placeholder) !== -1) {
	        // Allow various dot placeholders
	        el.setAttribute("placeholder", placeholder);
	    }
	    else {
	        // Encode the placeholder text
	        el.setAttribute("placeholder", encodeEntities(placeholder));
	    }
	});

	/**
	 * Sets the text content of a hosted field
	 *
	 * @param text The desired text value
	 */
	var actionSetText = (function (text) {
	    var el = document.getElementById(paymentFieldId);
	    if (!el) {
	        return;
	    }
	    el.textContent = encodeEntities(text);
	});

	/**
	 * Sets the value of a hosted field
	 *
	 * @param text The desired input value
	 */
	var actionSetValue = (function (text) {
	    var el = document.getElementById(paymentFieldId);
	    if (!el) {
	        return;
	    }
	    el.setAttribute("value", encodeEntities(text));
	    // trigger events on the target element
	    Events.trigger("keyup", el);
	    Events.trigger("input", el);
	});

	/**
	 * Change values of maxlength and placeholder attributes of the cvv input
	 * depending on card type
	 *
	 * @param maxlength The maximum number of characters desired
	 * @param placeholder Placeholder for show
	 * @param id cvv input id
	 */
	var actionSetTypeCvv = (function (maxlength) {
	    var el = document.getElementById(paymentFieldId);
	    if (!el) {
	        return;
	    }
	    var currentPlaceholder = el.getAttribute("placeholder");
	    // Just change the placeholder when it belongs to our own code
	    if (currentPlaceholder && dotPlaceholders.indexOf(currentPlaceholder) > -1) {
	        var charPlaceholder = currentPlaceholder[0];
	        var placeholder = "";
	        for (var index = 0; index < Number(maxlength); index++) {
	            placeholder = placeholder + charPlaceholder;
	        }
	        el.setAttribute("placeholder", placeholder);
	    }
	    el.setAttribute("maxlength", maxlength);
	});

	var queryInstallmentPlans = (function (data) {
	    var gateway = getGateway();
	    if (!gateway)
	        return Promise.reject(createInvalidConfigurationError("no gateway available"));
	    return new Promise(function (resolve, reject) {
	        if (!gateway.actions.queryInstallmentPlans || !gateway.urls.queryInstallmentPlans)
	            return Promise.reject(createInvalidConfigurationError("no installment gateway action/url available"));
	        var url = gateway.urls.queryInstallmentPlans(false);
	        gateway.actions.queryInstallmentPlans(url, options.env || "", data)
	            .then(function (response) {
	            return response;
	        })
	            .then(function (response) {
	            if (response.error) {
	                reject(response);
	                return;
	            }
	            if (gateway.requiredSettings.indexOf("X-GP-Api-Key") !== -1) {
	                resolve(response);
	                return;
	            }
	            resolve(response);
	        })["catch"](reject);
	    });
	});
	function createInvalidConfigurationError(message) {
	    return {
	        error: true,
	        reasons: [
	            { code: "INVALID_CONFIGURATION", message: message },
	        ],
	    };
	}

	/**
	 * Requests the installment plans data for a valid credit card number
	 */
	var actionCardRequestInstallments = (function (id, data) {
	    if (!id)
	        return;
	    var cardNumber = data.cardNumber, amount = data.amount, cardExpiration = data.cardExpiration;
	    var _a = cardExpiration.replace(' ', '').split('/'), expiryMonth = _a[0], fullExpiryYear = _a[1];
	    var brand = (typeByNumber(cardNumber) || {}).code;
	    queryInstallmentPlans({
	        number: cardNumber,
	        amount: amount,
	        brand: brand,
	        expiryMonth: expiryMonth,
	        expiryYear: fullExpiryYear.slice(-2),
	    }).then(function (responseData) {
	        var eventType = InstallmentEvents.CardInstallmentsRequestCompleted;
	        if (responseData["error_code"]) {
	            eventType = InstallmentEvents.CardInstallmentsRequestFailed;
	        }
	        postMessage.post({
	            data: responseData,
	            id: id,
	            type: "ui:iframe-field:" + eventType,
	        }, "parent");
	    })["catch"](function (responseError) {
	        postMessage.post({
	            data: responseError,
	            id: id,
	            type: "ui:iframe-field:" + InstallmentEvents.CardInstallmentsRequestFailed,
	        }, "parent");
	    });
	});

	var CardFormFieldNames;
	(function (CardFormFieldNames) {
	    CardFormFieldNames["CardAccountNumber"] = "account-number";
	    CardFormFieldNames["CardNumber"] = "card-number";
	    CardFormFieldNames["CardExpiration"] = "card-expiration";
	    CardFormFieldNames["CardCvv"] = "card-cvv";
	    CardFormFieldNames["CardHolderName"] = "card-holder-name";
	})(CardFormFieldNames || (CardFormFieldNames = {}));

	var fieldTypeAutocompleteMap = {
	    "card-cvv": "cc-csc",
	    "card-expiration": "cc-exp",
	    "card-number": "cc-number",
	    "card-holder-name": "cc-name"
	};
	/**
	 * Represents logic surrounding individual hosted fields.
	 *
	 * Static methods are ran within the iframe / child window.
	 *
	 * Instance methods are ran within the parent window.
	 */
	var IframeField = /** @class */ (function (_super) {
	    __extends(IframeField, _super);
	    /**
	     * Instantiates a new IframeField object for a hosted field
	     *
	     * @param type Field type of the hosted field
	     * @param opts Options for creating the iframe / hosted field
	     * @param src URL for the hosted field's iframe
	     */
	    function IframeField(type, opts, src) {
	        var _this = _super.call(this) || this;
	        var selector = opts.target || "";
	        _this.id = btoa(lib.generateGuid());
	        _this.type = type === "submit" || type === "card-track" ? "button" : "input";
	        _this.url = src;
	        _this.frame = _this.makeFrame(type, _this.id, opts);
	        _this.frame.onload = function () {
	            _this.emit("load");
	        };
	        _this.frame.src =
	            src +
	                "#" +
	                // initial data for the iframe
	                btoa(JSON.stringify({
	                    enableAutocomplete: options.enableAutocomplete,
	                    id: _this.id,
	                    lang: options.language || "en",
	                    targetOrigin: window.location.href,
	                    type: _this.type,
	                    fieldOptions: opts.fieldOptions,
	                }));
	        _this.container = document.querySelector(selector);
	        if (!_this.container) {
	            bus.emit("error", {
	                error: true,
	                reasons: [
	                    {
	                        code: "ERROR",
	                        message: "IframeField: target cannot be found with given selector",
	                    },
	                ],
	            });
	            return _this;
	        }
	        if (_this.container.hasChildNodes()) {
	            _this.container.insertBefore(_this.frame, _this.container.firstChild);
	        }
	        else {
	            _this.container.appendChild(_this.frame);
	        }
	        _this.on("dispose", function () {
	            loadedFrames[_this.id] = undefined;
	            if (_this.container) {
	                _this.container.removeChild(_this.frame);
	            }
	        });
	        // handle events coming from the iframe
	        postMessage.receive(function (data) {
	            if (!data.id || (data.id && data.id !== _this.id)) {
	                return;
	            }
	            var event = data.type.replace("ui:iframe-field:", "");
	            switch (event) {
	                case "register":
	                    postMessage.post({
	                        data: options,
	                        id: _this.id,
	                        type: "ui:iframe-field:update-options",
	                    }, _this.id);
	                    break;
	                case "resize":
	                    _this.frame.style.height = data.data.height + "px";
	                    break;
	                case "pass-data":
	                    var installment = data.data.installment;
	                    postMessage.post({
	                        data: __assign({ type: data.data.type, value: data.data.value }, (installment ? { installment: installment } : {})),
	                        id: data.data.target,
	                        type: "ui:iframe-field:accumulate-data",
	                    }, data.data.target);
	                    return;
	                case InstallmentEvents.CardInstallmentsPassData:
	                    postMessage.post({
	                        data: {
	                            type: data.data.type,
	                            value: data.data.value,
	                        },
	                        id: data.data.target,
	                        type: "ui:iframe-field:" + InstallmentEvents.CardInstallmentsAccumulateData,
	                    }, data.data.target);
	                    break;
	            }
	            // re-emit event to the integrator
	            _this.emit(event, data.data);
	        });
	        // keep an instance of the hosted field for future interaction
	        // with the iframe
	        loadedFrames[_this.id] = _this;
	        return _this;
	    }
	    /**
	     * Sets up the hosted field's iframe for further
	     * processing, and registers the hosted field
	     * with the parent window.
	     *
	     * @param type Field type of the hosted field
	     */
	    IframeField.register = function (type) {
	        var query = window.location.hash.replace("#", "");
	        var data = JSON.parse(atob(query));
	        var id = data.id;
	        var enableAutocomplete = data.enableAutocomplete !== undefined ? data.enableAutocomplete : true;
	        var fieldOptions = data.fieldOptions;
	        IframeField.setHtmlLang(data.lang);
	        IframeField.createField(id, type, data.type, enableAutocomplete, fieldOptions);
	        IframeField.addMessageListener(id, type, data.targetOrigin);
	        postMessage.post({
	            data: { type: type },
	            id: id,
	            type: "ui:iframe-field:register",
	        }, "parent");
	        IframeField.triggerResize(id);
	        // Fix iOS issue with cross-origin iframes
	        Events.addHandler(document.body, "touchstart", function () {
	            /** */
	        });
	    };
	    /**
	     * Sets the hosted field's `lang` attribute on the `html` element
	     * with the globally configured value.
	     *
	     * @param lang The configured language code
	     */
	    IframeField.setHtmlLang = function (lang) {
	        var elements = document.querySelectorAll("html");
	        if (!elements) {
	            return;
	        }
	        // tslint:disable-next-line:prefer-for-of
	        for (var i = 0; i < elements.length; i++) {
	            var el = elements[i];
	            el.lang = lang;
	        }
	    };
	    /**
	     * Creates the inner field within the iframe window and sets
	     * any appropriate attributes, properties, and event handlers.
	     * @param id Field ID
	     * @param name Field type
	     * @param type Type of element
	     * @param enableAutocomplete Whether autocomplete should be enabled
	     * @param fieldOptions Field Options
	     */
	    IframeField.createField = function (id, name, type, enableAutocomplete, fieldOptions) {
	        var input = document.createElement(type === "button" ? "button" : "input");
	        input.setAttribute("type", type === "button"
	            ? "button"
	            : name === "card-holder-name"
	                ? "text"
	                : "tel");
	        input.id = paymentFieldId;
	        input.className = name;
	        input.setAttribute("data-id", id);
	        if (enableAutocomplete === true && fieldTypeAutocompleteMap[name]) {
	            input.setAttribute("autocomplete", fieldTypeAutocompleteMap[name]);
	        }
	        if (name === "card-track") {
	            var message = "Read Card";
	            input.appendChild(document.createTextNode(message));
	        }
	        else if (type === "button") {
	            var message = "Submit";
	            input.appendChild(document.createTextNode(message));
	        }
	        var label = document.createElement("label");
	        label.id = paymentFieldId + "-label";
	        label.setAttribute("for", paymentFieldId);
	        label.className = "offscreen";
	        var dest = document.getElementById(paymentFieldId + "-wrapper");
	        if (!dest) {
	            return;
	        }
	        dest.insertBefore(input, dest.firstChild);
	        dest.insertBefore(label, dest.firstChild);
	        IframeField.addFrameFocusEvent();
	        if (enableAutocomplete === true && name === "card-number") {
	            IframeField.createAutocompleteField(dest, id, "card-cvv", "cardCsc", "Card CVV", "cc-csc");
	            IframeField.createAutocompleteField(dest, id, "card-expiration", "cardExpiration", "Card Expiration", "cc-exp");
	            IframeField.createAutocompleteField(dest, id, "card-holder-name", "cardHolderName", "Card Holder Name", "cc-name");
	        }
	        if (name === CardFormFieldNames.CardNumber) {
	            input.setAttribute("data-prev", "0");
	            var icon = document.createElement('img');
	            icon.className = 'card-number-icon';
	            icon.setAttribute('aria-disabled', 'false');
	            if (fieldOptions === undefined ||
	                (fieldOptions && (fieldOptions.styleType === undefined || fieldOptions.styleType === "blank"))) {
	                icon.setAttribute('aria-hidden', "true");
	            }
	            icon.setAttribute('alt', 'Generic Card');
	            icon.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
	            icon.setAttribute('onerror', 'this.onerror=null; this.src="' + (assetBaseUrl() + "images/gp-cc-generic.svg") + '"');
	            dest.insertBefore(icon, input);
	        }
	        if (name === "card-track") {
	            Events.addHandler(input, "click", function () {
	                actionCardTrackButtonClick(id);
	            });
	        }
	        else if (type === "button") {
	            Events.addHandler(input, "click", function () {
	                postMessage.post({
	                    id: id,
	                    type: "ui:iframe-field:click",
	                }, "parent");
	            });
	        }
	        switch (name) {
	            case "card-number":
	                Card.attachNumberEvents("#" + input.id);
	                input.name = "cardNumber";
	                break;
	            case "card-expiration":
	                Card.attachExpirationEvents("#" + input.id);
	                break;
	            case "card-cvv":
	                Card.attachCvvEvents("#" + input.id);
	                break;
	        }
	    };
	    /**
	     * Appends a hidden input to the given destination to accept
	     * full autocomplete/auto-fill data from the browser. The
	     * parent window is also notified of data changes to these
	     * fields in order display the new data to the end-user.
	     *
	     * @param destination Parent node for new element
	     * @param id Field ID
	     * @param type Field type
	     * @param name Field name to be used
	     * @param autocomplete Value for field's autocomplete attribute
	     */
	    IframeField.createAutocompleteField = function (destination, id, type, name, label, autocomplete) {
	        var element = document.createElement("input");
	        element.name = name;
	        element.className = "autocomplete-hidden";
	        element.tabIndex = -1;
	        element.autocomplete = autocomplete;
	        element.setAttribute('aria-label', label);
	        element.setAttribute('aria-hidden', "true");
	        Events.addHandler(element, "input", function () {
	            var value = element && element.value ? element.value : "";
	            // this shouldn't happen, but explicitly ignore to prevent
	            // these fields from leaking their data to the parent
	            if (type === "card-number" || type === "account-number") {
	                value = "";
	            }
	            postMessage.post({
	                data: {
	                    type: type,
	                    value: value,
	                },
	                id: id,
	                type: "ui:iframe-field:set-autocomplete-value",
	            }, "parent");
	        });
	        destination.appendChild(element);
	    };
	    /**
	     * addFrameFocusEvent
	     *
	     * Ensures an iframe's document forwards its received focus
	     * to the input field. Helps provide consistent behavior in
	     * all browsers.
	     */
	    IframeField.addFrameFocusEvent = function () {
	        var element = document.getElementById(paymentFieldId);
	        if (!element) {
	            return;
	        }
	        var focusEventName = "focus";
	        var handler = function (e) {
	            if (e.fromElement === element) {
	                return;
	            }
	            if (e.relatedTarget) {
	                return;
	            }
	            element.focus();
	        };
	        if (document["on" + focusEventName + "in"]) {
	            Events.addHandler(document, focusEventName + "in", handler);
	        }
	        else {
	            Events.addHandler(document, focusEventName, handler);
	        }
	    };
	    /**
	     * Sets the iframe window's postMessage handler in order to
	     * react to parent/sibling events.
	     *
	     * @param id ID of the hosted field
	     * @param type Field type of the hosted field
	     * @param targetOrigin Parent window's origin
	     */
	    IframeField.addMessageListener = function (id, type, targetOrigin) {
	        // update the global state with information about the parent window
	        loadedFrames.parent = {
	            frame: parent,
	            url: targetOrigin,
	        };
	        postMessage.receive(function (data) {
	            if (!data.id || (data.id && data.id !== id)) {
	                return;
	            }
	            var event = data.type.replace("ui:iframe-field:", "");
	            switch (event) {
	                case "accumulate-data":
	                    actionAccumulateDataAndTokenize(id, type, data);
	                    break;
	                case InstallmentEvents.CardInstallmentsAccumulateData:
	                    actionAccumulateInstallmentData(id, type, data);
	                    break;
	                case "add-stylesheet":
	                    addStylesheet(data.data.css);
	                    IframeField.triggerResize(id);
	                    break;
	                case "get-cvv":
	                    actionGetCvv(id, type);
	                    break;
	                case "payment-request-complete":
	                    actionPaymentRequestComplete(id, data);
	                    break;
	                case "payment-request-start":
	                    actionPaymentRequestStart(id, data);
	                    break;
	                case "request-data":
	                    actionRequestData(id, type, data);
	                    break;
	                case InstallmentEvents.CardInstallmentsRequestData:
	                    actionRequestInstallmentData(id, type, data);
	                    break;
	                case "set-card-type":
	                    actionSetCardType(data.data.cardType);
	                    break;
	                case "set-focus":
	                    actionSetFocus();
	                    break;
	                case "set-placeholder":
	                    actionSetPlaceholder(data.data.placeholder);
	                    IframeField.triggerResize(id);
	                    break;
	                case "change-cvv-settings":
	                    actionSetTypeCvv(data.data.maxlength);
	                    IframeField.triggerResize(id);
	                    break;
	                case "set-text":
	                    actionSetText(data.data.text);
	                    IframeField.triggerResize(id);
	                    break;
	                case "set-value":
	                    actionSetValue(data.data.value);
	                    IframeField.triggerResize(id);
	                    break;
	                case "set-label":
	                    actionSetLabel(data.data.label);
	                    IframeField.triggerResize(id);
	                    break;
	                case InstallmentEvents.CardInstallmentsRequestStart:
	                    actionCardRequestInstallments(id, data.data);
	                    break;
	                case "update-options":
	                    for (var prop in data.data) {
	                        if (data.data.hasOwnProperty(prop)) {
	                            options[prop] = data.data[prop];
	                        }
	                    }
	                    break;
	            }
	        });
	    };
	    /**
	     * Triggers a resize of the hosted field's iframe element
	     * within the parent window.
	     *
	     * @param id ID of the hosted field
	     */
	    IframeField.triggerResize = function (id) {
	        postMessage.post({
	            data: {
	                height: document.body.offsetHeight + 1,
	            },
	            id: id,
	            type: "ui:iframe-field:resize",
	        }, "parent");
	    };
	    /**
	     * Appends additional CSS rules to the hosted field
	     *
	     * @param json New CSS rules
	     */
	    IframeField.prototype.addStylesheet = function (json) {
	        var css = json2css(json);
	        postMessage.post({
	            data: { css: css },
	            id: this.id,
	            type: "ui:iframe-field:add-stylesheet",
	        }, this.id);
	    };
	    /**
	     * Gets the CVV value from the `card-cvv` hosted field.
	     *
	     * Used by gateway implementations that do not store the CVV
	     * with the token value:
	     *
	     * - TransIT (tsep)
	     * - Heartland Bill pay (billpay)
	     *
	     * @returns A promise that resolves with the CVV value
	     */
	    IframeField.prototype.getCvv = function () {
	        var _this = this;
	        postMessage.post({
	            id: this.id,
	            type: "ui:iframe-field:get-cvv",
	        }, this.id);
	        return new Promise(function (resolve) {
	            postMessage.receive(function (data) {
	                if (!data.id || (data.id && data.id !== _this.id)) {
	                    return;
	                }
	                var event = data.type.replace("ui:iframe-field:", "");
	                if (event === "get-cvv") {
	                    resolve(data.data);
	                    return;
	                }
	            });
	        });
	    };
	    /**
	     * Sets input focus on the hosted field
	     */
	    IframeField.prototype.setFocus = function () {
	        postMessage.post({
	            id: this.id,
	            type: "ui:iframe-field:set-focus",
	        }, this.id);
	    };
	    /**
	     * Sets the placeholder text of a hosted field
	     *
	     * @param placeholder The desired palceholder text
	     */
	    IframeField.prototype.setPlaceholder = function (placeholder) {
	        postMessage.post({
	            data: { placeholder: placeholder },
	            id: this.id,
	            type: "ui:iframe-field:set-placeholder",
	        }, this.id);
	    };
	    /**
	     * Sets the text content of a hosted field
	     *
	     * @param text The desired text value
	     */
	    IframeField.prototype.setText = function (text) {
	        postMessage.post({
	            data: { text: text },
	            id: this.id,
	            type: "ui:iframe-field:set-text",
	        }, this.id);
	    };
	    /**
	     * Sets the value of a hosted field
	     *
	     * @param value The desired input value
	     */
	    IframeField.prototype.setValue = function (value) {
	        postMessage.post({
	            data: { value: value },
	            id: this.id,
	            type: "ui:iframe-field:set-value",
	        }, this.id);
	    };
	    /**
	     * Sets the label of a hosted field
	     *
	     * @param label The desired input label
	     */
	    IframeField.prototype.setLabel = function (label) {
	        postMessage.post({
	            data: { label: label },
	            id: this.id,
	            type: "ui:iframe-field:set-label",
	        }, this.id);
	    };
	    /**
	     * Sets the title of a hosted field
	     *
	     * @param title The desired title
	     */
	    IframeField.prototype.setTitle = function (title) {
	        this.frame.title = title;
	    };
	    IframeField.prototype.makeFrame = function (type, id, opts) {
	        var frame = document.createElement("iframe");
	        frame.id = "secure-payment-field-" + type + "-" + id;
	        frame.name = type;
	        if (opts.title || opts.label) {
	            frame.title = opts.title || opts.label || "";
	        }
	        frame.style.border = "0";
	        frame.style.height = "50px";
	        frame.frameBorder = "0";
	        frame.scrolling = "no";
	        frame.setAttribute("allowtransparency", "true");
	        frame.allowPaymentRequest = true;
	        return frame;
	    };
	    return IframeField;
	}(lib.EventEmitter));

	function addClickToPay(iframeField, field) {
	    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
	    var gateway = getGateway();
	    if (!((_a = options.apms) === null || _a === void 0 ? void 0 : _a.clickToPay) || ((_b = gateway === null || gateway === void 0 ? void 0 : gateway.supports.apm) === null || _b === void 0 ? void 0 : _b.clickToPay) === false)
	        return;
	    var allowedCardNetworks = ((_d = (_c = options.apms) === null || _c === void 0 ? void 0 : _c.clickToPay) === null || _d === void 0 ? void 0 : _d.allowedCardNetworks) ? (_f = (_e = options.apms) === null || _e === void 0 ? void 0 : _e.clickToPay) === null || _f === void 0 ? void 0 : _f.allowedCardNetworks : (_g = options.apms) === null || _g === void 0 ? void 0 : _g.allowedCardNetworks;
	    var currencyCode = ((_j = (_h = options.apms) === null || _h === void 0 ? void 0 : _h.clickToPay) === null || _j === void 0 ? void 0 : _j.currencyCode) ? (_l = (_k = options.apms) === null || _k === void 0 ? void 0 : _k.clickToPay) === null || _l === void 0 ? void 0 : _l.currencyCode : (_m = options.apms) === null || _m === void 0 ? void 0 : _m.currencyCode;
	    var canadianDebit = (_p = (_o = options.apms) === null || _o === void 0 ? void 0 : _o.clickToPay) === null || _p === void 0 ? void 0 : _p.canadianDebit;
	    var ctpClientId = (_r = (_q = options.apms) === null || _q === void 0 ? void 0 : _q.clickToPay) === null || _r === void 0 ? void 0 : _r.ctpClientId;
	    var subtotal = field.amount;
	    var amount = subtotal ? parseFloat(subtotal) : 0;
	    var missingConfig = [];
	    if (!allowedCardNetworks || allowedCardNetworks.length === 0) {
	        missingConfig.push('allowedCardNetworks');
	    }
	    if (!currencyCode) {
	        missingConfig.push('currencyCode');
	    }
	    if (amount === 0) {
	        missingConfig.push('amount');
	    }
	    if (!ctpClientId) {
	        missingConfig.push('ctpClientId');
	    }
	    if (missingConfig.length) {
	        var error = {
	            error: true,
	            reasons: [{
	                    code: "ERROR",
	                    message: "Missing " + missingConfig.toString(),
	                }],
	        };
	        return bus.emit('error', error);
	    }
	    if (((_t = (_s = options.apms) === null || _s === void 0 ? void 0 : _s.clickToPay) === null || _t === void 0 ? void 0 : _t.buttonless) === true) {
	        addClickToPayCDN();
	    }
	    else {
	        addCTPButton();
	    }
	    function addCDN(url, onload) {
	        var script = document.createElement("script");
	        script.onload = onload;
	        script.src = url;
	        script.async = true;
	        document.body.appendChild(script);
	    }
	    function addClickToPayCDN() {
	        var url = gateway && gateway.getEnv(options) === "production" ? 'https://ctps-cdn.gpapiservices.com/ctp-element.js' : "https://ctpscert-cdn.gpapiservices.com/ctp-element.js";
	        addCDN(url, onClickToPayLoaded);
	    }
	    function onClickToPayLoaded() {
	        addCTPElement();
	        addCTPEventsListeners();
	    }
	    function createHtmlElement(htmlElement, className) {
	        var htmlDivElement = document.createElement(htmlElement);
	        if (className) {
	            htmlDivElement.className = className;
	        }
	        return htmlDivElement;
	    }
	    function createCTPButton() {
	        var btn = createHtmlElement('div', 'ctp-button');
	        btn.innerHTML = "\n      <div class=\"ctp-header\">\n        <div class=\"heading\">Checkout with your <span class=\"ctp-icon\"></span>Click to Pay card(s) </div>\n        <div class=\"subheading\">enabled by <span class=\"card-brands\"></span>\n          <div class=\"ctp-info-tooltip\">\n            <div class=\"ctp-info-tooltip-content\">\n              <span class=\"top-arrow\"></span>\n              <span class=\"ctp-icon\"></span><strong>Click to Pay</strong>\n              <div class=\"subheading\">enabled by <span class=\"card-brands\"></span></div>\n              <ul>\n                <li class=\"smart-checkout\">For easy and smart checkout, simply click to pay whenever you see the Click to Pay icon <span class=\"ctp-icon\"></span>, and your card is accepted.</li>\n                <li class=\"faster-checkout\">You can choose to be remembered on your device and browser for faster checkout.</li>\n                <li class=\"industry-standards\">Built on industry standards for online transactions and supported by global payment brands.</li>\n              </ul>\n            </div>\n          </div>\n        </div>\n        <span class=\"right-arrow\"></span>\n      </div>";
	        return btn;
	    }
	    function addCTPButton() {
	        var _a;
	        var ctpPanel = createHtmlElement('div', 'ctp-panel');
	        var ctpButton = createCTPButton();
	        ctpPanel.appendChild(ctpButton);
	        (_a = iframeField === null || iframeField === void 0 ? void 0 : iframeField.container) === null || _a === void 0 ? void 0 : _a.appendChild(ctpPanel);
	        ctpButton.addEventListener('click', function (e) {
	            e.preventDefault();
	            e.stopPropagation();
	            var isCTPLoaded = document.querySelectorAll('ctp-element');
	            if (isCTPLoaded.length === 0) {
	                addClickToPayCDN();
	            }
	        });
	    }
	    function ctpInfoTooltip() {
	        var tooltip = document.createElement('div');
	        tooltip.className = "ctp-info-tooltip";
	        tooltip.innerHTML = "<div class=\"ctp-info-tooltip-content\">\n        <span class=\"top-arrow\"></span>\n        <span class=\"ctp-icon\"></span><strong>Click to Pay</strong>\n        <div class=\"subheading\">enabled by <span class=\"card-brands\"></span></div>\n        <ul>\n          <li class=\"smart-checkout\">For easy and smart checkout, simply click to pay whenever you see the Click to Pay icon <span class=\"ctp-icon\"></span>, and your card is accepted.</li>\n          <li class=\"faster-checkout\">You can choose to be remembered on your device and browser for faster checkout.</li>\n          <li class=\"industry-standards\">Built on industry standards for online transactions and supported by global payment brands.</li>\n        </ul>\n      </div>";
	        return tooltip;
	    }
	    function addCtpHeading(parent) {
	        var label = document.createElement('div');
	        label.className = "ctp-heading";
	        label.innerHTML = "Express checkout with Click to Pay";
	        var infoTooltip = ctpInfoTooltip();
	        label.appendChild(infoTooltip);
	        parent.prepend(label);
	    }
	    function createCTPElement() {
	        var _a, _b;
	        var ctpElement = createHtmlElement('ctp-element');
	        if (((_b = (_a = options.apms) === null || _a === void 0 ? void 0 : _a.clickToPay) === null || _b === void 0 ? void 0 : _b.buttonless) === false) {
	            ctpElement.classList.add('hidden');
	        }
	        ctpElement.setAttribute('init-prop', ctpClientId);
	        if (Array.isArray(allowedCardNetworks)) {
	            ctpElement.setAttribute('card-brands', JSON.stringify(allowedCardNetworks));
	        }
	        if (typeof currencyCode === "string") {
	            ctpElement.setAttribute('currency-code', currencyCode);
	        }
	        if (typeof subtotal === "string") {
	            ctpElement.setAttribute('subtotal', subtotal);
	        }
	        if (canadianDebit) {
	            ctpElement.setAttribute('canadian-debit', canadianDebit.toString());
	        }
	        ctpElement.setAttribute('wrapper', "false");
	        return ctpElement;
	    }
	    function addCTPElement() {
	        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
	        var ctpElement = createCTPElement();
	        if (((_b = (_a = options.apms) === null || _a === void 0 ? void 0 : _a.clickToPay) === null || _b === void 0 ? void 0 : _b.buttonless) === true) {
	            (_c = iframeField === null || iframeField === void 0 ? void 0 : iframeField.container) === null || _c === void 0 ? void 0 : _c.appendChild(ctpElement);
	            addCtpHeading(iframeField === null || iframeField === void 0 ? void 0 : iframeField.container);
	        }
	        else {
	            (_e = (_d = iframeField === null || iframeField === void 0 ? void 0 : iframeField.container) === null || _d === void 0 ? void 0 : _d.querySelector('.ctp-panel')) === null || _e === void 0 ? void 0 : _e.appendChild(ctpElement);
	            (_g = (_f = iframeField === null || iframeField === void 0 ? void 0 : iframeField.container) === null || _f === void 0 ? void 0 : _f.querySelector('ctp-element')) === null || _g === void 0 ? void 0 : _g.classList.remove('hidden');
	            (_j = (_h = iframeField === null || iframeField === void 0 ? void 0 : iframeField.container) === null || _h === void 0 ? void 0 : _h.parentElement) === null || _j === void 0 ? void 0 : _j.classList.add('apm-active');
	            var isApmForm = (_k = field.target) === null || _k === void 0 ? void 0 : _k.split(' ').some(function (c) { return c.startsWith('#apm'); });
	            if (!isApmForm) {
	                ctpElement.setAttribute('wrapper', 'true');
	            }
	        }
	        ctpElement.addEventListener('click', function (e) {
	            var element = e.target;
	            if (element.tagName === "BUTTON" || element.tagName === "LABEL") {
	                e.preventDefault();
	                e.stopPropagation();
	            }
	        }, false);
	        ctpElement.addEventListener('keydown', function (e) {
	            if (e.key === 'Enter') {
	                e.preventDefault();
	                e.stopPropagation();
	            }
	        });
	    }
	    function addCTPEventsListeners() {
	        var _this = this;
	        window.addEventListener('ctp-callid', function (e) { return __awaiter(_this, void 0, void 0, function () {
	            var customEvt, response;
	            var _a, _b;
	            return __generator(this, function (_c) {
	                customEvt = e;
	                if (((_a = customEvt.detail) === null || _a === void 0 ? void 0 : _a.callid) !== undefined) {
	                    response = {
	                        details: {
	                            apmProvider: "click-to-pay"
	                        },
	                        paymentReference: (_b = customEvt.detail) === null || _b === void 0 ? void 0 : _b.callid
	                    };
	                    iframeField === null || iframeField === void 0 ? void 0 : iframeField.emit('token-success', response);
	                }
	                return [2 /*return*/];
	            });
	        }); });
	        window.addEventListener('ctp-error', function (e) { return __awaiter(_this, void 0, void 0, function () {
	            var customEvt, error;
	            return __generator(this, function (_a) {
	                customEvt = e;
	                if (customEvt.detail !== undefined) {
	                    error = {
	                        error: true,
	                        reasons: [{
	                                code: customEvt.detail.code,
	                                message: customEvt.detail.message,
	                            }],
	                    };
	                    iframeField === null || iframeField === void 0 ? void 0 : iframeField.emit('token-error', error);
	                }
	                return [2 /*return*/];
	            });
	        }); });
	        window.addEventListener('ctp-cancel', function (e) { return __awaiter(_this, void 0, void 0, function () {
	            return __generator(this, function (_a) {
	                document.location.reload();
	                return [2 /*return*/];
	            });
	        }); });
	    }
	}

	function addGooglePay(iframeField, field) {
	    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
	    var gateway = getGateway();
	    if (!((_a = options.apms) === null || _a === void 0 ? void 0 : _a.googlePay) || ((_b = gateway === null || gateway === void 0 ? void 0 : gateway.supports.apm) === null || _b === void 0 ? void 0 : _b.googlePay) === false)
	        return;
	    var missingConfig = [];
	    var amount = field.amount;
	    var allowedCardNetworks = ((_d = (_c = options.apms) === null || _c === void 0 ? void 0 : _c.googlePay) === null || _d === void 0 ? void 0 : _d.allowedCardNetworks) ? (_f = (_e = options.apms) === null || _e === void 0 ? void 0 : _e.googlePay) === null || _f === void 0 ? void 0 : _f.allowedCardNetworks : (_g = options.apms) === null || _g === void 0 ? void 0 : _g.allowedCardNetworks;
	    var allowedCardAuthMethods = (_j = (_h = options.apms) === null || _h === void 0 ? void 0 : _h.googlePay) === null || _j === void 0 ? void 0 : _j.allowedAuthMethods;
	    var currencyCode = ((_l = (_k = options.apms) === null || _k === void 0 ? void 0 : _k.googlePay) === null || _l === void 0 ? void 0 : _l.currencyCode) ? (_o = (_m = options.apms) === null || _m === void 0 ? void 0 : _m.googlePay) === null || _o === void 0 ? void 0 : _o.currencyCode : (_p = options.apms) === null || _p === void 0 ? void 0 : _p.currencyCode;
	    if (!allowedCardNetworks || allowedCardNetworks.length === 0) {
	        missingConfig.push('allowedCardNetworks');
	    }
	    if (!currencyCode) {
	        missingConfig.push('currencyCode');
	    }
	    if (!amount) {
	        missingConfig.push('amount');
	    }
	    if (missingConfig.length) {
	        var error = {
	            error: true,
	            reasons: [{
	                    code: "ERROR",
	                    message: "Missing " + missingConfig.toString(),
	                }],
	        };
	        return bus.emit('error', error);
	    }
	    addGooglePayCDN();
	    function addGooglePayCDN() {
	        var script = document.createElement("script");
	        script.onload = onGooglePayLoaded;
	        script.src = "https://pay.google.com/gp/p/js/pay.js";
	        script.async = true;
	        document.body.appendChild(script);
	    }
	    /**
	     * Define the version of the Google Pay API referenced when creating your configuration
	     */
	    var baseRequest = {
	        apiVersion: 2,
	        apiVersionMinor: 0
	    };
	    /**
	     * Identify site's gateway merchant identifier
	     *
	     * The Google Pay API response will return an encrypted payment method capable
	     * of being charged by a supported gateway after payer authorization
	     *
	     */
	    var tokenizationSpecification = {
	        type: 'PAYMENT_GATEWAY',
	        parameters: {
	            'gateway': "globalpayments",
	            'gatewayMerchantId': (_r = (_q = options.apms) === null || _q === void 0 ? void 0 : _q.googlePay) === null || _r === void 0 ? void 0 : _r.globalPaymentsClientID
	        }
	    };
	    /**
	     * Describe your site's support for the CARD payment method and its required fields
	     */
	    var baseCardPaymentMethod = {
	        type: 'CARD',
	        parameters: {
	            allowedAuthMethods: allowedCardAuthMethods,
	            allowedCardNetworks: allowedCardNetworks,
	            billingAddressRequired: true,
	            billingAddressParameters: {
	                format: 'FULL',
	                phoneNumberRequired: true
	            }
	        }
	    };
	    /**
	     * Describe your site's support for the CARD payment method including optional fields
	     */
	    var cardPaymentMethod = Object.assign({}, baseCardPaymentMethod, {
	        tokenizationSpecification: tokenizationSpecification
	    });
	    /**
	     * An initialized google.payments.api.PaymentsClient object or null if not yet set
	     *
	     */
	    var paymentsClient = null;
	    function getGoogleIsReadyToPayRequest() {
	        return Object.assign({}, baseRequest, {
	            allowedPaymentMethods: [baseCardPaymentMethod]
	        });
	    }
	    /**
	     * Configure support for the Google Pay API
	     * @returns {object} PaymentDataRequest fields
	     */
	    function getGooglePaymentDataRequest() {
	        var _a, _b, _c, _d;
	        var paymentDataRequest = Object.assign({}, baseRequest);
	        paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
	        paymentDataRequest.transactionInfo = getGoogleTransactionInfo();
	        paymentDataRequest.merchantInfo = {
	            merchantName: (_b = (_a = options.apms) === null || _a === void 0 ? void 0 : _a.googlePay) === null || _b === void 0 ? void 0 : _b.merchantName,
	            merchantId: (_d = (_c = options.apms) === null || _c === void 0 ? void 0 : _c.googlePay) === null || _d === void 0 ? void 0 : _d.merchantId
	        };
	        paymentDataRequest.callbackIntents = ["SHIPPING_ADDRESS", "PAYMENT_AUTHORIZATION"];
	        paymentDataRequest.shippingAddressRequired = true;
	        paymentDataRequest.shippingAddressParameters = getGoogleShippingAddressParameters();
	        paymentDataRequest.emailRequired = true;
	        return paymentDataRequest;
	    }
	    /**
	     * Return an active PaymentsClient or initialize
	     * @returns {google.payments.api.PaymentsClient} Google Pay API client
	     */
	    function getGooglePaymentsClient() {
	        var _a, _b, _c, _d;
	        if (paymentsClient === null) {
	            // @ts-ignore
	            paymentsClient = new google.payments.api.PaymentsClient({
	                environment: gateway && gateway.getEnv(options) === "production" ? 'PRODUCTION' : 'TEST',
	                merchantInfo: {
	                    merchantName: (_b = (_a = options.apms) === null || _a === void 0 ? void 0 : _a.googlePay) === null || _b === void 0 ? void 0 : _b.merchantName,
	                    merchantId: (_d = (_c = options.apms) === null || _c === void 0 ? void 0 : _c.googlePay) === null || _d === void 0 ? void 0 : _d.merchantId
	                },
	                paymentDataCallbacks: {
	                    onPaymentAuthorized: onPaymentAuthorized,
	                    onPaymentDataChanged: onPaymentDataChanged
	                }
	            });
	        }
	        return paymentsClient;
	    }
	    function onPaymentAuthorized(paymentData) {
	        return new Promise(function (resolve, reject) {
	            // handle the response
	            processPayment(paymentData)
	                .then(function () {
	                resolve({ transactionState: 'SUCCESS' });
	            })["catch"](function () {
	                resolve({
	                    transactionState: 'ERROR',
	                    error: {
	                        intent: 'PAYMENT_AUTHORIZATION',
	                        message: 'Insufficient funds',
	                        reason: 'PAYMENT_DATA_INVALID'
	                    }
	                });
	            });
	        });
	    }
	    /**
	     * Process payment data returned by the Google Pay API
	     * @param {object} paymentData response from Google Pay API after user approves payment
	     */
	    function processPayment(paymentData) {
	        return new Promise(function (resolve, reject) {
	            setTimeout(function () {
	                sendTokenPayment(paymentData);
	                resolve({});
	            }, 3000);
	        });
	    }
	    /**
	     * Handles dynamic buy flow shipping address and shipping options callback intents.
	     * @param {object} itermediatePaymentData response from Google Pay API a shipping address or shipping option is selected in the payment sheet.
	     * @returns Promise<{object}> Promise of PaymentDataRequestUpdate object to update the payment sheet.
	     */
	    function onPaymentDataChanged(intermediatePaymentData) {
	        return new Promise(function (resolve, reject) {
	            var shippingAddress = intermediatePaymentData.shippingAddress;
	            var paymentDataRequestUpdate = {};
	            if (intermediatePaymentData.callbackTrigger === "INITIALIZE" || intermediatePaymentData.callbackTrigger === "SHIPPING_ADDRESS") {
	                if (shippingAddress.administrativeArea === "NJ") {
	                    paymentDataRequestUpdate.error = getGoogleUnserviceableAddressError();
	                }
	            }
	            resolve(paymentDataRequestUpdate);
	        });
	    }
	    /**
	     * Provide Google Pay API with a payment data error.
	     * @returns {object} payment data error, suitable for use as error property of PaymentDataRequestUpdate
	     */
	    function getGoogleUnserviceableAddressError() {
	        return {
	            reason: "SHIPPING_ADDRESS_UNSERVICEABLE",
	            message: "Cannot ship to the selected address",
	            intent: "SHIPPING_ADDRESS"
	        };
	    }
	    /**
	     * Initialize Google PaymentsClient after Google-hosted JavaScript has loaded
	     * Display a Google Pay payment button after confirmation of the viewer's ability to pay.
	     */
	    function onGooglePayLoaded() {
	        var googlePaymentsClient = getGooglePaymentsClient();
	        googlePaymentsClient.isReadyToPay(getGoogleIsReadyToPayRequest())
	            .then(function (response) {
	            if (response.result) {
	                addGooglePayButton();
	            }
	        })["catch"](function (err) {
	            var error = {
	                error: true,
	                reasons: [{
	                        code: "ERROR",
	                        message: err,
	                    }],
	            };
	            return bus.emit('error', error);
	        });
	    }
	    /**
	     * Add a Google Pay purchase button alongside an existing checkout button
	     */
	    function addGooglePayButton() {
	        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
	        var payments = getGooglePaymentsClient();
	        var button = payments.createButton({
	            onClick: onGooglePaymentButtonClicked,
	            allowedPaymentMethods: [baseCardPaymentMethod],
	            buttonColor: ((_b = (_a = options.apms) === null || _a === void 0 ? void 0 : _a.googlePay) === null || _b === void 0 ? void 0 : _b.buttonColor) ? (_d = (_c = options.apms) === null || _c === void 0 ? void 0 : _c.googlePay) === null || _d === void 0 ? void 0 : _d.buttonColor : 'black',
	            buttonType: ((_f = (_e = options.apms) === null || _e === void 0 ? void 0 : _e.googlePay) === null || _f === void 0 ? void 0 : _f.buttonType) ? (_h = (_g = options.apms) === null || _g === void 0 ? void 0 : _g.googlePay) === null || _h === void 0 ? void 0 : _h.buttonType : 'pay',
	            buttonLocale: (_k = (_j = options.apms) === null || _j === void 0 ? void 0 : _j.googlePay) === null || _k === void 0 ? void 0 : _k.buttonLocale,
	            buttonSizeMode: ((_m = (_l = options.apms) === null || _l === void 0 ? void 0 : _l.googlePay) === null || _m === void 0 ? void 0 : _m.buttonSizeMode) ? (_p = (_o = options.apms) === null || _o === void 0 ? void 0 : _o.googlePay) === null || _p === void 0 ? void 0 : _p.buttonSizeMode : 'fill',
	        });
	        button.setAttribute('id', "googlePay");
	        (_q = iframeField === null || iframeField === void 0 ? void 0 : iframeField.container) === null || _q === void 0 ? void 0 : _q.append(button);
	    }
	    /**
	     * Provide Google Pay API with shipping address parameters when using dynamic buy flow.
	     * @returns {object} shipping address details, suitable for use as shippingAddressParameters property of PaymentDataRequest
	     */
	    function getGoogleShippingAddressParameters() {
	        return {
	            phoneNumberRequired: true
	        };
	    }
	    /**
	     * Provide Google Pay API with a payment amount, currency, and amount status
	     * @returns {object} transaction info, suitable for use as transactionInfo property of PaymentDataRequest
	     */
	    function getGoogleTransactionInfo() {
	        var _a, _b;
	        return {
	            countryCode: (_b = (_a = options.apms) === null || _a === void 0 ? void 0 : _a.googlePay) === null || _b === void 0 ? void 0 : _b.countryCode,
	            currencyCode: currencyCode,
	            totalPriceStatus: 'FINAL',
	            totalPrice: amount,
	        };
	    }
	    /**
	     * Show Google Pay payment sheet when Google Pay payment button is clicked
	     */
	    function onGooglePaymentButtonClicked() {
	        var paymentDataRequest = getGooglePaymentDataRequest();
	        paymentDataRequest.transactionInfo = getGoogleTransactionInfo();
	        var payments = getGooglePaymentsClient();
	        payments.loadPaymentData(paymentDataRequest);
	    }
	    function sendTokenPayment(paymentData) {
	        var _a, _b;
	        var googleShippingAddress = getGooglePaymentAddress(paymentData.shippingAddress);
	        var googleBillingAddress = getGooglePaymentAddress(paymentData.paymentMethodData.info.billingAddress);
	        var response = {
	            details: {
	                apmProvider: "PAY_BY_GOOGLE",
	            },
	            paymentReference: paymentData.paymentMethodData.tokenizationData.token
	        };
	        if (googleShippingAddress !== '') {
	            response.shippingAddress = googleShippingAddress;
	        }
	        if (googleBillingAddress !== '') {
	            response.details.billingAddress = googleBillingAddress;
	        }
	        if (paymentData.email && paymentData.email !== '') {
	            response.payerEmail = paymentData.email;
	        }
	        if (((_a = paymentData.shippingAddress) === null || _a === void 0 ? void 0 : _a.phoneNumber) && ((_b = paymentData.shippingAddress) === null || _b === void 0 ? void 0 : _b.phoneNumber) !== '') {
	            response.payerPhone = paymentData.shippingAddress.phoneNumber;
	        }
	        iframeField === null || iframeField === void 0 ? void 0 : iframeField.emit('token-success', response);
	    }
	    function getGooglePaymentAddress(paymentAddress) {
	        if (paymentAddress) {
	            var shippingAddressLine = [paymentAddress.address1, paymentAddress.address2, paymentAddress.address3];
	            var paymentShippingAddress = {
	                addressLine: shippingAddressLine.filter(function (str) { return str !== ''; }),
	                city: paymentAddress.locality,
	                country: paymentAddress.countryCode,
	                phone: paymentAddress.phoneNumber,
	                postalCode: paymentAddress.postalCode,
	                name: paymentAddress.name
	            };
	            return paymentShippingAddress;
	        }
	        else
	            return '';
	    }
	}

	function addApplePay(iframeField, field) {
	    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
	    var gateway = getGateway();
	    if (!((_a = options.apms) === null || _a === void 0 ? void 0 : _a.applePay) || ((_b = gateway === null || gateway === void 0 ? void 0 : gateway.supports.apm) === null || _b === void 0 ? void 0 : _b.applePay) === false)
	        return;
	    var missingConfig = [];
	    var total = field.amount;
	    var allowedCardNetworks = ((_d = (_c = options.apms) === null || _c === void 0 ? void 0 : _c.applePay) === null || _d === void 0 ? void 0 : _d.allowedCardNetworks) ? (_f = (_e = options.apms) === null || _e === void 0 ? void 0 : _e.applePay) === null || _f === void 0 ? void 0 : _f.allowedCardNetworks : (_g = options.apms) === null || _g === void 0 ? void 0 : _g.allowedCardNetworks;
	    var currencyCode = ((_j = (_h = options.apms) === null || _h === void 0 ? void 0 : _h.applePay) === null || _j === void 0 ? void 0 : _j.currencyCode) ? (_l = (_k = options.apms) === null || _k === void 0 ? void 0 : _k.applePay) === null || _l === void 0 ? void 0 : _l.currencyCode : (_m = options.apms) === null || _m === void 0 ? void 0 : _m.currencyCode;
	    if (!allowedCardNetworks || allowedCardNetworks.length === 0) {
	        missingConfig.push('allowedCardNetworks');
	    }
	    if (!currencyCode) {
	        missingConfig.push('currencyCode');
	    }
	    if (!total) {
	        missingConfig.push('amount');
	    }
	    if (missingConfig.length) {
	        var error = {
	            error: true,
	            reasons: [{
	                    code: "ERROR",
	                    message: "Missing " + missingConfig.toString(),
	                }],
	        };
	        return bus.emit('error', error);
	    }
	    addApplePayCDN();
	    function addApplePayCDN() {
	        var script = document.createElement("script");
	        script.onload = onApplePayLoaded;
	        script.src = "https://applepay.cdn-apple.com/jsapi/v1/apple-pay-sdk.js";
	        document.body.appendChild(script);
	    }
	    function onApplePayLoaded() {
	        var _a, _b;
	        // @ts-ignore
	        if (window.ApplePaySession && ApplePaySession.supportsVersion((_b = (_a = options.apms) === null || _a === void 0 ? void 0 : _a.applePay) === null || _b === void 0 ? void 0 : _b.applePayVersionNumber) && ApplePaySession.canMakePayments()) {
	            addApplePayButton();
	        }
	    }
	    function addApplePayButton() {
	        var _a;
	        var ctpElement = createApplePayElement();
	        (_a = iframeField === null || iframeField === void 0 ? void 0 : iframeField.container) === null || _a === void 0 ? void 0 : _a.appendChild(ctpElement);
	    }
	    function createHtmlElement(htmlElement, className) {
	        var htmlDivElement = document.createElement(htmlElement);
	        if (className) {
	            htmlDivElement.className = className;
	        }
	        return htmlDivElement;
	    }
	    function createApplePayElement() {
	        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
	        var applePayBtn = createHtmlElement('apple-pay-button');
	        applePayBtn.setAttribute('class', 'apple-pay-button');
	        applePayBtn.setAttribute('buttonstyle', ((_b = (_a = options.apms) === null || _a === void 0 ? void 0 : _a.applePay) === null || _b === void 0 ? void 0 : _b.buttonStyle) ? (_c = options.apms) === null || _c === void 0 ? void 0 : _c.applePay.buttonStyle : 'black');
	        applePayBtn.setAttribute('type', ((_e = (_d = options.apms) === null || _d === void 0 ? void 0 : _d.applePay) === null || _e === void 0 ? void 0 : _e.buttonType) ? (_f = options.apms) === null || _f === void 0 ? void 0 : _f.applePay.buttonType : 'pay');
	        applePayBtn.setAttribute('locale', ((_h = (_g = options.apms) === null || _g === void 0 ? void 0 : _g.applePay) === null || _h === void 0 ? void 0 : _h.buttonLocale) ? (_k = (_j = options.apms) === null || _j === void 0 ? void 0 : _j.applePay) === null || _k === void 0 ? void 0 : _k.buttonLocale : 'en-US');
	        applePayBtn.addEventListener('click', function () {
	            onApplePayButtonClicked();
	        });
	        return applePayBtn;
	    }
	    /**
	     * Apple Pay Logic
	     * Our entry point for Apple Pay interactions.
	     * Triggered when the Apple Pay button is pressed
	     */
	    // session is an instance of the Session object, which is the main entry point for the SDK
	    function onApplePayButtonClicked() {
	        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
	        // Initialise the Apple Pay Payment Request
	        var applePayPaymentRequest = {
	            countryCode: (_b = (_a = options.apms) === null || _a === void 0 ? void 0 : _a.applePay) === null || _b === void 0 ? void 0 : _b.countryCode,
	            currencyCode: (_d = (_c = options.apms) === null || _c === void 0 ? void 0 : _c.applePay) === null || _d === void 0 ? void 0 : _d.currencyCode,
	            merchantCapabilities: (_f = (_e = options.apms) === null || _e === void 0 ? void 0 : _e.applePay) === null || _f === void 0 ? void 0 : _f.merchantCapabilities,
	            requiredBillingContactFields: ['postalAddress', 'name', 'phone', 'email'],
	            requiredShippingContactFields: ['postalAddress', 'name', 'phone', 'email'],
	            supportedNetworks: allowedCardNetworks,
	            total: {
	                label: (_h = (_g = options.apms) === null || _g === void 0 ? void 0 : _g.applePay) === null || _h === void 0 ? void 0 : _h.merchantName,
	                amount: total,
	                type: 'final'
	            }
	        };
	        // @ts-ignore
	        var applePaySession = new ApplePaySession((_k = (_j = options.apms) === null || _j === void 0 ? void 0 : _j.applePay) === null || _k === void 0 ? void 0 : _k.applePayVersionNumber, applePayPaymentRequest);
	        handleApplePayEvents(applePaySession);
	        // Start Apple Pay
	        applePaySession.begin();
	    }
	    /**
	     * Get the Apple Payment Address from AddressLine payment data
	     *
	     * @param {object} Apple Payment Address
	     *
	     */
	    function getApplePaymentAddress(paymentAddress) {
	        if (paymentAddress) {
	            var shippingAddressLine = paymentAddress.addressLines;
	            var paymentShippingAddress = {
	                addressLine: shippingAddressLine.filter(function (str) { return str !== ''; }),
	                city: paymentAddress.locality,
	                country: paymentAddress.countryCode,
	                phone: paymentAddress.phoneNumber,
	                postalCode: paymentAddress.postalCode,
	                name: paymentAddress.givenName + " " + paymentAddress.familyName
	            };
	            return paymentShippingAddress;
	        }
	        else
	            return '';
	    }
	    /**
	     * Handle the Apple Pay events. Here you are able to populate your shipping methods, react to  shipping methods
	     * changes, and many other interaction that the user has with the Apple Pay pup-up.
	     *
	     * @param {object} Apple Pay Session (the one generate on the button click)
	     *
	     */
	    function handleApplePayEvents(applePaySession) {
	        if (applePaySession) {
	            // This is the first event that Apple triggers.
	            // Here you need to validate the Apple Pay Session from your Back-End
	            applePaySession.onvalidatemerchant = function (event) {
	                var _a, _b, _c, _d, _e, _f, _g, _h;
	                var merchantSessionUrl = (_b = (_a = options.apms) === null || _a === void 0 ? void 0 : _a.applePay) === null || _b === void 0 ? void 0 : _b.merchantSessionUrl;
	                var newHeaders = (_d = (_c = options.apms) === null || _c === void 0 ? void 0 : _c.applePay) === null || _d === void 0 ? void 0 : _d.validateMerchantHeaders;
	                var defaultHeaders = {
	                    'Content-Type': 'application/json',
	                    'Accept': 'application/json'
	                };
	                var headers = newHeaders ? Object.assign({}, defaultHeaders, newHeaders) : defaultHeaders;
	                var body = {
	                    initiative_context: window.location.hostname,
	                    merchantIdentifier: (_f = (_e = options.apms) === null || _e === void 0 ? void 0 : _e.applePay) === null || _f === void 0 ? void 0 : _f.merchantIdentifier,
	                    merchantName: (_h = (_g = options.apms) === null || _g === void 0 ? void 0 : _g.applePay) === null || _h === void 0 ? void 0 : _h.merchantName,
	                    validation_url: event.validationURL
	                };
	                try {
	                    fetch(merchantSessionUrl, {
	                        method: 'POST',
	                        headers: headers,
	                        body: JSON.stringify(body)
	                    }).then(function (response) {
	                        return response.json();
	                    }).then(function (json) {
	                        applePaySession.completeMerchantValidation(json);
	                    });
	                }
	                catch (err) {
	                    var error = {
	                        error: true,
	                        reasons: [{
	                                code: "ERROR",
	                                message: err,
	                            }],
	                    };
	                    return bus.emit('error', error);
	                }
	            };
	            // This method is triggered when a user select one of the shipping options.
	            // Here you generally want to keep track of the transaction amount
	            applePaySession.onshippingmethodselected = function (event) {
	                var _a, _b;
	                var update = {
	                    newTotal: {
	                        label: (_b = (_a = options.apms) === null || _a === void 0 ? void 0 : _a.applePay) === null || _b === void 0 ? void 0 : _b.merchantName,
	                        type: "final",
	                        amount: total
	                    }
	                };
	                // @ts-ignore
	                applePaySession.completeShippingMethodSelection(update);
	            };
	            // This method is triggered before populating the shipping methods.
	            // This is the perfect place inject your shipping methods
	            applePaySession.onshippingcontactselected = function (event) {
	                var _a, _b;
	                var update = {
	                    newTotal: {
	                        label: (_b = (_a = options.apms) === null || _a === void 0 ? void 0 : _a.applePay) === null || _b === void 0 ? void 0 : _b.merchantName,
	                        type: "final",
	                        amount: total
	                    }
	                };
	                // @ts-ignore
	                applePaySession.completeShippingContactSelection(update);
	            };
	            // This method is triggered after the user has confirmed the transaction with the Touch ID or Face ID.
	            // Besides getting all the details about the customer (email, address ...) you also get the Apple Pay payload
	            // needed to perform a payment
	            applePaySession.onpaymentauthorized = function (event) {
	                var _a, _b;
	                try {
	                    var paymentData = event.payment;
	                    var paymentToken = JSON.stringify(paymentData.token.paymentData);
	                    var appleShippingAddress = getApplePaymentAddress(paymentData.shippingContact);
	                    var appleBillingAddress = getApplePaymentAddress(paymentData.billingContact);
	                    if (paymentToken) {
	                        var response = {
	                            details: {
	                                apmProvider: "apple-pay"
	                            },
	                            paymentReference: JSON.stringify(event.payment.token.paymentData)
	                        };
	                        if (appleShippingAddress !== '') {
	                            response.shippingAddress = appleShippingAddress;
	                        }
	                        if (appleBillingAddress !== '') {
	                            response.details.billingAddress = appleBillingAddress;
	                        }
	                        if (paymentData.shippingContact.emailAddress && paymentData.shippingContact.emailAddress !== '') {
	                            response.payerEmail = paymentData.shippingContact.emailAddress;
	                        }
	                        if (((_a = paymentData.shippingContact) === null || _a === void 0 ? void 0 : _a.phoneNumber) && ((_b = paymentData.shippingContact) === null || _b === void 0 ? void 0 : _b.phoneNumber) !== '') {
	                            response.payerPhone = paymentData.shippingContact.phoneNumber;
	                        }
	                        iframeField === null || iframeField === void 0 ? void 0 : iframeField.emit('token-success', response);
	                        // @ts-ignore
	                        applePaySession.completePayment(ApplePaySession.STATUS_SUCCESS);
	                    }
	                    else {
	                        var error = {
	                            error: true,
	                            reasons: [{
	                                    code: event.detail.code,
	                                    message: event.detail.message,
	                                }],
	                        };
	                        iframeField === null || iframeField === void 0 ? void 0 : iframeField.emit('token-error', error);
	                        // @ts-ignore
	                        applePaySession.completePayment(ApplePaySession.STATUS_FAILURE);
	                    }
	                }
	                catch (err) {
	                    var error = {
	                        error: true,
	                        reasons: [{
	                                code: "ERROR",
	                                message: err,
	                            }],
	                    };
	                    return bus.emit('error', error);
	                }
	            };
	        }
	    }
	}

	var Apm;
	(function (Apm) {
	    Apm["ClickToPay"] = "click-to-pay";
	    Apm["GooglePay"] = "google-pay";
	    Apm["ApplePay"] = "apple-pay";
	})(Apm || (Apm = {}));
	var CardNetwork;
	(function (CardNetwork) {
	    CardNetwork["Visa"] = "VISA";
	    CardNetwork["Mastercard"] = "MASTERCARD";
	    CardNetwork["Amex"] = "AMEX";
	    CardNetwork["Discover"] = "DISCOVER";
	})(CardNetwork || (CardNetwork = {}));

	var enums = /*#__PURE__*/Object.freeze({
		__proto__: null,
		get Apm () { return Apm; },
		get CardNetwork () { return CardNetwork; }
	});

	/**
	 * InstallmentAction class model.
	 */
	function installmentActionMapper(origin) {
	    return {
	        id: origin.id,
	        type: origin.type,
	        timeCreated: origin.time_created,
	        resultCode: origin.result_code,
	        appId: origin.app_id,
	        appName: origin.app_name,
	    };
	}

	/**
	 * InstallmentPaymentMethod class model.
	 */
	function installmentPaymentMethodMapper(origin) {
	    return {
	        entryMode: origin.entry_mode,
	        card: {
	            brand: origin.card.brand,
	            maskedNumberLast4: origin.card.masked_number_last4,
	        },
	    };
	}

	/**
	 * InstallmentTermFees class model.
	 */
	function installmentTermFeesMapper(origin) {
	    return {
	        currency: origin.currency,
	        totalAmount: origin.total_amount,
	        fixedAmount: origin.fixed_amount,
	        monthlyAmount: origin.monthly_amount,
	    };
	}

	function installmentTermMapper(origin) {
	    return {
	        reference: origin.reference,
	        timeUnitAmount: origin.time_unit_amount,
	        currency: origin.currency,
	        mode: origin.mode,
	        totalTimeUnitCount: origin.total_time_unit_count,
	        interestRate: origin.interest_rate,
	        totalAmount: origin.total_amount,
	        description: origin.description,
	        expirationDate: origin.expiration_date,
	        expirationInterestRate: origin.expiration_interest_rate,
	        timeUnit: origin.time_unit,
	        termsAndConditionsUrl: origin.terms_and_conditions_url,
	        fees: origin.fees ? installmentTermFeesMapper(origin.fees) : undefined,
	    };
	}

	function installmentPlansDataMapper(origin) {
	    var compareTerms = function (x, y) { return (+x.totalTimeUnitCount > +y.totalTimeUnitCount) ? 1 : ((+y.totalTimeUnitCount > +x.totalTimeUnitCount) ? -1 : 0); };
	    return {
	        id: origin.id,
	        timeCreated: origin.time_created,
	        type: origin.type,
	        status: origin.status,
	        channel: origin.channel,
	        amount: origin.amount,
	        currency: origin.currency,
	        country: origin.country,
	        merchantId: origin.merchant_id,
	        merchantName: origin.merchant_name,
	        accountId: origin.account_id,
	        accountName: origin.account_name,
	        reference: origin.reference,
	        termsAndConditionsUrl: origin.terms_and_conditions_url,
	        providerImageUrl: origin.provider_image_url,
	        paymentMethod: installmentPaymentMethodMapper(origin.payment_method),
	        terms: origin.terms.map(function (x) { return installmentTermMapper(x); }).sort(compareTerms),
	        action: installmentActionMapper(origin.action),
	    };
	}
	function verifyInstallmentAvailability(installmentPlansData) {
	    return installmentPlansData.status === InstallmentAvailableStatus.Available;
	}

	var createHtmlElement = function (elementType, props) {
	    var _a = props || {}, id = _a.id, className = _a.className, attributes = _a.attributes;
	    var htmlElement = document.createElement(elementType);
	    if (id) {
	        htmlElement.id = id;
	    }
	    if (className) {
	        htmlElement.className = className;
	    }
	    if (attributes) {
	        attributes.forEach(function (attr) {
	            var qualifiedName = Object.keys(attr)[0];
	            var value = Object.values(attr)[0];
	            htmlElement.setAttribute(qualifiedName, value);
	        });
	    }
	    return htmlElement;
	};
	var createHtmlDivElement = function (props) {
	    return createHtmlElement('div', props);
	};
	var createHtmlSpanElement = function (props) {
	    var textContent = (props || {}).textContent;
	    var htmlElement = createHtmlElement('span', props);
	    if (textContent) {
	        htmlElement.textContent = textContent;
	    }
	    return htmlElement;
	};
	var createHtmlButtonElement = function (props) {
	    var textContent = (props || {}).textContent;
	    var htmlElement = createHtmlElement('button', props);
	    if (textContent) {
	        htmlElement.textContent = textContent;
	    }
	    return htmlElement;
	};
	var createHtmlImageElement = function (props) {
	    var _a = props || {}, src = _a.src, alt = _a.alt;
	    var htmlElement = createHtmlElement('img', props);
	    if (src) {
	        htmlElement.src = src;
	    }
	    if (alt) {
	        htmlElement.alt = alt;
	    }
	    return htmlElement;
	};
	var createHtmlUlElement = function (props) {
	    return createHtmlElement('ul', props);
	};
	var createHtmlLiElement = function (props) {
	    return createHtmlElement('li', props);
	};
	var HtmlAnchorTarget;
	(function (HtmlAnchorTarget) {
	    HtmlAnchorTarget["Blank"] = "_blank";
	    HtmlAnchorTarget["Self"] = "_self";
	    HtmlAnchorTarget["Parent"] = "_parent";
	    HtmlAnchorTarget["Top"] = "_top";
	})(HtmlAnchorTarget || (HtmlAnchorTarget = {}));
	var createHtmlAnchorElement = function (props) {
	    var _a = props || {}, href = _a.href, textContent = _a.textContent, target = _a.target;
	    var htmlElement = createHtmlElement('a', props);
	    htmlElement.href = href || '#';
	    htmlElement.rel = 'noopener noreferrer';
	    if (textContent) {
	        htmlElement.textContent = textContent;
	    }
	    if (target) {
	        htmlElement.target = target;
	    }
	    return htmlElement;
	};

	var createHtmlDivElement$1 = function (props) { return createHtmlDivElement(props); };
	var createHtmlSpanElement$1 = function (props) { return createHtmlSpanElement(props); };
	var createHtmlButtonElement$1 = function (props) { return createHtmlButtonElement(props); };
	var createHtmlImageElement$1 = function (props) { return createHtmlImageElement(props); };
	var createHtmlUlElement$1 = function (props) { return createHtmlUlElement(props); };
	var createHtmlLiElement$1 = function (props) { return createHtmlLiElement(props); };
	var HtmlAnchorTarget$1 = HtmlAnchorTarget;
	var createHtmlAnchorElement$1 = function (props) { return createHtmlAnchorElement(props); };

	var createModalComponent = function (modalProps) {
	    var id = modalProps.id, htmlContent = modalProps.htmlContent;
	    var existingModal = document.getElementById(id);
	    if (existingModal)
	        return;
	    var modalComponentDiv = createHtmlDivElement$1({
	        id: id,
	        className: 'modal-overlay',
	        attributes: [
	            { style: 'display: none;' },
	        ],
	    });
	    var modalWrapperDiv = createHtmlDivElement$1({ className: 'modal-wrapper' });
	    modalComponentDiv.append(modalWrapperDiv);
	    var modalContentDiv = createHtmlDivElement$1({ className: 'modal-content' });
	    if (htmlContent) {
	        modalContentDiv.append(htmlContent);
	    }
	    modalWrapperDiv.append(modalContentDiv);
	    return {
	        open: function () {
	            setModalVisibility(id, true);
	        },
	        close: function () {
	            setModalVisibility(id, false);
	        },
	        modalElement: modalComponentDiv,
	    };
	};
	function setModalVisibility(id, visible) {
	    var modal = document.getElementById(id);
	    if (!modal)
	        return;
	    modal.style.display = visible ? 'flex' : 'none';
	}

	var getProvidedByIssuerTemplate = function (props) {
	    var providerImageSrc = props.providerImageSrc, providerImageAlt = props.providerImageAlt;
	    var providedBySpan = createHtmlSpanElement$1({ className: 'provided-by', textContent: 'Provided by ' });
	    var providerImage = createHtmlImageElement$1({
	        src: providerImageSrc,
	        alt: providerImageAlt,
	        attributes: [
	            { width: '64' },
	            { height: '13' },
	        ],
	    });
	    providedBySpan.append(providerImage);
	    return providedBySpan;
	};
	var getChangePaymentMethodTemplate = function (buttonId) {
	    return createHtmlButtonElement$1({
	        id: buttonId,
	        className: 'installment-link',
	        textContent: 'Or choose another payment method',
	        attributes: [
	            { 'aria-label': 'Change the payment method' },
	        ],
	    });
	};
	var getHaveVirginMoneyCreditCardBannerTemplate = function () {
	    var content = createHtmlDivElement$1({
	        id: 'virgin-money-credit-card-banner',
	        attributes: [
	            { style: 'display: flex; justify-content: center; width: 100%;' },
	        ],
	    });
	    var issuerPanelBannerDiv = createHtmlDivElement$1({ className: 'installment-issuer-panel' });
	    var haveVirginMoneyCreditCardBannerHeaderDiv = createHtmlDivElement$1({
	        className: 'installment-issuer-panel-header',
	    });
	    var haveVirginCreditCardTitleSpan = createHtmlSpanElement$1({
	        className: 'installment-issuer-panel-title',
	        textContent: 'Have a Virgin Money credit card?'
	    });
	    haveVirginMoneyCreditCardBannerHeaderDiv.append(haveVirginCreditCardTitleSpan);
	    var virginMoneyLogoImage = createHtmlImageElement$1({
	        src: getAssetBaseUrl('') + "images/virgin-money-logo.png",
	        alt: 'Virgin Money logo',
	        attributes: [
	            { width: '64' },
	            { height: '13' },
	        ],
	    });
	    haveVirginMoneyCreditCardBannerHeaderDiv.append(virginMoneyLogoImage);
	    // Missing Virgin Money Image
	    issuerPanelBannerDiv.append(haveVirginMoneyCreditCardBannerHeaderDiv);
	    var haveVirginMoneyCreditCardBannerContentDiv = createHtmlDivElement$1({ className: 'installment-options-content' });
	    var enterYourCreditCardDetailsSpan = createHtmlSpanElement$1({
	        className: 'installment-issuer-panel-content',
	        textContent: 'Enter your card details to check for flexible instalment payment plans and spread the cost over multiple bills.',
	    });
	    haveVirginMoneyCreditCardBannerContentDiv.append(enterYourCreditCardDetailsSpan);
	    issuerPanelBannerDiv.append(haveVirginMoneyCreditCardBannerContentDiv);
	    content.append(issuerPanelBannerDiv);
	    return content;
	};

	var getLearnMoreModalContentTemplate = function (buttonIds) {
	    var closeButtonId = buttonIds.closeButtonId, explorePlansButtonId = buttonIds.explorePlansButtonId, termsAndConditionsUrl = buttonIds.termsAndConditionsUrl, providerImageSrc = buttonIds.providerImageSrc;
	    var content = createHtmlDivElement$1({ className: 'installment-learn-more-content' });
	    var modalHeader = createHtmlDivElement$1({ className: 'installment-learn-more-header' });
	    var payOffCreditCardsSpan = createHtmlSpanElement$1({
	        className: 'installment-learn-more-header-title',
	        textContent: 'Pay off credit cards purchases for less money with an Instalment Plan',
	    });
	    modalHeader.append(payOffCreditCardsSpan);
	    var closeModalButton = createHtmlButtonElement$1({
	        id: closeButtonId,
	        className: 'installment-button-close',
	        attributes: [
	            { 'aria-label': 'Close Pay off credit cards modal' },
	        ],
	    });
	    modalHeader.append(closeModalButton);
	    content.append(modalHeader);
	    var modalBody = createHtmlDivElement$1({ className: 'installment-learn-more-body' });
	    var infoListUL = createHtmlUlElement$1();
	    var infoTextItems = [
	        'Spread the cost of payment over multiple monthly bills with a flexible plan to suit you',
	        'No hidden costs and no charge for missed payments',
	        'No up front payment required',
	        'Cancel and repay balance in full at any time with no penalty',
	    ].map(function (infoText) {
	        var infoItemLi = createHtmlLiElement$1();
	        infoItemLi.append(createHtmlSpanElement$1({ textContent: infoText }));
	        return infoItemLi;
	    });
	    infoTextItems.forEach(function (item) { return infoListUL.append(item); });
	    modalBody.append(infoListUL);
	    var explorePlansButtonWrapperDiv = createHtmlDivElement$1({ className: 'installment-base-action-button-wrapper' });
	    var explorePlansButton = createHtmlButtonElement$1({
	        id: explorePlansButtonId,
	        className: 'installment-button-explore-plans',
	        textContent: 'Explore plan options'
	    });
	    explorePlansButtonWrapperDiv.append(explorePlansButton);
	    modalBody.append(explorePlansButtonWrapperDiv);
	    var linkToVirginWebsiteAnchor = createHtmlAnchorElement$1({
	        href: termsAndConditionsUrl,
	        target: HtmlAnchorTarget$1.Blank,
	        className: 'installment-learn-more-link',
	        textContent: 'Read more on the Virgin Slyce Website',
	        attributes: [
	            { 'aria-label': 'Link to Virgin Slyce Website' },
	        ],
	    });
	    modalBody.append(linkToVirginWebsiteAnchor);
	    var providedByIssuer = getProvidedByIssuerTemplate({ providerImageSrc: providerImageSrc, providerImageAlt: 'Provider Logo' });
	    modalBody.append(providedByIssuer);
	    content.append(modalBody);
	    return content;
	};

	var isInstallmentPlansOptionOpen;
	var learnMoreModalCloseButtonId = 'installment-learn-more-modal-close';
	var learnMoreModalExplorePlansButtonId = 'installment-learn-more-modal-explore-plans';
	var learnMoreModal;
	var initialize = function (context) {
	    isInstallmentPlansOptionOpen = true;
	    var _a = context.installmentPlans, termsAndConditionsUrl = _a.termsAndConditionsUrl, providerImageUrl = _a.providerImageUrl;
	    learnMoreModal = createModalComponent({
	        id: 'installment-learn-more-modal',
	        htmlContent: getLearnMoreModalContentTemplate({
	            closeButtonId: learnMoreModalCloseButtonId,
	            explorePlansButtonId: learnMoreModalExplorePlansButtonId,
	            termsAndConditionsUrl: termsAndConditionsUrl,
	            providerImageSrc: providerImageUrl,
	        }),
	    });
	};
	var contentHandler = function (context) {
	    var providerImageUrl = context.installmentPlans.providerImageUrl;
	    var content = createHtmlDivElement$1({ className: 'installment-panel' });
	    if (learnMoreModal) {
	        content.append(learnMoreModal.modalElement);
	    }
	    var installmentOptionsDiv = createHtmlDivElement$1({ className: 'installment-options' });
	    content.append(installmentOptionsDiv);
	    var installmentOptionsHeaderDiv = createHtmlDivElement$1({
	        className: 'installment-options-header',
	        attributes: [
	            { 'aria-expanded': isInstallmentPlansOptionOpen ? 'true' : 'false' },
	        ],
	    });
	    var elegibleForTitleSpan = createHtmlSpanElement$1({ className: 'installment-plan-options-title', textContent: 'You are eligible for an Instalment Plan' });
	    installmentOptionsHeaderDiv.append(elegibleForTitleSpan);
	    var toggleOptionsDiv = createHtmlDivElement$1({ className: 'installment-plans-options' });
	    installmentOptionsHeaderDiv.append(toggleOptionsDiv);
	    var closeDetailsButton = createHtmlButtonElement$1({
	        id: 'installment-toggle-options',
	        className: 'installment-button-close',
	        attributes: [
	            { 'aria-label': 'Collapse installments options details' },
	        ],
	    });
	    var showDetailsButton = createHtmlButtonElement$1({
	        id: 'installment-toggle-options',
	        className: 'installment-link',
	        textContent: 'Show details',
	        attributes: [
	            { 'aria-label': 'Show installments options details' },
	        ],
	    });
	    toggleOptionsDiv.append(isInstallmentPlansOptionOpen ? closeDetailsButton : showDetailsButton);
	    installmentOptionsDiv.append(installmentOptionsHeaderDiv);
	    var providedByIssuer = getProvidedByIssuerTemplate({ providerImageSrc: providerImageUrl, providerImageAlt: 'Provider Logo' });
	    installmentOptionsDiv.append(providedByIssuer);
	    var installmentOptionsContentDiv = createHtmlDivElement$1({ className: 'installment-options-content' });
	    var payThisTransactionSpan = createHtmlSpanElement$1({ textContent: 'Pay this transaction for a lower overall cost' });
	    installmentOptionsContentDiv.append(payThisTransactionSpan);
	    var infoListUL = createHtmlUlElement$1();
	    var infoTextItems = [
	        'Lower APR than credit card rate',
	        'Split the cost over 3 - 24 monthly bills',
	        'Helps you manage your finances',
	    ].map(function (infoText) {
	        var infoItemLi = createHtmlLiElement$1();
	        infoItemLi.append(createHtmlSpanElement$1({ textContent: infoText }));
	        return infoItemLi;
	    });
	    infoTextItems.forEach(function (item) { return infoListUL.append(item); });
	    installmentOptionsContentDiv.append(infoListUL);
	    var explorePlansButtonWrapperDiv = createHtmlDivElement$1({ className: 'installment-base-action-button-wrapper' });
	    var explorePlansButton = createHtmlButtonElement$1({
	        id: 'explore-plans',
	        className: 'installment-button-explore-plans',
	        textContent: 'Explore plans'
	    });
	    explorePlansButtonWrapperDiv.append(explorePlansButton);
	    installmentOptionsContentDiv.append(explorePlansButtonWrapperDiv);
	    var learnMoreButtonWrapperDiv = createHtmlDivElement$1({ className: 'installment-base-action-button-wrapper' });
	    var learnMoreButton = createHtmlButtonElement$1({
	        id: 'learn-more',
	        className: 'installment-button-learn-more',
	        textContent: 'Learn more'
	    });
	    learnMoreButtonWrapperDiv.append(learnMoreButton);
	    installmentOptionsContentDiv.append(learnMoreButtonWrapperDiv);
	    if (isInstallmentPlansOptionOpen)
	        installmentOptionsDiv.append(installmentOptionsContentDiv);
	    return content;
	};
	var eventsListeners = function (context) {
	    addLearnMoreModalEventsListeners(context);
	    return [
	        {
	            elementSelector: '#explore-plans',
	            eventName: 'click',
	            eventHandler: function () {
	                context.explorePlans();
	            },
	        },
	        {
	            elementSelector: '#learn-more',
	            eventName: 'click',
	            eventHandler: function () {
	                if (!learnMoreModal)
	                    return;
	                learnMoreModal.open();
	            },
	        },
	        {
	            elementSelector: '#installment-toggle-options',
	            eventName: 'click',
	            eventHandler: function () {
	                isInstallmentPlansOptionOpen = !isInstallmentPlansOptionOpen;
	                context.updateContainerContent();
	            },
	        },
	    ];
	};
	var createInstallmentStep0 = { initialize: initialize, contentHandler: contentHandler, eventsListeners: eventsListeners };
	function addLearnMoreModalEventsListeners(context) {
	    if (!learnMoreModal)
	        return;
	    var closeModalButton = document.getElementById(learnMoreModalCloseButtonId);
	    if (closeModalButton) {
	        closeModalButton.addEventListener('click', function () {
	            learnMoreModal === null || learnMoreModal === void 0 ? void 0 : learnMoreModal.close();
	        });
	    }
	    var explorePlansButtonId = document.getElementById(learnMoreModalExplorePlansButtonId);
	    if (explorePlansButtonId) {
	        explorePlansButtonId.addEventListener('click', function () {
	            learnMoreModal === null || learnMoreModal === void 0 ? void 0 : learnMoreModal.close();
	            context.explorePlans();
	        });
	    }
	}

	var getCurrencySymbol = function (currency) {
	    switch (currency) {
	        case 'USD':
	            return '$';
	        case 'EUR':
	            return '€';
	        case 'GBP':
	        default:
	            return '£';
	    }
	};
	var addCurrencyToAmount = function (currency, amount) {
	    var sanitizedAmount = (amount !== undefined && amount !== null) ? amount : 0;
	    return "" + getCurrencySymbol(currency) + sanitizedAmount;
	};

	var contentHandler$1 = function (context) {
	    var installmentPlans = context.installmentPlans, selectedTermIndex = context.selectedTerm;
	    var terms = installmentPlans.terms, providerImageUrl = installmentPlans.providerImageUrl, paymentMethod = installmentPlans.paymentMethod;
	    var selectedTerm = terms[selectedTermIndex];
	    var reference = selectedTerm.reference, totalTimeUnitCount = selectedTerm.totalTimeUnitCount, totalAmount = selectedTerm.totalAmount, currency = selectedTerm.currency, timeUnit = selectedTerm.timeUnit, termsAndConditionsUrl = selectedTerm.termsAndConditionsUrl;
	    var trimmedTimeUnit = timeUnit ? timeUnit.toLowerCase() + "s" : '';
	    var content = createHtmlDivElement$1({ className: 'installment-panel' });
	    var installmentPanelHeaderDiv = createHtmlDivElement$1({ className: 'installment-panel-header' });
	    var exploreInstallmentPlansTitleSpan = createHtmlSpanElement$1({ className: 'installment-plans-title', textContent: 'Confirm Your Plan Details' });
	    installmentPanelHeaderDiv.append(exploreInstallmentPlansTitleSpan);
	    var exploreInstallmentPlansSubtitleSpan = createHtmlSpanElement$1({ className: 'installment-plans-subtitle', textContent: 'Monthly Repayment:' });
	    installmentPanelHeaderDiv.append(exploreInstallmentPlansSubtitleSpan);
	    var monthlyAmountSpan = createHtmlSpanElement$1({
	        className: 'installment-plan-monthly-amount',
	        textContent: addCurrencyToAmount(currency, selectedTerm.timeUnitAmount),
	    });
	    installmentPanelHeaderDiv.append(monthlyAmountSpan);
	    content.append(installmentPanelHeaderDiv);
	    var installmentPanelContentDiv = createHtmlDivElement$1({ className: 'installment-panel-content' });
	    var installmentPlanDetailsDiv = createHtmlDivElement$1({ className: 'installment-plan-details' });
	    var planDetails = getInstallmentPlanDetails(installmentPlans, selectedTerm);
	    planDetails.forEach(function (_a) {
	        var label = _a.label, value = _a.value;
	        var planDetailItemDiv = createHtmlDivElement$1({ className: 'installment-field-value-item' });
	        var planDetailLabelSpan = createHtmlSpanElement$1({ textContent: label });
	        planDetailItemDiv.append(planDetailLabelSpan);
	        var planDetailValueSpan = createHtmlSpanElement$1({ textContent: value });
	        planDetailItemDiv.append(planDetailValueSpan);
	        installmentPlanDetailsDiv.append(planDetailItemDiv);
	    });
	    installmentPanelContentDiv.append(installmentPlanDetailsDiv);
	    var installmentTermsDiv = createHtmlDivElement$1({ className: 'installment-term-selector-title' });
	    var howManySpan = createHtmlSpanElement$1({ textContent: "How many " + trimmedTimeUnit + "?" });
	    installmentTermsDiv.append(howManySpan);
	    installmentPanelContentDiv.append(installmentTermsDiv);
	    var installmentTermsSelectorButtonWrapperDiv = createHtmlDivElement$1({ className: 'installment-base-action-button-wrapper' });
	    terms.forEach(function (term, index) {
	        var termButton = createHtmlButtonElement$1({
	            id: "term-" + index,
	            className: "installment-button-month-term " + (index !== selectedTermIndex ? 'installment-unselected' : ''),
	            textContent: term.totalTimeUnitCount
	        });
	        installmentTermsSelectorButtonWrapperDiv.append(termButton);
	    });
	    installmentPanelContentDiv.append(installmentTermsSelectorButtonWrapperDiv);
	    installmentPanelContentDiv.append(getIssuerInfoBanner({
	        providerName: 'Virgin Money',
	        maskedNumberLast4: paymentMethod.card.maskedNumberLast4.slice(-4),
	        totalAmount: addCurrencyToAmount(currency, totalAmount),
	        totalTimeUnitCount: totalTimeUnitCount,
	        timeUnit: trimmedTimeUnit,
	        referencePromorionId: reference,
	        termsAndConditionsUrl: termsAndConditionsUrl,
	    }));
	    content.append(installmentPanelContentDiv);
	    var installmentPanelFooterDiv = createHtmlDivElement$1({ className: 'installment-panel-footer' });
	    var payButtonWrapperDiv = createHtmlDivElement$1({ className: 'installment-base-action-button-wrapper' });
	    var payButton = createHtmlButtonElement$1({
	        id: 'pay-with-instalments',
	        className: 'installment-button-pay',
	        textContent: 'Pay with Instalments'
	    });
	    payButtonWrapperDiv.append(payButton);
	    installmentPanelFooterDiv.append(payButtonWrapperDiv);
	    var providedByIssuer = getProvidedByIssuerTemplate({ providerImageSrc: providerImageUrl, providerImageAlt: 'Provider Logo' });
	    installmentPanelFooterDiv.append(providedByIssuer);
	    var changePaymentMethodDiv = createHtmlDivElement$1();
	    var changePaymentMethodButton = getChangePaymentMethodTemplate('change-payment-method');
	    changePaymentMethodDiv.append(changePaymentMethodButton);
	    installmentPanelFooterDiv.append(changePaymentMethodDiv);
	    content.append(installmentPanelFooterDiv);
	    return content;
	};
	var eventsListeners$1 = function (context) {
	    var planOptionsListeners = context.installmentPlans.terms.map(function (x, i) {
	        return {
	            elementSelector: "#term-" + i,
	            eventName: "click",
	            eventHandler: function () {
	                context.selectTerm(i);
	            },
	        };
	    });
	    return [
	        {
	            elementSelector: '#pay-with-instalments',
	            eventName: 'click',
	            eventHandler: function (e) {
	                e.preventDefault();
	                context.pay();
	            },
	        },
	        {
	            elementSelector: '#change-payment-method',
	            eventName: 'click',
	            eventHandler: function () {
	                context.changePaymentMethod();
	            },
	        },
	    ].concat(planOptionsListeners);
	};
	var createInstallmentStep1 = { contentHandler: contentHandler$1, eventsListeners: eventsListeners$1 };
	function getInstallmentPlanDetails(installmentData, selectedTerm) {
	    var mode = selectedTerm.mode, currency = selectedTerm.currency, interestRate = selectedTerm.interestRate, fees = selectedTerm.fees, totalAmount = selectedTerm.totalAmount;
	    var planDetails = [
	        { label: 'Transaction total amount', value: addCurrencyToAmount(currency, installmentData.amount) },
	    ];
	    if (mode === InstallmentTermModes.FEE) {
	        var _a = fees || {}, monthlyAmount = _a.monthlyAmount, feeTotalAmount = _a.totalAmount;
	        planDetails = planDetails.concat([
	            { label: "Monthy fee (Equivalent " + mode + " " + (interestRate || 0) + "%)", value: addCurrencyToAmount(currency, monthlyAmount) },
	            { label: 'Total fees', value: addCurrencyToAmount(currency, feeTotalAmount) },
	            { label: 'Total plan cost', value: addCurrencyToAmount(currency, totalAmount) },
	        ]);
	    }
	    else {
	        planDetails = planDetails.concat([
	            { label: "Monthy fee (Equivalent " + mode + " " + interestRate + "%)", value: addCurrencyToAmount(currency, totalAmount) },
	        ]);
	    }
	    return planDetails;
	}
	function getIssuerInfoBanner(props) {
	    var providerName = props.providerName, maskedNumberLast4 = props.maskedNumberLast4, totalAmount = props.totalAmount, totalTimeUnitCount = props.totalTimeUnitCount, timeUnit = props.timeUnit, referencePromorionId = props.referencePromorionId, termsAndConditionsUrl = props.termsAndConditionsUrl;
	    var issuerInfoBannerDiv = createHtmlDivElement$1({ className: 'installment-options' });
	    var termsA