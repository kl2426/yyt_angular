/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:35:31 
 * @Last Modified by:   wu 
 * @Last Modified time: 2018-02-01 16:35:31 
 */
'use strict';

/**
 * 门诊费用清单
 */
app.controller('feeslistCtrl', function($scope, $interval, httpService, $filter) {

	//   当前页面返回秒数
	$scope.countdown_time = 60;

	//
	$scope.items_loadding = false;

	//  数据
	$scope.data = {
		'form': {
			startDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
			endDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
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
	}

	//   1.1.1.33.门诊病人缴费明细（处方缴费）
	var fyItemMX = function(cardNo, startDate, endDate) {
		//
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/fyItemMX/' + cardNo + '/' + startDate + '/' + endDate)
			.then(function(res) {
				//
				$scope.items_loadding = false;
				//
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						$scope.data.items = res.data.item;
					} else {
						$scope.data.items = [res.data.item];
					}
					for(var i in $scope.data.items) {
						$scope.data.items[i].index = +i + 1;
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

	//
	$scope.bhc = function() {
		$scope.data.items = [];
		$scope.data.page.row = [];
		$scope.data.page.total = 0;
		fyItemMX($scope.app.user_info.card_no, $scope.data.form.startDate, $scope.data.form.endDate);
	}

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("feeslistCtrl");
	if(tm.Key != "feeslistCtrl") {
		tm.Key = "feeslistCtrl";
		tm.keyctrl = "app.feeslist";
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
		$scope.audio_list.play('audio_018');
		//
		$scope.bhc();
	}
	run();

});