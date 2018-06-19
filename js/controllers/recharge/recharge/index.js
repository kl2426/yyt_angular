/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:36:07 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-21 11:31:58
 */
'use strict';

/**
 * 住院预交金充值
 */
app.controller('rechargeRechargeCtrl', function($scope, $interval, $timeout, $stateParams, $filter, httpService, globalFn) {

	//   当前页面返回秒数
	$scope.countdown_time = 360;
	//
	$scope.status = 1;

	//	支付方式 	 0, 银行卡;	1, 在线支付;	2, 现金
	$scope.payMethod = '';

	//	在线支付订单状态	true 查询成功	false 查询失败
	$scope.orderStatus = false;

	//   姓名
	$scope.PatName = '';
	//   性别
	$scope.PatSex = '';

	//   充值金额  单元
	$scope.money = 0;

	//   是否显示充值按钮
	$scope.show_btn = false;

	//
	$scope.items_loadding = false;

	//  数据
	$scope.data = {
		//  缴费成功与否状态
		doZyDeposit_bol: 1,
		//  支付方式
		'type': '',
		//
		'form': {
			//   查询条件  身份证 诊疗卡等
			inp_no: '',
			//   银行充值充值输入金额  单位元
			card_money: '',
			//   银行充值充值输入金额 提示
			card_money_msg: '',
			//   现金充值 入钞金额  单位元
			money_money: ''
		},
		//	
		'item': null,
		//	二维码信息
		'ecodeInfo': {},
		//  住院号_住院次数获取
		'inpatient': [],
		//  住院病人在院信息(住院）
		'patient': {},
		//  his 主键
		'zydepo': {},
		//   住院病人费用余额查询（住院）
		'depoSum': {},
		//
		'items': [],
		//   对items 数据进行分页
		'page': {
			pageIndex: 1,
			pageSize: 6,
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

	//   数字键盘按下
	$scope.keyb = function(str) {
		if(str == 'backspace') {
			if($scope.data.form.card_money.length > 0) {
				$scope.data.form.card_money = $scope.data.form.card_money.substr(0, $scope.data.form.card_money.length - 1);
			}
		} else if(str == 'delete') {
			$scope.data.form.card_money = "";
		} else if(/[0-9]/.test(str)) {
			if($scope.data.form.card_money.length < 16) {
				$scope.data.form.card_money = $scope.data.form.card_money + str.toString();
			}
		}
	}

	//  身份证登录
	$scope.statusID = function() {
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_003');

		//   取身份证信息
		window.terminal && window.terminal.ReadCardData("terminal_device.build_card.cb_id");
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 120;
		tm.fnAutoRefreshfn(tm);
		//
		$scope.status = 2;
	}

	//  回调
	terminal_device.build_card.cb_id = function(obj) {
		// log
		window.terminal && window.terminal.WriteLog('res 读取身份证回调:' + JSON.stringify(obj));
		//
		if(obj && obj.MsgCode == '1000') {
			//   性别
			if(obj.MsgStr.PeopleSex == '男') {
				$scope.PatSex = '1';
			} else if(obj.MsgStr.PeopleSex == '女') {
				$scope.PatSex = '2';
			} else {
				$scope.PatSex = '9';
			}
			//   身份证号
			$scope.data.form.inp_no = obj.MsgStr.PeopleIDCode;
			// $scope.data.form.inp_no = '430521198911273807';
			//   姓名
			$scope.PatName = obj.MsgStr.PeopleName;
			//
			getInpatientNO($scope.data.form.inp_no);
			//  
			tm.fnStopAutoRefreshfn(tm);
			$scope.countdown_time = 240;
			tm.fnAutoRefreshfn(tm);
			//
			$scope.status = 3;
			//
		} else {
			//
			switch(obj.MsgCode) {
				case '2005':
					$scope.systemError('身份证读取不成功，请重新操作');
					break;
				case '2001':
					$scope.systemError('初始化失败');
					break;
				case '2002':
					$scope.systemError('读取数据异常');
					break;
				case '2004':
					$scope.systemError('未检测到身份证或身份证放置不正确');
					break;
				case '2009':
					$scope.systemError('关闭身份证阅读器失败');
					break;
				case '2099':
					// $scope.systemError('读取超时');
					break;
				default:
					break;
			}
			//		
			$scope.locationBk();
		}
	}

	//  诊疗卡 登录
	$scope.statusCARD = function() {
		if($scope.app.user_info && $scope.app.user_info.card_no) {
			//   已插入诊疗卡
			//   性别
			$scope.PatSex = $scope.app.user_info.PatSex;
			//   身份证号/诊疗卡号
			$scope.data.form.inp_no = $scope.app.user_info.HicNo;
			// $scope.data.form.inp_no = '430521198911273807';
			//   姓名
			$scope.PatName = $scope.app.user_info.PatName;
			//
			getInpatientNO($scope.data.form.inp_no);
			//  
			tm.fnStopAutoRefreshfn(tm);
			$scope.countdown_time = 240;
			tm.fnAutoRefreshfn(tm);
			//
			$scope.status = 3;
		} else {
			//   没有插入诊疗卡
			$scope.openInCard();
			//   插卡完成回调
			$scope.openInCard_modalInstance.result.then(function(selectedItem) {
				$scope.PatSex = $scope.app.user_info.PatSex;
				//   身份证号/诊疗卡号
				$scope.data.form.inp_no = $scope.app.user_info.HicNo;
				// $scope.data.form.inp_no = '430521198911273807';
				//   姓名
				$scope.PatName = $scope.app.user_info.PatName;
				//
				getInpatientNO($scope.data.form.inp_no);
				//  
				tm.fnStopAutoRefreshfn(tm);
				$scope.countdown_time = 240;
				tm.fnAutoRefreshfn(tm);
				//
				$scope.status = 3;

			}, function() {
				//
			});
		}
	}

	//   取住院号_住院次数获取
	var getInpatientNO = function(patientID) {
		//
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/getInpatientNO/' + patientID)
			.then(function(res) {
				//
				$scope.items_loadding = false;
				//
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						res.data.item = res.data.item;
					} else {
						res.data.item = [res.data.item];
					}
					//   是否是单条
					if(res.data.item.length == 1) {
						//
						$scope.data.inpatient = res.data.item;
						//  获取住院病人在院信息(住院）
						getPatientMSG($scope.data.inpatient[0].InpatientNo);
						//  获取 住院病人费用余额查询（住院）
						GetDepoSum($scope.data.inpatient[0].PatientId, $scope.data.inpatient[0].Times);
						//  获取住院病人预交金信息（住院）
						getDepo($scope.data.inpatient[0].PatientId, $scope.data.inpatient[0].Times);
						//  获取 1.1.1.44.预交金获取his主键(住院） 
						zydepo($scope.data.inpatient[0].InpatientNo);

					} else {
						//  提交失败
						$scope.systemError('业务处理失败：请到窗口办理。');
					}
				} else {
					//
				}
			});
	}

	//  获取住院病人在院信息(住院）
	var getPatientMSG = function(inpNo) {
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/getPatientMSG/' + inpNo)
			.then(function(res) {
				if(res.succeed) {
					$scope.data.patient = res.data;
				} else {
					$scope.data.patient = {};
				}
			});
	}

	//  获取 住院病人费用余额查询（住院）
	var GetDepoSum = function(patientID, time) {
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/GetDepoSum/' + patientID + '/' + time)
			.then(function(res) {
				if(res.succeed) {
					$scope.data.depoSum = res.data;
				} else {
					$scope.data.depoSum = {};
				}
			});
	}

	//  1.1.1.44.预交金获取his主键(住院） 
	var zydepo = function(inpno) {
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/zydepo/' + inpno)
			.then(function(res) {
				if(res.succeed) {
					$scope.data.zydepo = res.data;
					//
					$scope.show_btn = true;
				} else {
					$scope.data.zydepo = {};
				}
			});
	}

	//  获取住院病人预交金信息（住院）
	var getDepo = function(patientID, time) {
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/getDepo/' + patientID + '/' + time)
			.then(function(res) {
				//
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						$scope.data.items = res.data.item;
					} else {
						$scope.data.items = [res.data.item];
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
		// log
		window.terminal && window.terminal.WriteLog('硬件调用： clinicCtrl window.terminal.OpenBankModel: money：' + JSON.stringify(money));
		//
		window.terminal && window.terminal.OpenBankModel(money);
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
		window.terminal && window.terminal.WriteLog('硬件回调： clinicCtrl terminal_device.build_card.cb_money: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//
		$scope.bankRechargeStatus = res_Status;
		$scope.bankRechargeObj = res_obj;
		//  
		if(res_Status == 0) {
			//   充值成功
			//  住院充值
			doZyDeposit(7);
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

			//  返回选择医生
			$scope.locationBk();

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
		window.terminal && window.terminal.WriteLog('硬件调用： clinicCtrl window.terminal.CorrectBankModel: trace_no' + JSON.stringify(trace_no) + ' money：' + JSON.stringify(money));
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
		window.terminal && window.terminal.WriteLog('硬件回调： clinicCtrl terminal_device.build_card.cb_money_filling: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//
		$scope.bankCorrectStatus = res_Status;
		$scope.bankCorrectObj = res_obj;
		//
		if(res_Status == 0) {
			//   充正成功
			$scope.systemError('缴费失败，请重新缴费');

			//  返回选择医生
			$scope.locationBk();

		} else {
			//   充正失败
			//alert('充正失败');
			$scope.systemError('支付成功：缴费失败请与工作人员联系');

			//   打印支付成功挂号失败凭条
			//   取打印模板
			$scope.statusFn1();
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
			'orderAmount': $scope.data.form.card_money,
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

						//if($scope.data.doZyDeposit_bol) return;
						//  住院充值
						doZyDeposit(6);
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
	}

	//  =====================  / 扫码支付  =========================

	//  1.1.1.49.预交金确认缴费(住院） --超时确认
	var checkDepo = function(patientid, zytimes, depotimes, cb) {
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/checkDepo/' + patientid + '/' + zytimes + '/' + depotimes)
			.then(function(res) {
				typeof cb == "function" && cb(res);
			});
	}

	//  1.1.1.48.自助机HIS预交金缴费(住院） 
	var doZyDeposit = function(type) {
		//	加入流水号
		var _bankTranSerNo = '';
		if(type == 7) {
			_bankTranSerNo = $scope.bankRechargeObj.Trace_no ? $scope.bankRechargeObj.Terminal + $scope.bankRechargeObj.Trace_no : '';
		} else if(type == 6) {
			_bankTranSerNo = $scope.orderInfo.OrderId;
		}

		var temp_obj = {
			patientId: $scope.data.zydepo.patientid,
			zyTimes: $scope.data.zydepo.zytimes,
			depoTimes: $scope.data.zydepo.depotimes,
			depoAmount: $scope.money,
			paymentType: type,
			opera: $scope.app.device_info.user.terminalNo,
			wardsn: $scope.data.zydepo.ward_sn,
			deptsn: $scope.data.zydepo.dept_sn,
			bankCardNo: $scope.bankRechargeObj.Pan ? $scope.bankRechargeObj.Pan : '',
			bankTranSerNo: _bankTranSerNo,
			bankTranDate: $filter('date')(new Date(), 'yyyyMMddHHmmss00'),
			pOSSerNo: $scope.app.device_info.user.terminalNo
		}
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/doZyDeposit', temp_obj)
			.then(function(res) {
				if(res.succeed) {
					//	缴费成功
					$scope.data.doZyDeposit_bol = 1;
					//	打印凭条
					$scope.statusFn1();
				} else {
					//  缴费失败
					//  缴费方式
					switch($scope.data.type) {
						case 'card':
							//   银行卡
							//   支付完成确认
							checkDepo($scope.data.zydepo.patientid, $scope.data.zydepo.zytimes, $scope.data.zydepo.depotimes, function(res_checkDepo) {
								if(res_checkDepo.succeed) {
									//  确认续费成功
									$scope.data.doZyDeposit_bol = 1;
									//   缴费成功 打印凭条
									$scope.statusFn1();
								} else if(res_checkDepo.succeed == false && res_checkDepo.code == -1) {
									//  确认续费成功
									$scope.data.doZyDeposit_bol = 0;
									//   缴费成功 打印凭条
									$scope.statusFn1();
									//
									$scope.systemError('请求超时：请与工作人员联系');
									//
									$scope.locationBk();

								} else {
									//   确认缴费失败
									$scope.data.doZyDeposit_bol = 0;
									if($scope.payMethod == 0) {
										//   银行充正
										$scope.bankCorrect($scope.bankRechargeObj.Trace_no, globalFn.accMul($scope.money, 100));
									} else if($scope.payMethod == 1) {
										//	退款
										ddtk($scope.orderInfo.OrderId, 11, $scope.app.device_info.user.terminalNo);
									}

									//
									$scope.systemError('缴费失败：' + res.message);
								}
							});
							break;
						case 'money':
							//   现金
							//   支付完成确认
							checkDepo($scope.data.zydepo.patientid, $scope.data.zydepo.zytimes, $scope.data.zydepo.depotimes, function(res_checkDepo) {
								if(res_checkDepo.succeed) {
									//  确认续费成功
									$scope.data.doZyDeposit_bol = 1;
									//   缴费成功 打印凭条
									$scope.statusFn1();
								} else if(res_checkDepo.succeed == false && res_checkDepo.code == -1) {
									//  确认续费成功
									$scope.data.doZyDeposit_bol = 0;
									//   缴费成功 打印凭条
									$scope.statusFn1();
									//
									$scope.systemError('请求超时：请与工作人员联系');
									//
									$scope.locationBk();
								} else {
									//   确认缴费失败
									$scope.data.doZyDeposit_bol = 0;
									//   打印失败凭条
									$scope.statusFn1();
									//
									$scope.systemError('缴费失败：' + res.message);
								}
							});
							break;
						default:
							break;
					}
				}
			});
	}

	//   确认充值用户信息
	$scope.confirm_userinfo = function() {
		$scope.status = 31;
	}

	//   充值按钮
	$scope.payBtn = function() {
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 30;
		tm.fnAutoRefreshfn(tm);
		//
		$scope.status = 4;
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_020');
	}

	//   选择充值方式  
	$scope.payType = function(str) {
		$scope.data.type = str;
		//   打开充值方式页面
		switch(str) {
			case 'card':
				$scope.payCard();
				break;
			case 'online':
				$scope.payOnline();
				break;
			case 'money':
				$scope.payMoney();
				break;
			default:
				break;
		}
	}

	// ==============================================

	//  回调 放钞
	terminal_device.build_card.cb_money_money = function(obj) {
		// log
		window.terminal && window.terminal.WriteLog('住院现金缴费:' + JSON.stringify(obj));

		//
		if(obj && obj.MsgCode == '999') {
			$scope.money = +$scope.money + +obj.MsgStr;
			$scope.data.form.money_money = angular.copy($scope.money);
			$scope.$apply();
			//   提交用户充值记录
		}
	}

	//  回调 关闭放钞
	terminal_device.build_card.cb_money_close = function(obj) {
		// log
		window.terminal && window.terminal.WriteLog('住院现金缴费 - 结束:' + JSON.stringify(obj));

		//
		if(obj && obj.MsgCode == '0') {
			//
		}
	}

	//   现金充值
	$scope.payMoney = function() {
		$scope.money = 0;
		//   打开现金充值页面
		$scope.status = 6;
		$scope.data.form.money_money = 0;
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_007');
		//  
		tm.fnStopAutoRefreshfn(tm);
		//  放钞
		window.terminal && window.terminal.JSOpenCashFun('terminal_device.build_card.cb_money_money');
		//  灯光提示
		window.terminal && window.terminal.JSOpenTwinkleLED('2');

	}

	//   结束入钞 现金充值面页
	$scope.payMoneyPage = function() {
		//
		$scope.status = 10;
		//
		window.terminal && window.terminal.JSCloseTwinkleLED('2');
		//  关闭放钞
		window.terminal && window.terminal.JSCloseCashFun('terminal_device.build_card.cb_money_close');
		//
		if(+$scope.data.form.money_money > 0) {
			//   提交
			doZyDeposit();
		} else {
			//   返回
			$scope.locationBk();
		}
	}

	//  现金充值返回 时关闭入钞  当有金额时不能点击
	// $scope.moneyBack = function () {
	// 	//  关闭放钞
	// 	window.terminal && window.terminal.JSCloseCashFun('terminal_device.build_card.cb_money_close');
	// 	//   返回
	// 	$scope.locationBk();
	// }

	///==============================================

	//   清空提示
	$scope.card_money_msg_null = function() {
		$scope.data.form.card_money_msg = '';
	}

	//   银行充值
	$scope.payCard = function() {
		//  打开银行充值页面
		$scope.status = 5;
		$scope.payMethod = 0;
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 60;
		tm.fnAutoRefreshfn(tm);
	}

	//   银行充值页面
	$scope.payCardPage = function() {
		$scope.money = angular.copy($scope.data.form.card_money);

		$scope.data.form.card_money_msg = '';
		//  
		if(+$scope.data.form.card_money <= 0) {
			$scope.data.form.card_money_msg = '充值金额必须大于0';
			return false;
		}

		if($scope.payMethod == 0) {
			//
			$scope.status = 10;
			//  
			tm.fnStopAutoRefreshfn(tm);
			$scope.countdown_time = 240;
			tm.fnAutoRefreshfn(tm);
			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('4');
			//   停止语音
			$scope.audio_list.allStop();
			//   播放声音
			$scope.audio_list.play('audio_021');
			//   银行充值
			bankRecharge((globalFn.accMul($scope.data.form.card_money, 100)).toString());
		} else if($scope.payMethod == 1) {
			//
			$scope.status = 7;
			//
			getEcode();

			//	订单轮询 秒查询一次
			$scope.timer = $interval(function() {
				$scope.data.ecodeInfo.MerchOrder && ddcx($scope.data.ecodeInfo.MerchOrder);
			}, 1 * 3000);

			//  
			tm.fnStopAutoRefreshfn(tm);
			$scope.countdown_time = 360;
			tm.fnAutoRefreshfn(tm);
			//   停止语音
			$scope.audio_list.allStop();
			//   播放声音
			$scope.audio_list.play('audio_006');
		}
	}

	//	============================================

	//============================================

	//	扫码支付
	$scope.payOnline = function() {
		//  打开充值页面
		$scope.status = 5;
		$scope.payMethod = 1;
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 60;
		tm.fnAutoRefreshfn(tm);
	}

	//	页面跳转	停止轮询
	$scope.$on('$destroy', function() {
		$interval.cancel($scope.timer);
		$scope.timer = null;
	});

	//============================================

	//   凭条打印更新 打印结果上传
	var printLog = function() {
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/printLog', {
				lid: $scope.res_jfPrint.lid,
				type: $scope.data.doZyDeposit_bol ? $scope.data.doZyDeposit_bol : 0
			})
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res 门诊缴费 /api/yytMace/v1/printLog:' + JSON.stringify(res));
			});
	}

	//   充值完成 打印
	$scope.statusFn1 = function() {
		//
		$scope.status = 11;
		//
		var temp_obj = {
			cardNo: $scope.data.form.inp_no,
			patName: $scope.data.zydepo.patient_name,
			patientID: $scope.data.zydepo.patientid,
			inpNo: $scope.data.zydepo.inp_no,
			zyTimes: $scope.data.zydepo.zytimes,
			depoTimes: $scope.data.zydepo.depotimes,
			paymentType: $scope.data.type == 'card' ? '银行卡' : '现金',
			depoAmount: (+$scope.money).toFixed(2),
			deptName: $scope.data.patient.dept_name,
			bedNo: $scope.data.patient.bed_no,
			// saveString: '',
		}
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/yjjPrint', temp_obj)
			.then(function(res) {
				//
				if(res.succeed) {
					//    开始打印
					window.terminal && window.terminal.PrintReceipt($scope.printStringEndFn(res.data.print, $scope.data.doZyDeposit_bol ? 0 : 1), '', '');
				} else {
					//  提交失败
					$scope.systemError('打印失败请与维护人员联系');

					//  返回选择医生
					$scope.locationBk();
				}
			});
	}

	//   充值完成 显示状态与提示
	$scope.statusFn2 = function() {
		$scope.status = 12;
		//   停止语音
		$scope.audio_list.allStop();
		//
		$scope.audio_list.play('audio_013');
		//   银行卡退卡
		$scope.bankOutCard();
		//
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 10;
		tm.fnAutoRefreshfn(tm);

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
			// printLog();
			//
			$scope.statusFn2();
			//   
		} else if(res_Status == '99') {
			//   打开打印错误弹窗
			$scope.modelOpenPrintError(res_str);
		} else {
			//  打印异常
			// alert('打印异常');
			//  提交失败
			$scope.systemError('打印失败请与工作人员联系');
		}
	}

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("rechargeRechargeCtrl");
	if(tm.Key != "rechargeRechargeCtrl") {
		tm.Key = "rechargeRechargeCtrl";
		tm.keyctrl = "app.recharge.recharge";
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
		$scope.audio_list.play('audio_026');
	}
	run();

});