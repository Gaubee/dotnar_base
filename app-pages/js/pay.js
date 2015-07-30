;
(function() {

	/*
	 * Sock连接
	 */
	var user_notify = serverNotify("user");
	//订单支付成功后的页面回调
	function _pay_success_cb(new_ach_info) {
		App.set("user.pay_ach", new_ach_info);
		Path.jump("http://user.dotnar.com");
	}
	user_notify.on("pay_success", _pay_success_cb);

	user_notify.on("ach.state.changed", function(ach_info) {
		if (App.get("user.pay_ach._id") == ach_info.ach_id) {
			App.set("user.pay_ach.info.state", ach_info.state);
		}
	})

	App.set("_is_weixin", _isWX);
	App.set('whichpay', 'pay1');
	App.set('$Event.change', function() {
		App.model.toggle('address');
	});
	App.set('$Event.isadd', function() {
		App.model.toggle('isadd');
	});
	App.set('$Event.changepay', function(e, vm) {
		$(this).find('.radio').click();
		App.set('whichpay', $(this).attr('name'));
	});

	//订单取消
	App.set("$Event.cancel_ach_success", function(vm, result) {
		Path.jump("main.html");
	});
	Path.on("/__basename__.html", function(_current_location) {
		var queryString = _current_location.query;
		var ach_id = queryString.get("ach_id");
		console.log(ach_id);
		if (!ach_id) {
			alert("error", "无效的订单编号");
		}
		//获取订单信息
		coAjax.get(appConfig.user.ach_by_id + ach_id, function(result) {
			App.set("user.pay_ach", result.result);
		}, function(errorCode) {
			console.log("errorCode:", errorCode);
			// alert("error", "无效的订单编号");
			my_confirm("订单号无效，是否回到店铺首页", function() {
				Path.jump("main.html");
			});
		});
		// //财付通支付
		// coAjax.get(appConfig.user.ach_by_id + ach_id, function(result) {
		// 	var pay = result.result;
		// 	var price = pay.cash;
		// 	var telpay = "http://www.sportyuan.com/tenpay/tenpay.php?order_no=" + ach_id + "&product_name=商品&order_price=" + price + "&trade_mode=1&remarkexplain=商品内容";
		// 	App.set('telpay', telpay);
		// });

		//获取用户地址列表
		coAjax.get(appConfig.user.address_detail, function(result) {
			App.set("user.address_detail", result.result);
			App.getModel().touchOff("user.pay_ach.info.user_address")
		});

	});
	//改变支付方式
	App.set("$Event.pays.change_pay_method", function(e) {
		var pay_method = this.getAttribute("value");
		coAjax.put(appConfig.user.ach_change_pay_method + App.get("user.pay_ach._id"), {
			pay_method: pay_method
		}, function(result) {
			App.set("user.pay_ach", result.result);
			alert("success", "支付方式修改成功");
		}, function(errorCode) {
			alert("error", "支付方式修改失败");
		})
	});
	// 添加地址
	App.set("$Event.add_user_address", function() {
		var new_user_address = {
			province: $("[name='province']").val(),
			town: $("[name='city']").val(),
			county: $("[name='area']").val(),
			// street:
			detail: $("[name='detailed_addre']").val(),
			mobilenumber: $("[name='mobile_num']").val(),
			name: $("[name='name']").val()
		};
		console.log(new_user_address);
		coAjax.post(appConfig.user.add_address, new_user_address, function(result) {
			var address_detail = App.get("user.address_detail");
			address_detail.unshift(result.result);
			App.set("user.address_detail", address_detail);
			App.getModel().touchOff("user.pay_ach.info.user_address");
			App.model.toggle('isadd');
			coAjax.put(appConfig.user.ach_change_user_address + App.get("user.pay_ach._id"), {
				user_address_id: result.result._id
			}, function(result) {
				alert('success', "收获地址修改成功");
				App.set("user.pay_ach.info.user_address", result.result);
			}, function(errorCode, xhr, errorMsg) {
				App.getModel().touchOff("user.pay_ach.info.user_address._id")
				alert("error", errorMsg);
			});
		}, function(errorCode, xhr, errorMsg) {
			alert("error", errorMsg);
		});
	});
	//改变订单使用的收获地址
	App.set("$Event.pays.change_user_address", function(e, vm) {
		coAjax.put(appConfig.user.ach_change_user_address + App.get("user.pay_ach._id"), {
			user_address_id: vm.get("_id")
		}, function(result) {
			App.model.toggle('address');
			App.set("user.pay_ach.info.user_address", result.result);
		});
	});
	//使用支付宝下单
	App.set("$Event.pays.alipay_build", function() {
		require("coAjax").post(appConfig.server_url + "alipay/create_direct_pay_by_user", {
			WIDout_trade_no: App.get("user.pay_ach._id"),
			WIDsubject: "来自“" + App.get("bus_info.bus_id") + "”的订单",
			WIDtotal_fee: App.get("user.pay_ach.cash"),
			WIDbody: "",
			WIDshow_url: window.location.toString(),
		}, function(result) {
			// result.result.appendTo(document.body);
			App.set("$Cache.alipay_submit_pay_ach", result.toString);
		}, function(ec, xhr, em) {
			console.log(em)
		});
	});

}());