/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-01-03 11:15:59 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-22 17:17:25
 */

'use strict';

/**
 * 预约挂号  科室
 */
app.controller('reservationRestimeDepartmentTransitRegisteredDocinfoDepCtrl', function($scope, $interval, $timeout, httpService, $filter, globalFn) {

	//   状态  1, 确认挂号。2，系统正在处理。3，打印凭条。4，挂号成功
	$scope.status = 1;

	//	支付方式 	 0, 银行卡;	1, 在线支付;	2, 现金
	$scope.payMethod = '';

	//  预约挂号在线支付 缴费状态
	$scope.isOrderPayCompleted = false;
	
	//	在线支付订单状态	true 查询成功	false 查询失败
	$scope.orderStatus = false;

	//   当前页面返回秒数
	$scope.countdown_time = 360;

	//
	$scope.data = {
		//	二维码信息
		'ecodeInfo': {}
	}

	$scope.item = $scope.docInfoItem;
	//   金额转分
	$scope.item.money_minute = +$scope.item.visitCost ? globalFn.accMul($scope.item.visitCost, 100) : 0;
	//   序号转换
	var temp_visitNo = $scope.item.number ? $scope.item.number.split('|') : [];
	$scope.item.number_visitNo = temp_visitNo.length > 0 ? temp_visitNo[0] : '';

	//   预约时间数字格式  用于页面显示
	$scope.restime_date = new Date($scope.item.scheduleDate);

	//   加入本周日期
	var weekday = new Array(7);
	weekday[0] = "星期天";
	weekday[1] = "星期一";
	weekday[2] = "星期二";
	weekday[3] = "星期三";
	weekday[4] = "星期四";
	weekday[5] = "星期五";
	weekday[6] = "星期六";

	//   预约时间星期
	$scope.restime_date_week = weekday[(new Date($scope.item.scheduleDate)).getDay()];

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
		window.terminal && window.terminal.WriteLog('硬件调用： reservationRestimeDepartmentTransitRegisteredDocinfoDepCtrl window.terminal.OpenBankModel: money：' + JSON.stringify(money));
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
		window.terminal && window.terminal.WriteLog('硬件回调： reservationRestimeDepartmentTransitRegisteredDocinfoDepCtrl terminal_device.build_card.cb_money: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//
		//   关闭遮罩层
		window.terminal && $scope.modelClosePay.close('ok');
		//
		$scope.bankRechargeStatus = res_Status;
		$scope.bankRechargeObj = res_obj;
		//  
		//alert('银行充值回调');
		if(res_Status == 0) {
			//alert('银行充值成功');
			//   充值成功

			$scope.$apply();

			//  支付完成确认
			orderPayCompleted(7);
		} else {
			//  alert('银行充值失败');
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

			//   预约单详情查询
			orderDetailInfo($scope.res_SubmitOrder.orderId, function(res_order_info) {
				if(res_order_info.succeed) {
					//  预约退号
					var temp_obj = {
						//  系统预约单编码
						'orderId': $scope.res_SubmitOrder.orderId,
						//  医院代码
						'hosOrgCode': $scope.form_data.hosOrgCode,
						//  号源ID
						'numSourceId': $scope.res_SubmitOrder.numSourceId,
						//  平台用户编码
						'platformUserId': res_order_info.data.platformUserId,
						//  取号密码
						'takePassword': $scope.res_SubmitOrder.takePassword,
						//  退号发起对象
						'cancelObj': '2',
						//  退号原因
						'cancelReason': '0',
						//  备注
						'cancelDesc': '自助机自动退号',
					}
					//   预约退号
					OrderCancel(temp_obj, function(res_order_cancel) {
						if(res_order_cancel.succeed) {
							//   退号成功
							//  返回选择医生
							$scope.locationBk('app.reservation.restime.department.transit.registered');
						} else {
							//  提交失败
							//  alert('退号失败');
							//   
							$scope.systemError('退号失败');
							//  返回选择医生
							$scope.locationBk('app.reservation.restime.department.transit.registered');
						}
					});

				} else {
					//  提交失败
					//  alert('预约单详情失败');
					$scope.systemError('预约单详情失败');
					//  返回选择医生
					$scope.locationBk('app.reservation.restime.department.transit.registered');
				}
			});
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
		window.terminal && window.terminal.WriteLog('硬件调用： reservationRestimeDepartmentTransitRegisteredDocinfoDepCtrl window.terminal.CorrectBankModel: trace_no' + JSON.stringify(trace_no) + ' money：' + JSON.stringify(money));
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
		window.terminal && window.terminal.WriteLog('硬件回调： reservationRestimeDepartmentTransitRegisteredDocinfoDepCtrl terminal_device.build_card.cb_money_filling: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//
		$scope.bankCorrectStatus = res_Status;
		$scope.bankCorrectObj = res_obj;
		//
		if(res_Status == 0) {
			//   充正成功
			// alert('充正成功');
			$scope.systemError('预约失败请重新预约');

			//  返回选择医生
			$scope.locationBk('app.reservation.restime.department.transit.registered');

		} else {
			//   充正失败
			// alert('充正失败');
			$scope.systemError('支付成功：预约失败请与工作人员联系');
			//   打印支付成功预约失败凭条
			$scope.statusFn2();

			//   打印完成再返回 选择医生
			//  返回选择医生
			$scope.locationBk('app.reservation.restime.department.transit.registered');
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
			'orderAmount': +$scope.item.visitCost,
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

						if($scope.isOrderPayCompleted) return;
						//  支付完成确认
						orderPayCompleted(6);
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
	}

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

	//   预约提交返回数据
	$scope.res_SubmitOrder = null;
	//   预约提交数据
	$scope.form_data = {
		//  排班ID
		'scheduleId': $scope.item.scheduleId,
		//  号源ID
		'numSourceId': $scope.item.numSourceId,
		//  诊疗卡卡号
		'mediCardId': $scope.app.user_info.card_no,
		//  第三方预约编码
		'frontProviderOrderId': '',
		//  医院代码
		'hosOrgCode': $scope.item.hosOrgCode,

		//  医院名称
		'hosName': $scope.item.hosName,
		//  科室代码
		'hosDeptCode': $scope.item.hosDeptCode,
		//  科室名称
		'deptName': $scope.item.deptName,
		//  医生代码
		'hosDoctCode': $scope.item.hosDoctCode,
		//  医生名称
		'doctName': $scope.item.doctName,

		//  出诊级别编码
		'visitLevelCode': $scope.item.visitLevelCode,
		//  出诊级别
		'visitLevel': $scope.item.visitLevel,
		//  出诊费用
		'visitCost': $scope.item.visitCost,
		//  出诊时段
		'timeRange': $scope.item.timeRange,
		//  就诊序号
		'visitNo': $scope.item.number_visitNo,

		//  取号密码
		'takePassword': '',
		//  预约时间
		'orderTime': $scope.item.scheduleDate + ' ' + $scope.item.startTime,
		//  平台用户代码
		'platformUserId': '',
		//  证件类型  01 身份证
		'userCardType': '01',
		//  证件号码
		'userCardId': $scope.app.user_info.IDCard,
		//	患者ID
		'patientId': $scope.app.user_info.PatientID,

		//  用户姓名
		'userName': $scope.app.user_info.PatName,
		//  手机号码
		'userPhone': $scope.app.user_info.TelephoneNo,
		//  用户性别
		'userSex': $scope.app.user_info.PatSex,
		//  用户出生日期
		'userBD': $scope.app.user_info.PatBirthday.substr(0, 10),
		//  用户联系地址
		'userContAdd': $scope.app.user_info.PatAddress,
	}

	//   确认数据返回
	$scope.res_orderPayCompleted = null;
	//   确认数据
	$scope.form_data_completed = {
		//  排班ID
		'scheduleId': '',
		//  号源ID
		'numSourceId': '',
		//  预约ID
		'orderId': '',
		//  前台服务商订单ID
		'frontProviderOrderId': '',
		//  金额
		'visitCost': '',
		//  支付交易号
		'payTradeNo': '',
	}

	//   预约提交
	var SubmitOrder = function() {
		//   出诊时段 中文转数字  由于HIS没有返回数字 所以手动转换
		var temp_obj = angular.copy($scope.form_data);
		if(temp_obj.timeRange == '上午') {
			temp_obj.timeRange = '1';
		} else if(temp_obj.timeRange == '下午') {
			temp_obj.timeRange = '2';
		} else if(temp_obj.timeRange == '晚上') {
			temp_obj.timeRange = '3';
		}

		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/SubmitOrder', temp_obj)
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res 预约提交 /api/yytBase/v1/SubmitOrder:' + JSON.stringify(res));
				//
				if(res.succeed) {
					//   提交成功
					$scope.res_SubmitOrder = res.data;
					$scope.$apply();

					if($scope.status == 2) {
						//   银行支付
						bankRecharge($scope.item.money_minute);
					} else if($scope.status == 12) {
						//   在线支付
						getEcode();
					}
				} else {
					//  提交失败
					//  提示预约失败请重新预约
					$scope.systemError('预约失败：' + res.message);
					//  返回选择医生
					$scope.locationBk('app.reservation.restime.department.transit.registered');
				}
			});
	}

	//   取预约单详情
	var orderDetailInfo = function(orderId, cb) {
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/orderDetailInfo/' + orderId)
			.then(function(res) {
				typeof cb == "function" && cb(res);
			});
	}

	//   预约退号
	var OrderCancel = function(obj, cb) {
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/OrderCancel', obj)
			.then(function(res) {
				//
				typeof cb == "function" && cb(res);

			});
	}

	//  预约状态   true  预约成功  false  预约失败
	$scope.orderPayCompleted_status = true;
	//  支付完成确认
	var orderPayCompleted = function(type) {
		//	加入流水号
		if(type == 7) {
			$scope.form_data_completed.payTradeNo = $scope.bankRechargeObj.Terminal + $scope.bankRechargeObj.Trace_no;
		} else if(type == 6) {
			$scope.form_data_completed.payTradeNo = $scope.orderInfo.OrderId;
		}

		//   加入参数
		$scope.form_data_completed.scheduleId = $scope.res_SubmitOrder.scheduleId;
		$scope.form_data_completed.numSourceId = $scope.res_SubmitOrder.numSourceId;
		$scope.form_data_completed.orderId = $scope.res_SubmitOrder.orderId;
		$scope.form_data_completed.frontProviderOrderId = '';
		$scope.form_data_completed.visitCost = $scope.item.visitCost;
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/orderPayCompleted', $scope.form_data_completed)
			.then(function(res) {
				if(res.succeed) {
					//   支付完成确认
					$scope.res_orderPayCompleted = res.data;
					$scope.isOrderPayCompleted = true;
					//   取打印凭条

					//   进入第二步打印
					$scope.statusFn2();
				} else {
					//  提交失败
					//   预约单详情查询
					orderDetailInfo($scope.res_SubmitOrder.orderId, function(res_order_info) {
						if(res_order_info.succeed) {
							//
							if(res_order_info.data.orderStatus == 2) {
								//    预约状态为2已支付
								//   取打印凭条

								//   进入第二步打印
								$scope.statusFn2();

							} else if(res_order_info.data.orderStatus == 1) {
								//    已预约未支付
								//  预约退号
								var temp_obj = {
									//  系统预约单编码
									'orderId': $scope.res_SubmitOrder.orderId,
									//  医院代码
									'hosOrgCode': $scope.form_data.hosOrgCode,
									//  号源ID
									'numSourceId': $scope.res_SubmitOrder.numSourceId,
									//  平台用户编码
									'platformUserId': res_order_info.data.platformUserId,
									//  取号密码
									'takePassword': $scope.res_SubmitOrder.takePassword,
									//  退号发起对象
									'cancelObj': '2',
									//  退号原因
									'cancelReason': '0',
									//  备注
									'cancelDesc': '自助机自动退号',
								}
								//   预约退号
								OrderCancel(temp_obj, function(res_order_cancel) {
									if(res_order_cancel.succeed) {
										//   退号成功
										if($scope.payMethod == 0) {
											//    银行充正
											$scope.bankCorrect($scope.bankRechargeObj.Trace_no, $scope.item.money_minute);
										} else if($scope.payMethod == 1) {
											//	退款
											ddtk($scope.orderInfo.OrderId, 11, $scope.app.device_info.user.terminalNo);
										}

									}
									if(res_order_cancel.succeed == false && res_order_cancel.code == -1) {
										//
										$scope.systemError('请求超时：请与工作人员联系');
										//
										$scope.locationBk();
									} else {
										//  提交失败
										//   
										$scope.systemError('退号失败-请联系维护人员');
										//   打印支付成功预约失败凭条

										//   打印完成再返回 选择医生
										//  返回选择医生
										$scope.locationBk('app.reservation.restime.department.transit.registered');
									}
								});

							}

						} else if(res.succeed == false && res.code == -1) {
							//   超时设置 预约失败
							$scope.orderPayCompleted_status = false;
							//   进入第二步打印
							$scope.statusFn2();
							//
							$scope.systemError('请求超时：请与工作人员联系');
							//
							$scope.locationBk();
						} else {
							//  查询失败
							if($scope.payMethod == 0) {
								//  银行充正
								$scope.bankCorrect($scope.bankRechargeObj.Trace_no, $scope.item.money_minute);
							} else if($scope.payMethod == 1) {
								//	退款
								ddtk($scope.orderInfo.OrderId, 11, $scope.app.device_info.user.terminalNo);
							}

							//   预约失败
							$scope.systemError('预约失败：请重新预约');
							//   打印支付成功预约失败凭条

							//   打印完成再返回 选择医生
							//  返回选择医生
							$scope.locationBk();
						}
					});

					//   预约取消
					//   取预约单详情
					//orderDetailInfo($scope.res_SubmitOrder.orderId);
				}
			});
	}

	//   凭条打印更新 打印结果上传
	var printLog = function() {
		//  alert('取预约单详情')
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/printLog', {
				lid: $scope.res_yyPrint.lid,
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
			//   凭条打印更新 打印结果上传
			printLog();
			//
			$scope.statusFn4();
		} else if(res_Status == '99') {
			//   打开打印错误弹窗
			$scope.modelOpenPrintError(res_str);
		} else {
			//  打印异常
			// alert('打印异常');
			$scope.systemError('打印异常请与工作人员联系');
		}
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
		//   提交预约
		SubmitOrder();

		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_021');
		//  灯光提示
		window.terminal && window.terminal.JSOpenTwinkleLED('4');
		//  
		$scope.payMethod = 0;
		//
		$scope.status = 2;

	}

	//   预约打印返回数据
	$scope.res_yyPrint = null;
	//  系统正在处理中
	$scope.statusFn2 = function() {
		//   停止语音
		$scope.audio_list.allStop();
		//  播放生音
		$scope.audio_list.play('audio_008');
		//  
		$scope.status = 3;

		var temp_obj = {
			patName: $scope.app.user_info.PatName,
			cardNo: $scope.app.user_info.card_no,
			patientID: $scope.app.user_info.PatientID,
			orderId: $scope.res_SubmitOrder.orderId,
			doctName: $scope.item.doctName,
			depName: $scope.item.deptName,
			visitDate: $scope.res_orderPayCompleted.orderTime,
			visitNo: $scope.res_orderPayCompleted.visitNo,
			orderTime: $scope.res_orderPayCompleted.orderTime + " " + $scope.res_orderPayCompleted.timeRange,
			startTime: $scope.item.startTime.substr(0, 5),
			endTime: $scope.item.endTime.substr(0, 5),
			visitCost: (+$scope.res_orderPayCompleted.visitCost).toFixed(2),
			timeRange: $scope.res_orderPayCompleted.timeRange
		}
		// log
		window.terminal && window.terminal.WriteLog('rq /api/yytMace/v1/yyghPrint:' + JSON.stringify(temp_obj));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/yyghPrint', temp_obj)
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytMace/v1/yyghPrint:' + JSON.stringify(res));
				//
				if(res.succeed) {
					//   
					//    开始打印
					var temp_str = '----------------------------------';
					if(($scope.bankCorrectStatus != 0 || $scope.orderPayCompleted_status == false) && res.data.print.indexOf(temp_str) > -1) {
						res.data.print = res.data.print.substr(0, res.data.print.indexOf(temp_str) + temp_str.length);
						res.data.print = res.data.print + '\n\n温馨提示：缴费失败但已扣费，请联系工作人员人工处理。\n此凭条清妥善保管';
						//
						window.terminal && window.terminal.PrintReceipt(res.data.print, '', '');
					} else {
						res.data.print = res.data.print.substr(0, res.data.print.indexOf(temp_str) + temp_str.length);
						res.data.print = res.data.print + '\n\n温馨提示：此凭条不作为就诊凭证，如有任何问题请联系工作人员。';
						//
						window.terminal && window.terminal.PrintReceipt(res.data.print, '', '');
					}
					//
					$scope.res_yyPrint = res.data;
					//
				} else {
					//
				}
			});

		//  显示第4步
		$scope.statusFn3();
	}

	//  正在打印凭条
	$scope.statusFn3 = function() {
		//   打印条码
		$scope.status = 4;

	}

	//  挂号成功
	$scope.statusFn4 = function() {
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
			$scope.audio_list.allStop();
			$scope.audio_list.play('audio_013');
		}

		//
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 10;
		tm.fnAutoRefreshfn(tm);
		//
		$timeout(function() {
			$scope.locationBk('app.index');
		}, 3000);

	}

	//	扫码支付
	$scope.statusFn5 = function() {
		//   提交预约
		SubmitOrder();

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

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("reservationRestimeDepartmentTransitRegisteredDocinfoDepCtrl");
	if(tm.Key != "reservationRestimeDepartmentTransitRegisteredDocinfoDepCtrl") {
		tm.Key = "reservationRestimeDepartmentTransitRegisteredDocinfoDepCtrl";
		tm.keyctrl = "app.reservation.restime.department.transit.registered.docinfo.dep";
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

	//
	var run = function() {
		//
		$scope.audio_list.play('audio_006');
	}
	run();

});