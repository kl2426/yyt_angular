/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:36:20 
 * @Last Modified by: wu
 * @Last Modified time: 2018-06-02 09:36:39
 */
'use strict';

/**
 * 取网络缴费凭条
 */
app.controller('networkpaymentCtrl', function ($scope, $interval, $timeout, $filter, httpService, $q) {

	//   当前页面返回秒数
	$scope.countdown_time = 60;

	$scope.items_loadding = false;

	//   是否显示返回按钮  true  有返回 按钮  不显示 遮挡层。  false 反之
	$scope.show_back = true;

	$scope.status = 1;

	//  数据
	var new_date = new Date();
	$scope.data = {
		'form': {
			startDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
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
						var temp_price = 0;
						temp_obj.print = [];
						temp_obj.has_print = true;
						for(var j in res.data[i]) {
							//
							temp_ExecDeptName = temp_ExecDeptName + j + ' - ';
							//
							temp_obj.print.push(res.data[i][j]);
							//   是否打印
							for(var k in res.data[i][j]) {
								if(res.data[i][j][k].PrintTimes == '0') {
									temp_obj.has_print = false;
								}
								//
								temp_price += parseFloat(res.data[i][j][k].price * res.data[i][j][k].num);
							}
						}
						//  去掉 -
						temp_ExecDeptName = temp_ExecDeptName.substr(0, temp_ExecDeptName.length - 3);
						temp_obj.price = temp_price.toFixed(2);
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
			for(var j in $scope.data.checked_items[i].print) {
				$scope.data.print_arr.push($scope.data.checked_items[i].print[j]);
			}
		}
		//   打印凭条
		$scope.statusFn1();

		//   遮挡 返回按钮
		$scope.show_back = false;

		$scope.status = 2;

		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音取走凭条
		$scope.audio_list.play('audio_008');

		//   停止计时器
		tm.fnStopAutoRefreshfn(tm);

	}

	//   缴费凭条返回
	// $scope.res_jfPrint = null;
	//   查询打印凭条
	var jfPrint = function(temp_obj) {
		//  log
		window.terminal && window.terminal.WriteLog('rq 缴费打印 /api/yytMace/v1/jfPrint:' + JSON.stringify(temp_obj));
		//
		return httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/jfPrint', temp_obj);
			// .then(function(res) {
			// 	//  log
			// 	window.terminal && window.terminal.WriteLog('res 缴费打印 /api/yytMace/v1/jfPrint:' + JSON.stringify(res));
			// 	//
			// 	if(res.succeed) {
			// 		$scope.res_jfPrint = res.data;

			// 		if(res.data.PrintTimes == 0) {
			// 			//	开始打印
			// 			window.terminal && window.terminal.PrintReceipt($scope.printStringEndFn(res.data.print, 0), '', '');
			// 		}
			// 	} else {
			// 		//  提交失败
			// 		$scope.systemError('打印失败请与维护人员联系');

			// 		//  返回
			// 		$scope.locationBk();
			// 	}
			// });
	}


	/**
	 * 调用硬件打印
	 *  items  整理后的凭条数据集  带请求完成状态值  带硬件是否打印完成状态值 （明细中第一条）
	 */
	$scope.devicePrint = function () {
		//   查询是否有未打印完成数据 有而打印 无则打印结束进入下一步
		var items = $scope.data.print_arr;
		//
		for (var i in items) {
			//   当前凭条中明细对象 第一条 未打印则调用硬件打印
			if (!items[i][0].temp_device_is_print) {
				// log
				window.terminal && window.terminal.WriteLog('硬件打印：门诊缴费凭条打印：当前处方明细与处方记录数据：' + JSON.stringify(items[i]));
				//  修改状态  设置为已打印凭条
				items[i][0].temp_device_is_print = true;
				//   硬件打印
				window.terminal && window.terminal.PrintReceipt(items[i][0].temp_print_text, '', '');
				//   强制退出
				return;
			}
		}
		//   当无强制返回时 打印全部完成
		$scope.statusFn2();
		//   写打印完成日志
		// log
		window.terminal && window.terminal.WriteLog('硬件打印：门诊缴费 打印完成：打印数据：' + JSON.stringify($scope.data.print_arr));
	}



	//   凭条打印计算
	// $scope.jfPrint_number = 1;

	//   缴费成功 打印凭条
	$scope.statusFn1 = function() {
		//   提交取打印凭条
		var arr_promise = [];
		//   更新打印
		for (var i in $scope.data.print_arr){
			//   打印凭条
			var temp_obj = {
				cardNo: $scope.app.user_info.card_no,
				patName: $scope.app.user_info.PatName,
				patientID: $scope.app.user_info.PatientID,
				yHCardNo: '',
				fPFlow: $scope.data.print_arr[i][0].receiptSn,
				success: '成功',
				execDeptName: $scope.data.print_arr[i][0].ExecDeptName,
				paymentCharge: '',
				prescRecordID: $scope.data.print_arr[i][0].PrescRecordID,
				visitDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
				num: +i + 1,
				detailed: ''
			}

			//  加入药品明细
			//  由于 门诊缴费 与 网络缴费 HIS 接口不同， 返回值字段名称不一至 。 手动添加相应 字段
			var temp_detailed = JSON.parse($scope.data.print_arr[i][0].Detailed);
			for (var di in temp_detailed) {
				//   名称
				temp_detailed[di].MedicineName = temp_detailed[di].itemname;
				//   单价
				temp_detailed[di].MedicineUnitCharge = temp_detailed[di].price;
				//   数量
				temp_detailed[di].MedicineNum = temp_detailed[di].num;
				//   科室地址
				temp_detailed[di].floor_name = temp_detailed[di].floor_name;
			}
			//
			temp_obj.detailed = JSON.stringify(temp_detailed);
			
			//
			//  调用打印凭条接口
			var temp_promise = jfPrint(temp_obj);
			arr_promise.push(temp_promise);

		}

		//   全部完成
		$q.all(arr_promise).then(function (res_jfPrint) {
			//   遍历请求返回给凭条加入数据
			var temp_bol = true;
			for (var b in res_jfPrint) {
				if (res_jfPrint[b].succeed) {
					//   加入当前凭条明细数据第一条中 打印次数 0  为未打印  大于0为已打印过
					$scope.data.print_arr[b][0].temp_PrintTimes = res_jfPrint[b].data.PrintTimes;
					//   加入到第一条中 凭条打印文本
					$scope.data.print_arr[b][0].temp_print_text = res_jfPrint[b].data.print;
					//
					printLog(res_jfPrint[b].data.lid);
				} else {
					temp_bol = false;
					//  提交失败
					$scope.systemError('打印失败请与维护人员联系');
					//  返回
					$scope.locationBk();
				}
			}
			//
			if (temp_bol) {
				//   硬件打印
				$scope.devicePrint();
				// log 打印日志
				window.terminal && window.terminal.WriteLog('门诊缴费-所有凭条日志：' + JSON.stringify($scope.data.print_arr));
			}

		}).catch(function (error) {
			//  提交失败
			$scope.systemError('打印失败请与维护人员联系');
			//  返回
			$scope.locationBk();
		});

	}

	//   凭条打印更新 打印结果上传
	var printLog = function (lid) {
		// log
		window.terminal && window.terminal.WriteLog('res 门诊缴费 /api/yytMace/v1/printLog:' + JSON.stringify({
			lid: lid
		}));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/printLog', {
			lid: lid,
			type: $scope.bankCorrectStatus == 0 ? 1 : 0
		})
			.then(function (res) {
				// log
				window.terminal && window.terminal.WriteLog('res 门诊缴费 /api/yytMace/v1/printLog:' + JSON.stringify(res));
			});
	};

	//   打印完成回调
	terminal_device.print_receipt.cb_print_receipt = function(res_Status, res_str) {
		if(res_Status == '0') {
			//  正常打印  设置
			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('1');
			//  5秒关闭
			$timeout(function() {
				window.terminal && window.terminal.JSCloseTwinkleLED('1');
			}, 5000);

			//  继续打印 下一条
			$timeout(function() {
				// $scope.statusFn1();
				$scope.devicePrint();
			}, 500);
			//  调用凭条打印更新
			// printLog();
		} else if(res_Status == '99') {
			//   打开打印错误弹窗
			$scope.modelOpenPrintError(res_str);
		} else {
			//  打印异常
			//  提交失败
			$scope.systemError('打印失败请与维护人员联系');
		}
	}

	//    完成打印 
	$scope.statusFn2 = function() {
		//   显示 返回按钮
		$scope.show_back = true;
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
	var tm = $scope.setglobaldata.gettimer("networkpaymentCtrl");
	if(tm.Key != "networkpaymentCtrl") {
		tm.Key = "networkpaymentCtrl";
		tm.keyctrl = "app.networkpayment";
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

	//   查询
	$scope.bhc = function() {
		$scope.data.items = [];
		$scope.data.page.row = [];
		$scope.data.page.total = 0;
		$timeout(function() {
			mzCFNO($scope.app.user_info.card_no, $scope.data.form.startDate, $scope.data.form.endDate);
		}, 0);
	}

	var run = function() {
		//   播放声音
		$scope.audio_list.play('audio_001');
		//
		$scope.bhc();
	}
	run();

});