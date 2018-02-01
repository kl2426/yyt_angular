'use strict';

/**
 * 挂号 购买病历本
 */
app.controller('cardBookCtrl', function($scope,$interval,$timeout) {
	
	//   状态  1, 确认挂号。2，系统正在处理。3，打印凭条。4，挂号成功
	$scope.status = 1;
	
	
	//   当前页面返回秒数
	$scope.countdown_time = 60;
	
	//
	$scope.form_data = {
		
	}
	
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("card_book");
	if(tm.Key!="card_book"){
		tm.Key="card_book";
		tm.keyctrl="app.card.book";
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
	
	
	//  1 确认
	$scope.statusFn1 = function(){
		//   提交挂号信息
		
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 60;
		$scope.status = 2;
		
		//   播放声音
		$scope.audio_list.allStop();
		$scope.audio_list.play('audio_008');
		
		//
		$timeout(function(){
			$scope.statusFn2();
		},2000);
	}
	
	//  系统正在处理中
	$scope.statusFn2 = function(){
		//   验证返回信息
		
		//  
		$scope.status = 3;
		
		//
		$timeout(function(){
			$scope.statusFn3();
		},2000);
	}
	
	
	//  正在打印凭条
	$scope.statusFn3 = function(){
		//   打印条码
		
		//  
		$scope.status = 4;
		
		//   播放声音
		$scope.audio_list.allStop();
		$scope.audio_list.play('audio_009');
		
		//
		$timeout(function(){
			$scope.statusFn4();
		},2000);
	}
	
	
	//  挂号成功
	$scope.statusFn4 = function(){
		//   
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 60;
		tm.fnAutoRefreshfn(tm);
		
		
		
	}
	
	
	var run = function(){
		//   播放声音
		$scope.audio_list.play('audio_006');
	}
	run();
	
	
});