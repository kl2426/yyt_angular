/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-01-03 11:15:59 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-22 17:17:25
 */

'use strict';

/**
 * 预约
 */
app.controller('reservationCtrl', function($scope, $interval) {

	//   当前页面返回秒数
	$scope.countdown_time = 30;

	$scope.alert_msg = false;

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("reservationCtrl");
	if(tm.Key != "reservationCtrl") {
		tm.Key = "reservationCtrl";
		tm.keyctrl = "app.reservation";
		tm.fnAutoRefresh = function() {
			console.log("开始调用定时器");
			tm.interval = $interval(function() {
				if($scope.countdown_time > 0) {
					$scope.countdown_time = $scope.countdown_time - 1;
				} else {
					$interval.cancel(tm.interval);
					tm.interval = null;
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
		$scope.audio_list.play('audio_001');
	}
	run();

});