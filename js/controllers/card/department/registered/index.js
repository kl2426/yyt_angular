/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-01-03 11:14:54 
 * @Last Modified by: wu
 * @Last Modified time: 2018-05-30 17:50:23
 */

'use strict';
/**
 * 挂号 选择医生
 */
app.controller('cardDepartmentRegisteredCtrl', function ($scope, $interval, httpService, $stateParams, $q) {

	//   当前页面返回秒数
	$scope.countdown_time = 60;
	//
	$scope.items_loadding = false;

	//   当班挂号科室名称
	$scope.deptName = $stateParams.deptName;
	$scope.deptCode = $stateParams.deptCode
	//   选中科室地址
	$scope.Dept_area = $stateParams.deptArea;

	//  数据
	$scope.data = {
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

	//   取医生
	var doctor = function() {
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/doctor/' + $scope.deptCode)
			.then(function(res) {
				// $scope.items_loadding = false;
				//
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						$scope.data.all_items = res.data.item;
					} else {
						$scope.data.all_items = [res.data.item];
					}
					for(var i in $scope.data.all_items) {
						$scope.data.all_items[i].deptName = $scope.deptName;
					}

					//   取医生当班信息
					var arr_promise = [];
					for (var i in $scope.data.all_items) {
						var temp_promise = schedul($scope.data.all_items[i]);
						arr_promise.push(temp_promise);
					}
					//  全部结束
					$q.all(arr_promise).then(function (res_promise) {
						//
						$scope.items_loadding = false;
						//  加入res
						for (var i in $scope.data.all_items) {
							$scope.data.all_items[i].res_schedul = res_promise[i];
						}
						//  删除所有无排班信息的医生对象
						$scope.data.all_items = angular.copy($scope.data.all_items).filter(function (item) {
							//
							if (item.res_schedul.succeed) {
								//
								var temp_arr = [];
								if (item.res_schedul.data.item.__proto__.constructor == Array) {
									temp_arr = item.res_schedul.data.item;
								} else {
									temp_arr = [item.res_schedul.data.item];
								}
								//  查询 是否全部
								for (var b in temp_arr) {
									//	是否停诊 0:停诊(不可用) 1:未停诊(可用)
									if (temp_arr[b].is_vary != 0) {
										//  未停诊
										return true;
									}
								}
								// 停诊
								return false;
							} else {
								// 停诊
								return false;
							}
						});

						//
						$scope.data.items = $scope.data.all_items;
						//
						$scope.data.page.total = $scope.data.items.length;
						//  分页
						$scope.data.page.pageFn(1);

					});

				} else {
					$scope.items_loadding = false;
					$scope.data.items = [];
					$scope.data.page.total = 0;
				}
			});
	}

	//   取医生当班信息
	var schedul = function (item) {
		//	$scope.items_loadding = true;
		//  
		return httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/schedul/' + item.doct_code + '/' + $scope.deptCode);
			
	}

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("cardDepartmentRegisteredCtrl");
	if(tm.Key != "cardDepartmentRegisteredCtrl") {
		tm.Key = "cardDepartmentRegisteredCtrl";
		tm.keyctrl = "app.card.department.registered";
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
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_016');
		//  取医生
		doctor();
	}
	run();

});