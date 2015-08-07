/*
 * 全局配置变量
 */
<% include "js/lib/QueryString.js" %>
<% include "js/lib/eventManager.js" %>
<% include "js/lib/dataFormat_coAjax_serverNotify.js" %>
<% include "js/lib/alert_confirm_loader.js" %>

<% include "js/lib/jSouperHandle/documentTitle.js" %>
<% include "js/lib/jSouperHandle/number.js" %>
<% include "js/lib/jSouperHandle/time.js" %>
<% include "js/lib/jSouperHandle/useCss.js" %>

<% include "js/lib/Path.js" %>


/*
 * 加载核心依赖
 * 应用程序启动
 */
require(["r_css!/template/xmp.css"]);
require(["r_text!/template/xmp.html","/template/xmp.js"],function(xmp_html){
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
		Path.emitDefaultOnload();
	});
});
