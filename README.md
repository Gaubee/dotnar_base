# 点纳微站开发工具包

## 实现介绍
与旧版的前端开发框架类似，通用库都在[lib.dotnar.com](http://lib.dotnar.com)来加载从而实现共享资源与缓存。

不同的是，加载器我们依旧使用了requirejs。并且将版本更新提高到框架级别，意味着这些将自动化实现。

还有还是用jQuery，而不是Zepto什么的，别问我为什么，有缓存系统就是任性。

另外，常用的方法，比如coAjax、QueryString、eventManager等都已经暴露到全局无需require直接使用。

## API

### 文件变量
* __pathname__ 文件相对于项目根目录的路径
* __filename__ 文件全名
* __extname__ 文件后缀名
* __basename__ 文件名，无后缀
* __dotnar_lib_base_url__ 公用lib域
* __location_origin_url__ 当前域
对于 `__dotnar_lib_base_url__`、 `__location_origin_url__` 在CSS中的用法是：不要再CSS中写相对地址，我们采用了编译的方案对待CSS，所以提供了这些变量让你使用绝对地址

### Path
#### Path.on(pathname, handle)
注册一个事件，根据URL-pathname进行触发

#### Path.once(pathname, handle)
一次性事件

> 这里事件注册的pathname是可以转义成正则进行匹配的。比如`*`，在比如`user/:page`，这里page参数可以在handle函数中用`this.params.page来取出`。
> pathname也可以是数组，从而进行更广的匹配；

#### Path.emit(pathname[, args])
直接根据事件名触发事件，这里emit一般交由系统触发，开发者无需使用

#### Path.jump(href)
跳转，如果支持History Api，会使用Ajax实现页面的加载与渲染

#### Path.getQuery(key)
解析并获取location.search中的数据

#### Path.setQuery(key[, value])
改变或者删除location.search中的数据，并使用`Path.jump`进行跳转

### QueryString
```js
qs = QueryString();
qs.set("id", "1");
qs.get("id"); //1
qs.toString(); //"http://d1.dev-dotnar.com?id=1"
```
但如果你要支持操作location上的参数，请使用`Path.setQuery/getQuery`。

### eventManager
以下接口请根据名字断章取义即可知道用途

#### eventManager.is

#### eventManager.on

#### eventManager.off

#### eventManager.once

#### eventManager.emit

#### eventManager.reject

#### eventManager.clear

### coAjax
这个模块基础的就是GET、POST、PUT、DELETE四种方法，如果你需要使用HTML5的API：`progress`，请这样用：
```js
coAjax.get(url, cb).on("progress",fun);
```

### confirm / alert
对话框模块已经被重写成可兼容异步的回调模式，如果你需要使用原生写法，他们已经被改名为：`native_alert/native_confirm`。

#### alert( [type ,] alert_str)

#### confirm(str [, true_cb [, false_cb]])

### PageLoading
这个模块是两个全局函数，用于显示或隐藏最高层级的Loading动画

#### openPageLoading
#### closePageLoading

## jSouperHandle
这个模块是基于前端模板框架做的拓展指令

### #Time(data_time, format)
一个用于格式化时间的指令。比如：
```html
{{#Time "2015-11-11"," LT"}}
<!-- 输出：“3个月内 凌晨12点00” -->
```
format的详细用法，查看(Moment.js)[http://momentjs.com/]

### #Time_MH(time)
用于格式化`小时：分钟`，比如：
```html
{{#Time_MH "0009:0"}}
<!-- 输出：“9:00” -->
```

### #Fixed(number, fixed_num)
用于格式化数据，比如：
```html
{{#Fixed 0.1111, 2}}
<!-- 输出：“0.11” -->
```

### #Int(number)
用于格式化数据，比如：
```html
{{#Int 1.1}}
<!-- 输出：“1” -->
{{#Int "0xf"}}
<!-- 输出：“15” -->
```

### setTitle
用于改变当前页面的document.title的值，效果等同于：`document.title = "title";`，比如：
这个指令是为通过异步加载而来的页面无法在HTML上声明title而创建的。
```html
{{setTitle $Cache.my_title||"呵呵"}}
<script type="text/vm">
	function vm () {
		setInterval(function () {
			App.set("$Cache.my_title", String(new Date))
		}, 1000)
	}
</script>
```
注意：每个setTitle在不同的页面中都是独立运作的，当页面发送改变，App.set不会再改变document.title。而是交由现在这个页面的setTitle指令来管理

### useCss(css_link_src)
用于动态加载CSS文件，类似link标签，但是加载来的文件会通过编译。
和link标签一样，你可以通过改变`css_link_src`来移除和添加样式文件，在页面发送跳转后，样式也会自动移除，不会在多个页面中造成冲突。
```html
{{useCss $Cache.my_css||"css/test1.css"}}
<script type="text/vm">
	function vm () {
		i = 0;
		setInterval(function () {
			i += 1;
			App.set("$Cache.my_css", i % 2 ? "css/test1.css": "css/test2.css")
		}, 1000)
	}
</script>
```

## jSouperCustomTag
这个模块是基于前端模板框架做的拓展标签库

### href[to = ajax_page]
这是一个类似`a`标签的标签，但是他的跳转是基于HTML5-HISTORY-API的跳转，已经实现了一整套的封装，和重载跳转的效果无异，但是速度提供了更好的体验。
```html
<href to="main.html">首页</href>
```
