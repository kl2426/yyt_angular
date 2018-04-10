/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:35:41 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-21 10:56:05
 */
/**
 * 住院清单
 */
app.controller('hospitalCtrl', function($scope,$interval,httpService,$filter) {
	
	//   当前页面返回秒数
	$scope.countdown_time = 60;
	
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("hospitalCtrl");
	if(tm.Key!="hospitalCtrl"){
		tm.Key="hospitalCtrl";
		tm.keyctrl="app.hospital";
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
		$scope.audio_list.play('audio_001');
	}
	run();
	
});



/**
 * 住院清单   日清单
 */
app.controller('hospitalDayCtrl', function($scope,$interval,httpService,$filter) {
	
	//   当前页面返回秒数
	$scope.countdown_time = 240;
	
	//  
	$scope.status = 1;
	
	//
	$scope.items_loadding = false;
	
	
	//   姓名
	$scope.PatName = '';
	//   性别
	$scope.PatSex = '';
	
	//  数据
	$scope.data = {
		//
		'form':{
			inp_no:'',
			startDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
			endDate: $filter('date')(new Date(), 'yyyy-MM-dd'),
		},
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
	
	//   住院清单
	var bhc = function(inpno, startDate, endDate){
		//
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/bhc/' + inpno + '/' + startDate + '/' + endDate)
		.then(function(res){
			//
			$scope.items_loadding = false;
			//
			if(res.succeed){
				if(res.data.Item.__proto__.constructor == Array){
					$scope.data.items = res.data.Item;
				}else{
					$scope.data.items = [res.data.Item];
				}
				$scope.data.page.total = $scope.data.items.length;
				//  序号
				for(var i in $scope.data.items){
					$scope.data.items[i].index = +i + 1;
					//   数量
					$scope.data.items[i].Price = (+$scope.data.items[i].Price).toFixed(2);
					$scope.data.items[i].Number = +$scope.data.items[i].Number;
					$scope.data.items[i].ItemFee = (+$scope.data.items[i].ItemFee).toFixed(2);
				}
				//  分页
				$scope.data.page.pageFn(1);
				
				console.log($scope.data)
				
			}else{
				$scope.data.items = [];
				$scope.data.page.total = 0;
			}
		});
	}
	
	$scope.bhc = function(){
		$scope.data.items = [];
		$scope.data.page.row = [];
		$scope.data.page.total = 0;
		bhc($scope.data.form.inp_no, $scope.data.form.startDate, $scope.data.form.endDate);
	}
	
	
	//   打印住院总清单
	$scope.printAll = function(){
		//
	}
	
	//  身份证登录
	$scope.statusID = function(){
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_003');
		//   取身份证信息
		window.terminal && window.terminal.ReadCardData("terminal_device.build_card.cb_id");
		
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 60;
		tm.fnAutoRefreshfn(tm);
		//
		$scope.status = 2;
	}
	
	//  回调
	terminal_device.build_card.cb_id = function(obj){
		// log
		window.terminal && window.terminal.WriteLog('res 读取身份证回调:' + JSON.stringify(obj));
		//
		if(obj && obj.MsgCode == '1000'){
			//   性别
			if(obj.MsgStr.PeopleSex == '男'){
				$scope.PatSex = '1';
			}else if(obj.MsgStr.PeopleSex == '女'){
				$scope.PatSex = '2';
			}else{
				$scope.PatSex = '9';
			}
			//   身份证号
			$scope.data.form.inp_no = obj.MsgStr.PeopleIDCode;
			//   姓名
			$scope.PatName = obj.MsgStr.PeopleName;
			//
			$scope.bhc();
			//  
			tm.fnStopAutoRefreshfn(tm);
			$scope.countdown_time = 240;
			tm.fnAutoRefreshfn(tm);
			//
			$scope.status = 3;
			//
		}else{
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
//			//  返回选择医生
//			$scope.locationBk();
		}
	}


	//  诊疗卡 登录
	$scope.statusCARD = function () {
		if ($scope.app.user_info && $scope.app.user_info.card_no) {
			//   已插入诊疗卡
			//   性别
			$scope.PatSex = $scope.app.user_info.PatSex;
			//   身份证号/诊疗卡号
			$scope.data.form.inp_no = $scope.app.user_info.HicNo;
			// $scope.data.form.inp_no = '430521198911273807';
			//   姓名
			$scope.PatName = $scope.app.user_info.PatName;
			//
			$scope.bhc();
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
			$scope.openInCard_modalInstance.result.then(function (selectedItem) {
				//   性别
				$scope.PatSex = $scope.app.user_info.PatSex;
				//   身份证号/诊疗卡号
				$scope.data.form.inp_no = $scope.app.user_info.HicNo;
				// $scope.data.form.inp_no = '430521198911273807';
				//   姓名
				$scope.PatName = $scope.app.user_info.PatName;
				//
				$scope.bhc();
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
	
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("hospitalDayCtrl");
	if(tm.Key!="hospitalDayCtrl"){
		tm.Key="hospitalDayCtrl";
		tm.keyctrl="app.hospital.day";
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
		$scope.audio_list.play('audio_026');
		
		//
		var new_date = new Date();
		var date_begin = $filter('date')(new Date(), 'yyyy-MM-dd');
		var date_end = $filter('date')(new_date.setDate(new_date.getDate() + 10), 'yyyy-MM-dd');
		//   
		//$scope.bhc();
	}
	run();
	
});






/**
 * 住院清单   总清单
 */
app.controller('hospitalTotalCtrl', function($scope,$interval,httpService,$filter,$timeout,$stateParams) {
	
	//   当前页面返回秒数
	$scope.countdown_time = 60;
	
	//
	$scope.items_loadding = false;
	
	//  
	$scope.status = 1;
	
	//   姓名
	$scope.PatName = '';
	//   性别
	$scope.PatSex = '';
	
	//  数据
	$scope.data = {
		//
		form:{
			'inp_no':''
		},
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
	
	//   住院次数
	var getInpatientNO = function(PatientID){
		//
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/getInpatientNO/' + PatientID)
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
				//  序号
				for(var i in $scope.data.items){
					$scope.data.items[i].index = +i + 1;
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
	
	
	
	//  身份证登录
	$scope.statusID = function(){
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_003');

		//   取身份证信息
		window.terminal && window.terminal.ReadCardData("terminal_device.build_card.cb_id");
		
		//  
		tm.fnStopAutoRefreshfn(tm);
		$scope.countdown_time = 60;
		tm.fnAutoRefreshfn(tm);
		//
		$scope.status = 2;
		
		// return false;
		// $scope.status = 3;
		// $scope.data.form.inp_no = '430202193909090050';
		// //
		// getInpatientNO($scope.data.form.inp_no);
	}
	
	//  回调
	terminal_device.build_card.cb_id = function(obj){
		//
		if(obj && obj.MsgCode == '1000'){
			//   性别
			if(obj.MsgStr.PeopleSex == '男'){
				$scope.PatSex = '1';
			}else if(obj.MsgStr.PeopleSex == '女'){
				$scope.PatSex = '2';
			}else{
				$scope.PatSex = '9';
			}
			//   身份证号
			$scope.data.form.inp_no = obj.MsgStr.PeopleIDCode;
			// $scope.data.form.inp_no = '430202193909090050';
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
		}else{
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
//			$scope.systemError('读身份证失败请重试');
//			//  返回选择医生
//			$scope.locationBk();
		}
	}
	
	//  诊疗卡 登录
	$scope.statusCARD = function () {
		if ($scope.app.user_info && $scope.app.user_info.card_no) {
			//   已插入诊疗卡
			//   性别
			$scope.PatSex = $scope.app.user_info.PatSex;
			//   身份证号/诊疗卡号
			$scope.data.form.inp_no = $scope.app.user_info.HicNo;
			// $scope.data.form.inp_no = '430202193909090050';
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
			$scope.openInCard_modalInstance.result.then(function (selectedItem) {
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

			}, function () {
				//
			});
		}
	}
	
	
	
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("hospitalTotalCtrl");
	if(tm.Key!="hospitalTotalCtrl"){
		tm.Key="hospitalTotalCtrl";
		tm.keyctrl="app.hospital.total";
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
		$scope.audio_list.play('audio_026');
		//
		if($stateParams.status != ''){
			$scope.status = $stateParams.status;
			$scope.data.form.inp_no = $stateParams.inp_no;
			$scope.PatSex = $stateParams.PatSex;
			$scope.PatName = $stateParams.PatName;
			//
			getInpatientNO($scope.data.form.inp_no);
		}
		
	}
	run();
	
});





/**
 * 住院清单   总清单
 */
app.controller('hospitalTotalInfoCtrl', function($scope,$interval,httpService,$filter,$timeout,$stateParams,$state) {
	
	//   当前页面返回秒数
	$scope.countdown_time = 240;

	$scope.btn_title = '打印总清单';
	$scope.btn_show = true;
	
	//
	$scope.items_loadding = false;

	$scope.inp_no = $stateParams.inp_no;
	
	//
	$scope.PatientID = $stateParams.PatientID;
	//
	$scope.Times = $stateParams.Times;
	//   住院号
	$scope.InpatientNo = $stateParams.InpatientNo;
	
	//  数据
	$scope.data = {
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
	
	//   住院总清单
	var getoutfee = function(cardNo, patientID, times, inpatientNo){
		//
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/getoutfee/' + cardNo + '/' + patientID + '/' + times + '/' + inpatientNo)
		.then(function(res){
			// log
			window.terminal && window.terminal.WriteLog('res /api/yytBase/v1/getoutfee/:' + JSON.stringify(res));
			//
			$scope.items_loadding = false;
			//
			if(res.succeed){
				if(res.data.item.__proto__.constructor == Array){
					$scope.data.items = res.data.item;
				}else{
					$scope.data.items = [res.data.item];
				}
				//  序号
				for(var i in $scope.data.items){
					$scope.data.items[i].index = +i + 1;
				}
				$scope.data.page.total = $scope.data.items.length;
				//  分页
				$scope.data.page.pageFn(1);

				//  是否打印过
				if (res.data.PrintTimes > 0){
					$scope.btn_title = '已打印总清单';
					$scope.btn_show = false;
				}
				
			}else{
				$scope.data.items = [];
				$scope.data.page.total = 0;
			}
		});
	}
	
	
	//  取打印凭条返回
	$scope.res_zyPrint = null;
	//  系统正在处理中
	var zyPrint = function () {
		//
		var temp_obj = {
			cardNo: $scope.inp_no,
			patientID: $scope.inp_no,
			inpatientNo: $stateParams.InpatientNo,
			zyTimes: $stateParams.Times,
			regDate:''
		}
		// log
		window.terminal && window.terminal.WriteLog('rq /api/yytMace/v1/zyPrint:' + JSON.stringify(temp_obj));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/zyPrint', temp_obj)
			.then(function (res) {
				// log
				window.terminal && window.terminal.WriteLog('res /api/yytMace/v1/zyPrint:' + JSON.stringify(res));
				//
				if (res.succeed) {
					//    开始总清单
					if ($scope.data.items.length < 1) {
						return false;
					}
					window.terminal && window.terminal.ListOfExpensesPrint(JSON.stringify($scope.data.items));
					//
					$scope.res_zyPrint = res.data;
				} else {
					//  提交失败
					$scope.systemError('打印失败：请与维护人员联系');

					//  返回
					$scope.changeStatus();
				}
			});


	}



	//   凭条打印更新 打印结果上传
	//  0 失败 1 成功
	var printLog = function () {
		//  alert('取预约单详情')
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/printLog', {
			lid: $scope.res_zyPrint.lid,
			type: 1
		})
			.then(function (res) {
				// log
				window.terminal && window.terminal.WriteLog('res 预约挂号 /api/yytMace/v1/printLog:' + JSON.stringify(res));
			});
	}

	
	
	//   打印总清单
	$scope.total = function(){
		zyPrint();
		//
		$scope.btn_title = '已打印总清单';
		$scope.btn_show = false;
	}
	
	
	
	
	//   打印完成回调
	terminal_device.print_hospital.cb_print_all_hospital = function (res_Status, res_str) {
		if (res_Status == 0) {
			$scope.statusFn2();
			//
			printLog();
		} else {
			$scope.systemError('打印失败：' + res_str);
		}
	}
	
	
	//    完成打印 
	$scope.statusFn2 = function () {
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音取走凭条
		$scope.audio_list.play('audio_009');
		//  灯光提示
		window.terminal && window.terminal.JSOpenTwinkleLED('5');
		//  5秒关闭
		$timeout(function () { window.terminal && window.terminal.JSCloseTwinkleLED('5'); }, 5000);

	}
	
	
	//   返回上一步加状态
	$scope.changeStatus = function(){
		$state.go('app.hospital.total',{status:'3', inp_no:$stateParams.inp_no, PatSex:$stateParams.PatSex, PatName:$stateParams.PatName});
	}
	
	
	
	//开始定义定时器
	var tm=$scope.setglobaldata.gettimer("hospitalTotalInfoCtrl");
	if(tm.Key!="hospitalTotalInfoCtrl"){
		tm.Key="hospitalTotalInfoCtrl";
		tm.keyctrl="app.hospital.total.info";
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
		$scope.audio_list.play('audio_026');
		//
		getoutfee($scope.inp_no, $scope.PatientID, $scope.Times, $scope.InpatientNo);
	}
	run();
	
});


