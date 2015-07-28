(function() {

	var goods_id;

	function _is_collect_goods(collect) {
		var result = false;
		if (jSouper.indexOf(collect, goods_id) !== -1) {
			result = true;
		}
		App.set("$Cache.goods_detail.is_collect", result);
	};
	App.set("$Event.checkAdd", function() {
		App.model.toggle('checkAdd');
	});

	App.set("$Event.goods.add_to_cart", function(e) {
		var cart_item = {
			goods_id: goods_id,
			num: App.get("$Cache.goods_details.buy_number")
		};
		if (App.get("loginer")) {
			coAjax.post(appConfig.user.cart, cart_item, function(result) {
				App.set("user.cart_detail", result.result);
				alert("success", "添加成功");
			});
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
	App.set("$Event.goods.selectRecUrl", function(e) {
		//全选
		this.select && this.select();
	});
	eventManager.is(App.get("loginer.collect"), "getLoginer", function() {
		var collect = App.get("loginer.collect") || [];
		_is_collect_goods(collect);
	});

	App.set("$Event.goods.collect_toggle", function() {
		if (App.get("$Cache.goods_detail.is_collect")) {
			coAjax["delete"](appConfig.user.collect_remove, {
				goods_id: goods_id
			}, function(result) {
				alert("已经取消收藏");
				_is_collect_goods(result.result);
			}, function(errorCode, xhr, errorMsg) {
				alert("error", errorMsg)
			});
		} else {
			coAjax.post(appConfig.user.collect_add, {
				goods_id: goods_id
			}, function(result) {
				alert("success", "收藏成功");
				_is_collect_goods(result.result);
			}, function(errorCode, xhr, errorMsg) {
				alert("error", errorMsg)
			});
		}
	});
	// 分享
	// 微博
	App.set('$Event.shareToWeibo', function() {
		var title = "我觉得#" + App.get("goods_detail.goods_name") + "#不错，跟大家分享一下";
		console.log(title);
		var pic = App.get("goods_detail.preview_img_url") + "?imageView/1/w/100/h/100";
		var rLink = location.host.toString() + "/mobile.main.html#default/goods_details?id=" + App.get('goods_detail._id') + "&rcid=" + App.get("loginer._id");
		var site = location.host;
		var summary = App.get('goods_detail.intro');
		window.open("http://service.weibo.com/share/share.php?url=" + encodeURIComponent(rLink) + "&title=" + encodeURIComponent(title.replace(/&nbsp;/g, " ").replace(/<br \/>/g, " ")) + "&pic=" + encodeURIComponent(pic),
			"分享至新浪微博",
			"toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no");
	});
	// QQ空间
	App.set('$Event.shareQzone', function() {
		var title = "我觉得#" + App.get("goods_detail.goods_name") + "#不错，跟大家分享一下";
		console.log(title);
		var pic = App.get("goods_detail.preview_img_url") + "?imageView/1/w/100/h/100";
		var rLink = location.host.toString() + "/mobile.main.html#default/goods_details?id=" + App.get('goods_detail._id') + "&rcid=" + App.get("loginer._id");
		var site = location.host;
		var summary = App.get('goods_detail.intro');
		window.open('http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?title=' +
			encodeURIComponent(title) + '&url=' + encodeURIComponent(rLink) + '&summary=' +
			encodeURIComponent(summary) + '&site=' + encodeURIComponent(site), '_blank', 'scrollbars=no,status=no,resizable=yes');
	});
	Path.on("/__basename__", function(_current_location) {

		var queryString = _current_location.query;
		console.log(queryString);
		var recommender_id = queryString.get("rcid");
		if (recommender_id) {
			//将推荐者的信息保存起来，或者直接覆盖上一个推荐者，以最后一个推荐者为准
			LS.set("recommender_id", recommender_id);
		}
		App.set("$Cache.recommender_id", recommender_id);
		App.set("$Cache.recommender_url", Model.Observer(function() {
			var user_id = App.get("loginer._id");
			var result = "http://" + location.host + location.pathname + "?id=" + queryString.get("id") + "&rcid=" + user_id;
			return result;
		}));
		goods_id = queryString.get("id");
		//参数错误，返回首页
		if (!goods_id) {
			Path.jump("/main.html");
		}
		coAjax.get(appConfig.goods.detail + goods_id, function(result) {
			var goods_info = result.result;
			//处理数据格式
			goods_info.price = +goods_info.price || 0;
			goods_info.price_toFixed_2 = goods_info.price.toFixed(2);
			goods_info.fare = +goods_info.fare || 0;
			goods_info.fare_toFixed_2 = goods_info.fare.toFixed(2);
			App.set("goods_detail", goods_info);
		});
		//获取评价数据
		// coAjax.get(appConfig.user.can_eval + goods_id, function(result) {
		// 	App.set("$Cache.eval.can_evaluation_able", result.result.can_evaluation_able);
		// });

		//根据HASH指令自动添加到购物车
		if (_current_location.hash.indexOf("ADD_TO_CART") !== -1) {
			App.get("$Event.goods.add_to_cart")();
		}
	});
}());