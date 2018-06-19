/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:35:49 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-08 14:12:22
 */
'use strict';

/**
 *  维护人员相关界面 - 凭条补打
 */
app.controller('modalMaintainReceiptCtrl', function($scope, $interval, $modal, $modalInstance, items, $filter, httpService, $timeout) {

	$scope.items = items;

	$scope.items_loadding = false;

	//  数据
	$scope.data = {
		checked_items: [],
		//
		'form': {
			'regDate': ''
		},
		'items': [],
		//   对items 数据进行分页
		'page': {
			pageIndex: 1,
			pageSize: 8,
			total: 0,
			row: [],
			//   分页初始化
			pageFn: function(index) {
				if($scope.data.page.total > (index - 1) * $scope.data.page.pageSize) {
					$scope.data.page.row = $scope.data.items.slice((index - 1) * $scope.data.page.pageSize, $scope.data.page.pageSize * index);
					$scope.data.page.pageIndex = index;
				} else {
					$scope.data.page.row = $scope.data.items.slice(0, $scope.data.page.pageSize * index);
					$scope.data.page.pageIndex = 1;
				}
			}
		}
	};

	$scope.chekced_click = function(item) {
		for(var i in $scope.data.items) {
			$scope.data.items[i].checked = false;
		}
		item.checked = !item.checked;
	};

	//   取打印日志
	var ticketPrint = function(cardNo, patientID, regDate) {
		$scope.items_loadding = true;
		//
		httpService.adminAjaxGet(httpService.API.href + '/api/yytBase/v1/ticketPrint/' + cardNo + '/' + patientID + '/' + regDate)
			.then(function(res) {
				$scope.items_loadding = false;
				//
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						$scope.data.items = res.data.item;
					} else {
						$scope.data.items = [res.data.item];
					}
					//  序号
					for(var i in $scope.data.items) {
						$scope.data.items[i].index = +i + 1;
					}
					//
					$scope.data.page.total = $scope.data.items.length;
					//  分页
					$scope.data.page.pageFn(1);
				} else {
					$scope.data.items = [];
					$scope.data.page.row = [];
					$scope.data.page.total = 0;
				}
			});
	};

	//   取号
	$scope.outMark = function() {
		//
		var temp_item = null;
		for(var i in $scope.data.items) {
			if($scope.data.items[i].checked) {
				temp_item = $scope.data.items[i];
				break;
			}
		}
		//
		if(temp_item) {
			//    开始打印
			window.terminal && window.terminal.PrintReceipt(temp_item.print, '', '');
		}
	};

	//   打印完成回调
	terminal_device.print_receipt.cb_print_receipt = function(res_Status, res_str) {
		if(res_Status == '0') {
			//  正常打印  设置
			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('1');
			//  5秒关闭
			$timeout(function() {
				window.terminal && window.terminal.JSCloseTwinkleLED('1');
			}, 5000);
			//
		} else if(res_Status == '99') {
			//   打开打印错误弹窗
			$scope.items.scope.systemError(res_str);
		} else {
			//  打印异常
			//  提交失败
			$scope.items.scope.systemError(res_str);
		}
	};

	//
	$scope.ok = function() {
		$modalInstance.close('ok');
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
	
	//
	$scope.bhc = function() {
		$scope.data.items = [];
		$scope.data.page.row = [];
		$scope.data.page.total = 0;
		ticketPrint($scope.items.scope.app.user_info.card_no, $scope.items.scope.app.user_info.PatientID, $scope.data.form.regDate);
	};

	//  run
	var run = function() {
		//
		var regDate = $filter('date')(new Date(), 'yyyy-MM-dd');
		$scope.data.form.regDate = regDate;
		//
		$scope.bhc();
	};

	run();

});