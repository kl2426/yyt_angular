/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-01-03 11:15:59 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-22 17:17:25
 */

'use strict';

/**
 * 预约挂号 选择专科名称
 */
app.controller('reservationRestimeDepartmentTransitCtrl', function($scope, $interval, httpService, $stateParams) {

	//   当前页面返回秒数
	$scope.countdown_time = 60;

	$scope.items_loadding = false;

	$scope.restime = $stateParams.restime;

	//   预约时间数字格式  用于页面显示
	$scope.restime_date = new Date($scope.restime);

	//   预约时间星期
	$scope.restime_date_week = $stateParams.restime_date_week;

	//  数据
	$scope.data = {
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

	//   取二级科室
	var deptInfoTwo = function() {
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/deptInfoTwo/' + $stateParams.hosOrgCode + '/' + $stateParams.topHosDeptCode)
			.then(function(res) {
				$scope.items_loadding = false;
				//
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						$scope.data.items = res.data.item;
					} else {
						$scope.data.items = [res.data.item];
					}
					$scope.data.page.total = $scope.data.items.length;
					//  分页
					$scope.data.page.pageFn(1);
				} else {
					$scope.data.items = [];
					$scope.data.page.total = 0;
				}
			});
	}

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("reservationRestimeDepartmentTransitCtrl");
	if(tm.Key != "reservationRestimeDepartmentTransitCtrl") {
		tm.Key = "reservationRestimeDepartmentTransitCtrl";
		tm.keyctrl = "app.reservation.restime.department.transit";
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
		//   播放声音
		$scope.audio_list.play('audio_012');
		//   取二级科室
		deptInfoTwo();
	}
	run();

});

