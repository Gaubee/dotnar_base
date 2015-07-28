require(["common", "eventManager", "coAjax", "queryString", "href", "hash_routie", "jQuery.qrcode"], function(jSouper, eventManager, coAjax, QueryString, href, hash_routie) {
	var queryString = new QueryString(location.hash);
	var recommender_id = queryString.get("rcid");
	App.set("$Cache.recommender_id", recommender_id);
	App.set("$Cache.recommender_url", Model.Observer(function() {
		var user_id = App.get("loginer._id");
		var result = "http://" + location.host + location.pathname + "?id=" + queryString.get("id") + "&rcid=" + user_id;
		return result;
	}));
	var goods_id = queryString.get("id");
	//参数错误，返回首页
	if (!goods_id) {
		href.toMain();
	}
	coAjax.get(appConfig.goods.detail + goods_id, function(result) {
		jSouper.ready(function() {
			var goods_info = result.result;
			//处理数据格式
			goods_info.price = +goods_info.price || 0;
			goods_info.price_toFixed_2 = goods_info.price.toFixed(2);
			goods_info.fare = +goods_info.fare || 0;
			goods_info.fare_toFixed_2 = goods_info.fare.toFixed(2);
			App.set("goods_detail", goods_info);
		});
	});
	//获取评价数据
	// coAjax.get(appConfig.user.can_eval + goods_id, function(result) {
	// 	App.set("$Cache.eval.can_evaluation_able", result.result.can_evaluation_able);
	// });
	function _get_cart_success(result) {
		var cart_detail = result.result;

		App.set("user.cart_detail", cart_detail);
		App.set("$Cache.cart.total_price", Model.Observer(function() {
			var cart_detail = App.get("user.cart_detail");
			var total_price = 0;
			cart_detail.forEach(function(cart) {
				cart.goods_info.forEach(function(goods_info) {
					total_price += goods_info.goods.price * goods_info.num;
				});
			});
			return total_price;
		}));
		alert("success", "添加成功")
	};

	function _get_cart_error(errorCode, xhr, errorMsg) {
		console.log("%c" + errorCode + ": " + errorMsg, "color:orange;font-size:14px; text-shadow: 0 1px 0 #ccc;");
		alert("error", errorMsg);
	};
	App.set("$Event.goods.add_to_cart", function(e) {
		var cart_item = {
			goods_id: App.get("goods_detail._id"),
			num: App.get("$Cache.goods_details.buy_number")
		};
		if (App.get("loginer")) {
			coAjax.post(appConfig.user.cart, cart_item, _get_cart_success, _get_cart_error);
		} else {
			alert('error', '添加商品前请先登陆');
			var cache_cart = LS.get("$Cache.cart");
			try {
				cache_cart = JSON.parse(cache_cart);
			} catch (e) {
				console.error(e)
			}
			if (!(cache_cart instanceof Array)) {
				cache_cart = [];
			}
			cache_cart.push(cart_item)
		}
	});
});