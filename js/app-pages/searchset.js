require(["common", "coAjax", "queryString", "hash_routie", "title"], function(jSouper, coAjax, QueryString, hash_routie, title) {
	hash_routie.on("searchset", function() {
		var queryString = new QueryString(location.hash);
		// console.log(queryString);
		var get_goods_type = queryString.get("id");
		App.set("$Cahce.goods_search_result_type", get_goods_type);
		var get_search_key = queryString.get("q");
		App.set("$Cache.search_key", get_search_key);
		var goods_search_result_url = appConfig.goods.search_with_page_info;
		App.set("$Cache.goods_info.type", "搜索结果");

		//页号
		var current_page_num = ~~queryString.get("page");
		// console.log(current_page_num);
		//每页显示数量
		var goods_pre_num = ~~queryString.get("num") || appConfig.goods_pre_num || 12;
		App.set("config.goods_pre_num", goods_pre_num);
		App.set("$Cache.goods_pre_num", goods_pre_num);
		jSouper.ready(function(argument) {
			App.set("$Cache.current_page_num", current_page_num);
		});
		//获取指定页的商品
		App.model.toggle('isresult');
		coAjax.get(goods_search_result_url, {
			bus_id: busInfo._id,
			q: get_search_key,
			num: goods_pre_num,
			page: current_page_num
		}, function(result) {
			App.model.toggle('isresult');
			var info = result.result;
			var goods_list = jSouper.map(info.goods_with_weight, function(goods) {
				return goods.goods;
			});
			var page_info = {
				total_num: info.total_num,
				total_page: info.total_page,
				page: info.page,
				num: info.num
			};
			page_info._number_list = [];
			page_info._number_list.length = info.total_page;
			App.set("goods", goods_list);
			App.set("$Cache.goods_search_result.page_info", page_info);
		}, function(e) {
			App.model.toggle('isresult');
		});
	})
});