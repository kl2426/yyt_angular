/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:33:43 
 * @Last Modified by: wu
 * @Last Modified time: 2018-02-28 11:23:43
 */
'use strict';

/**
 * 发药取号 药品明细
 */
app.controller('medicineInfoCtrl', function($scope, $interval, httpService, $filter, $timeout, $stateParams, $q, $http) {

	//   当前页面返回秒数
	$scope.countdown_time = 360;

	//   
	$scope.PrescRecordID = $stateParams.PrescRecordID;

	//  btn 是否可以点击
	$scope.show_btn = false;
	$scope.title_btn = '数据读取中';

	//  数据
	$scope.data = {
		//   处方
		'PrescRecord': [],
		//
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

	//   获取处方明细
	var cFMX = function(cardNo, prescRecordID) {
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/cFMX', {
				cardNo: cardNo,
				prescRecordID: prescRecordID
			})
			.then(function(res) {
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						$scope.data.items = res.data.item;
					} else {
						$scope.data.items = [res.data.item];
					}
					//   加入序号
					for(var i in $scope.data.items) {
						$scope.data.items[i].index = +i + 1;
					}
					$scope.data.page.total = $scope.data.items.length;
					//  分页
					$scope.data.page.pageFn(1);
					//  验证发药窗口号
					hasWindwFn(angular.copy($scope.data.items));
				} else {
					// 
					$scope.data.items = [];
					$scope.data.page.total = 0;
				}
			});
	}

	//   验证全部明细 是否有发药窗口号
	//   重发次数
	var resend = 3;
	//   返回结果级
	$scope.res_getWindowNo = [];
	var hasWindwFn = function(items) {
		//   清空
		$scope.res_getWindowNo = [];
		//
		var deferred_arr = [];
		//  计数
		var item_index = items.length;
		//
		for(var i in items) {
			var temp_promise = getWindowNo(items[i].MedID, items[i]);
			deferred_arr.push(temp_promise);
			temp_promise[1].then(function(res) {
				item_index = item_index - 1;
				if(res.succeed == false && res.message && res.message == 'timeout') {
					stopAll();
					resend = resend - 1;
					if(resend > 0) {
						hasWindwFn(items);
					}
				} else if(res.succeed == true) {
					//   添加窗口号
					var temp_obj = res.temp_item;
					temp_obj.medicine_WindowNO = res.data.WindowNO;
					$scope.res_getWindowNo.push(temp_obj);
				} else if(res.succeed == false && res.resultMessage == '药品没有发药') {
					//   添加窗口号为空
					var temp_obj = res.temp_item;
					temp_obj.medicine_WindowNO = '';
					$scope.res_getWindowNo.push(temp_obj);
				}
				//   从计数得到最后一条
				if(item_index == 0) {
					//  最后一条
					$scope.data.items = $scope.res_getWindowNo;
					//  btn 设置 可以点击 
					$scope.show_btn = true;
					$scope.title_btn = '取号领药';
				}
			});
		}
		//  取消所有请求
		var stopAll = function() {
			for(var i = 0; i < deferred_arr.length; i++) {
				deferred_arr[i][0].reject('Service error ');
			}
		}

	}

	/**
	 * 取发药窗口号
	 * @param {Object} medID
	 * @return [] array  数组  
	 */
	var getWindowNo = function(medID, item) {
		//
		var deferred = $q.defer();
		$http({
				url: httpService.API.href + '/api/yytBase/v1/getWindowNo/' + medID,
				method: "GET",
				//  params: params,
				timeout: httpService.TIME_OUT,
			})
			.success(function(data, status, headers, config) {
				data.temp_item = item;
				deferred.resolve(data);
			})
			.error(function(data, status, headers, config) {
				//  处理超时与错误
				var temp_obj = angular.copy(httpService.ERROR_OBJ);
				temp_obj.message = status;
				deferred.resolve(temp_obj);
				//  deferred.reject('Service error ');
			})
		return [deferred, deferred.promise];
	}

	//   取号领药
	$scope.medicine = function() {
		//
		$scope.show_btn = false;
		//   取窗口号
		//getWindowNo();
		var temp_arr = angular.copy($scope.data.items);
		//  筛选无窗口号数组
		var temp_items = [];
		for(var i in temp_arr) {
			if(temp_arr[i].medicine_WindowNO === '') {
				//   去掉 medicine_WindowNO 属性
				temp_arr[i].medicine_WindowNO = undefined;
				temp_items.push(temp_arr[i]);
			}
		}
		//
		temp_items = JSON.parse(JSON.stringify(temp_items));
		//   调用发药机发药
		window.terminal && window.terminal.PrintReceipt(JSON.stringify(temp_items));
	}

	//    取发药凭条
	var fyPrint = function(windowNO) {
		//
		var temp_obj = {
			cardNo: $scope.app.user_info.card_no,
			patName: $scope.app.user_info.PatName,
			patientID: $scope.app.user_info.PatientID,
			prescRecordID: $scope.PrescRecordID,
			visitDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
			//    加入科室地址
			detailed: JSON.stringify([{
				'floor_name': '',
				'windowNo': windowNO
			}])
		}

		// log
		window.terminal && window.terminal.WriteLog('rq /api/yytMace/v1/fyPrint:' + JSON.stringify(temp_obj));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/fyPrint', temp_obj)
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytMace/v1/fyPrint:' + JSON.stringify(res));
				if(res.succeed) {
					//    开始打印
					window.terminal && window.terminal.PrintReceipt(res.data.print.toString(), '', '');
				} else {
					//   预约失败
					$scope.systemError('凭条打印失败请与工作人员联系');
					$scope.locationBk();
				}
			});
	}

	//   取药回调
	terminal_device.medicine.cb_medicine = function(res_Status, res_str) {
		//alert('取药回调')
		if(res_Status == 0) {
			alert('发药成功：' + res_str);
			//  取打印凭条 打印
			fyPrint(res_str);
		} else {
			alert('发药失败');
			$scope.systemError('发药失败');
		}
	}

	//   打印完成回调
	terminal_device.print_receipt.cb_print_receipt = function(res_Status, res_str) {
		//alert('打印完成回调')
		if(res_Status == '0') {
			//  正常打印  设置
			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('1');
			//  5秒关闭
			$timeout(function() {
				window.terminal && window.terminal.JSCloseTwinkleLED('1');
			}, 5000);

			//   
			alert('请取走您的凭条');

			//   返回上一级
			$scope.locationBk();

		} else if(res_Status == '99') {
			//   打开打印错误弹窗
			$scope.modelOpenPrintError(res_str);
		} else {
			//  打印异常
			alert('打印异常');
			$scope.systemError('打印异常');
		}
	}

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("medicineInfoCtrl");
	if(tm.Key != "medicineInfoCtrl") {
		tm.Key = "medicineInfoCtrl";
		tm.keyctrl = "app.medicine.info";
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
		//		$scope.audio_list.play('audio_004');

		//   取处方明细
		cFMX($scope.app.user_info.card_no, $scope.PrescRecordID);
	}
	run();

});