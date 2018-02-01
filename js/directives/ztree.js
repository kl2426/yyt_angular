'use strict';

/**
 *  jQuery zTree 树 
 */
angular.module('app')
	.directive('zTree', ['httpService','$compile','$timeout', function(httpService,$compile,$timeout) {
		return {
			restrict: 'E, A, C',
			link: function(scope, element, attrs, controller) {
				
				var zNodes =[
			{ id:1, pId:0, name:"随意勾选 1", open:true},
			{ id:11, pId:1, name:"随意勾选 1-1", open:true},
			{ id:111, pId:11, name:"随意勾选 1-1-1"},
			{ id:112, pId:11, name:"随意勾选 1-1-2"},
			{ id:12, pId:1, name:"随意勾选 1-2", open:true},
			{ id:121, pId:12, name:"随意勾选 1-2-1"},
			{ id:122, pId:12, name:"随意勾选 1-2-2"},
			{ id:2, pId:0, name:"随意勾选 2", checked:true, open:true},
			{ id:21, pId:2, name:"随意勾选 2-1"},
			{ id:22, pId:2, name:"随意勾选 2-2", open:true},
			{ id:221, pId:22, name:"随意勾选 2-2-1", checked:true},
			{ id:222, pId:22, name:"随意勾选 2-2-2"},
			{ id:23, pId:2, name:"随意勾选 2-3"}
		];
		
		
		
		//   
		scope.$watch('ztree_options.data_tree',function(newValue,oldValue, scope){
			if(newValue && newValue.length > 0){
				scope.zTree = $.fn.zTree.init(element, scope.ztree_options, scope.ztree_options.data_tree);
			}
		});
		
//				//   默认参数
//				if('ztreeOptions' in attrs){
//					//监听options变化
//		            attrs.$observe('ztreeOptions', function () {
//		                var ztreeOptions = scope.$eval(attrs.ztreeOptions);
//		                if (angular.isObject(ztreeOptions)) {
//		                	//
//		                	$.fn.zTree.init(element, scope.ztree_options, zNodes);
//		                }
//		            }, true);
//				}
			}
		};
	
	}]);
	




