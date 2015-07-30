Path.on("/__basename__.html", function(loc) {
	App.set("$Cache.main.query.id", loc.query.get("id"));
	App.set("$Cache.main.random_str", Math.random().toString(36).substr(2));
});