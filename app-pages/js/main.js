/* 业务逻辑 */
(function() {

	var goodsCart = {
		add_to_cart: function(goods_id, num, succ_cb, err_cb) {
			num = ~~num || 1;
			if (num < 0) {
				num = 0;
			};
			var cart_item = {
				goods_id: goods_id,
				num: 1
			};
			coAjax.post(appConfig.user.cart, cart_item, function(result) {
				alert("success", "商品已添加到购物车");
				succ_cb && succ_cb.apply(this, arguments);
			}, function(errorCode, xhr, errorMsg) {
				alert("error", errorMsg);
				err_cb && err_cb.apply(this, arguments);
			});
		}
	};

	Path.on(["/__basename__.html", "/"], function() {
		App.set("thisPage", false);
		//获取指定页的商品
		coAjax.get(appConfig.goods.list, {
			bus_id: busInfo._id,
			num: 10,
			page: 0
		}, function(result) {
			var goods_list = result.result;
			App.set("goods_list", goods_list);
		}, function() {
			console.log(arguments);
		});
	});

	App.set('$Event.href', function() {
		if (App.get('$Cache.search_text')) {
			Path.jump("searchset.html?q=" + App.get('$Cache.search_text'))
		} else {
			alert('error', '请输入搜索关键词');
		}
	})


	function _get_cart_success(result) {
		var cart_detail = result.result;
		App.set("user.cart_detail", cart_detail);
		Path.jump("cart.html");
	};

	App.set("$Event.goods_list.add_to_cart", function(e, vm) {
		var cart_item = {
			goods_id: vm.get("_id"),
			num: 1
		};
		goodsCart.add_to_cart(vm.get("_id"), 1, _get_cart_success)
	});
}());

/*交互*/
;