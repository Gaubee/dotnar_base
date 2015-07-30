/* global LS */
/* global Model */
/* global App */
/* global appConfig */
require(["common", "hash_routie", "coAjax", "queryString", "jQuery", "browser", "href", "eventManager"], function(jSouper, hash_routie, coAjax, QueryString, $, browser, href, eventManager) {
	/*
	 * HASH路由
	 */
	hash_routie({
		html_url: "./pages/mobile/default/",
		js_url: "./js/mb/default/",
		hash_prefix: "default/:page",
		default_hash: "main",
		teleporter: "main"
	});


	//获取指定页的商品
	coAjax.get(appConfig.goods.list, {
		bus_id: busInfo._id,
		num: 10,
		page: 0
	}, function(result) {
		console.log("goods:", result.result);
		jSouper.ready(function() {
			App.set("goods_list", result.result);
		});
	}, function() {
		console.log(arguments);
	});

	App.set('$Event.href', function() {
		if (App.get('$Cache.search_text')) {
			href.jump("#default/searchset?q=" + App.get('$Cache.search_text'))
		} else {
			alert('error', '请输入搜索关键词');
		}
	})

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
		alert("success", "添加成功");
	};

	function _get_cart_error(errorCode, xhr, errorMsg) {
		console.log("%c" + errorCode + ": " + errorMsg, "color:orange;font-size:14px; text-shadow: 0 1px 0 #ccc;");
		alert("error", errorMsg);
	};
	App.set("$Event.goods_list.add_to_cart", function(e, vm) {
		var cart_item = {
			goods_id: vm.get("_id"),
			num: 1
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
			cache_cart.push(cart_item);
			LS.set("$Cache.cart", JSON.stringify(cache_cart));
		}
	});
});