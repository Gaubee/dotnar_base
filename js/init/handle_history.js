//
//检查是否有历史记录用的索引，和History.length不同，这个属性只检查dotnar站点
App.set("$Cache.page_index", -1);
Path.on("*", function() {
	App.set("$Cache.page_index", App.get("$Cache.page_index") + 1);
	if (!(location.hash.indexOf("#default/sign_in") == 0)) {
		LS.set("$Cache.cb_url_href", location.href);
		App.set("$Cache.cb_url_href", location.href);
		document.body.scrollTop = 0;
	};
});