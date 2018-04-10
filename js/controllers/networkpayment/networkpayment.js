/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:36:20 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-01 15:37:07
 */
'use strict';

/**
 * 取网络缴费凭条
 */
app.controller('networkpaymentCtrl', function($scope, $interval, $timeout, $filter, httpService) {

	//   当前页面返回秒数
	$scope.countdown_time = 60;

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("networkpaymentCtrl");
	if(tm.Key != "networkpaymentCtrl") {
		tm.Key = "networkpaymentCtrl";
		tm.keyctrl = "app.networkpayment";
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

	}
	run();

});