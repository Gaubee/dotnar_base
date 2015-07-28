( function() {
	//放置监听HASH变动
	Path.on("/__basename__", function(_current_location) {
		var queryString = _current_location.query;
		var tag_id = queryString.get("tag_id");
		App.set("thisPage", 2);

		// 加载标签列表
		App.model.toggle('loadingoods');
		coAjax.get(appConfig.bus.tags_detail, {
			bus_id: busInfo._id
		}, function(result) {
			App.set("$Cache.tags_detail", result.result);
			App.model.toggle('loadingoods');
			_init_hash();
		});

		function _init_hash() {
			var tags_detail = App.get("$Cache.tags_detail");
			for (var i = 0, tag; tag = tags_detail[i]; i += 1) {
				if (tag._id == tag_id) {
					App.set("$Cache.pointer_tag", tag);
					App.set("tagTitle", tag.tag_name)
					break;
				}
			}
			if (i == tags_detail.length) {
				App.set("$Cache.pointer_tag", tags_detail[0]);
			}
		};

	});
}());