//
(function() { 
	//Nunjucks <% import "js/lib/exports.js" as exports %>
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
				case "string":
					data.result = data.toString;
					success.apply(this, arguments);
					break;
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

	//Nunjucks <$ exports.browser("dataFormat", "dataFormat") $>

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
	var coAjax = ajax;

	//Nunjucks <$ exports.browser("coAjax", "coAjax") $>

	/*
	 * 基于SockJS的web-sock通讯
	 */
	var conns = {};
	var serverNotify = function _init_sock(type, event_cache, _is_cover) {
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
	};

	
	//Nunjucks <$ exports.browser("serverNotify", "serverNotify") $>
}());