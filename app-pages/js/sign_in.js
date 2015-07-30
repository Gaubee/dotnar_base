/* global _isWX */
require(["Cookies"], function(Cookies) {
	App.set("$Cache.sign_in.name", Cookies.get("cache_user_login_name"));
	App.set("$Cache.admin.name", Cookies.get("cache_bus_login_name"));
	if (App.get('loginer')) {
		Path.jump("http://my.dotnar.com");
	};
	var queryString;
	Path.on('/__basename__.html', function(_current_location) {
		queryString = _current_location.query;
	});
	var countsign = 0;
	App.set('$Event.changeTosignup', function() {
		if (countsign % 2 == 0) {
			App.set('signPrivate', 'focus');
		} else {
			App.set('signPrivate', '');
		};
		countsign += 1;
	});
	App.set('$Event.changeLoginType', function() {
		App.model.toggle('loginType');
	});
	var timer;
	App.set('$Event.getcheckcode', function() {
		clearInterval(timer);
		var getcodetime = 60;
		App.set('remaining', getcodetime);
		App.set('getcode', true);
		timer = setInterval(function() {
			if (getcodetime > 0) {
				getcodetime -= 1;
				App.set('remaining', getcodetime);
			} else {
				clearInterval(timer);
				App.set('getcode', '');
			}
		}, 1000);
	});


	/*
	 *登录
	 */
	//获取一个验证码
	function _loadCodeImg() {
		// $code.val("");
		// $signInImg.prop("src",appConfig.user.sign_in_img_code_url+"?_="+Math.random());
	};
	// _loadCodeImg();
	// 一键购买标识
	var _gid = queryString.get("gid");
	if (_gid) {
		alert("warn", "您未登陆，请登陆后继续购买")
	};
	//用户登录
	App.set("$Event.sign_in.login", function() {
		var login_data = App.get("$Cache.sign_in");
		coAjax.post(appConfig.user.sign_in_url, login_data, function success(result) {
			alert("success", "登录成功");
			App.set("loginer", result.result);
			Cookies.set("cache_user_login_name", login_data.name);
			var callbackUrl = queryString.get("cb_url");
			if (_gid) {
				alert("正在将你刚才要买的商品加入订单中")
				require(["/js/common/goodsCart.js"], function(goodsCart) {
					goodsCart.add_to_cart(_gid, 1, function() {
						Path.jump("/cart.html");
					}, function() {
						Path.jump("/main.html");
					})
				});
				return;
			}

			Path.jump(callbackUrl || "/main.html");
			eventManager.fire("getLoginer");
		}, function error(errorMsg, errorCode, xhr) {
			console.log(errorMsg);
			switch (errorCode) {
				case "0001":
					alert("error", "密码输入错误");
					break;
				case "00033":
					alert("error", "“ " + login_data.name + " ”这个登录账号还没有注册，请检查您的用户名，或者先进行注册。");
					break;
				case "00034":
					alert("error", "您还未输入登录用的用户名");
					break;
				case "00035":
					alert("error", "您还未输入登录密码");
					break;
				case "00037":
					alert("error", "您还未输入验证码");
					return;
					break;
				case "00038":
					alert("error", "您输入验证码有些慢，为了您的安全，请重新输入");
					break;
				case "00039":
					alert("error", "输入的验证码错误");
					break;
				default:
					alert("error", errorMsg);
			}
			_loadCodeImg();
		});
	});


	/*
	 * 注册
	 */
	App.set("$Event.sign_up.register", function() {
		var register_data = App.get("$Cache.sign_up");
		register_data.confirm_password = register_data.password;
		coAjax.post(appConfig.user.sign_up_url, register_data, function(result) {
			alert("success", "注册成功");
			App.set("$Cache.sign_in.name", register_data.mobile_phone);
			//清空表单
			App.set("$Cache.sign_up", {});
			//切换到登录
			App.set('signPrivate', '');
		});
	});

	App.set("$Event.sign_up.get_register_code", function() {
		coAjax.get(appConfig.server_url + "user/registerCode", {
			mobile_phone: App.get("$Cache.sign_up.mobile_phone")
		}, function(result) {
			alert(result.result);
		}, function(errorCode, xhr, errorMsg) {
			alert("error", errorMsg);
			App.set('getcode', '');
		});
	});

	// 卖家登陆
	App.set("$Event.admin.login", function(argument) {
		var username = App.get("$Cache.admin.name");
		var password = App.get("$Cache.admin.password");
		coAjax.post(appConfig.bus.login, {
			name: username,
			password: password
		}, function() {
			alert("success", "商家登录成功");
			// var callbackUrl = queryString.get("cb_url");
			Cookies.set("cache_bus_login_name", username);
			//直接到商家后台
			Path.jump("http://admin.dotnar.com");
		}, function(errorCode, xhr, errorMsg) {
			alert("error", errorMsg);
		});
	});
});