(function() {
	var TITLE_MAP = {};

	function _change_document_title(title_config) {
		if (title_config.pagename === Path._current_page) { //匹配成功
			document.title = title_config.title;
		}
	}
	jSouper.registerHandle("setTitle", function(title) {
		var id = this._id;
		var title_config;

		if (!(title_config = TITLE_MAP[id]) && !TITLE_MAP.hasOwnProperty(id)) {
			title_config = (TITLE_MAP[id] = {
				pagename: Path._current_page,
				title: title
			});
			//注册事件
			Path.on("*", function() {
				_change_document_title(title_config);
			});
		}
		//不在事件范围内发生改变，手动改变
		if (title !== title_config.title) {
			title_config.title = title;
			_change_document_title(title_config);
		}
		return "";
	});
}());