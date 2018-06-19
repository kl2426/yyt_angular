/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:36:07 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-21 11:31:58
 */
'use strict';

/**
 * 缴费 - 支付
 */
app.controller('rechargePaymentPayCtrl', function($scope, $interval, $timeout) {

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
app.controller('rechargeRechargeMoneyCtrl', function($scope, $interval, $timeout) {

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
app.controller('rechargeRechargeCardCtrl', function($scope, $interval, $modal, $timeout) {

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
app.controller('rechargeRechargeWeixinCtrl', function($scope, $interval, $modal, $timeout) {

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