<% macro browser(exports_name, variable_name) %>
// AMD support
if (typeof define === 'function' && define.amd) {
	define("<$ exports_name $>", function() {
		return <$ variable_name $> ;
	});
	// CommonJS/Node.js support
} else if (typeof exports === 'object') {
	// Support Node.js specific `module.exports` (which can be a function)
	if (typeof module === 'object' && typeof module.exports === 'object') {
		exports = module.exports = <$ variable_name $> ;
	}
	// But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
	exports.<$ exports_name $> = <$ variable_name $> ;
} 
window.<$ exports_name $> = <$ variable_name $> ;
//EXPORT END
<% endmacro %>