
		    ///////////
		    // Helper
		    //////////


		    var util = {
		        has : function (str1, str2) {
		            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
		        },
		        lowerize : function (str) {
		            return str.toLowerCase();
		        }
		    };


		    ///////////////
		    // Map helper
		    //////////////


		    var mapper = {

		        rgx : function () {

		            // loop through all regexes maps
		            for (var result, i = 0, j, k, p, q, matches, match, args = arguments; i < args.length; i += 2) {

		                var regex = args[i],       // even sequence (0,2,4,..)
		                    props = args[i + 1];   // odd sequence (1,3,5,..)

		                // construct object barebones
		                if (typeof(result) === UNDEF_TYPE) {
		                    result = {};
		                    for (p in props) {
		                        q = props[p];
		                        if (typeof(q) === OBJ_TYPE) {
		                            result[q[0]] = undefined;
		                        } else {
		                            result[q] = undefined;
		                        }
		                    }
		                }

		                // try matching uastring with regexes
		                for (j = k = 0; j < regex.length; j++) {
		                    matches = regex[j].exec(this.getUA());
		                    if (!!matches) {
		                        for (p = 0; p < props.length; p++) {
		                            match = matches[++k];
		                            q = props[p];
		                            // check if given property is actually array
		                            if (typeof(q) === OBJ_TYPE && q.length > 0) {
		                                if (q.length == 2) {
		                                    if (typeof(q[1]) == FUNC_TYPE) {
		                                        // assign modified match
		                                        result[q[0]] = q[1].call(this, match);
		                                    } else {
		                                        // assign given value, ignore regex match
		                                        result[q[0]] = q[1];
		                                    }
		                                } else if (q.length == 3) {
		                                    // check whether function or regex
		                                    if (typeof(q[1]) === FUNC_TYPE && !(q[1].exec && q[1].test)) {
		                                        // call function (usually string mapper)
		                                        result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
		                                    } else {
		                                        // sanitize match using given regex
		                                        result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
		                                    }
		                                } else if (q.length == 4) {
		                                        result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
		                                }
		                            } else {
		                                result[q] = match ? match : undefined;
		                            }
		                        }
		                        break;
		                    }
		                }

		                if(!!matches) break; // break the loop immediately if match found
		            }
		            return result;
		        },

		        str : function (str, map) {

		            for (var i in map) {
		                // check if array
		                if (typeof(map[i]) === OBJ_TYPE && map[i].length > 0) {
		                    for (var j = 0; j < map[i].length; j++) {
		                        if (util.has(map[i][j], str)) {
		                            return (i === UNKNOWN) ? undefined : i;
		                        }
		                    }
		                } else if (util.has(map[i], str)) {
		                    return (i === UNKNOWN) ? undefined : i;
		                }
		            }
		            return str;
		        }
		    };


		    ///////////////
		    // String map
		    //////////////


		    var maps = {

		        browser : {
		            oldsafari : {
		                major : {
		                    '1' : ['/8', '/1', '/3'],
		                    '2' : '/4',
		                    '?' : '/'
		                },
		                version : {
		                    '1.0'   : '/8',
		                    '1.2'   : '/1',
		                    '1.3'   : '/3',
		                    '2.0'   : '/412',
		                    '2.0.2' : '/416',
		                    '2.0.3' : '/417',
		                    '2.0.4' : '/419',
		                    '?'     : '/'
		                }
		            }
		        },

		        device : {
		            sprint : {
		                model : {
		                    'Evo Shift 4G' : '7373KT'
		                },
		                vendor : {
		                    'HTC'       : 'APA',
		                    'Sprint'    : 'Sprint'
		                }
		            }
		        },

		        os : {
		            windows : {
		                version : {
		                    'ME'        : '4.90',
		                    'NT 3.11'   : 'NT3.51',
		                    'NT 4.0'    : 'NT4.0',
		                    '2000'      : 'NT 5.0',
		                    'XP'        : ['NT 5.1', 'NT 5.2'],
		                    'Vista'     : 'NT 6.0',
		                    '7'         : 'NT 6.1',
		                    '8'         : 'NT 6.2',
		                    '8.1'       : 'NT 6.3',
		                    'RT'        : 'ARM'
		                }
		            }
		        }
		    };


		    //////////////
		    // Regex map
		    /////////////


		    var regexes = {

		        browser : [[

		            // Presto based
		            /(opera\smini)\/((\d+)?[\w\.-]+)/i,                                 // Opera Mini
		            /(opera\s[mobiletab]+).+version\/((\d+)?[\w\.-]+)/i,                // Opera Mobi/Tablet
		            /(opera).+version\/((\d+)?[\w\.]+)/i,                               // Opera > 9.80
		            /(opera)[\/\s]+((\d+)?[\w\.]+)/i                                    // Opera < 9.80

		            ], [NAME, VERSION, MAJOR], [

		            /\s(opr)\/((\d+)?[\w\.]+)/i                                         // Opera Webkit
		            ], [[NAME, 'Opera'], VERSION, MAJOR], [

		            // Mixed
		            /(kindle)\/((\d+)?[\w\.]+)/i,                                       // Kindle
		            /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?((\d+)?[\w\.]+)*/i,
		                                                                                // Lunascape/Maxthon/Netfront/Jasmine/Blazer

		            // Trident based
		            /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?((\d+)?[\w\.]*)/i,
		                                                                                // Avant/IEMobile/SlimBrowser/Baidu
		            /(?:ms|\()(ie)\s((\d+)?[\w\.]+)/i,                                  // Internet Explorer

		            // Webkit/KHTML based
		            /(rekonq)((?:\/)[\w\.]+)*/i,                                        // Rekonq
		            /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron)\/((\d+)?[\w\.-]+)/i
		                                                                                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron
		            ], [NAME, VERSION, MAJOR], [

		            /(trident).+rv[:\s]((\d+)?[\w\.]+).+like\sgecko/i                   // IE11
		            ], [[NAME, 'IE'], VERSION, MAJOR], [

		            /(yabrowser)\/((\d+)?[\w\.]+)/i                                     // Yandex
		            ], [[NAME, 'Yandex'], VERSION, MAJOR], [

		            /(comodo_dragon)\/((\d+)?[\w\.]+)/i                                 // Comodo Dragon
		            ], [[NAME, /_/g, ' '], VERSION, MAJOR], [

		            /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?((\d+)?[\w\.]+)/i
		                                                                                // Chrome/OmniWeb/Arora/Tizen/Nokia
		            ], [NAME, VERSION, MAJOR], [

		            /(dolfin)\/((\d+)?[\w\.]+)/i                                        // Dolphin
		            ], [[NAME, 'Dolphin'], VERSION, MAJOR], [

		            /((?:android.+)crmo|crios)\/((\d+)?[\w\.]+)/i                       // Chrome for Android/iOS
		            ], [[NAME, 'Chrome'], VERSION, MAJOR], [

		            /((?:android.+))version\/((\d+)?[\w\.]+)\smobile\ssafari/i          // Android Browser
		            ], [[NAME, 'Android Browser'], VERSION, MAJOR], [

		            /version\/((\d+)?[\w\.]+).+?mobile\/\w+\s(safari)/i                 // Mobile Safari
		            ], [VERSION, MAJOR, [NAME, 'Mobile Safari']], [

		            /version\/((\d+)?[\w\.]+).+?(mobile\s?safari|safari)/i              // Safari & Safari Mobile
		            ], [VERSION, MAJOR, NAME], [

		            /webkit.+?(mobile\s?safari|safari)((\/[\w\.]+))/i                   // Safari < 3.0
		            ], [NAME, [MAJOR, mapper.str, maps.browser.oldsafari.major], [VERSION, mapper.str, maps.browser.oldsafari.version]], [

		            /(konqueror)\/((\d+)?[\w\.]+)/i,                                    // Konqueror
		            /(webkit|khtml)\/((\d+)?[\w\.]+)/i
		            ], [NAME, VERSION, MAJOR], [

		            // Gecko based
		            /(navigator|netscape)\/((\d+)?[\w\.-]+)/i                           // Netscape
		            ], [[NAME, 'Netscape'], VERSION, MAJOR], [
		            /(swiftfox)/i,                                                      // Swiftfox
		            /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?((\d+)?[\w\.\+]+)/i,
		                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
		            /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/((\d+)?[\w\.-]+)/i,
		                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
		            /(mozilla)\/((\d+)?[\w\.]+).+rv\:.+gecko\/\d+/i,                    // Mozilla

		            // Other
		            /(uc\s?browser|polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|qqbrowser)[\/\s]?((\d+)?[\w\.]+)/i,
		                                                                                // UCBrowser/Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/QQBrowser
		            /(links)\s\(((\d+)?[\w\.]+)/i,                                      // Links
		            /(gobrowser)\/?((\d+)?[\w\.]+)*/i,                                  // GoBrowser
		            /(ice\s?browser)\/v?((\d+)?[\w\._]+)/i,                             // ICE Browser
		            /(mosaic)[\/\s]((\d+)?[\w\.]+)/i                                    // Mosaic
		            ], [NAME, VERSION, MAJOR]
		        ],

		        engine : [[

		            /(presto)\/([\w\.]+)/i,                                             // Presto
		            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,     // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
		            /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
		            /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
		            ], [NAME, VERSION], [

		            /rv\:([\w\.]+).*(gecko)/i                                           // Gecko
		            ], [VERSION, NAME]
		        ],

		        os : [[

		            // Windows based
		            /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
		            /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
		            ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
		            /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
		            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

		            // Mobile/Embedded OS
		            /\((bb)(10);/i                                                      // BlackBerry 10
		            ], [[NAME, 'BlackBerry'], VERSION], [
/**
 * mOxie - multi-runtime File API & XMLHttpRequest L2 Polyfill
 * v1.2.1
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 *
 * Date: 2014-05-14
 */
/**
 * Compiled inline version. (Library mode)
 */

/*jshint smarttabs:true, undef:true, latedef:true, curly:true, bitwise:true, camelcase:true */
/*globals $code */

(function(exports, undefined) {
		"use strict";

		var modules = {};

		function require(ids, callback) {
				var module, defs = [];

				for (var i = 0; i < ids.length; ++i) {
						module = modules[ids[i]] || resolve(ids[i]);
						if (!module) {
								throw 'module definition dependecy not found: ' + ids[i];
						}

						defs.push(module);
				}

				callback.apply(null, defs);
		}

		function define(id, dependencies, definition) {
				if (typeof id !== 'string') {
						throw 'invalid module definition, module id must be defined and be a string';
				}

				if (dependencies === undefined) {
						throw 'invalid module definition, dependencies must be specified';
				}

				if (definition === undefined) {
						throw 'invalid module definition, definition function must be specified';
				}

				require(dependencies, function() {
						modules[id] = definition.apply(null, arguments);
				});
		}

		function defined(id) {
				return !!modules[id];
		}

		function resolve(id) {
				var target = exports;
				var fragments = id.split(/[.\/]/);

				for (var fi = 0; fi < fragments.length; ++fi) {
						if (!target[fragments[fi]]) {
								return;
						}

						target = target[fragments[fi]];
				}

				return target;
		}

		function expose(ids) {
				for (var i = 0; i < ids.length; i++) {
						var target = exports;
						var id = ids[i];
						var fragments = id.split(/[.\/]/);

						for (var fi = 0; fi < fragments.length - 1; ++fi) {
								if (target[fragments[fi]] === undefined) {
										target[fragments[fi]] = {};
								}

								target = target[fragments[fi]];
						}

						target[fragments[fragments.length - 1]] = modules[id];
				}
		}

// Included from: src/javascript/core/utils/Basic.js

/**
 * Basic.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define('moxie/core/utils/Basic', [], function() {
		/**
		Gets the true type of the built-in object (better version of typeof).
		@author Angus Croll (http://javascriptweblog.wordpress.com/)

		@method typeOf
		@for Utils
		@static
		@param {Object} o Object to check.
		@return {String} Object [[Class]]
		*/
		var typeOf = function(o) {
				var undef;

				if (o === undef) {
						return 'undefined';
				} else if (o === null) {
						return 'null';
				} else if (o.nodeType) {
						return 'node';
				}

				// the snippet below is awesome, however it fails to detect null, undefined and arguments types in IE lte 8
				return ({}).toString.call(o).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
		};

		/**
		Extends the specified object with another object.

		@method extend
		@static
		@param {Object} target Object to extend.
		@param {Object} [obj]* Multiple objects to extend with.
		@return {Object} Same as target, the extended object.
		*/
		var extend = function(target) {
				var undef;

				each(arguments, function(arg, i) {
						if (i > 0) {
								each(arg, function(value, key) {
										if (value !== undef) {
												if (typeOf(target[key]) === typeOf(value) && !!~inArray(typeOf(value), ['array', 'object'])) {
														extend(target[key], value);
												} else {
														target[key] = value;
												}
										}
								});
						}
				});
				return target;
		};

		/**
		Executes the callback function for each item in array/object. If you return false in the
		callback it will break the loop.

		@method each
		@static
		@param {Object} obj Object to iterate.
		@param {function} callback Callback function to execute for each item.
		*/
		var each = function(obj, callback) {
				var length, key, i, undef;

				if (obj) {
						try {
								length = obj.length;
						} catch(ex) {
								length = undef;
						}

						if (length === undef) {
								// Loop object items
								for (key in obj) {
										if (obj.hasOwnProperty(key)) {
												if (callback(obj[key], key) === false) {
														return;
												}
										}
								}
						} else {
								// Loop array items
								for (i = 0; i < length; i++) {
										if (callback(obj[i], i) === false) {
												return;
										}
								}
						}
				}
		};

		/**
		Checks if object is empty.

		@method isEmptyObj
		@static
		@param {Object} o Object to check.
		@return {Boolean}
		*/
		var isEmptyObj = function(obj) {
				var prop;

				if (!obj || typeOf(obj) !== 'object') {
						return true;
				}

				for (prop in obj) {
						return false;
				}

				return true;
		};

		/**
		Recieve an array of functions (usually async) to call in sequence, each  function
		receives a callback as first argument that it should call, when it completes. Finally,
		after everything is complete, main callback is called. Passing truthy value to the
		callback as a first argument will interrupt the sequence and invoke main callback
		immediately.

		@method inSeries
		@static
		@param {Array} queue Array of functions to call in sequence
		@param {Function} cb Main callback that is called in the end, or in case of error
		*/
		var inSeries = function(queue, cb) {
				var i = 0, length = queue.length;

				if (typeOf(cb) !== 'function') {
						cb = function() {};
				}

				if (!queue || !queue.length) {
						cb();
				}

				function callNext(i) {
						if (typeOf(queue[i]) === 'function') {
								queue[i](function(error) {
										/*jshint expr:true */
										++i < length && !error ? callNext(i) : cb(error);
								});
						}
				}
				callNext(i);
		};


		/**
		Recieve an array of functions (usually async) to call in parallel, each  function
		receives a callback as first argument that it should call, when it completes. After
		everything is complete, main callback is called. Passing truthy value to the
		callback as a first argument will interrupt the process and invoke main callback
		immediately.

		@method inParallel
		@static
		@param {Array} queue Array of functions to call in sequence
		@param {Function} cb Main callback that is called in the end, or in case of erro
		*/
		var inParallel = function(queue, cb) {
				var count = 0, num = queue.length, cbArgs = new Array(num);

				each(queue, function(fn, i) {
						fn(function(error) {
								if (error) {
										return cb(error);
								}

								var args = [].slice.call(arguments);
								args.shift(); // strip error - undefined or not

								cbArgs[i] = args;
								count++;

								if (count === num) {
										cbArgs.unshift(null);
										cb.apply(this, cbArgs);
								}
						});
				});
		};


		/**
		Find an element in array and return it's index if present, otherwise return -1.

		@method inArray
		@static
		@param {Mixed} needle Element to find
		@param {Array} array
		@return {Int} Index of the element, or -1 if not found
		*/
		var inArray = function(needle, array) {
				if (array) {
						if (Array.prototype.indexOf) {
								return Array.prototype.indexOf.call(array, needle);
						}

						for (var i = 0, length = array.length; i < length; i++) {
								if (array[i] === needle) {
										return i;
								}
						}
				}
				return -1;
		};


		/**
		Returns elements of first array if they are not present in second. And false - otherwise.

		@private
		@method arrayDiff
		@param {Array} needles
		@param {Array} array
		@return {Array|Boolean}
		*/
		var arrayDiff = function(needles, array) {
				var diff = [];

				if (typeOf(needles) !== 'array') {
						needles = [needles];
				}

				if (typeOf(array) !== 'array') {
						array = [array];
				}

				for (var i in needles) {
						if (inArray(needles[i], array) === -1) {
								diff.push(needles[i]);
						}
				}
				return diff.length ? diff : false;
		};


		/**
		Find intersection of two arrays.

		@private
		@method arrayIntersect
		@param {Array} array1
		@param {Array} array2
		@return {Array} Intersection of two arrays or null if there is none
		*/
		var arrayIntersect = function(array1, array2) {
				var result = [];
				each(array1, function(item) {
						if (inArray(item, array2) !== -1) {
								result.push(item);
						}
				});
				return result.length ? result : null;
		};


		/**
		Forces anything into an array.

		@method toArray
		@static
		@param {Object} obj Object with length field.
		@return {Array} Array object containing all items.
		*/
		var toArray = function(obj) {
				var i, arr = [];

				for (i = 0; i < obj.length; i++) {
						arr[i] = obj[i];
				}

				return arr;
		};


		/**
		Generates an unique ID. This is 99.99% unique since it takes the current time and 5 random numbers.
		The only way a user would be able to get the same ID is if the two persons at the same exact milisecond manages
		to get 5 the same random numbers between 0-65535 it also uses a counter so each call will be guaranteed to be page unique.
		It's more probable for the earth to be hit with an ansteriod. Y

		@method guid
		@static
		@param {String} prefix to prepend (by default 'o' will be prepended).
		@method guid
		@return {String} Virtually unique id.
		*/
		var guid = (function() {
				var counter = 0;

				return function(prefix) {
						var guid = new Date().getTime().toString(32), i;

						for (i = 0; i < 5; i++) {
								guid += Math.floor(Math.random() * 65535).toString(32);
						}

						return (prefix || 'o_') + guid + (counter++).toString(32);
				};
		}());


		/**
		Trims white spaces around the string

		@method trim
		@static
		@param {String} str
		@return {String}
		*/
		var trim = function(str) {
				if (!str) {
						return str;
				}
				return String.prototype.trim ? String.prototype.trim.call(str) : str.toString().replace(/^\s*/, '').replace(/\s*$/, '');
		};


		/**
		Parses the specified size string into a byte value. For example 10kb becomes 10240.

		@method parseSizeStr
		@static
		@param {String/Number} size String to parse or number to just pass through.
		@return {Number} Size in bytes.
		*/
		var parseSizeStr = function(size) {
				if (typeof(size) !== 'string') {
						return size;
				}

				var muls = {
								t: 1099511627776,
								g: 1073741824,
								m: 1048576,
								k: 1024
						},
						mul;

				size = /^([0-9]+)([mgk]?)$/.exec(size.toLowerCase().replace(/[^0-9mkg]/g, ''));
				mul = size[2];
				size = +size[1];

				if (muls.hasOwnProperty(mul)) {
						size *= muls[mul];
				}
				return size;
		};


		return {
				guid: guid,
				typeOf: typeOf,
				extend: extend,
				each: each,
				isEmptyObj: isEmptyObj,
				inSeries: inSeries,
				inParallel: inParallel,
				inArray: inArray,
				arrayDiff: arrayDiff,
				arrayIntersect: arrayIntersect,
				toArray: toArray,
				trim: trim,
				parseSizeStr: parseSizeStr
		};
});

// Included from: src/javascript/core/I18n.js

/**
 * I18n.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define("moxie/core/I18n", [
		"moxie/core/utils/Basic"
], function(Basic) {
		var i18n = {};

		return {
				/**
				 * Extends the language pack object with new items.
				 *
				 * @param {Object} pack Language pack items to add.
				 * @return {Object} Extended language pack object.
				 */
				addI18n: function(pack) {
						return Basic.extend(i18n, pack);
				},

				/**
				 * Translates the specified string by checking for the english string in the language pack lookup.
				 *
				 * @param {String} str String to look for.
				 * @return {String} Translated string or the input string if it wasn't found.
				 */
				translate: function(str) {
						return i18n[str] || str;
				},

				/**
				 * Shortcut for translate function
				 *
				 * @param {String} str String to look for.
				 * @return {String} Translated string or the input string if it wasn't found.
				 */
				_: function(str) {
						return this.translate(str);
				},

				/**
				 * Pseudo sprintf implementation - simple way to replace tokens with specified values.
				 *
				 * @param {String} str String with tokens
				 * @return {String} String with replaced tokens
				 */
				sprintf: function(str) {
						var args = [].slice.call(arguments, 1);

						return str.replace(/%[a-z]/g, function() {
								var value = args.shift();
								return Basic.typeOf(value) !== 'undefined' ? value : '';
						});
				}
		};
});

// Included from: src/javascript/core/utils/Mime.js

/**
 * Mime.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define("moxie/core/utils/Mime", [
		"moxie/core/utils/Basic",
		"moxie/core/I18n"
], function(Basic, I18n) {

		var mimeData = "" +
				"application/msword,doc dot," +
				"application/pdf,pdf," +
				"application/pgp-signature,pgp," +
				"application/postscript,ps ai eps," +
				"application/rtf,rtf," +
				"application/vnd.ms-excel,xls xlb," +
				"application/vnd.ms-powerpoint,ppt pps pot," +
				"application/zip,zip," +
				"application/x-shockwave-flash,swf swfl," +
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document,docx," +
				"application/vnd.openxmlformats-officedocument.wordprocessingml.template,dotx," +
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,xlsx," +
				"application/vnd.openxmlformats-officedocument.presentationml.presentation,pptx," +
				"application/vnd.openxmlformats-officedocument.presentationml.template,potx," +
				"application/vnd.openxmlformats-officedocument.presentationml.slideshow,ppsx," +
				"application/x-javascript,js," +
				"application/json,json," +
				"audio/mpeg,mp3 mpga mpega mp2," +
				"audio/x-wav,wav," +
				"audio/x-m4a,m4a," +
				"audio/ogg,oga ogg," +
				"audio/aiff,aiff aif," +
				"audio/flac,flac," +
				"audio/aac,aac," +
				"audio/ac3,ac3," +
				"audio/x-ms-wma,wma," +
				"image/bmp,bmp," +
				"image/gif,gif," +
				"image/jpeg,jpg jpeg jpe," +
				"image/photoshop,psd," +
				"image/png,png," +
				"image/svg+xml,svg svgz," +
				"image/tiff,tiff tif," +
				"text/plain,asc txt text diff log," +
				"text/html,htm html xhtml," +
				"text/css,css," +
				"text/csv,csv," +
				"text/rtf,rtf," +
				"video/mpeg,mpeg mpg mpe m2v," +
				"video/quicktime,qt mov," +
				"video/mp4,mp4," +
				"video/x-m4v,m4v," +
				"video/x-flv,flv," +
				"video/x-ms-wmv,wmv," +
				"video/avi,avi," +
				"video/webm,webm," +
				"video/3gpp,3gpp 3gp," +
				"video/3gpp2,3g2," +
				"video/vnd.rn-realvideo,rv," +
				"video/ogg,ogv," +
				"video/x-matroska,mkv," +
				"application/vnd.oasis.opendocument.formula-template,otf," +
				"application/octet-stream,exe";


		var Mime = {

				mimes: {},

				extensions: {},

				// Parses the default mime types string into a mimes and extensions lookup maps
				addMimeType: function (mimeData) {
						var items = mimeData.split(/,/), i, ii, ext;

						for (i = 0; i < items.length; i += 2) {
								ext = items[i + 1].split(/ /);

								// extension to mime lookup
								for (ii = 0; ii < ext.length; ii++) {
										this.mimes[ext[ii]] = items[i];
								}
								// mime to extension lookup
								this.extensions[items[i]] = ext;
						}
				},


				extList2mimes: function (filters, addMissingExtensions) {
						var self = this, ext, i, ii, type, mimes = [];

						// convert extensions to mime types list
						for (i = 0; i < filters.length; i++) {
								ext = filters[i].extensions.split(/\s*,\s*/);

								for (ii = 0; ii < ext.length; ii++) {

										// if there's an asterisk in the list, then accept attribute is not required
										if (ext[ii] === '*') {
												return [];
										}

										type = self.mimes[ext[ii]];
										if (!type) {
												if (addMissingExtensions && /^\w+$/.test(ext[ii])) {
														mimes.push('.' + ext[ii]);
												} else {
														return []; // accept all
												}
										} else if (Basic.inArray(type, mimes) === -1) {
												mimes.push(type);
										}
								}
						}
						return mimes;
				},


				mimes2exts: function(mimes) {
						var self = this, exts = [];

						Basic.each(mimes, function(mime) {
								if (mime === '*') {
										exts = [];
										return false;
								}

								// check if this thing looks like mime type
								var m = mime.match(/^(\w+)\/(\*|\w+)$/);
								if (m) {
										if (m[2] === '*') {
												// wildcard mime type detected
												Basic.each(self.extensions, function(arr, mime) {
														if ((new RegExp('^' + m[1] + '/')).test(mime)) {
																[].push.apply(exts, self.extensions[mime]);
														}
												});
										} else if (self.extensions[mime]) {
												[].push.apply(exts, self.extensions[mime]);
										}
								}
						});
						return exts;
				},


				mimes2extList: function(mimes) {
						var accept = [], exts = [];

						if (Basic.typeOf(mimes) === 'string') {
								mimes = Basic.trim(mimes).split(/\s*,\s*/);
						}

						exts = this.mimes2exts(mimes);

						accept.push({
								title: I18n.translate('Files'),
								extensions: exts.length ? exts.join(',') : '*'
						});

						// save original mimes string
						accept.mimes = mimes;

						return accept;
				},


				getFileExtension: function(fileName) {
						var matches = fileName && fileName.match(/\.([^.]+)$/);
						if (matches) {
								return matches[1].toLowerCase();
						}
						return '';
				},

				getFileMime: function(fileName) {
						return this.mimes[this.getFileExtension(fileName)] || '';
				}
		};

		Mime.addMimeType(mimeData);

		return Mime;
});

// Included from: src/javascript/core/utils/Env.js

/**
 * Env.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define("moxie/core/utils/Env", [
		"moxie/core/utils/Basic"
], function(Basic) {

		// UAParser.js v0.6.2
		// Lightweight JavaScript-based ApplicationUser-Agent string parser
		// https://github.com/faisalman/ua-parser-js
		//
		// Copyright © 2012-2013 Faisalman <fyzlman@gmail.com>
		// Dual licensed under GPLv2 & MIT

		var UAParser = (function (undefined) {

		    //////////////
		    // Constants
		    /////////////


		    var EMPTY       = '',
		        UNKNOWN     = '?',
		        FUNC_TYPE   = 'function',
		        UNDEF_TYPE  = 'undefined',
		        OBJ_TYPE    = 'object',
		        MAJOR       = 'major',
		        MODEL       = 'model',
		        NAME        = 'name',
		        TYPE        = 'type',
		        VENDOR      = 'vendor',
		        VERSION     = 'version',
		        ARCHITECTURE= 'architecture',
		        CONSOLE     = 'console',
		        MOBILE      = 'mobile',
		        TABLET      = 'tablet';


		    ///////////
		    // Helper
		    //////////


		    var util = {
		        has : function (str1, str2) {
		            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
		        },
		        lowerize : function (str) {
		            return str.toLowerCase();
		        }
		    };


		    ///////////////
		    // Map helper
		    //////////////


		    var mapper = {

		        rgx : function () {

		            // loop through all regexes maps
		            for (var result, i = 0, j, k, p, q, matches, match, args = arguments; i < args.length; i += 2) {

		                var regex = args[i],       // even sequence (0,2,4,..)
		                    props = args[i + 1];   // odd sequence (1,3,5,..)

		                // construct object barebones
		                if (typeof(result) === UNDEF_TYPE) {
		                    result = {};
		                    for (p in props) {
		                        q = props[p];
		                        if (typeof(q) === OBJ_TYPE) {
		                            result[q[0]] = undefined;
		                        } else {
		                            result[q] = undefined;
		                        }
		                    }
		                }

		                // try matching uastring with regexes
		                for (j = k = 0; j < regex.length; j++) {
		                    matches = regex[j].exec(this.getUA());
		                    if (!!matches) {
		                        for (p = 0; p < props.length; p++) {
		                            match = matches[++k];
		                            q = props[p];
		                            // check if given property is actually array
		                            if (typeof(q) === OBJ_TYPE && q.length > 0) {
		                                if (q.length == 2) {
		                                    if (typeof(q[1]) == FUNC_TYPE) {
		                                        // assign modified match
		                                        result[q[0]] = q[1].call(this, match);
		                                    } else {
		                                        // assign given value, ignore regex match
		                                        result[q[0]] = q[1];
		                                    }
		                                } else if (q.length == 3) {
		                                    // check whether function or regex
		                                    if (typeof(q[1]) === FUNC_TYPE && !(q[1].exec && q[1].test)) {
		                                        // call function (usually string mapper)
		                                        result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
		                                    } else {
		                                        // sanitize match using given regex
		                                        result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
		                                    }
		                                } else if (q.length == 4) {
		                                        result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
		                                }
		                            } else {
		                                result[q] = match ? match : undefined;
		                            }
		                        }
		                        break;
		                    }
		                }

		                if(!!matches) break; // break the loop immediately if match found
		            }
		            return result;
		        },

		        str : function (str, map) {

		            for (var i in map) {
		                // check if array
		                if (typeof(map[i]) === OBJ_TYPE && map[i].length > 0) {
		                    for (var j = 0; j < map[i].length; j++) {
		                        if (util.has(map[i][j], str)) {
		                            return (i === UNKNOWN) ? undefined : i;
		                        }
		                    }
		                } else if (util.has(map[i], str)) {
		                    return (i === UNKNOWN) ? undefined : i;
		                }
		            }
		            return str;
		        }
		    };


		    ///////////////
		    // String map
		    //////////////


		    var maps = {

		        browser : {
		            oldsafari : {
		                major : {
		                    '1' : ['/8', '/1', '/3'],
		                    '2' : '/4',
		                    '?' : '/'
		                },
		                version : {
		                    '1.0'   : '/8',
		                    '1.2'   : '/1',
		                    '1.3'   : '/3',
		                    '2.0'   : '/412',
		                    '2.0.2' : '/416',
		                    '2.0.3' : '/417',
		                    '2.0.4' : '/419',
		                    '?'     : '/'
		                }
		            }
		        },

		        device : {
		            sprint : {
		                model : {
		                    'Evo Shift 4G' : '7373KT'
		                },
		                vendor : {
		                    'HTC'       : 'APA',
		                    'Sprint'    : 'Sprint'
		                }
		            }
		        },

		        os : {
		            windows : {
		                version : {
		                    'ME'        : '4.90',
		                    'NT 3.11'   : 'NT3.51',
		                    'NT 4.0'    : 'NT4.0',
		                    '2000'      : 'NT 5.0',
		                    'XP'        : ['NT 5.1', 'NT 5.2'],
		                    'Vista'     : 'NT 6.0',
		                    '7'         : 'NT 6.1',
		                    '8'         : 'NT 6.2',
		                    '8.1'       : 'NT 6.3',
		                    'RT'        : 'ARM'
		                }
		            }
		        }
		    };


		    //////////////
		    // Regex map
		    /////////////


		    var regexes = {

		        browser : [[

		            // Presto based
		            /(opera\smini)\/((\d+)?[\w\.-]+)/i,                                 // Opera Mini
		            /(opera\s[mobiletab]+).+version\/((\d+)?[\w\.-]+)/i,                // Opera Mobi/Tablet
		            /(opera).+version\/((\d+)?[\w\.]+)/i,                               // Opera > 9.80
		            /(opera)[\/\s]+((\d+)?[\w\.]+)/i                                    // Opera < 9.80

		            ], [NAME, VERSION, MAJOR], [

		            /\s(opr)\/((\d+)?[\w\.]+)/i                                         // Opera Webkit
		            ], [[NAME, 'Opera'], VERSION, MAJOR], [

		            // Mixed
		            /(kindle)\/((\d+)?[\w\.]+)/i,                                       // Kindle
		            /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?((\d+)?[\w\.]+)*/i,
		                                                                                // Lunascape/Maxthon/Netfront/Jasmine/Blazer

		            // Trident based
		            /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?((\d+)?[\w\.]*)/i,
		                                                                                // Avant/IEMobile/SlimBrowser/Baidu
		            /(?:ms|\()(ie)\s((\d+)?[\w\.]+)/i,                                  // Internet Explorer

		            // Webkit/KHTML based
		            /(rekonq)((?:\/)[\w\.]+)*/i,                                        // Rekonq
		            /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron)\/((\d+)?[\w\.-]+)/i
		                                                                                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron
		            ], [NAME, VERSION, MAJOR], [

		            /(trident).+rv[:\s]((\d+)?[\w\.]+).+like\sgecko/i                   // IE11
		            ], [[NAME, 'IE'], VERSION, MAJOR], [

		            /(yabrowser)\/((\d+)?[\w\.]+)/i                                     // Yandex
		            ], [[NAME, 'Yandex'], VERSION, MAJOR], [

		            /(comodo_dragon)\/((\d+)?[\w\.]+)/i                                 // Comodo Dragon
		            ], [[NAME, /_/g, ' '], VERSION, MAJOR], [

		            /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?((\d+)?[\w\.]+)/i
		                                                                                // Chrome/OmniWeb/Arora/Tizen/Nokia
		            ], [NAME, VERSION, MAJOR], [

		            /(dolfin)\/((\d+)?[\w\.]+)/i                                        // Dolphin
		            ], [[NAME, 'Dolphin'], VERSION, MAJOR], [

		            /((?:android.+)crmo|crios)\/((\d+)?[\w\.]+)/i                       // Chrome for Android/iOS
		            ], [[NAME, 'Chrome'], VERSION, MAJOR], [

		            /((?:android.+))version\/((\d+)?[\w\.]+)\smobile\ssafari/i          // Android Browser
		            ], [[NAME, 'Android Browser'], VERSION, MAJOR], [

		            /version\/((\d+)?[\w\.]+).+?mobile\/\w+\s(safari)/i                 // Mobile Safari
		            ], [VERSION, MAJOR, [NAME, 'Mobile Safari']], [

		            /version\/((\d+)?[\w\.]+).+?(mobile\s?safari|safari)/i              // Safari & Safari Mobile
		            ], [VERSION, MAJOR, NAME], [

		            /webkit.+?(mobile\s?safari|safari)((\/[\w\.]+))/i                   // Safari < 3.0
		            ], [NAME, [MAJOR, mapper.str, maps.browser.oldsafari.major], [VERSION, mapper.str, maps.browser.oldsafari.version]], [

		            /(konqueror)\/((\d+)?[\w\.]+)/i,                                    // Konqueror
		            /(webkit|khtml)\/((\d+)?[\w\.]+)/i
		            ], [NAME, VERSION, MAJOR], [

		            // Gecko based
		            /(navigator|netscape)\/((\d+)?[\w\.-]+)/i                           // Netscape
		            ], [[NAME, 'Netscape'], VERSION, MAJOR], [
		            /(swiftfox)/i,                                                      // Swiftfox
		            /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?((\d+)?[\w\.\+]+)/i,
		                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
		            /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/((\d+)?[\w\.-]+)/i,
		                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
		            /(mozilla)\/((\d+)?[\w\.]+).+rv\:.+gecko\/\d+/i,                    // Mozilla

		            // Other
		            /(uc\s?browser|polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|qqbrowser)[\/\s]?((\d+)?[\w\.]+)/i,
		                                                                                // UCBrowser/Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/QQBrowser
		            /(links)\s\(((\d+)?[\w\.]+)/i,                                      // Links
		            /(gobrowser)\/?((\d+)?[\w\.]+)*/i,                                  // GoBrowser
		            /(ice\s?browser)\/v?((\d+)?[\w\._]+)/i,                             // ICE Browser
		            /(mosaic)[\/\s]((\d+)?[\w\.]+)/i                                    // Mosaic
		            ], [NAME, VERSION, MAJOR]
		        ],

		        engine : [[

		            /(presto)\/([\w\.]+)/i,                                             // Presto
		            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,     // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
		            /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
		            /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
		            ], [NAME, VERSION], [

		            /rv\:([\w\.]+).*(gecko)/i                                           // Gecko
		            ], [VERSION, NAME]
		        ],

		        os : [[

		            // Windows based
		            /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
		            /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
		            ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
		            /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
		            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

		            // Mobile/Embedded OS
		            /\((bb)(10);/i                                                      // BlackBerry 10
		            ], [[NAME, 'BlackBerry'], VERSION], [
/**
 * mOxie - multi-runtime File API & XMLHttpRequest L2 Polyfill
 * v1.2.1
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 *
 * Date: 2014-05-14
 */
/**
 * Compiled inline version. (Library mode)
 */

/*jshint smarttabs:true, undef:true, latedef:true, curly:true, bitwise:true, camelcase:true */
/*globals $code */

(function(exports, undefined) {
		"use strict";

		var modules = {};

		function require(ids, callback) {
				var module, defs = [];

				for (var i = 0; i < ids.length; ++i) {
						module = modules[ids[i]] || resolve(ids[i]);
						if (!module) {
								throw 'module definition dependecy not found: ' + ids[i];
						}

						defs.push(module);
				}

				callback.apply(null, defs);
		}

		function define(id, dependencies, definition) {
				if (typeof id !== 'string') {
						throw 'invalid module definition, module id must be defined and be a string';
				}

				if (dependencies === undefined) {
						throw 'invalid module definition, dependencies must be specified';
				}

				if (definition === undefined) {
						throw 'invalid module definition, definition function must be specified';
				}

				require(dependencies, function() {
						modules[id] = definition.apply(null, arguments);
				});
		}

		function defined(id) {
				return !!modules[id];
		}

		function resolve(id) {
				var target = exports;
				var fragments = id.split(/[.\/]/);

				for (var fi = 0; fi < fragments.length; ++fi) {
						if (!target[fragments[fi]]) {
								return;
						}

						target = target[fragments[fi]];
				}

				return target;
		}

		function expose(ids) {
				for (var i = 0; i < ids.length; i++) {
						var target = exports;
						var id = ids[i];
						var fragments = id.split(/[.\/]/);

						for (var fi = 0; fi < fragments.length - 1; ++fi) {
								if (target[fragments[fi]] === undefined) {
										target[fragments[fi]] = {};
								}

								target = target[fragments[fi]];
						}

						target[fragments[fragments.length - 1]] = modules[id];
				}
		}

// Included from: src/javascript/core/utils/Basic.js

/**
 * Basic.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define('moxie/core/utils/Basic', [], function() {
		/**
		Gets the true type of the built-in object (better version of typeof).
		@author Angus Croll (http://javascriptweblog.wordpress.com/)

		@method typeOf
		@for Utils
		@static
		@param {Object} o Object to check.
		@return {String} Object [[Class]]
		*/
		var typeOf = function(o) {
				var undef;

				if (o === undef) {
						return 'undefined';
				} else if (o === null) {
						return 'null';
				} else if (o.nodeType) {
						return 'node';
				}

				// the snippet below is awesome, however it fails to detect null, undefined and arguments types in IE lte 8
				return ({}).toString.call(o).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
		};

		/**
		Extends the specified object with another object.

		@method extend
		@static
		@param {Object} target Object to extend.
		@param {Object} [obj]* Multiple objects to extend with.
		@return {Object} Same as target, the extended object.
		*/
		var extend = function(target) {
				var undef;

				each(arguments, function(arg, i) {
						if (i > 0) {
								each(arg, function(value, key) {
										if (value !== undef) {
												if (typeOf(target[key]) === typeOf(value) && !!~inArray(typeOf(value), ['array', 'object'])) {
														extend(target[key], value);
												} else {
														target[key] = value;
												}
										}
								});
						}
				});
				return target;
		};

		/**
		Executes the callback function for each item in array/object. If you return false in the
		callback it will break the loop.

		@method each
		@static
		@param {Object} obj Object to iterate.
		@param {function} callback Callback function to execute for each item.
		*/
		var each = function(obj, callback) {
				var length, key, i, undef;

				if (obj) {
						try {
								length = obj.length;
						} catch(ex) {
								length = undef;
						}

						if (length === undef) {
								// Loop object items
								for (key in obj) {
										if (obj.hasOwnProperty(key)) {
												if (callback(obj[key], key) === false) {
														return;
												}
										}
								}
						} else {
								// Loop array items
								for (i = 0; i < length; i++) {
										if (callback(obj[i], i) === false) {
												return;
										}
								}
						}
				}
		};

		/**
		Checks if object is empty.

		@method isEmptyObj
		@static
		@param {Object} o Object to check.
		@return {Boolean}
		*/
		var isEmptyObj = function(obj) {
				var prop;

				if (!obj || typeOf(obj) !== 'object') {
						return true;
				}

				for (prop in obj) {
						return false;
				}

				return true;
		};

		/**
		Recieve an array of functions (usually async) to call in sequence, each  function
		receives a callback as first argument that it should call, when it completes. Finally,
		after everything is complete, main callback is called. Passing truthy value to the
		callback as a first argument will interrupt the sequence and invoke main callback
		immediately.

		@method inSeries
		@static
		@param {Array} queue Array of functions to call in sequence
		@param {Function} cb Main callback that is called in the end, or in case of error
		*/
		var inSeries = function(queue, cb) {
				var i = 0, length = queue.length;

				if (typeOf(cb) !== 'function') {
						cb = function() {};
				}

				if (!queue || !queue.length) {
						cb();
				}

				function callNext(i) {
						if (typeOf(queue[i]) === 'function') {
								queue[i](function(error) {
										/*jshint expr:true */
										++i < length && !error ? callNext(i) : cb(error);
								});
						}
				}
				callNext(i);
		};


		/**
		Recieve an array of functions (usually async) to call in parallel, each  function
		receives a callback as first argument that it should call, when it completes. After
		everything is complete, main callback is called. Passing truthy value to the
		callback as a first argument will interrupt the process and invoke main callback
		immediately.

		@method inParallel
		@static
		@param {Array} queue Array of functions to call in sequence
		@param {Function} cb Main callback that is called in the end, or in case of erro
		*/
		var inParallel = function(queue, cb) {
				var count = 0, num = queue.length, cbArgs = new Array(num);

				each(queue, function(fn, i) {
						fn(function(error) {
								if (error) {
										return cb(error);
								}

								var args = [].slice.call(arguments);
								args.shift(); // strip error - undefined or not

								cbArgs[i] = args;
								count++;

								if (count === num) {
										cbArgs.unshift(null);
										cb.apply(this, cbArgs);
								}
						});
				});
		};


		/**
		Find an element in array and return it's index if present, otherwise return -1.

		@method inArray
		@static
		@param {Mixed} needle Element to find
		@param {Array} array
		@return {Int} Index of the element, or -1 if not found
		*/
		var inArray = function(needle, array) {
				if (array) {
						if (Array.prototype.indexOf) {
								return Array.prototype.indexOf.call(array, needle);
						}

						for (var i = 0, length = array.length; i < length; i++) {
								if (array[i] === needle) {
										return i;
								}
						}
				}
				return -1;
		};


		/**
		Returns elements of first array if they are not present in second. And false - otherwise.

		@private
		@method arrayDiff
		@param {Array} needles
		@param {Array} array
		@return {Array|Boolean}
		*/
		var arrayDiff = function(needles, array) {
				var diff = [];

				if (typeOf(needles) !== 'array') {
						needles = [needles];
				}

				if (typeOf(array) !== 'array') {
						array = [array];
				}

				for (var i in needles) {
						if (inArray(needles[i], array) === -1) {
								diff.push(needles[i]);
						}
				}
				return diff.length ? diff : false;
		};


		/**
		Find intersection of two arrays.

		@private
		@method arrayIntersect
		@param {Array} array1
		@param {Array} array2
		@return {Array} Intersection of two arrays or null if there is none
		*/
		var arrayIntersect = function(array1, array2) {
				var result = [];
				each(array1, function(item) {
						if (inArray(item, array2) !== -1) {
								result.push(item);
						}
				});
				return result.length ? result : null;
		};


		/**
		Forces anything into an array.

		@method toArray
		@static
		@param {Object} obj Object with length field.
		@return {Array} Array object containing all items.
		*/
		var toArray = function(obj) {
				var i, arr = [];

				for (i = 0; i < obj.length; i++) {
						arr[i] = obj[i];
				}

				return arr;
		};


		/**
		Generates an unique ID. This is 99.99% unique since it takes the current time and 5 random numbers.
		The only way a user would be able to get the same ID is if the two persons at the same exact milisecond manages
		to get 5 the same random numbers between 0-65535 it also uses a counter so each call will be guaranteed to be page unique.
		It's more probable for the earth to be hit with an ansteriod. Y

		@method guid
		@static
		@param {String} prefix to prepend (by default 'o' will be prepended).
		@method guid
		@return {String} Virtually unique id.
		*/
		var guid = (function() {
				var counter = 0;

				return function(prefix) {
						var guid = new Date().getTime().toString(32), i;

						for (i = 0; i < 5; i++) {
								guid += Math.floor(Math.random() * 65535).toString(32);
						}

						return (prefix || 'o_') + guid + (counter++).toString(32);
				};
		}());


		/**
		Trims white spaces around the string

		@method trim
		@static
		@param {String} str
		@return {String}
		*/
		var trim = function(str) {
				if (!str) {
						return str;
				}
				return String.prototype.trim ? String.prototype.trim.call(str) : str.toString().replace(/^\s*/, '').replace(/\s*$/, '');
		};


		/**
		Parses the specified size string into a byte value. For example 10kb becomes 10240.

		@method parseSizeStr
		@static
		@param {String/Number} size String to parse or number to just pass through.
		@return {Number} Size in bytes.
		*/
		var parseSizeStr = function(size) {
				if (typeof(size) !== 'string') {
						return size;
				}

				var muls = {
								t: 1099511627776,
								g: 1073741824,
								m: 1048576,
								k: 1024
						},
						mul;

				size = /^([0-9]+)([mgk]?)$/.exec(size.toLowerCase().replace(/[^0-9mkg]/g, ''));
				mul = size[2];
				size = +size[1];

				if (muls.hasOwnProperty(mul)) {
						size *= muls[mul];
				}
				return size;
		};


		return {
				guid: guid,
				typeOf: typeOf,
				extend: extend,
				each: each,
				isEmptyObj: isEmptyObj,
				inSeries: inSeries,
				inParallel: inParallel,
				inArray: inArray,
				arrayDiff: arrayDiff,
				arrayIntersect: arrayIntersect,
				toArray: toArray,
				trim: trim,
				parseSizeStr: parseSizeStr
		};
});

// Included from: src/javascript/core/I18n.js

/**
 * I18n.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define("moxie/core/I18n", [
		"moxie/core/utils/Basic"
], function(Basic) {
		var i18n = {};

		return {
				/**
				 * Extends the language pack object with new items.
				 *
				 * @param {Object} pack Language pack items to add.
				 * @return {Object} Extended language pack object.
				 */
				addI18n: function(pack) {
						return Basic.extend(i18n, pack);
				},

				/**
				 * Translates the specified string by checking for the english string in the language pack lookup.
				 *
				 * @param {String} str String to look for.
				 * @return {String} Translated string or the input string if it wasn't found.
				 */
				translate: function(str) {
						return i18n[str] || str;
				},

				/**
				 * Shortcut for translate function
				 *
				 * @param {String} str String to look for.
				 * @return {String} Translated string or the input string if it wasn't found.
				 */
				_: function(str) {
						return this.translate(str);
				},

				/**
				 * Pseudo sprintf implementation - simple way to replace tokens with specified values.
				 *
				 * @param {String} str String with tokens
				 * @return {String} String with replaced tokens
				 */
				sprintf: function(str) {
						var args = [].slice.call(arguments, 1);

						return str.replace(/%[a-z]/g, function() {
								var value = args.shift();
								return Basic.typeOf(value) !== 'undefined' ? value : '';
						});
				}
		};
});

// Included from: src/javascript/core/utils/Mime.js

/**
 * Mime.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define("moxie/core/utils/Mime", [
		"moxie/core/utils/Basic",
		"moxie/core/I18n"
], function(Basic, I18n) {

		var mimeData = "" +
				"application/msword,doc dot," +
				"application/pdf,pdf," +
				"application/pgp-signature,pgp," +
				"application/postscript,ps ai eps," +
				"application/rtf,rtf," +
				"application/vnd.ms-excel,xls xlb," +
				"application/vnd.ms-powerpoint,ppt pps pot," +
				"application/zip,zip," +
				"application/x-shockwave-flash,swf swfl," +
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document,docx," +
				"application/vnd.openxmlformats-officedocument.wordprocessingml.template,dotx," +
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,xlsx," +
				"application/vnd.openxmlformats-officedocument.presentationml.presentation,pptx," +
				"application/vnd.openxmlformats-officedocument.presentationml.template,potx," +
				"application/vnd.openxmlformats-officedocument.presentationml.slideshow,ppsx," +
				"application/x-javascript,js," +
				"application/json,json," +
				"audio/mpeg,mp3 mpga mpega mp2," +
				"audio/x-wav,wav," +
				"audio/x-m4a,m4a," +
				"audio/ogg,oga ogg," +
				"audio/aiff,aiff aif," +
				"audio/flac,flac," +
				"audio/aac,aac," +
				"audio/ac3,ac3," +
				"audio/x-ms-wma,wma," +
				"image/bmp,bmp," +
				"image/gif,gif," +
				"image/jpeg,jpg jpeg jpe," +
				"image/photoshop,psd," +
				"image/png,png," +
				"image/svg+xml,svg svgz," +
				"image/tiff,tiff tif," +
				"text/plain,asc txt text diff log," +
				"text/html,htm html xhtml," +
				"text/css,css," +
				"text/csv,csv," +
				"text/rtf,rtf," +
				"video/mpeg,mpeg mpg mpe m2v," +
				"video/quicktime,qt mov," +
				"video/mp4,mp4," +
				"video/x-m4v,m4v," +
				"video/x-flv,flv," +
				"video/x-ms-wmv,wmv," +
				"video/avi,avi," +
				"video/webm,webm," +
				"video/3gpp,3gpp 3gp," +
				"video/3gpp2,3g2," +
				"video/vnd.rn-realvideo,rv," +
				"video/ogg,ogv," +
				"video/x-matroska,mkv," +
				"application/vnd.oasis.opendocument.formula-template,otf," +
				"application/octet-stream,exe";


		var Mime = {

				mimes: {},

				extensions: {},

				// Parses the default mime types string into a mimes and extensions lookup maps
				addMimeType: function (mimeData) {
						var items = mimeData.split(/,/), i, ii, ext;

						for (i = 0; i < items.length; i += 2) {
								ext = items[i + 1].split(/ /);

								// extension to mime lookup
								for (ii = 0; ii < ext.length; ii++) {
										this.mimes[ext[ii]] = items[i];
								}
								// mime to extension lookup
								this.extensions[items[i]] = ext;
						}
				},


				extList2mimes: function (filters, addMissingExtensions) {
						var self = this, ext, i, ii, type, mimes = [];

						// convert extensions to mime types list
						for (i = 0; i < filters.length; i++) {
								ext = filters[i].extensions.split(/\s*,\s*/);

								for (ii = 0; ii < ext.length; ii++) {

										// if there's an asterisk in the list, then accept attribute is not required
										if (ext[ii] === '*') {
												return [];
										}

										type = self.mimes[ext[ii]];
										if (!type) {
												if (addMissingExtensions && /^\w+$/.test(ext[ii])) {
														mimes.push('.' + ext[ii]);
												} else {
														return []; // accept all
												}
										} else if (Basic.inArray(type, mimes) === -1) {
												mimes.push(type);
										}
								}
						}
						return mimes;
				},


				mimes2exts: function(mimes) {
						var self = this, exts = [];

						Basic.each(mimes, function(mime) {
								if (mime === '*') {
										exts = [];
										return false;
								}

								// check if this thing looks like mime type
								var m = mime.match(/^(\w+)\/(\*|\w+)$/);
								if (m) {
										if (m[2] === '*') {
												// wildcard mime type detected
												Basic.each(self.extensions, function(arr, mime) {
														if ((new RegExp('^' + m[1] + '/')).test(mime)) {
																[].push.apply(exts, self.extensions[mime]);
														}
												});
										} else if (self.extensions[mime]) {
												[].push.apply(exts, self.extensions[mime]);
										}
								}
						});
						return exts;
				},


				mimes2extList: function(mimes) {
						var accept = [], exts = [];

						if (Basic.typeOf(mimes) === 'string') {
								mimes = Basic.trim(mimes).split(/\s*,\s*/);
						}

						exts = this.mimes2exts(mimes);

						accept.push({
								title: I18n.translate('Files'),
								extensions: exts.length ? exts.join(',') : '*'
						});

						// save original mimes string
						accept.mimes = mimes;

						return accept;
				},


				getFileExtension: function(fileName) {
						var matches = fileName && fileName.match(/\.([^.]+)$/);
						if (matches) {
								return matches[1].toLowerCase();
						}
						return '';
				},

				getFileMime: function(fileName) {
						return this.mimes[this.getFileExtension(fileName)] || '';
				}
		};

		Mime.addMimeType(mimeData);

		return Mime;
});

// Included from: src/javascript/core/utils/Env.js

/**
 * Env.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define("moxie/core/utils/Env", [
		"moxie/core/utils/Basic"
], function(Basic) {

		// UAParser.js v0.6.2
		// Lightweight JavaScript-based ApplicationUser-Agent string parser
		// https://github.com/faisalman/ua-parser-js
		//
		// Copyright © 2012-2013 Faisalman <fyzlman@gmail.com>
		// Dual licensed under GPLv2 & MIT

		var UAParser = (function (undefined) {

		    //////////////
		    // Constants
		    /////////////


		    var EMPTY       = '',
		        UNKNOWN     = '?',
		        FUNC_TYPE   = 'function',
		        UNDEF_TYPE  = 'undefined',
		        OBJ_TYPE    = 'object',
		        MAJOR       = 'major',
		        MODEL       = 'model',
		        NAME        = 'name',
		        TYPE        = 'type',
		        VENDOR      = 'vendor',
		        VERSION     = 'version',
		        ARCHITECTURE= 'architecture',
		        CONSOLE     = 'console',
		        MOBILE      = 'mobile',
		        TABLET      = 'tablet';


		    ///////////
		    // Helper
		    //////////


		    var util = {
		        has : function (str1, str2) {
		            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
		        },
		        lowerize : function (str) {
		            return str.toLowerCase();
		        }
		    };


		    ///////////////
		    // Map helper
		    //////////////


		    var mapper = {

		        rgx : function () {

		            // loop through all regexes maps
		            for (var result, i = 0, j, k, p, q, matches, match, args = arguments; i < args.length; i += 2) {

		                var regex = args[i],       // even sequence (0,2,4,..)
		                    props = args[i + 1];   // odd sequence (1,3,5,..)

		                // construct object barebones
		                if (typeof(result) === UNDEF_TYPE) {
		                    result = {};
		                    for (p in props) {
		                        q = props[p];
		                        if (typeof(q) === OBJ_TYPE) {
		                            result[q[0]] = undefined;
		                        } else {
		                            result[q] = undefined;
		                        }
		                    }
		                }

		                // try matching uastring with regexes
		                for (j = k = 0; j < regex.length; j++) {
		                    matches = regex[j].exec(this.getUA());
		                    if (!!matches) {
		                        for (p = 0; p < props.length; p++) {
		                            match = matches[++k];
		                            q = props[p];
		                            // check if given property is actually array
		                            if (typeof(q) === OBJ_TYPE && q.length > 0) {
		                                if (q.length == 2) {
		                                    if (typeof(q[1]) == FUNC_TYPE) {
		                                        // assign modified match
		                                        result[q[0]] = q[1].call(this, match);
		                                    } else {
		                                        // assign given value, ignore regex match
		                                        result[q[0]] = q[1];
		                                    }
		                                } else if (q.length == 3) {
		                                    // check whether function or regex
		                                    if (typeof(q[1]) === FUNC_TYPE && !(q[1].exec && q[1].test)) {
		                                        // call function (usually string mapper)
		                                        result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
		                                    } else {
		                                        // sanitize match using given regex
		                                        result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
		                                    }
		                                } else if (q.length == 4) {
		                                        result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
		                                }
		                            } else {
		                                result[q] = match ? match : undefined;
		                            }
		                        }
		                        break;
		                    }
		                }

		                if(!!matches) break; // break the loop immediately if match found
		            }
		            return result;
		        },

		        str : function (str, map) {

		            for (var i in map) {
		                // check if array
		                if (typeof(map[i]) === OBJ_TYPE && map[i].length > 0) {
		                    for (var j = 0; j < map[i].length; j++) {
		                        if (util.has(map[i][j], str)) {
		                            return (i === UNKNOWN) ? undefined : i;
		                        }
		                    }
		                } else if (util.has(map[i], str)) {
		                    return (i === UNKNOWN) ? undefined : i;
		                }
		            }
		            return str;
		        }
		    };


		    ///////////////
		    // String map
		    //////////////


		    var maps = {

		        browser : {
		            oldsafari : {
		                major : {
		                    '1' : ['/8', '/1', '/3'],
		                    '2' : '/4',
		                    '?' : '/'
		                },
		                version : {
		                    '1.0'   : '/8',
		                    '1.2'   : '/1',
		                    '1.3'   : '/3',
		                    '2.0'   : '/412',
		                    '2.0.2' : '/416',
		                    '2.0.3' : '/417',
		                    '2.0.4' : '/419',
		                    '?'     : '/'
		                }
		            }
		        },

		        device : {
		            sprint : {
		                model : {
		                    'Evo Shift 4G' : '7373KT'
		                },
		                vendor : {
		                    'HTC'       : 'APA',
		                    'Sprint'    : 'Sprint'
		                }
		            }
		        },

		        os : {
		            windows : {
		                version : {
		                    'ME'        : '4.90',
		                    'NT 3.11'   : 'NT3.51',
		                    'NT 4.0'    : 'NT4.0',
		                    '2000'      : 'NT 5.0',
		                    'XP'        : ['NT 5.1', 'NT 5.2'],
		                    'Vista'     : 'NT 6.0',
		                    '7'         : 'NT 6.1',
		                    '8'         : 'NT 6.2',
		                    '8.1'       : 'NT 6.3',
		                    'RT'        : 'ARM'
		                }
		            }
		        }
		    };


		    //////////////
		    // Regex map
		    /////////////


		    var regexes = {

		        browser : [[

		            // Presto based
		            /(opera\smini)\/((\d+)?[\w\.-]+)/i,                                 // Opera Mini
		            /(opera\s[mobiletab]+).+version\/((\d+)?[\w\.-]+)/i,                // Opera Mobi/Tablet
		            /(opera).+version\/((\d+)?[\w\.]+)/i,                               // Opera > 9.80
		            /(opera)[\/\s]+((\d+)?[\w\.]+)/i                                    // Opera < 9.80

		            ], [NAME, VERSION, MAJOR], [

		            /\s(opr)\/((\d+)?[\w\.]+)/i                                         // Opera Webkit
		            ], [[NAME, 'Opera'], VERSION, MAJOR], [

		            // Mixed
		            /(kindle)\/((\d+)?[\w\.]+)/i,                                       // Kindle
		            /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?((\d+)?[\w\.]+)*/i,
		                                                                                // Lunascape/Maxthon/Netfront/Jasmine/Blazer

		            // Trident based
		            /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?((\d+)?[\w\.]*)/i,
		                                                                                // Avant/IEMobile/SlimBrowser/Baidu
		            /(?:ms|\()(ie)\s((\d+)?[\w\.]+)/i,                                  // Internet Explorer

		            // Webkit/KHTML based
		            /(rekonq)((?:\/)[\w\.]+)*/i,                                        // Rekonq
		            /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron)\/((\d+)?[\w\.-]+)/i
		                                                                                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron
		            ], [NAME, VERSION, MAJOR], [

		            /(trident).+rv[:\s]((\d+)?[\w\.]+).+like\sgecko/i                   // IE11
		            ], [[NAME, 'IE'], VERSION, MAJOR], [

		            /(yabrowser)\/((\d+)?[\w\.]+)/i                                     // Yandex
		            ], [[NAME, 'Yandex'], VERSION, MAJOR], [

		            /(comodo_dragon)\/((\d+)?[\w\.]+)/i                                 // Comodo Dragon
		            ], [[NAME, /_/g, ' '], VERSION, MAJOR], [

		            /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?((\d+)?[\w\.]+)/i
		                                                                                // Chrome/OmniWeb/Arora/Tizen/Nokia
		            ], [NAME, VERSION, MAJOR], [

		            /(dolfin)\/((\d+)?[\w\.]+)/i                                        // Dolphin
		            ], [[NAME, 'Dolphin'], VERSION, MAJOR], [

		            /((?:android.+)crmo|crios)\/((\d+)?[\w\.]+)/i                       // Chrome for Android/iOS
		            ], [[NAME, 'Chrome'], VERSION, MAJOR], [

		            /((?:android.+))version\/((\d+)?[\w\.]+)\smobile\ssafari/i          // Android Browser
		            ], [[NAME, 'Android Browser'], VERSION, MAJOR], [

		            /version\/((\d+)?[\w\.]+).+?mobile\/\w+\s(safari)/i                 // Mobile Safari
		            ], [VERSION, MAJOR, [NAME, 'Mobile Safari']], [

		            /version\/((\d+)?[\w\.]+).+?(mobile\s?safari|safari)/i              // Safari & Safari Mobile
		            ], [VERSION, MAJOR, NAME], [

		            /webkit.+?(mobile\s?safari|safari)((\/[\w\.]+))/i                   // Safari < 3.0
		            ], [NAME, [MAJOR, mapper.str, maps.browser.oldsafari.major], [VERSION, mapper.str, maps.browser.oldsafari.version]], [

		            /(konqueror)\/((\d+)?[\w\.]+)/i,                                    // Konqueror
		            /(webkit|khtml)\/((\d+)?[\w\.]+)/i
		            ], [NAME, VERSION, MAJOR], [

		            // Gecko based
		            /(navigator|netscape)\/((\d+)?[\w\.-]+)/i                           // Netscape
		            ], [[NAME, 'Netscape'], VERSION, MAJOR], [
		            /(swiftfox)/i,                                                      // Swiftfox
		            /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?((\d+)?[\w\.\+]+)/i,
		                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
		            /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/((\d+)?[\w\.-]+)/i,
		                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
		            /(mozilla)\/((\d+)?[\w\.]+).+rv\:.+gecko\/\d+/i,                    // Mozilla

		            // Other
		            /(uc\s?browser|polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|qqbrowser)[\/\s]?((\d+)?[\w\.]+)/i,
		                                                                                // UCBrowser/Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/QQBrowser
		            /(links)\s\(((\d+)?[\w\.]+)/i,                                      // Links
		            /(gobrowser)\/?((\d+)?[\w\.]+)*/i,                                  // GoBrowser
		            /(ice\s?browser)\/v?((\d+)?[\w\._]+)/i,                             // ICE Browser
		            /(mosaic)[\/\s]((\d+)?[\w\.]+)/i                                    // Mosaic
		            ], [NAME, VERSION, MAJOR]
		        ],

		        engine : [[

		            /(presto)\/([\w\.]+)/i,                                             // Presto
		            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,     // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
		            /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
		            /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
		            ], [NAME, VERSION], [

		            /rv\:([\w\.]+).*(gecko)/i                                           // Gecko
		            ], [VERSION, NAME]
		        ],

		        os : [[

		            // Windows based
		            /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
		            /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
		            ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
		            /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
		            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

		            // Mobile/Embedded OS
		            /\((bb)(10);/i                                                      // BlackBerry 10
		            ], [[NAME, 'BlackBerry'], VERSION], [
/**
 * mOxie - multi-runtime File API & XMLHttpRequest L2 Polyfill
 * v1.2.1
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 *
 * Date: 2014-05-14
 */
/**
 * Compiled inline version. (Library mode)
 */

/*jshint smarttabs:true, undef:true, latedef:true, curly:true, bitwise:true, camelcase:true */
/*globals $code */

(function(exports, undefined) {
		"use strict";

		var modules = {};

		function require(ids, callback) {
				var module, defs = [];

				for (var i = 0; i < ids.length; ++i) {
						module = modules[ids[i]] || resolve(ids[i]);
						if (!module) {
								throw 'module definition dependecy not found: ' + ids[i];
						}

						defs.push(module);
				}

				callback.apply(null, defs);
		}

		function define(id, dependencies, definition) {
				if (typeof id !== 'string') {
						throw 'invalid module definition, module id must be defined and be a string';
				}

				if (dependencies === undefined) {
						throw 'invalid module definition, dependencies must be specified';
				}

				if (definition === undefined) {
						throw 'invalid module definition, definition function must be specified';
				}

				require(dependencies, function() {
						modules[id] = definition.apply(null, arguments);
				});
		}

		function defined(id) {
				return !!modules[id];
		}

		function resolve(id) {
				var target = exports;
				var fragments = id.split(/[.\/]/);

				for (var fi = 0; fi < fragments.length; ++fi) {
						if (!target[fragments[fi]]) {
								return;
						}

						target = target[fragments[fi]];
				}

				return target;
		}

		function expose(ids) {
				for (var i = 0; i < ids.length; i++) {
						var target = exports;
						var id = ids[i];
						var fragments = id.split(/[.\/]/);

						for (var fi = 0; fi < fragments.length - 1; ++fi) {
								if (target[fragments[fi]] === undefined) {
										target[fragments[fi]] = {};
								}

								target = target[fragments[fi]];
						}

						target[fragments[fragments.length - 1]] = modules[id];
				}
		}

// Included from: src/javascript/core/utils/Basic.js

/**
 * Basic.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define('moxie/core/utils/Basic', [], function() {
		/**
		Gets the true type of the built-in object (better version of typeof).
		@author Angus Croll (http://javascriptweblog.wordpress.com/)

		@method typeOf
		@for Utils
		@static
		@param {Object} o Object to check.
		@return {String} Object [[Class]]
		*/
		var typeOf = function(o) {
				var undef;

				if (o === undef) {
						return 'undefined';
				} else if (o === null) {
						return 'null';
				} else if (o.nodeType) {
						return 'node';
				}

				// the snippet below is awesome, however it fails to detect null, undefined and arguments types in IE lte 8
				return ({}).toString.call(o).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
		};

		/**
		Extends the specified object with another object.

		@method extend
		@static
		@param {Object} target Object to extend.
		@param {Object} [obj]* Multiple objects to extend with.
		@return {Object} Same as target, the extended object.
		*/
		var extend = function(target) {
				var undef;

				each(arguments, function(arg, i) {
						if (i > 0) {
								each(arg, function(value, key) {
										if (value !== undef) {
												if (typeOf(target[key]) === typeOf(value) && !!~inArray(typeOf(value), ['array', 'object'])) {
														extend(target[key], value);
												} else {
														target[key] = value;
												}
										}
								});
						}
				});
				return target;
		};

		/**
		Executes the callback function for each item in array/object. If you return false in the
		callback it will break the loop.

		@method each
		@static
		@param {Object} obj Object to iterate.
		@param {function} callback Callback function to execute for each item.
		*/
		var each = function(obj, callback) {
				var length, key, i, undef;

				if (obj) {
						try {
								length = obj.length;
						} catch(ex) {
								length = undef;
						}

						if (length === undef) {
								// Loop object items
								for (key in obj) {
										if (obj.hasOwnProperty(key)) {
												if (callback(obj[key], key) === false) {
														return;
												}
										}
								}
						} else {
								// Loop array items
								for (i = 0; i < length; i++) {
										if (callback(obj[i], i) === false) {
												return;
										}
								}
						}
				}
		};

		/**
		Checks if object is empty.

		@method isEmptyObj
		@static
		@param {Object} o Object to check.
		@return {Boolean}
		*/
		var isEmptyObj = function(obj) {
				var prop;

				if (!obj || typeOf(obj) !== 'object') {
						return true;
				}

				for (prop in obj) {
						return false;
				}

				return true;
		};

		/**
		Recieve an array of functions (usually async) to call in sequence, each  function
		receives a callback as first argument that it should call, when it completes. Finally,
		after everything is complete, main callback is called. Passing truthy value to the
		callback as a first argument will interrupt the sequence and invoke main callback
		immediately.

		@method inSeries
		@static
		@param {Array} queue Array of functions to call in sequence
		@param {Function} cb Main callback that is called in the end, or in case of error
		*/
		var inSeries = function(queue, cb) {
				var i = 0, length = queue.length;

				if (typeOf(cb) !== 'function') {
						cb = function() {};
				}

				if (!queue || !queue.length) {
						cb();
				}

				function callNext(i) {
						if (typeOf(queue[i]) === 'function') {
								queue[i](function(error) {
										/*jshint expr:true */
										++i < length && !error ? callNext(i) : cb(error);
								});
						}
				}
				callNext(i);
		};


		/**
		Recieve an array of functions (usually async) to call in parallel, each  function
		receives a callback as first argument that it should call, when it completes. After
		everything is complete, main callback is called. Passing truthy value to the
		callback as a first argument will interrupt the process and invoke main callback
		immediately.

		@method inParallel
		@static
		@param {Array} queue Array of functions to call in sequence
		@param {Function} cb Main callback that is called in the end, or in case of erro
		*/
		var inParallel = function(queue, cb) {
				var count = 0, num = queue.length, cbArgs = new Array(num);

				each(queue, function(fn, i) {
						fn(function(error) {
								if (error) {
										return cb(error);
								}

								var args = [].slice.call(arguments);
								args.shift(); // strip error - undefined or not

								cbArgs[i] = args;
								count++;

								if (count === num) {
										cbArgs.unshift(null);
										cb.apply(this, cbArgs);
								}
						});
				});
		};


		/**
		Find an element in array and return it's index if present, otherwise return -1.

		@method inArray
		@static
		@param {Mixed} needle Element to find
		@param {Array} array
		@return {Int} Index of the element, or -1 if not found
		*/
		var inArray = function(needle, array) {
				if (array) {
						if (Array.prototype.indexOf) {
								return Array.prototype.indexOf.call(array, needle);
						}

						for (var i = 0, length = array.length; i < length; i++) {
								if (array[i] === needle) {
										return i;
								}
						}
				}
				return -1;
		};


		/**
		Returns elements of first array if they are not present in second. And false - otherwise.

		@private
		@method arrayDiff
		@param {Array} needles
		@param {Array} array
		@return {Array|Boolean}
		*/
		var arrayDiff = function(needles, array) {
				var diff = [];

				if (typeOf(needles) !== 'array') {
						needles = [needles];
				}

				if (typeOf(array) !== 'array') {
						array = [array];
				}

				for (var i in needles) {
						if (inArray(needles[i], array) === -1) {
								diff.push(needles[i]);
						}
				}
				return diff.length ? diff : false;
		};


		/**
		Find intersection of two arrays.

		@private
		@method arrayIntersect
		@param {Array} array1
		@param {Array} array2
		@return {Array} Intersection of two arrays or null if there is none
		*/
		var arrayIntersect = function(array1, array2) {
				var result = [];
				each(array1, function(item) {
						if (inArray(item, array2) !== -1) {
								result.push(item);
						}
				});
				return result.length ? result : null;
		};


		/**
		Forces anything into an array.

		@method toArray
		@static
		@param {Object} obj Object with length field.
		@return {Array} Array object containing all items.
		*/
		var toArray = function(obj) {
				var i, arr = [];

				for (i = 0; i < obj.length; i++) {
						arr[i] = obj[i];
				}

				return arr;
		};


		/**
		Generates an unique ID. This is 99.99% unique since it takes the current time and 5 random numbers.
		The only way a user would be able to get the same ID is if the two persons at the same exact milisecond manages
		to get 5 the same random numbers between 0-65535 it also uses a counter so each call will be guaranteed to be page unique.
		It's more probable for the earth to be hit with an ansteriod. Y

		@method guid
		@static
		@param {String} prefix to prepend (by default 'o' will be prepended).
		@method guid
		@return {String} Virtually unique id.
		*/
		var guid = (function() {
				var counter = 0;

				return function(prefix) {
						var guid = new Date().getTime().toString(32), i;

						for (i = 0; i < 5; i++) {
								guid += Math.floor(Math.random() * 65535).toString(32);
						}

						return (prefix || 'o_') + guid + (counter++).toString(32);
				};
		}());


		/**
		Trims white spaces around the string

		@method trim
		@static
		@param {String} str
		@return {String}
		*/
		var trim = function(str) {
				if (!str) {
						return str;
				}
				return String.prototype.trim ? String.prototype.trim.call(str) : str.toString().replace(/^\s*/, '').replace(/\s*$/, '');
		};


		/**
		Parses the specified size string into a byte value. For example 10kb becomes 10240.

		@method parseSizeStr
		@static
		@param {String/Number} size String to parse or number to just pass through.
		@return {Number} Size in bytes.
		*/
		var parseSizeStr = function(size) {
				if (typeof(size) !== 'string') {
						return size;
				}

				var muls = {
								t: 1099511627776,
								g: 1073741824,
								m: 1048576,
								k: 1024
						},
						mul;

				size = /^([0-9]+)([mgk]?)$/.exec(size.toLowerCase().replace(/[^0-9mkg]/g, ''));
				mul = size[2];
				size = +size[1];

				if (muls.hasOwnProperty(mul)) {
						size *= muls[mul];
				}
				return size;
		};


		return {
				guid: guid,
				typeOf: typeOf,
				extend: extend,
				each: each,
				isEmptyObj: isEmptyObj,
				inSeries: inSeries,
				inParallel: inParallel,
				inArray: inArray,
				arrayDiff: arrayDiff,
				arrayIntersect: arrayIntersect,
				toArray: toArray,
				trim: trim,
				parseSizeStr: parseSizeStr
		};
});

// Included from: src/javascript/core/I18n.js

/**
 * I18n.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define("moxie/core/I18n", [
		"moxie/core/utils/Basic"
], function(Basic) {
		var i18n = {};

		return {
				/**
				 * Extends the language pack object with new items.
				 *
				 * @param {Object} pack Language pack items to add.
				 * @return {Object} Extended language pack object.
				 */
				addI18n: function(pack) {
						return Basic.extend(i18n, pack);
				},

				/**
				 * Translates the specified string by checking for the english string in the language pack lookup.
				 *
				 * @param {String} str String to look for.
				 * @return {String} Translated string or the input string if it wasn't found.
				 */
				translate: function(str) {
						return i18n[str] || str;
				},

				/**
				 * Shortcut for translate function
				 *
				 * @param {String} str String to look for.
				 * @return {String} Translated string or the input string if it wasn't found.
				 */
				_: function(str) {
						return this.translate(str);
				},

				/**
				 * Pseudo sprintf implementation - simple way to replace tokens with specified values.
				 *
				 * @param {String} str String with tokens
				 * @return {String} String with replaced tokens
				 */
				sprintf: function(str) {
						var args = [].slice.call(arguments, 1);

						return str.replace(/%[a-z]/g, function() {
								var value = args.shift();
								return Basic.typeOf(value) !== 'undefined' ? value : '';
						});
				}
		};
});

// Included from: src/javascript/core/utils/Mime.js

/**
 * Mime.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define("moxie/core/utils/Mime", [
		"moxie/core/utils/Basic",
		"moxie/core/I18n"
], function(Basic, I18n) {

		var mimeData = "" +
				"application/msword,doc dot," +
				"application/pdf,pdf," +
				"application/pgp-signature,pgp," +
				"application/postscript,ps ai eps," +
				"application/rtf,rtf," +
				"application/vnd.ms-excel,xls xlb," +
				"application/vnd.ms-powerpoint,ppt pps pot," +
				"application/zip,zip," +
				"application/x-shockwave-flash,swf swfl," +
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document,docx," +
				"application/vnd.openxmlformats-officedocument.wordprocessingml.template,dotx," +
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,xlsx," +
				"application/vnd.openxmlformats-officedocument.presentationml.presentation,pptx," +
				"application/vnd.openxmlformats-officedocument.presentationml.template,potx," +
				"application/vnd.openxmlformats-officedocument.presentationml.slideshow,ppsx," +
				"application/x-javascript,js," +
				"application/json,json," +
				"audio/mpeg,mp3 mpga mpega mp2," +
				"audio/x-wav,wav," +
				"audio/x-m4a,m4a," +
				"audio/ogg,oga ogg," +
				"audio/aiff,aiff aif," +
				"audio/flac,flac," +
				"audio/aac,aac," +
				"audio/ac3,ac3," +
				"audio/x-ms-wma,wma," +
				"image/bmp,bmp," +
				"image/gif,gif," +
				"image/jpeg,jpg jpeg jpe," +
				"image/photoshop,psd," +
				"image/png,png," +
				"image/svg+xml,svg svgz," +
				"image/tiff,tiff tif," +
				"text/plain,asc txt text diff log," +
				"text/html,htm html xhtml," +
				"text/css,css," +
				"text/csv,csv," +
				"text/rtf,rtf," +
				"video/mpeg,mpeg mpg mpe m2v," +
				"video/quicktime,qt mov," +
				"video/mp4,mp4," +
				"video/x-m4v,m4v," +
				"video/x-flv,flv," +
				"video/x-ms-wmv,wmv," +
				"video/avi,avi," +
				"video/webm,webm," +
				"video/3gpp,3gpp 3gp," +
				"video/3gpp2,3g2," +
				"video/vnd.rn-realvideo,rv," +
				"video/ogg,ogv," +
				"video/x-matroska,mkv," +
				"application/vnd.oasis.opendocument.formula-template,otf," +
				"application/octet-stream,exe";


		var Mime = {

				mimes: {},

				extensions: {},

				// Parses the default mime types string into a mimes and extensions lookup maps
				addMimeType: function (mimeData) {
						var items = mimeData.split(/,/), i, ii, ext;

						for (i = 0; i < items.length; i += 2) {
								ext = items[i + 1].split(/ /);

								// extension to mime lookup
								for (ii = 0; ii < ext.length; ii++) {
										this.mimes[ext[ii]] = items[i];
								}
								// mime to extension lookup
								this.extensions[items[i]] = ext;
						}
				},


				extList2mimes: function (filters, addMissingExtensions) {
						var self = this, ext, i, ii, type, mimes = [];

						// convert extensions to mime types list
						for (i = 0; i < filters.length; i++) {
								ext = filters[i].extensions.split(/\s*,\s*/);

								for (ii = 0; ii < ext.length; ii++) {

										// if there's an asterisk in the list, then accept attribute is not required
										if (ext[ii] === '*') {
												return [];
										}

										type = self.mimes[ext[ii]];
										if (!type) {
												if (addMissingExtensions && /^\w+$/.test(ext[ii])) {
														mimes.push('.' + ext[ii]);
												} else {
														return []; // accept all
												}
										} else if (Basic.inArray(type, mimes) === -1) {
												mimes.push(type);
										}
								}
						}
						return mimes;
				},


				mimes2exts: function(mimes) {
						var self = this, exts = [];

						Basic.each(mimes, function(mime) {
								if (mime === '*') {
										exts = [];
										return false;
								}

								// check if this thing looks like mime type
								var m = mime.match(/^(\w+)\/(\*|\w+)$/);
								if (m) {
										if (m[2] === '*') {
												// wildcard mime type detected
												Basic.each(self.extensions, function(arr, mime) {
														if ((new RegExp('^' + m[1] + '/')).test(mime)) {
																[].push.apply(exts, self.extensions[mime]);
														}
												});
										} else if (self.extensions[mime]) {
												[].push.apply(exts, self.extensions[mime]);
										}
								}
						});
						return exts;
				},


				mimes2extList: function(mimes) {
						var accept = [], exts = [];

						if (Basic.typeOf(mimes) === 'string') {
								mimes = Basic.trim(mimes).split(/\s*,\s*/);
						}

						exts = this.mimes2exts(mimes);

						accept.push({
								title: I18n.translate('Files'),
								extensions: exts.length ? exts.join(',') : '*'
						});

						// save original mimes string
						accept.mimes = mimes;

						return accept;
				},


				getFileExtension: function(fileName) {
						var matches = fileName && fileName.match(/\.([^.]+)$/);
						if (matches) {
								return matches[1].toLowerCase();
						}
						return '';
				},

				getFileMime: function(fileName) {
						return this.mimes[this.getFileExtension(fileName)] || '';
				}
		};

		Mime.addMimeType(mimeData);

		return Mime;
});

// Included from: src/javascript/core/utils/Env.js

/**
 * Env.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define("moxie/core/utils/Env", [
		"moxie/core/utils/Basic"
], function(Basic) {

		// UAParser.js v0.6.2
		// Lightweight JavaScript-based ApplicationUser-Agent string parser
		// https://github.com/faisalman/ua-parser-js
		//
		// Copyright © 2012-2013 Faisalman <fyzlman@gmail.com>
		// Dual licensed under GPLv2 & MIT

		var UAParser = (function (undefined) {

		    //////////////
		    // Constants
		    /////////////


		    var EMPTY       = '',
		        UNKNOWN     = '?',
		        FUNC_TYPE   = 'function',
		        UNDEF_TYPE  = 'undefined',
		        OBJ_TYPE    = 'object',
		        MAJOR       = 'major',
		        MODEL       = 'model',
		        NAME        = 'name',
		        TYPE        = 'type',
		        VENDOR      = 'vendor',
		        VERSION     = 'version',
		        ARCHITECTURE= 'architecture',
		        CONSOLE     = 'console',
		        MOBILE      = 'mobile',
		        TABLET      = 'tablet';


		    ///////////
		    // Helper
		    //////////


		    var util = {
		        has : function (str1, str2) {
		            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
		        },
		        lowerize : function (str) {
		            return str.toLowerCase();
		        }
		    };


		    ///////////////
		    // Map helper
		    //////////////


		    var mapper = {

		        rgx : function () {

		            // loop through all regexes maps
		            for (var result, i = 0, j, k, p, q, matches, match, args = arguments; i < args.length; i += 2) {

		                var regex = args[i],       // even sequence (0,2,4,..)
		                    props = args[i + 1];   // odd sequence (1,3,5,..)

		                // construct object barebones
		                if (typeof(result) === UNDEF_TYPE) {
		                    result = {};
		                    for (p in props) {
		                        q = props[p];
		                        if (typeof(q) === OBJ_TYPE) {
		                            result[q[0]] = undefined;
		                        } else {
		                            result[q] = undefined;
		                        }
		                    }
		                }

		                // try matching uastring with regexes
		                for (j = k = 0; j < regex.length; j++) {
		                    matches = regex[j].exec(this.getUA());
		                    if (!!matches) {
		                        for (p = 0; p < props.length; p++) {
		                            match = matches[++k];
		                            q = props[p];
		                            // check if given property is actually array
		                            if (typeof(q) === OBJ_TYPE && q.length > 0) {
		                                if (q.length == 2) {
		                                    if (typeof(q[1]) == FUNC_TYPE) {
		                                        // assign modified match
		                                        result[q[0]] = q[1].call(this, match);
		                                    } else {
		                                        // assign given value, ignore regex match
		                                        result[q[0]] = q[1];
		                                    }
		                                } else if (q.length == 3) {
		                                    // check whether function or regex
		                                    if (typeof(q[1]) === FUNC_TYPE && !(q[1].exec && q[1].test)) {
		                                        // call function (usually string mapper)
		                                        result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
		                                    } else {
		                                        // sanitize match using given regex
		                                        result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
		                                    }
		                                } else if (q.length == 4) {
		                                        result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
		                                }
		                            } else {
		                                result[q] = match ? match : undefined;
		                            }
		                        }
		                        break;
		                    }
		                }

		                if(!!matches) break; // break the loop immediately if match found
		            }
		            return result;
		        },

		        str : function (str, map) {

		            for (var i in map) {
		                // check if array
		                if (typeof(map[i]) === OBJ_TYPE && map[i].length > 0) {
		                    for (var j = 0; j < map[i].length; j++) {
		                        if (util.has(map[i][j], str)) {
		                            return (i === UNKNOWN) ? undefined : i;
		                        }
		                    }
		                } else if (util.has(map[i], str)) {
		                    return (i === UNKNOWN) ? undefined : i;
		                }
		            }
		            return str;
		        }
		    };


		    ///////////////
		    // String map
		    //////////////


		    var maps = {

		        browser : {
		            oldsafari : {
		                major : {
		                    '1' : ['/8', '/1', '/3'],
		                    '2' : '/4',
		                    '?' : '/'
		                },
		                version : {
		                    '1.0'   : '/8',
		                    '1.2'   : '/1',
		                    '1.3'   : '/3',
		                    '2.0'   : '/412',
		                    '2.0.2' : '/416',
		                    '2.0.3' : '/417',
		                    '2.0.4' : '/419',
		                    '?'     : '/'
		                }
		            }
		        },

		        device : {
		            sprint : {
		                model : {
		                    'Evo Shift 4G' : '7373KT'
		                },
		                vendor : {
		                    'HTC'       : 'APA',
		                    'Sprint'    : 'Sprint'
		                }
		            }
		        },

		        os : {
		            windows : {
		                version : {
		                    'ME'        : '4.90',
		                    'NT 3.11'   : 'NT3.51',
		                    'NT 4.0'    : 'NT4.0',
		                    '2000'      : 'NT 5.0',
		                    'XP'        : ['NT 5.1', 'NT 5.2'],
		                    'Vista'     : 'NT 6.0',
		                    '7'         : 'NT 6.1',
		                    '8'         : 'NT 6.2',
		                    '8.1'       : 'NT 6.3',
		                    'RT'        : 'ARM'
		                }
		            }
		        }
		    };


		    //////////////
		    // Regex map
		    /////////////


		    var regexes = {

		        browser : [[

		            // Presto based
		            /(opera\smini)\/((\d+)?[\w\.-]+)/i,                                 // Opera Mini
		            /(opera\s[mobiletab]+).+version\/((\d+)?[\w\.-]+)/i,                // Opera Mobi/Tablet
		            /(opera).+version\/((\d+)?[\w\.]+)/i,                               // Opera > 9.80
		            /(opera)[\/\s]+((\d+)?[\w\.]+)/i                                    // Opera < 9.80

		            ], [NAME, VERSION, MAJOR], [

		            /\s(opr)\/((\d+)?[\w\.]+)/i                                         // Opera Webkit
		            ], [[NAME, 'Opera'], VERSION, MAJOR], [

		            // Mixed
		            /(kindle)\/((\d+)?[\w\.]+)/i,                                       // Kindle
		            /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?((\d+)?[\w\.]+)*/i,
		                                                                                // Lunascape/Maxthon/Netfront/Jasmine/Blazer

		            // Trident based
		            /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?((\d+)?[\w\.]*)/i,
		                                                                                // Avant/IEMobile/SlimBrowser/Baidu
		            /(?:ms|\()(ie)\s((\d+)?[\w\.]+)/i,                                  // Internet Explorer

		            // Webkit/KHTML based
		            /(rekonq)((?:\/)[\w\.]+)*/i,                                        // Rekonq
		            /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron)\/((\d+)?[\w\.-]+)/i
		                                                                                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron
		            ], [NAME, VERSION, MAJOR], [

		            /(trident).+rv[:\s]((\d+)?[\w\.]+).+like\sgecko/i                   // IE11
		            ], [[NAME, 'IE'], VERSION, MAJOR], [

		            /(yabrowser)\/((\d+)?[\w\.]+)/i                                     // Yandex
		            ], [[NAME, 'Yandex'], VERSION, MAJOR], [

		            /(comodo_dragon)\/((\d+)?[\w\.]+)/i                                 // Comodo Dragon
		            ], [[NAME, /_/g, ' '], VERSION, MAJOR], [

		            /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?((\d+)?[\w\.]+)/i
		                                                                                // Chrome/OmniWeb/Arora/Tizen/Nokia
		            ], [NAME, VERSION, MAJOR], [

		            /(dolfin)\/((\d+)?[\w\.]+)/i                                        // Dolphin
		            ], [[NAME, 'Dolphin'], VERSION, MAJOR], [

		            /((?:android.+)crmo|crios)\/((\d+)?[\w\.]+)/i                       // Chrome for Android/iOS
		            ], [[NAME, 'Chrome'], VERSION, MAJOR], [

		            /((?:android.+))version\/((\d+)?[\w\.]+)\smobile\ssafari/i          // Android Browser
		            ], [[NAME, 'Android Browser'], VERSION, MAJOR], [

		            /version\/((\d+)?[\w\.]+).+?mobile\/\w+\s(safari)/i                 // Mobile Safari
		            ], [VERSION, MAJOR, [NAME, 'Mobile Safari']], [

		            /version\/((\d+)?[\w\.]+).+?(mobile\s?safari|safari)/i              // Safari & Safari Mobile
		            ], [VERSION, MAJOR, NAME], [

		            /webkit.+?(mobile\s?safari|safari)((\/[\w\.]+))/i                   // Safari < 3.0
		            ], [NAME, [MAJOR, mapper.str, maps.browser.oldsafari.major], [VERSION, mapper.str, maps.browser.oldsafari.version]], [

		            /(konqueror)\/((\d+)?[\w\.]+)/i,                                    // Konqueror
		            /(webkit|khtml)\/((\d+)?[\w\.]+)/i
		            ], [NAME, VERSION, MAJOR], [

		            // Gecko based
		            /(navigator|netscape)\/((\d+)?[\w\.-]+)/i                           // Netscape
		            ], [[NAME, 'Netscape'], VERSION, MAJOR], [
		            /(swiftfox)/i,                                                      // Swiftfox
		            /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?((\d+)?[\w\.\+]+)/i,
		                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
		            /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/((\d+)?[\w\.-]+)/i,
		                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
		            /(mozilla)\/((\d+)?[\w\.]+).+rv\:.+gecko\/\d+/i,                    // Mozilla

		            // Other
		            /(uc\s?browser|polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|qqbrowser)[\/\s]?((\d+)?[\w\.]+)/i,
		                                                                                // UCBrowser/Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/QQBrowser
		            /(links)\s\(((\d+)?[\w\.]+)/i,                                      // Links
		            /(gobrowser)\/?((\d+)?[\w\.]+)*/i,                                  // GoBrowser
		            /(ice\s?browser)\/v?((\d+)?[\w\._]+)/i,                             // ICE Browser
		            /(mosaic)[\/\s]((\d+)?[\w\.]+)/i                                    // Mosaic
		            ], [NAME, VERSION, MAJOR]
		        ],

		        engine : [[

		            /(presto)\/([\w\.]+)/i,                                             // Presto
		            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,     // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
		            /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
		            /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
		            ], [NAME, VERSION], [

		            /rv\:([\w\.]+).*(gecko)/i                                           // Gecko
		            ], [VERSION, NAME]
		        ],

		        os : [[

		            // Windows based
		            /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
		            /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
		            ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
		            /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
		            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

		            // Mobile/Embedded OS
		            /\((bb)(10);/i                                                      // BlackBerry 10
		            ], [[NAME, 'BlackBerry'], VERSION], [
/**
 * mOxie - multi-runtime File API & XMLHttpRequest L2 Polyfill
 * v1.2.1
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 *
 * Date: 2014-05-14
 */
/**
 * Compiled inline version. (Library mode)
 */

/*jshint smarttabs:true, undef:true, latedef:true, curly:true, bitwise:true, camelcase:true */
/*globals $code */

(function(exports, undefined) {
		"use strict";

		var modules = {};

		function require(ids, callback) {
				var module, defs = [];

				for (var i = 0; i < ids.length; ++i) {
						module = modules[ids[i]] || resolve(ids[i]);
						if (!module) {
								throw 'module definition dependecy not found: ' + ids[i];
						}

						defs.push(module);
				}

				callback.apply(null, defs);
		}

		function define(id, dependencies, definition) {
				if (typeof id !== 'string') {
						throw 'invalid module definition, module id must be defined and be a string';
				}

				if (dependencies === undefined) {
						throw 'invalid module definition, dependencies must be specified';
				}

				if (definition === undefined) {
						throw 'invalid module definition, definition function must be specified';
				}

				require(dependencies, function() {
						modules[id] = definition.apply(null, arguments);
				});
		}

		function defined(id) {
				return !!modules[id];
		}

		function resolve(id) {
				var target = exports;
				var fragments = id.split(/[.\/]/);

				for (var fi = 0; fi < fragments.length; ++fi) {
						if (!target[fragments[fi]]) {
								return;
						}

						target = target[fragments[fi]];
				}

				return target;
		}

		function expose(ids) {
				for (var i = 0; i < ids.length; i++) {
						var target = exports;
						var id = ids[i];
						var fragments = id.split(/[.\/]/);

						for (var fi = 0; fi < fragments.length - 1; ++fi) {
								if (target[fragments[fi]] === undefined) {
										target[fragments[fi]] = {};
								}

								target = target[fragments[fi]];
						}

						target[fragments[fragments.length - 1]] = modules[id];
				}
		}

// Included from: src/javascript/core/utils/Basic.js

/**
 * Basic.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define('moxie/core/utils/Basic', [], function() {
		/**
		Gets the true type of the built-in object (better version of typeof).
		@author Angus Croll (http://javascriptweblog.wordpress.com/)

		@method typeOf
		@for Utils
		@static
		@param {Object} o Object to check.
		@return {String} Object [[Class]]
		*/
		var typeOf = function(o) {
				var undef;

				if (o === undef) {
						return 'undefined';
				} else if (o === null) {
						return 'null';
				} else if (o.nodeType) {
						return 'node';
				}

				// the snippet below is awesome, however it fails to detect null, undefined and arguments types in IE lte 8
				return ({}).toString.call(o).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
		};

		/**
		Extends the specified object with another object.

		@method extend
		@static
		@param {Object} target Object to extend.
		@param {Object} [obj]* Multiple objects to extend with.
		@return {Object} Same as target, the extended object.
		*/
		var extend = function(target) {
				var undef;

				each(arguments, function(arg, i) {
						if (i > 0) {
								each(arg, function(value, key) {
										if (value !== undef) {
												if (typeOf(target[key]) === typeOf(value) && !!~inArray(typeOf(value), ['array', 'object'])) {
														extend(target[key], value);
												} else {
														target[key] = value;
												}
										}
								});
						}
				});
				return target;
		};

		/**
		Executes the callback function for each item in array/object. If you return false in the
		callback it will break the loop.

		@method each
		@static
		@param {Object} obj Object to iterate.
		@param {function} callback Callback function to execute for each item.
		*/
		var each = function(obj, callback) {
				var length, key, i, undef;

				if (obj) {
						try {
								length = obj.length;
						} catch(ex) {
								length = undef;
						}

						if (length === undef) {
								// Loop object items
								for (key in obj) {
										if (obj.hasOwnProperty(key)) {
												if (callback(obj[key], key) === false) {
														return;
												}
										}
								}
						} else {
								// Loop array items
								for (i = 0; i < length; i++) {
										if (callback(obj[i], i) === false) {
												return;
										}
								}
						}
				}
		};

		/**
		Checks if object is empty.

		@method isEmptyObj
		@static
		@param {Object} o Object to check.
		@return {Boolean}
		*/
		var isEmptyObj = function(obj) {
				var prop;

				if (!obj || typeOf(obj) !== 'object') {
						return true;
				}

				for (prop in obj) {
						return false;
				}

				return true;
		};

		/**
		Recieve an array of functions (usually async) to call in sequence, each  function
		receives a callback as first argument that it should call, when it completes. Finally,
		after everything is complete, main callback is called. Passing truthy value to the
		callback as a first argument will interrupt the sequence and invoke main callback
		immediately.

		@method inSeries
		@static
		@param {Array} queue Array of functions to call in sequence
		@param {Function} cb Main callback that is called in the end, or in case of error
		*/
		var inSeries = function(queue, cb) {
				var i = 0, length = queue.length;

				if (typeOf(cb) !== 'function') {
						cb = function() {};
				}

				if (!queue || !queue.length) {
						cb();
				}

				function callNext(i) {
						if (typeOf(queue[i]) === 'function') {
								queue[i](function(error) {
										/*jshint expr:true */
										++i < length && !error ? callNext(i) : cb(error);
								});
						}
				}
				callNext(i);
		};


		/**
		Recieve an array of functions (usually async) to call in parallel, each  function
		receives a callback as first argument that it should call, when it completes. After
		everything is complete, main callback is called. Passing truthy value to the
		callback as a first argument will interrupt the process and invoke main callback
		immediately.

		@method inParallel
		@static
		@param {Array} queue Array of functions to call in sequence
		@param {Function} cb Main callback that is called in the end, or in case of erro
		*/
		var inParallel = function(queue, cb) {
				var count = 0, num = queue.length, cbArgs = new Array(num);

				each(queue, function(fn, i) {
						fn(function(error) {
								if (error) {
										return cb(error);
								}

								var args = [].slice.call(arguments);
								args.shift(); // strip error - undefined or not

								cbArgs[i] = args;
								count++;

								if (count === num) {
										cbArgs.unshift(null);
										cb.apply(this, cbArgs);
								}
						});
				});
		};


		/**
		Find an element in array and return it's index if present, otherwise return -1.

		@method inArray
		@static
		@param {Mixed} needle Element to find
		@param {Array} array
		@return {Int} Index of the element, or -1 if not found
		*/
		var inArray = function(needle, array) {
				if (array) {
						if (Array.prototype.indexOf) {
								return Array.prototype.indexOf.call(array, needle);
						}

						for (var i = 0, length = array.length; i < length; i++) {
								if (array[i] === needle) {
										return i;
								}
						}
				}
				return -1;
		};


		/**
		Returns elements of first array if they are not present in second. And false - otherwise.

		@private
		@method arrayDiff
		@param {Array} needles
		@param {Array} array
		@return {Array|Boolean}
		*/
		var arrayDiff = function(needles, array) {
				var diff = [];

				if (typeOf(needles) !== 'array') {
						needles = [needles];
				}

				if (typeOf(array) !== 'array') {
						array = [array];
				}

				for (var i in needles) {
						if (inArray(needles[i], array) === -1) {
								diff.push(needles[i]);
						}
				}
				return diff.length ? diff : false;
		};


		/**
		Find intersection of two arrays.

		@private
		@method arrayIntersect
		@param {Array} array1
		@param {Array} array2
		@return {Array} Intersection of two arrays or null if there is none
		*/
		var arrayIntersect = function(array1, array2) {
				var result = [];
				each(array1, function(item) {
						if (inArray(item, array2) !== -1) {
								result.push(item);
						}
				});
				return result.length ? result : null;
		};


		/**
		Forces anything into an array.

		@method toArray
		@static
		@param {Object} obj Object with length field.
		@return {Array} Array object containing all items.
		*/
		var toArray = function(obj) {
				var i, arr = [];

				for (i = 0; i < obj.length; i++) {
						arr[i] = obj[i];
				}

				return arr;
		};


		/**
		Generates an unique ID. This is 99.99% unique since it takes the current time and 5 random numbers.
		The only way a user would be able to get the same ID is if the two persons at the same exact milisecond manages
		to get 5 the same random numbers between 0-65535 it also uses a counter so each call will be guaranteed to be page unique.
		It's more probable for the earth to be hit with an ansteriod. Y

		@method guid
		@static
		@param {String} prefix to prepend (by default 'o' will be prepended).
		@method guid
		@return {String} Virtually unique id.
		*/
		var guid = (function() {
				var counter = 0;

				return function(prefix) {
						var guid = new Date().getTime().toString(32), i;

						for (i = 0; i < 5; i++) {
								guid += Math.floor(Math.random() * 65535).toString(32);
						}

						return (prefix || 'o_') + guid + (counter++).toString(32);
				};
		}());


		/**
		Trims white spaces around the string

		@method trim
		@static
		@param {String} str
		@return {String}
		*/
		var trim = function(str) {
				if (!str) {
						return str;
				}
				return String.prototype.trim ? String.prototype.trim.call(str) : str.toString().replace(/^\s*/, '').replace(/\s*$/, '');
		};


		/**
		Parses the specified size string into a byte value. For example 10kb becomes 10240.

		@method parseSizeStr
		@static
		@param {String/Number} size String to parse or number to just pass through.
		@return {Number} Size in bytes.
		*/
		var parseSizeStr = function(size) {
				if (typeof(size) !== 'string') {
						return size;
				}

				var muls = {
								t: 1099511627776,
								g: 1073741824,
								m: 1048576,
								k: 1024
						},
						mul;

				size = /^([0-9]+)([mgk]?)$/.exec(size.toLowerCase().replace(/[^0-9mkg]/g, ''));
				mul = size[2];
				size = +size[1];

				if (muls.hasOwnProperty(mul)) {
						size *= muls[mul];
				}
				return size;
		};


		return {
				guid: guid,
				typeOf: typeOf,
				extend: extend,
				each: each,
				isEmptyObj: isEmptyObj,
				inSeries: inSeries,
				inParallel: inParallel,
				inArray: inArray,
				arrayDiff: arrayDiff,
				arrayIntersect: arrayIntersect,
				toArray: toArray,
				trim: trim,
				parseSizeStr: parseSizeStr
		};
});

// Included from: src/javascript/core/I18n.js

/**
 * I18n.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define("moxie/core/I18n", [
		"moxie/core/utils/Basic"
], function(Basic) {
		var i18n = {};

		return {
				/**
				 * Extends the language pack object with new items.
				 *
				 * @param {Object} pack Language pack items to add.
				 * @return {Object} Extended language pack object.
				 */
				addI18n: function(pack) {
						return Basic.extend(i18n, pack);
				},

				/**
				 * Translates the specified string by checking for the english string in the language pack lookup.
				 *
				 * @param {String} str String to look for.
				 * @return {String} Translated string or the input string if it wasn't found.
				 */
				translate: function(str) {
						return i18n[str] || str;
				},

				/**
				 * Shortcut for translate function
				 *
				 * @param {String} str String to look for.
				 * @return {String} Translated string or the input string if it wasn't found.
				 */
				_: function(str) {
						return this.translate(str);
				},

				/**
				 * Pseudo sprintf implementation - simple way to replace tokens with specified values.
				 *
				 * @param {String} str String with tokens
				 * @return {String} String with replaced tokens
				 */
				sprintf: function(str) {
						var args = [].slice.call(arguments, 1);

						return str.replace(/%[a-z]/g, function() {
								var value = args.shift();
								return Basic.typeOf(value) !== 'undefined' ? value : '';
						});
				}
		};
});

// Included from: src/javascript/core/utils/Mime.js

/**
 * Mime.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define("moxie/core/utils/Mime", [
		"moxie/core/utils/Basic",
		"moxie/core/I18n"
], function(Basic, I18n) {

		var mimeData = "" +
				"application/msword,doc dot," +
				"application/pdf,pdf," +
				"application/pgp-signature,pgp," +
				"application/postscript,ps ai eps," +
				"application/rtf,rtf," +
				"application/vnd.ms-excel,xls xlb," +
				"application/vnd.ms-powerpoint,ppt pps pot," +
				"application/zip,zip," +
				"application/x-shockwave-flash,swf swfl," +
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document,docx," +
				"application/vnd.openxmlformats-officedocument.wordprocessingml.template,dotx," +
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,xlsx," +
				"application/vnd.openxmlformats-officedocument.presentationml.presentation,pptx," +
				"application/vnd.openxmlformats-officedocument.presentationml.template,potx," +
				"application/vnd.openxmlformats-officedocument.presentationml.slideshow,ppsx," +
				"application/x-javascript,js," +
				"application/json,json," +
				"audio/mpeg,mp3 mpga mpega mp2," +
				"audio/x-wav,wav," +
				"audio/x-m4a,m4a," +
				"audio/ogg,oga ogg," +
				"audio/aiff,aiff aif," +
				"audio/flac,flac," +
				"audio/aac,aac," +
				"audio/ac3,ac3," +
				"audio/x-ms-wma,wma," +
				"image/bmp,bmp," +
				"image/gif,gif," +
				"image/jpeg,jpg jpeg jpe," +
				"image/photoshop,psd," +
				"image/png,png," +
				"image/svg+xml,svg svgz," +
				"image/tiff,tiff tif," +
				"text/plain,asc txt text diff log," +
				"text/html,htm html xhtml," +
				"text/css,css," +
				"text/csv,csv," +
				"text/rtf,rtf," +
				"video/mpeg,mpeg mpg mpe m2v," +
				"video/quicktime,qt mov," +
				"video/mp4,mp4," +
				"video/x-m4v,m4v," +
				"video/x-flv,flv," +
				"video/x-ms-wmv,wmv," +
				"video/avi,avi," +
				"video/webm,webm," +
				"video/3gpp,3gpp 3gp," +
				"video/3gpp2,3g2," +
				"video/vnd.rn-realvideo,rv," +
				"video/ogg,ogv," +
				"video/x-matroska,mkv," +
				"application/vnd.oasis.opendocument.formula-template,otf," +
				"application/octet-stream,exe";


		var Mime = {

				mimes: {},

				extensions: {},

				// Parses the default mime types string into a mimes and extensions lookup maps
				addMimeType: function (mimeData) {
						var items = mimeData.split(/,/), i, ii, ext;

						for (i = 0; i < items.length; i += 2) {
								ext = items[i + 1].split(/ /);

								// extension to mime lookup
								for (ii = 0; ii < ext.length; ii++) {
										this.mimes[ext[ii]] = items[i];
								}
								// mime to extension lookup
								this.extensions[items[i]] = ext;
						}
				},


				extList2mimes: function (filters, addMissingExtensions) {
						var self = this, ext, i, ii, type, mimes = [];

						// convert extensions to mime types list
						for (i = 0; i < filters.length; i++) {
								ext = filters[i].extensions.split(/\s*,\s*/);

								for (ii = 0; ii < ext.length; ii++) {

										// if there's an asterisk in the list, then accept attribute is not required
										if (ext[ii] === '*') {
												return [];
										}

										type = self.mimes[ext[ii]];
										if (!type) {
												if (addMissingExtensions && /^\w+$/.test(ext[ii])) {
														mimes.push('.' + ext[ii]);
												} else {
														return []; // accept all
												}
										} else if (Basic.inArray(type, mimes) === -1) {
												mimes.push(type);
										}
								}
						}
						return mimes;
				},


				mimes2exts: function(mimes) {
						var self = this, exts = [];

						Basic.each(mimes, function(mime) {
								if (mime === '*') {
										exts = [];
										return false;
								}

								// check if this thing looks like mime type
								var m = mime.match(/^(\w+)\/(\*|\w+)$/);
								if (m) {
										if (m[2] === '*') {
												// wildcard mime type detected
												Basic.each(self.extensions, function(arr, mime) {
														if ((new RegExp('^' + m[1] + '/')).test(mime)) {
																[].push.apply(exts, self.extensions[mime]);
														}
												});
										} else if (self.extensions[mime]) {
												[].push.apply(exts, self.extensions[mime]);
										}
								}
						});
						return exts;
				},


				mimes2extList: function(mimes) {
						var accept = [], exts = [];

						if (Basic.typeOf(mimes) === 'string') {
								mimes = Basic.trim(mimes).split(/\s*,\s*/);
						}

						exts = this.mimes2exts(mimes);

						accept.push({
								title: I18n.translate('Files'),
								extensions: exts.length ? exts.join(',') : '*'
						});

						// save original mimes string
						accept.mimes = mimes;

						return accept;
				},


				getFileExtension: function(fileName) {
						var matches = fileName && fileName.match(/\.([^.]+)$/);
						if (matches) {
								return matches[1].toLowerCase();
						}
						return '';
				},

				getFileMime: function(fileName) {
						return this.mimes[this.getFileExtension(fileName)] || '';
				}
		};

		Mime.addMimeType(mimeData);

		return Mime;
});

// Included from: src/javascript/core/utils/Env.js

/**
 * Env.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define("moxie/core/utils/Env", [
		"moxie/core/utils/Basic"
], function(Basic) {

		// UAParser.js v0.6.2
		// Lightweight JavaScript-based ApplicationUser-Agent string parser
		// https://github.com/faisalman/ua-parser-js
		//
		// Copyright © 2012-2013 Faisalman <fyzlman@gmail.com>
		// Dual licensed under GPLv2 & MIT

		var UAParser = (function (undefined) {

		    //////////////
		    // Constants
		    /////////////


		    var EMPTY       = '',
		        UNKNOWN     = '?',
		        FUNC_TYPE   = 'function',
		        UNDEF_TYPE  = 'undefined',
		        OBJ_TYPE    = 'object',
		        MAJOR       = 'major',
		        MODEL       = 'model',
		        NAME        = 'name',
		        TYPE        = 'type',
		        VENDOR      = 'vendor',
		        VERSION     = 'version',
		        ARCHITECTURE= 'architecture',
		        CONSOLE     = 'console',
		        MOBILE      = 'mobile',
		        TABLET      = 'tablet';


		    ///////////
		    // Helper
		    //////////


		    var util = {
		        has : function (str1, str2) {
		            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
		        },
		        lowerize : function (str) {
		            return str.toLowerCase();
		        }
		    };


		    ///////////////
		    // Map helper
		    //////////////


		    var mapper = {

		        rgx : function () {

		            // loop through all regexes maps
		            for (var result, i = 0, j, k, p, q, matches, match, args = arguments; i < args.length; i += 2) {

		                var regex = args[i],       // even sequence (0,2,4,..)
		                    props = args[i + 1];   // odd sequence (1,3,5,..)

		                // construct object barebones
		                if (typeof(result) === UNDEF_TYPE) {
		                    result = {};
		                    for (p in props) {
		                        q = props[p];
		                        if (typeof(q) === OBJ_TYPE) {
		                            result[q[0]] = undefined;
		                        } else {
		                            result[q] = undefined;
		                        }
		                    }
		                }

		                // try matching uastring with regexes
		                for (j = k = 0; j < regex.length; j++) {
		                    matches = regex[j].exec(this.getUA());
		                    if (!!matches) {
		                        for (p = 0; p < props.length; p++) {
		                            match = matches[++k];
		                            q = props[p];
		                            // check if given property is actually array
		                            if (typeof(q) === OBJ_TYPE && q.length > 0) {
		                                if (q.length == 2) {
		                                    if (typeof(q[1]) == FUNC_TYPE) {
		                                        // assign modified match
		                                        result[q[0]] = q[1].call(this, match);
		                                    } else {
		                                        // assign given value, ignore regex match
		                                        result[q[0]] = q[1];
		                                    }
		                                } else if (q.length == 3) {
		                                    // check whether function or regex
		                                    if (typeof(q[1]) === FUNC_TYPE && !(q[1].exec && q[1].test)) {
		                                        // call function (usually string mapper)
		                                        result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
		                                    } else {
		                                        // sanitize match using given regex
		                                        result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
		                                    }
		                                } else if (q.length == 4) {
		                                        result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
		                                }
		                            } else {
		                                result[q] = match ? match : undefined;
		                            }
		                        }
		                        break;
		                    }
		                }

		                if(!!matches) break; // break the loop immediately if match found
		            }
		            return result;
		        },

		        str : function (str, map) {

		            for (var i in map) {
		                // check if array
		                if (typeof(map[i]) === OBJ_TYPE && map[i].length > 0) {
		                    for (var j = 0; j < map[i].length; j++) {
		                        if (util.has(map[i][j], str)) {
		                            return (i === UNKNOWN) ? undefined : i;
		                        }
		                    }
		                } else if (util.has(map[i], str)) {
		                    return (i === UNKNOWN) ? undefined : i;
		                }
		            }
		            return str;
		        }
		    };


		    ///////////////
		    // String map
		    //////////////


		    var maps = {

		        browser : {
		            oldsafari : {
		                major : {
		                    '1' : ['/8', '/1', '/3'],
		                    '2' : '/4',
		                    '?' : '/'
		                },
		                version : {
		                    '1.0'   : '/8',
		                    '1.2'   : '/1',
		                    '1.3'   : '/3',
		                    '2.0'   : '/412',
		                    '2.0.2' : '/416',
		                    '2.0.3' : '/417',
		                    '2.0.4' : '/419',
		                    '?'     : '/'
		                }
		            }
		        },

		        device : {
		            sprint : {
		                model : {
		                    'Evo Shift 4G' : '7373KT'
		                },
		                vendor : {
		                    'HTC'       : 'APA',
		                    'Sprint'    : 'Sprint'
		                }
		            }
		        },

		        os : {
		            windows : {
		                version : {
		                    'ME'        : '4.90',
		                    'NT 3.11'   : 'NT3.51',
		                    'NT 4.0'    : 'NT4.0',
		                    '2000'      : 'NT 5.0',
		                    'XP'        : ['NT 5.1', 'NT 5.2'],
		                    'Vista'     : 'NT 6.0',
		                    '7'         : 'NT 6.1',
		                    '8'         : 'NT 6.2',
		                    '8.1'       : 'NT 6.3',
		                    'RT'        : 'ARM'
		                }
		            }
		        }
		    };


		    //////////////
		    // Regex map
		    /////////////


		    var regexes = {

		        browser : [[

		            // Presto based
		            /(opera\smini)\/((\d+)?[\w\.-]+)/i,                                 // Opera Mini
		            /(opera\s[mobiletab]+).+version\/((\d+)?[\w\.-]+)/i,                // Opera Mobi/Tablet
		            /(opera).+version\/((\d+)?[\w\.]+)/i,                               // Opera > 9.80
		            /(opera)[\/\s]+((\d+)?[\w\.]+)/i                                    // Opera < 9.80

		            ], [NAME, VERSION, MAJOR], [

		            /\s(opr)\/((\d+)?[\w\.]+)/i                                         // Opera Webkit
		            ], [[NAME, 'Opera'], VERSION, MAJOR], [

		            // Mixed
		            /(kindle)\/((\d+)?[\w\.]+)/i,                                       // Kindle
		            /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?((\d+)?[\w\.]+)*/i,
		                                                                                // Lunascape/Maxthon/Netfront/Jasmine/Blazer

		            // Trident based
		            /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?((\d+)?[\w\.]*)/i,
		                                                                                // Avant/IEMobile/SlimBrowser/Baidu
		            /(?:ms|\()(ie)\s((\d+)?[\w\.]+)/i,                                  // Internet Explorer

		            // Webkit/KHTML based
		            /(rekonq)((?:\/)[\w\.]+)*/i,                                        // Rekonq
		            /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron)\/((\d+)?[\w\.-]+)/i
		                                                                                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron
		            ], [NAME, VERSION, MAJOR], [

		            /(trident).+rv[:\s]((\d+)?[\w\.]+).+like\sgecko/i                   // IE11
		            ], [[NAME, 'IE'], VERSION, MAJOR], [

		            /(yabrowser)\/((\d+)?[\w\.]+)/i                                     // Yandex
		            ], [[NAME, 'Yandex'], VERSION, MAJOR], [

		            /(comodo_dragon)\/((\d+)?[\w\.]+)/i                                 // Comodo Dragon
		            ], [[NAME, /_/g, ' '], VERSION, MAJOR], [

		            /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?((\d+)?[\w\.]+)/i
		                                                                                // Chrome/OmniWeb/Arora/Tizen/Nokia
		            ], [NAME, VERSION, MAJOR], [

		            /(dolfin)\/((\d+)?[\w\.]+)/i                                        // Dolphin
		            ], [[NAME, 'Dolphin'], VERSION, MAJOR], [

		            /((?:android.+)crmo|crios)\/((\d+)?[\w\.]+)/i                       // Chrome for Android/iOS
		            ], [[NAME, 'Chrome'], VERSION, MAJOR], [

		            /((?:android.+))version\/((\d+)?[\w\.]+)\smobile\ssafari/i          // Android Browser
		            ], [[NAME, 'Android Browser'], VERSION, MAJOR], [

		            /version\/((\d+)?[\w\.]+).+?mobile\/\w+\s(safari)/i                 // Mobile Safari
		            ], [VERSION, MAJOR, [NAME, 'Mobile Safari']], [

		            /version\/((\d+)?[\w\.]+).+?(mobile\s?safari|safari)/i              // Safari & Safari Mobile
		            ], [VERSION, MAJOR, NAME], [

		            /webkit.+?(mobile\s?safari|safari)((\/[\w\.]+))/i                   // Safari < 3.0
		            ], [NAME, [MAJOR, mapper.str, maps.browser.oldsafari.major], [VERSION, mapper.str, maps.browser.oldsafari.version]], [

		            /(konqueror)\/((\d+)?[\w\.]+)/i,                                    // Konqueror
		            /(webkit|khtml)\/((\d+)?[\w\.]+)/i
		            ], [NAME, VERSION, MAJOR], [

		            // Gecko based
		            /(navigator|netscape)\/((\d+)?[\w\.-]+)/i                           // Netscape
		            ], [[NAME, 'Netscape'], VERSION, MAJOR], [
		            /(swiftfox)/i,                                                      // Swiftfox
		            /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?((\d+)?[\w\.\+]+)/i,
		                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
		            /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/((\d+)?[\w\.-]+)/i,
		                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
		            /(mozilla)\/((\d+)?[\w\.]+).+rv\:.+gecko\/\d+/i,                    // Mozilla

		            // Other
		            /(uc\s?browser|polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|qqbrowser)[\/\s]?((\d+)?[\w\.]+)/i,
		                                                                                // UCBrowser/Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/QQBrowser
		            /(links)\s\(((\d+)?[\w\.]+)/i,                                      // Links
		            /(gobrowser)\/?((\d+)?[\w\.]+)*/i,                                  // GoBrowser
		            /(ice\s?browser)\/v?((\d+)?[\w\._]+)/i,                             // ICE Browser
		            /(mosaic)[\/\s]((\d+)?[\w\.]+)/i                                    // Mosaic
		            ], [NAME, VERSION, MAJOR]
		        ],

		        engine : [[

		            /(presto)\/([\w\.]+)/i,                                             // Presto
		            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,     // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
		            /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
		            /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
		            ], [NAME, VERSION], [

		            /rv\:([\w\.]+).*(gecko)/i                                           // Gecko
		            ], [VERSION, NAME]
		        ],

		        os : [[

		            // Windows based
		            /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
		            /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
		            ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
		            /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
		            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

		            // Mobile/Embedded OS
		            /\((bb)(10);/i                                                      // BlackBerry 10
		            ], [[NAME, 'BlackBerry'], VERSION], [

/**
 * mOxie - multi-runtime File API & XMLHttpRequest L2 Polyfill
 * v1.2.1
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 *
 * Date: 2014-05-14
 */
/**
 * Compiled inline version. (Library mode)
 */

/*jshint smarttabs:true, undef:true, latedef:true, curly:true, bitwise:true, camelcase:true */
/*globals $code */

(function(exports, undefined) {
		"use strict";

		var modules = {};

		function require(ids, callback) {
				var module, defs = [];

				for (var i = 0; i < ids.length; ++i) {
						module = modules[ids[i]] || resolve(ids[i]);
						if (!module) {
								throw 'module definition dependecy not found: ' + ids[i];
						}

						defs.push(module);
				}

				callback.apply(null, defs);
		}

		function define(id, dependencies, definition) {
				if (typeof id !== 'string') {
						throw 'invalid module definition, module id must be defined and be a string';
				}

				if (dependencies === undefined) {
						throw 'invalid module definition, dependencies must be specified';
				}

				if (definition === undefined) {
						throw 'invalid module definition, definition function must be specified';
				}

				require(dependencies, function() {
						modules[id] = definition.apply(null, arguments);
				});
		}

		function defined(id) {
				return !!modules[id];
		}

		function resolve(id) {
				var target = exports;
				var fragments = id.split(/[.\/]/);

				for (var fi = 0; fi < fragments.length; ++fi) {
						if (!target[fragments[fi]]) {
								return;
						}

						target = target[fragments[fi]];
				}

				return target;
		}

		function expose(ids) {
				for (var i = 0; i < ids.length; i++) {
						var target = exports;
						var id = ids[i];
						var fragments = id.split(/[.\/]/);

						for (var fi = 0; fi < fragments.length - 1; ++fi) {
								if (target[fragments[fi]] === undefined) {
										target[fragments[fi]] = {};
								}

								target = target[fragments[fi]];
						}

						target[fragments[fragments.length - 1]] = modules[id];
				}
		}

// Included from: src/javascript/core/utils/Basic.js

/**
 * Basic.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define('moxie/core/utils/Basic', [], function() {
		/**
		Gets the true type of the built-in object (better version of typeof).
		@author Angus Croll (http://javascriptweblog.wordpress.com/)

		@method typeOf
		@for Utils
		@static
		@param {Object} o Object to check.
		@return {String} Object [[Class]]
		*/
		var typeOf = function(o) {
				var undef;

				if (o === undef) {
						return 'undefined';
				} else if (o === null) {
						return 'null';
				} else if (o.nodeType) {
						return 'node';
				}

				// the snippet below is awesome, however it fails to detect null, undefined and arguments types in IE lte 8
				return ({}).toString.call(o).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
		};

		/**
		Extends the specified object with another object.

		@method extend
		@static
		@param {Object} target Object to extend.
		@param {Object} [obj]* Multiple objects to extend with.
		@return {Object} Same as target, the extended object.
		*/
		var extend = function(target) {
				var undef;

				each(arguments, function(arg, i) {
						if (i > 0) {
								each(arg, function(value, key) {
										if (value !== undef) {
												if (typeOf(target[key]) === typeOf(value) && !!~inArray(typeOf(value), ['array', 'object'])) {
														extend(target[key], value);
												} else {
														target[key] = value;
												}
										}
								});
						}
				});
				return target;
		};

		/**
		Executes the callback function for each item in array/object. If you return false in the
		callback it will break the loop.

		@method each
		@static
		@param {Object} obj Object to iterate.
		@param {function} callback Callback function to execute for each item.
		*/
		var each = function(obj, callback) {
				var length, key, i, undef;

				if (obj) {
						try {
								length = obj.length;
						} catch(ex) {
								length = undef;
						}

						if (length === undef) {
								// Loop object items
								for (key in obj) {
										if (obj.hasOwnProperty(key)) {
												if (callback(obj[key], key) === false) {
														return;
												}
										}
								}
						} else {
								// Loop array items
								for (i = 0; i < length; i++) {
										if (callback(obj[i], i) === false) {
												return;
										}
								}
						}
				}
		};

		/**
		Checks if object is empty.

		@method isEmptyObj
		@static
		@param {Object} o Object to check.
		@return {Boolean}
		*/
		var isEmptyObj = function(obj) {
				var prop;

				if (!obj || typeOf(obj) !== 'object') {
						return true;
				}

				for (prop in obj) {
						return false;
				}

				return true;
		};

		/**
		Recieve an array of functions (usually async) to call in sequence, each  function
		receives a callback as first argument that it should call, when it completes. Finally,
		after everything is complete, main callback is called. Passing truthy value to the
		callback as a first argument will interrupt the sequence and invoke main callback
		immediately.

		@method inSeries
		@static
		@param {Array} queue Array of functions to call in sequence
		@param {Function} cb Main callback that is called in the end, or in case of error
		*/
		var inSeries = function(queue, cb) {
				var i = 0, length = queue.length;

				if (typeOf(cb) !== 'function') {
						cb = function() {};
				}

				if (!queue || !queue.length) {
						cb();
				}

				function callNext(i) {
						if (typeOf(queue[i]) === 'function') {
								queue[i](function(error) {
										/*jshint expr:true */
										++i < length && !error ? callNext(i) : cb(error);
								});
						}
				}
				callNext(i);
		};


		/**
		Recieve an array of functions (usually async) to call in parallel, each  function
		receives a callback as first argument that it should call, when it completes. After
		everything is complete, main callback is called. Passing truthy value to the
		callback as a first argument will interrupt the process and invoke main callback
		immediately.

		@method inParallel
		@static
		@param {Array} queue Array of functions to call in sequence
		@param {Function} cb Main callback that is called in the end, or in case of erro
		*/
		var inParallel = function(queue, cb) {
				var count = 0, num = queue.length, cbArgs = new Array(num);

				each(queue, function(fn, i) {
						fn(function(error) {
								if (error) {
										return cb(error);
								}

								var args = [].slice.call(arguments);
								args.shift(); // strip error - undefined or not

								cbArgs[i] = args;
								count++;

								if (count === num) {
										cbArgs.unshift(null);
										cb.apply(this, cbArgs);
								}
						});
				});
		};


		/**
		Find an element in array and return it's index if present, otherwise return -1.

		@method inArray
		@static
		@param {Mixed} needle Element to find
		@param {Array} array
		@return {Int} Index of the element, or -1 if not found
		*/
		var inArray = function(needle, array) {
				if (array) {
						if (Array.prototype.indexOf) {
								return Array.prototype.indexOf.call(array, needle);
						}

						for (var i = 0, length = array.length; i < length; i++) {
								if (array[i] === needle) {
										return i;
								}
						}
				}
				return -1;
		};


		/**
		Returns elements of first array if they are not present in second. And false - otherwise.

		@private
		@method arrayDiff
		@param {Array} needles
		@param {Array} array
		@return {Array|Boolean}
		*/
		var arrayDiff = function(needles, array) {
				var diff = [];

				if (typeOf(needles) !== 'array') {
						needles = [needles];
				}

				if (typeOf(array) !== 'array') {
						array = [array];
				}

				for (var i in needles) {
						if (inArray(needles[i], array) === -1) {
								diff.push(needles[i]);
						}
				}
				return diff.length ? diff : false;
		};


		/**
		Find intersection of two arrays.

		@private
		@method arrayIntersect
		@param {Array} array1
		@param {Array} array2
		@return {Array} Intersection of two arrays or null if there is none
		*/
		var arrayIntersect = function(array1, array2) {
				var result = [];
				each(array1, function(item) {
						if (inArray(item, array2) !== -1) {
								result.push(item);
						}
				});
				return result.length ? result : null;
		};


		/**
		Forces anything into an array.

		@method toArray
		@static
		@param {Object} obj Object with length field.
		@return {Array} Array object containing all items.
		*/
		var toArray = function(obj) {
				var i, arr = [];

				for (i = 0; i < obj.length; i++) {
						arr[i] = obj[i];
				}

				return arr;
		};


		/**
		Generates an unique ID. This is 99.99% unique since it takes the current time and 5 random numbers.
		The only way a user would be able to get the same ID is if the two persons at the same exact milisecond manages
		to get 5 the same random numbers between 0-65535 it also uses a counter so each call will be guaranteed to be page unique.
		It's more probable for the earth to be hit with an ansteriod. Y

		@method guid
		@static
		@param {String} prefix to prepend (by default 'o' will be prepended).
		@method guid
		@return {String} Virtually unique id.
		*/
		var guid = (function() {
				var counter = 0;

				return function(prefix) {
						var guid = new Date().getTime().toString(32), i;

						for (i = 0; i < 5; i++) {
								guid += Math.floor(Math.random() * 65535).toString(32);
						}

						return (prefix || 'o_') + guid + (counter++).toString(32);
				};
		}());


		/**
		Trims white spaces around the string

		@method trim
		@static
		@param {String} str
		@return {String}
		*/
		var trim = function(str) {
				if (!str) {
						return str;
				}
				return String.prototype.trim ? String.prototype.trim.call(str) : str.toString().replace(/^\s*/, '').replace(/\s*$/, '');
		};


		/**
		Parses the specified size string into a byte value. For example 10kb becomes 10240.

		@method parseSizeStr
		@static
		@param {String/Number} size String to parse or number to just pass through.
		@return {Number} Size in bytes.
		*/
		var parseSizeStr = function(size) {
				if (typeof(size) !== 'string') {
						return size;
				}

				var muls = {
								t: 1099511627776,
								g: 1073741824,
								m: 1048576,
								k: 1024
						},
						mul;

				size = /^([0-9]+)([mgk]?)$/.exec(size.toLowerCase().replace(/[^0-9mkg]/g, ''));
				mul = size[2];
				size = +size[1];

				if (muls.hasOwnProperty(mul)) {
						size *= muls[mul];
				}
				return size;
		};


		return {
				guid: guid,
				typeOf: typeOf,
				extend: extend,
				each: each,
				isEmptyObj: isEmptyObj,
				inSeries: inSeries,
				inParallel: inParallel,
				inArray: inArray,
				arrayDiff: arrayDiff,
				arrayIntersect: arrayIntersect,
				toArray: toArray,
				trim: trim,
				parseSizeStr: parseSizeStr
		};
});

// Included from: src/javascript/core/I18n.js

/**
 * I18n.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define("moxie/core/I18n", [
		"moxie/core/utils/Basic"
], function(Basic) {
		var i18n = {};

		return {
				/**
				 * Extends the language pack object with new items.
				 *
				 * @param {Object} pack Language pack items to add.
				 * @return {Object} Extended language pack object.
				 */
				addI18n: function(pack) {
						return Basic.extend(i18n, pack);
				},

				/**
				 * Translates the specified string by checking for the english string in the language pack lookup.
				 *
				 * @param {String} str String to look for.
				 * @return {String} Translated string or the input string if it wasn't found.
				 */
				translate: function(str) {
						return i18n[str] || str;
				},

				/**
				 * Shortcut for translate function
				 *
				 * @param {String} str String to look for.
				 * @return {String} Translated string or the input string if it wasn't found.
				 */
				_: function(str) {
						return this.translate(str);
				},

				/**
				 * Pseudo sprintf implementation - simple way to replace tokens with specified values.
				 *
				 * @param {String} str String with tokens
				 * @return {String} String with replaced tokens
				 */
				sprintf: function(str) {
						var args = [].slice.call(arguments, 1);

						return str.replace(/%[a-z]/g, function() {
								var value = args.shift();
								return Basic.typeOf(value) !== 'undefined' ? value : '';
						});
				}
		};
});

// Included from: src/javascript/core/utils/Mime.js

/**
 * Mime.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define("moxie/core/utils/Mime", [
		"moxie/core/utils/Basic",
		"moxie/core/I18n"
], function(Basic, I18n) {

		var mimeData = "" +
				"application/msword,doc dot," +
				"application/pdf,pdf," +
				"application/pgp-signature,pgp," +
				"application/postscript,ps ai eps," +
				"application/rtf,rtf," +
				"application/vnd.ms-excel,xls xlb," +
				"application/vnd.ms-powerpoint,ppt pps pot," +
				"application/zip,zip," +
				"application/x-shockwave-flash,swf swfl," +
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document,docx," +
				"application/vnd.openxmlformats-officedocument.wordprocessingml.template,dotx," +
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,xlsx," +
				"application/vnd.openxmlformats-officedocument.presentationml.presentation,pptx," +
				"application/vnd.openxmlformats-officedocument.presentationml.template,potx," +
				"application/vnd.openxmlformats-officedocument.presentationml.slideshow,ppsx," +
				"application/x-javascript,js," +
				"application/json,json," +
				"audio/mpeg,mp3 mpga mpega mp2," +
				"audio/x-wav,wav," +
				"audio/x-m4a,m4a," +
				"audio/ogg,oga ogg," +
				"audio/aiff,aiff aif," +
				"audio/flac,flac," +
				"audio/aac,aac," +
				"audio/ac3,ac3," +
				"audio/x-ms-wma,wma," +
				"image/bmp,bmp," +
				"image/gif,gif," +
				"image/jpeg,jpg jpeg jpe," +
				"image/photoshop,psd," +
				"image/png,png," +
				"image/svg+xml,svg svgz," +
				"image/tiff,tiff tif," +
				"text/plain,asc txt text diff log," +
				"text/html,htm html xhtml," +
				"text/css,css," +
				"text/csv,csv," +
				"text/rtf,rtf," +
				"video/mpeg,mpeg mpg mpe m2v," +
				"video/quicktime,qt mov," +
				"video/mp4,mp4," +
				"video/x-m4v,m4v," +
				"video/x-flv,flv," +
				"video/x-ms-wmv,wmv," +
				"video/avi,avi," +
				"video/webm,webm," +
				"video/3gpp,3gpp 3gp," +
				"video/3gpp2,3g2," +
				"video/vnd.rn-realvideo,rv," +
				"video/ogg,ogv," +
				"video/x-matroska,mkv," +
				"application/vnd.oasis.opendocument.formula-template,otf," +
				"application/octet-stream,exe";


		var Mime = {

				mimes: {},

				extensions: {},

				// Parses the default mime types string into a mimes and extensions lookup maps
				addMimeType: function (mimeData) {
						var items = mimeData.split(/,/), i, ii, ext;

						for (i = 0; i < items.length; i += 2) {
								ext = items[i + 1].split(/ /);

								// extension to mime lookup
								for (ii = 0; ii < ext.length; ii++) {
										this.mimes[ext[ii]] = items[i];
								}
								// mime to extension lookup
								this.extensions[items[i]] = ext;
						}
				},


				extList2mimes: function (filters, addMissingExtensions) {
						var self = this, ext, i, ii, type, mimes = [];

						// convert extensions to mime types list
						for (i = 0; i < filters.length; i++) {
								ext = filters[i].extensions.split(/\s*,\s*/);

								for (ii = 0; ii < ext.length; ii++) {

										// if there's an asterisk in the list, then accept attribute is not required
										if (ext[ii] === '*') {
												return [];
										}

										type = self.mimes[ext[ii]];
										if (!type) {
												if (addMissingExtensions && /^\w+$/.test(ext[ii])) {
														mimes.push('.' + ext[ii]);
												} else {
														return []; // accept all
												}
										} else if (Basic.inArray(type, mimes) === -1) {
												mimes.push(type);
										}
								}
						}
						return mimes;
				},


				mimes2exts: function(mimes) {
						var self = this, exts = [];

						Basic.each(mimes, function(mime) {
								if (mime === '*') {
										exts = [];
										return false;
								}

								// check if this thing looks like mime type
								var m = mime.match(/^(\w+)\/(\*|\w+)$/);
								if (m) {
										if (m[2] === '*') {
												// wildcard mime type detected
												Basic.each(self.extensions, function(arr, mime) {
														if ((new RegExp('^' + m[1] + '/')).test(mime)) {
																[].push.apply(exts, self.extensions[mime]);
														}
												});
										} else if (self.extensions[mime]) {
												[].push.apply(exts, self.extensions[mime]);
										}
								}
						});
						return exts;
				},


				mimes2extList: function(mimes) {
						var accept = [], exts = [];

						if (Basic.typeOf(mimes) === 'string') {
								mimes = Basic.trim(mimes).split(/\s*,\s*/);
						}

						exts = this.mimes2exts(mimes);

						accept.push({
								title: I18n.translate('Files'),
								extensions: exts.length ? exts.join(',') : '*'
						});

						// save original mimes string
						accept.mimes = mimes;

						return accept;
				},


				getFileExtension: function(fileName) {
						var matches = fileName && fileName.match(/\.([^.]+)$/);
						if (matches) {
								return matches[1].toLowerCase();
						}
						return '';
				},

				getFileMime: function(fileName) {
						return this.mimes[this.getFileExtension(fileName)] || '';
				}
		};

		Mime.addMimeType(mimeData);

		return Mime;
});

// Included from: src/javascript/core/utils/Env.js

/**
 * Env.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define("moxie/core/utils/Env", [
		"moxie/core/utils/Basic"
], function(Basic) {

		// UAParser.js v0.6.2
		// Lightweight JavaScript-based ApplicationUser-Agent string parser
		// https://github.com/faisalman/ua-parser-js
		//
		// Copyright © 2012-2013 Faisalman <fyzlman@gmail.com>
		// Dual licensed under GPLv2 & MIT

		var UAParser = (function (undefined) {

		    //////////////
		    // Constants
		    /////////////


		    var EMPTY       = '',
		        UNKNOWN     = '?',
		        FUNC_TYPE   = 'function',
		        UNDEF_TYPE  = 'undefined',
		        OBJ_TYPE    = 'object',
		        MAJOR       = 'major',
		        MODEL       = 'model',
		        NAME        = 'name',
		        TYPE        = 'type',
		        VENDOR      = 'vendor',
		        VERSION     = 'version',
		        ARCHITECTURE= 'architecture',
		        CONSOLE     = 'console',
		        MOBILE      = 'mobile',
		        TABLET      = 'tablet';


		    ///////////
		    // Helper
		    //////////


		    var util = {
		        has : function (str1, str2) {
		            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
		        },
		        lowerize : function (str) {
		            return str.toLowerCase();
		        }
		    };


		    ///////////////
		    // Map helper
		    //////////////


		    var mapper = {

		        rgx : function () {

		            // loop through all regexes maps
		            for (var result, i = 0, j, k, p, q, matches, match, args = arguments; i < args.length; i += 2) {

		                var regex = args[i],       // even sequence (0,2,4,..)
		                    props = args[i + 1];   // odd sequence (1,3,5,..)

		                // construct object barebones
		                if (typeof(result) === UNDEF_TYPE) {
		                    result = {};
		                    for (p in props) {
		                        q = props[p];
		                        if (typeof(q) === OBJ_TYPE) {
		                            result[q[0]] = undefined;
		                        } else {
		                            result[q] = undefined;
		                        }
		                    }
		                }

		                // try matching uastring with regexes
		                for (j = k = 0; j < regex.length; j++) {
		                    matches = regex[j].exec(this.getUA());
		                    if (!!matches) {
		                        for (p = 0; p < props.length; p++) {
		                            match = matches[++k];
		                            q = props[p];
		                            // check if given property is actually array
		                            if (typeof(q) === OBJ_TYPE && q.length > 0) {
		                                if (q.length == 2) {
		                                    if (typeof(q[1]) == FUNC_TYPE) {
		                                        // assign modified match
		                                        result[q[0]] = q[1].call(this, match);
		                                    } else {
		                                        // assign given value, ignore regex match
		                                        result[q[0]] = q[1];
		                                    }
		                                } else if (q.length == 3) {
		                                    // check whether function or regex
		                                    if (typeof(q[1]) === FUNC_TYPE && !(q[1].exec && q[1].test)) {
		                                        // call function (usually string mapper)
		                                        result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
		                                    } else {
		                                        // sanitize match using given regex
		                                        result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
		                                    }
		                                } else if (q.length == 4) {
		                                        result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
		                                }
		                            } else {
		                                result[q] = match ? match : undefined;
		                            }
		                        }
		                        break;
		                    }
		                }

		                if(!!matches) break; // break the loop immediately if match found
		            }
		            return result;
		        },

		        str : function (str, map) {

		            for (var i in map) {
		                // check if array
		                if (typeof(map[i]) === OBJ_TYPE && map[i].length > 0) {
		                    for (var j = 0; j < map[i].length; j++) {
		                        if (util.has(map[i][j], str)) {
		                            return (i === UNKNOWN) ? undefined : i;
		                        }
		                    }
		                } else if (util.has(map[i], str)) {
		                    return (i === UNKNOWN) ? undefined : i;
		                }
		            }
		            return str;
		        }
		    };


		    ///////////////
		    // String map
		    //////////////


		    var maps = {

		        browser : {
		            oldsafari : {
		                major : {
		                    '1' : ['/8', '/1', '/3'],
		                    '2' : '/4',
		                    '?' : '/'
		                },
		                version : {
		                    '1.0'   : '/8',
		                    '1.2'   : '/1',
		                    '1.3'   : '/3',
		                    '2.0'   : '/412',
		                    '2.0.2' : '/416',
		                    '2.0.3' : '/417',
		                    '2.0.4' : '/419',
		                    '?'     : '/'
		                }
		            }
		        },

		        device : {
		            sprint : {
		                model : {
		                    'Evo Shift 4G' : '7373KT'
		                },
		                vendor : {
		                    'HTC'       : 'APA',
		                    'Sprint'    : 'Sprint'
		                }
		            }
		        },

		        os : {
		            windows : {
		                version : {
		                    'ME'        : '4.90',
		                    'NT 3.11'   : 'NT3.51',
		                    'NT 4.0'    : 'NT4.0',
		                    '2000'      : 'NT 5.0',
		                    'XP'        : ['NT 5.1', 'NT 5.2'],
		                    'Vista'     : 'NT 6.0',
		                    '7'         : 'NT 6.1',
		                    '8'         : 'NT 6.2',
		                    '8.1'       : 'NT 6.3',
		                    'RT'        : 'ARM'
		                }
		            }
		        }
		    };


		    //////////////
		    // Regex map
		    /////////////


		    var regexes = {

		        browser : [[

		            // Presto based
		            /(opera\smini)\/((\d+)?[\w\.-]+)/i,                                 // Opera Mini
		            /(opera\s[mobiletab]+).+version\/((\d+)?[\w\.-]+)/i,                // Opera Mobi/Tablet
		            /(opera).+version\/((\d+)?[\w\.]+)/i,                               // Opera > 9.80
		            /(opera)[\/\s]+((\d+)?[\w\.]+)/i                                    // Opera < 9.80

		            ], [NAME, VERSION, MAJOR], [

		            /\s(opr)\/((\d+)?[\w\.]+)/i                                         // Opera Webkit
		            ], [[NAME, 'Opera'], VERSION, MAJOR], [

		            // Mixed
		            /(kindle)\/((\d+)?[\w\.]+)/i,                                       // Kindle
		            /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?((\d+)?[\w\.]+)*/i,
		                                                                                // Lunascape/Maxthon/Netfront/Jasmine/Blazer

		            // Trident based
		            /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?((\d+)?[\w\.]*)/i,
		                                                                                // Avant/IEMobile/SlimBrowser/Baidu
		            /(?:ms|\()(ie)\s((\d+)?[\w\.]+)/i,                                  // Internet Explorer

		            // Webkit/KHTML based
		            /(rekonq)((?:\/)[\w\.]+)*/i,                                        // Rekonq
		            /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron)\/((\d+)?[\w\.-]+)/i
		                                                                                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron
		            ], [NAME, VERSION, MAJOR], [

		            /(trident).+rv[:\s]((\d+)?[\w\.]+).+like\sgecko/i                   // IE11
		            ], [[NAME, 'IE'], VERSION, MAJOR], [

		            /(yabrowser)\/((\d+)?[\w\.]+)/i                                     // Yandex
		            ], [[NAME, 'Yandex'], VERSION, MAJOR], [

		            /(comodo_dragon)\/((\d+)?[\w\.]+)/i                                 // Comodo Dragon
		            ], [[NAME, /_/g, ' '], VERSION, MAJOR], [

		            /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?((\d+)?[\w\.]+)/i
		                                                                                // Chrome/OmniWeb/Arora/Tizen/Nokia
		            ], [NAME, VERSION, MAJOR], [

		            /(dolfin)\/((\d+)?[\w\.]+)/i                                        // Dolphin
		            ], [[NAME, 'Dolphin'], VERSION, MAJOR], [

		            /((?:android.+)crmo|crios)\/((\d+)?[\w\.]+)/i                       // Chrome for Android/iOS
		            ], [[NAME, 'Chrome'], VERSION, MAJOR], [

		            /((?:android.+))version\/((\d+)?[\w\.]+)\smobile\ssafari/i          // Android Browser
		            ], [[NAME, 'Android Browser'], VERSION, MAJOR], [

		            /version\/((\d+)?[\w\.]+).+?mobile\/\w+\s(safari)/i                 // Mobile Safari
		            ], [VERSION, MAJOR, [NAME, 'Mobile Safari']], [

		            /version\/((\d+)?[\w\.]+).+?(mobile\s?safari|safari)/i              // Safari & Safari Mobile
		            ], [VERSION, MAJOR, NAME], [

		            /webkit.+?(mobile\s?safari|safari)((\/[\w\.]+))/i                   // Safari < 3.0
		            ], [NAME, [MAJOR, mapper.str, maps.browser.oldsafari.major], [VERSION, mapper.str, maps.browser.oldsafari.version]], [

		            /(konqueror)\/((\d+)?[\w\.]+)/i,                                    // Konqueror
		            /(webkit|khtml)\/((\d+)?[\w\.]+)/i
		            ], [NAME, VERSION, MAJOR], [

		            // Gecko based
		            /(navigator|netscape)\/((\d+)?[\w\.-]+)/i                           // Netscape
		            ], [[NAME, 'Netscape'], VERSION, MAJOR], [
		            /(swiftfox)/i,                                                      // Swiftfox
		            /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?((\d+)?[\w\.\+]+)/i,
		                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
		            /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/((\d+)?[\w\.-]+)/i,
		                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
		            /(mozilla)\/((\d+)?[\w\.]+).+rv\:.+gecko\/\d+/i,                    // Mozilla

		            // Other
		            /(uc\s?browser|polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|qqbrowser)[\/\s]?((\d+)?[\w\.]+)/i,
		                                                                                // UCBrowser/Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/QQBrowser
		            /(links)\s\(((\d+)?[\w\.]+)/i,                                      // Links
		            /(gobrowser)\/?((\d+)?[\w\.]+)*/i,                                  // GoBrowser
		            /(ice\s?browser)\/v?((\d+)?[\w\._]+)/i,                             // ICE Browser
		            /(mosaic)[\/\s]((\d+)?[\w\.]+)/i                                    // Mosaic
		            ], [NAME, VERSION, MAJOR]
		        ],

		        engine : [[

		            /(presto)\/([\w\.]+)/i,                                             // Presto
		            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,     // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
		            /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
		            /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
		            ], [NAME, VERSION], [

		            /rv\:([\w\.]+).*(gecko)/i                                           // Gecko
		            ], [VERSION, NAME]
		        ],

		        os : [[

		            // Windows based
		            /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
		            /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
		            ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
		            /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
		            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

		            // Mobile/Embedded OS
		            /\((bb)(10);/i                                                      // BlackBerry 10
		            ], [[NAME, 'BlackBerry'], VERSION], [
