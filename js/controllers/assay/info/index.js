/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:34:37 
 * @Last Modified by: wu
 * @Last Modified time: 2018-02-01 16:42:05
 */
'use strict';

/**
 * 挂号记录 - 就诊详情
 */
app.controller('assayInfoCtrl', function($scope, $interval, httpService, $filter, $stateParams, $timeout) {

	//   当前页面返回秒数
	$scope.countdown_time = 60;
	//
	$scope.items_loadding = false;

	//  报告单号
	$scope.assay_no = $stateParams.assay_no;

	//  数据
	$scope.data = {
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

	//   检验小项
	var Item = function(patientId) {
		//
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/Item/' + patientId)
			.then(function(res) {
				//
				$scope.items_loadding = false;
				//
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						res.data.item = res.data.item;
					} else {
						res.data.item = [res.data.item];
					}
					//  
					for(var i in res.data.item) {
						if(res.data.item[i].test_no == $scope.assay_no) {
							$scope.data.items.push(res.data.item[i]);
						}
					}
					//   加入序号
					for(var i in $scope.data.items) {
						$scope.data.items[i].index = +i + 1;
					}
					//  分页
					$scope.data.page.total = $scope.data.items.length;
					$scope.data.page.pageFn(1);
				} else {
					$scope.data.items = [];
					$scope.data.page.total = 0;
				}
			});
	}

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("assayInfoCtrl");
	if(tm.Key != "assayInfoCtrl") {
		tm.Key = "assayInfoCtrl";
		tm.keyctrl = "app.assay.info";
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
		//$scope.audio_list.play('audio_015');
		//   
		Item($scope.assay_no);
	}
	run();

});