define("WX", ["wx_core"], function(wx) {
	var fun_list = [];
	var ready = false;
	coAjax.get(appConfig.wx.jsapi_signature, function(result) {
		var config = result.result;
		console.log(config);
		config.debug = false;
		config.jsApiList = [
			'checkJsApi',
			'onMenuShareTimeline',
			'onMenuShareAppMessage',
			'onMenuShareQQ',
			'onMenuShareWeibo',
			'hideMenuItems',
			'showMenuItems',
			'hideAllNonBaseMenuItem',
			'showAllNonBaseMenuItem',
			'translateVoice',
			'startRecord',
			'stopRecord',
			'onRecordEnd',
			'playVoice',
			'pauseVoice',
			'stopVoice',
			'uploadVoice',
			'downloadVoice',
			'chooseImage',
			'previewImage',
			'uploadImage',
			'downloadImage',
			'getNetworkType',
			'openLocation',
			'getLocation',
			'hideOptionMenu',
			'showOptionMenu',
			'closeWindow',
			'scanQRCode',
			'chooseWXPay',
			'openProductSpecificView',
			'addCard',
			'chooseCard',
			'openCard'
		];
		wx.config(config);
		window.wx_config = config;
		window.wx = wx;
		wx.ready(function() {
			_isDev && alert("success", "微信验证通过");
			ready = true;
			wx_fun();
		});
		wx.error(function(err) {
			alert("error", "微信验证失败")
			alert("error", JSON.stringify(err))
		});
	});

	function wx_fun(fun) {
		if (fun instanceof Function) {
			fun_list.push(fun)
		}
		if (ready) {
			for (var i = 0, fun; fun = fun_list[i]; i += 1) {
				fun(wx);
			}
			fun_list.length = 0;
		}
	}
	return wx_fun
});