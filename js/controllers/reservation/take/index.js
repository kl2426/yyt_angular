/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:36:20 
 * @Last Modified by: wu
 * @Last Modified time: 2018-05-29 19:11:45
 */
'use strict';

/**
 * 预约 取号
 */
app.controller('reservationTakeCtrl', function($scope, $interval, $timeout, $filter, httpService) {

	//   当前页面返回秒数
	$scope.countdown_time = 120;

	$scope.items_loadding = false;

	$scope.status = 1;

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
		} else if(res_Status == '99') {
			//   打开打印错误弹窗
			$scope.modelOpenPrintError(res_str);
		} else {
			//  打印异常
			$scope.systemError('打印失败请与工作人员联系');
		}
	}

	//  数据
	$scope.data = {
		//  选中要打印
		checked_items: [],
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

	//   获取预约挂号单编号（预约挂号）
	var getOrderId = function(cardNo) {
		//
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/getOrderId/' + cardNo)
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
					//   加入序号
					for(var i in $scope.data.items) {
						$scope.data.items[i].index = +i + 1;
						//   选中
						$scope.data.items[i].checked = true;
					}
					//  是否有未打印的
					outAllFn();
					//
					$scope.data.page.total = $scope.data.items.length;
					//  分页
					$scope.data.page.pageFn(1);
				} else {
					$scope.data.items = [];
					$scope.data.page.total = 0;
				}
			});
	}

	//   是否全部取号
	$scope.btn_out_all = false;
	//   验证是否全部已取号
	var outAllFn = function() {
		for(var i in $scope.data.items) {
			if($scope.data.items[i].orderStatus == 2) {
				$scope.btn_out_all = true;
				break;
			}
		}
	}

	//   取号
	$scope.outMark = function() {
		//  验证是否有选中
		var temp_bol = false;
		for(var i in $scope.data.items) {
			if($scope.data.items[i].checked) {
				temp_bol = true;
				break;
			}
		}
		if(temp_bol == false) {
			return;
		}
		//
		var items = $scope.data.items;
		var temp_arr = [];
		for(var i in items) {
			if(items[i].checked && items[i].checked == true) {
				temp_arr.push(items[i]);
			}
		}
		//   取凭条打印
		$scope.data.checked_items = temp_arr;
		
		//   打印凭条
		$scope.statusFn1();

		$scope.status = 2;

		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音取走凭条
		$scope.audio_list.play('audio_008');

		//   停止计时器
		tm.fnStopAutoRefreshfn(tm);

	}

	//   凭条打印计算
	$scope.jfPrint_number = 1;

	//   预约取号 打印凭条
	$scope.statusFn1 = function() {
		//
		//alert('预约取号 打印凭条');
		//   打印凭条
		var temp_obj = {
			patName: $scope.app.user_info.PatName,
			cardNo: $scope.app.user_info.card_no,
			patientID: $scope.app.user_info.PatientID,
			orderId: '',
			doctName: '',
			depName: '',
			visitDate: '',
			visitNo: '',
			orderTime: '',
			startTime: '',
			endTime: '',
			visitCost: '',
			timeRange: ''
		}
		//  
		var temp_bol = true;
		//
		for(var i in $scope.data.checked_items) {
			if($scope.data.checked_items[i].orderStatus == 4) {
				//  已打印
				//alert('已打印')
			} else {
				//alert('未打印')
				//  未打印
				temp_bol = false;
				//
				temp_obj.orderId = $scope.data.checked_items[i].orderId;
				temp_obj.doctName = $scope.data.checked_items[i].orderInfo.doctName;
				temp_obj.depName = $scope.data.checked_items[i].orderInfo.deptName;
				temp_obj.visitDate = $scope.data.checked_items[i].orderTime;
				temp_obj.visitNo = $scope.data.checked_items[i].visitNo;
				temp_obj.orderTime = $scope.data.checked_items[i].orderInfo.orderTime.substr(0, 16) + ' ' + $scope.data.checked_items[i].orderInfo.timeRange;
				temp_obj.startTime = $scope.data.checked_items[i].startTime;
				temp_obj.endTime = $scope.data.checked_items[i].endTime;
				temp_obj.visitCost = $scope.data.checked_items[i].orderInfo.visitCost;
				temp_obj.timeRange = $scope.data.checked_items[i].orderInfo.timeRange;

				//  计算 加1
				$scope.jfPrint_number = $scope.jfPrint_number + 1;
				//  更新预约状态
				saveQHMsg_orderDetailInfo($scope.data.checked_items[i], function(item, his_res) {
					if(his_res.succeed) {
						//  设置为已打印
						item.orderStatus = 4;
						//  调用打印凭条接口
						yyPrint(temp_obj);
					} else {
						$scope.systemError('取号失败：' + his_res.message);
					}
					//  是否有未打印的
					outAllFn();
				});
				//  退出循环
				break;
			}
		}
		//  是否都打印过了
		if(temp_bol == true) {
			//   都打印过了
			$scope.statusFn2();
		}

	}

	//   预约取号凭条返回
	$scope.res_yyPrint = null;
	//   查询打印凭条
	var yyPrint = function(temp_obj) {
		//alert('取缴费凭条')
		//  log
		window.terminal && window.terminal.WriteLog('rq 预约取号 /api/yytMace/v1/yyPrint:' + JSON.stringify(temp_obj));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/yyPrint', temp_obj)
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res 预约取号 /api/yytMace/v1/yyPrint:' + JSON.stringify(res));
				//
				if(res.succeed) {
					//    开始打印
					window.terminal && window.terminal.PrintReceipt(res.data.print.toString(), '', '');
					//
					$scope.res_yyPrint = res.data;
				} else {}
			});
	}

	//   保存取号信息到HIS（预约挂号）  后台  直接调用  更新 凯歌 与 HIS 两个接口
	var saveQHMsg_orderDetailInfo = function(item, cb) {
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/saveQHMsg', {
				cardNo: $scope.app.user_info.card_no,
				orderId: item.orderId,
				hosDeptCode: item.hosDeptCode,
				hosDoctCode: item.hosDoctCode,
				orderTime: item.orderTime,
				patientName: item.orderInfo.patientName,
				visitLevel: item.visitLevel,
				visitNo: item.visitNo,
				orderStatus: item.orderStatus,
				timeRange: item.timeRange,
				takePassword: item.orderInfo.takePassword,
				startTime: item.startTime,
				endTime: item.endTime,
				visitCost: item.orderInfo.visitCost,
				endNo: $scope.app.device_info.user.terminalNo
			})
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res 预约取号更新 /api/yytBase/v1/saveQHMsg:' + JSON.stringify(res));
				//
				typeof cb == "function" && cb(item, res);
			});
	}

	//   凭条打印更新 打印结果上传
	var printLog = function() {
		//  alert('取预约单详情')
		// log
		window.terminal && window.terminal.WriteLog('res 预约取号 /api/yytMace/v1/printLog:' + JSON.stringify({
			lid: $scope.res_jfPrint.lid
		}));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/printLog', {
				lid: $scope.res_yyPrint.lid
			})
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res 预约取号 /api/yytMace/v1/printLog:' + JSON.stringify(res));
			});
	}

	//   打印完成回调
	terminal_device.print_receipt.cb_print_receipt = function(res_Status, res_str) {
		// alertalert('打印完成回调')
		if(res_Status == '0') {
			//  正常打印  设置
			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('1');
			//  5秒关闭
			$timeout(function() {
				window.terminal && window.terminal.JSCloseTwinkleLED('1');
			}, 5000);

			//  继续打印 下一条
			$scope.statusFn1();
			//  调用凭条打印更新
			printLog();

		} else if(res_Status == '99') {
			//   打开打印错误弹窗
			$scope.modelOpenPrintError(res_str);
		} else {
			//  打印异常
			//alert('打印异常');
			//  提交失败
			$scope.systemError('打印失败请与维护人员联系');
		}
	}

	//    完成打印 
	$scope.statusFn2 = function() {
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音取走凭条
		$scope.audio_list.play('audio_013');
		//
		$scope.status = 3;
		getOrderId($scope.app.user_info.card_no);

		//
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 5;
		tm.fnAutoRefreshfn(tm);

	}

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("reservationTakeCtrl");
	if(tm.Key != "reservationTakeCtrl") {
		tm.Key = "reservationTakeCtrl";
		tm.keyctrl = "app.reservation.take";
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

		//
		//autoQH($scope.app.user_info.card_no);
		//
		getOrderId($scope.app.user_info.card_no);
	}
	run();

});