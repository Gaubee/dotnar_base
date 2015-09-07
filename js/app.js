/*
 * 全局配置变量
 */
//Nunjucks <% include "js/lib/Cookies.js" %>
//Nunjucks <% include "js/lib/QueryString.js" %>
//Nunjucks <% include "js/lib/eventManager.js" %>
//Nunjucks <% include "js/lib/dataFormat_coAjax_serverNotify.js" %>
//Nunjucks <% include "js/lib/alert_confirm_loader.js" %>

//Nunjucks <% include "js/lib/jSouperHandle/documentTitle.js" %>
//Nunjucks <% include "js/lib/jSouperHandle/number.js" %>
//Nunjucks <% include "js/lib/jSouperHandle/time.js" %>
//Nunjucks <% include "js/lib/jSouperHandle/useCss.js" %>

//Nunjucks <% include "js/lib/Path.js" %>

//Nunjucks <% include "js/lib/WX.js" %>

;
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

		var appNode = document.getElementById("jSouperApp");
		appNode.style.display = "block"; //显示App
		if (_can_history_pushState) {
			window.addEventListener("popstate", Path.emitDefaultOnload);
		}

		//初始化路由
		Path.emitDefaultOnload();
		eventManager.emit("!AppReady");

		//Nunjucks <% include "js/init/handle_query.js" %>
		//Nunjucks <% include "js/init/handle_history.js" %>
		//Nunjucks <% include "js/init/handle_collect.js" %>
		//Nunjucks <% include "js/init/handle_loginer.js" %>
		//Nunjucks <% include "js/init/wx_share.js" %>
		//Nunjucks <% include "js/init/record_visitor.js" %>

	});
});