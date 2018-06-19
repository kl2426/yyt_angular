/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:35:41 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-21 10:56:05
 */

'use strict';
/**
 * 住院清单   总清单
 */
app.controller('hospitalTotalInfoCtrl', function($scope, $interval, httpService, $filter, $timeout, $stateParams, $state) {

	//   当前页面返回秒数
	$scope.countdown_time = 240;

	$scope.btn_title = '打印总清单';
	$scope.btn_show = true;

	//
	$scope.items_loadding = false;

	$scope.inp_no = $stateParams.inp_no;

	//
	$scope.PatientID = $stateParams.PatientID;
	//
	$scope.Times = $stateParams.Times;
	//   住院号
	$scope.InpatientNo = $stateParams.InpatientNo;

	//  数据
	$scope.data = {
		//
		'items': [],
		//	总费用
		'totalFee': '',
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

	//   住院总清单
	var getoutfee = function(cardNo, patientID, times, inpatientNo) {
		//
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/getoutfee/' + cardNo + '/' + patientID + '/' + times + '/' + inpatientNo)
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytBase/v1/getoutfee/:' + JSON.stringify(res));
				//
				$scope.items_loadding = false;
				//
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						$scope.data.items = res.data.item;
					} else {
						$scope.data.items = [res.data.item];
					}
					$scope.data.totalFee = res.data.charge_total;
					//  序号
					for(var i in $scope.data.items) {
						$scope.data.items[i].index = +i + 1;
					}
					$scope.data.page.total = $scope.data.items.length;
					//  分页
					$scope.data.page.pageFn(1);

					//  是否打印过
					if(res.data.PrintTimes > 0) {
						$scope.btn_title = '已打印总清单';
						$scope.btn_show = false;
					}

				} else {
					$scope.data.items = [];
					$scope.data.page.total = 0;
				}
			});
	}

	//  取打印凭条返回
	$scope.res_zyPrint = null;
	//  系统正在处理中
	var zyPrint = function() {
		//
		var temp_obj = {
			cardNo: $scope.inp_no,
			patientID: $scope.inp_no,
			inpatientNo: $stateParams.InpatientNo,
			zyTimes: $stateParams.Times,
			regDate: ''
		}
		// log
		window.terminal && window.terminal.WriteLog('rq /api/yytMace/v1/zyPrint:' + JSON.stringify(temp_obj));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/zyPrint', temp_obj)
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytMace/v1/zyPrint:' + JSON.stringify(res));
				//
				if(res.succeed) {
					//    开始总清单
					if($scope.data.items.length < 1) {
						return false;
					}
					window.terminal && window.terminal.ListOfExpensesPrint(JSON.stringify($scope.data.items));
					//
					$scope.res_zyPrint = res.data;
				} else {
					//  提交失败
					$scope.systemError('打印失败：请与维护人员联系');

					//  返回
					$scope.changeStatus();
				}
			});

	}

	//   凭条打印更新 打印结果上传
	//  0 失败 1 成功
	var printLog = function() {
		//  alert('取预约单详情')
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/printLog', {
				lid: $scope.res_zyPrint.lid,
				type: 1
			})
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res 预约挂号 /api/yytMace/v1/printLog:' + JSON.stringify(res));
			});
	}

	//   打印总清单
	$scope.total = function() {
		zyPrint();
		//
		$scope.btn_title = '已打印总清单';
		$scope.btn_show = false;
	}

	//   打印完成回调
	terminal_device.print_hospital.cb_print_all_hospital = function(res_Status, res_str) {
		if(res_Status == 0) {
			$scope.statusFn2();
			//
			printLog();
		} else {
			$scope.systemError('打印失败：' + res_str);
		}
	}

	//    完成打印 
	$scope.statusFn2 = function() {
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音取走凭条
		$scope.audio_list.play('audio_009');
		//  灯光提示
		window.terminal && window.terminal.JSOpenTwinkleLED('5');
		//  5秒关闭
		$timeout(function() {
			window.terminal && window.terminal.JSCloseTwinkleLED('5');
		}, 5000);

	}

	//   返回上一步状态
	$scope.changeStatus = function() {
		$state.go('app.hospital.total', {
			status: '3',
			inp_no: $stateParams.inp_no,
			PatSex: $stateParams.PatSex,
			PatName: $stateParams.PatName
		});
	}

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("hospitalTotalInfoCtrl");
	if(tm.Key != "hospitalTotalInfoCtrl") {
		tm.Key = "hospitalTotalInfoCtrl";
		tm.keyctrl = "app.hospital.total.info";
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
		$scope.audio_list.play('audio_026');
		//
		getoutfee($scope.inp_no, $scope.PatientID, $scope.Times, $scope.InpatientNo);
	}
	run();

});