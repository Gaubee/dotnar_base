//
require(["WX"], function(WX) {
	//微信分享的配置
	WX(function(wx) {
		Path.on("*", function(_current_location) {
			// wx.error(function(res) {
			// 	alert('wx.error: ' + JSON.stringify(res));
			// });
			switch (Path._current_page) {
				case "goods_details":
					var share_config = {
						title: App.get("goods_detail.goods_name") + "【" + App.get("bus_info.info.title") + "】",
						desc: App.get('goods_detail.intro'),
						link: location.origin + _current_location.pathname + "?id=" + App.get('goods_detail._id') + "&rcid=" + App.get("loginer._id"),
						imgUrl: App.get("goods_detail.preview_img_url") + "?imageView/1/w/300/h/300",
					};
					break;
				default:
					share_config = {
						// title: App.get("bus_info.info.title") + "【点纳微站】",
						title: App.get("bus_info.info.title"),
						desc: App.get("bus_info.info.intro"),
						link: location.origin + _current_location.pathname + "?rcid=" + (App.get("loginer._id") || ""),
						imgUrl: App.get("bus_info.info.logo_url") + "?imageView/1/w/300/h/300"
					};
			};
			// debugger
			// alert(share_config.title);
			share_config.trigger = function(res) {
				alert('用户点击发送给朋友');
			};
			share_config.success = function(res) {
				alert("success", '已分享');
			};
			share_config.cancel = function(res) {
				alert('分享已取消');
			};
			share_config.fail = function(res) {
				alert(JSON.stringify(res));
			};

			// 分享给好友
			wx.onMenuShareAppMessage(share_config);
			// 分享到朋友圈
			wx.onMenuShareTimeline(share_config);
			// 分享到QQ
			wx.onMenuShareQQ(share_config);
		});
		// // 按钮隐藏
		// wx.hideMenuItems({
		// 	menuList: [
		// 		'menuItem:readMode', // 阅读模式
		// 		'menuItem:copyUrl', // 复制链接
		// 		'menuItem:share:email' // 通过邮件分享
		// 	],
		// 	success: function(res) {
		// 		// alert('已隐藏“阅读模式”，“复制链接”等按钮');
		// 	},
		// 	fail: function(res) {
		// 		alert(JSON.stringify(res));
		// 	}
		// });
	});
});