//
/*
 * Path 页面URL处理器
 */
window._can_history_pushState = !!history.pushState;
(function() {

	//事件注册器
	var Path = {};
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

		if (_canRunEventAble(event_register, Path._current_location.pathname)) {
			cb.call({
				path: event_register.path,
				keys: event_register.keys.slice(),
				regex: event_register.regex,
				params: event_register.params
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
					regex: event_register.regex,
					params: event_register.params
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
				if (_aNode.href === location.href) {
					return;
				}
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
	//微信授权中转跳转
	Path.wxJump = function(url) {
		alert("info waiting", "努力跳转中……");
		_aNode.href = url;
		coAjax.post(appConfig.other.make_wx_short_url, {
			url: _aNode.href
		}, function(result) {
			var short_url = result.result;
			var wx_url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + wx_config.appId +
				"&redirect_uri=" + encodeURIComponent("http://api.dotnar.com/wx/authorize/notify_url") +
				"&response_type=code&scope=snsapi_userinfo&state=" + encodeURIComponent(short_url) +
				"#wechat_redirect";
			location.href = wx_url;
		});
	};
	Path.setQuery = function(key, value) {
		var _current_location = Path._current_location;
		var qs = _current_location.query;
		if (value) {
			qs.set(key, value)
		} else {
			delete qs.queryHash[key];
		}
		Path.jump(qs.toString(_current_location.pathname));
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
	Path.refreshCurrentLocation = function(href) {
		var _current_location = Path._current_location || (Path._current_location = {});
		if (_current_location.href === href) {
			return _current_location;
		}

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

		_current_location.pathname = pathname;
		_current_location.hash = hash;
		_current_location.search = search;
		_current_location.href = href;
		_current_location.query ? _current_location.query.init(search) : (_current_location.query = QueryString(search))

		return _current_location;
	};

	Path.jSouperRoute = function(options) {
		if (Path._current_location) {
			if (Path._current_location.href === options.href && options.emit_lock) {
				return;
			}
		}

		var _viewModules = Path.jSouper_VMS; //VM缓存区
		var base_HTML_url = options.html = options.html || "/app-pages/pages/"; //请求HTML的路径
		var base_js_url = options.js = options.js || "/app-pages/js"; //请求js文件的路径
		var base_prefix_url = options.prefix = options.prefix || ""; //URL HASH的前缀
		var tele_name = options.tel = options.tel || "main"; //VM置放的锚点
		var href = options.href = options.href;
		var current_vm = options.vm = options.vm || App;
		Path.options = options;

		var _current_location = Path.refreshCurrentLocation(href);

		var pathname = _current_location.pathname;

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
		var _current_page = Path._current_page = base_prefix_url + pagename;

		function _teleporter_vm() {
			current_vm.teleporter(rightVM, tele_name);
			App.set("Path.current_location", _current_location);
			App.set("Path.current_page", _current_page);
			options.stop_emit || Path.emit(pathname, Path._current_location);
		};
		var xmp_url = base_HTML_url + pagename + ".html";
		var rightVM = _viewModules[xmp_url];
		if (!rightVM) {
			require(["r_text!" + xmp_url], function(html) {
				_viewModules[xmp_url] = rightVM = jSouper.parse(html, xmp_url)(current_vm.getModel(), xmp_url);
				_teleporter_vm();
				require([base_js_url + pagename + ".js"]);
			});
		} else {
			_teleporter_vm();
		}
	};
	//路由启动器
	Path.onload = function(loc) {
		//一级路由
		Path.jSouperRoute({
			href: loc.href,
			html: "/app-pages/pages/",
			js: "/app-pages/js/",
			css: "/app-pages/css/",
			prefix: "/", //URL-pathname中无用的前缀部分，用来过滤href得出pagename
			tel: "main",
			default: "main",
			pagename_handler: function(pagename) { //二次处理pagename
				return jSouper.$.lst(pagename, ".") || pagename;
			},
			index: 0,
			vm: App
		});
	};
	//默认路由触发器
	Path.emitDefaultOnload = function() {
		Path.onload({
			origin: location.origin,
			pathname: location.pathname,
			href: location.href.replace(location.origin, ""),
		});
	};
	//注册路由
	Path.registerjSouperRoute = function(pathname, cb) {
		//Path.on被触发Path.emit，Path.jSouperRoute也会触发Path.emit，不加锁的话，可能造成死循环
		var _emit_lock_ = false;
		Path.on(pathname, function() {
			if (_emit_lock_) {
				return;
			}
			_emit_lock_ = true;
			var route_options = cb.apply(this, arguments);
			Path.jSouperRoute(route_options);
			_emit_lock_ = false;
		});
	};

	Path.refreshCurrentLocation(location.href);

	//Nunjucks <% import "js/lib/exports.js" as exports %>
	//Nunjucks <$ exports.browser("Path", "Path") $>
}());