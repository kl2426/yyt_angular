/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-01-03 11:15:59 
 * @Last Modified by: wu
 * @Last Modified time: 2018-05-31 10:31:59
 */

'use strict';

/**
 * 预约挂号  - 医生详情
 */
app.controller('reservationRestimeDepartmentTransitRegisteredDocinfoCtrl', function($scope, $interval, httpService, $stateParams, $filter, $state, globalFn) {

	//   当前页面返回秒数
	$scope.countdown_time = 120;

	$scope.items_loadding = false;

	$scope.restime = $stateParams.restime;

	//   预约时间数字格式  用于页面显示
	$scope.restime_date = new Date($scope.restime);

	//   预约时间星期
	$scope.restime_date_week = $stateParams.restime_date_week;

	//   点击item
	$scope.docInfoItem = '';

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
				name: '下午'
			},
			{
				val: '3',
				name: '白天'
			},
			{
				val: '4',
				name: '夜晚'
			},
			{
				val: '5',
				name: '24小时'
			}
		],
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

	//   可预约号源查询
	var orderNum = function(hosOrgCode, hosDeptCode, hosDoctCode, startDate, endDate) {
		$scope.items_loadding = true;
		//  
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/orderNum/' + hosOrgCode + '/' + hosDeptCode + '/' + hosDoctCode + '/' + startDate + '/' + endDate)
			.then(function(res) {
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						res.data.item = res.data.item;
					} else {
						res.data.item = [res.data.item];
					}
					var items_arr = [];
					var temp_bol = res.data.item.length;
					for(var i in res.data.item) {
						res.data.item[i].reserveOrderNum = +res.data.item[i].reserveOrderNum;
						res.data.item[i].orderedNum = +res.data.item[i].orderedNum;
						//   加入可预约时段
						queryTime(hosOrgCode, hosDeptCode, hosDoctCode, res.data.item[i].scheduleDate, res.data.item[i].timeRange, res.data.item[i].visitLevelCode, res.data.item[i].visitLevel, res.data.item[i].scheduleId, res.data.item[i], function(obj, arr) {
							//   完成一次
							temp_bol = temp_bol - 1;
							//
							for(var b in arr) {
								var temp_item_obj = angular.copy(obj);
								//  余号
								var temp_order_arr = arr[b].number.length > 0 ? arr[b].number.split('|') : [];
								temp_item_obj.temp_order_arr = temp_order_arr;
								temp_item_obj.order_lave = temp_order_arr.length;
								angular.extend(temp_item_obj, arr[b]);
								items_arr.push(temp_item_obj);
							}
							//  最后一条
							if(temp_bol <= 0) {
								$scope.items_loadding = false;
								//
								$scope.data.items = items_arr;
								//  排序
								$scope.data.items.sort(globalFn.compare("startTime"));
								//
								$scope.data.page.total = $scope.data.items.length;
								//  分页
								$scope.data.page.pageFn(1);
							}
						});
					}
					//   无内容显示提示
					if(res.data.item.length < 1) {
						$scope.items_loadding = false;
					}

				} else {
					$scope.items_loadding = false;
					$scope.data.items = [];
					$scope.data.page.total = 0;
				}
			});
	}

	//   可预约时段查询
	var queryTime = function(hosOrgCode, hosDeptCode, hosDoctCode, scheduleDate, timeRange, visitLevelCode, visitLevel, scheduleId, obj, cb) {
		var temp_obj = {
			hosOrgCode: hosOrgCode,
			hosDeptCode: hosDeptCode,
			hosDoctCode: hosDoctCode,
			scheduleDate: scheduleDate,
			timeRange: timeRange,
			visitLevelCode: visitLevelCode,
			visitLevel: visitLevel,
			scheduleId: scheduleId,
		}
		//  
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/queryTime', temp_obj)
			.then(function(res) {
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						res.data.item = res.data.item;
					} else {
						res.data.item = [res.data.item];
					}
					typeof cb == "function" && cb(obj, res.data.item);
				} else {
					//
				}
			});
	}

	//   点击选择打开
	$scope.openHref = function(item) {
		//   item
		$scope.docInfoItem = item;
		//   打开确认页
		$state.go('app.reservation.restime.department.transit.registered.docinfo.dep');
	}

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("reservationRestimeDepartmentTransitRegisteredDocinfoCtrl");
	if(tm.Key != "reservationRestimeDepartmentTransitRegisteredDocinfoCtrl") {
		tm.Key = "reservationRestimeDepartmentTransitRegisteredDocinfoCtrl";
		tm.keyctrl = "app.reservation.restime.department.transit.registered.docinfo";
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
		//
		$scope.audio_list.play('audio_019');
		//  取医生号源
		var res_data = new Date($scope.restime);
		res_data.setDate(res_data.getDate() + 0);
		var endTime = $filter('date')(res_data, 'yyyy-MM-dd');
		//
		orderNum($stateParams.hosOrgCode, $stateParams.hosDeptCode, $stateParams.hosDoctCode, $scope.restime, endTime);
	}
	run();

});