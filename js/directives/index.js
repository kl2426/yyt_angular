/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:37:22 
 * @Last Modified by:   wu 
 * @Last Modified time: 2018-02-01 16:37:22 
 */
'use strict';

/**
 * 弹窗拖动
 */
angular.module('app').directive('modalMove', ['$timeout', '$document', function($timeout, $document) {
	function link(scope, element, attr) {
		//   延迟生成dom
		var timer = $timeout(function() {
			//
			var dialog = element.parents(".modal-dialog");
			var dialogHeight = dialog.height();
			var wHeight = jQuery(window).height();
			var wWidth = jQuery(window).width();
			var header = dialog.find(".g-modal-header");
			//   弹窗居中
			if(dialogHeight < wHeight) {
				dialog.css("margin-top", (wHeight - dialogHeight) / 2);
			}
			//
			var startX = 0,
				startY = 0,
				x = 0,
				y = 0;
			//
			header.css({
				position: 'relative',
				cursor: 'move'
			});
			//
			header.on('mousedown', function(event) {
				// Prevent default dragging of selected content
				event.preventDefault();
				startX = event.pageX - x;
				startY = event.pageY - y;
				$document.on('mousemove', mousemove);
				$document.on('mouseup', mouseup);
			});

			function mousemove(event) {
				y = event.pageY - startY;
				x = event.pageX - startX;
				//   不超过屏幕
				if(event.pageY > 0 && event.pageX > 0 && event.pageX < wWidth && event.pageY < wHeight) {
					dialog.css({
						top: y + 'px',
						left: x + 'px'
					});
				}
			}

			function mouseup() {
				$document.off('mousemove', mousemove);
				$document.off('mouseup', mouseup);
			}

		}, 50);
	};
	return {
		restrict: 'A',
		link: link
	};
}]);

/**
 * 提示音
 */
angular.module('app').directive('audioList', ['$timeout', '$document', function($timeout, $document) {
	function link(scope, element, attr) {
		var data_array = JSON.parse(attr.audioData);
		var ele = $(element[0]);
		console.log(data_array);
		for(var i in data_array) {
			var dom_li = $('<li><h4>' + data_array[i].name + '</h4><audio id="' + data_array[i].id + '" controls><source type="audio/ogg"></audio></li>');
			dom_li.find('source').attr('src', data_array[i].src);
			ele.append(dom_li);
		}
	};
	return {
		restrict: 'A',
		link: link
	};
}]);

/**
 * lay 时间日期选择器
 */
angular.module('app').directive('layDate', ['$timeout', '$document', function($timeout, $document) {
	function link(scope, element, attr) {
		//
		var setScope = function(val) {
			var data_str = attr.scope;
			data_str = attr.scope ? attr.scope.split('.') : [];
			if(data_str.length == 1) {
				scope[data_str[0]] = val;
			} else if(data_str.length == 2) {
				scope[data_str[0]][data_str[1]] = val;
			} else if(data_str.length == 3) {
				scope[data_str[0]][data_str[1]][data_str[2]] = val;
			}
		}
		//
		var laytype = attr.laytype;
		//  时间选择器
		laydate.render({
			elem: element[0],
			// format: 'yyyy年MM月dd日',
			type: laytype ? laytype : 'date',
			done: function(value, date, endDate) {
				scope.$apply(function() {
					setScope(value);
				});
				scope.bhc();
			}
		});
	};
	return {
		restrict: 'A',
		link: link
	};
}]);