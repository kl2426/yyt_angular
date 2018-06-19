/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:35:49 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-08 14:12:22
 */
'use strict';

/**
 *  维护人员相关界面 - 加卡
 */
app.controller('modalMaintainAddCardCtrl', function($scope, $interval, $modal, $modalInstance, items, $timeout, httpService, opCookie) {

	$scope.items = items;

	//   弹窗信息
	$scope.form = {
		//
		residueNum: '',
		//
		count: '',
		//
		tips_msg: ''
	};

	//	获取余卡数量
	var getCardCount = function(terminalNo) {
		httpService.adminAjaxGet(httpService.API.href + '/api/yytBack/v1/getResidueNum/' + terminalNo)
			.then(function(res) {
				if(res.succeed) {
					$scope.form.residueNum = res.data.residueNum;
				}
			});
	};

	$scope.form_name = 'count';
	//   点击取dom
	$scope.bindName = function(form_name) {
		$scope.form_name = form_name;
	};

	//   数字键盘按下
	$scope.keyb = function(str) {
		if(str == 'backspace') {
			if($scope.form[$scope.form_name].length > 0) {
				$scope.form[$scope.form_name] = $scope.form[$scope.form_name].substr(0, $scope.form[$scope.form_name].length - 1);
			}
		} else if(str == 'delete') {
			$scope.form[$scope.form_name] = '';
		} else if(/[0-9]/.test(str)) {
			if($scope.form[$scope.form_name].length < 4) {
				$scope.form[$scope.form_name] = $scope.form[$scope.form_name] + str.toString();
			}
		}
	};

	//  加卡
	$scope.addCard = function() {
		//
		if($scope.form.count == '') return;
		//	计算诊疗卡数量	总量 150张
		var cardNums = parseInt($scope.form.residueNum) + parseInt($scope.form.count);
		var count_max = 150 - parseInt($scope.form.residueNum);

		if(cardNums > 150) {
			$scope.form.tips_msg = '请放入少于' + count_max + '张';
			$scope.form.count = '';
		} else {
			$scope.form.tips_msg = '';

			var temp_obj = {
				terminalNo: $scope.items.scope.app.device_info.user.terminalNo,
				cardNums: cardNums
			};

			httpService.adminAjaxPost(httpService.API.href + '/api/yytBack/v1/updateByCard', temp_obj)
				.then(function(res) {
					if(res.succeed) {
						//
						getCardCount($scope.items.scope.app.device_info.user.terminalNo);
						//
						$scope.form.count = '';
					} else {
						//	alert('诊疗卡数量更新失败：请与维护人员联系！');
					}
				});
		}

	};

	//
	$scope.ok = function() {
		$modalInstance.close('ok');
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

	//  run
	var run = function() {
		//	设备编码
		var terminalNo = $scope.items.scope.app.device_info.user.terminalNo;
		getCardCount(terminalNo);
	};

	run();
});