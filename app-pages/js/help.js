Path.on("/__basename__.html", function() {
	App.set("thisPage", 4);
	coAjax.get(appConfig.open.get_bus_recommend_config + busInfo._id, function(result) {
		App.set("$Cache.recommend_config", result.result);
	});
});
setInterval(function zmd() {
	App.set("$Cache.help.title", "走马灯233");
	App.set("$Cache.help.use_css", "css/test.css");
	setTimeout(function() {
		App.set("$Cache.help.title", "233走马灯");
		App.set("$Cache.help.use_css", "");
	}, 1000)
	return zmd;
}(), 2000)