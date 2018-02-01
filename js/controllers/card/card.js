'use strict';

/**
 * 建卡/挂号
 */
app.controller('cardCtrl', function($scope,$interval) {
	
	//   当前页面返回秒数
	$scope.countdown_time = 20;
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("card");
	if(tm.Key!="card"){
		tm.Key="card";
		tm.keyctrl="app.card";
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
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_001');
	}
	run();
	
	
});



/**
 * 身份证建卡
 */
app.controller('cardIdCtrl', function($scope,$interval,$timeout,$filter) {
	
	//   状态  1, 放身份证。2，输入手机号码。3、放钞，结束放钞。4,系统正在处理。5，正在打印凭条，出卡
	//  6,建卡成功
	$scope.status = 2;
	
	
	//   当前页面返回秒数
	$scope.countdown_time = 60;
	//   form
	$scope.form_data = {
		//   姓名
		PeopleName:'',
		title_PeopleName:'',
		//   身份号码
		PeopleIDCode:'',
		title_PeopleIDCode:'',
		//   发证机关
		PeopleNation:'',
		//   开始日期
		StartDate:'',
		//   结束日期
		EndDate:'',
		//   出生日期
		PeopleBirthday:'',
		//   地址
		PeopleAddress:'',
		//   民族
		Department:'',
		//   性别
		PeopleSex:'',
		//   文件路径
		zpbmppath:'',
		//   base64
		zpbmpbase64:'',
		//   安全模块号
		SAMID:'',
		//   手机号码
		mobile:''
	}
	
	//  注册成功用户数据
	$scope.user_data = {
		'name':'刘向前'
	}
	
	//  入钞
	$scope.money = 0;
	
	
	//   监听  name 隐藏名字后几位
	$scope.$watch('form_data.PeopleName', function(newValue, oldValue, scope) {
		if(newValue){
			$scope.form_data.title_PeopleName = newValue.substr(0,1) + '**';
		}
	});
	
	//   监听  id 身份证 隐藏中间几位
	$scope.$watch('form_data.PeopleIDCode', function(newValue, oldValue, scope) {
		if(newValue){
			$scope.form_data.title_PeopleIDCode = newValue.substr(0,6) + '********' + newValue.substr(14);
		}
	});
	
	
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("cardId");
	if(tm.Key!="cardId"){
		tm.Key="cardId";
		tm.keyctrl="app.card.id";
		tm.fnAutoRefresh=function(){
			console.log("开始调用定时器");
			tm.interval = $interval(function() {
				if($scope.countdown_time > 0){
					$scope.countdown_time = $scope.countdown_time - 1;
				}else{
					$interval.cancel(tm.interval);
					tm.interval = null;
					//   关闭入钞口
					if($scope.status == 3){
						window.terminal && window.terminal.JSCloseCashFun('terminal_device.build_card.cb_money_close');
					}
					//   返回上一级
					$scope.locationBk();
				}
			}, 1000);
		};
		tm.fnStopAutoRefresh=function(){
			$scope.countdown_time = 10;
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
			if($scope.form_data.mobile.length > 0){
				$scope.form_data.mobile = $scope.form_data.mobile.substr(0,$scope.form_data.mobile.length - 1);
			}
		}else if(str == 'delete'){
			$scope.form_data.mobile = "";
		}else if(/[0-9]/.test(str)){
			if($scope.form_data.mobile.length < 11){
				$scope.form_data.mobile = $scope.form_data.mobile + str.toString();
			}
		}
	}
	
	
	//  回调
	terminal_device.build_card.cb_id = function(obj){
		//if(obj)alert(JSON.stringify(obj));
		//if(obj)alert(JSON.stringify(obj.MsgCode));
		//
		if(obj && obj.MsgCode == '1000'){
			angular.extend($scope.form_data, obj.MsgStr);
			$scope.$apply();
			
			//
			tm.fnStopAutoRefreshfn(tm);
			$scope.countdown_time = 60;
			tm.fnAutoRefreshfn(tm);
			$scope.status = 2;
		}
		
	}
	
	//  回调 放钞
	terminal_device.build_card.cb_money = function(obj){
		//
		if(obj && obj.MsgCode == '1000'){
			//if(obj)alert(JSON.stringify(obj));
			//if(obj)alert(JSON.stringify(obj.MsgStr));
			
			$scope.money = $scope.money + +obj.MsgStr;
			$scope.$apply();
			//   提交用户充值记录
			
		}
		
	}
	
	//  回调 关闭放钞
	terminal_device.build_card.cb_money_close = function(obj){
		
		//if(obj)alert(JSON.stringify(obj.MsgCode));
		
		//
		if(obj && obj.MsgCode == '1000'){
			//if(obj)alert(JSON.stringify(obj));
			//if(obj)alert(JSON.stringify(obj.MsgStr));
			
			//$scope.money = $scope.money + +obj.MsgStr;
			//$scope.$apply();
			//   提交用户充值记录
			
		}
		
	}
	
	
	//   确认信息
	$scope.ok = function(){
		
		
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 120;
		tm.fnAutoRefreshfn(tm);
		$scope.status = 3;
		//   播放声音
		$scope.audio_list.allStop();
		$scope.audio_list.play('audio_007');
		//  放钞
		window.terminal && window.terminal.JSOpenCashFun('terminal_device.build_card.cb_money');
	}
	
	//   结束放钞
	$scope.end = function(){
		//  关闭放钞
		window.terminal && window.terminal.JSCloseCashFun('terminal_device.build_card.cb_money_close');
		
		
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 60;
		$scope.status = 4;
		
		
		//   播放声音
		$scope.audio_list.allStop();
		$scope.audio_list.play('audio_008');
		
		//  
		$timeout(function(){
			$scope.v_user_info();
		},2000);
	}
	
	//   系统处理  确认注册信息
	$scope.v_user_info = function(){
		
		$scope.status = 5;
		
		$timeout(function(){
			$scope.card_loadding();
		},2000);
	}
	
	//   制卡
	$scope.card_loadding = function(){
		//  制卡
		
		//  打印凭条
		var printTemplate = "建卡凭证\n\n" +
							"打印时间：" + $filter('date')($scope.app.server_time, 'yyyy-MM-dd HH:mm:ss') + "\n\n" + 
							"姓名：" + $scope.form_data.PeopleName + "\n\n" +
							"卡号12345789\n\n" +
							"充值金额：" + $scope.money + "\n\n" + 
							"温馨提示：请保留本凭证";
		window.terminal && window.terminal.PrintReceipt(printTemplate,'5','');
		//  
		$scope.status = 6;
		
		$timeout(function(){
			$scope.card_ok();
		},2000);
	}
	
	//   制卡完成 提示返回上一步
	$scope.card_ok = function(){
		
		
		
		
		//   播放声音
		$scope.audio_list.allStop();
		$scope.audio_list.play('audio_010');
		
		
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 60;
		tm.fnAutoRefreshfn(tm);
		$scope.status = 7;
	}
	
	
	
	
	
	
	var run = function(){
		//   读卡片数量  无卡提示返回
		if(1){
			//   有卡
			//   取身份证信息
			window.terminal && window.terminal.ReadCardData("terminal_device.build_card.cb_id");
			//   播放声音
			$scope.audio_list.play('audio_003');
		}else{
			//   无卡  
			//   弹窗提示 并返回
		}
		
		
	}
	run();
	
});