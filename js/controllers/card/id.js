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
		//   输入手机号码时提示
		phone_msg: '',
		//   多张卡未选中提示
		many_card_msg: '',
		//   多张卡是否未选中
		many_card_has_checked: false,
		//   建卡类型   id 身份证  bank 银行卡  social 社保卡
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
		//  支付成功提交挂号确认
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/socialRecord/' + idCardNo)
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
					// $scope.data.items.push(angular.copy($scope.data.items[0]));
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
					//   进入无卡发卡流程
					//   进入输入手机号码页
					$scope.status = 12;

				} else if($scope.data.items.length === 1) {
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
		//  支付成功提交挂号确认
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

				// terminal_device.build_card.cb_id({ "MsgCode": "1000", "MsgError": null, "MsgStr": { "PeopleName": "刘武胜", "PeopleIDCode": "430204198602050017", "PeopleNation": "汉", "StartDate": "2008.07.01", "PeopleBirthday": "1988-12-09", "PeopleAddress": "湖南省安化县仙溪镇富溪村第八村", "EndDate": "安化县公安局", "Department": "安化县公安局", "PeopleSex": "男", "zpbmppath": "D:\\bin\\x86\\Debug\\bll\\zp.bmp", "zpbmpbase64": "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAB+AGYDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD36iiigAoqK5uYbO2kuLiRY4owWZmOABXkvif4n3VyWt9GDW8HIMzL87fT0H6/SmlcTkkekav4o0fQ4t99exoT0RTuY/QDmuNvvjBpsMzLa2U88anAdiE3fzNeQSzNI7O7FnYkszHJJ9TUDgt0q1FGbm2eyQfGLS5FHnWV1G3+xtcfzFdRo/jjQ9ZCLBdhZWH+rk+U/lXzigxzTwRu5o5Uxc7R9XAggEHINFeP+AvHbWG2x1S5Z7dj8kkhJKH3J7fy+nT15HWRFdGDKwyCO9Q00aRkmh1FFFIoKKKKACgnAyelFZXiW/8A7N8OX90GAZIm257nFAHknxE8Yvqupvp9pMwsbc7WUDG9weSfUD/PauJEnmJz1qhPNmRvrVnTg0z7cZrS6SM0uZiuh61GSRxk1pXMAjGAMn0plpp013KFVSIxyze1LmK9mZbswqeCB5eMc4zV6awEl8I4lGxetb9po3l2vmFfnbhfpiolVsawocxyrRyQtkdK6vwx42v9IkRDM7QgAbGbI/KqdzphEeNuMfrWNNaNC444NVCopImrQcNj6O0HX7TXbQSwOvmAfMmeRWtXz54R1aTSNYhkEhWPOH54296+gUcSRq69GAIolGxEW2tR1FFFSUFcr8RSR4Lvcd8CuqrnfHVu1x4N1EKcFI9/1x2prcT2Pmhk3T7e5ratJo7NFVIG80D5mxVGyhEmoKOtdvY6J9qbLyEKeoHGaicrF0otmLbk3sgMm2GPOWkJyx/AVsRyBYvs2mxPKGwCxUg/yrbTwdbbRIjnd6cGt/SkNgiwsoIHesnUS2O2NJvocppvhS6Lbp12Ajkc5rck0pol+70rqHnVULYFc7q0mo3bGOzkKAnkg1nJ3NopwWxh3kMZVlc4NcvqUAjhz2FdVLod3gm4uWaT1zWHqNs8dvJFKd/HU1rR0djCreSbZh2OTdxFD824fjzX0pa8WkOevlr/ACr5+8GWwuPFGnRMfvS9/oTX0MBgYHSuqbPPiFFFFZlBWN4qEjeHbqOMgGQBDn0PWtmsfxOG/sKYqCcEE49M0pOyuXSipTSZ4BFpkmn68IW5BGVPqK7+G3Y2wERw9Z2u2SRalZTqeANh+nauj0yLcgOK5qkm0d9OkoyaMtNM1j+0bWSK6nFuAPOXzO+ecD6VvOGjVi+8EH5d+MkfhWkiBU5rN1GTa4zgL2rFrQ6EtQmucW2c9qZal2VWVnVXQksi5IPaopAhsiec1Jo0uIyvY9KcXZlSV1Y5+OHXDLI15cuw3fKpUYx+QqLVrbdayOR82K7SWMFTjvXO6xFthfIrSMveMJ0/cd2c/wCAbKSXxRYzqBtifLEn2I/rXudeVeBrQwXVqe5mz9Rhq9Vrrvc86pDlsFFFFBmFMmiSeF4nAKuMEGn0UAcHf+EromRGHnRA5jYdVA6ZqrpUrIpjkG11OCPQ16NXAa1F9j16bChQ53jHof8AJrnqwstDuoVnKXvGp5gxyaytRKSTqxBdVGMD1pHuiUGDVWTUbWEfPL8/dQM1zX1O+CUkW3usWBQ2ZDkccHH51FpShM9s8kVEPEEJi2ZYj6VHDexSYMT4PYVVgcWtzfZxjJrEvUa+uvs8YJDHBx1qZrw+QQTzWt4Qg86e4umXIX5VPv8A5xWtKN3c5q1RxjoXPDei/YV8512/LtRT2FdFRRXUlY82c3J3YUUUUEhRRRQAVzHjW2Uaal6OHiYKfcGunJAGTwBXkfi3xqNV8TpoloVNpbsfMcNnzHA6fQfzHtUz+Fl0/iQ63vBIQuanksxK2VUFu3asadHtbkPEPl9PStSx1RGUFztYetcD1eh6tOTiyR7GYR4NlF/vbjVaO3+zkswAY9h2rXk1iJotu+sC/wBSXJSMguemKpX6l1Klyykr3VwsEILyMcBR3r0/SbFdO06K3H3gMsfU968Xh1WfQ5odR2hpI2B2nofUV7B4e1+z8R6Yt5aNx0kQ9Ub0NddNaXR5uJlqkatFFFaHMFFFFABSMwUEsQAOpNea678ZtGslKaRE+oTZxlgY0H4nn9PyrzbxD8TfEOuxtA1wttbMTmO3G3I9Cep/SqUGyHUijuPiL8TIo47jRdHkLSH5ZbpGxt9VX/Ht/LzLwurS6/Gx5wCawN3zcGup8Hx7tQD9wDRVSjAqjedQ9LNv5sJOOahg06GRx5iA4rTtOYqdGqJJ83GfavLWh7Kjco3Ol2KRkhfm9OcVirYo92NiAY7CupuxblGOefpWbaRAM0v5U+ZicTmvFUZWxIHUMKq+B/Fx8MaoDNvaym4lQH7v+1j2/wA5wK1PEybrWQ9q88LYA56V6OH1hY8rF+7K59X2tzDe2sVzbuHhlUMjDoQalrwnwR8Sn0CFbDUUknseAjKctF+fUf5+nrWjeMNC11V+w38bOc/u3+V/yNVKDRlGakjcoooqSz42QgZPp0pSOKj6MBUmdrV0HIkNAw1dh4IlQai8bAAsmR+H/wCuuUUBucYrS0m5e0v4JY/vBwPzNY1vhZ24RqM02e22xUbVHerUsOc8Vk2krHZJ0J7VuBy4U9MivKR79SlyPTYoGyMnGKJbfyYgoFbKINuay9SmMeSBnBqrGehx/iqTydLlLHByAP5V5o7cV2/jm+Z7eOLbgM+449v/ANdcK3KmvRwy908XHfECvxUiStG6ujFXU5VgcEH2quvWn11nnJHZ6N8T/EujIUFzHex7QqpdqW2fQgg5+pNFcZRU8q7GvM+5/9k=", "SAMID": "05-03-20160822-0005900985" } });
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
			//
			//   身份证号
			$scope.data.idCardNo = $scope.data.id.PeopleIDCode;
			//   查询是否有建卡信息
			socialRecord($scope.data.idCardNo);

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

	//   确定手机号
	$scope.ok_phone = function() {
		//
		if($scope.data.phone_no.toString().length < 1) {
			$scope.data.phone_msg = '手机号码输入错误';
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
		//   开始建卡
		device_new_card();

	}

	//   硬件建卡
	var device_new_card = function() {
		//    C#停止诊疗卡读取
		window.terminal && window.terminal.TreatmentCardtimerStop();
		//    C#发卡器发出诊疗卡并返回卡号   terminal_device.build_card.cb_new_card
		window.terminal && window.terminal.MoveCard580();
	}

	//   硬件建卡发卡回调
	terminal_device.build_card.cb_new_card = function(res_Status, res_str) {
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

	//  
	var run = function() {
		//   验证发卡器状态
		for(var i in $scope.app.device_status.HDlist1) {
			if($scope.app.device_status.HDlist1[i].HardwareDriverType1 == 'TreatmentCardCreate' && $scope.app.device_status.HDlist1[i].RunStatus1 != 'ON') {
				$scope.systemError('发卡器异常：请与工作人员联系');
				return;
			}
		}
		//
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_030');
		//   进入建卡页面， 先退卡
		//   硬件退卡
		$scope.outCard_null();
		//

	}
	run();

});