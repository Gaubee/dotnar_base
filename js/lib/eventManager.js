//
/*
 * 事件管理器
 */
(function() {
	var _eventCache = {};
	var _eventMap = {};
	var eventManager = {
		is: function(check_obj, eventName, handle, rejectHandle) {
			if (check_obj) {
				handle();
			} else {
				eventManager.on(eventName, handle, rejectHandle);
			}
		},
		on: function(eventName, handle, rejectHandle) {
			var eventList = _eventCache[eventName] || (_eventCache[eventName] = []);
			var _id = Math.random().toString(36).substring(2);
			eventList.push(_eventMap[_id] = {
				_id: _id,
				handle: handle,
				rejectHandle: rejectHandle
			});
			return _id;
		},
		off: function(eventName, _id) {
			if (arguments.length === 1) {
				_id = eventName;
				var eventObj = _eventMap[_id];
				eventObj.handle = null;
			} else if (_eventCache.hasOwnProperty(eventName)) {
				var eventList = _eventCache[eventName];
				for (var i = 0, eventObj; eventObj = eventList[i]; i += 1) {
					if (eventObj._id == _id) {
						eventObj.handle = null;
						eventObj.rejectHandle = null;
					}
				}
			}
		},
		once: function(eventName, handle, rejectHandle) {
			var _id = eventManager.on.call(this, eventName, function() {
				eventManager.off(_id);
				handle.apply(this, arguments);
			}, rejectHandle);
		},
		fire: function(eventName) {
			var args = Array.prototype.slice.call(arguments, 1);
			if (_eventCache.hasOwnProperty(eventName)) {
				var eventList = _eventCache[eventName];
				for (var i = 0, eventObj; eventObj = eventList[i]; i += 1) {
					eventObj.handle && eventObj.handle.apply(eventObj, args);
				}
			}
		},
		reject: function(eventName) {
			if (_eventCache.hasOwnProperty(eventName)) {
				var eventList = _eventCache[eventName];
				var args = Array.prototype.slice.call(arguments);
				for (var i = 0, eventObj; eventObj = eventList[i]; i += 1) {
					eventObj.rejectHandle && eventObj.rejectHandle.apply(eventObj, args);
				}
			}
		},
		clear: function(eventName) {
			if (_eventCache.hasOwnProperty(eventName)) {
				var eventList = _eventCache[eventName];
				for (var i = 0, eventObj; eventObj = eventList[i]; i += 1) {
					_eventMap[eventObj._id] = null;
				}
				eventList.length = 0;
			}
		}
	};
	eventManager.emit = eventManager.fire;
	eventManager._eventCache = _eventCache;
	eventManager._eventMap = _eventMap;

	//Nunjucks <% import "js/lib/exports.js" as exports %>
	//Nunjucks <$ exports.browser("eventManager", "eventManager") $>
}());