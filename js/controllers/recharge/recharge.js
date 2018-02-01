'use strict';

/**
 * 缴费/充值
 */
app.controller('rechargeCtrl', function($scope,$interval,$timeout,httpService, $filter) {
	
	//   当前页面返回秒数
	$scope.countdown_time = 6000;
	
	
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
	
	zzghPrint();
	
	
	
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("recharge");
	if(tm.Key!="recharge"){
		tm.Key="recharge";
		tm.keyctrl="app.recharge";
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
	
	
	var run = function(){
		//   播放声音
		$scope.audio_list.play('audio_001');
	}
	run();
	
});



/**
 * 住院预交金充值
 */
app.controller('rechargeRechargeCtrl', function($scope, $interval, $timeout, $stateParams, $filter, httpService) {
	
	//   当前页面返回秒数
	$scope.countdown_time = 6000;
	
	
	//  数据
	$scope.data = {
		//  住院号_住院次数获取
		'inpatient': {},
		//  住院病人在院信息(住院）
		'patient': {},
		//   住院病人费用余额查询（住院）
		'depoSum': {},
		//
		'items':[],
		//   对items 数据进行分页
		'page':{
			pageIndex:1,
			pageSize:12,
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
	
	
	//   取 住院号_住院次数获取
	var getInpatientNO = function(patientID){
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/getInpatientNO/' + patientID)
		.then(function(res){
			if(res.succeed){
				$scope.data.inpatient = res.data;
				//  获取住院病人在院信息(住院）
				getPatientMSG($scope.data.inpatient.InpatientNo);
				//  获取 住院病人费用余额查询（住院）
				GetDepoSum(patientID, $scope.data.inpatient.Times);
				//  获取住院病人预交金信息（住院）
				getDepo(patientID, $scope.data.inpatient.Times);
			}else{
				$scope.data.inpatient = {};
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
	
	
	//  获取住院病人预交金信息（住院）
	var getDepo = function(patientID, time){
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/getDepo/' + patientID + '/' + time)
		.then(function(res){
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
	
	
	
	
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("rechargeRecharge");
	if(tm.Key!="rechargeRecharge"){
		tm.Key="rechargeRecharge";
		tm.keyctrl="app.recharge.recharge";
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
	
	var run = function(){
		//   播放声音
		$scope.audio_list.play('audio_001');
		//
		getInpatientNO($scope.app.user_info.PatientID);
		
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
	
	//   当前页面返回秒数
	$scope.countdown_time = 20;
	//   步骤状态  1,输入充值金额。2，插入银行卡。3，输入银行密码
	$scope.status = 1;
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("rechargePaymentPayCtrl");
	if(tm.Key!="rechargePaymentPayCtrl"){
		tm.Key="rechargePaymentPayCtrl";
		tm.keyctrl="app.recharge.payment.pay";
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
	
	
	//  1 选择支付方式
	$scope.statusFn1 = function(str){
		if(str == 'card'){
			tm.fnStopAutoRefreshfn(tm);
			$scope.countdown_time = 20;
			$scope.status = 3;
			$scope.statusFn3();
		}else if(str == 'weixin'){
			tm.fnStopAutoRefreshfn(tm);
			$scope.countdown_time = 60;
			tm.fnAutoRefreshfn(tm);
			$scope.status = 2;
			$scope.statusFn2();
		}else if(str == 'alipay'){
			tm.fnStopAutoRefreshfn(tm);
			$scope.countdown_time = 60;
			tm.fnAutoRefreshfn(tm);
			$scope.status = 2;
			$scope.statusFn2();
		}
		
	}
	
	//  二维码支付
	$scope.statusFn2 = function(){
		//   
		
		//  
		$timeout(function(){
			$scope.status = 3;
			$scope.statusFn3();
		},2000);
		
		
		//
	}
	
	
	//  系统正在处理
	$scope.statusFn3 = function(){
		
		//
		$timeout(function(){
			$scope.statusFn4();
		},2000);
		
	}
	
	//  正在打印凭条
	$scope.statusFn4 = function(){
		//   
		$scope.status = 4;
		//   
		$timeout(function(){
			$scope.statusFn5();
		},2000);
	}
	
	
	//  充值成功
	$scope.statusFn5 = function(){
		$scope.status = 5;
		//   
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 30;
		tm.fnAutoRefreshfn(tm);
	}
	
	
	
	
	
	
});




/**
 * 现金充值
 */
app.controller('rechargeRechargeMoneyCtrl', function($scope,$interval,$timeout) {
	
	//   当前页面返回秒数
	$scope.countdown_time = 20;
	
	//   状态  1, 确认信息。2，入钞。3，打印凭条。4、打印凭条。5，充值成功成功
	$scope.status = 1;
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("rechargeRechargeMoney");
	if(tm.Key!="rechargeRechargeMoney"){
		tm.Key="rechargeRechargeMoney";
		tm.keyctrl="app.recharge.recharge.money";
		tm.fnAutoRefresh=function(){
			console.log("开始调用定时器");
			tm.interval = $interval(function() {
				if($scope.countdown_time > 0){
					$scope.countdown_time = $scope.countdown_time - 1;
				}else{
					$interval.cancel(tm.interval);
					tm.interval = null;
					//   返回上一级
					$scope.locationBk();
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
	
	
	
	//  1 确认
	$scope.statusFn1 = function(){
		//   提交挂号信息
		
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 180;
		tm.fnAutoRefreshfn(tm);
		$scope.status = 2;
		
		//   播放声音
		$scope.audio_list.allStop();
		$scope.audio_list.play('audio_007');
		
	}
	
	//  入钞
	$scope.statusFn2 = function(){
		//   验证返回信息
		
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 60;
		$scope.status = 3;
		
		//   播放声音
		$scope.audio_list.allStop();
		$scope.audio_list.play('audio_008');
		
		//
		$timeout(function(){
			$scope.statusFn3();
		},2000);
	}
	
	
	//  系统正在处理中
	$scope.statusFn3 = function(){
		//  
		
		//  
		$scope.status = 4;
		
		//
		$timeout(function(){
			$scope.statusFn4();
		},2000);
	}
	
	
	//  正在打印凭条
	$scope.statusFn4 = function(){
		//   
		
		$scope.status = 5;
		
		//   播放声音
		$scope.audio_list.allStop();
		$scope.audio_list.play('audio_013');
		
		//   
		$timeout(function(){
			$scope.statusFn5();
		},2000);
	}
	
	//  充值成功
	$scope.statusFn5 = function(){
		//   
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 20;
		tm.fnAutoRefreshfn(tm);
	}
	
	var run = function(){
		//   播放声音
		$scope.audio_list.allStop();
		$scope.audio_list.play('audio_006');
	}
	run();
	
	
});



/**
 * 银行卡充值
 */
app.controller('rechargeRechargeCardCtrl', function($scope,$interval,$modal,$timeout) {
	
	//  form
	$scope.form_data = {
		money:"100",
		//   银行卡号
		id:"6222021912000424551",
		title_id:"",
		//   密码
		pwd:"123456"
	}
	
	//   当前页面返回秒数
	$scope.countdown_time = 20;
	//   步骤状态  1,输入充值金额。2，插入银行卡。3，输入银行密码
	$scope.status = 1;
	
	
	//   监听  id 银行卡号 隐藏中间几位
	$scope.$watch('form_data.id', function(newValue, oldValue, scope) {
		if(newValue){
			$scope.form_data.title_id = newValue.substr(0,4) + ' **** **** ' + newValue.substr(12,4) + ' ' + newValue.substr(16);
		}
	});
	
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("rechargeRechargeCard");
	if(tm.Key!="rechargeRechargeCard"){
		tm.Key="rechargeRechargeCard";
		tm.keyctrl="app.recharge.recharge.card";
		tm.fnAutoRefresh=function(){
			console.log("开始调用定时器");
			tm.interval = $interval(function() {
				if($scope.countdown_time > 0){
					$scope.countdown_time = $scope.countdown_time - 1;
				}else{
					$interval.cancel(tm.interval);
					tm.interval = null;
					//   返回上一级
					$scope.locationBk();
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
	
	
	//   数字键盘按下
	$scope.keyb = function(str){
		if(str == 'backspace'){
			if($scope.form_data.money.length > 0){
				$scope.form_data.money = $scope.form_data.money.substr(0,$scope.form_data.money.length - 1);
			}
		}else if(str == 'delete'){
			$scope.form_data.money = "";
		}else if(/[0-9]/.test(str)){
			if($scope.form_data.money.length < 7){
				$scope.form_data.money = $scope.form_data.money + str.toString();
			}
		}
	}
	
	
	//  1 银行卡充值
	$scope.statusFn1 = function(){
		//   提交挂号信息
		
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 20;
		tm.fnAutoRefreshfn(tm);
		$scope.status = 2;
		
	}
	
	//  选择账户
	$scope.statusFn2 = function(){
		//   
		
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 20;
		tm.fnAutoRefreshfn(tm);
		$scope.status = 3;
		
		//   播放声音
		$scope.audio_list.allStop();
		$scope.audio_list.play('audio_014');
		
		
		//
	}
	
	
	//  插入银行卡
	$scope.statusFn3 = function(){
		//  
		
		
		
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 60;
		tm.fnAutoRefreshfn(tm);
		$scope.status = 4;
		//
		$timeout(function(){
			$scope.statusFn4();
		},5000);
		
	}
	
	
	//  输入密码
	$scope.statusFn4 = function(){
		//   
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 60;
		tm.fnAutoRefreshfn(tm);
		$scope.status = 5;
	}
	
	//  充值金额
	$scope.statusFn5 = function(){
		//   
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 60;
		tm.fnAutoRefreshfn(tm);
		$scope.status = 6;
	}
	
	//  确认金额
	$scope.statusFn6 = function(){
		//   
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 20;
		tm.fnAutoRefreshfn(tm);
		$scope.status = 7;
		//
		$timeout(function(){
			$scope.statusFn7();
		},2000);
		
	}
	
	//  系统正在管理
	$scope.statusFn7 = function(){
		//   
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 30;
		$scope.status = 8;
		//   
		$timeout(function(){
			$scope.statusFn8();
		},2000);
	}
	
	//  正在打印凭条
	$scope.statusFn8 = function(){
		//   
		$scope.status = 9;
		//   
		$timeout(function(){
			$scope.statusFn9();
		},2000);
	}
	
	
	//  充值成功
	$scope.statusFn9 = function(){
		//   
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 30;
		tm.fnAutoRefreshfn(tm);
	}
	
	var run = function(){
		//   播放声音
		$scope.audio_list.allStop();
		$scope.audio_list.play('audio_006');
	}
	run();
	
	
});






/**
 * 手机充值
 */
app.controller('rechargeRechargeWeixinCtrl', function($scope,$interval,$modal,$timeout) {
	
	//  form
	$scope.form_data = {
		money:"100",
		//   银行卡号
		id:"6222021912000424551",
		title_id:"",
		//   密码
		pwd:"123456"
	}
	
	//   当前页面返回秒数
	$scope.countdown_time = 20;
	//   步骤状态
	$scope.status = 1;
	
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("rechargeRechargeWeixinCtrl");
	if(tm.Key!="rechargeRechargeWeixinCtrl"){
		tm.Key="rechargeRechargeWeixinCtrl";
		tm.keyctrl="app.recharge.recharge.weixin";
		tm.fnAutoRefresh=function(){
			console.log("开始调用定时器");
			tm.interval = $interval(function() {
				if($scope.countdown_time > 0){
					$scope.countdown_time = $scope.countdown_time - 1;
				}else{
					$interval.cancel(tm.interval);
					tm.interval = null;
					//   返回上一级
					$scope.locationBk();
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
	
	
	//   数字键盘按下
	$scope.keyb = function(str){
		if(str == 'backspace'){
			if($scope.form_data.money.length > 0){
				$scope.form_data.money = $scope.form_data.money.substr(0,$scope.form_data.money.length - 1);
			}
		}else if(str == 'delete'){
			$scope.form_data.money = "";
		}else if(/[0-9]/.test(str)){
			if($scope.form_data.money.length < 7){
				$scope.form_data.money = $scope.form_data.money + str.toString();
			}
		}
	}
	
	
	//  1 手机充值   选择账户
	$scope.statusFn1 = function(){
		//   提交挂号信息
		
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 20;
		tm.fnAutoRefreshfn(tm);
		$scope.status = 2;
		
	}
	
	//  输入金额
	$scope.statusFn2 = function(){
		//   
		
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 30;
		tm.fnAutoRefreshfn(tm);
		$scope.status = 3;
		
		//
		$timeout(function(){
			$scope.statusFn3();
		},5000);
	}
	
	
	//  二维码
	$scope.statusFn3 = function(){
		//   取二维码  完成支付
		
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 60;
		tm.fnAutoRefreshfn(tm);
		$scope.status = 4;
		//
		$timeout(function(){
			$scope.statusFn4();
		},2000);
		
	}
	
	//  系统正在管理
	$scope.statusFn4 = function(){
		//   
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 30;
		$scope.status = 5;
		//   
		$timeout(function(){
			$scope.statusFn5();
		},2000);
	}
	
	//  正在打印凭条
	$scope.statusFn5 = function(){
		//   
		$scope.status = 6;
		//   
		$timeout(function(){
			$scope.statusFn6();
		},2000);
	}
	
	
	//  充值成功
	$scope.statusFn6 = function(){
		//   
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 30;
		tm.fnAutoRefreshfn(tm);
	}
	
	
	
	
});





