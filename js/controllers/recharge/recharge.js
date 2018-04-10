/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:36:07 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-21 11:31:58
 */
'use strict';

/**
 * 缴费/充值
 */
app.controller('rechargeCtrl', function($scope,$interval,$timeout,httpService, $filter) {
	
	//   当前页面返回秒数
	$scope.countdown_time = 30;
	
	
	$scope.data = {
		bank_money:'1'
	}
	
	//  
	$scope.sendMoney = function(){
		alert('开始充值')
		alert('充值金额=' + $scope.data.bank_money)
		window.terminal && window.terminal.OpenBankModel($scope.data.bank_money);
	}
	
	//   银行卡退卡
	$scope.outMoney = function(){
		alert('开始退卡')
		window.terminal && window.terminal.CloseBankModel();
	}
	
	//  流水号
	$scope.Trace_no = '';
	
	//   银行充正
	$scope.CorrectBankModel = function (Trace_no, bank_money){
		alert('银行充正')
		alert('充正流水号为：' + Trace_no);
		alert('充正金额：' + bank_money);

		window.terminal && window.terminal.CorrectBankModel(Trace_no, bank_money);
	}
	
	
	//   银行充正完成回调
	terminal_device.build_card.cb_money_filling = function(s, res){
		alert('银行充正完成回调')
		alert(s);
		
		alert(res);
		alert('res' + res);
		alert('res' + JSON.stringify(res))
		//alert('res' + JSON.parse(res));
		
	}
	
	
	terminal_device.build_card.cb_money = function(res,res2){
		alert('充值现金回调')
		alert(res);
//		alert('res' + res);
//		alert('res' + JSON.stringify(res))
//		alert('res' + JSON.parse(res));
		alert('res2' + res2);
		alert('res2' + JSON.stringify(res2))
//		alert('res2' + JSON.parse(res2));
		if(res == 0){
			//   
			alert('充值成功');
			alert('银行流水号为：' + res2.Trace_no);
			$scope.Trace_no = res2.Trace_no;
			$scope.$apply();
		}
	}
	
	//  打开端口
//	$scope.openCard = function(){
//		alert('打开端口')
//		window.terminal && window.terminal.OpenTreatmentCard();
//	}
//	
//	//  
//	$scope.wCard = function(){
//		alert('开始读取诊疗卡')
//		window.terminal && window.terminal.ReadTreatmentCard();
//	}
	
//	terminal_device.in_out_card.cb_in_ok_card = function(res_Status, res_str){
//		alert('读取诊疗卡 返回')
//		alert(res_Status);
//		alert('res_Status' + res_Status);
//		
//		alert(res_str);
//		alert('res_str' + res_str);
//		
//		alert('res' + JSON.stringify(res_str))
//		alert('res' + JSON.parse(res_str));
//	}
	
	//  
	$scope.CloseTreatmentCard = function(){
		alert('退出诊疗卡')
		window.terminal && window.terminal.CloseTreatmentCard();
	}
	
	
	
	
	
	
	
	
	
	//   发送数据给.net
	$scope.sendJson = function(){
		alert('发送JSON数据')
		var temp = [
			{
				'PresNO':'123',
				'MedID':'123',
				'MedOnlyCode':'123',
				'MedAMT':'123',
				'MedPack':'123'
			},
			{
				'PresNO':'123',
				'MedID':'123',
				'MedOnlyCode':'123',
				'MedAMT':'123',
				'MedPack':'123'
			},
			{
				'PresNO':'123',
				'MedID':'123',
				'MedOnlyCode':'123',
				'MedAMT':'123',
				'MedPack':'123'
			}
		];
		
		var res_temp = "";
		if(window.terminal){
			res_temp = window.terminal.TestListToArr(JSON.stringify(temp));
		}
		
		
		console.log(res_temp)
		alert(res_temp);
		$scope.systemError(res_temp);
	}
	
	
	
	
	//   打印凭条测试 
	$scope.printPt = function(){
		//  打印凭条
		var printTemplate = 
			'[BIG]株洲市中心医院[CBIG]\n\n'
			+ '-----------------自助缴费凭条------------------\n\n'
			+ '流 水   号：20171215082140810003\n'
			+ '打印日期：2018年01月19日\n'
			+ '姓       名：周栋\n'
			+ '诊疗卡号：7205426\n'
			+ '病人ID号：001289126400\n'
			+ '银行卡号：6214446*******755536\n'
			+ '发票流水号：\n'
			+ '交易结果：成功  机器号：xyw001\n'
			+ '执行科室：普外科门诊\n\n'
			+ '**************************\n\n'
			+ '化验费   单价：20.0  数量：1.0\n'
			+ '**************************\n\n'
			+ '明细合计(元)：20.0\n\n'
			+ '---------------------------------------------\n\n'
			+ '温馨提示：\n'
			+ '凭条是您的缴费/退费的凭证，请妥善保管\n\n'
			;
		
		//    开始打印
		window.terminal && window.terminal.PrintReceipt(printTemplate,'','');
	}
	
	
	
	//   打印凭条测试 
	$scope.printPt2 = function(){
		//  打印凭条
		var printTemplate = 
			'                  株洲市中心医院\n\n'
			+ '-----------------自助挂号凭条------------------\n\n'
			+ '打印日期：2017年12月15日\n'
			+ '姓       名：聂昭娥\n'
			+ '诊疗卡号：6164209\n'
			+ '病人ID号：001072800500\n'
			+ '银行卡号：621700********0785\n'
			+ '就诊时间：2017-08-28 上午\n'
			+ '排队顺序：第28号\n'
			+ '挂号科室：呼吸内科门诊\n'
			+ '挂号医生：武亚妮\n'
			+ '挂号金额：11元\n'
			+ '机 器 号：CCB_810001\n\n'
			+ '---------------------------------------------\n\n'
			+ '温馨提示：\n'
			+ '凭条是您的缴费/退费的凭证，请妥善保管\n\n'
			;
		
		//    开始打印
		window.terminal && window.terminal.PrintReceipt(printTemplate,'','');
	}
	
	
	//   打印凭条测试 
	$scope.printPt3 = function(){
		//   打印凭条
		var temp_obj = {
			cardNo: $scope.app.user_info.card_no,
			patName: $scope.app.user_info.PatName,
			depName: '呼吸内科门诊',
			doctName: '武亚妮',
			pbxh: '20',
			visitDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
			amPm: '1',
			patientID: $scope.app.user_info.PatientID,
			times: $filter('date')(new Date(), 'yyyy-MM-dd'),
			amount: '6',
			checkTime: '08:30' + '-' + '09:30',
			yhCardNo: '621700*********0785',
			prescRecordID: '',
			type: '1'
		}
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/zzghPrint', temp_obj)
			.then(function (res) {
				if (res.succeed) {
					//   
					//    开始打印
					window.terminal && window.terminal.PrintReceipt($scope.printStringEndFn(res.data.print, 0), '', '');
				} else {
					//
				}
			});
		
		
	}
	
	
	//   打印凭条测试 
	$scope.printPt4 = function(){
		//   打印凭条
		var temp_obj = {
			patName: $scope.app.user_info.PatName,
			cardNo: $scope.app.user_info.card_no,
			patientID: $scope.app.user_info.PatientID,
			orderId: '1000542552',
			doctName: '武亚妮',
			depName: '呼吸内科门诊',
			visitDate: '2018-01-09',
			visitNo: '1',
			orderTime: '2018-01-09 09:30:00',
			startTime: '09:30',
			endTime: '10:30',
			visitCost: '6.0',
			timeRange: '1'
		}
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/yyPrint', temp_obj)
			.then(function (res) {
				if (res.succeed) {
					//   
					//    开始打印
					window.terminal && window.terminal.PrintReceipt(res.data.print.toString(), '', '');
				} else {
				}
			});
		
		
	}
	
	//   打印凭条测试 
	$scope.printPt5 = function(){
		//   打印凭条
		var temp_obj = {
			cardNo: $scope.app.user_info.card_no,
			patName: $scope.app.user_info.PatName,
			patientID: $scope.app.user_info.PatientID,
			yHCardNo: '621700*******0785',
			fPFlow: '15264564',
			success: '成功',
			execDeptName: '口腔科门诊',
			paymentCharge: '3.01',
			prescRecordID: '001278975700/14/1',
			visitDate: '2018-01-09'
		}
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/jfPrint', temp_obj)
			.then(function (res) {
				if (res.succeed) {
					//   
					//    开始打印
					window.terminal && window.terminal.PrintReceipt(res.data.print.toString(), '', '');
				} else {
					//
				}
			});
		
		
	}
	
	//   取发药窗口号
	$scope.printPt6 = function(){
		//   打印凭条
		var temp_obj = {
			cardNo: $scope.app.user_info.card_no,
			patName: $scope.app.user_info.PatName,
			patientID: $scope.app.user_info.PatientID,
			prescRecordID: '001278975700/14/1',
			windowNO: '4',
			visitDate: '2018-01-09'
		}
		// log
		window.terminal && window.terminal.WriteLog('rq /api/yytMace/v1/fyPrint:' + JSON.stringify(temp_obj));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/fyPrint', temp_obj)
			.then(function (res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytMace/v1/fyPrint:' + JSON.stringify(res));
				if (res.succeed) {
					
					//   
					//    开始打印
					window.terminal && window.terminal.PrintReceipt(res.data.print.toString(), '', '');
				} else {
					//
				}
			});
		
		
	}
	
	
	
	
	
	//   打印完成回调
	terminal_device.print_receipt.cb_print_receipt = function(res_Status, res_str){
		alert('打印完成回调')
		alert('res_Status' + res_Status);
		alert('res_str' + res_str);
		
		if(res_Status == '0'){
			//  正常打印  设置
			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('1');
			//  5秒关闭
			$timeout(function(){window.terminal && window.terminal.JSCloseTwinkleLED('1');},5000);
			
		} else if (res_Status == '99'){
			//   打开打印错误弹窗
			$scope.modelOpenPrintError(res_str);
		}else{
			//  打印异常
			alert('打印异常');
		}
	}
	
	
	
	
	//  灯光
	$scope.showDg = function(){
		//  正常打印  设置
			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('1');
			//  5秒关闭
			$timeout(function(){window.terminal && window.terminal.JSCloseTwinkleLED('1');},5000);
	}
	
	
	/**
	 * 说话
	 */
	$scope.spk = function() {
		window.terminal && window.terminal.PlaySpeak('');
		// window.terminal && window.terminal.PlaySpeak('独立寒秋，湘江北去，橘子洲头。看万山红遍，层林尽染；漫江碧透，百舸争流。			鹰击长空，鱼翔浅底，万类霜天竞自由。		怅寥廓，问苍茫大地，谁主沉浮？			携来百侣曾游。忆往昔峥嵘岁月稠。			恰同学少年，风华正茂；书生意气，挥斥方遒。			指点江山，激扬文字，粪土当年万户侯。			曾记否，到中流击水，浪遏飞舟？');
	}
	//
	$scope.spkStop = function () {
		window.terminal && window.terminal.PlaySpeakResume();
	}
		
	
	
	//  
	//  自助挂号凭条打印
	var zzghPrint = function(){
		//
		var temp_obj = {
			'cardNo': '7166202',
			'patName': '曾维美',
			'depName': '医疗美容科门诊',
			'doctName': '张云华',
			'pbxh': '21',
			'visitDate': '2017-12-30',
			'amPm': 'b',
			'patientID': '001284804700',
			'times': '',
			'amount': '',
			'checkTime': '16:00-17:00',
			'prescRecordID': '',
			'type': '1'
		}
		
		var temp_obj2 = {
			'cardNo': '6409342',
			'patName': '',
			'depName': '',
			'doctName': '',
			'pbxh': '',
			'visitDate': '',
			'amPm': 'b',
			'patientID': '001117335900',
			'times': '',
			'amount': '',
			'checkTime': '',
			'prescRecordID': '001117335900/133/9-001117335900/133/9',
			'type': '3'
		}
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/zzghPrint', temp_obj)
		.then(function(res){
			if(res.succeed){
				//   退号成功
				//   返回第一步重新发起  提交预约
			}else{
				//  提交失败
			}
		});
	}
	
	// zzghPrint();
	
	
	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("rechargeCtrl");
	if (tm.Key != "rechargeCtrl") {
		tm.Key = "rechargeCtrl";
		tm.keyctrl = "app.recharge";
		tm.fnAutoRefresh = function () {
			console.log("开始调用定时器");
			tm.interval = $interval(function () {
				if ($scope.countdown_time > 0) {
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
		tm.fnStopAutoRefresh = function () {
			$scope.countdown_time = 60;
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
	
	
	
	var run = function(){
		//   播放声音
		$scope.audio_list.play('audio_001');
	}
	run();
	
});



/**
 * 住院预交金充值
 */
app.controller('rechargeRechargeCtrl', function ($scope, $interval, $timeout, $stateParams, $filter, httpService, globalFn) {
	
	//   当前页面返回秒数
	$scope.countdown_time = 30;
	//
	$scope.status = 1;

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
			card_money:'',
			//   银行充值充值输入金额 提示
			card_money_msg: '',
			//   现金充值 入钞金额  单位元
			money_money:''
		},
		//  住院号_住院次数获取
		'inpatient': [],
		//  住院病人在院信息(住院）
		'patient': {},
		//  his 主键
		'zydepo': {},
		//   住院病人费用余额查询（住院）
		'depoSum': {},
		//
		'items':[],
		//   对items 数据进行分页
		'page':{
			pageIndex:1,
			pageSize:6,
			total:0,
			row:[],
			//   分页初始化
			pageFn:function(index){
				if($scope.data.page.total > (index - 1) * $scope.data.page.pageSize){
					$scope.data.page.row = $scope.data.items.slice((index - 1) * $scope.data.page.pageSize, $scope.data.page.pageSize * index );
					$scope.data.page.pageIndex = index;
				}else{
					$scope.data.page.row = $scope.data.items.slice(0, $scope.data.page.pageSize * index );
					$scope.data.page.pageIndex = 1;
				}
			}
		}
	}


	//   数字键盘按下
	$scope.keyb = function (str) {
		if (str == 'backspace') {
			if ($scope.data.form.card_money.length > 0) {
				$scope.data.form.card_money = $scope.data.form.card_money.substr(0, $scope.data.form.card_money.length - 1);
			}
		} else if (str == 'delete') {
			$scope.data.form.card_money = "";
		} else if (/[0-9]/.test(str)) {
			if ($scope.data.form.card_money.length < 16) {
				$scope.data.form.card_money = $scope.data.form.card_money + str.toString();
			}
		}
	}
	

	//  身份证登录
	$scope.statusID = function () {
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_003');

		// $scope.data.form.inp_no = '430521198911273807';
		// $scope.status = 3;
		// getInpatientNO($scope.data.form.inp_no);
		// return false;

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
	terminal_device.build_card.cb_id = function (obj) {
		// log
		window.terminal && window.terminal.WriteLog('res 读取身份证回调:' + JSON.stringify(obj));
		//
		if (obj && obj.MsgCode == '1000') {
			//   性别
			if (obj.MsgStr.PeopleSex == '男') {
				$scope.PatSex = '1';
			} else if (obj.MsgStr.PeopleSex == '女') {
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
			switch (obj.MsgCode) {
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
	$scope.statusCARD = function () {
		if ($scope.app.user_info && $scope.app.user_info.card_no){
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
		}else{
			//   没有插入诊疗卡
			$scope.openInCard();
			//   插卡完成回调
			$scope.openInCard_modalInstance.result.then(function (selectedItem) {
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

			}, function () {
				//
			});
		}
	}


	
	//   取 住院号_住院次数获取
	var getInpatientNO = function(patientID){
		//
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/getInpatientNO/' + patientID)
		.then(function(res){
			//
			$scope.items_loadding = false;
			//
			if (res.succeed) {
				if (res.data.item.__proto__.constructor == Array) {
					res.data.item = res.data.item;
				} else {
					res.data.item = [res.data.item];
				}
				//   是否是单条
				if (res.data.item.length  == 1){
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

				}else{
					//  提交失败
					$scope.systemError('业务处理失败：请到窗口办理。');
				}
			} else {
				//
			}
		});
	}
	
	
	//  获取住院病人在院信息(住院）
	var getPatientMSG = function(inpNo){
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/getPatientMSG/' + inpNo)
		.then(function(res){
			if(res.succeed){
				$scope.data.patient = res.data;
			}else{
				$scope.data.patient = {};
			}
		});
	}
	
	
	//  获取 住院病人费用余额查询（住院）
	var GetDepoSum = function(patientID, time){
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/GetDepoSum/' + patientID + '/' + time)
		.then(function(res){
			if(res.succeed){
				$scope.data.depoSum = res.data;
			}else{
				$scope.data.depoSum = {};
			}
		});
	}

	//  1.1.1.44.预交金获取his主键(住院） 
	var zydepo = function (inpno) {
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/zydepo/' + inpno)
			.then(function (res) {
				if (res.succeed) {
					$scope.data.zydepo = res.data;
					//
					$scope.show_btn = true;
				} else {
					$scope.data.zydepo = {};
				}
			});
	}
	
	
	//  获取住院病人预交金信息（住院）
	var getDepo = function(patientID, time){
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/getDepo/' + patientID + '/' + time)
		.then(function(res){
			//
			if(res.succeed){
				if(res.data.item.__proto__.constructor == Array){
					$scope.data.items = res.data.item;
				}else{
					$scope.data.items = [res.data.item];
				}
				$scope.data.page.total = $scope.data.items.length;
				//  分页
				$scope.data.page.pageFn(1);
			}else{
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
	var bankRecharge = function (money) {
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
	terminal_device.build_card.cb_money = function (res_Status, res_obj) {
		//
		window.terminal && window.terminal.JSCloseTwinkleLED('4');
		// log
		window.terminal && window.terminal.WriteLog('硬件回调： clinicCtrl terminal_device.build_card.cb_money: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//
		$scope.bankRechargeStatus = res_Status;
		$scope.bankRechargeObj = res_obj;
		//  
		// alert('银行充值回调123');
		if (res_Status == 0) {
			//alert('银行充值成功');
			//   充值成功
			//  住院充值
			doZyDeposit();
		} else {
			//  alert('银行充值失败');
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
				default: $scope.systemError('交易错误');
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
	$scope.bankCorrect = function (trace_no, money) {
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
	terminal_device.build_card.cb_money_filling = function (res_Status, res_obj) {
		// log
		window.terminal && window.terminal.WriteLog('硬件回调： clinicCtrl terminal_device.build_card.cb_money_filling: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//
		$scope.bankCorrectStatus = res_Status;
		$scope.bankCorrectObj = res_obj;
		//
		if (res_Status == 0) {
			//   充正成功
			//alert('充正成功');
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

	//  1.1.1.49.预交金确认缴费(住院） --超时确认
	var checkDepo = function (patientid, zytimes, depotimes, cb) {
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/checkDepo/' + patientid + '/' + zytimes + '/' + depotimes)
			.then(function (res) {
				typeof cb == "function" && cb(res);
			});
	}

	//  1.1.1.48.自助机HIS预交金缴费(住院） 
	var doZyDeposit = function () {
		var temp_obj = {
			patientId: $scope.data.zydepo.patientid,
			zyTimes: $scope.data.zydepo.zytimes,
			depoTimes: $scope.data.zydepo.depotimes,
			depoAmount: $scope.money,
			paymentType: '7',
			opera: $scope.app.device_info.user.terminalNo,
			wardsn: $scope.data.zydepo.ward_sn,
			deptsn: $scope.data.zydepo.dept_sn,
			bankCardNo: $scope.bankRechargeObj.Pan ? $scope.bankRechargeObj.Pan : '',
			bankTranSerNo: $scope.bankRechargeObj.Trace_no ? $scope.bankRechargeObj.Terminal + $scope.bankRechargeObj.Trace_no : '',
			bankTranDate: $filter('date')(new Date(), 'yyyyMMddHHmmss00'),
			pOSSerNo: $scope.app.device_info.user.terminalNo,
		}
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/doZyDeposit', temp_obj)
			.then(function (res) {
				if (res.succeed) {
					//
					$scope.data.doZyDeposit_bol = 1;
					//   缴费成功 打印凭条
					$scope.statusFn1();
				} else {
					//  缴费失败
					//  缴费方式
					switch ($scope.data.type) {
						case 'card':
							//   银行卡
							//   支付完成确认
							checkDepo($scope.data.zydepo.patientid, $scope.data.zydepo.zytimes, $scope.data.zydepo.depotimes, function (res_checkDepo) {
								if (res_checkDepo.succeed){
									//  确认续费成功
									$scope.data.doZyDeposit_bol = 1;
									//   缴费成功 打印凭条
									$scope.statusFn1();
								} else if (res_checkDepo.succeed == false && res_checkDepo.code == -1) {
									//  确认续费成功
									$scope.data.doZyDeposit_bol = 0;
									//   缴费成功 打印凭条
									$scope.statusFn1();
									//
									$scope.systemError('请求超时：请与工作人员联系');
									//
									$scope.locationBk();
									
								}else{
									//   确认缴费失败
									$scope.data.doZyDeposit_bol = 0;
									//   银行充正
									$scope.bankCorrect($scope.bankRechargeObj.Trace_no, globalFn.accMul($scope.money, 100));
									//
									$scope.systemError('缴费失败：' + res.message);
								}
							});
							break;
						case 'money':
							//   现金
							//   支付完成确认
							checkDepo($scope.data.zydepo.patientid, $scope.data.zydepo.zytimes, $scope.data.zydepo.depotimes, function (res_checkDepo) {
								if (res_checkDepo.succeed) {
									//  确认续费成功
									$scope.data.doZyDeposit_bol = 1;
									//   缴费成功 打印凭条
									$scope.statusFn1();
								} else if (res_checkDepo.succeed == false && res_checkDepo.code == -1) {
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
	$scope.confirm_userinfo = function () {
		$scope.status = 31;
	}


	
	
	//   充值按钮
	$scope.payBtn = function () {
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
	$scope.payType = function (str) {
		$scope.data.type = str;
		//   打开充值方式页面
		switch (str) {
			case 'card':
				$scope.payCard();
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
	terminal_device.build_card.cb_money_money = function (obj) {
		// log
		window.terminal && window.terminal.WriteLog('住院现金缴费:' + JSON.stringify(obj));
		
		//
		if (obj && obj.MsgCode == '999') {
			//if(obj)alert(JSON.stringify(obj));
			//if(obj)alert(JSON.stringify(obj.MsgStr));
			
			$scope.money = +$scope.money + +obj.MsgStr;
			$scope.data.form.money_money = angular.copy($scope.money);
			$scope.$apply();
			//   提交用户充值记录

		}

	}

	//  回调 关闭放钞
	terminal_device.build_card.cb_money_close = function (obj) {
		// log
		window.terminal && window.terminal.WriteLog('住院现金缴费 - 结束:' + JSON.stringify(obj));

		//if(obj)alert(JSON.stringify(obj.MsgCode));

		//
		if (obj && obj.MsgCode == '0') {
			//if(obj)alert(JSON.stringify(obj));
			//if(obj)alert(JSON.stringify(obj.MsgStr));

			//$scope.money = $scope.money + +obj.MsgStr;
			//$scope.$apply();
		}

	}


	//   现金充值
	$scope.payMoney = function () {
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
		// $scope.countdown_time = 600;
		// tm.fnAutoRefreshfn(tm);
		//  放钞
		window.terminal && window.terminal.JSOpenCashFun('terminal_device.build_card.cb_money_money');
		//  灯光提示
		window.terminal && window.terminal.JSOpenTwinkleLED('2');

	}

	//   结束入钞 现金充值面页
	$scope.payMoneyPage = function () {
		//
		$scope.status = 10;
		//
		window.terminal && window.terminal.JSCloseTwinkleLED('2');
		//  关闭放钞
		window.terminal && window.terminal.JSCloseCashFun('terminal_device.build_card.cb_money_close');
		//
		if(+$scope.data.form.money_money > 0){
			//   提交
			doZyDeposit();
		}else{
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
	$scope.card_money_msg_null = function () {
		$scope.data.form.card_money_msg = '';
	}

	//   银行充值
	$scope.payCard = function () {
		//  打开银行充值页面
		$scope.status = 5;
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 60;
		tm.fnAutoRefreshfn(tm);
	}


	//   银行充值页面
	$scope.payCardPage = function () {
		$scope.money = angular.copy($scope.data.form.card_money);

		$scope.data.form.card_money_msg = '';
		//  
		if (+$scope.data.form.card_money <= 0) {
			$scope.data.form.card_money_msg = '充值金额必须大于0';
			return false;
		}
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


	}


	//============================================



	//   凭条打印更新 打印结果上传
	var printLog = function () {
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/printLog', {
			lid: $scope.res_jfPrint.lid,
			type: $scope.data.doZyDeposit_bol ? $scope.data.doZyDeposit_bol : 0
		})
			.then(function (res) {
				// log
				window.terminal && window.terminal.WriteLog('res 门诊缴费 /api/yytMace/v1/printLog:' + JSON.stringify(res));
			});
	}
	

	//   充值完成 打印
	$scope.statusFn1 = function () {
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
			.then(function (res) {
				//
				if (res.succeed) {
					//    开始打印
					window.terminal && window.terminal.PrintReceipt($scope.printStringEndFn(res.data.print, $scope.data.doZyDeposit_bol ? 0 : 1), '', '');
				} else {
					//  提交失败
					$scope.systemError('打印失败请与维护人员联系');

					//  返回选择医生
					$scope.locationBk();
				}
			});

		// var printTemplate =
		// 	'   [BIG]株洲市中心医院[CBIG]\n\n'
		// 	+ '---------------住院预交金缴费---------------\n\n'
		// 	+ '打印日期：' + $filter('date')(new Date(), 'yyyy-MM-dd')+'\n'
		// 	+ '姓    名：' + $scope.data.zydepo.patient_name + '\n'
		// 	+ '患 者 ID：' + $scope.data.zydepo.patientid + '\n'
		// 	+ '住 院 号：' + $scope.data.zydepo.inp_no + '\n'
		// 	+ '住院次数：' + $scope.data.zydepo.zytimes + '\n'
		// 	+ '缴费次数：' + $scope.data.zydepo.depotimes + '\n'
		// 	+ '充值方式：' + ($scope.data.type =='card' ? '银行卡' : '现金') + '\n'
		// 	+ '缴费金额：' + $scope.money + '元\n'
		// 	+ '机 器 号：' + $scope.app.device_info.user.terminalNo+'\n\n'
		// 	+ '----------------------------------\n\n'
		// 	+ '温馨提示：\n'
		// 	+ '凭条是您的缴费/退费的凭证，请妥善保管\n\n'
		// 	;

		// window.terminal && window.terminal.PrintReceipt($scope.printStringEndFn(printTemplate, $scope.data.doZyDeposit_bol ? 0 : 1), '', '');
	}




	//   充值完成 显示状态与提示
	$scope.statusFn2 = function () {
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
		$scope.countdown_time = 5;
		tm.fnAutoRefreshfn(tm);

	}


	//   打印完成回调
	terminal_device.print_receipt.cb_print_receipt = function (res_Status, res_str) {
		if (res_Status == '0') {
			//  正常打印  设置
			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('1');
			//  5秒关闭
			$timeout(function () { window.terminal && window.terminal.JSCloseTwinkleLED('1'); }, 5000);
			//
			// printLog();
			//
			$scope.statusFn2();
			//   
		} else if (res_Status == '99') {
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
	if (tm.Key != "rechargeRechargeCtrl") {
		tm.Key = "rechargeRechargeCtrl";
		tm.keyctrl = "app.recharge.recharge";
		tm.fnAutoRefresh = function () {
			console.log("开始调用定时器");
			tm.interval = $interval(function () {
				if ($scope.countdown_time > 0) {
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
		tm.fnStopAutoRefresh = function () {
			$scope.countdown_time = 60;
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
	
	
	
	var run = function(){
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_026');
	}
	run();
	
});





















/**
 * 缴费
 */
app.controller('rechargePaymentCtrl', function($scope,$interval) {
	
	//   当前页面返回秒数
	$scope.countdown_time = 6000;
	
	
	
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("rechargePayment");
	if(tm.Key!="rechargePayment"){
		tm.Key="rechargePayment";
		tm.keyctrl="app.recharge.payment";
		tm.fnAutoRefresh=function(){
			console.log("开始调用定时器");
			tm.interval = $interval(function() {
				if($scope.countdown_time > 0){
					$scope.countdown_time = $scope.countdown_time - 1;
				}else{
					$interval.cancel(tm.interval);
					tm.interval = null;
					$scope.countdown_time = 20;
				}
			}, 1000);
		};
		tm.fnStopAutoRefresh=function(){
			$scope.countdown_time = 20;
			console.log("进入取消方法");
			if(tm.interval != null) {
				$interval.cancel(tm.interval);
				tm.interval = null;
				console.log("进入取消成功");
			}
			tm.interval=null;
		};
		$scope.setglobaldata.addtimer(tm);
	}
	//结束定义定时器
	
	tm.fnAutoRefreshfn(tm);
	
	
	/**
	 * 表格1
	 */
	$scope.table_data = {
		form:{
			fucecode:"",
			fuceismenu:"",
			fucename:"",
			fuceparentcode:"0",
			ownerType:0,
			page:1,
			pageSize:10,
			sortname:"a.FUCECREATETIME",
			sortorder:"desc"
		},
		//   表格数据
		table_res:{
			code:"0001",
			message:"ok",
			rows:[
				{"order":"1","title":"呼吸内科1","type":"专家","date":"2017年10月20日 下午","state":"未取号",checked:false},
				{"order":"1","title":"呼吸内科1","type":"专家","date":"2017年10月20日 下午","state":"未取号"},
				{"order":"1","title":"呼吸内科1","type":"专家","date":"2017年10月20日 下午","state":"未取号"},
				{"order":"1","title":"呼吸内科1","type":"专家","date":"2017年10月20日 下午","state":"未取号"},
				{"order":"1","title":"呼吸内科1","type":"专家","date":"2017年10月20日 下午","state":"未取号"},
			],
			total:2,
			//
			maxSize:5
		},
		//   翻页
		pageChanged:function(){
			//  查询
			findFunctionList($scope.table_data.form);
		},
		//   每页显示多少条
		selectChanged:function(){
			findFunctionList($scope.table_data.form);
		}
	}
	
	
	
});



/**
 * 缴费 - 支付
 */
app.controller('rechargePaymentPayCtrl', function($scope,$interval,$timeout) {
	
	// //   当前页面返回秒数
	// $scope.countdown_time = 20;
	// //   步骤状态  1,输入充值金额。2，插入银行卡。3，输入银行密码
	// $scope.status = 1;
	
	// //开始定义定时器
	// var tm = $scope.setglobaldata.gettimer("rechargePaymentPayCtrl");
	// if (tm.Key !="rechargePaymentPayCtrl"){
	// 	tm.Key ="rechargePaymentPayCtrl";
	// 	tm.keyctrl="app.recharge.payment.pay";
	// 	tm.fnAutoRefresh=function(){
	// 		console.log("开始调用定时器");
	// 		tm.interval = $interval(function() {
	// 			if($scope.countdown_time > 0){
	// 				$scope.countdown_time = $scope.countdown_time - 1;
	// 			}else{
	// 				$interval.cancel(tm.interval);
	// 				tm.interval = null;
	// 				$scope.countdown_time = 20;
	// 			}
	// 		}, 1000);
	// 	};
	// 	tm.fnStopAutoRefresh=function(){
	// 		$scope.countdown_time = 20;
	// 		console.log("进入取消方法");
	// 		if(tm.interval != null) {
	// 			$interval.cancel(tm.interval);
	// 			tm.interval = null;
	// 			console.log("进入取消成功");
	// 		}
	// 		tm.interval=null;
	// 	};
	// 	$scope.setglobaldata.addtimer(tm);
	// }
	// //结束定义定时器
	
	// tm.fnAutoRefreshfn(tm);
	
	
	// //  1 选择支付方式
	// $scope.statusFn1 = function(str){
	// 	if(str == 'card'){
	// 		tm.fnStopAutoRefreshfn(tm);
	// 		$scope.countdown_time = 20;
	// 		$scope.status = 3;
	// 		$scope.statusFn3();
	// 	}else if(str == 'weixin'){
	// 		tm.fnStopAutoRefreshfn(tm);
	// 		$scope.countdown_time = 60;
	// 		tm.fnAutoRefreshfn(tm);
	// 		$scope.status = 2;
	// 		$scope.statusFn2();
	// 	}else if(str == 'alipay'){
	// 		tm.fnStopAutoRefreshfn(tm);
	// 		$scope.countdown_time = 60;
	// 		tm.fnAutoRefreshfn(tm);
	// 		$scope.status = 2;
	// 		$scope.statusFn2();
	// 	}
		
	// }
	
	// //  二维码支付
	// $scope.statusFn2 = function(){
	// 	//   
		
	// 	//  
	// 	$timeout(function(){
	// 		$scope.status = 3;
	// 		$scope.statusFn3();
	// 	},2000);
		
		
	// 	//
	// }
	
	
	// //  系统正在处理
	// $scope.statusFn3 = function(){
		
	// 	//
	// 	$timeout(function(){
	// 		$scope.statusFn4();
	// 	},2000);
		
	// }
	
	// //  正在打印凭条
	// $scope.statusFn4 = function(){
	// 	//   
	// 	$scope.status = 4;
	// 	//   
	// 	$timeout(function(){
	// 		$scope.statusFn5();
	// 	},2000);
	// }
	
	
	// //  充值成功
	// $scope.statusFn5 = function(){
	// 	$scope.status = 5;
	// 	//   
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 30;
	// 	tm.fnAutoRefreshfn(tm);
	// }
	
	
	
	
	
	
});




/**
 * 现金充值
 */
app.controller('rechargeRechargeMoneyCtrl', function($scope,$interval,$timeout) {
	
	// //   当前页面返回秒数
	// $scope.countdown_time = 20;
	
	// //   状态  1, 确认信息。2，入钞。3，打印凭条。4、打印凭条。5，充值成功成功
	// $scope.status = 1;
	
	// //开始定义定时器
	// var tm = $scope.setglobaldata.gettimer("rechargeRechargeMoneyCtrl");
	// if (tm.Key !="rechargeRechargeMoneyCtrl"){
	// 	tm.Key ="rechargeRechargeMoneyCtrl";
	// 	tm.keyctrl="app.recharge.recharge.money";
	// 	tm.fnAutoRefresh=function(){
	// 		console.log("开始调用定时器");
	// 		tm.interval = $interval(function() {
	// 			if($scope.countdown_time > 0){
	// 				$scope.countdown_time = $scope.countdown_time - 1;
	// 			}else{
	// 				$interval.cancel(tm.interval);
	// 				tm.interval = null;
	// 				//   返回上一级
	// 				$scope.locationBk();
	// 			}
	// 		}, 1000);
	// 	};
	// 	tm.fnStopAutoRefresh=function(){
	// 		$scope.countdown_time = 20;
	// 		console.log("进入取消方法");
	// 		if(tm.interval != null) {
	// 			$interval.cancel(tm.interval);
	// 			tm.interval = null;
	// 			console.log("进入取消成功");
	// 		}
	// 		tm.interval=null;
	// 	};
	// 	$scope.setglobaldata.addtimer(tm);
	// }
	// //结束定义定时器
	
	// tm.fnAutoRefreshfn(tm);
	
	
	
	// //  1 确认
	// $scope.statusFn1 = function(){
	// 	//   提交挂号信息
		
	// 	//  
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 180;
	// 	tm.fnAutoRefreshfn(tm);
	// 	$scope.status = 2;
		
	// 	//   播放声音
	// 	$scope.audio_list.allStop();
	// 	$scope.audio_list.play('audio_007');
		
	// }
	
	// //  入钞
	// $scope.statusFn2 = function(){
	// 	//   验证返回信息
		
	// 	//  
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 60;
	// 	$scope.status = 3;
		
	// 	//   播放声音
	// 	$scope.audio_list.allStop();
	// 	$scope.audio_list.play('audio_008');
		
	// 	//
	// 	$timeout(function(){
	// 		$scope.statusFn3();
	// 	},2000);
	// }
	
	
	// //  系统正在处理中
	// $scope.statusFn3 = function(){
	// 	//  
		
	// 	//  
	// 	$scope.status = 4;
		
	// 	//
	// 	$timeout(function(){
	// 		$scope.statusFn4();
	// 	},2000);
	// }
	
	
	// //  正在打印凭条
	// $scope.statusFn4 = function(){
	// 	//   
		
	// 	$scope.status = 5;
		
	// 	//   播放声音
	// 	$scope.audio_list.allStop();
	// 	$scope.audio_list.play('audio_013');
		
	// 	//   
	// 	$timeout(function(){
	// 		$scope.statusFn5();
	// 	},2000);
	// }
	
	// //  充值成功
	// $scope.statusFn5 = function(){
	// 	//   
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 20;
	// 	tm.fnAutoRefreshfn(tm);
	// }
	
	// var run = function(){
	// 	//   播放声音
	// 	$scope.audio_list.allStop();
	// 	$scope.audio_list.play('audio_006');
	// }
	// run();
	
	
});



/**
 * 银行卡充值
 */
app.controller('rechargeRechargeCardCtrl', function($scope,$interval,$modal,$timeout) {
	
	// //  form
	// $scope.form_data = {
	// 	money:"100",
	// 	//   银行卡号
	// 	id:"6222021912000424551",
	// 	title_id:"",
	// 	//   密码
	// 	pwd:"123456"
	// }
	
	// //   当前页面返回秒数
	// $scope.countdown_time = 20;
	// //   步骤状态  1,输入充值金额。2，插入银行卡。3，输入银行密码
	// $scope.status = 1;
	
	
	// //   监听  id 银行卡号 隐藏中间几位
	// $scope.$watch('form_data.id', function(newValue, oldValue, scope) {
	// 	if(newValue){
	// 		$scope.form_data.title_id = newValue.substr(0,4) + ' **** **** ' + newValue.substr(12,4) + ' ' + newValue.substr(16);
	// 	}
	// });
	
	
	// //开始定义定时器
	// var tm=$scope.setglobaldata.gettimer("rechargeRechargeCard");
	// if(tm.Key!="rechargeRechargeCard"){
	// 	tm.Key="rechargeRechargeCard";
	// 	tm.keyctrl="app.recharge.recharge.card";
	// 	tm.fnAutoRefresh=function(){
	// 		console.log("开始调用定时器");
	// 		tm.interval = $interval(function() {
	// 			if($scope.countdown_time > 0){
	// 				$scope.countdown_time = $scope.countdown_time - 1;
	// 			}else{
	// 				$interval.cancel(tm.interval);
	// 				tm.interval = null;
	// 				//   返回上一级
	// 				$scope.locationBk();
	// 			}
	// 		}, 1000);
	// 	};
	// 	tm.fnStopAutoRefresh=function(){
	// 		$scope.countdown_time = 20;
	// 		console.log("进入取消方法");
	// 		if(tm.interval != null) {
	// 			$interval.cancel(tm.interval);
	// 			tm.interval = null;
	// 			console.log("进入取消成功");
	// 		}
	// 		tm.interval=null;
	// 	};
	// 	$scope.setglobaldata.addtimer(tm);
	// }
	// //结束定义定时器
	
	// tm.fnAutoRefreshfn(tm);
	
	
	// //   数字键盘按下
	// $scope.keyb = function(str){
	// 	if(str == 'backspace'){
	// 		if($scope.form_data.money.length > 0){
	// 			$scope.form_data.money = $scope.form_data.money.substr(0,$scope.form_data.money.length - 1);
	// 		}
	// 	}else if(str == 'delete'){
	// 		$scope.form_data.money = "";
	// 	}else if(/[0-9]/.test(str)){
	// 		if($scope.form_data.money.length < 7){
	// 			$scope.form_data.money = $scope.form_data.money + str.toString();
	// 		}
	// 	}
	// }
	
	
	// //  1 银行卡充值
	// $scope.statusFn1 = function(){
	// 	//   提交挂号信息
		
	// 	//  
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 20;
	// 	tm.fnAutoRefreshfn(tm);
	// 	$scope.status = 2;
		
	// }
	
	// //  选择账户
	// $scope.statusFn2 = function(){
	// 	//   
		
	// 	//  
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 20;
	// 	tm.fnAutoRefreshfn(tm);
	// 	$scope.status = 3;
		
	// 	//   播放声音
	// 	$scope.audio_list.allStop();
	// 	$scope.audio_list.play('audio_014');
		
		
	// 	//
	// }
	
	
	// //  插入银行卡
	// $scope.statusFn3 = function(){
	// 	//  
		
		
		
	// 	//  
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 60;
	// 	tm.fnAutoRefreshfn(tm);
	// 	$scope.status = 4;
	// 	//
	// 	$timeout(function(){
	// 		$scope.statusFn4();
	// 	},5000);
		
	// }
	
	
	// //  输入密码
	// $scope.statusFn4 = function(){
	// 	//   
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 60;
	// 	tm.fnAutoRefreshfn(tm);
	// 	$scope.status = 5;
	// }
	
	// //  充值金额
	// $scope.statusFn5 = function(){
	// 	//   
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 60;
	// 	tm.fnAutoRefreshfn(tm);
	// 	$scope.status = 6;
	// }
	
	// //  确认金额
	// $scope.statusFn6 = function(){
	// 	//   
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 20;
	// 	tm.fnAutoRefreshfn(tm);
	// 	$scope.status = 7;
	// 	//
	// 	$timeout(function(){
	// 		$scope.statusFn7();
	// 	},2000);
		
	// }
	
	// //  系统正在管理
	// $scope.statusFn7 = function(){
	// 	//   
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 30;
	// 	$scope.status = 8;
	// 	//   
	// 	$timeout(function(){
	// 		$scope.statusFn8();
	// 	},2000);
	// }
	
	// //  正在打印凭条
	// $scope.statusFn8 = function(){
	// 	//   
	// 	$scope.status = 9;
	// 	//   
	// 	$timeout(function(){
	// 		$scope.statusFn9();
	// 	},2000);
	// }
	
	
	// //  充值成功
	// $scope.statusFn9 = function(){
	// 	//   
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 30;
	// 	tm.fnAutoRefreshfn(tm);
	// }
	
	// var run = function(){
	// 	//   播放声音
	// 	$scope.audio_list.allStop();
	// 	$scope.audio_list.play('audio_006');
	// }
	// run();
	
	
});






/**
 * 手机充值
 */
app.controller('rechargeRechargeWeixinCtrl', function($scope,$interval,$modal,$timeout) {
	
	// //  form
	// $scope.form_data = {
	// 	money:"100",
	// 	//   银行卡号
	// 	id:"6222021912000424551",
	// 	title_id:"",
	// 	//   密码
	// 	pwd:"123456"
	// }
	
	// //   当前页面返回秒数
	// $scope.countdown_time = 20;
	// //   步骤状态
	// $scope.status = 1;
	
	
	// //开始定义定时器
	// var tm=$scope.setglobaldata.gettimer("rechargeRechargeWeixinCtrl");
	// if(tm.Key!="rechargeRechargeWeixinCtrl"){
	// 	tm.Key="rechargeRechargeWeixinCtrl";
	// 	tm.keyctrl="app.recharge.recharge.weixin";
	// 	tm.fnAutoRefresh=function(){
	// 		console.log("开始调用定时器");
	// 		tm.interval = $interval(function() {
	// 			if($scope.countdown_time > 0){
	// 				$scope.countdown_time = $scope.countdown_time - 1;
	// 			}else{
	// 				$interval.cancel(tm.interval);
	// 				tm.interval = null;
	// 				//   返回上一级
	// 				$scope.locationBk();
	// 			}
	// 		}, 1000);
	// 	};
	// 	tm.fnStopAutoRefresh=function(){
	// 		$scope.countdown_time = 20;
	// 		console.log("进入取消方法");
	// 		if(tm.interval != null) {
	// 			$interval.cancel(tm.interval);
	// 			tm.interval = null;
	// 			console.log("进入取消成功");
	// 		}
	// 		tm.interval=null;
	// 	};
	// 	$scope.setglobaldata.addtimer(tm);
	// }
	// //结束定义定时器
	
	// tm.fnAutoRefreshfn(tm);
	
	
	// //   数字键盘按下
	// $scope.keyb = function(str){
	// 	if(str == 'backspace'){
	// 		if($scope.form_data.money.length > 0){
	// 			$scope.form_data.money = $scope.form_data.money.substr(0,$scope.form_data.money.length - 1);
	// 		}
	// 	}else if(str == 'delete'){
	// 		$scope.form_data.money = "";
	// 	}else if(/[0-9]/.test(str)){
	// 		if($scope.form_data.money.length < 7){
	// 			$scope.form_data.money = $scope.form_data.money + str.toString();
	// 		}
	// 	}
	// }
	
	
	// //  1 手机充值   选择账户
	// $scope.statusFn1 = function(){
	// 	//   提交挂号信息
		
	// 	//  
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 20;
	// 	tm.fnAutoRefreshfn(tm);
	// 	$scope.status = 2;
		
	// }
	
	// //  输入金额
	// $scope.statusFn2 = function(){
	// 	//   
		
	// 	//  
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 30;
	// 	tm.fnAutoRefreshfn(tm);
	// 	$scope.status = 3;
		
	// 	//
	// 	$timeout(function(){
	// 		$scope.statusFn3();
	// 	},5000);
	// }
	
	
	// //  二维码
	// $scope.statusFn3 = function(){
	// 	//   取二维码  完成支付
		
	// 	//  
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 60;
	// 	tm.fnAutoRefreshfn(tm);
	// 	$scope.status = 4;
	// 	//
	// 	$timeout(function(){
	// 		$scope.statusFn4();
	// 	},2000);
		
	// }
	
	// //  系统正在管理
	// $scope.statusFn4 = function(){
	// 	//   
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 30;
	// 	$scope.status = 5;
	// 	//   
	// 	$timeout(function(){
	// 		$scope.statusFn5();
	// 	},2000);
	// }
	
	// //  正在打印凭条
	// $scope.statusFn5 = function(){
	// 	//   
	// 	$scope.status = 6;
	// 	//   
	// 	$timeout(function(){
	// 		$scope.statusFn6();
	// 	},2000);
	// }
	
	
	// //  充值成功
	// $scope.statusFn6 = function(){
	// 	//   
	// 	tm.fnStopAutoRefreshfn(tm);
	// 	$scope.countdown_time = 30;
	// 	tm.fnAutoRefreshfn(tm);
	// }
	
	
	
	
});





