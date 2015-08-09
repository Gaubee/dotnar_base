/*
 * 全局配置变量
 */
<% include "js/lib/Cookies.js" %>
<% include "js/lib/QueryString.js" %>
<% include "js/lib/eventManager.js" %>
<% include "js/lib/dataFormat_coAjax_serverNotify.js" %>
<% include "js/lib/alert_confirm_loader.js" %>

<% include "js/lib/jSouperHandle/documentTitle.js" %>
<% include "js/lib/jSouperHandle/number.js" %>
<% include "js/lib/jSouperHandle/time.js" %>
<% include "js/lib/jSouperHandle/useCss.js" %>

<% include "js/lib/Path.js" %>

<% include "js/lib/WX.js" %>


	/*
	 * 加载核心依赖
	 * 应用程序启动
	 */
require(["r_css!/template/xmp.css"]);
require(["r_text!/template/xmp.html", "/template/xmp.js"], function(xmp_html) {
	jSouper.parse(xmp_html);
	jSouper.ready(function() {
		//初始化应用程序
		jSouper.app({
			Id: "jSouperApp",
			Data: {
				bus_info: busInfo,
				config: appConfig
			}
		});
		//加载通用模块
		require(["/app-pages/js/_common.js"]);

		var $app = $("#jSouperApp");
		$app.removeClass("hidden") //显示App
		if (_can_history_pushState) {
			window.addEventListener("popstate", Path.emitDefaultOnload);
		}
		$app = null;

		//初始化路由
		Path.emitDefaultOnload();

		/*
		 * QUERY中的推荐信息、导购信息、微信信息处理
		 */
		var recommender_id = Path.getQuery("rcid");
		var guide_id = Path.getQuery("gi");
		var wx_openid = Path.getQuery("WEIXIN_OPENID");
		if (recommender_id) {
			Cookies.set("recommender_id_bak", Cookies.get("recommender_id"));
			Cookies.set("recommender_id", recommender_id);
			eventManager.is(App.get("loginer"), "getLoginer", function() {
				var loginer = App.get("loginer");
				if (loginer._id == recommender_id) {
					Cookies.set("recommender_id", Cookies.get("recommender_id_bak"));
				}
			});
		}
		if (guide_id) {
			Cookies.set("guide_id_bak", Cookies.get("guide_id"));
			Cookies.set("guide_id", guide_id);
			eventManager.is(App.get("loginer"), "getLoginer", function() {
				var loginer = App.get("loginer");
				if (loginer._id == guide_id) {
					Cookies.set("guide_id", Cookies.get("guide_id_bak"));
				}
			});
		}
		//微信OPENID
		if (wx_openid) {
			//保存到lib里面，确保跨页面使用
			globalSet("WEIXIN_OPENID", wx_openid, function() {
				alert("success", "微信用户授权成功");
				eventManager.is(App.get("loginer"), "getLoginer", function() {
					//如果已经绑定微信账号，就不管，要就去个人中心实现“重新绑定”
					if (App.get("loginer.info.weixin_unionid")) {
						return;
					}
					myConfirm("是否将当前登录账号与微信账号做绑定？", function() {
						coAjax.put(appConfig.user.bind_weixin_account_by_open_id, {
							openid: wx_openid
						}, function(result) {
							App.set("loginer", result.result);
							alert("success", "微信号绑定成功，下次无需手动登录");
						});
					}, function() {
						alert("绑定已经取消");
					});
				});
			});
		}
		/*
		 * 记录访客
		 */
		coAjax.post(appConfig.recordVisitorInfo, {
			bus_id: busInfo._id
		}, function(result) {
			console.log("访客信息已经记录：", result.result);
		});
	});
});