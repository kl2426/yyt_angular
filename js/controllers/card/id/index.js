/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:34:54 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-15 10:42:02
 */
'use strict';

/**
 * 身份证建卡
 */
app.controller('cardIdCtrl', function($scope, $interval, httpService, $filter, $stateParams, $timeout, globalFn) {

	//   状态  
	$scope.status = 1;

	$scope.items_loadding = false;

	//   当前页面返回秒数
	$scope.countdown_time = 30;

	//  data
	$scope.data = {
		//	余卡数量
		residueNum: 0,
		//   输入手机号码时提示
		phone_msg: '',
		//   多张卡未选中提示
		many_card_msg: '',
		//   多张卡是否未选中
		many_card_has_checked: false,
		//   建卡类型   id 身份证	 bank 银行卡	social 社保卡
		card_type: '',
		//   手机号码
		phone_no: '',
		//   身份证号
		idCardNo: '',
		//   金额
		money: '0',
		//   身份证信息
		id: {},
		//   发卡器发卡完成参数
		device_card: {
			//   卡号
			card_no: '',
			//   建卡时用的密码
			pwd: '123'
		},
		//   旧卡卡号
		old_card_no: '',
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

	//	获取余卡数量
	var getCardCount = function(terminalNo) {
		httpService.adminAjaxGet(httpService.API.href + '/api/yytBack/v1/getResidueNum/' + terminalNo)
			.then(function(res) {
				if(res.succeed) {
					if(res.data.residueNum > 0) {
						//   停止语音
						$scope.audio_list.allStop();
						//   播放声音
						$scope.audio_list.play('audio_030');
						//   进入建卡页面， 先退卡
						//   硬件退卡
						$scope.outCard_null();
					} else {
						$scope.systemError('当前机器诊疗卡余卡数量为0，请联系维护人员 ！');
						$scope.locationBk();
					}
				}
			});
	};

	//   数字键盘按下 输入手机号码
	$scope.keyb = function(str) {
		//   清空手机提示
		$scope.data.phone_msg = '';
		//
		if(str == 'backspace') {
			if($scope.data.phone_no.length > 0) {
				$scope.data.phone_no = $scope.data.phone_no.substr(0, $scope.data.phone_no.length - 1);
			}
		} else if(str == 'delete') {
			$scope.data.phone_no = "";
		} else if(/[0-9]/.test(str)) {
			if($scope.data.phone_no.length < 11) {
				$scope.data.phone_no = $scope.data.phone_no + str.toString();
			}
		}
	}

	/**
	 * 选中卡
	 */
	$scope.chekced_click = function(item) {
		//   请空提示
		$scope.data.many_card_msg = '';
		//
		for(var i in $scope.data.items) {
			$scope.data.items[i].checked = false;
		}
		item.checked = true;
		//
		$scope.data.many_card_has_checked = true;
	}

	//  1.1.1.53.身份证查询诊疗卡（自助设备）
	var socialRecord = function(idCardNo) {
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/socialRecord/' + idCardNo)
			.then(function(res) {
				//
				$scope.items_loadding = false;

				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						$scope.data.items = res.data.item;
					} else {
						$scope.data.items = [res.data.item];
					}
					//   过滤空卡号数据
					for(var i in $scope.data.items) {
						if($scope.data.items[i].CardNo == '' || $scope.data.items[i].CardNo == 'null' || $scope.data.items[i].CardNo == null) {
							//   清除空卡号数据
							$scope.data.items.splice(i, 1);
						}
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
					$scope.data.page.row = [];
					$scope.data.page.total = 0;
				}

				//   是否有建卡
				if($scope.data.items.length > 0 && res.data.JKState == 0) {
					$scope.systemError('已达到今日建卡上限');
					$scope.locationBk();
					return false;
				}
				//  有数据   两种情况 只有一条确定覆盖 后更新第一条发卡  ，有多条 用户选择卡号更新后发卡
				if($scope.data.items.length == 0) {
					alert('进入无卡发卡流程')
					//   进入无卡发卡流程
					//   进入输入手机号码页
					if($scope.data.card_type == 'id') {
						$scope.status = 12;
					} else if($scope.data.card_type == 'social') {
						$scope.status = 22;
					}
				} else if($scope.data.items.length == 1) {
					alert('更新原卡流程')
					//   有一张卡 更新原卡流程
					//   选中当前卡
					$scope.data.items[0].checked = true;
					//   进入卡确认页
					$scope.status = 52;
					//   停止语音
					$scope.audio_list.allStop();
					//   播放声音
					$scope.audio_list.play('audio_006');
				} else if($scope.data.items.length > 1) {
					//   有多张卡 用户选择卡 更新卡流程
					//   进入卡选择页
					$scope.status = 51;
				}
			});
	}

	//  1.1.1.54.诊疗卡换卡（自助设备）
	var updateHicNo = function(oldCardNo, cardNo) {
		//  支付成功提交挂号确认
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/updateHicNo/' + oldCardNo + '/' + cardNo)
			.then(function(res) {
				//
				if(res.succeed) {
					//   更新成功
					//   完成建卡
					$scope.statusFn1();
					//   出卡
					$scope.outCard_null();
					//
					$timeout(function() {
						//   起动插卡
						window.terminal && window.terminal.TreatmentCardtimerStart();
					}, 1000);
				} else {
					//   更新失败
					//  失败
					$scope.systemError("建卡失败：" + res.message);
					//  回收卡
					window.terminal && window.terminal.TreatmentCardRecovery();
					//
					$timeout(function() {
						//   起动插卡
						window.terminal && window.terminal.TreatmentCardtimerStart();
						//   返回
						$scope.locationBk();
					}, 1000);
				}
			});
	}

	//  1.1.1.52.诊疗卡注册/办卡（自助设备）
	var registered = function(temp_obj) {
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/registered', temp_obj)
			.then(function(res) {
				if(res.succeed) {
					//   成功
					//   完成建卡
					$scope.statusFn1();
					//   出卡
					$scope.outCard_null();
					//
					$timeout(function() {
						//   起动插卡
						window.terminal && window.terminal.TreatmentCardtimerStart();
					}, 1000);
				} else {
					//  失败
					$scope.systemError(res.message);
					//  回收卡
					window.terminal && window.terminal.TreatmentCardRecovery();
					//
					$timeout(function() {
						//   起动插卡
						window.terminal && window.terminal.TreatmentCardtimerStart();
						//   返回
						$scope.locationBk();
					}, 1000);
				}
			});
	}

	// 	1.1.1.56.原诊疗卡绑定社保卡
	var cardAddressSBK = function(cardNo) {
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/updateSheBaoNo/' + cardNo + '/' + sheBaoNo)
			.then(function(res) {
				//console.log(res)

			});
	}

	//	1.1.1.57.社保卡注册/办卡（自助设备）
	var registeredBySB = function(temp_obj) {
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/registeredBySB', temp_obj)
			.then(function(res) {
				if(res.success) {
					//	成功
					$scope.status = 23;
					//
					tm.fnStopAutoRefreshfn(tm);
					$scope.countdown_time = 10;
					tm.fnAutoRefreshfn(tm);
				} else {
					//	成功
					$scope.systemError("注册失败：" + res.message);
					//	关闭社保卡读取并退卡
					window.terminal && window.terminal.CloseSocialSecurityCard();
				}
			});
	}

	//  多张卡选择时，确认
	$scope.many_card_confirm = function() {
		//   更新患者信息 更新诊疗卡卡号 发卡
		var temp_item = null;
		for(var i in $scope.data.items) {
			if($scope.data.items[i].checked) {
				temp_item = $scope.data.items[i];
				break;
			}
		}

		if(temp_item === null) {
			$scope.data.many_card_msg = '请选择要替换的卡';
			return false;
		}
		//
		//   进入卡确认页
		$scope.status = 52;
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_006');
	}

	//  确认卡信息页面
	$scope.card_confirm = function() {
		//   更新患者信息 更新诊疗卡卡号 发卡
		var temp_item = null;
		for(var i in $scope.data.items) {
			if($scope.data.items[i].checked) {
				temp_item = $scope.data.items[i];
				break;
			}
		}
		if(temp_item === null) {
			return false;
		}
		//   旧卡卡号
		$scope.data.old_card_no = temp_item.CardNo;
		//
		$scope.status = 61;
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_008');
		//  
		tm.fnStopAutoRefreshfn(tm);
		//   开始建卡
		$timeout(function() {
			device_new_card();
		}, 500);

	}

	//   卡确认取消按键
	$scope.close_confirm = function() {
		//  回收卡
		window.terminal && window.terminal.TreatmentCardRecovery();
		//
		$timeout(function() {
			//   起动插卡
			window.terminal && window.terminal.TreatmentCardtimerStart();
		}, 1000);
		//   返回
		$scope.locationBk();
	}

	//  选择建卡方式
	//   str  建卡方式   id 身份证  bank 银行卡  social 社保卡
	$scope.select_card = function(str) {
		//
		$scope.data.card_type = str;
		//
		switch(str) {
			case 'id':
				//   停止语音
				$scope.audio_list.allStop();
				//   播放声音
				$scope.audio_list.play('audio_003');
				//
				$scope.status = 11;
				// log
				window.terminal && window.terminal.WriteLog('硬件 读取身份证开始');
				//   取身份证信息
				window.terminal && window.terminal.ReadCardData("terminal_device.build_card.cb_id");
				break;
			case 'social':
				//   停止语音
				$scope.audio_list.allStop();
				//   播放声音
				$scope.audio_list.play('audio_031');
				//
				$scope.status = 21;
				// log
				window.terminal && window.terminal.WriteLog('硬件 读取社保卡开始');
				//   取社保卡信息
				window.terminal && window.terminal.OpenSocialSecurityCard();
				break;
			default:
				break;
		}
		//  放入证件超时时间 
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 240;
		tm.fnAutoRefreshfn(tm);
	}

	//   身份证读取回调
	//  回调
	terminal_device.build_card.cb_id = function(obj) {
		// log
		window.terminal && window.terminal.WriteLog('硬件 读取身份证回调:' + JSON.stringify(obj));
		//
		if(obj && obj.MsgCode == '1000') {
			//   性别
			var temp_sex = '9';
			switch(obj.MsgStr.PeopleSex) {
				case '男':
					temp_sex = '1';
					break;
				case '女':
					temp_sex = '2';
					break;
				default:
					temp_sex = '9';
					break;
			}
			//   加入身份证信息
			$scope.data.id = obj.MsgStr;
			//   加入性别 类型
			$scope.data.id.temp_Sex = temp_sex;
			//   身份证号
			$scope.data.idCardNo = $scope.data.id.PeopleIDCode;
			//   查询是否有建卡信息
			socialRecord($scope.data.idCardNo);
		} else {
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
			//	$scope.locationBk();
		}
	}

	//   社保卡读取回调
	terminal_device.build_card.cb_SINCard = function(res_Status, res_str) {
		// log
		window.terminal && window.terminal.WriteLog('硬件 读取社保卡回调:' + res_Status + '/' + res_str);
		//
		if(res_Status == 0) { //   加入社保卡信息
			var temp_obj = JSON.parse(res_str);
			$scope.data.id = temp_obj;
			//	身份证号码
			$scope.data.idCardNo = temp_obj.IdCode;
			//	姓名
			$scope.data.id.PeopleName = temp_obj.Name;
			//   性别
			var sex_flag = temp_obj.IdCode.charAt(16) % 2;
			$scope.data.id.temp_sex = sex_flag;
			switch(sex_flag) {
				case 0:
					$scope.data.id.PeopleSex = '女';
					break;
				case 1:
					$scope.data.id.PeopleSex = '男';
					break;
				default:
					$scope.data.id.PeopleSex = '未知';
					break;
			}
			//	身份证归属地查询
			cardAddressSBK(temp_obj.HairpinAreaCode);
			//   身份证号
			$scope.data.id.PeopleIDCode = $scope.data.idCardNo;

			//   查询是否有建卡信息
			socialRecord($scope.data.idCardNo);
		} else {
			$scope.systemError('社保卡读取不成功，请重新操作');
		}
	}

	//	根据身份证前六位查询归属地
	var cardAddressSBK = function(cardNo) {
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/cardAddressSBK/' + cardNo)
			.then(function(res) {
				//   身份证号地址
				$scope.data.id.PeopleAddress = res.data;
			});
	};

	//   确定手机号
	$scope.ok_phone = function() {
		//	检测手机号码
		var phoneReg = /^1[3456789]\d{9}$/;
		//
		if(!phoneReg.test($scope.data.phone_no)) {
			$scope.data.phone_msg = '请输入正确的手机号码';
			return false;
		}
		//
		$scope.data.phone_msg = '';
		//
		$scope.status = 61;
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_008');
		//
		//  
		tm.fnStopAutoRefreshfn(tm);
		//
		if($scope.data.card_type == 'id') {
			//   开始建卡
			device_new_card();
		} else if($scope.data.card_type == 'social') {
			//	社保卡注册
			var temp_obj = {
				sheBaoNo: $scope.data.id.CardNumber,
				passWord: 123,
				name: $scope.data.id.PeopleName,
				sex: temp_obj.sex,
				money: 0,
				birthday: temp_obj.birthday,
				iDCardNo: temp_obj.iDCardNo,
				phoneNo: temp_obj.phoneNO,
				address: temp_obj.address,
				note: '',
			}
			//
			registeredBySB(temp_obj);
		}

	}

	//   硬件建卡
	var device_new_card = function() {
		//    C#停止诊疗卡读取
		window.terminal && window.terminal.TreatmentCardtimerStop();
		//    C#发卡器发出诊疗卡并返回卡号   terminal_device.build_card.cb_new_card
		window.terminal && window.terminal.MoveCard580();
	}

	//   硬件建卡发卡回调
	var temp_bool = true;
	terminal_device.build_card.cb_new_card = function(res_Status, res_str) {
		if(!temp_bool) {
			return false;
		} else {
			temp_bool = false;
		}
		// log
		window.terminal && window.terminal.WriteLog('硬件 硬件建卡发卡回调:' + JSON.stringify(res_Status) + '      ' + JSON.stringify(res_str));
		//
		if(res_Status == '0') {
			//  发卡成功
			$scope.data.device_card.card_no = res_str;
			//  有数据   两种情况 只有一条确定覆盖 后更新第一条发卡  ，有多条 用户选择卡号更新后发卡
			if($scope.data.items.length == 0) {
				//   进入无卡发卡流程
				//  建卡
				format_data();
			} else if($scope.data.items.length == 1) {
				//   有一张卡 更新原卡流程
				//   更新卡发卡
				updateHicNo($scope.data.old_card_no, $scope.data.device_card.card_no);
			} else if($scope.data.items.length > 1) {
				//   有多张卡 用户选择卡 更新卡流程
				//   更新卡发卡
				updateHicNo($scope.data.old_card_no, $scope.data.device_card.card_no);
			}

			//
		} else {
			//  发卡异常
			switch(res_Status) {
				case '-98':
					$scope.systemError('当前机器不支持发卡');
					break;
				case '-97':
					$scope.systemError('当前机器发卡箱中已无卡');
					break;
				case '-96':
					$scope.systemError('当前机器无法移动卡');
					break;
				case '-95':
					$scope.systemError('当前诊疗卡无法读取[废卡，或者卡放反方向均无法正常读取]');
					break;
				default:
					break;
			}
			//  回收卡
			window.terminal && window.terminal.TreatmentCardRecovery();
			//
			$timeout(function() {
				//   起动插卡
				window.terminal && window.terminal.TreatmentCardtimerStart();
			}, 1000);
			//   返回
			$scope.locationBk();
		}
	}

	//   整理建卡参数 调用建卡
	var format_data = function() {
		var temp_obj = {};
		//
		switch($scope.data.card_type) {
			case 'id':
				temp_obj.name = $scope.data.id.PeopleName;
				temp_obj.sex = $scope.data.id.temp_Sex;
				temp_obj.birthday = $scope.data.id.PeopleBirthday;
				temp_obj.iDCardNo = $scope.data.id.PeopleIDCode;
				temp_obj.iDCardType = '1';
				temp_obj.phoneNO = $scope.data.phone_no;
				temp_obj.address = $scope.data.id.PeopleAddress;
				break;
			default:
				break;
		}

		//   form
		var temp_obj2 = {
			cardNo: $scope.data.device_card.card_no,
			passWord: $scope.data.device_card.pwd,
			name: temp_obj.name,
			sex: temp_obj.sex,
			money: $scope.data.money,
			birthday: temp_obj.birthday,
			iDCardNo: temp_obj.iDCardNo,
			iDCardType: temp_obj.iDCardType,
			phoneNO: temp_obj.phoneNO,
			address: temp_obj.address,
			terTranSerNo: '',
			note: '',
		}
		//   建卡
		registered(temp_obj2);
	}

	//  完成
	$scope.statusFn1 = function() {
		//
		$scope.status = 63;
		//  灯光提示
		window.terminal && window.terminal.JSOpenTwinkleLED('6');
		//  5秒关闭
		$timeout(function() {
			window.terminal && window.terminal.JSCloseTwinkleLED('6');
		}, 5000);
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_010');
		//
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 20;
		tm.fnAutoRefreshfn(tm);

	}

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("cardIdCtrl");
	if(tm.Key != "cardIdCtrl") {
		tm.Key = "cardIdCtrl";
		tm.keyctrl = "app.card.id";
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

	//  
	var run = function() {
		//   验证发卡器状态
		//		for(var i in $scope.app.device_status.HDlist1) {
		//			if($scope.app.device_status.HDlist1[i].HardwareDriverType1 == 'TreatmentCardCreate' && $scope.app.device_status.HDlist1[i].RunStatus1 != 'ON') {
		//				$scope.systemError('发卡器异常：请与工作人员联系');
		//				return;
		//			}
		//		}

		//	余卡数量
		getCardCount($scope.app.device_info.user.terminalNo);
	}
	run();

});