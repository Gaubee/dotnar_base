//
/*
 * 记录访客
 */
coAjax.post(appConfig.recordVisitorInfo, {
	bus_id: busInfo._id
}, function(result) {
	console.log("访客信息已经记录：", result.result);
});