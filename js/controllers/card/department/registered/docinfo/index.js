/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-01-03 11:14:54 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-22 17:01:11
 */

'use strict';
/**
 * 挂号  医生当班信息
 */
app.controller('cardDepartmentRegisteredDocinfoCtrl', function($scope, $interval, httpService, $stateParams, globalFn) {

	//   当前页面返回秒数
	$scope.countdown_time = 60;

	$scope.items_loadding = false;

	//   转科名称
	$scope.deptName = $stateParams.deptName;
	$scope.doct_name = $stateParams.doct_name;

	//  数据
	$scope.data = {
		//  上午下午
		'am_pm': [{
				val: '1',
				name: '上午',
				checked: true
			},
			{
				val: '2',
				name: '下午',
				checked: true
			},
			{
				val: '3',
				name: '白天',
				checked: true
			},
			{
				val: '4',
				name: '夜晚',
				checked: true
			},
			{
				val: '5',
				name: '24小时',
				checked: true
			}
		],
		//	二维码信息
		'pic_base64': '',
		//  all
		'all_items': [],
		//  当前
		'items': [],
		//   对items 数据进行分页
		'page': {
			pageIndex: 1,
			pageSize: 12,
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
	}

	//   筛选时段
	var seAmPm = function() {
		//
		$scope.items_loadding = false;
		//
		if(new Date().getHours() < 12) {
			//  上午
		} else if(new Date().getHours() < 18) {
			//   下午
			$scope.data.am_pm[0].checked = false;
		} else {
			//  其他时间
			$scope.data.am_pm[0].checked = false;
			$scope.data.am_pm[1].checked = false;
		}
		//
		$scope.data.items = [];
		//
		for(var i in $scope.data.all_items) {
			for(var b in $scope.data.am_pm) {
				if($scope.data.am_pm[b].checked && $scope.data.am_pm[b].val == $scope.data.all_items[i].am_pm) {
					//   在当时间段 可以显示
					$scope.data.all_items[i].ampm_show = true;
				}
			}
		}
		//   都显示出来
		$scope.data.items = $scope.data.all_items;
		//  
		$scope.data.page.total = $scope.data.items.length;
		//  分页
		$scope.data.page.pageFn(1);

	}

	//   取医生当班信息
	var schedul = function() {
		$scope.items_loadding = true;
		//  
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/schedul/' + $stateParams.doctorCode + '/' + $stateParams.deptCode)
			.then(function(res) {
				//
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						$scope.data.all_items = res.data.item;
					} else {
						$scope.data.all_items = [res.data.item];
					}
					//   加入 科名 医生名
					for(var i in $scope.data.all_items) {
						$scope.data.all_items[i].deptName = $scope.deptName;
						$scope.data.all_items[i].doct_name = $scope.doct_name;
						//   计算 金额
						$scope.data.all_items[i].sumMoney = +$scope.data.all_items[i].clinic_fee + +$scope.data.all_items[i].register_fee;
					}
					//  排序  按上午下午排序
					$scope.data.all_items.sort(globalFn.compare("clinic_time_start"));

					//   筛选时段
					seAmPm();

				} else {
					$scope.data.all_items = [];
					$scope.items_loadding = false;
				}
			});
	}

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("cardDepartmentRegisteredDocinfoCtrl");
	if(tm.Key != "cardDepartmentRegisteredDocinfoCtrl") {
		tm.Key = "cardDepartmentRegisteredDocinfoCtrl";
		tm.keyctrl = "app.card.department.registered.docinfo";
		tm.fnAutoRefresh = function() {
			console.log("开始调用定时器");
			tm.interval = $interval(function() {
				if($scope.countdown_time > 0) {
					$scope.countdown_time = $scope.countdown_time - 1;
				} else {
					$interval.cancel(tm.interval);
					tm.interval = null;
					//$scope.countdown_time = 20;
					//   返回上一级
					$scope.locationBk();
				}
			}, 1000);
		};
		tm.fnStopAutoRefresh = function() {
			$scope.countdown_time = 60;
			console.log("进入取消方法");
			if(tm.interval != null) {
				$interval.cancel(tm.interval);
				tm.interval = null;
				console.log("进入取消成功");
			}
			tm.interval = null;
		};
		$scope.setglobaldata.addtimer(tm);
	}
	//结束定义定时器

	tm.fnAutoRefreshfn(tm);

	var run = function() {
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_019');
		//  
		schedul();
	}
	run();

});