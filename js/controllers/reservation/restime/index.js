/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-01-03 11:15:59 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-22 17:17:25
 */

'use strict';

/**
 * 预约挂号  预约时间段
 */
app.controller('reservationRestimeCtrl', function($scope, $interval, httpService, $stateParams, $filter) {

	//   当前页面返回秒数
	$scope.countdown_time = 30;

	$scope.alert_msg = false;

	//  数据
	$scope.data = {
		//   日期
		'date_week': [],
		//  all
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

	//   加入本周日期
	var weekday = new Array(7);
	weekday[0] = "星期天";
	weekday[1] = "星期一";
	weekday[2] = "星期二";
	weekday[3] = "星期三";
	weekday[4] = "星期四";
	weekday[5] = "星期五";
	weekday[6] = "星期六";
	//   取服务器时间
	var new_date = new Date();
	for(var i = 0; i < 7; i++) {
		new_date.setDate(new_date.getDate() + 1);
		var temp_date_val = $filter('date')(new_date, 'yyyy-MM-dd');
		var temp_date = $filter('date')(new_date, 'yyyy年MM月dd日');
		var zhou = weekday[new_date.getDay()];
		$scope.data.date_week.push({
			val: temp_date_val,
			date: temp_date,
			week: zhou
		});
	}

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("reservationRestimeCtrl");
	if(tm.Key != "reservationRestimeCtrl") {
		tm.Key = "reservationRestimeCtrl";
		tm.keyctrl = "app.reservation.restime";
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
		$scope.audio_list.play('audio_005');
	}
	run();

});

