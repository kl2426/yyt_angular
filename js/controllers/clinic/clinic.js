'use strict';

/**
 * 门诊缴费 - 列表控制器
 */
app.controller('clinicCtrl', function($scope,$interval,httpService,$filter,$timeout,globalFn) {
	
	//   当前页面返回秒数
	$scope.countdown_time = 60;
	
	//   状态1  列表   2 选择支付方式
	$scope.status = 1;
	
	//
	$scope.items_loadding = false;
	
	//  数据
	$scope.data = {
		//  处方数据是否是同一个处方
		clinic_has_one: true,
		//  处方总金额  单位元
		clinic_sum: 0,
		//
		'items':[],
		//   对items 数据进行分页
		'page':{
			pageIndex:1,
			pageSize:8,
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
	
	
	//   获取门诊处方（当班挂号）
	var patientPres = function(form, cb){
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/patientPres', form)
		.then(function(res){
			if(res.succeed){
				if(res.data.item.__proto__.constructor == Array){
					res.data.item = res.data.item;
				}else{
					res.data.item = [res.data.item];
				}
				//   加入 registegOrderID
				for(var i in res.data.item){
					res.data.item[i].registegOrderID = form.registegOrderID;
				}
				typeof cb == "function" && cb(res.data.item);
			}else{
				typeof cb == "function" && cb([]);
			}
		});
	}
	
	
	
	//   我的门诊挂号记录
	var patientRecord = function(outPatientID,startDate,endDate){
		//
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/patientRecord/' + outPatientID + '/' + startDate + '/'+ endDate)
		.then(function(res){
			//
			if(res.succeed){
				if(res.data.item.__proto__.constructor == Array){
					res.data.item = res.data.item;
				}else{
					res.data.item = [res.data.item];
				}
				//  计数
				var index = res.data.item.length;
				//   
				for(var i in res.data.item){
					var temp_date = new Date(res.data.item[i].ExamDT.substr(0,10));
					
					//
					var temp_obj = {
						registegOrderID: res.data.item[i].RegistegOrderID,
						cardNo:$scope.app.user_info.card_no,
						outPatientID:$scope.app.user_info.PatientID,
						startDT: $filter('date')(temp_date.setDate(temp_date.getDate() - 0), 'yyyy-MM-dd'),
						endDT:$filter('date')((new Date()), 'yyyy-MM-dd'),
					}
					//   获取门诊处方（当班挂号）
					patientPres(temp_obj, function(data){
						index = index - 1;
						for(var b in  data){
							$scope.data.items.push(data[b]);
						}
						//  最后一个
						if(index <= 0){
							//
							$scope.items_loadding = false;
							//  加入序号   计算总金额
							for(var c in $scope.data.items){
								$scope.data.items[c].index = +c + 1;
								$scope.data.clinic_sum = globalFn.numberSumFloat($scope.data.clinic_sum, $scope.data.items[c].TotalFee, 2);
							}
							//  取处方明细
							for(var e in $scope.data.items){
								prescriptionInfo($scope.data.items[e].PrescriptionID, $scope.data.items[e]);
							}
							//   验证是否是同一个挂号记录  用于是否显示可一次性打印按钮   如果多个挂号记录不能一次性打印
							var temp_item_registegOrderID = '';
							for(var d in $scope.data.items){
								if(d == 0){
									temp_item_registegOrderID = $scope.data.items[d].registegOrderID;
								}else{
									if(temp_item_registegOrderID != $scope.data.items[d].registegOrderID){
										$scope.data.clinic_has_one = false;
									}
								}
							}
							//
							console.log($scope.data.items)
							$scope.data.page.total = $scope.data.items.length;
							//  分页
							$scope.data.page.pageFn(1);
						}
					})
				}
			}else{
				//   
				$scope.items_loadding = false;
			}
		});
	}
	
	
	
	//   处方明细
	var prescriptionInfo = function(PrescriptionID, item){
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/prescriptionInfo',{PrescriptionID:PrescriptionID})
		.then(function(res){
			if(res.succeed){
				if(res.data.item.__proto__.constructor == Array){
					res.data.item = res.data.item;
				}else{
					res.data.item = [res.data.item];
				}
				item.res_PrescriptionID = res.data.item;
			}else{
				item.res_PrescriptionID = [];
			}
		});
	}
	
	
	
	
	//   点击缴费
	$scope.statusOk = function(){
		$scope.status = 2;
		console.log($scope.data)
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_020');
	}
	
	
	//   缴费
	$scope.Payment = function(){
		//  银行缴费
		//  console.log($scope.data.res_item)
		//  处方缴费前验证
		prescChargeBefore();
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_021');
		//
		//   打印凭条
		//scope.statusFn1();
		
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
		//alert('银行充值:' + money)
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
		//alert('银行充值回调');
		if (res_Status == 0) {
			//alert('银行充值成功');
			//   充值成功
			$scope.$apply();

			//  处方缴费
			prescCharge();
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
			$scope.systemError('处方缴费失败，请重新缴费');

			//  返回选择医生
			$scope.locationBk();


		} else {
			//   充正失败
			//alert('充正失败');
			$scope.systemError('支付成功：处方缴费失败请与工作人员联系');
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
	
	
	//  处方缴费前验证
	var prescChargeBefore = function(){
		//  合并处方号
		var temp_prescRecordID = [];
		for(var i in $scope.data.items){
			temp_prescRecordID.push($scope.data.items[i].PrescriptionID);
		}
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/prescChargeBefore', {
			prescRecordID: temp_prescRecordID.join('-'),
			paymentType: '7',
			paymentCharge: $scope.data.clinic_sum,
		})
		.then(function(res){
			if(res.succeed){
				//  成功
				//alert('处方缴费前验证 - 成功');
				//   银行充值
				bankRecharge((+$scope.data.clinic_sum).toFixed(2) * 100);
			}else{
				//  失败
				//alert('处方缴费前验证 - 失败')
				$scope.systemError('处方缴费验证失败');
				$scope.locationBk();
			}
		});
	}
	
	
	//  处方缴费返回
	$scope.res_prescCharge = {};
	//  处方缴费
	var prescCharge = function(){
		//alert('处方缴费开始')
		//  合并处方号
		var temp_prescRecordID = [];
		for(var i in $scope.data.items){
			temp_prescRecordID.push($scope.data.items[i].PrescriptionID);
		}
		//
		var temp_obj = {
			prescRecordID: temp_prescRecordID.length > 0 ? temp_prescRecordID.join('-') : '',
			registerID: $scope.data.items[0].registegOrderID,
			paymentIndex: $scope.bankRechargeObj.Trace_no,
			paymentType: '7',
			paymentCharge: $scope.data.clinic_sum,
			paymentAccount: '',
		}
		//  log
		window.terminal && window.terminal.WriteLog('rq 处方缴费 /api/yytBase/v1/prescCharge:' + JSON.stringify(temp_obj));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/prescCharge', temp_obj)
		.then(function(res){
			//  log
			window.terminal && window.terminal.WriteLog('rq 处方缴费 /api/yytBase/v1/prescCharge:' + JSON.stringify(res));
			//
			if(res.succeed){
				//  成功
				//alert('处方缴费 - 成功')
				//  打印凭条
				$scope.res_prescCharge = res.data;
				//   打印凭条
				$scope.statusFn1();
			}else{
				$scope.res_prescCharge = {};
				//  银行充正
				$scope.bankCorrect($scope.bankRechargeObj.Trace_no, (+$scope.data.clinic_sum).toFixed(2) * 100);
				//  失败
				//alert('处方缴费 - 失败')
				$scope.systemError('处方缴费失败请与维护人员联系');
				$scope.locationBk();
			}
		});
	}
	
	//   缴费凭条返回
	$scope.res_jfPrint = null;
	//   查询打印凭条
	var jfPrint = function(temp_obj){
		//alert('取缴费凭条')
		//  log
		window.terminal && window.terminal.WriteLog('rq 缴费打印 /api/yytMace/v1/jfPrint:' + JSON.stringify(temp_obj));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/jfPrint', temp_obj)
			.then(function (res) {
				//  log
				window.terminal && window.terminal.WriteLog('res 缴费打印 /api/yytMace/v1/jfPrint:' + JSON.stringify(res));
				//
				if (res.succeed) {
					//alert('开始打印');
					//   
					//    开始打印
					window.terminal && window.terminal.PrintReceipt($scope.printStringEndFn(res.data.print, $scope.bankCorrectStatus), '', '');
					//
					$scope.res_jfPrint = res.data;
				} else {
					//  提交失败
					$scope.systemError('打印失败请与维护人员联系');

					//  返回选择医生
					$scope.locationBk('app.card.department.registered');
				}
			});
	}
	
	
	//   凭条打印计算
	$scope.jfPrint_number = 1;
	
	//   缴费成功 打印凭条
	$scope.statusFn1 = function () {
		//
		//alert('缴费成功 打印凭条');
		//   打印凭条
		var temp_obj = {
			cardNo: $scope.app.user_info.card_no,
			patName: $scope.app.user_info.PatName,
			patientID: $scope.app.user_info.PatientID,
			yHCardNo: $scope.bankRechargeObj.Pan,
			fPFlow: $scope.res_prescCharge.receiptSn,
			success: ($scope.bankCorrectStatus == 0 || $scope.bankCorrectStatus == undefined) ? '成功' : '',
			execDeptName: '',
			paymentCharge: '',
			prescRecordID: '',
			visitDate: '',
			detailed: '',
			num: ''
		}
		//  
		var temp_bol = true;
		//   查找未打印记录
		var temp_item = null;
		for(var i in $scope.data.items){
			if($scope.data.items[i].print_ok){
				//  已打印
				//alert('已打印')
			}else{
				//alert('未打印')
				//  未打印
				temp_bol = false;
				//  执行科室
				temp_obj.execDeptName = $scope.data.items[i].ExecDeptName;
				//  支付金额
				temp_obj.paymentCharge = $scope.data.items[i].TotalFee;
				//  处方记录ID
				temp_obj.prescRecordID = $scope.data.items[i].PrescriptionID;
				//  看诊时间
				temp_obj.visitDate = $scope.data.items[i].PresDT;
				//  加入药品明细
				temp_obj.detailed = JSON.stringify($scope.data.items[i].res_PrescriptionID);
				//  加入凭条打印次数
				temp_obj.num = $scope.jfPrint_number;
				//  调用打印凭条接口
				jfPrint(temp_obj);
				//  计算 加1
				$scope.jfPrint_number = $scope.jfPrint_number + 1;
				//  设置为已打印
				$scope.data.items[i].print_ok = true;
				//  退出循环
				break;
			}
		}
		//  是否都打印过了
		if(temp_bol == true){
			//   都打印过了
			$scope.statusFn2();
		}
		
	}
	
	
	
	//   凭条打印更新 打印结果上传
	var printLog = function(){
		//  alert('取预约单详情')
		// log
		window.terminal && window.terminal.WriteLog('res 门诊缴费 /api/yytMace/v1/printLog:' + JSON.stringify({lid: $scope.res_jfPrint.lid}));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/printLog',{
			lid: $scope.res_jfPrint.lid,
			type: $scope.bankCorrectStatus == 0 ? 1 : 0
		})
		.then(function(res){
			// log
			window.terminal && window.terminal.WriteLog('res 门诊缴费 /api/yytMace/v1/printLog:' + JSON.stringify(res));
		});
	}



	//   打印完成回调
	terminal_device.print_receipt.cb_print_receipt = function (res_Status, res_str) {
		//alert('打印完成回调')
		if (res_Status == '0') {
			//  正常打印  设置
			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('1');
			//  5秒关闭
			$timeout(function () { window.terminal && window.terminal.JSCloseTwinkleLED('1'); }, 5000);

			//  继续打印 下一条
			$scope.statusFn1();
			//  调用凭条打印更新
			printLog();
			
			
		} else if (res_Status == '99') {
			//   打开打印错误弹窗
			$scope.modelOpenPrintError(res_str);
		} else {
			//  打印异常
			//alert('打印异常');
			//  提交失败
			$scope.systemError('打印失败请与维护人员联系');
		}
	}
	
	
	//    完成打印 
	$scope.statusFn2 = function () {
		//   返回上一级银行卡自动退卡
		$scope.locationBk();
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音取走凭条
		$scope.audio_list.play('audio_009');
		
		//  灯光提示
		window.terminal && window.terminal.JSOpenTwinkleLED('1');
		//  5秒关闭
		$timeout(function () { window.terminal && window.terminal.JSCloseTwinkleLED('1'); }, 5000);
		
		//  退卡
		$scope.bankOutCard();
		//  灯光提示
		window.terminal && window.terminal.JSOpenTwinkleLED('4');
		//  秒关闭
		$timeout(function () { window.terminal && window.terminal.JSCloseTwinkleLED('4'); }, 3000);
		
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 5;
		tm.fnAutoRefreshfn(tm);

	}
	
	
	
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("clinicCtrl");
	if(tm.Key!="clinicCtrl"){
		tm.Key="clinicCtrl";
		tm.keyctrl="app.clinic";
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
		$scope.audio_list.play('audio_029');
		//
		var new_date = new Date();
		var date_begin = $filter('date')(new_date.setDate(new_date.getDate() - 30), 'yyyy-MM-dd');
		var date_end = $filter('date')(new Date(), 'yyyy-MM-dd');
		//   我的门诊记录
		patientRecord($scope.app.user_info.PatientID, date_begin, date_end);
		// patientRecord($scope.app.user_info.PatientID, '2018-01-01', '2018-01-19');
	}
	run();
	
});








/**
 * 挂号记录 - 就诊详情
 */
app.controller('clinicInfoCtrl', function($scope,$interval,httpService,$filter,$stateParams,$timeout) {
	
	//   当前页面返回秒数
	$scope.countdown_time = 360;
	
	//
	$scope.items_loadding = false;
	
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
		'form':{
			registegOrderID: $scope.registegOrderID,
			cardNo:$scope.app.user_info.card_no,
			outPatientID:$scope.app.user_info.PatientID,
			startDT:$scope.PresDT.substr(0,10),
			endDT:$filter('date')((new Date()), 'yyyy-MM-dd'),
		},
		//   处方详情
		'res_item':{},
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
	
	
	//   获取门诊处方（当班挂号）
	var patientPres = function(){
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/patientPres',$scope.data.form)
		.then(function(res){
			if(res.succeed){
				if(res.data.item.__proto__.constructor == Array){
					res.data.item = res.data.item;
				}else{
					res.data.item = [res.data.item];
				}
				//   找当前处方
				for(var i in res.data.item){
					if(res.data.item[i].PrescriptionID == $scope.PrescriptionID){
						$scope.data.res_item = res.data.item[i];
						//   金额转分
						$scope.data.res_item.TotalFee_minute = $scope.data.res_item.TotalFee ? (+$scope.data.res_item.TotalFee).toFixed(2) * 100 : 0;
						break;
					}
				}
			}else{
				$scope.data.res_item = {};
			}
		});
	}
	
	
	//   处方明细
	var prescriptionInfo = function(PrescriptionID){
		//
		$scope.items_loadding = true;
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/prescriptionInfo',{PrescriptionID:PrescriptionID})
		.then(function(res){
			//
			$scope.items_loadding = false;
			//
			if(res.succeed){
				if(res.data.item.__proto__.constructor == Array){
					$scope.data.items = res.data.item;
				}else{
					$scope.data.items = [res.data.item];
				}
				//   加入序号
				for(var i in $scope.data.items){
					$scope.data.items[i].index = +i + 1;
				}
				$scope.data.page.total = $scope.data.items.length;
				console.log($scope.data.page)
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
		// money = '1';
		// log
		window.terminal && window.terminal.WriteLog('硬件调用： clinicInfoCtrl window.terminal.OpenBankModel: money：' + JSON.stringify(money));
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
		window.terminal && window.terminal.WriteLog('硬件回调： clinicInfoCtrl terminal_device.build_card.cb_money: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//
		$scope.bankRechargeStatus = res_Status;
		$scope.bankRechargeObj = res_obj;
		//  
		//alert('银行充值回调');
		if (res_Status == 0) {
			//alert('银行充值成功');
			//   充值成功
			$scope.$apply();

			//  处方缴费
			prescCharge();
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
		window.terminal && window.terminal.WriteLog('硬件调用： clinicInfoCtrl window.terminal.CorrectBankModel: trace_no' + JSON.stringify(trace_no) + ' money：' + JSON.stringify(money));
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
		window.terminal && window.terminal.WriteLog('硬件回调： clinicInfoCtrl terminal_device.build_card.cb_money_filling: res_Status：' + JSON.stringify(res_Status) + 'res_obj：' + JSON.stringify(res_obj));
		//
		$scope.bankCorrectStatus = res_Status;
		$scope.bankCorrectObj = res_obj;
		//
		if (res_Status == 0) {
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
	
	
	//  处方缴费前验证
	var prescChargeBefore = function(){
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/prescChargeBefore', {
			prescRecordID: $scope.PrescriptionID,
			paymentType: '7',
			paymentCharge: $scope.data.res_item.TotalFee,
		})
		.then(function(res){
			if(res.succeed){
				//  成功
				//alert('处方缴费前验证 - 成功');
				//   银行充值
				bankRecharge($scope.data.res_item.TotalFee_minute.toString());
			}else{
				//  失败
				//alert('处方缴费前验证 - 失败')
				$scope.systemError('处方缴费验证失败');
				$scope.locationBk();
			}
		});
	}
	
	
	//  处方缴费返回
	$scope.res_prescCharge = {};
	//  处方缴费
	var prescCharge = function(){
		httpService.ajaxPost(httpService.API.href + '/api/yytBase/v1/prescCharge', {
			prescRecordID: $scope.PrescriptionID,
			registerID: $scope.registegOrderID,
			paymentIndex: $scope.bankRechargeObj.Trace_no,
			paymentType: '7',
			paymentCharge: $scope.data.res_item.TotalFee,
			paymentAccount: '',
		})
		.then(function(res){
			if(res.succeed){
				//  成功
				//alert('处方缴费 - 成功')
				//  打印凭条
				$scope.res_prescCharge = res.data;
				//   打印凭条
				$scope.statusFn1();
			}else{
				$scope.res_prescCharge = {};
				//  银行充正
				$scope.bankCorrect($scope.bankRechargeObj.Trace_no, $scope.data.res_item.TotalFee_minute);
				//  失败
				//alert('处方缴费 - 失败')
				$scope.systemError('处方缴费失败请与维护人员联系');
				$scope.locationBk();
			}
		});
	}
	
	
	
	
	
	//   点击缴费
	$scope.statusOk = function(){
		$scope.status = 2;
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_020');
	}
	
	
	
	
	//   缴费
	$scope.Payment = function(){
		//  银行缴费
		//  console.log($scope.data.res_item)
		//  处方缴费前验证
		prescChargeBefore();
		
	}
	

	
	//   凭条打印更新 打印结果上传
	var printLog = function(){
		//  alert('取预约单详情')
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/printLog',{
			lid: $scope.res_jfPrint.lid,
			type: $scope.bankCorrectStatus == 0 ? 1 : 0
		})
		.then(function(res){
			// log
			window.terminal && window.terminal.WriteLog('res 门诊缴费 /api/yytMace/v1/printLog:' + JSON.stringify(res));
		});
	}



	//   打印完成回调
	terminal_device.print_receipt.cb_print_receipt = function (res_Status, res_str) {
		//alert('打印完成回调')
		if (res_Status == '0') {
			//  正常打印  设置
			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('1');
			//  5秒关闭
			$timeout(function () { window.terminal && window.terminal.JSCloseTwinkleLED('1'); }, 5000);

			$scope.statusFn2();
			//  调用凭条打印更新
			printLog();
			
			
		} else if (res_Status == '99') {
			//   打开打印错误弹窗
			$scope.modelOpenPrintError(res_str);
		} else {
			//  打印异常
			//alert('打印异常');
			//  提交失败
			$scope.systemError('打印失败请与维护人员联系');
		}
	}

	

	//   缴费凭条返回
	$scope.res_jfPrint = null;
	//   缴费成功 打印凭条
	$scope.statusFn1 = function () {
		//alert('缴费成功 打印凭条');
		//   打印凭条
		var temp_obj = {
			cardNo: $scope.app.user_info.card_no,
			patName: $scope.app.user_info.PatName,
			patientID: $scope.app.user_info.PatientID,
			yHCardNo: $scope.bankRechargeObj.Pan,
			fPFlow: $scope.res_prescCharge.receiptSn,
			success: '成功',
			execDeptName: $scope.ExecDeptName,
			paymentCharge: $scope.data.res_item.TotalFee,
			prescRecordID: $scope.PrescriptionID,
			visitDate: $scope.PresDT,
			detailed: JSON.stringify($scope.data.items),
			num: '1'
		}
		//  log
		window.terminal && window.terminal.WriteLog('rq  /api/yytMace/v1/jfPrint:' + JSON.stringify(temp_obj));
		
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/jfPrint', temp_obj)
			.then(function (res) {
				//  log
				window.terminal && window.terminal.WriteLog('res /api/yytMace/v1/jfPrint:' + JSON.stringify(res));
				//
				if (res.succeed) {
					//   
					//    开始打印
					window.terminal && window.terminal.PrintReceipt($scope.printStringEndFn(res.data.print, $scope.bankCorrectStatus), '', '');
					//
					$scope.res_jfPrint = res.data;
				} else {
					//  提交失败
					$scope.systemError('打印失败请与维护人员联系');

					//  返回选择医生
					$scope.locationBk('app.card.department.registered');
				}
			});
	}


//	//   缴费成功 打印凭条
//	$scope.statusFn1 = function () {
//		alert('缴费成功 打印凭条');
//		var temp_template = '';
//		for(var i in $scope.data.items){
//			temp_template = temp_template + $scope.data.items[i].MedicineName + '   单价：' + $scope.data.items[i].MedicineUnitCharge + '  数量：' + $scope.data.items[i].MedicineNum + '\n';
//		}
//		//  打印凭条
//		var printTemplate =
//			'                  株洲市中心医院\n\n'
//			+ '-----------------自助缴费凭条------------------\n\n'
//			+ '流 水 号：' + $scope.res_prescCharge.HisPayNo + '\n'
//			+ '打印日期：' + $filter('date')(new Date(), 'yyyy-MM-dd') + '\n'
//			+ '姓    名：' + $scope.app.user_info.PatName + '\n'
//			+ '诊疗卡号：' + $scope.app.user_info.card_no + '\n'
//			+ '病人ID号：' + $scope.app.user_info.PatientID + '\n'
//			+ '银行卡号：' + $scope.bankRechargeObj.Pan + '\n'
//			+ '发票流水号：32312337\n'
//			+ '交易结果：成功  机器号：' + $scope.app.device_info.user.name + '\n'
//			+ '执行科室：门诊注射室\n\n'
//			+ '**************************\n\n'
//			// + '静脉采血   单价：3.0  数量：2.0\n'
//			// + '真空采血管（进口）2.20元   单价：2.2  数量：3.0\n'
//			// + '一次性尿杯   单价：0.03  数量：1.0\n\n'
//			+ temp_template
//			+ '**************************\n\n'
//			+ '明细合计(元)：' + $scope.data.res_item.TotalFee + '\n\n'
//			+ '---------------------------------------------\n\n'
//			+ '温馨提示：\n'
//			+ '凭条是您的缴费/退费的凭证，请妥善保管\n\n'
//			;
//
//		//    开始打印
//		window.terminal && window.terminal.PrintReceipt(printTemplate, '', '');
//
//	}

	//    完成打印 
	$scope.statusFn2 = function () {
		//   返回上一级银行卡自动退卡
		 $scope.locationBk();
		 //   停止语音
		$scope.audio_list.allStop();
		//   播放声音取走凭条
		$scope.audio_list.play('audio_009');
		
		//  退卡
		$scope.bankOutCard();
		//  灯光提示
		window.terminal && window.terminal.JSOpenTwinkleLED('4');
		//  秒关闭
		$timeout(function () { window.terminal && window.terminal.JSCloseTwinkleLED('4'); }, 3000);
		
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 5;
		tm.fnAutoRefreshfn(tm);

	}




	
	
	
	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("clinicInfoCtrl");
	if (tm.Key !="clinicInfoCtrl"){
		tm.Key ="clinicInfoCtrl";
		tm.keyctrl="app.clinic.info";
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
		$scope.audio_list.play('audio_022');
		//   就诊详情
		prescriptionInfo($scope.PrescriptionID);
		//   
		patientPres();
	}
	run();
	
});






