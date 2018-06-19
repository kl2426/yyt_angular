/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:35:21 
 * @Last Modified by: wu
 * @Last Modified time: 2018-06-02 15:18:19
 */
'use strict';

/**
 * 门诊缴费 - 列表控制器
 */
app.controller('clinicCtrl', function ($scope, $interval, httpService, $filter, $timeout, globalFn, $q) {

	//   当前页面返回秒数
	$scope.countdown_time = 360;

	//   状态1  列表   2 选择支付方式
	$scope.status = 1;

	//   是否显示返回按钮  true  有返回 按钮  不显示 遮挡层。  false 反之
	$scope.show_back = true;

	//	支付方式 	 1, 银行卡;	2, 在线支付;	3, 现金
	$scope.payMethod = '';

	//  在线支付 缴费状态
	$scope.isPrescCharge = false;

	//	在线支付订单状态	true 查询成功	false 查询失败
	$scope.orderStatus = false;

	//
	$scope.items_loadding = false;

	//  数据
	$scope.data = {
		'form': {
			startDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
			endDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
			// startDate: '2018-05-28',
			// endDate: '2018-05-28',
		},
		//  处方数据是否是同一个处方
		clinic_has_one: true,
		//  处方总金额  单位元
		clinic_sum: 0,
		//
		'item': null,
		//	二维码信息
		'ecodeInfo': {},
		//
		'items': [],
		//   对items 数据进行分页
		'page': {
			pageIndex: 1,
			pageSize: 8,
			total: 0,
			row: [],
			//   分页初始化
			pageFn: function (index) {
				if ($scope.data.page.total > (index - 1) * $scope.data.page.pageSize) {
					$scope.data.page.row = $scope.data.items.slice((index - 1) * $scope.data.page.pageSize, $scope.data.page.pageSize * index);
					$scope.data.page.pageIndex = index;
				} else {
					$scope.data.page.row = $scope.data.items.slice(0, $scope.data.page.pageSize * index);
					$scope.data.page.pageIndex = 1;
				}
			}
		}
	};

	//   获取门诊处方（当班挂号）
	var patientPres = function (form, cb) {
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/patientPres', form)
			.then(function (res) {
				if (res.succeed) {
					if (res.data.item.__proto__.constructor == Array) {
						res.data.item = res.data.item;
					} else {
						res.data.item = [res.data.item];
					}
					//   加入 registegOrderID
					for (var i in res.data.item) {
						res.data.item[i].registegOrderID = form.registegOrderID;
					}
					typeof cb == "function" && cb(res.data.item);
				} else {
					typeof cb == "function" && cb([]);
				}
			});
	};

	//   我的门诊挂号记录
	var patientRecord = function (outPatientID, startDate, endDate) {
		//
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/patientRecord/' + outPatientID + '/' + startDate + '/' + endDate)
			.then(function (res) {
				//
				if (res.succeed) {
					if (res.data.item.__proto__.constructor == Array) {
						res.data.item = res.data.item;
					} else {
						res.data.item = [res.data.item];
					}
					//  计数
					var index = res.data.item.length;
					//
					for (var i in res.data.item) {
						var temp_date = new Date(res.data.item[i].ExamDT.substr(0, 10));

						//
						var temp_obj = {
							registegOrderID: res.data.item[i].RegistegOrderID,
							cardNo: $scope.app.user_info.card_no,
							outPatientID: $scope.app.user_info.PatientID,
							startDT: $filter('date')(temp_date.setDate(temp_date.getDate() - 0), 'yyyy-MM-dd'),
							endDT: $filter('date')((new Date()), 'yyyy-MM-dd')
						};
						//   获取门诊处方（当班挂号）
						patientPres(temp_obj, function (data) {
							index = index - 1;
							for (var b in data) {
								$scope.data.items.push(data[b]);
							}
							//  最后一个
							if (index <= 0) {
								//
								$scope.items_loadding = false;
								//  加入序号   计算总金额
								for (var c in $scope.data.items) {
									$scope.data.items[c].index = +c + 1;
									$scope.data.clinic_sum = globalFn.numberSumFloat($scope.data.clinic_sum, $scope.data.items[c].TotalFee, 2);
								}
								//  取处方明细
								for (var e in $scope.data.items) {
									prescriptionInfo($scope.data.items[e].PrescriptionID, $scope.data.items[e]);
								}
								//   验证是否是同一个挂号记录  用于是否显示可一次性打印按钮   如果多个挂号记录不能一次性打印
								var temp_item_registegOrderID = '';
								for (var d in $scope.data.items) {
									if (d == 0) {
										temp_item_registegOrderID = $scope.data.items[d].registegOrderID;
									} else {
										if (temp_item_registegOrderID != $scope.data.items[d].registegOrderID) {
											$scope.data.clinic_has_one = false;
										}
									}
								}
								//
								$scope.data.page.total = $scope.data.items.length;
								//  分页
								$scope.data.page.pageFn(1);
							}
						})
					}
				} else {
					//
					$scope.items_loadding = false;
				}
			});
	};

	//   处方明细
	var prescriptionInfo = function (PrescriptionID, item) {
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/prescriptionInfo', {
			PrescriptionID: PrescriptionID
		})
			.then(function (res) {
				if (res.succeed) {
					if (res.data.item.__proto__.constructor == Array) {
						res.data.item = res.data.item;
					} else {
						res.data.item = [res.data.item];
					}
					item.res_PrescriptionID = res.data.item;
				} else {
					item.res_PrescriptionID = [];
				}
			});
	};

	//   点击缴费
	$scope.statusOk = function () {
		//
		$scope.status = 2;
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_020');
	};

	//   缴费
	$scope.payment = function () {
		//   遮挡 返回按钮
		$scope.show_back = false;
		//  银行缴费
		//  处方缴费前验证
		prescChargeBefore(7);
		//
		$scope.status = 3;
		//
		$scope.payMethod = 1;
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
	var bankRecharge = function (money) {
		money = money.toString();
		// log
		window.terminal && window.terminal.WriteLog('硬件调用： clinicCtrl window.terminal.OpenBankModel: money：' + JSON.stringify(money));
		//
		window.terminal && window.terminal.OpenBankModel(money);
	};

	/**
	 * 银行充值 .net 回调
	 * @param {string} res_Status  - 银行充值返回   0 分正常  非0异常
	 * @param {Object} res_obj - 银行充值返回  正常时为对像， 异常时为文本  。 对象属性见 .net 接口文档
	 * @return void
	 */
	terminal_device.build_card.cb_money = function (res_Status, res_obj) {
		//
		window.terminal && window.terminal.JSCloseTwinkleLED('4');
		// log
		window.terminal && window.terminal.WriteLog('硬件回调： clinicCtrl terminal_device.build_card.cb_money: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//
		$scope.bankRechargeStatus = res_Status;
		$scope.bankRechargeObj = res_obj;

		if (res_Status == 0) {
			//   充值成功
			$scope.$apply();

			//  处方缴费
			prescCharge(7);
		} else {
			//  充值失败
			//  打开提示
			switch (res_Status) {
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
			$scope.locationBk();
		}
	};

	/**
	 * 银行充正
	 * @param {string} trace_no  - 支付完成流水号
	 * @param {string} money  - 充正金额 单位分
	 * @return void
	 */
	$scope.bankCorrect = function (trace_no, money) {
		money = money.toString();
		// log
		window.terminal && window.terminal.WriteLog('硬件调用： clinicCtrl window.terminal.CorrectBankModel: trace_no' + JSON.stringify(trace_no) + ' money：' + JSON.stringify(money));
		window.terminal && window.terminal.CorrectBankModel(trace_no, money);
	};

	/**
	 * 银行充正 .net 回调
	 * @param {string} res_Status  - 银行充正返回   0 分正常  非0异常
	 * @param {Object} res_obj - 银行充正返回  正常时为对像， 异常时为文本  。 对象属性见 .net 接口文档
	 * @return void
	 */
	terminal_device.build_card.cb_money_filling = function (res_Status, res_obj) {
		// log
		window.terminal && window.terminal.WriteLog('硬件回调： clinicCtrl terminal_device.build_card.cb_money_filling: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//
		$scope.bankCorrectStatus = res_Status;
		$scope.bankCorrectObj = res_obj;
		//
		if (res_Status == 0) {
			//   充正成功
			$scope.systemError('处方缴费失败，请重新缴费');
			//  返回选择医生
			$scope.locationBk();
		} else {
			//   充正失败
			$scope.systemError('支付成功：处方缴费失败请与工作人员联系');
			//   打印支付成功挂号失败凭条
			//   取打印模板
			$scope.statusFn1();
			//   打印完成再返回 选择医生
			//  返回选择医生
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
	var getEcode = function () {
		//
		var temp_obj = {
			'orderAmount': $scope.data.clinic_sum,
			'remark': '',
			'backUrl': '192.168.156.141:8090/yytCSBank/v1/ddfh',
			'timeOut': 360,
			'deviceId': $scope.app.device_info.user.terminalId,
			'cardNo': $scope.app.user_info.card_no
		};

		httpService.ajaxPost(httpService.API.href + '/api/yytCSBank/v1/ecode', temp_obj)
			.then(function (res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytCSBank/v1/ecode:' + JSON.stringify(res));

				if (res.succeed) {
					$scope.data.ecodeInfo = res.data;
				} else {
					$scope.systemError('获取二维码失败：请与维护人员联系');
					$scope.locationBk('app.card');
				}
			});
	};


	
	//	支付订单查询
	var ddcx = function (merchOrder) {
		httpService.ajaxGet(httpService.API.href + '/api/yytCSBank/v1/ddcx/' + merchOrder)
			.then(function (res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytCSBank/v1/ddcx:' + JSON.stringify(res));

				if (res.succeed) {
					//	订单详情
					$scope.orderInfo = res.data;
					//
					if ($scope.orderStatus) return;

					//  支付失败交易数据
					var temp_obj = {
						//  交易流水号：orderId
						orderId: res.data.OrderId ? res.data.OrderId : '',
						//  银行卡：yhCardNo
						yhCardNo: '',
						//  交易类型：payType
						payType: '在线支付',
						//  金额：chargePrice
						chargePrice: res.data.OrderAmount ? res.data.OrderAmount : ''
					}
					//
					if (res.data.OrderStat == 1) {
						//	支付成功
						$interval.cancel($scope.timer);
						$scope.timer = null;
						//
						$scope.orderStatus = true;

						if ($scope.isPrescCharge) return;
						//  处方缴费
						prescCharge(6);
					} else if (res.data.OrderStat == 4){
						//   扫码支付超时
						//   遮挡 返回按钮
						$scope.show_back = false;
						//   超时
						if ($scope.ddcx_timeout < 0) {
							//  取扫码支付超时凭条
							jfPrint1(temp_obj).then(function (res_jfprint) {
								//  
								if (res_jfprint.succeed){
									//  打印扫码支付超时凭条
									//   硬件打印
									window.terminal && window.terminal.PrintReceipt(res_jfprint.data.print, '', '');
									//	支付失败
									$scope.systemError('支付失败：请与维护人员联系');
								}else{
									//	支付失败
									$scope.systemError('支付失败：支付超时，取失败凭条失败，请与维护人员联系');
								}
								//
								$scope.locationBk();
								//  跳出接下来的返回结果
								$scope.orderStatus = true;
							});
						}
					} else if (res.data.OrderStat == 5) {
						//  取扫码支付超时凭条
						jfPrint1(temp_obj).then(function (res_jfprint) {
							//  
							if (res_jfprint.succeed) {
								//  打印扫码支付超时凭条
								//   硬件打印
								window.terminal && window.terminal.PrintReceipt(res_jfprint.data.print, '', '');
								//	支付失败
								$scope.systemError('支付失败：请与维护人员联系');
								$scope.locationBk();
							} else {
								//	支付失败
								$scope.systemError('支付失败：支付超时，取失败凭条失败，请与维护人员联系');
								$scope.locationBk();
							}
							//  跳出接下来的返回结果
							$scope.orderStatus = true;
						});
						
					} else {
						//
					}
				} else {
					//
				}
			});
	};

	//	退款
	var ddtk = function (orderId, staffId, cancelReason) {
		httpService.ajaxGet(httpService.API.href + '/api/yytCSBank/v1/ddtk/' + orderId + '/' + staffId + '/' + cancelReason)
			.then(function (res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytCSBank/v1/ddtk:' + JSON.stringify(res));

				if (res.succeed) {
					//
				} else {
					//	错误消息
					$scope.systemError(res.message);
				}
			})
	};

	//  =====================  / 扫码支付  =========================

	//  处方缴费前验证
	var prescChargeBefore = function (type) {
		//  合并处方号
		var temp_prescRecordID = [];
		for (var i in $scope.data.items) {
			temp_prescRecordID.push($scope.data.items[i].PrescriptionID);
		}
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/prescChargeBefore', {
			prescRecordID: temp_prescRecordID.join('-'),
			paymentType: type,
			paymentCharge: $scope.data.clinic_sum,
		})
			.then(function (res) {
				if (res.succeed) {
					//  成功
					if ($scope.status == 3) {
						//  灯光提示
						window.terminal && window.terminal.JSOpenTwinkleLED('4');
						//   停止语音
						$scope.audio_list.allStop();
						//   播放声音
						$scope.audio_list.play('audio_021');
						//   银行充值
						bankRecharge(globalFn.accMul($scope.data.clinic_sum, 100));
					} else if ($scope.status == 12) {
						//   在线支付
						getEcode();
					}
				} else {
					//  失败
					$scope.systemError('处方缴费验证失败，请到窗口办理缴费手续！');
					$scope.locationBk();
				}
			});
	};

	//  处方缴费返回
	$scope.res_prescCharge = {};
	//  处方缴费
	var prescCharge = function (type) {
		//  合并处方号
		var temp_prescRecordID = [];
		for (var i in $scope.data.items) {
			temp_prescRecordID.push($scope.data.items[i].PrescriptionID);
		}
		//	加入流水号
		var _paymentIndex = '';
		if (type == 7) {
			_paymentIndex = $scope.bankRechargeObj.Terminal + $scope.bankRechargeObj.Trace_no;
		} else if (type == 6) {
			_paymentIndex = $scope.orderInfo.OrderId;
		}
		//
		var temp_obj = {
			prescRecordID: temp_prescRecordID.length > 0 ? temp_prescRecordID.join('-') : '',
			registerID: $scope.data.items[0].registegOrderID,
			paymentIndex: _paymentIndex,
			paymentType: type,
			paymentCharge: $scope.data.clinic_sum,
			paymentAccount: '',
			cardNo: $scope.app.user_info.card_no
		};
		//  log
		window.terminal && window.terminal.WriteLog('rq 处方缴费 /api/yytBase/v1/prescCharge:' + JSON.stringify(temp_obj));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/prescCharge', temp_obj)
			.then(function (res) {
				//  log
				window.terminal && window.terminal.WriteLog('res 处方缴费 /api/yytBase/v1/prescCharge:' + JSON.stringify(res));
				//
				if (res.succeed) {
					//  成功
					$scope.res_prescCharge = res.data;
					$scope.isPrescCharge = true;
					//   打印凭条
					// $scope.statusFn1();
					//   延时查询
					$timeout(function () {
						//   门诊已缴费处方号查询（处方缴费） 
						mzCFNO($scope.app.user_info.card_no, $scope.data.form.startDate, $scope.data.form.endDate, function (res_mzCFNO) {
							if (res_mzCFNO.succeed) {
								$scope.res_mzCFNO = res_mzCFNO.data;
								//   打印凭条
								$scope.statusFn1();
							} else {
								//  失败
								$scope.systemError('处方缴费失败：请与工作人员联系！');
								$scope.locationBk();
							}
						});
					},10000);
					
				} else {
					//  失败
					$scope.systemError('处方缴费失败：请与工作人员联系！');
					$scope.locationBk();
				}
				/*} else if(res.succeed == false && res.code == -1) {
					//
					$scope.systemError('请求超时：请与工作人员联系');
					//
					$scope.locationBk();
				} else {
					if($scope.payMethod == 1) {
						//  银行充正
						$scope.bankCorrect($scope.bankRechargeObj.Trace_no, globalFn.accMul($scope.data.clinic_sum, 100));
					} else if($scope.payMethod == 2) {
						//	退款
						ddtk($scope.orderInfo.OrderId, 11, $scope.app.device_info.user.terminalNo);
					}

					//  失败
					$scope.systemError('处方缴费失败：' + res.message);
					$scope.locationBk();
				}*/
			});
	};


	//  1.1.1.45.门诊已缴费处方号查询（处方缴费） 
	//	获取处方号及对应的发票号
	$scope.res_mzCFNO = {};
	var mzCFNO = function (cardNo, startDate, endDate, cb) {
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/mzCFNO/' + cardNo + '/' + startDate + '/' + endDate)
			.then(function (res) {
				typeof cb == "function" && cb(res);
			});
	}


	/**
	 * 查询超时凭条
	 * @param {object} form
	 */
	var jfPrint1 = function (form) {
		var temp_obj = {
			//  流水号
			// flow:'',
			//  打印日期：datetime
			datetime: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
			//  姓名：patName
			patName: $scope.app.user_info.PatName,
			//  卡号：cardNo
			cardNo: $scope.app.user_info.card_no,
			//  病人ID号：patientID
			patientID: $scope.app.user_info.PatientID,
			//  交易流水号：orderId
			orderId: '',
			//  银行卡：yhCardNo
			yhCardNo: '',
			//  交易类型：payType
			payType: '',
			//  金额：chargePrice
			chargePrice: '',
			//  机器号：macno
			macno: $scope.app.device_info.user.terminalNo,
		}
		temp_obj = angular.extend(temp_obj,form);

		return httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/jfPrint', temp_obj);
	};


	/**
	 * 查询打印凭条
	 * @param {object} temp_obj 取打印凭条数据对象
	 */
	var jfPrint = function (temp_obj) {
		return httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/jfPrint', temp_obj);
	};


	/**
	 * 调用硬件打印
	 *  items  整理后的凭条数据集  带请求完成状态值  带硬件是否打印完成状态值 （明细中第一条）
	 */
	$scope.devicePrint = function () {
		//   查询是否有未打印完成数据 有而打印 无则打印结束进入下一步
		var items = $scope.has_filter;
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
		window.terminal && window.terminal.WriteLog('硬件打印：门诊缴费 打印完成：打印数据：' + JSON.stringify($scope.has_filter));
	}


	//   筛选后数据
	$scope.has_filter = [];

	//   缴费成功 打印凭条
	$scope.statusFn1 = function () {
		//   筛选分票数据
		var temp_arr = [];
		for(var i in $scope.data.items){
			for(var b in $scope.res_mzCFNO){
				if ($scope.data.items[i].PrescriptionID == b){
					temp_arr.push($scope.res_mzCFNO[b]);
				}
			}
		}
		//   放入凭条数组 
		//   处方
		for(var i in temp_arr){
			//   执行科室
			for(var b in temp_arr[i]){
				//   凭条执行科室	含明细			
				$scope.has_filter.push(temp_arr[i][b]);
			}
		}
		//   计算总金额  处方时间
		//   凭条
		for(var i in $scope.has_filter){
			//   明细
			//   
			var temp_sum_money = 0;
			for(var b in $scope.has_filter[i]){
				//   计算明细总金额 乘
				var temp_mul = globalFn.accMul($scope.has_filter[i][b].num, $scope.has_filter[i][b].price);
				// 加
				temp_sum_money = globalFn.accAdd(temp_sum_money, temp_mul);
			}
			//  总金额
			$scope.has_filter[i][0].temp_sum_money = temp_sum_money;
			//  处方时间
			for(var b in $scope.data.items){
				if ($scope.has_filter[i][0].PrescRecordID == $scope.data.items[b].PrescriptionID){
					$scope.has_filter[i][0].PresDT = $scope.data.items[b].PresDT;
					break;
				}
			}
		}

		//
		if ($scope.has_filter.length < 1) {
			//   提示
			$scope.systemError('缴费失败：数据不完整，请与工作人员联系。');
			//  返回
			$scope.locationBk();
			return false;
		}

		//   提交取打印凭条
		var arr_promise = [];
		for (var i = 0; i < $scope.has_filter.length; i++) {
			//   打印凭条
			var temp_obj = {
				cardNo: $scope.app.user_info.card_no,
				patName: $scope.app.user_info.PatName,
				patientID: $scope.app.user_info.PatientID,
				yHCardNo: $scope.bankRechargeObj.Pan ? $scope.bankRechargeObj.Pan : '',
				fPFlow: $scope.has_filter[i][0].receiptSn,
				success: ($scope.bankCorrectStatus == 0 || $scope.bankCorrectStatus == undefined) ? '成功' : '',
				execDeptName: $scope.has_filter[i][0].ExecDeptName,
				paymentCharge: temp_sum_money,
				prescRecordID: $scope.has_filter[i][0].PrescRecordID,
				visitDate: $scope.has_filter[i][0].PresDT,
				detailed: $scope.has_filter[i][0].Detailed,
				num: i + 1
			};

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
					$scope.has_filter[b][0].temp_PrintTimes = res_jfPrint[b].data.PrintTimes;
					//   加入到第一条中 凭条打印文本
					$scope.has_filter[b][0].temp_print_text = res_jfPrint[b].data.print;
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
				window.terminal && window.terminal.WriteLog('门诊缴费-所有凭条日志：' + JSON.stringify($scope.has_filter));
			}

		}).catch(function (error) {
			//  提交失败
			$scope.systemError('打印失败请与维护人员联系');
			//  返回
			$scope.locationBk();
		});

	};

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
	terminal_device.print_receipt.cb_print_receipt = function (res_Status, res_str) {
		if (res_Status == '0') {
			//  正常打印  设置
			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('1');
			//  5秒关闭
			$timeout(function () {
				window.terminal && window.terminal.JSCloseTwinkleLED('1');
			}, 5000);

			//  继续打印 下一条
			$timeout(function () {
				$scope.devicePrint();
			}, 500);
			//  调用凭条打印更新
			// printLog();
		} else if (res_Status == '99') {
			//   打开打印错误弹窗
			$scope.modelOpenPrintError(res_str);
		} else {
			//  打印异常
			//  提交失败
			$scope.systemError('打印失败请与维护人员联系');
		}
	};

	//    完成打印
	$scope.statusFn2 = function () {
		//   显示 返回按钮
		$scope.show_back = true;

		$scope.status = 4;

		if ($scope.payMethod == 1) {
			//  退卡
			$scope.bankOutCard();
			//   停止语音
			$scope.audio_list.allStop();
			//   播放声音取走凭条
			$scope.audio_list.play('audio_019');
			$timeout(function () {
				$scope.audio_list.play('audio_017');
			}, 3000);

			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('1');
			//  秒关闭
			$timeout(function () {
				window.terminal && window.terminal.JSCloseTwinkleLED('1');
			}, 3000);
			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('4');
			//  秒关闭
			$timeout(function () {
				window.terminal && window.terminal.JSCloseTwinkleLED('4');
			}, 3000);
		} else if ($scope.payMethod == 2) {
			//   播放声音
			$scope.audio_list.allStop();
			$scope.audio_list.play('audio_013');
		}

		//
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 10;
		tm.fnAutoRefreshfn(tm);

	};

	//  支付查询超时  2分钟  单位：毫秒
	$scope.ddcx_timeout = 2 * 60 * 1000;
	
	//	扫码支付
	$scope.statusFn3 = function () {
		//  处方缴费前验证
		prescChargeBefore(6);
		//	订单轮询 秒查询一次
		$scope.timer = $interval(function () {
			$scope.data.ecodeInfo.MerchOrder && ddcx($scope.data.ecodeInfo.MerchOrder);
			//   超时
			$scope.ddcx_timeout = $scope.ddcx_timeout - 1 * 3000;
		}, 1 * 3000);

		//
		$scope.payMethod = 2;
		//
		$scope.status = 12;
	};

	//	页面跳转	停止轮询
	$scope.$on('$destroy', function () {
		$interval.cancel($scope.timer);
		$scope.timer = null;
	});

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("clinicCtrl");
	if (tm.Key != "clinicCtrl") {
		tm.Key = "clinicCtrl";
		tm.keyctrl = "app.clinic";
		tm.fnAutoRefresh = function () {
			console.log("开始调用定时器");
			tm.interval = $interval(function () {
				if ($scope.countdown_time > 0) {
					$scope.countdown_time = $scope.countdown_time - 1;
				} else {
					$interval.cancel(tm.interval);
					tm.interval = null;
					//   返回上一级
					$scope.locationBk();
				}
			}, 1000);
		};
		tm.fnStopAutoRefresh = function () {
			$scope.countdown_time = 360;
			console.log("进入取消方法");
			if (tm.interval != null) {
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

	var run = function () {
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_029');
		//
		//	解决长城重复打印凭条
		//	避免出现重复打印问题	查询日期从2018-04-13开始
		var temp_date = Date.parse(new Date('2018-05-13'));
		var now = Date.parse(new Date());

		var new_date = new Date();
		var date_end = $filter('date')(new Date(), 'yyyy-MM-dd');

		if (now < temp_date) {
			var date_begin = '2018-04-13';
		} else {
			var date_begin = $filter('date')(new_date.setDate(new_date.getDate() - 30), 'yyyy-MM-dd');
		}


		// date_begin = '2018-05-31';
		// date_end = '2018-05-31';

		//   我的门诊记录
		patientRecord($scope.app.user_info.PatientID, date_begin, date_end);


		// $scope.data.form.startDate = '2018-05-31';
		// $scope.data.form.endDate = '2018-05-31';
		// $timeout(function () {
		// 	//   门诊已缴费处方号查询（处方缴费） 
		// 	mzCFNO($scope.app.user_info.card_no, $scope.data.form.startDate, $scope.data.form.endDate, function (res_mzCFNO) {
		// 		if (res_mzCFNO.succeed) {
		// 			$scope.res_mzCFNO = res_mzCFNO.data;
		// 			//   打印凭条
		// 			$scope.statusFn1();
		// 		} else {
		// 			//  失败
		// 			$scope.systemError('处方缴费失败：请与工作人员联系！');
		// 			$scope.locationBk();
		// 		}
		// 	});
		// },5000);
	};
	run();

});