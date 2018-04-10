/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:36:20 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-22 17:38:21
 */
'use strict';

/**
 * 取网络缴费凭条
 */
app.controller('networkpaymentClinicCtrl', function($scope, $interval, $timeout, $filter, httpService) {

	//   当前页面返回秒数
	$scope.countdown_time = 120;

	$scope.items_loadding = false;

	$scope.status = 1;

	//  数据
	var new_date = new Date();
	$scope.data = {
		'form': {
			startDate: $filter('date')(new_date.setDate(new_date.getDate() - 8), 'yyyy-MM-dd'),
			endDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
		},
		//  选中要打印
		checked_items: [],
		//  处方明细所有条目
		info_items: [],
		//  待打印凭条数据
		print_arr: [],
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
				} else {
					$scope.data.page.row = $scope.data.items.slice(0, $scope.data.page.pageSize * index);
					$scope.data.page.pageIndex = 1;
				}
			}
		}
	}

	//   1.1.1.45.门诊已缴费处方号查询（处方缴费）
	var mzCFNO = function(cardNo, startDate, endDate) {
		//
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/mzCFNO/' + cardNo + '/' + startDate + '/' + endDate)
			.then(function(res) {
				$scope.items_loadding = false;
				//
				if(res.succeed) {
					if(res.data.__proto__.constructor == Object) {
						res.data = res.data;
					} else {
						res.data = {};
					}
					//   解析返回
					var index = 1;
					for(var i in res.data) {
						var temp_obj = {};
						temp_obj.index = index;
						index = index + 1;
						//   处方号
						temp_obj.PrescRecordID = i;
						//   执行科室名称
						//   凭条 
						//   是否打印  true  已打印   false  未打印
						var temp_ExecDeptName = '';
						temp_obj.print = [];
						temp_obj.has_print = true;
						for(var ii in res.data[i]) {
							//
							temp_ExecDeptName = temp_ExecDeptName + ii + ' - ';
							//
							temp_obj.print.push(res.data[i][ii]);
							//   是否打印
							for(var iii in res.data[i][ii]) {
								if(res.data[i][ii][iii].PrintTimes == '0') {
									temp_obj.has_print = false;
								}
							}
						}
						//  去掉 -
						temp_ExecDeptName = temp_ExecDeptName.substr(0, temp_ExecDeptName.length - 3);
						temp_obj.all_ExecDeptName = temp_ExecDeptName;
						//
						$scope.data.items.push(temp_obj);
					}
					//   是否有未打印
					outAllFn();
					//
					$scope.data.page.total = $scope.data.items.length;
					//  分页
					$scope.data.page.pageFn(1);

					//
					// //  调用处方明细
					// //  计数
					// var index = $scope.data.items.length;
					// //   
					// for (var i in $scope.data.items) {
					// 	//
					// 	var temp_obj = {
					// 		inpno: cardNo,
					// 		prescRecordID: $scope.data.items[i].PrescRecordID,
					// 	}
					// 	//   获取门诊处方（当班挂号）
					// 	mzCFMX(temp_obj, $scope.data.items[i], function (res_data, item) {
					// 		index = index - 1;
					// 		if (res_data.length > 0){
					// 			//  明细加入明细
					// 			item.mzCFMX_info = res_data;
					// 		}else{
					// 			//   没有明细
					// 			item.mzCFMX_info = null;
					// 		}
					// 		//  最后一个
					// 		if (index <= 0) {
					// 			//
					// 			$scope.items_loadding = false;
					// 			//  按执行科室筛选
					// 			// $scope.data.items = filter_info_items($scope.data.info_items);
					// 			//   凭条打印查询计数
					// 			// var ticketQuery_index = $scope.data.items.length;
					// 			//   加入序号
					// 			// for (var i in $scope.data.items) {
					// 			// 	$scope.data.items[i].index = +i + 1;
					// 			// 	//   凭条打印查询
					// 			// 	ticketQuery($scope.data.items[i], function () {
					// 			// 		ticketQuery_index = ticketQuery_index - 1;
					// 			// 		if (ticketQuery_index <= 0){
					// 			// 			//   最后一条
					// 			// 			//   验证是否全部已取号
					// 			// 			outAllFn();
					// 			// 		}
					// 			// 	});
					// 			// }

					// 		}
					// 	})
					// }

				} else {
					$scope.data.items = [];
					$scope.data.page.total = 0;
				}
			});
	}

	// //   1.1.1.46.门诊已缴费处方明细（处方缴费）
	// var mzCFMX = function (data_form, item, cb) {
	// 	//
	// 	httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/mzCFMX', {
	// 		cardNo: data_form.inpno,
	// 		prescRecordID: data_form.prescRecordID,
	// 	})
	// 		.then(function (res) {
	// 			if (res.succeed) {
	// 				if (res.data.item.__proto__.constructor == Array) {
	// 					res.data.item = res.data.item;
	// 				} else {
	// 					res.data.item = [res.data.item];
	// 				}
	// 			} else {
	// 				res.data.item = [];
	// 			}
	// 			typeof cb == "function" && cb(res.data.item, item);
	// 		});
	// }

	// //   凭条打印查询
	// var ticketQuery = function (item, cb) {
	// 	//  'MZJF|姓名|诊疗卡号|病人ID|发票流水号|执行科室|处方号'
	// 	var regInfo = [];
	// 	regInfo[0] = 'MZJF';
	// 	regInfo[1] = $scope.app.user_info.PatName;
	// 	// regInfo[2] = $scope.app.user_info.card_no;
	// 	// regInfo[2] = '';
	// 	regInfo[2] = $scope.app.user_info.PatientID;
	// 	regInfo[3] = '';
	// 	regInfo[4] = item.info[0].ExecDeptName;
	// 	regInfo[5] = item.info[0].PrescRecordID;
	// 	regInfo = regInfo.join('|');
	// 	//
	// 	httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/ticketQuery', {
	// 		cardNo: $scope.app.user_info.card_no,
	// 		patientID: $scope.app.user_info.PatientID,
	// 		regDate: '',
	// 		regInfo: regInfo,
	// 		detailed: '',
	// 	})
	// 		.then(function (res) {
	// 			if (res.succeed) {
	// 				// 
	// 				if (res.data.PrintTimes == '0'){
	// 					item.has_print = 0;
	// 				}else{
	// 					item.has_print = 1;
	// 				}
	// 			} else {
	// 				// 
	// 				item.has_print = 0;
	// 			}
	// 			//
	// 			typeof cb == "function" && cb();
	// 		});
	// }

	// /**
	//  * 筛选数据  按执行科室
	//  * @returns array 数组
	//  */
	// var filter_info_items = function (items) {
	// 	var temp_obj = {};
	// 	var temp_arr = [];
	// 	for(var i = 0; i < items.length; i++){
	// 		//    由于 门诊缴费 与 网络缴费 HIS 接口不同， 返回值字段名称不一至 。 手动添加相应 字段
	// 		//   名称
	// 		items[i].MedicineName = items[i].itemname;
	// 		//   单价
	// 		items[i].MedicineUnitCharge = items[i].price;
	// 		//   数量
	// 		items[i].MedicineNum = items[i].num;
	// 		//===========
	// 		//
	// 		if (items[i].ExecDeptName in temp_obj){
	// 			//   有这个执行科室了

	// 		}else{
	// 			//   没有
	// 			temp_obj[items[i].ExecDeptName] = [];
	// 		}
	// 		temp_obj[items[i].ExecDeptName].push(items[i]);
	// 	}
	// 	//  对你转数组
	// 	for(var i in temp_obj){
	// 		var temp_arr_item = {};
	// 		temp_arr_item.info = temp_obj[i];
	// 		//  item 项目
	// 		temp_arr_item.ExecDeptName = temp_obj[i][0].ExecDeptName;
	// 		//
	// 		temp_arr.push(temp_arr_item);
	// 	}

	// 	return temp_arr;
	// }

	//   查询
	$scope.bhc = function() {
		mzCFNO($scope.app.user_info.card_no, $scope.data.form.startDate, $scope.data.form.endDate);
	}

	//   是否全部取号
	$scope.btn_out_all = false;
	//   验证是否全部已取号
	var outAllFn = function() {
		for(var i in $scope.data.items) {
			if($scope.data.items[i].has_print == false) {
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
		//   整理打印凭条数据
		$scope.data.print_arr = [];
		for(var i in $scope.data.checked_items) {
			for(var ii in $scope.data.checked_items[i].print) {
				$scope.data.print_arr.push($scope.data.checked_items[i].print[ii]);
			}
		}
		console.log($scope.data.print_arr);
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

	//   缴费凭条返回
	$scope.res_jfPrint = null;
	//   查询打印凭条
	var jfPrint = function(temp_obj) {
		//alert('取缴费凭条')
		//  log
		window.terminal && window.terminal.WriteLog('rq 缴费打印 /api/yytMace/v1/jfPrint:' + JSON.stringify(temp_obj));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/jfPrint', temp_obj)
			.then(function(res) {
				//  log
				window.terminal && window.terminal.WriteLog('res 缴费打印 /api/yytMace/v1/jfPrint:' + JSON.stringify(res));
				//
				if(res.succeed) {
					//alert('开始打印');
					//   
					//    开始打印
					window.terminal && window.terminal.PrintReceipt($scope.printStringEndFn(res.data.print, 0), '', '');
					//
					$scope.res_jfPrint = res.data;
				} else {
					//  提交失败
					$scope.systemError('打印失败请与维护人员联系');

					//  返回
					$scope.locationBk();
				}
			});
	}

	//   凭条打印计算
	$scope.jfPrint_number = 1;

	//   缴费成功 打印凭条
	$scope.statusFn1 = function() {
		//
		//alert('缴费成功 打印凭条');
		//   打印凭条
		var temp_obj = {
			cardNo: $scope.app.user_info.card_no,
			patName: $scope.app.user_info.PatName,
			patientID: $scope.app.user_info.PatientID,
			yHCardNo: '',
			fPFlow: '',
			success: '成功',
			execDeptName: '',
			paymentCharge: '',
			prescRecordID: '',
			visitDate: '',
			num: '',
			detailed: ''
		}
		//  
		var temp_bol = true;
		//   查找未打印记录
		var temp_item = null;
		for(var i in $scope.data.print_arr) {
			// $scope.data.print_arr[i].PrintTimes = $scope.data.print_arr[i][0].PrintTimes;
			if($scope.data.print_arr[i].PrintTimes == true) {
				//  已打印
				//alert('已打印')
			} else {
				//alert('未打印')
				//  未打印
				temp_bol = false;
				//  执行科室
				temp_obj.execDeptName = $scope.data.print_arr[i][0].ExecDeptName;
				//  支付金额
				temp_obj.paymentCharge = '';
				//  发票号
				temp_obj.fPFlow = $scope.data.print_arr[i][0].receiptSn;
				//  处方记录ID
				temp_obj.prescRecordID = $scope.data.print_arr[i][0].PrescRecordID;
				//  看诊时间
				temp_obj.visitDate = $filter('date')(new Date(), 'yyyy-MM-dd');

				//  加入药品明细
				//    由于 门诊缴费 与 网络缴费 HIS 接口不同， 返回值字段名称不一至 。 手动添加相应 字段
				var temp_detailed = JSON.parse($scope.data.print_arr[i][0].Detailed);
				for(var di in temp_detailed) {
					//   名称
					temp_detailed[di].MedicineName = temp_detailed[di].itemname;
					//   单价
					temp_detailed[di].MedicineUnitCharge = temp_detailed[di].price;
					//   数量
					temp_detailed[di].MedicineNum = temp_detailed[di].num;
					//   科室地址
					temp_detailed[di].floor_name = temp_detailed[di].MedicineDirections;
				}
				//
				temp_obj.detailed = JSON.stringify(temp_detailed);

				//  加入凭条打印次数
				temp_obj.num = $scope.jfPrint_number;
				//  调用打印凭条接口
				jfPrint(temp_obj);
				//  计算 加1
				$scope.jfPrint_number = $scope.jfPrint_number + 1;
				//  设置为已打印
				$scope.data.print_arr[i].PrintTimes = true;
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
			lid: $scope.res_jfPrint.lid
		}));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/printLog', {
				lid: $scope.res_jfPrint.lid,
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
	var tm = $scope.setglobaldata.gettimer("networkpaymentClinicCtrl");
	if(tm.Key != "networkpaymentClinicCtrl") {
		tm.Key = "networkpaymentClinicCtrl";
		tm.keyctrl = "app.networkpayment.clinic";
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