//
/*
 * QUERY中的推荐信息、导购信息、微信信息处理
 */
var recommender_id = Path.getQuery("rcid");
if (recommender_id) {
	Cookies.set("recommender_id_bak", Cookies.get("recommender_id"));
	Cookies.set("recommender_id", recommender_id);
	eventManager.is(App.get("loginer"), "getLoginer", function() {
		var loginer = App.get("loginer");
		if (loginer._id == recommender_id) {
			Cookies.set("recommender_id", Cookies.get("recommender_id_bak"));
		}
	});
	Path.setQuery("rcid", "");
}
var guide_id = Path.getQuery("gi");
if (guide_id) {
	Cookies.set("guide_id_bak", Cookies.get("guide_id"));
	Cookies.set("guide_id", guide_id);
	eventManager.is(App.get("loginer"), "getLoginer", function() {
		var loginer = App.get("loginer");
		if (loginer._id == guide_id) {
			Cookies.set("guide_id", Cookies.get("guide_id_bak"));
		}
	});
	Path.setQuery("gi", "");
}
//微信OPENID
var wx_openid = Path.getQuery("WEIXIN_OPENID");
if (wx_openid) {
	//保存到lib里面，确保跨页面使用
	globalSet("WEIXIN_OPENID", wx_openid, function() {
		alert("success", "微信用户授权成功");
		// eventManager.is(App.get("loginer"), "getLoginer", function() {
		// 	//如果已经绑定微信账号，就不管，要就去个人中心实现“重新绑定”
		// 	if (App.get("loginer.info.weixin_unionid")) {
		// 		return;
		// 	}
		// 	myConfirm("是否将当前登录账号与微信账号做绑定？", function() {
		// 		coAjax.put(appConfig.user.bind_weixin_account_by_open_id, {
		// 			openid: wx_openid
		// 		}, function(result) {
		// 			App.set("loginer", result.result);
		// 			alert("success", "微信号绑定成功，下次无需手动登录");
		// 		});
		// 	}, function() {
		// 		alert("绑定已经取消");
		// 	});
		// });
	});
	Path.setQuery("WEIXIN_OPENID", "");
}