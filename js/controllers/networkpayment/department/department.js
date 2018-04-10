/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:36:20 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-22 17:50:35
 */
'use strict';

/**
 * 取网络当班挂号凭条
 */
app.controller('networkpaymentDepartmentCtrl', function($scope, $interval, $timeout, $filter, httpService, globalFn) {

	//   当前页面返回秒数
	$scope.countdown_time = 120;

	$scope.items_loadding = false;

	$scope.status = 1;

	//  数据
	var new_date = new Date();
	$scope.data = {
		'form': {
			startDate: $filter('date')(new_date.setDate(new_date.getDate() - 7), 'yyyy-MM-dd'),
			endDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
		},
		//  选中要打印
		checked_items: [],
		//  处方明细所有条目
		info_items: [],
		//  all
		'items': [],
		//   对items 数据进行分页
		'page': {
			pageIndex: 1,
			pageSize: 7,
			total: 0,
			row: [],
			//   分页初始化
			pageFn: function(index) {
				if($scope.data.page.total > (index - 1) * $scope.data.page.pageSize) {
					$scope.data.page.row = $scope.data.items.slice((index - 1) * $scope.data.page.pageSize, $scope.data.page.pageSize * index);
					$scope.data.page.pageIndex = index;
					console.log($scope.data.page.row)
				} else {
					$scope.data.page.row = $scope.data.items.slice(0, $scope.data.page.pageSize * index);
					$scope.data.page.pageIndex = 1;
				}
			}
		}
	}

	//   自助机取号（当天的号）
	var autoQH = function(cardNo) {
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/autoQH/' + cardNo)
			.then(function(res) {
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						$scope.data.items = res.data.item;
						console.log($scope.data.items)
					} else {
						$scope.data.items = [res.data.item];
						console.log($scope.data.items)
					}
					//  排序  按时间排序
					$scope.data.items.sort(globalFn.compare("VisitDate"));
					$scope.data.items.reverse();
					//   凭条打印查询计数
					var ticketQuery_index = $scope.data.items.length;
					//   加入序号
					for(var i in $scope.data.items) {
						$scope.data.items[i].index = +i + 1;
						//   凭条打印查询
						ticketQuery($scope.data.items[i], function() {
							ticketQuery_index = ticketQuery_index - 1;
							if(ticketQuery_index <= 0) {
								//   最后一条
								//   验证是否全部已取号
								outAllFn();
							}
						});
					}
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

	//   1.1.1.11.我的门诊挂号记录查询（当班挂号）
	//   我的门诊挂号记录
	// var patientRecord = function (outPatientID, startDate, endDate) {
	// 	//
	// 	$scope.items_loadding = true;
	// 	//
	// 	httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/patientRecord/' + outPatientID + '/' + startDate + '/' + endDate)
	// 		.then(function (res) {
	// 			//
	// 			$scope.items_loadding = false;
	// 			//
	// 			if (res.succeed) {
	// 				if (res.data.item.__proto__.constructor == Array) {
	// 					$scope.data.items = res.data.item;
	// 				} else {
	// 					$scope.data.items = [res.data.item];
	// 				}
	// 				//  排序  按时间排序
	// 				$scope.data.items.sort(globalFn.compare("ExamDT"));
	// 				$scope.data.items.reverse();
	// 				//   加入序号
	// 				for (var i in $scope.data.items) {
	// 					$scope.data.items[i].index = +i + 1;
	// 				}
	// 				//   凭条打印查询计数
	// 				var ticketQuery_index = $scope.data.items.length;
	// 				//   加入序号
	// 				for (var i in $scope.data.items) {
	// 					$scope.data.items[i].index = +i + 1;
	// 					//   凭条打印查询
	// 					ticketQuery($scope.data.items[i], function () {
	// 						ticketQuery_index = ticketQuery_index - 1;
	// 						if (ticketQuery_index <= 0) {
	// 							//   最后一条
	// 							//   验证是否全部已取号
	// 							outAllFn();
	// 						}
	// 					});
	// 				}

	// 				$scope.data.page.total = $scope.data.items.length;
	// 				//  分页
	// 				$scope.data.page.pageFn(1);
	// 			} else {
	// 				//   

	// 			}
	// 		});
	// }

	//   凭条打印查询
	var ticketQuery = function(item, cb) {
		//   上午下午
		var am_pm = '';
		if(item.AmPm == 'a') {
			am_pm = '上午';
		} else if(item.AmPm == 'p') {
			am_pm = '下午';
		}
		//  DBGH|姓名|诊疗卡号|病人ID|就诊时间|排队顺序|挂号科室|挂号医生|挂号金额
		//  DBGH|姓名|病人ID|就诊时间|排队顺序|挂号科室|挂号医生|挂号金额
		var regInfo = [];
		regInfo[0] = 'DBGH';
		regInfo[1] = $scope.app.user_info.PatName;
		// regInfo[2] = $scope.app.user_info.card_no;
		// regInfo[2] = '';
		regInfo[2] = $scope.app.user_info.PatientID;
		regInfo[3] = item.VisitDate.substr(0, 10) + ' ' + item.CheckTime;
		regInfo[4] = item.Pbxh;
		regInfo[5] = item.DepName;
		regInfo[6] = item.DoctName;
		regInfo[7] = (+item.Amount).toFixed(2);
		regInfo = regInfo.join('|');
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/ticketQuery', {
				cardNo: $scope.app.user_info.card_no,
				patientID: $scope.app.user_info.PatientID,
				regDate: item.VisitDate.substr(0, 10),
				regInfo: regInfo,
				detailed: '',
			})
			.then(function(res) {
				if(res.succeed) {
					// 
					if(res.data.PrintTimes == '0') {
						item.has_print = 0;
					} else {
						item.has_print = 1;
					}
				} else {
					// 
					item.has_print = 0;
				}
				//
				typeof cb == "function" && cb();
			});
	}

	//   查询
	$scope.bhc = function() {
		autoQH($scope.app.user_info.card_no);
	}

	//   是否全部取号
	$scope.btn_out_all = false;
	//   验证是否全部已取号
	var outAllFn = function() {
		for(var i in $scope.data.items) {
			if($scope.data.items[i].has_print == 0) {
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

	//   凭条返回
	$scope.res_zzghPrint = null;
	//   查询打印凭条
	var zzghPrint = function(temp_obj) {
		//alert('取凭条')
		//  log
		window.terminal && window.terminal.WriteLog('rq 缴费打印 /api/yytMace/v1/zzghPrint:' + JSON.stringify(temp_obj));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/zzghPrint', temp_obj)
			.then(function(res) {
				//  log
				window.terminal && window.terminal.WriteLog('res 缴费打印 /api/yytMace/v1/zzghPrint:' + JSON.stringify(res));
				//
				if(res.succeed) {
					//alert('开始打印');
					//   
					//    开始打印
					window.terminal && window.terminal.PrintReceipt($scope.printStringEndFn(res.data.print, 0), '', '');
					//
					$scope.res_zzghPrint = res.data;
				} else {
					//  提交失败
					$scope.systemError('打印失败请与维护人员联系');

					//  返回
					$scope.locationBk();
				}
			});
	}

	//   凭条打印计算
	$scope.zzghPrint_number = 1;

	//   缴费成功 打印凭条
	$scope.statusFn1 = function() {
		//
		//alert('缴费成功 打印凭条');
		//   打印凭条
		var temp_obj = {
			cardNo: $scope.app.user_info.card_no,
			patName: $scope.app.user_info.PatName,
			depName: '',
			doctName: '',
			pbxh: '',
			visitDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
			amPm: '',
			patientID: $scope.app.user_info.PatientID,
			times: $filter('date')(new Date(), 'yyyy-MM-dd'),
			amount: '',
			checkTime: '',
			yhCardNo: '',
			prescRecordID: '',
			type: '1',
			detailed: ''
		}

		//  
		var temp_bol = true;
		//   查找未打印记录
		var temp_item = null;
		for(var i in $scope.data.checked_items) {
			if($scope.data.checked_items[i].has_print == 1) {
				//  已打印
				//alert('已打印')
			} else {
				//alert('未打印')
				//  未打印
				temp_bol = false;
				var am_pm = '';
				if($scope.data.checked_items[i].AmPm == 'a') {
					am_pm = '1';
				} else if($scope.data.checked_items[i].AmPm == 'p') {
					am_pm = '2';
				}
				//
				temp_obj.depName = $scope.data.checked_items[i].DepName;
				temp_obj.doctName = $scope.data.checked_items[i].DoctName;
				temp_obj.pbxh = $scope.data.checked_items[i].Pbxh;
				temp_obj.amPm = am_pm;
				temp_obj.amount = $scope.data.checked_items[i].Amount;
				temp_obj.checkTime = $scope.data.checked_items[i].CheckTime;
				//    加入科室地址
				temp_obj.detailed = JSON.stringify([{
					"floor_name": ""
				}])
				//
				//  调用打印凭条接口
				zzghPrint(temp_obj);
				//  计算 加1
				$scope.zzghPrint_number = $scope.zzghPrint_number + 1;
				//  设置为已打印
				$scope.data.checked_items[i].has_print = 1;
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

	//   凭条打印更新 打印结果上传
	var printLog = function() {
		//  alert('取预约单详情')
		// log
		window.terminal && window.terminal.WriteLog('res 门诊缴费 /api/yytMace/v1/printLog:' + JSON.stringify({
			lid: $scope.res_zzghPrint.lid
		}));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/printLog', {
				lid: $scope.res_zzghPrint.lid,
				type: 1
			})
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res 门诊缴费 /api/yytMace/v1/printLog:' + JSON.stringify(res));
			});
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

		//
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 5;
		tm.fnAutoRefreshfn(tm);

	}

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("networkpaymentDepartmentCtrl");
	if(tm.Key != "networkpaymentDepartmentCtrl") {
		tm.Key = "networkpaymentDepartmentCtrl";
		tm.keyctrl = "app.networkpayment.department";
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
		$scope.bhc();
	}
	run();

});