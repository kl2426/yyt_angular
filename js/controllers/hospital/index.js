/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:35:41 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-21 10:56:05
 */

'use strict';
/**
 * 住院清单
 */
app.controller('hospitalCtrl', function($scope, $interval, httpService, $filter) {

	//   当前页面返回秒数
	$scope.countdown_time =30;

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("hospitalCtrl");
	if(tm.Key != "hospitalCtrl") {
		tm.Key = "hospitalCtrl";
		tm.keyctrl = "app.hospital";
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
			$scope.countdown_time = 30;
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
		$scope.audio_list.play('audio_001');
	}
	run();

});
