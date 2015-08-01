var customTagsInit = jSouper.customTagsInit;

var _is_ueditor_css_load = false;
customTagsInit["ueditor"] = function(vm) {
	_is_ueditor_css_load || $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', 'umeditor1_2_2-utf8-php/themes/default/css/umeditor.css'));
	_is_ueditor_css_load = true;
	var ueditorNode = vm.getOneElementByTagName("ueditor");
	var ueNode = vm.getOneElementByTagName("uecontanier");
	$.when(
		$.getScript("umeditor1_2_2-utf8-php/umeditor.js"),
		$.getScript("umeditor1_2_2-utf8-php/umeditor.config.js")
	).done(function() {
		//语言包
		$.getScript("umeditor1_2_2-utf8-php/lang/zh-cn/zh-cn.js", function() {
			var id = ueNode.id = Math.random().toString(36).substr(2);
			var ue;
			var _ue_init_ti;
			var _ue_set_ti;
			jSouper.onElementPropertyChange(ueditorNode, "value", function _init_value(key, value) {
				if (!ue && document.getElementById(id)) {
					window.ue = ue = UM.getEditor(id);

					ue.setOpt("imageCompressEnable", true); //启用压缩
					ue.setOpt("imageCompressBorder", 1200); //多图上传压缩最大宽度
					ue.setWidth(ueditorNode.clientWidth)

					ue.addListener("contentChange", function() {
						var bind_input_key = ueditorNode.getAttribute("input");
						if (bind_input_key) {
							vm.set(bind_input_key, ue.getContent());
						}
						jSouper.dispatchEvent(ueditorNode, "input");
					});
					ue.ready(function() {
						//DOM remove 后，又append，这是UM的isReady任然认为是1，其实iframe需要重载，所以这边又再次出发，value会被正确绑定
						var value = ueditorNode.getAttribute("value");
						typeof value === "string" && (value != ue.getContent()) && ue.setContent(value);
					});

					clearTimeout(_ue_init_ti);
					var args = Array.prototype.slice.call(arguments);
					var self = this;
					_ue_init_ti = setTimeout(function() {
						_init_value.apply(self, args);
					}, 200)
					return
				}
				value && (value != ue.getContent()) && ue.setContent(value)
			}, true);
			jSouper.onElementPropertyChange(ueditorNode, "input", function(key, bind_input_key) {
				bind_input_key && ue && vm.set(bind_input_key, ue.getContent());
			});
		});
	}).fail(function() {
		console.error(arguments);
	});
};

customTagsInit["selectsearch"] = function(vm) {
	var buttonNode = vm.getOneElementByTagName("button");
	var node = vm.getOneElementByTagName("selectsearchWrap");
	var optionContainer = vm.getOneElementByTagName("optionContainer");
	var bind_input_key;
	var bind_value;
	jSouper.onElementPropertyChange(node, "input", function(key, value) {
		bind_input_key = value;
	}, true);
	jSouper.onElementPropertyChange(node, "value", function(key, value) {
		vm.set("$CPrivate.$Cache.select_result", bind_value = value);
	}, true);

	jSouper.onElementPropertyChange(node, "placeholder", function(key, value) {
		vm.set("$CPrivate.$Cache.placeholder", value || '未选择');
	}, true);

	function _setBindData(cvm, value) {
		if (bind_input_key) {
			//默认绑定数组对应的item-obj对象
			//如果要绑定value一样的字符串值
			//需要声明use-value-as-result
			if (node.getAttribute("use-value-as-result")) {
				vm.set(bind_input_key, value);
			} else {
				bind_value = cvm ? cvm.get() : value;
				vm.set(bind_input_key, bind_value);
			}
		}
		vm.set("$CPrivate.$Cache.select_result", value);
		jSouper.dispatchEvent(node, "change");
	};
	vm.set("$CPrivate.$Event.selected", function(e, vm) {
		var optionItemNode = e.target;
		if (optionItemNode.tagName === "OPTIONITEM") {
			var cvm = vm.getElementViewModel(optionItemNode);
			//绑定显示的值
			var value = optionItemNode.getAttribute("value");
			//绑定反向数据
			_setBindData(cvm, value);
		}
	});
	vm.set("$CPrivate.$Event.search", function(e) {
		var input_search_data = vm.get("$CPrivate.$Cache.search_data") || "";
		jSouper.forEach(optionContainer.getElementsByTagName("OPTIONITEM"), function(optionItemNode) {
			var search_data = (optionItemNode.getAttribute("search-data") || optionItemNode.getAttribute("value") || "");
			if (search_data.indexOf(input_search_data) !== -1) {
				var cvm = vm.getElementViewModel(optionItemNode);
				optionItemNode.style.display = "";
			} else {
				optionItemNode.style.display = "none";
			}
		});
		var datalist_key = node.getAttribute("datalist-key");
		var datalist_search_result = [];
		if (datalist_key && input_search_data) {
			var datalist = vm.get(datalist_key);
			if (jSouper.$.isA(datalist)) {
				jSouper.forEach(datalist, function(datainfo) {
					var search_data = (datainfo.search_data || "");
					if (search_data.indexOf(input_search_data) !== -1) {
						datalist_search_result.push(datainfo)
					}
				});
			}
		}
		vm.set("$CPrivate.$Cache.datalist_search_result", datalist_search_result);
	});

	function _showSeach(display) {
		vm.set("$CPrivate.$Cache.show_search", display);
		// vm.set("$CPrivate.$Cache.focus_input", display ? Math.random() : "");
	};
	vm.set("$CPrivate.$Event.focus_button", function() {
		buttonNode.style.height = buttonNode.clientHeight + "px";
		vm.model.toggle("$CPrivate.$Cache.show_search");
	});
	vm.set("$CPrivate.$Event.hidden_button", function() {
		//让当前的事件流触发完成，不然input的focus事件无法触发
		setTimeout(function() {
			vm.set("$CPrivate.$Cache.show_search", false);
		});
	});

	vm.set("$CPrivate.$Event.focus_input", function() {
		vm.set("$CPrivate.$Cache.focus_input", true);
	});
	vm.set("$CPrivate.$Event.hidden_input", function() {
		vm.set("$CPrivate.$Cache.focus_input", false);
	});
};

customTagsInit["img-uploader"] = function(vm) {
	var uploaderNode = vm.getOneElementByTagName("imgUploaderWrap");
	var inputNode = vm.getOneElementByTagName("input");
	var markNode = vm.getOneElementByTagName("imgMark");

	vm.set("$CPrivate.$Cache.text", "初始化中");
	inputNode.disabled = true;
	require(["localResizeIMG"], function() {

		function _set_url(url) {
			var _bind_input_key = uploaderNode.getAttribute("input-key");
			if (_bind_input_key) {
				vm.set(_bind_input_key, url);
			}
			//显示预览
			_show_preview(url);
		}
		var _ti;

		function _show_preview(url) {
			clearInterval(_ti);
			//是否在控件上显示图片
			var _one_way = uploaderNode.getAttribute("one-way");
			if (_one_way != "true") {
				vm.set("$CPrivate.$Cache.img_url", url);
				if (!uploaderNode.clientWidth) {
					_ti = setInterval(function() {
						_show_preview(url)
					}, 200);
					//中断
					return;
				}
				vm.set("$CPrivate.$Cache.img_width", uploaderNode.clientWidth);
				vm.set("$CPrivate.$Cache.img_height", uploaderNode.clientHeight);
			}
		}

		function _set_status(value) {
			var _upload_status = uploaderNode.getAttribute("status");
			_upload_status && vm.set(_upload_status, value);
			vm.set("$CPrivate.$Cache.uploading", value);
		}

		inputNode.removeAttribute("disabled");
		jSouper.onElementPropertyChange(uploaderNode, "text", function(attr, text) {
			vm.set("$CPrivate.$Cache.text", text || "点击选择文件上传");
		}, true);
		jSouper.onElementPropertyChange(uploaderNode, "url", function(attr, value) {
			_show_preview(value)
		}, true);
		//压缩图片的配置与回调
		var localResizeIMG_config = {
			maxWidth: 1024,
			quality: 1,
			before: function() {
				_set_status(true);
			},
			success: function(result) {
				//使用BASE64上传
				coAjax.post(appConfig.other.upload_base64_image, {
					img_base64: result.base64
				}, function(result) {
					_set_status(false);
					var img_url = appConfig.img_server_url + result.result.key;
					//给绑定的值赋值
					_set_url(img_url);
					//运行回调
					var _upload_callback = uploaderNode.getAttribute("upload-callback");
					if (_upload_callback) {
						var _cb = vm.get(_upload_callback);
						(_cb instanceof Function) && _cb(img_url);
					}
				}, function(errorCode, xhr, errorMsg) {
					_set_status(false);
					alert("error", errorMsg);
				}, function() {
					_set_status(false);
					alert("error", "网络异常，请重试！")
				});
			}
		};
		//动态修改配置
		jSouper.onElementPropertyChange(uploaderNode, "max-width", function(attr, value) {
			var _maxWidth = +uploaderNode.getAttribute("max-width");
			isNaN(_maxWidth) && (_maxWidth = 1024);
			localResizeIMG_config.maxWidth = _maxWidth;
		}, true);
		$inputNode = $(inputNode);
		$inputNode.localResizeIMG(localResizeIMG_config);
	});


	vm.set("$CPrivate.$Event.show_mark", function() {
		markNode.className = "show";
	});
	vm.set("$CPrivate.$Event.hide_mark", function() {
		markNode.className = "";
	});
	vm.set("$CPrivate.$Event.toggle_mark", function() {
		markNode.className = markNode.className ? "" : "show"
	});
	vm.set("$CPrivate.$Event.remove", function() {
		_set_url();
	});
};

customTagsInit["weibo-share"] = function(vm) {
	var shareNode = vm.getOneElementByTagName("div");
	vm.set("$CPrivate.$Event.shareToWeibo", function() {
		var title = shareNode.getAttribute("title") || "";
		var src = shareNode.getAttribute("src");
		var href = shareNode.getAttribute("href");
		window.open("http://service.weibo.com/share/share.php?pic=" + encodeURIComponent(src) +
			"&title=" + encodeURIComponent(title.replace(/&nbsp;/g, " ").replace(/<br \/>/g, " ")) +
			"&url=" + encodeURIComponent(href),
			"分享至新浪微博",
			"toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no");
	});
};

customTagsInit["href"] = function(vm) {
	var aNode = vm.getOneElementByTagName("href");
	if (!!history.pushState) {
		//使用History Api封装跳转
		vm.set("$CPrivate.$Event.noreload_jump", function(e) {
			Path.jump(aNode.getAttribute("to"));
			return false;
		});
	}
};


var modulesInit = jSouper.modulesInit;

modulesInit["pagination"] = function(vm) {
	var paginationNode = vm.getOneElementByTagName("pagination");
	jSouper.onElementPropertyChange(paginationNode, "page-num", function(attr, value) {
		vm.set("_number_list", new Array(~~value));
	}, true);
	vm.set("$Private.$Event.first_page", function() {
		routie.setQuery("page", 0)
	});
	vm.set("$Private.$Event.jump_page", function(e, cvm) {
		routie.setQuery("page", cvm.get("$Index"))
	});
	vm.set("$Private.$Event.end_page", function(e, cvm) {
		routie.setQuery("page", vm.get("total_page"))
	});
	vm.set("$Private.$Event.pre_page", function() {
		routie.setQuery("page", ~~routie.getQuery("page") - 1)
	});
	vm.set("$Private.$Event.next_page", function() {
		routie.setQuery("page", ~~routie.getQuery("page") + 1)
	});
};