/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:35:21 
 * @Last Modified by: wu
 * @Last Modified time: 2018-06-02 09:30:34
 */
'use strict';

/**
 * 挂号记录 - 就诊详情
 */
app.controller('clinicInfoCtrl', function ($scope, $interval, httpService, $filter, $stateParams, $timeout, globalFn, $q) {

	//   当前页面返回秒数
	$scope.countdown_time = 360;

	//	支付方式 	 0, 银行卡;	1, 在线支付;	2, 现金
	$scope.payMethod = '';

	//   是否显示返回按钮  true  有返回 按钮  不显示 遮挡层。  false 反之
	$scope.show_back = true;

	//  在线支付 缴费状态
	$scope.isPrescCharge = false;

	//	在线支付订单状态	true 查询成功	false 查询失败
	$scope.orderStatus = false;

	//
	$scope.items_loadding = false;
	//
	$scope.PrescriptionID = $stateParams.PrescriptionID;
	$scope.registegOrderID = $stateParams.registegOrderID;
	//   执行科室
	$scope.ExecDeptName = $stateParams.ExecDeptName;
	//   看诊时间
	$scope.PresDT = $stateParams.PresDT;

	//   状态1  列表   2 选择支付方式
	$scope.status = 1;

	//  数据
	$scope.data = {
		'mzCFNO_date':{
			startDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
			endDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
		},
		'form': {
			registegOrderID: $scope.registegOrderID,
			cardNo: $scope.app.user_info.card_no,
			outPatientID: $scope.app.user_info.PatientID,
			startDT: $scope.PresDT.substr(0, 10),
			endDT: $filter('date')((new Date()), 'yyyy-MM-dd'),
		},
		//   处方按执行科室拆分数组
		// ExecDept_items: [],
		//
		'item': null,
		//	二维码信息
		'ecodeInfo': {},
		//   处方详情
		'res_item': {},
		'items': [],
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

	//   获取门诊处方（当班挂号）
	var patientPres = function() {
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/patientPres', $scope.data.form)
			.then(function(res) {
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						res.data.item = res.data.item;
					} else {
						res.data.item = [res.data.item];
					}
					//   找当前处方
					for(var i in res.data.item) {
						if(res.data.item[i].PrescriptionID == $scope.PrescriptionID) {
							$scope.data.res_item = res.data.item[i];
							//   金额转分
							$scope.data.res_item.TotalFee_minute = $scope.data.res_item.TotalFee ? globalFn.accMul($scope.data.res_item.TotalFee, 100) : 0;
							break;
						}
					}
				} else {
					$scope.data.res_item = {};
				}
			});
	}

	//   处方明细
	var prescriptionInfo = function(PrescriptionID) {
		//
		$scope.items_loadding = true;
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/prescriptionInfo', {
				PrescriptionID: PrescriptionID
			})
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
					}
					$scope.data.page.total = $scope.data.items.length;
					//  分页
					$scope.data.page.pageFn(1);
				} else {
					$scope.data.items = [];
					$scope.data.page.total = 0;
				}
			});
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
		window.terminal && window.terminal.WriteLog('硬件调用： clinicInfoCtrl window.terminal.OpenBankModel: money：' + JSON.stringify(money));
		//
		window.terminal && window.terminal.OpenBankModel(money);
	};

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
		window.terminal && window.terminal.WriteLog('硬件回调： clinicInfoCtrl terminal_device.build_card.cb_money: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//
		$scope.bankRechargeStatus = res_Status;
		$scope.bankRechargeObj = res_obj;
		//
		//alert('银行充值回调');
		if(res_Status == 0) {
			//   充值成功
			$scope.$apply();

			//  处方缴费
			prescCharge(7);
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
	$scope.bankCorrect = function(trace_no, money) {
		money = money.toString();
		// log
		window.terminal && window.terminal.WriteLog('硬件调用： clinicInfoCtrl window.terminal.CorrectBankModel: trace_no' + JSON.stringify(trace_no) + ' money：' + JSON.stringify(money));
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
		window.terminal && window.terminal.WriteLog('硬件回调： clinicInfoCtrl terminal_device.build_card.cb_money_filling: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//
		$scope.bankCorrectStatus = res_Status;
		$scope.bankCorrectObj = res_obj;
		//
		if(res_Status == 0) {
			//   充正成功
			//alert('充正成功');
			$scope.systemError('处方缴费失败，请重新缴费');

			//  返回选择医生
			$scope.locationBk();

		} else {
			//   充正失败
			//alert('充正失败');
			$scope.systemError('支付成功：处方缴费失败请与维护人员联系');
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
	var getEcode = function() {
		//
		var temp_obj = {
			'orderAmount': $scope.data.res_item.TotalFee,
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
					} else if (res.data.OrderStat == 4) {
						//   遮挡 返回按钮
						$scope.show_back = false;

					}  else if(res.data.OrderStat == 5) {
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
	};

	//  =====================  / 扫码支付  =========================

	//  处方缴费前验证
	var prescChargeBefore = function(type) {
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/prescChargeBefore', {
				prescRecordID: $scope.PrescriptionID,
				paymentType: type,
				paymentCharge: $scope.data.res_item.TotalFee,
			})
			.then(function(res) {
				if(res.succeed) {
					//  成功
					if($scope.status == 3) {
						//  灯光提示
						window.terminal && window.terminal.JSOpenTwinkleLED('4');
						//   停止语音
						$scope.audio_list.allStop();
						//   播放声音
						$scope.audio_list.play('audio_021');
						//   银行充值
						bankRecharge($scope.data.res_item.TotalFee_minute.toString());
					} else if($scope.status == 12) {
						//   在线支付
						getEcode();
					}
				} else {
					//  失败
					//alert('处方缴费前验证 - 失败')
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
			prescRecordID: $scope.PrescriptionID,
			registerID: $scope.registegOrderID,
			paymentIndex: _paymentIndex,
			paymentType: type,
			paymentCharge: $scope.data.res_item.TotalFee,
			paymentAccount: '',
			cardNo: $scope.app.user_info.card_no
		}

		//  log
		window.terminal && window.terminal.WriteLog('rq 处方缴费 /api/yytBase/v1/prescCharge:' + JSON.stringify(temp_obj));

		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/prescCharge', temp_obj)
			.then(function(res) {
				//  log
				window.terminal && window.terminal.WriteLog('res 处方缴费 /api/yytBase/v1/prescCharge:' + JSON.stringify(res));
				
				if(res.succeed) {
					//  成功
					$scope.res_prescCharge = res.data;
					$scope.isPrescCharge = true;
					//   打印凭条
					// $scope.statusFn1();
					//   延时查询
					$timeout(function () {
						//   门诊已缴费处方号查询（处方缴费） 
						mzCFNO($scope.app.user_info.card_no, $scope.data.mzCFNO_date.startDate, $scope.data.mzCFNO_date.endDate, function (res_mzCFNO) {
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
					if($scope.payMethod == 0) {
						//  银行充正
						$scope.bankCorrect($scope.bankRechargeObj.Trace_no, $scope.data.res_item.TotalFee_minute);
					} else if($scope.payMethod == 1) {
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

	

	//   点击缴费
	$scope.statusOk = function() {
		$scope.status = 2;
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_020');
	};

	//   缴费
	$scope.payment = function() {
		//   遮挡 返回按钮
		$scope.show_back = false;
		//  银行缴费
		//  处方缴费前验证
		prescChargeBefore(7);
		//
		$scope.status = 3;
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
		for (var b in $scope.res_mzCFNO) {
			if ($scope.PrescriptionID == b) {
				temp_arr.push($scope.res_mzCFNO[b]);
			}
		}
		//   放入凭条数组 
		//   处方
		for (var i in temp_arr) {
			//   执行科室
			for (var b in temp_arr[i]) {
				//   凭条执行科室	含明细			
				$scope.has_filter.push(temp_arr[i][b]);
			}
		}
		//   计算总金额  处方时间
		//   凭条
		for (var i in $scope.has_filter) {
			//   明细
			//   
			var temp_sum_money = 0;
			for (var b in $scope.has_filter[i]) {
				//   计算明细总金额 乘
				var temp_mul = globalFn.accMul($scope.has_filter[i][b].num, $scope.has_filter[i][b].price);
				// 加
				temp_sum_money = globalFn.accAdd(temp_sum_money, temp_mul);
			}
			//  总金额
			$scope.has_filter[i][0].temp_sum_money = temp_sum_money;
			//  处方时间
			$scope.has_filter[i][0].PresDT = $scope.data.res_item.PresDT;
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
	};

	//    完成打印
	$scope.statusFn2 = function() {
		//   显示 返回按钮
		$scope.show_back = true;
		
		$scope.status = 4;

		if($scope.payMethod == 0) {
			//  退卡
			$scope.bankOutCard();
			//   停止语音
			$scope.audio_list.allStop();
			//   播放声音取走凭条
			$scope.audio_list.play('audio_009');
			$timeout(function() {
				$scope.audio_list.play('audio_017');
			}, 3000);

			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('4');
			//  秒关闭
			$timeout(function() {
				window.terminal && window.terminal.JSCloseTwinkleLED('4');
			}, 3000);
		} else if($scope.payMethod == 1) {
			//   播放声音
			$scope.audio_list.allStop();
			$scope.audio_list.play('audio_009');
		}

		//
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 10;
		tm.fnAutoRefreshfn(tm);

	};

	//	扫码支付
	$scope.statusFn3 = function() {
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
	var tm = $scope.setglobaldata.gettimer("clinicInfoCtrl");
	if(tm.Key != "clinicInfoCtrl") {
		tm.Key = "clinicInfoCtrl";
		tm.keyctrl = "app.clinic.info";
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
		$scope.audio_list.play('audio_022');


		// $scope.data.form.startDT = '2018-05-31';
		// $scope.data.form.endDT = '2018-06-01';

		//   就诊详情
		prescriptionInfo($scope.PrescriptionID);
		//
		patientPres();





		// $scope.data.mzCFNO_date.startDate = '2018-05-31';
		// $scope.data.mzCFNO_date.endDate = '2018-05-31';
		// $timeout(function () {
		// 	//   门诊已缴费处方号查询（处方缴费） 
		// 	mzCFNO($scope.app.user_info.card_no, $scope.data.mzCFNO_date.startDate, $scope.data.mzCFNO_date.endDate, function (res_mzCFNO) {
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
		// }, 5000);
	};
	run();

});