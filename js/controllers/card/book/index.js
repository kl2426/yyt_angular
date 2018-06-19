/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:34:48 
 * @Last Modified by:	wu
 * @Last Modified time: 2018-02-01 16:34:48
 */
'use strict';

/**
 * 挂号 购买病历本
 */
app.controller('cardBookCtrl', function($scope, $interval, $timeout, httpService, globalFn, $state) {

	//   状态  1, 确认购买病历本。2,系统正在处理。3,打印凭条。4,购买病历本成功
	$scope.status = 1;

	//	支付方式 	 0, 银行卡;	1, 在线支付;	2, 现金
	$scope.payMethod = '';

	//  在线支付 缴费状态
	$scope.isPrescCharge = false;

	//	在线支付订单状态	true 查询成功	false 查询失败
	$scope.orderStatus = false;

	//   当前页面返回秒数
	$scope.countdown_time = 360;

	//
	$scope.data = {
		//	
		'item': null,
		//	二维码信息
		'ecodeInfo': {}
	};

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
		// log
		window.terminal && window.terminal.WriteLog('硬件调用： cardBookCtrl window.terminal.OpenBankModel: money：' + JSON.stringify(money));
		//
		window.terminal && window.terminal.OpenBankModel(money);
		//   遮罩层
		window.terminal && $scope.modelOpenPay();
	};

	/**
	 * 银行充值 .net 回调
	 * @param {string} res_Status  - 银行充值返回   0 分正常  非0异常
	 * @param {Object} res_obj - 银行充值返回  正常时为对像， 异常时为文本  。 对象属性见 .net 接口文档
	 * @return void
	 */
	terminal_device.build_card.cb_money = function(res_Status, res_obj) {
		window.terminal && window.terminal.JSCloseTwinkleLED('4');
		// log
		window.terminal && window.terminal.WriteLog('硬件回调： cardBookCtrl terminal_device.build_card.cb_money: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//   关闭遮罩层
		window.terminal && $scope.modelClosePay.close('ok');

		$scope.bankRechargeStatus = res_Status;
		$scope.bankRechargeObj = res_obj;
		if(res_Status == 0) {
			//   充值成功
			$scope.$apply();

			//  处方缴费
			prescCharge(7);
		} else {
			//  充值失败
			//  打开提示
			$scope.$apply(function() {
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

				//	删除病历本处方号
				mzDelPres($scope.app.user_info.PatientID);
				//  退卡
				$scope.bankOutCard();
				//  返回
				$scope.locationBk('app.card');
			});
		}
	};

	/**
	 * 银行充正
	 * @param {string} trace_no  - 支付完成流水号
	 * @param {string} money  - 充正金额 单位分
	 * @return void
	 */
	$scope.bankCorrect = function(trace_no, money) {
		money = money.toString();
		// log
		window.terminal && window.terminal.WriteLog('硬件调用： cardBookCtrl window.terminal.CorrectBankModel: trace_no' + JSON.stringify(trace_no) + ' money：' + JSON.stringify(money));
		//
		window.terminal && window.terminal.CorrectBankModel(trace_no, money);
	};

	/**
	 * 银行充正 .net 回调
	 * @param {string} res_Status  - 银行充正返回   0 分正常  非0异常
	 * @param {Object} res_obj - 银行充正返回  正常时为对像， 异常时为文本  。 对象属性见 .net 接口文档
	 * @return void
	 */
	terminal_device.build_card.cb_money_filling = function(res_Status, res_obj) {
		// log
		window.terminal && window.terminal.WriteLog('硬件回调： cardBookCtrl terminal_device.build_card.cb_money_filling: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//
		$scope.bankCorrectStatus = res_Status;
		$scope.bankCorrectObj = res_obj;
		//
		if(res_Status == 0) {
			//   充正成功
			//  返回
			$scope.locationBk();
		} else {
			//   充正失败
			$scope.systemError('支付成功：购买病历本失败请与工作人员联系');

			//   打印支付成功购买病历本失败凭条
			//   取打印模板
			$scope.statusFn2();

			//  打印完成再返回
			//  返回
			$scope.locationBk();
		}
	};

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
			'orderAmount': $scope.data.item.chargePrice,
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
	};

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

						if($scope.isPrescCharge) return;
						//  处方缴费
						prescCharge(6);
					} else if(res.data.OrderStat == 5) {
						//	支付失败
						$scope.systemError('支付失败：请与维护人员联系');
						$scope.locationBk('app.card');
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
	};

	//  =====================  /扫码支付  =========================

	//	生成待缴费病历本处方号
	var mzInsPres = function(patientID) {
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/mzInsPres/' + patientID)
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytBase/v1/mzInsPres:' + JSON.stringify(res));

				if(res.succeed) {
					$scope.data.item = res.data;
				} else {
					$scope.systemError('获取病历本信息失败：请与维护人员联系');
				}
			});
	};

	//	删除待缴费病历本处方号
	var mzDelPres = function(patientID) {
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/mzDelPres/' + patientID)
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytBase/v1/mzDelPres:' + JSON.stringify(res));
			});
	};

	//  处方缴费前验证
	var prescChargeBefore = function(type) {
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/prescChargeBefore', {
				prescRecordID: $scope.data.item.PrescRecordID,
				paymentType: type,
				paymentCharge: $scope.data.item.chargePrice
			})
			.then(function(res) {
				if(res.succeed) {
					//  成功
					if(type == 7) {
						//  灯光提示
						window.terminal && window.terminal.JSOpenTwinkleLED('4');
						//   停止语音
						$scope.audio_list.allStop();
						//   播放声音
						$scope.audio_list.play('audio_021');
						//  金额分
						$scope.bookPrice_minute = globalFn.accMul($scope.data.item.chargePrice, 100);
						//   银行充值
						bankRecharge($scope.bookPrice_minute);
					} else if(type == 6) {
						//   在线支付
						getEcode();
					}
				} else {
					//  失败
					$scope.systemError('处方缴费验证失败');
					$scope.locationBk();
				}
			});
	};

	//  处方缴费返回
	$scope.res_prescCharge = {};
	//  处方缴费
	var prescCharge = function(type) {
		//	加入流水号
		var _paymentIndex = '';
		if(type == 7) {
			_paymentIndex = $scope.bankRechargeObj.Terminal + $scope.bankRechargeObj.Trace_no;
		} else if(type == 6) {
			_paymentIndex = $scope.orderInfo.OrderId;
		}

		var temp_obj = {
			prescRecordID: $scope.data.item.PrescRecordID,
			registerID: '',
			paymentIndex: _paymentIndex,
			paymentType: type,
			paymentCharge: $scope.data.item.chargePrice,
			paymentAccount: ''
		};
		//  log
		window.terminal && window.terminal.WriteLog('rq 处方缴费 /api/yytBase/v1/prescCharge:' + JSON.stringify(temp_obj));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/prescCharge', temp_obj)
			.then(function(res) {
				//  log
				window.terminal && window.terminal.WriteLog('res 处方缴费 /api/yytBase/v1/prescCharge:' + JSON.stringify(res));
				//
				if(res.succeed) {
					//  成功
					$scope.res_prescCharge = res.data;
					$scope.isPrescCharge = true;
					//   打印凭条
					$scope.statusFn2();
				} else if(res.succeed == false && res.code == -1) {
					//
					$scope.systemError('请求超时：请与工作人员联系');
					//
					$scope.locationBk();
				} else {
					if($scope.payMethod == 0) {
						//  银行充正
						$scope.bankCorrect($scope.bankRechargeObj.Trace_no, $scope.bookPrice_minute);
					} else if($scope.payMethod == 1) {
						//	退款
						ddtk($scope.orderInfo.OrderId, 11, $scope.app.device_info.user.terminalNo);
					}

					//  失败
					$scope.systemError('处方缴费失败：' + res.message);
					$scope.locationBk();
				}
			});
	};

	//   点击确定 
	$scope.statusOk = function() {
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_020');
		$scope.status = 11;
	};

	//   点击取消 
	$scope.cancle = function() {
		//  返回
		$scope.locationBk();
	};

	//  1 确认	银行卡支付
	$scope.statusFn1 = function() {
		//  处方缴费前验证
		prescChargeBefore(7);
		//
		$scope.payMethod = 0;
		//
		$scope.status = 2;
	};

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
			patientID: $scope.app.user_info.PatientID,
			prescRecordID: $scope.data.item.PrescRecordID,
			fPFlow: $scope.res_prescCharge.receiptSn,
			chargeName: $scope.data.item.chargeName,
			chargePrice: $scope.data.item.chargePrice,
			visitDate: '',
			detailed: ''
		};
		// log
		window.terminal && window.terminal.WriteLog('rq /api/yytMace/v1/blbPrint:' + JSON.stringify(temp_obj));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/blbPrint', temp_obj)
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytMace/v1/blbPrint:' + JSON.stringify(res));
				//
				if(res.succeed) {
					//    开始打印
					window.terminal && window.terminal.PrintReceipt($scope.printStringEndFn(res.data.print, $scope.bankCorrectStatus), '', '');
					//
					$scope.res_zzghPrint = res.data;
				} else {
					//  提交失败
					$scope.systemError('打印失败：请与维护人员联系');

					if($scope.payMethod == 0) {
						//	银行充正
						$scope.bankCorrect($scope.data.item.PrescRecordID, $scope.bookPrice_minute);
					} else if($scope.payMethod == 1) {
						//	退款
						ddtk($scope.orderInfo.OrderId, 11, $scope.app.device_info.user.terminalNo);
					}

					//	删除病历本处方号
					mzDelPres($scope.app.user_info.PatientID);
					//  返回
					$scope.locationBk();
				}
			});

	};

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
				window.terminal && window.terminal.WriteLog('res 购买病历本 /api/yytMace/v1/printLog:' + JSON.stringify(res));
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
			$scope.systemError('打印失败：请与工作人员联系');
		}
	};

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

			//   播放声音
			$scope.audio_list.allStop();
			$scope.audio_list.play('audio_013');
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
		$scope.countdown_time = 10;
		tm.fnAutoRefreshfn(tm);
	};

	//	扫码支付
	$scope.statusFn4 = function() {
		//  处方缴费前验证
		prescChargeBefore(6);

		//	订单轮询 秒查询一次
		$scope.timer = $interval(function() {
			$scope.data.ecodeInfo.MerchOrder && ddcx($scope.data.ecodeInfo.MerchOrder);
		}, 1 * 3000);

		//
		$scope.payMethod = 1;
		//
		$scope.status = 12;
	};

	//	页面跳转	停止轮询
	$scope.$on('$destroy', function() {
		$interval.cancel($scope.timer);
		$scope.timer = null;
	});

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("card_book");
	if(tm.Key != "card_book") {
		tm.Key = "card_book";
		tm.keyctrl = "app.card.book";
		tm.fnAutoRefresh = function() {
			console.log("开始调用定时器");
			tm.interval = $interval(function() {
				if($scope.countdown_time > 0) {
					$scope.countdown_time = $scope.countdown_time - 1;
				} else {
					$interval.cancel(tm.interval);
					tm.interval = null;
					//	删除病历本处方号
					$scope.isPrescCharge || mzDelPres($scope.app.user_info.PatientID);
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
				//
				var route = $state.current.name
				var pos = route.indexOf('book');
				if(pos == -1) {
					//	删除病历本处方号
					$scope.isPrescCharge || mzDelPres($scope.app.user_info.PatientID);
				}
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
		mzInsPres($scope.app.user_info.PatientID);
		//   播放声音
		$scope.audio_list.play('audio_006');
	};

	run();

});