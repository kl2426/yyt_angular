/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-01-03 11:14:54 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-22 17:01:11
 */

'use strict';
/**
 * 挂号 确认挂号
 */
app.controller('cardDepartmentRegisteredDocinfoDepCtrl', function($scope, $interval, $timeout, $stateParams, $filter, httpService, globalFn) {

	//   转科名称
	$scope.deptName = $stateParams.deptName;
	$scope.doct_name = $stateParams.doct_name;
	$scope.am_pm = $stateParams.am_pm;
	$scope.sumMoney = $stateParams.sumMoney;
	//  金额分
	$scope.sumMoney_minute = globalFn.accMul($stateParams.sumMoney, 100);

	$scope.schedulingID = $stateParams.schedulingID;

	$scope.clinic_time_start = $stateParams.clinic_time_start;
	$scope.clinic_time_end = $stateParams.clinic_time_end;

	//   状态  1, 确认挂号。2，系统正在处理。3，打印凭条。4，挂号成功
	$scope.status = 1;

	//	支付方式 	 0, 银行卡;	1, 在线支付;	2, 现金
	$scope.payMethod = '';

	//  挂号确认
	$scope.isRegistConfirm = false;
	
	//	在线支付订单状态	true 查询成功	false 查询失败
	$scope.orderStatus = false;

	//   当前页面返回秒数
	$scope.countdown_time = 360;

	//
	$scope.data = {
		//	二维码信息
		'ecodeInfo': {}
	}

	//
	$scope.form_data = {
		//  支付流水号
		paymentIndex: '',
		//  支付类型  7 长沙银行自助机，  6 长沙银行E钱庄
		paymentType: '',
		//  支付金额
		paymentCharge: $scope.sumMoney,
		//  排班Id
		schedulingID: $scope.schedulingID,
		//  上下午  1-上午 2-下午 3-晚上
		amOrPm: $scope.am_pm,
		//  诊疗卡号
		cardNo: $scope.app.user_info.card_no,
		//  身份证
		IDCard: $scope.app.user_info.IDCard,
		//  病人姓名
		patName: $scope.app.user_info.PatName,
		//  手机号码
		telephoneNo: $scope.app.user_info.TelephoneNo,
		//  性别 1：男；2：女
		patSex: $scope.app.user_info.PatSex,
		//  家庭地址
		address: $scope.app.user_info.PatAddress
	}

	//  =====================  银行处理  =========================

	//    银行充值返回   0 分正常  非0异常
	$scope.bankRechargeStatus = '';
	//    银行充值返回  正常时为对像， 异常时为文本
	$scope.bankRechargeObj = '';
	//    银行充正返回   0 分正常  非0异常
	$scope.bankCorrectStatus = '';
	//    银行充正返回  正常时为对像， 异常时为文本
	$scope.bankCorrectObj = '';

	/**
	 * 银行充值
	 * @param {string} money - 充值金额 单位分
	 * @return void
	 */
	var bankRecharge = function(money) {
		money = money.toString();
		// money = '1';
		// log
		window.terminal && window.terminal.WriteLog('硬件调用： cardDepartmentRegisteredDocinfoDepCtrl window.terminal.OpenBankModel: money：' + JSON.stringify(money));
		//
		window.terminal && window.terminal.OpenBankModel(money);
		//   遮罩层
		window.terminal && $scope.modelOpenPay();
	}

	/**
	 * 银行充值 .net 回调
	 * @param {string} res_Status  - 银行充值返回   0 分正常  非0异常
	 * @param {Object} res_obj - 银行充值返回  正常时为对像， 异常时为文本  。 对象属性见 .net 接口文档
	 * @return void
	 */
	terminal_device.build_card.cb_money = function(res_Status, res_obj) {
		//
		window.terminal && window.terminal.JSCloseTwinkleLED('4');
		// log
		window.terminal && window.terminal.WriteLog('硬件回调： cardDepartmentRegisteredDocinfoDepCtrl terminal_device.build_card.cb_money: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//   关闭遮罩层
		window.terminal && $scope.modelClosePay.close('ok');
		//  
		$scope.bankRechargeStatus = res_Status;
		$scope.bankRechargeObj = res_obj;
		// alert('银行充值回调');
		if(res_Status == 0) {
			//   充值成功
			$scope.$apply();

			//  挂号确认
			registConfirm(7);
		} else {
			//  充值失败
			//  打开提示
			switch(res_Status) {
				case '-55':
					$scope.systemError('密码错误');
					break;
				case '-51':
					$scope.systemError('余额不足');
					break;
				case '-33':
					$scope.systemError('卡已过期');
					break;
				case '-99':
					$scope.systemError('交易错误');
					break;
				case '-18':
					$scope.systemError('读卡错误');
					break;
				default:
					$scope.systemError('交易错误');
			}
			$scope.$apply();

			//  返回选择医生
			$scope.locationBk('app.card.department.registered');
		}
	}

	/**
	 * 银行充正
	 * @param {string} trace_no  - 支付完成流水号
	 * @param {string} money  - 充正金额 单位分
	 * @return void
	 */
	$scope.bankCorrect = function(trace_no, money) {
		money = money.toString();
		// log
		window.terminal && window.terminal.WriteLog('硬件调用： cardDepartmentRegisteredDocinfoDepCtrl window.terminal.CorrectBankModel: trace_no' + JSON.stringify(trace_no) + ' money：' + JSON.stringify(money));
		//
		window.terminal && window.terminal.CorrectBankModel(trace_no, money);
	}

	/**
	 * 银行充正 .net 回调
	 * @param {string} res_Status  - 银行充正返回   0 分正常  非0异常
	 * @param {Object} res_obj - 银行充正返回  正常时为对像， 异常时为文本  。 对象属性见 .net 接口文档
	 * @return void
	 */
	terminal_device.build_card.cb_money_filling = function(res_Status, res_obj) {
		// log
		window.terminal && window.terminal.WriteLog('硬件回调： cardDepartmentRegisteredDocinfoDepCtrl terminal_device.build_card.cb_money_filling: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//
		$scope.bankCorrectStatus = res_Status;
		$scope.bankCorrectObj = res_obj;
		//
		if(res_Status == 0) {
			//   充正成功
			//  alert('充正成功');
			// $scope.systemError('挂号失败请重新挂号');

			//  返回选择医生
			$scope.locationBk();

		} else {
			//   充正失败
			//  alert('充正失败');
			$scope.systemError('支付成功：挂号失败请与工作人员联系');
			//   打印支付成功挂号失败凭条
			//   取打印模板
			$scope.statusFn2();

			//   打印完成再返回 选择医生
			//  返回选择医生
			$scope.locationBk();
		}
	}

	/**
	 * 银行卡退卡
	 * @return void
	 */
	$scope.bankOutCard = $scope.bankOutCard;

	//  =====================  /银行处理  =========================

	//  =====================  扫码支付  =========================

	/**
	 * 扫码支付
	 * @param {object} 生成二维码参数
	 * @return base64
	 */

	//	生成支付二维码
	var getEcode = function() {
		//	
		var temp_obj = {
			'orderAmount': $scope.sumMoney,
			'remark': '',
			'backUrl': '192.168.156.141:8090/yytCSBank/v1/ddfh',
			'timeOut': 360,
			'deviceId': $scope.app.device_info.user.terminalId,
			'cardNo': $scope.app.user_info.card_no
		};

		httpService.ajaxPost(httpService.API.href + '/api/yytCSBank/v1/ecode', temp_obj)
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytCSBank/v1/ecode:' + JSON.stringify(res));

				if(res.succeed) {
					$scope.data.ecodeInfo = res.data;
				} else {
					$scope.systemError('获取二维码失败：请与维护人员联系');
					$scope.locationBk('app.card');
				}
			});
	}

	//	支付订单查询
	var ddcx = function(merchOrder) {
		httpService.ajaxGet(httpService.API.href + '/api/yytCSBank/v1/ddcx/' + merchOrder)
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytCSBank/v1/ddcx:' + JSON.stringify(res));

				if(res.succeed) {
					//	订单详情
					$scope.orderInfo = res.data;
					//
					if($scope.orderStatus) return;

					if(res.data.OrderStat == 1) {
						//	支付成功
						$interval.cancel($scope.timer);
						$scope.timer = null;
						//
						$scope.orderStatus = true;

						if($scope.isRegistConfirm) return;
						//	挂号确认
						registConfirm(6);
					} else if(res.data.OrderStat == 5) {
						//	支付失败
						$scope.systemError('支付失败：请与维护人员联系');
						$scope.locationBk();
					} else {
						//
					}
				} else {
					//
				}
			});
	};

	//	退款
	var ddtk = function(orderId, staffId, cancelReason) {
		httpService.ajaxGet(httpService.API.href + '/api/yytCSBank/v1/ddtk/' + orderId + '/' + staffId + '/' + cancelReason)
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytCSBank/v1/ddtk:' + JSON.stringify(res));

				if(res.succeed) {
					//
				} else {
					//	错误消息
					$scope.systemError(res.message);
				}
			})
	}

	//  =====================  / 扫码支付  =========================

	//   提交  挂号确认
	$scope.res_registConfirm = {
		Visitno: ''
	};
	//
	var registConfirm = function(type) {
		//   加入流水号
		$scope.form_data.paymentIndex = $scope.bankRechargeObj.Trace_no;
		//
		var temp_obj = angular.copy($scope.form_data);
		//
		if(type == 7) {
			temp_obj.paymentIndex = $scope.bankRechargeObj.Terminal + $scope.bankRechargeObj.Trace_no;
			temp_obj.paymentType = type;
		} else if(type == 6) {
			temp_obj.paymentIndex = $scope.orderInfo.OrderId;
			temp_obj.paymentType = type;
		}

		//  支付成功提交挂号确认
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/registConfirm', temp_obj)
			.then(function(res) {
				if(res.succeed) {
					//   成功
					$scope.res_registConfirm = res.data;
					$scope.isRegistConfirm = true;
					//   取打印模板
					$scope.statusFn2();
				} else {
					//  失败
					checkGhPay($scope.bankRechargeObj.Trace_no, res.message);
				}
			});
	}

	//  当班挂号结果查询
	var checkGhPay = function(paymentIndex, message) {
		//  
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/checkGhPay/' + $scope.bankRechargeObj.Terminal + paymentIndex)
			.then(function(res) {
				if(res.succeed) {
					//   查询成功
					//   取打印模板
					$scope.statusFn2();
				} else if(res.succeed == false && res.code == -1) {
					//
					$scope.bankCorrectStatus = 1;
					$scope.statusFn2();
					//
					$scope.systemError('请求超时：请与工作人员联系');
					//
					$scope.locationBk();
				} else {
					//  失败
					if($scope.payMethod == 0) {
						//  银行充正
						$scope.bankCorrect(paymentIndex, $scope.sumMoney_minute);
					} else if($scope.payMethod == 1) {
						//	退款
						ddtk($scope.orderInfo.OrderId, 11, $scope.app.device_info.user.terminalNo);
					}

					//  提示预约失败请重新预约
					$scope.systemError('挂号失败：' + message);
				}
			});
	}

	//   点击确定 
	$scope.statusOk = function() {
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_020');
		$scope.status = 11;
	}

	//  1 确认
	$scope.statusFn1 = function() {
		//  灯光提示
		window.terminal && window.terminal.JSOpenTwinkleLED('4');
		//   银行支付
		bankRecharge($scope.sumMoney_minute);
		$scope.payMethod = 0;
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_021');
		//
		$scope.status = 2;
	}

	//	扫码支付
	$scope.statusFn4 = function() {
		//
		getEcode();

		//	订单轮询 秒查询一次
		$scope.timer = $interval(function() {
			$scope.data.ecodeInfo.MerchOrder && ddcx($scope.data.ecodeInfo.MerchOrder);
		}, 1 * 3000);

		//
		$scope.payMethod = 1;
		//
		$scope.status = 12;
	}

	//	页面跳转	停止轮询
	$scope.$on('$destroy', function() {
		$interval.cancel($scope.timer);
		$scope.timer = null;
	});

	//  取打印凭条返回
	$scope.res_zzghPrint = null;
	//  系统正在处理中
	//  0 失败凭条   1 成功凭条
	$scope.statusFn2 = function() {
		//
		$scope.status = 3;

		//   取打印模板
		var temp_obj = {
			cardNo: $scope.app.user_info.card_no,
			patName: $scope.app.user_info.PatName,
			depName: $scope.deptName,
			doctName: $scope.doct_name,
			pbxh: $scope.res_registConfirm.Visitno,
			visitDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
			amPm: $scope.am_pm,
			patientID: $scope.app.user_info.PatientID,
			times: $filter('date')(new Date(), 'yyyy-MM-dd'),
			amount: (+$scope.sumMoney).toFixed(2),
			checkTime: $scope.clinic_time_start + '-' + $scope.clinic_time_end,
			yhCardNo: $scope.bankRechargeObj.Pan,
			prescRecordID: '',
			type: '1',
			//    加入科室地址
			detailed: JSON.stringify([{
				"floor_name": $scope.Dept_area
			}])
		}
		// log
		window.terminal && window.terminal.WriteLog('rq /api/yytMace/v1/zzghPrint:' + JSON.stringify(temp_obj));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/zzghPrint', temp_obj)
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytMace/v1/zzghPrint:' + JSON.stringify(res));
				//
				if(res.succeed) {
					//    开始打印
					window.terminal && window.terminal.PrintReceipt($scope.printStringEndFn(res.data.print, $scope.bankCorrectStatus), '', '');
					//
					$scope.res_zzghPrint = res.data;
				} else {
					//  提交失败
					$scope.systemError('打印失败请与维护人员联系');

					//  返回选择医生
					$scope.locationBk('app.card.department.registered');
				}
			});

	}

	//   凭条打印更新 打印结果上传
	//  0 失败 1 成功
	var printLog = function() {
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/printLog', {
				lid: $scope.res_zzghPrint.lid,
				type: $scope.bankCorrectStatus == 0 ? 1 : 0
			})
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res 预约挂号 /api/yytMace/v1/printLog:' + JSON.stringify(res));
			});
	}

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
			//
			printLog();
			//
			$scope.statusFn3();
			//   
		} else if(res_Status == '99') {
			//   打开打印错误弹窗
			$scope.modelOpenPrintError(res_str);
		} else {
			//  打印异常
			//  提交失败
			$scope.systemError('打印失败请与工作人员联系');
		}
	}

	//  正在打印凭条
	$scope.statusFn3 = function() {
		$scope.status = 4;
		//
		if($scope.payMethod == 0) {
			//  退卡
			$scope.bankOutCard();
			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('4');
			//  秒关闭
			$timeout(function() {
				window.terminal && window.terminal.JSCloseTwinkleLED('4');
			}, 3000);
			//   停止语音
			$scope.audio_list.allStop();
			//
			$scope.audio_list.play('audio_013');
			//   播放声音
			$timeout(function() {
				$scope.audio_list.play('audio_017');
			}, 3000);
		} else if($scope.payMethod == 1) {
			//   播放声音
			$scope.audio_list.allStop();
			$scope.audio_list.play('audio_013');
		}

		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 20;
		tm.fnAutoRefreshfn(tm);
	}

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("cardDepartmentRegisteredDocinfoDepCtrl");
	if(tm.Key != "cardDepartmentRegisteredDocinfoDepCtrl") {
		tm.Key = "cardDepartmentRegisteredDocinfoDepCtrl";
		tm.keyctrl = "app.card.department.registered.docinfo.dep";
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
			$scope.countdown_time = 360;
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
		$scope.audio_list.play('audio_006');
	}
	run();

});