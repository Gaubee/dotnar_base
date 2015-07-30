;
(function() {
	var goods_id;
	var recommender_id;
	App.set('$Event.changToEdit', function(e, vm) {
		if (App.get('cartPrivate')) {
			vm.set('cartPrivate', '');
		} else {
			vm.set('cartPrivate', 'focus');
		}
	});
	Path.on("/__basename__.html", function(_current_location) {
		/*
		 * 请求购物车数据
		 */
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
		};

		function _get_cart_error(errorCode, xhr, errorMsg) {
			console.log("%c" + errorCode + ": " + errorMsg, "color:orange;font-size:14px; text-shadow: 0 1px 0 #ccc;");
			alert("error", errorMsg);
		};

		var queryString = _current_location.query;
		goods_id = queryString.get("goods_id");
		recommender_id = queryString.get("rcid") || LS.get("recommender_id");

		if (goods_id) {
			coAjax.post(appConfig.user.cart, {
				goods_id: goods_id,
				num: queryString.get("num")
			}, _get_cart_success, _get_cart_error);
		} else {
			coAjax.get(appConfig.user.get_cart_detail_by_bus_id, {
				bus_id: busInfo._id
			}, _get_cart_success, _get_cart_error);
		}
	});
	App.set("$Event.cart.cart_to_ach", function(e) {
		var cart_id_list = App.get("user.cart_detail").map(function(cart) {
			return cart._id;
		});

		coAjax.post(appConfig.user.cart_make_ach, {
			//user_address_id
			cart_id_list: cart_id_list,
			recommender_id: recommender_id
		}, function(result) {
			console.log(result);
			Path.jump("/pay.html?ach_id=" + result.result._id)
		}, function(errorCode, xhr, errorMsg) {
			alert("error", errorMsg);
		});
	});
	App.set("$Event.cart.remove_goods", function(e, vm) {
		coAjax["delete"](appConfig.user.remove_goods_from_cart, {
			goods_id: vm.get("goods_id"),
			cart_id: vm.get("$Parent.$Parent._id")
		}, _get_cart_success, _get_cart_error)
	});
	App.set("$Event.cart.update_cart_num", function(e, vm) {
		coAjax.put(appConfig.user.update_goods_num_in_cart, {
			goods_id: vm.get("goods_id"),
			cart_id: vm.get("$Parent.$Parent._id"),
			num: vm.get("num")
		}, _get_cart_success, _get_cart_error)
	});
}());