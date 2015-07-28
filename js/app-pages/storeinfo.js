(function() {
	Path.on("/__basename__", function() {
		App.set("thisPage", 3);
	});



	//百度地图
	var ak_key = "rroTv2TmcdKGCiQ2jER1oA3V";
	var doc_write = document.write;
	var doc_s_write = function(HTML) {
		var dom = $(HTML);
		console.log("heml" + HTML);
		dom.find("script[src]").each(function(i, scriptNode) {
			scriptNode.src && require([scriptNode.src]);
			scriptNode.removeAttribute("src")
		});
		dom.appendTo(document.body);
	}
	document.write = doc_s_write;
	require(["http://api.map.baidu.com/api?type=quick&ak=rroTv2TmcdKGCiQ2jER1oA3V&v=1.0"], function(scriptText) {
		document.write = doc_write;
		var _BMap_ti = setInterval(function() {
			if (window.BMap) {
				clearInterval(_BMap_ti);
				init_map();
			}
		})
	});

	function init_map() {
		// 百度地图API功能
		var map = new BMap.Map("map"); // 创建Map实例
		map.addControl(new BMap.ZoomControl()); //添加地图缩放控件	
		map.addControl(new BMap.ScaleControl()); // 添加比例尺控件
		var _search_ti;
		var local = new BMap.LocalSearch(map, {
			renderOptions: {
				map: map,
				autoViewport: true
			}
		});
		var myGeo = new BMap.Geocoder();
		_search_ti = setInterval(function() {
			var address = App.get("bus_info.info.address")
			if (address) {
				local.search(address);
				clearInterval(_search_ti);
			}
			// setTimeout(function() {
			// 	map.setZoom(15);
			// 	local.searchNearby("公交", address);
			// 	var x = map.getCenter().lng;
			// 	var y = map.getCenter().lat;
			// 	var pStart = new BMap.Point(x, y);
			// 	var pEnd = new BMap.Point(x * 1.01, y * 1.01);
			// 	// alert("当前地图中心点：" + map.getCenter().lng + "," + map.getCenter().lat);
			// }, 1000); //1秒后放到14级
		});
	};

	if (App.get('bus_info.info.open_time.s_min') < 10) {
		App.set('bus_info.info.open_time.s_min', '0' + App.get('bus_info.info.open_time.s_min'));
	};
	if (App.get('bus_info.info.open_time.e_min') < 10) {
		App.set('bus_info.info.open_time.e_min', '0' + App.get('bus_info.info.open_time.e_min'));
	};
}());