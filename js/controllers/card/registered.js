/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-01-03 11:14:54 
 * @Last Modified by: wu
 * @Last Modified time: 2018-01-31 11:11:11
 */

'use strict';

/**
 * 挂号 当班 - 科室
 */
app.controller('cardDepartmentCtrl', function($scope,$interval,httpService) {
	
	//   当前页面返回秒数
	$scope.countdown_time = 60;
	
	$scope.items_loadding = false;
	
	//  数据
	$scope.data = {
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
	
	
	//   当班 - 取科室
	var dept = function(deptCode){
		$scope.items_loadding = true;
		//
		deptCode ? deptCode : deptCode = null;
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/dept', {deptCode:''})
		.then(function(res){
			$scope.items_loadding = false;
			if(res.succeed){
				if (res.data.item.__proto__.constructor == Array) {
					$scope.data.items = res.data.item;
				} else {
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
	var tm=$scope.setglobaldata.gettimer("cardDepartmentCtrl");
	if(tm.Key!="cardDepartmentCtrl"){
		tm.Key="cardDepartmentCtrl";
		tm.keyctrl="app.card.department";
		tm.fnAutoRefresh=function(){
			console.log("开始调用定时器");
			tm.interval = $interval(function() {
				if($scope.countdown_time > 0){
					$scope.countdown_time = $scope.countdown_time - 1;
				}else{
					$interval.cancel(tm.interval);
					tm.interval = null;
					//$scope.countdown_time = 20;
					//   返回上一级
					$scope.locationBk();
				}
			}, 1000);
		};
		tm.fnStopAutoRefresh=function(){
			$scope.countdown_time = 60;
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
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_004');
		//   当班 - 取科室
		dept();
	}
	run();
	
});





/**
 * 挂号 选择医生
 */
app.controller('cardDepartmentRegisteredCtrl', function($scope,$interval,httpService,$stateParams) {
	
	//   当前页面返回秒数
	$scope.countdown_time = 60;
	
	$scope.items_loadding = false;
	
	//   当班挂号科室名称
	$scope.deptName = $stateParams.deptName;
	
	
	//  数据
	$scope.data = {
		//  all
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
	
	
	
	//   取医生
	var doctor = function(){
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/doctor/' + $stateParams.deptCode)
		.then(function(res){
			$scope.items_loadding = false;
			//
			if(res.succeed){
				if (res.data.item.__proto__.constructor == Array) {
					$scope.data.items = res.data.item;
				} else {
					$scope.data.items = [res.data.item];
				}
				for(var i in $scope.data.items){
					$scope.data.items[i].deptName = $scope.deptName;
				}
				$scope.data.page.total = $scope.data.items.length;
				//  分页
				$scope.data.page.pageFn(1);
				
				console.log($scope.data.items)
			}else{
				$scope.data.items = [];
				$scope.data.page.total = 0;
			}
		});
	}
	
	
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("cardDepartmentRegisteredCtrl");
	if(tm.Key!="cardDepartmentRegisteredCtrl"){
		tm.Key="cardDepartmentRegisteredCtrl";
		tm.keyctrl="app.card.department.registered";
		tm.fnAutoRefresh=function(){
			console.log("开始调用定时器");
			tm.interval = $interval(function() {
				if($scope.countdown_time > 0){
					$scope.countdown_time = $scope.countdown_time - 1;
				}else{
					$interval.cancel(tm.interval);
					tm.interval = null;
					//$scope.countdown_time = 20;
					//   返回上一级
					$scope.locationBk();
				}
			}, 1000);
		};
		tm.fnStopAutoRefresh=function(){
			$scope.countdown_time = 60;
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
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_016');
		//  取医生
		doctor();
	}
	run();
	
});




/**
 * 挂号  医生当班信息
 */
app.controller('cardDepartmentRegisteredDocinfoCtrl', function($scope,$interval,httpService,$stateParams) {
	
	//   当前页面返回秒数
	$scope.countdown_time = 60;
	
	$scope.items_loadding = false;
	
	//   转科名称
	$scope.deptName = $stateParams.deptName;
	$scope.doct_name = $stateParams.doct_name;
	
	//  数据
	$scope.data = {
				//  上午下午
		'am_pm':[
			{ val: '1', name: '上午', checked: true},
			{ val: '2', name: '下午', checked: true},
			{ val: '3', name: '白天', checked: true},
			{ val: '4', name: '夜晚', checked: true},
			{ val: '5', name: '24小时', checked: true}
		],
		//  all
		'all_items':[],
		//  当前
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


	//   筛选时段
	var seAmPm = function() {
		//
		$scope.items_loadding = false;
		//
		if (new Date().getHours() < 12){
			//  上午
		}else if(new Date().getHours() < 18){
			//   下午
			$scope.data.am_pm[0].checked = false;
		}else{
			//  其他时间
			$scope.data.am_pm[0].checked = false;
			$scope.data.am_pm[1].checked = false;
		}
		//
		$scope.data.items = [];
		for(var i in $scope.data.all_items) {
			for (var b in $scope.data.am_pm) {
				if ($scope.data.am_pm[b].checked && $scope.data.am_pm[b].val == $scope.data.all_items[i].am_pm){
					//
					$scope.data.items.push($scope.data.all_items[i]);
				}
			}
		}
		//  
		$scope.data.page.total = $scope.data.items.length;
		//  分页
		$scope.data.page.pageFn(1);
		
	}
	
	
	//   取医生当班信息
	var schedul = function(){
		$scope.items_loadding = true;
		//  
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/schedul/'+ $stateParams.doctorCode +'/' + $stateParams.deptCode)
		.then(function(res){
			//
			if(res.succeed){
				if(res.data.item.__proto__.constructor == Array){
					$scope.data.all_items = res.data.item;
				}else{
					$scope.data.all_items = [res.data.item];
				}
				//   加入 科名 医生名
				for (var i in $scope.data.all_items) {
					$scope.data.all_items[i].deptName = $scope.deptName;
					$scope.data.all_items[i].doct_name = $scope.doct_name;
					//   计算 金额
					$scope.data.all_items[i].sumMoney = +$scope.data.all_items[i].clinic_fee + +$scope.data.all_items[i].register_fee;
				}
				//  排序  按上午下午排序

				//   筛选时段
				seAmPm();
				
			}else{
				$scope.data.all_items = [];
				$scope.items_loadding = false;
			}
		});
	}
	
	
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("cardDepartmentRegisteredDocinfoCtrl");
	if(tm.Key!="cardDepartmentRegisteredDocinfoCtrl"){
		tm.Key="cardDepartmentRegisteredDocinfoCtrl";
		tm.keyctrl="app.card.department.registered.docinfo";
		tm.fnAutoRefresh=function(){
			console.log("开始调用定时器");
			tm.interval = $interval(function() {
				if($scope.countdown_time > 0){
					$scope.countdown_time = $scope.countdown_time - 1;
				}else{
					$interval.cancel(tm.interval);
					tm.interval = null;
					//$scope.countdown_time = 20;
					//   返回上一级
					$scope.locationBk();
				}
			}, 1000);
		};
		tm.fnStopAutoRefresh=function(){
			$scope.countdown_time = 60;
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
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_019');
		//  
		schedul();
	}
	run();
	
});






/**
 * 挂号 确认挂号
 */
app.controller('cardDepartmentRegisteredDocinfoDepCtrl', function ($scope, $interval, $timeout, $stateParams, $filter, httpService) {
	
	//   转科名称
	$scope.deptName = $stateParams.deptName;
	$scope.doct_name = $stateParams.doct_name;
	$scope.am_pm = $stateParams.am_pm;
	$scope.sumMoney = $stateParams.sumMoney;
	//  金额分
	$scope.sumMoney_minute = (+$stateParams.sumMoney).toFixed(2) * 100;

	$scope.schedulingID = $stateParams.schedulingID;
	
	$scope.clinic_time_start = $stateParams.clinic_time_start;
	$scope.clinic_time_end = $stateParams.clinic_time_end;
	
	
	
	//   状态  1, 确认挂号。2，系统正在处理。3，打印凭条。4，挂号成功
	$scope.status = 1;
	
	
	//   当前页面返回秒数
	$scope.countdown_time = 360;
	
	//
	$scope.form_data = {
		//  支付流水号
		paymentIndex:'',
		//  支付类型  7 长沙银行自助机，  6 长沙银行E钱庄
		paymentType:'7',
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
	var bankRecharge = function (money) {
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
	terminal_device.build_card.cb_money = function (res_Status, res_obj) {
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
		if (res_Status == 0) {
			// alert('银行充值成功');
			//   充值成功
			$scope.$apply();

			//  挂号确认
			registConfirm();
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
				default: $scope.systemError('交易错误');
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
	$scope.bankCorrect = function (trace_no, money) {
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
	terminal_device.build_card.cb_money_filling = function (res_Status, res_obj) {
		// log
		window.terminal && window.terminal.WriteLog('硬件回调： cardDepartmentRegisteredDocinfoDepCtrl terminal_device.build_card.cb_money_filling: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//
		$scope.bankCorrectStatus = res_Status;
		$scope.bankCorrectObj = res_obj;
		//
		if (res_Status == 0) {
			//   充正成功
			//  alert('充正成功');
			$scope.systemError('挂号失败请重新挂号');

			//  返回选择医生
			$scope.locationBk('app.card.department.registered');


		} else {
			//   充正失败
			//  alert('充正失败');
			$scope.systemError('支付成功：挂号失败请与工作人员联系');
			//   打印支付成功挂号失败凭条
			//   取打印模板
			$scope.statusFn2();

			//   打印完成再返回 选择医生
			//  返回选择医生
			$scope.locationBk('app.card.department.registered');
		}
	}

	/**
	 * 银行卡退卡
	 * @return void
	 */
	$scope.bankOutCard = $scope.bankOutCard;


	//  =====================  /银行处理  =========================
	
	
	
	
	//  ==============================================
	
	
	//   提交  挂号确认
	var registConfirm = function(){
		//   加入流水号
		$scope.form_data.paymentIndex = $scope.bankRechargeObj.Trace_no;
		//  支付成功提交挂号确认
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/registConfirm', $scope.form_data)
		.then(function(res){
			if(res.succeed){
				//   成功
				//  alert('挂号成功')
				//   取打印模板
				$scope.statusFn2();
			}else{
				//  失败
				checkGhPay($scope.bankRechargeObj.Trace_no, res.message);
			}
		});
	}


	//  当班挂号结果查询
	var checkGhPay = function (paymentIndex, message) {
		//  
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/checkGhPay/' + paymentIndex)
			.then(function (res) {
				if (res.succeed) {
					//   查询成功
					// alert('查询成功')
					//   取打印模板
					$scope.statusFn2();
				} else {
					//  失败
					//  alert('查询失败');
					//  银行充正
					$scope.bankCorrect(paymentIndex, $scope.sumMoney_minute);

					//  alert('查询失败' + JSON.stringify(res));
					//  提示预约失败请重新预约
					$scope.systemError('挂号失败：' + message);
				}
			});
	}
	
	
	//  当班挂号结果查询
//	var checkGhPay = function (paymentIndex) {
//		//  
//		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/printLog' + paymentIndex)
//			.then(function (res) {
//				if (res.succeed) {
//					//   查询成功
//					alert('查询成功')
//					//   取打印模板
//					$scope.statusFn2();
//				} else {
//					//  失败
//					alert('查询失败');
//					//  银行充正
//					$scope.bankCorrect(paymentIndex, $scope.sumMoney_minute);
//
//					alert('查询失败' + JSON.stringify(res));
//				}
//			});
//	}
	


	
	//  ===============================================
	
	//   点击确定 
	$scope.statusOk = function(){
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_020');
		$scope.status = 11;
	}
	
	//  1 确认
	$scope.statusFn1 = function(){
		//   银行支付
		bankRecharge($scope.sumMoney_minute);
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_021');
		//
		$scope.status = 2;

	}
	
	//  取打印凭条返回
	$scope.res_zzghPrint = null;
	//  系统正在处理中
	//  0 失败凭条   1 成功凭条
	$scope.statusFn2 = function(){
		//
		$scope.status = 3;

		//   取打印模板
		// var ampm = '';
		// if ($scope.am_pm == 1){
		// 	ampm = 'a';
		// } else if ($scope.am_pm == 2){
		// 	ampm = 'b';
		// }
		//
		var temp_obj = {
			cardNo: $scope.app.user_info.card_no,
			patName: $scope.app.user_info.PatName,
			depName: $scope.deptName,
			doctName: $scope.doct_name,
			pbxh: $scope.schedulingID,
			visitDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
			amPm: $scope.am_pm,
			patientID: $scope.app.user_info.PatientID,
			times: $filter('date')(new Date(), 'yyyy-MM-dd'),
			amount: $scope.sumMoney,
			checkTime: $scope.clinic_time_start + '-' + $scope.clinic_time_end,
			yhCardNo: $scope.bankRechargeObj.Pan,
			prescRecordID: '',
			type: '1'
		}
		// log
		window.terminal && window.terminal.WriteLog('rq /api/yytMace/v1/zzghPrint:' + JSON.stringify(temp_obj));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/zzghPrint', temp_obj)
			.then(function (res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytMace/v1/zzghPrint:' + JSON.stringify(res));
				//
				if (res.succeed) {
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
	var printLog = function(){
		//  alert('取预约单详情')
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/printLog',{
			lid: $scope.res_zzghPrint.lid,
			type: $scope.bankCorrectStatus == 0 ? 1 : 0
		})
		.then(function(res){
			// log
			window.terminal && window.terminal.WriteLog('res 预约挂号 /api/yytMace/v1/printLog:' + JSON.stringify(res));
		});
	}
	


	//   打印完成回调
	terminal_device.print_receipt.cb_print_receipt = function (res_Status, res_str) {
		// alert('打印完成回调')
		if (res_Status == '0') {
			//  正常打印  设置
			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('1');
			//  5秒关闭
			$timeout(function () { window.terminal && window.terminal.JSCloseTwinkleLED('1'); }, 5000);
			//
			printLog();
			//
			$scope.statusFn3();
			//   
		} else if (res_Status == '99'){
			//   打开打印错误弹窗
			$scope.modelOpenPrintError(res_str);
		} else {
			//  打印异常
			// alert('打印异常');
			//  提交失败
			$scope.systemError('打印失败请与工作人员联系');
		}
	}
	
	
	//  正在打印凭条
	$scope.statusFn3 = function(){
		//   打印条码
		$scope.status = 4;
		
		//  退卡
		$scope.bankOutCard();
		//  灯光提示
		window.terminal && window.terminal.JSOpenTwinkleLED('4');
		//  秒关闭
		$timeout(function () { window.terminal && window.terminal.JSCloseTwinkleLED('4'); }, 3000);
		//
		//   停止语音
		$scope.audio_list.allStop();
		//
		$scope.audio_list.play('audio_013');
		//   播放声音
		$timeout(function(){$scope.audio_list.play('audio_017');}, 3000);
		
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 3;
		tm.fnAutoRefreshfn(tm);
		//
		$timeout(function () { $scope.locationBk('app.index'); }, 3000);
		
	}
	
	
	
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("cardDepartmentRegisteredDocinfoDepCtrl");
	if(tm.Key!="cardDepartmentRegisteredDocinfoDepCtrl"){
		tm.Key="cardDepartmentRegisteredDocinfoDepCtrl";
		tm.keyctrl="app.card.department.registered.docinfo.dep";
		tm.fnAutoRefresh=function(){
			console.log("开始调用定时器");
			tm.interval = $interval(function() {
				if($scope.countdown_time > 0){
					$scope.countdown_time = $scope.countdown_time - 1;
				}else{
					$interval.cancel(tm.interval);
					tm.interval = null;
					//$scope.countdown_time = 20;
					//   返回上一级
					$scope.locationBk();
				}
			}, 1000);
		};
		tm.fnStopAutoRefresh=function(){
			$scope.countdown_time = 60;
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
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_006');
	}
	run();
	
	
});