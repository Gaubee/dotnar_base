require(['common', 'coAjax'], function(common, coAjax) {
	/**
		全国地区选中
	**/
	;
	(function() {
		//选中城市初始化
		coAjax.get(appConfig.other.get_city + "1", function(result) {
			App.set("city_list", result.result);
		});
		//绑定事件，选择省后
		App.set("$Event.province", function(e, vm) {
			var id = $(this).find('option:selected').attr('rel');
			select_xz(id, 'city', '请选择市');
			if (id > 0) $('[name="city"]').prop('disabled', false);
			else $('[name="city"]').prop('disabled', true);
			$('[name="area"]').empty();
			$("<option value='0'>请选择地区</option>").appendTo('[name="area"]');
			$('[name="area"]').prop('disabled', true);
		});
		//选择市后
		App.set("$Event.city", function() {
			var id = $(this).find('option:selected').attr('rel');
			select_xz(id, 'area', '请选择地区');
			if (id > 0) $('[name="area"]').prop('disabled', false);
			else $('[name="area"]').prop('disabled', true);
		});

		//地区选中函数
		function select_xz(id, name, title) { //id>后台数据id， name=>下拉框name值,titel=>下拉列表首选项
			coAjax.get(appConfig.other.get_city + id, function(data) {
				var _ab = JSON.parse(data.toString);
				$('[name="' + name + '"]').empty();
				$("<option value='0'>" + title + "</option>").appendTo('[name="' + name + '"]');
				var city_pinyin = ["beijing", "anhui", "fujian", "gansu", "guangdong", "guangxi", "guizhou", "hainan", "hebei", "henan", "heilongjiang", "hubei", "hunan", "jilin", "jiangsu", "jiangxi", "liaoning", "neimenggu", "ningxia", "qinghai", "shandong", "shanxi", "shanxi", "shanghai", "sichuan", "tianjin", "xicang", "xinjiang", "yunnan", "zhejiang", "zhongqing", "xianggang", "aomen", "taiwan"];
				var py;
				if (id > 0) {
					for (i in _ab) {
						if (id == 1) py = city_pinyin[i];
						else py = _ab[i].region_name;
						$("<option value='" + py + "' rel='" + _ab[i].region_id + "'>" + _ab[i].region_name + "</option>").appendTo('[name="' + name + '"]');
					}
				}
			});
		}
	}());
})