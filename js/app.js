/*
 * 全局配置变量
 */
server_url = "http://localhost:6520/";

/*
 * url-query解析器
 */
(function() {
	function QueryString(url) {
		if (!(this instanceof QueryString)) {
			return new QueryString(url)
		}
		this.init(url);
	};
	QueryString.prototype = {
		init: function(url) {
			url || (url = location.search);
			var queryStr = url.substr(url.indexOf("?") + 1);
			this._init_queryStr(queryStr);
		},
		_init_queryStr: function(queryStr) {
			var queryList = queryStr.split("&");
			var queryHash = {};
			for (var i = 0, queryInfo, len = queryList.length; i < len; i += 1) {
				if (queryInfo = queryList[i]) {
					queryInfo = queryInfo.split("=");
					if (queryInfo[1]) {
						queryHash[queryInfo[0]] = decodeURIComponent(queryInfo[1]);
					}
				}
			}
			this.queryHash = queryHash;
		},
		get: function(key) {
			var queryHash = this.queryHash || {};
			return queryHash[key];
		},
		set: function(key, value) {
			var queryHash = this.queryHash || (this.queryHash = {});
			queryHash[key] = value;
		},
		toSting: function(origin) {
			origin || (origin = location.origin);
			var queryHash = this.queryHash || {};
			var queryStr = "";
			for (var key in queryHash) {
				if (queryHash.hasOwnProperty(key)) {
					queryStr += (key + "=" + encodeURIComponent(queryHash[key])) + "&";
				}
			}
			queryStr = queryStr.substr(0, queryStr.length - 1);
			queryStr = queryStr && ("?" + queryStr);
			var url = origin + queryStr;
			return url;
		}
	};
	window.QueryString = QueryString;
}());
/*
 * 事件管理器
 */
(function() {
	var _eventCache = {};
	var _eventMap = {};
	var eventManager = {
		is: function(check_obj, eventName, handle, rejectHandle) {
			if (check_obj) {
				handle();
			} else {
				eventManager.on(eventName, handle, rejectHandle);
			}
		},
		on: function(eventName, handle, rejectHandle) {
			var eventList = _eventCache[eventName] || (_eventCache[eventName] = []);
			var _id = Math.random().toString(36).substring(2);
			eventList.push(_eventMap[_id] = {
				_id: _id,
				handle: handle,
				rejectHandle: rejectHandle
			});
			return _id;
		},
		off: function(eventName, _id) {
			if (arguments.length === 1) {
				_id = eventName;
				var eventObj = _eventMap[_id];
				eventObj.handle = null;
			} else if (_eventCache.hasOwnProperty(eventName)) {
				var eventList = _eventCache[eventName];
				for (var i = 0, eventObj; eventObj = eventList[i]; i += 1) {
					if (eventObj._id == _id) {
						eventObj.handle = null;
						eventObj.rejectHandle = null;
					}
				}
			}
		},
		once: function(eventName, handle, rejectHandle) {
			var _id = eventManager.on.call(this, eventName, function() {
				eventManager.off(_id);
				handle.apply(this, arguments);
			}, rejectHandle);
		},
		fire: function(eventName) {
			var args = Array.prototype.slice.call(arguments, 1);
			if (_eventCache.hasOwnProperty(eventName)) {
				var eventList = _eventCache[eventName];
				for (var i = 0, eventObj; eventObj = eventList[i]; i += 1) {
					eventObj.handle && eventObj.handle.apply(eventObj, args);
				}
			}
		},
		reject: function(eventName) {
			if (_eventCache.hasOwnProperty(eventName)) {
				var eventList = _eventCache[eventName];
				var args = Array.prototype.slice.call(arguments);
				for (var i = 0, eventObj; eventObj = eventList[i]; i += 1) {
					eventObj.rejectHandle && eventObj.rejectHandle.apply(eventObj, args);
				}
			}
		},
		clear: function(eventName) {
			if (_eventCache.hasOwnProperty(eventName)) {
				var eventList = _eventCache[eventName];
				for (var i = 0, eventObj; eventObj = eventList[i]; i += 1) {
					_eventMap[eventObj._id] = null;
				}
				eventList.length = 0;
			}
		}
	};
	eventManager.emit = eventManager.fire;
	eventManager._eventCache = _eventCache;
	eventManager._eventMap = _eventMap;
	window.eventManager = eventManager;
}());
/*
 * 数据核心工具，用于处理数据
 */
(function() {

	/*
	 * 数据解析工具
	 */
	var dataFormat = function(success, error) {
		error || (error = function(errorMsg, errorCode, xhr) {
			console.error("coAjax Error:", "[" + errorCode + "]", errorMsg);
			my_alert("error", errorMsg);
		});
		return function(data, textStatus, jqXHR) {
			switch (data.type) {
				case "json":
					try {
						var result = $.parseJSON(data.toString);
					} catch (e) {
						data.error = e;
						error.call(this, "JSON Parse Error" /*解析错误*/ , jqXHR);
						return;
					}
					data.result = result;
					success.apply(this, arguments);
					break;
				case "html":
					data.result = jQuery(data.toString);
					success.apply(this, arguments);
					break;
				case "template":
					data.result = jSouper.parse(data.toString);
					success.apply(this, arguments);
					break;
				case "error":
					// data.error = result;
					result = $.parseJSON(data.toString);
					error.call(this, result.errorMsg, result.errorCode, jqXHR, data)
					break;
				default: //JSON without error
					try {
						result = $.parseJSON(data.toString);
					} catch (e) {}
					data.result = result;
					success.apply(this, arguments);
					break;
			}
		};
	};

	/*
	 * 基于jQ的跨域ajax工具函数
	 */
	//进度条的注入
	//is onprogress supported by browser?
	var hasOnProgress = ("onprogress" in $.ajaxSettings.xhr());

	//If not supported, do nothing
	if (hasOnProgress) {
		//patch ajax settings to call a progress callback
		$.ajaxSettings.xhr_bak = $.ajaxSettings.xhr;
		$.ajaxSettings.xhr = function() {
			var xhr = $.ajaxSettings.xhr_bak();
			if (this.progress) {
				if (xhr instanceof window.XMLHttpRequest) {
					xhr.addEventListener('progress', this.progress, false);
				}

				if (xhr.upload) {
					xhr.upload.addEventListener('progress', this.progress, false);
				}
			}
			return xhr;
		};
	}

	var ajax = {
		_addCookiesInUrl: function(url) {
			// if(url.indexOf("?")==-1){
			// 	url+="?"
			// }else{
			// 	url+="&"
			// }
			// url += "cors_cookie="+encodeURI(document.cookie);
			return url;
		},
		_ajax: function(url, type, data, success, error, net_error) {
			var jqxhr = $.ajax({
				url: url,
				type: type,
				data: data,
				success: dataFormat(success, error),
				error: net_error,
				progress: function(event) {
					jqxhr.emit("progress", event);
					if (event.loaded == event.total) {
						//释放内存
						eventManager.clear("progress" + _event_prefix);
					}
				},
				xhrFields: {
					withCredentials: true
				}
			});
			var _event_prefix = Math.random();
			//事件机制，目前支持progress
			jqxhr.on = function(eventName) {
				eventName += _event_prefix;
				arguments[0] = eventName;
				return eventManager.on.apply(eventManager, arguments);
			};
			jqxhr.emit = function(eventName) {
				eventName += _event_prefix;
				arguments[0] = eventName;
				return eventManager.fire.apply(eventManager, arguments);
			};
			return jqxhr;
		},
		get: function(url, data, success, error, net_error) {
			url = ajax._addCookiesInUrl(url);
			if (data instanceof Function) {
				net_error = error;
				error = success;
				success = data;
				data = {};
			};
			return ajax._ajax(url, "get", data, success, error, net_error);
		},
		post: function(url, data, success, error, net_error) {
			url = ajax._addCookiesInUrl(url);
			if (data instanceof Function) {
				net_error = error;
				error = success;
				success = data;
				data = {};
			};
			return ajax._ajax(url, "post", data, success, error, net_error);
		},
		put: function(url, data, success, error, net_error) {
			if (data instanceof Function) {
				net_error = error;
				error = success;
				success = data;
				data = {};
			};
			url = ajax._addCookiesInUrl(url);
			return ajax._ajax(url, "put", data, success, error, net_error);
		},
		"delete": function(url, data, success, error, net_error) {
			url = ajax._addCookiesInUrl(url);
			if (data instanceof Function) {
				net_error = error;
				error = success;
				success = data;
				data = {};
			};
			return ajax._ajax(url, "delete", data, success, error, net_error);
		}
	};
	window.coAjax = ajax;

	/*
	 * 基于SockJS的web-sock通讯
	 */
	var conns = {};
	window.serverNotify = function _init_sock(type, event_cache, _is_cover) {
		type || (type = "user"); //默认是user类型
		if (conns[type] && !_is_cover) { //同类型只能有一个sock连接
			return conns[type];
		}
		event_cache || (event_cache = {});
		var exports = {
			_send_queue: function() {
				for (var i = 0, data; data = _send_queue[i]; i += 1) {
					sock.send(JSON.stringify(data));
				}
				_send_queue = [];
			},
			send: function(type, value) {
				// if (arguments.length == 1) {
				// 	value = type;
				// }
				var data = {
					type: type,
					value: value
				};
				_send_queue.push(data);
				if (_is_opened) {
					this._send_queue();
				}
			},
			on: function(eventName, fun) {
				var event_col = event_cache[eventName] || (event_cache[eventName] = []);
				event_col.push(fun);
			},
			off: function(eventName) {
				event_cache[eventName] = [];
			},
			emit: function(eventName, value) {
				var event_col = event_cache[eventName];
				if (event_col) {
					event_col.forEach(function(fun) {
						fun(value);
					});
				}
			}
		};
		var sock = new SockJS(appConfig.socketNotify);
		var _is_opened = false;
		var _send_queue = [];
		sock.onopen = function() {
			console.log('+Sock 连接已经打开');
			_is_opened = true;
			exports._send_queue();
			//获取连接密匙
			console.log("Sock 获取协议密匙");
			coAjax.post(appConfig.socketNotify_key, {
				type: type
			}, function(result) {
				console.log("Sock 密匙获取成功，申请通讯权限");
				var s_key = result.result.s_key;
				exports.send("init", {
					s_key: s_key
				});
				exports.on("init-success", function() {
					console.log("Sock 申请通讯权限申请成功");
				});
				exports.on("init-error", function(errorMsg) {
					console.error(errorMsg);
				});
			});
		};
		var data_handle = dataFormat(function(result) {
			exports.emit(result.type, result.result);
		}, function(errorCode, xhr, errorMsg, result) {
			exports.emit(result.type + "-error", result.toString);
		});
		sock.onmessage = function(e) {
			console.log('message', e.data);
			try {
				var data = JSON.parse(e.data);
				data_handle(data);
			} catch (e) {
				console.error(e);
				exports.emit("error", e.data);
			}
		};
		sock.onclose = function() {
			// console.log('close');
			console.log('-Sock 连接已经断开');
			exports.off("init-success");
			exports.off("init-error");
			setTimeout(function() {
				_init_sock(type, event_cache, true);
			}, 500); //半秒后进行重连
		};
		return (conns[type] = exports);
	}
}());
/*
 * 系统对话框的二次封装
 */
(function() {
	var _confirm = window.confirm;
	window.native_confirm = _confirm;
	window.confirm = window.my_confirm = function(str, true_cb, false_cb) {
		var res = _confirm(str);
		if (res) {
			true_cb && true_cb();
		} else {
			false_cb && false_cb();
		}
		return res;
	}
	window.native_alert = window.alert;
	var notify_color_map = {
		white: "#ffffff",
		ashen: "#d9d6c3",
		silver: "#a1a3a6",
		gray: "#555555",
		black: "#21242b",
		red: "#e51400",
		crimson: "#a20025",
		green: "#60a917",
		blue: "#00aff0",
		yellow: "#e3c800",
		yellowish: "#dec674",
		gold: "#fffcb0",
		orange: "#fa6800",
		apricot: "#fab27b",
		brownness: "#843900",
		colormoment: "#f7acbc",
		cherry: "#feeeed",
		roseous: "#f05b72",
		redplum: "#f69c9f",
		lime: "#a4c400",
		whitegreen: "#cde6c7",
		inst: "#90d7ec",
		cyan: "#1ba1e2",
		emerald: "#008a00",
		teal: "#00aba9",
		cobalt: "#0050ef",
		indigo: "#6a00ff",
		violet: "#aa00ff",
		pink: "#dc4fad",
		magenta: "#d80073",
		amber: "#f0a30a",
		brown: "#825a2c",
		olive: "#6d8764",
		steel: "#647687",
		mauve: "#76608a",
		taupe: "#87794e",
		dark: "#333333",
		darker: "#222222",
		darkBrown: "#63362f",
		darkCrimson: "#640024",
		darkMagenta: "#81003c",
		darkIndigo: "#4b0096",
		darkCyan: "#1b6eae",
		darkCobalt: "#00356a",
		darkTeal: "#004050",
		darkEmerald: "#003e00",
		darkGreen: "#128023",
		darkOrange: "#bf5a15",
		darkRed: "#9a1616",
		darkPink: "#9a165a",
		darkViolet: "#57169a",
		darkBlue: "#16499a",
		lightBlue: "#4390df",
		lightRed: "#ff2d19",
		lightGreen: "#7ad61d",
		lighterBlue: "#00ccff",
		lightTeal: "#45fffd",
		lightOlive: "#78aa1c",
		lightOrange: "#c29008",
		lightPink: "#f472d0",
		grayDark: "#333333",
		grayDarker: "#222222",
		grayLight: "#999999",
		grayLighter: "#eeeeee",
		ink: "#464547",
		error: "#a20025",
		warn: "#fa6800",
		success: "#60a917",
		info: "#1ba1e2",
		lightWhite: "#f6f5ec"
	};
	window.alert = window.my_alert = function(type, alert_str) {
		var args = arguments;
		var result;
		if (args.length === 1) {
			alert_str = type;
			if (typeof alert_str === "string") {
				result = $.Notify.show(alert_str);
			} else {
				result = $.Notify(alert_str);
			}
		} else if (args.length >= 2) {
			var time = (args[2] === undefined) ? 3000 : args[2];
			var class_color = notify_color_map[type];
			result = $.Notify({
				style: {
					background: class_color,
					color: "white"
				},
				content: alert_str,
				timeout: time
			});
		}
		return result;
	};
	var $pageLoader = $("#pageLoader");
	window.openPageLoading = function() {
		$pageLoader.removeClass("hidden");
	};

	window.closePageLoading = function() {
		$pageLoader.addClass("hidden");
	}
}());
/*
 * jSouper Handle
 */
(function() {
	jSouper.registerHandle("#Time", function(time, format) {
		time = (+time == time) ? +time : time;
		var date = moment(time);
		if (format) {
			return date.format(format);
		}
		return date.fromNow() + date.format(" LT");
	});
	jSouper.registerHandle("#Time_MH", function(time) {
		var date = moment("2001-1-1 " + time);
		return date.format("H:mm");
	});
	jSouper.registerHandle("#Fixed", function(value, fixnum) {
		fixnum = ~~fixnum || 2;
		value = parseFloat(value) || 0;
		value = Math.pow(10, fixnum) * value;
		value = Math.round(value);
		value = value / Math.pow(10, fixnum);
		return value.toFixed(fixnum);
	});

	jSouper.registerHandle("#Int", function(value) {
		return parseInt(value) || 0;
	});

	var TITLE_MAP = {};

	function _change_document_title(title_config) {
		if (title_config.pagename === Path._current_page) { //匹配成功
			document.title = title_config.title;
		}
	}
	jSouper.registerHandle("setTitle", function(title) {
		var id = this._id;
		var title_config;

		if (!(title_config = TITLE_MAP[id]) && !TITLE_MAP.hasOwnProperty(id)) {
			title_config = (TITLE_MAP[id] = {
				pagename: Path._current_page,
				title: title
			});
			//注册事件
			Path.on("*", function() {
				_change_document_title(title_config);
			});
		}
		//不在事件范围内发生改变，手动改变
		if (title !== title_config.title) {
			title_config.title = title;
			_change_document_title(title_config);
		}
		return "";
	});

	var USE_CSS_MAP = {};
	var require_cache = {
		"": "" //包括了空link的情况，使用缓存机制替代了
	};
	var styleNode = "use_css_style_node";

	function req_css(link, cb) {
		debugger
		if (require_cache.hasOwnProperty(link)) {
			var css_text = require_cache[link];
			//如果是从缓存里面直接加载过来的，加载插件是不会再次执行addSheet，所以需要手动执行
			addSheet(css_text, styleNode);
			cb(css_text);
		} else {
			require(["r_css!" + link + ">STYLE_ID:" + styleNode], function(css_text) {
				require_cache[link] = css_text;
				cb(css_text);
			}, function() {
				cb("");
			});
		}
	};

	function _load_css_link(use_css_config) {
		if (use_css_config.pagename === Path._current_page) { //匹配成功
			if (!use_css_config.load) { //未下载，直接下载使用并缓存
				use_css_config.load = true; //锁定
				use_css_config.using = true; //锁定
				use_css_config.loading = true;
				// debugger
				openPageLoading();

				(function start_load_css() {
					var current_css_link = use_css_config.css_link;
					req_css(current_css_link, function(css_text) {
						//css_link发生改变了，重新发起请求，并删除已经加进来的css_text
						if (use_css_config.abort && current_css_link !== use_css_config.css_link) {
							use_css_config.abort = false;
							removeSheet(css_text, styleNode);
							start_load_css();
							return;
						}
						closePageLoading();
						use_css_config.css_text = css_text;
						use_css_config.loading = false;
					});
				}());
			} else if (!use_css_config.using) { //已经下载，直接使用
				// debugger
				addSheet(use_css_config.css_text, styleNode)
				use_css_config.using = true;
			}
		} else { //不匹配
			if (use_css_config.using) { //如果使用中，进行删除
				// debugger
				removeSheet(use_css_config.css_text, styleNode);
				use_css_config.using = false;
			}
		}
	}
	jSouper.registerHandle("useCss", function(css_link) {
		var id = this._id;
		var use_css_config;
		css_link = css_link ? Path.getPathname(css_link) : "";
		//初始化
		if (!(use_css_config = USE_CSS_MAP[id]) && !USE_CSS_MAP.hasOwnProperty(id)) {
			use_css_config = (USE_CSS_MAP[id] = {
				pagename: Path._current_page,
				css_link: css_link
			});
			Path.on("*", function() {
				_load_css_link(use_css_config);
			});
		}
		if (css_link !== use_css_config.css_link) {
			use_css_config.css_link = css_link;
			if (use_css_config.load) {
				if (use_css_config.loading) { //如果在加载中，请求抛弃这次加载，这会让其再次请求新的css_link
					use_css_config.abort = true;
				} else if (use_css_config.using) { //如果使用中，直接替换CSS文件

					//删除CSS文件
					removeSheet(use_css_config.css_text, styleNode);
					use_css_config.using = false;

					//没有缓存的话，重新请求
					if (!require_cache.hasOwnProperty(css_link)) {
						use_css_config.load = false;
					} else {
						use_css_config.load = true;
						use_css_config.css_text = require_cache[css_link];
					}
					use_css_config.loading = false;

					//重新载入CSS文件
					_load_css_link(use_css_config);
				} else if (use_css_config.load) { //如果没使用状态，但是已经有css_text缓存，删除缓存，等要使用的时候在动态加载
					use_css_config.load = false;
					use_css_config.css_text = "";
				}
			}
		}
		return "";
	});

}());
/*
 * Path 页面URL处理器
 */
_can_history_pushState = !!history.pushState;
(function() {

	//事件注册器
	var Path = window.Path = {};
	var _events = Path._events = [];
	var _eventsMap = _events.__map__ = {};
	var _event_prefix = Math.random().toString();
	var _aNode = document.createElement("a");

	function _canRunEventAble(event_register, pagename) {
		var match_result = event_register.regex.exec(pagename);
		if (!match_result) {
			return false
		}
		var params = event_register.params = [];
		for (var i = 1, len = match_result.length; i < len; i += 1) {
			var val = match_result[i];
			val = ("string" == typeof val) ? decodeURIComponent(val) : val;

			var key = event_register.keys[i - 1];
			if (key) {
				params[key.name] = val;
			}
			params.push(val);
		}

		return true;
	};

	function _removeCbFromEvents(event_register, cb) {
		jSouper.$.rm(event_register.fns, cb);
		if (!event_register.fns.length) {
			delete _eventsMap[event_register.path];
			jSouper.$.rm(_events, event_register);
		}
	};
	Path.getPathname = function(pathname) {
		_aNode.href = pathname;
		pathname = _aNode.pathname;
		if (pathname.indexOf("/") !== 0) { //Fuck IE
			pathname = "/" + pathname;
		}
		return pathname;
	};
	Path.on = function(pagename, cb) {
		if (pagename instanceof Array) pagename = '(' + pagename.join('|') + ')';

		var event_register = _eventsMap.hasOwnProperty(pagename) && _eventsMap[pagename];
		if (!event_register) {
			event_register = _eventsMap[pagename] = {
				path: pagename,
				keys: [],
				fns: [],
				regex: null
			};
			event_register.regex = Path.pathToRegexp(pagename, event_register.keys, false, false);
			_events.push(event_register);

		}

		event_register.fns.push(cb);

		if (_canRunEventAble(event_register, Path._current_page)) {
			cb.call({
				path: event_register.path,
				keys: event_register.keys.slice(),
				regex: event_register.regex
			}, Path._current_location)
		}

		return event_register;
	};
	Path.once = function(pagename, cb) {
		function one_wrap_cb() {
			var result = cb(this, arguments);
			_removeCbFromEvents(event_register, cb);
			return result;
		}
		var event_register = Path.on(pagename, cb);

		return event_register;
	};
	Path.emit = function(pagename) {
		jSouper.forEach(_events, function(event_register) {
			if (_canRunEventAble(event_register, pagename)) {
				var context = {
					path: event_register.path,
					keys: event_register.keys.slice(),
					regex: event_register.regex
				};
				jSouper.forEach(event_register.fns, function(cb) {

					cb.call(context, Path._current_location)
				});
			}
		});
	};
	//通用跳转器
	if (_can_history_pushState) {
		Path.jump = function(href) {
			_aNode.href = href;
			if (_aNode.origin === location.origin) {
				history.pushState(null, "跳转中……", _aNode.href.replace(_aNode.origin, ""));
				Path.emitDefaultOnload();
			} else {
				location.href = href;
			}
		};
	} else {
		Path.jump = function(href) {
			location.href = href;
		}
	}
	Path.setQuery = function(key, value) {
		var _current_location = Path._current_location;
		var qs = _current_location.query;
		if (value) {
			qs.set(key, value)
		} else {
			delete qs.queryHash[key];
		}
		Path.jump(qs.toSting(_current_location.pathname));
	};
	Path.getQuery = function(key) {
		return Path._current_location.query.get(key);
	};
	//字符串匹配模式转化成正则表达式
	Path.pathToRegexp = function(path, keys, sensitive, strict) {
		if (path instanceof RegExp) return path;
		if (path instanceof Array) path = '(' + path.join('|') + ')';
		if (!(keys instanceof Array)) {
			strict = sensitive;
			sensitive = keys;
			keys = [];
		}
		path = path
			.concat(strict ? '' : '/?')
			.replace(/\/\(/g, '(?:/')
			.replace(/\+/g, '__plus__')
			.replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional) {
				keys.push({
					name: key,
					optional: !!optional
				});
				slash = slash || '';
				return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
			})
			.replace(/([\/.])/g, '\\$1')
			.replace(/__plus__/g, '(.+)')
			.replace(/\*/g, '(.*)');
		return new RegExp('^' + path + '$', sensitive ? '' : 'i');
	};
	//通用路由模块，与jSouper进行耦合
	Path.jSouper_VMS = {};
	Path.jSouperRoute = function(options) {
		var _viewModules = Path.jSouper_VMS; //VM缓存区
		var base_HTML_url = options.html = options.html || "/app-pages/"; //请求HTML的路径
		var base_js_url = options.js = options.js || "/js/app-pages/"; //请求js文件的路径
		var base_prefix_url = options.prefix = options.prefix || ""; //URL HASH的前缀
		var tele_name = options.tel = options.tel || "main"; //VM置放的锚点
		var href = options.href = options.href;
		var current_vm = options.vm = options.vm || App;
		Path.options = options;

		var pathname = href;
		var hash_index = pathname.indexOf("#");
		var hash = "";
		if (hash_index !== -1) {
			hash = pathname.substr(hash_index);
			pathname = pathname.substr(0, hash_index);
		}
		var search_index = pathname.indexOf("?");
		var search = "";
		if (search_index !== -1) {
			search = pathname.substr(search_index);
			pathname = pathname.substr(0, search_index);
		}

		if (base_prefix_url.substr(-1) !== "/") { //end with "/"
			console.warn("jSouperRoute prefix 必须以'/'结尾");
			base_prefix_url += "/";
		}
		var pagename_reg = new RegExp("^" + base_prefix_url.substr(0, base_prefix_url.length - 1) + "(/)?");

		var pagename = jSouper.$.stf(pathname.replace(pagename_reg, ""), "/") || options.default || "index"; //二级页面名
		if (options.pagename_handler instanceof Function) {
			pagename = options.pagename_handler(pagename);
		}

		//current_location
		Path._current_page = base_prefix_url + pagename;
		var _current_location = Path._current_location || (Path._current_location = {
			pagename: []
		});
		_current_location.pathname = pathname;
		_current_location.hash = hash;
		_current_location.search = search;
		_current_location.href = href;
		_current_location.query ? _current_location.query.init(search) : (_current_location.query = QueryString(search))

		function _teleporter_vm() {
			current_vm.teleporter(rightVM, tele_name);
			App.set("$Cache.current_location", _current_location);
		};
		var xmp_url = base_HTML_url + pagename + ".html";
		var rightVM = _viewModules[xmp_url];
		if (!rightVM) {
			require(["r_text!" + xmp_url], function(html) {
				_viewModules[xmp_url] = rightVM = jSouper.parse(html, xmp_url)(current_vm.getModel());
				_teleporter_vm();
				require([base_js_url + pagename + ".js"]);
			});
		} else {
			_teleporter_vm();
			Path.emit(Path._current_page, Path._current_location);
		}
	};
	//路由启动器
	Path.onload = function(loc) {
		//一级路由
		Path.jSouperRoute({
			href: loc.href,
			html: "/app-pages/",
			js: "/js/app-pages/",
			prefix: "/", //URL-pathname中无用的前缀部分，用来过滤href得出pagename
			tel: "main",
			default: "main",
			pagename_handler: function(pagename) { //二次处理pagename
				return jSouper.$.lst(pagename, ".") || pagename;
			},
			vm: App
		});
		Path.emit("__change__", Path._current_location);
	};
	//默认路由触发器
	Path.emitDefaultOnload = function() {
		Path.onload({
			origin: location.origin,
			pathname: location.pathname,
			href: location.href.replace(location.origin, ""),
		});
	};
	define("Path", Path);
}());
/*
 * 加载核心依赖
 * 应用程序启动
 */
$('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', 'template/xmp.css'));
$.when(
	$.get("template/xmp.html"),
	$.getScript("template/xmp.js")
).done(function(xmp_html_xhr) {
	jSouper.parse(xmp_html_xhr[0]);
	jSouper.ready(function() {
		//初始化应用程序
		jSouper.app({
			Id: "jSouperApp",
			Data: {
				bus_info: busInfo,
				config: appConfig
			}
		});
		var $app = $("#jSouperApp");
		$app.removeClass("hidden") //显示App
		if (_can_history_pushState) {
			window.addEventListener("popstate", Path.emitDefaultOnload);
		}
		$app = null;
		Path.emitDefaultOnload();
		// App.set("$Cache.zzzz","css/test.css");
	});
}).fail(function(argument) {
	console.error(arguments);
});