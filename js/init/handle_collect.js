//
function _check_collect_bus(collectBus) {
	var is_collect = true;
	if (jSouper.indexOf(collectBus, appConfig.bus_id) === -1) {
		is_collect = false;
	};
	App.set("$Cache.is_collect_current_bus", is_collect)
};
eventManager.on("getLoginer", function() {
	//校验是否已经收藏过此商家
	var collectBus = App.get("loginer.collectBus") || [];
	_check_collect_bus(collectBus);
});


App.set("$Event.user_collect_bus", function() {
	if (!App.get("loginer")) {
		alert("warn", "收藏店铺前，请您先登陆！！！");
		return;
	};
	if (App.get("$Cache.is_collect_current_bus")) {
		coAjax["delete"](appConfig.user.collectBus_remove, {
			bus_id: appConfig.bus_id
		}, function(result) {
			alert("已取消店铺收藏");
			// App.set('$Cache.is_collect_current_bus',false);
			_check_collect_bus(result.result);
		}, function(errorCode, xhr, errorMsg) {
			// alert("error",errorMsg)
			_check_collect_bus(App.get("loginer.collectBus"));
		});
	} else {
		coAjax.post(appConfig.user.collectBus_add, {
			bus_id: appConfig.bus_id
		}, function(result) {
			alert("success", "店铺收藏成功");
			// App.set('$Cache.is_collect_current_bus',true);
			_check_collect_bus(result.result);
		}, function(errorCode, xhr, errorMsg) {
			// alert("error",errorMsg)
			_check_collect_bus(App.get("loginer.collectBus"));
		});
	};
});