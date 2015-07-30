jSouper.ready(function() {
	// body...
	//检查是否有历史记录用的索引，和History.length不同，这个属性只检查dotnar站点
	App.set("$Cache.page_index", -1);
	Path.on("*", function() {
		App.set("$Cache.page_index", App.get("$Cache.page_index") + 1);
		if (!(location.hash.indexOf("#default/sign_in") == 0)) {
			LS.set("$Cache.cb_url_href", location.href);
			App.set("$Cache.cb_url_href", location.href);
			document.body.scrollTop = 0;
		}
	});

	function _check_collect_bus(collectBus) {
		var is_collect = true;
		if (jSouper.indexOf(collectBus, appConfig.bus_id) === -1) {
			is_collect = false;
		}
		App.set("$Cache.is_collect_current_bus", is_collect)
	};
	eventManager.on("getLoginer", function() {
		//校验是否已经收藏过此商家
		var collectBus = App.get("loginer.collectBus") || [];
		_check_collect_bus(collectBus);
	});

	;
	(window.coAjaxLoginUser = function(succ_cb) {
		// alert("获取登陆者信息……"+location.pathname)

		//获取登陆用户的信息
		/*
		 * 管理员相关的页面无需登录
		 */
		var no_user_login_pages = {
			"/admin-beta.html": 1,
			"/admin-login.html": 1
		}
		if (no_user_login_pages[location.pathname]) {
			return;
		}
		// alert("开始获取"+appConfig.user.loginer)
		console.log("获取登陆者信息……", location.pathname);
		/*
		 * 获取登录者信息
		 */
		function _login_sucess(data) {
			// alert("success","用户登录成功");
			console.log("登录者信息：", data.result);
			userInfo = data.result;
			App.set("loginer", userInfo);
			//触发相关事件
			eventManager.fire("getLoginer");
			succ_cb && succ_cb();
		};

		function _login_err(errorCode) {
			// alert("用户未登录");
			var muse_login_pages = {
				"#default/sign_in": 1,
				"#default/cart": 1
			};
			//未登录，不可进入个人页，强制跳转到登录页
			if (muse_login_pages[location.pathname]) {
				Path.jump("/sign_in.html");
			}
		};

		function _cookie_login() {
			coAjax.get(appConfig.user.loginer, {
				_: Math.random()
			}, _login_sucess, _login_err);
		};

		window._wx_openid_login = function _wx_openid_login(openid) {
			//自动登录
			coAjax.get(appConfig.user.loginer, {
				openid: openid
			}, function() {
				alert("success", "微信授权账号自动登录成功");
				_login_sucess.apply(this, arguments);
			}, function(errorCode, xhr, errorMsg) {
				//使用OPENID登录失败，尝试使用Cookie的登录方式登录
				if (errorMsg == "refresh_token time out") {
					alert("微信授权已经过期，请重新登录");
				} else {
					alert("error", errorMsg)
					_cookie_login();
				}
			});
		};

		if (_isWX) {
			globalGet("WEIXIN_OPENID", function(openid) {
				// alert("openid:"+openid)
				if (openid) {
					_wx_openid_login(openid);
				} else {
					_cookie_login();
				}
			});
		} else {
			_cookie_login();
		}
	})();


	App.set("$Event.user_collect_bus", function() {
		if (!App.get("loginer")) {
			alert("warn", "收藏店铺前，请您先登陆！！！");
			return;
		};
		if (App.get("$Cache.is_collect_current_bus")) {
			coAjax["delete"](appConfig.user.collectBus_remove, {
				bus_id: appConfig.bus_id
			}, function(result) {
				alert("已取消店铺收藏");
				// App.set('$Cache.is_collect_current_bus',false);
				_check_collect_bus(result.result);
			}, function(errorCode, xhr, errorMsg) {
				// alert("error",errorMsg)
				_check_collect_bus(App.get("loginer.collectBus"));
			});
		} else {
			coAjax.post(appConfig.user.collectBus_add, {
				bus_id: appConfig.bus_id
			}, function(result) {
				alert("success", "店铺收藏成功");
				// App.set('$Cache.is_collect_current_bus',true);
				_check_collect_bus(result.result);
			}, function(errorCode, xhr, errorMsg) {
				// alert("error",errorMsg)
				_check_collect_bus(App.get("loginer.collectBus"));
			});
		}
	});
});