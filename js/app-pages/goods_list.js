(function() {
	Path.on("/__basename__", function(_current_location) {
		var queryString = _current_location.query;
		get_goods_type = queryString.get("id");
		App.set("$Cahce.goods_list_type", get_goods_type);
		App.set("thisPage", 1);
		var goods_pre_num = 12;
		//获取所有商品数量
		coAjax.get(appConfig.goods.number, {
			bus_id: busInfo._id,
		}, function(result) {
			var number = ~~result.result
			App.set("$Cache.goods_number", number);
			var _goods_number_list = [];
			_goods_number_list.length = number;
			var _page_num = [];
			//向上取整获取页数
			// console.log(number, goods_pre_num, Math.ceil(number / goods_pre_num));
			_page_num.length = Math.ceil(number / goods_pre_num);
			App.set("$Cache.goods_number_list", _goods_number_list);
			App.set("$Cache.page_num", _page_num);
		});
		// 判断排序
		var current_page_num;
		if (get_goods_type == 2) {
			goods_list_url = appConfig.goods.quality_list;
			current_page_num = 0;
			App.set('cPrivate2', 'focus');
			App.set('cPrivate1', '');
			App.set('goods', []);
			getgoods();
		} else {
			var goods_list_url = appConfig.goods.list;
			current_page_num = 0;
			App.set('cPrivate2', '');
			App.set('cPrivate1', 'focus');
			App.set('goods', []);
			getgoods();
		}
		//每页显示数量
		App.set("config.goods_pre_num", goods_pre_num);
		App.set("$Cache.goods_pre_num", goods_pre_num);
		jSouper.ready(function(argument) {
			App.set("$Cache.current_page_num", current_page_num);
		});
		App.set('$Event.getMoreGoods', function() {
			if (App.get('isresult')) {
				current_page_num += 1;
				getgoods();
			}
		});
		//获取指定页的商品
		function getgoods() {
			App.model.toggle('loadingoods');
			coAjax.get(goods_list_url, {
				bus_id: busInfo._id,
				num: goods_pre_num,
				page: current_page_num
			}, function(result) {
				if (result.result.length) {
					App.set('isresult', true);
					App.concat('goods', result.result);
					App.model.toggle('loadingoods');
				} else {
					App.model.toggle('loadingoods');
					App.set('isresult', false);
				};
			});
		}
	})
}());