/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:35:49 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-08 14:12:22
 */
'use strict';

/**
 *  维护人员相关界面
 */
app.controller('modalMaintainLoginCtrl', function ($scope, $interval, $modal, $modalInstance, items, $timeout, httpService, opCookie) {
	
	$scope.items = items;
	
	//   清空登录数据
	$scope.items.scope.app.admin_info = null;
	
	//   弹窗信息
	$scope.form = {
		//  
		user:'',
		//
		pwd:''
	}
	
	
	//   打开菜单弹窗
	var modalMaintainMenu = function(){
		//   打开维护界面
		var modalInstance = $modal.open({
			templateUrl: 'tpl/maintain/modal_menu.html',
			controller: 'modalMaintainMenuCtrl',
			windowClass:'g-modal-none m-modal-maintain',
			animation:false,
			backdrop:false,
			resolve: {
				items: function() {
					return {
						'scope':$scope.items.scope
					};
				},
				deps: ['$ocLazyLoad',
                  function( $ocLazyLoad ){
                    return $ocLazyLoad.load(['js/controllers/maintain/maintain.js']);
                }]
			}
		});
	}
	
	
	$scope.form_name = 'user';
	//   点击取dom
	$scope.bindName = function(form_name){
		$scope.form_name = form_name;
	}
	
	//   数字键盘按下
	$scope.keyb = function(str){
		if(str == 'backspace'){
			if($scope.form[$scope.form_name].length > 0){
				$scope.form[$scope.form_name] = $scope.form[$scope.form_name].substr(0,$scope.form[$scope.form_name].length - 1);
			}
		}else if(str == 'delete'){
			$scope.form[$scope.form_name] = "";
		}else if(/[0-9]/.test(str)){
			if($scope.form[$scope.form_name].length < 16){
				$scope.form[$scope.form_name] = $scope.form[$scope.form_name] + str.toString();
			}
		}
	}
	
	
	//   取设备信息
	var getAdminInfo = function(terminalNo, mac, cb) {
		//
		httpService.ajaxPost(httpService.API.href + '/api/auth/syslogin', {'loginName': terminalNo, 'password': mac})
		.then(function(res) {
			if (res.succeed) {
				//  登录成功 加入cookie
				opCookie.setCookie('access_admin_token', res.data.accessToken, 30 * 24 * 60 * 60);
				opCookie.setCookie('refresh_admin_token', res.data.refreshToken, 30 * 24 * 60 * 60);
				//
				$scope.items.scope.app.admin_info = res.data;
				typeof cb == "function" && cb(res.data);
			} else {
				//
				$scope.items.scope.app.admin_info = null;
				$scope.items.scope.systemError('登录失败');
				//   请除cookie
				opCookie.clearCookie('access_admin_token');
				opCookie.clearCookie('refresh_admin_token');
				//   错误提示
			}
		});
	}
	
	
	//  登录
	$scope.login = function(){
		console.log($scope.form)
		//   登录
		getAdminInfo($scope.form.user, $scope.form.pwd, function(){
			//   登录成功 关闭当前登录页
			$timeout(function(){
				$scope.cancel();
			},500);
			//   打开 管理菜单页
			modalMaintainMenu();
		});
	}
	
	
	
	
	
	
	//
	$scope.ok = function() {
		$modalInstance.close('ok');
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
	
	
});



/**
 *  维护人员相关界面 - 菜单弹窗
 */
app.controller('modalMaintainMenuCtrl', function($scope,$interval,$modal,$modalInstance,items) {
	
	$scope.items = items;
	
	
	//
	$scope.data = {
		items: [
			{ name: 'modal_receipt', title: '当日凭条补打', checked: false, define_checked: true },
			{ name: 'modalMaintainError', title: '系统维护中', checked: false, define_checked: true },
			{ name: 'modalMaintainBankOutCard', title: '退银行卡', checked: true, define_checked: true },
			{ name:'modalMaintainCardOut', title:'退诊疗卡', checked:true, define_checked:true},
			{ name: 'modalMaintainRestart', title: '重起系统', checked: true, define_checked: true},
			{ name: 'modalMaintainClose', title: '退出系统', checked: true, define_checked: true},
		]
	}
	
	
	
	//   打开凭条补打界面
	$scope.modalMaintainReceipt = function(){
		//   打开维护界面
		var modalInstance = $modal.open({
			templateUrl: 'tpl/maintain/modal_receipt.html',
			controller: 'modalMaintainReceiptCtrl',
			windowClass:'g-modal-none m-modal-maintain',
			animation:false,
			backdrop:false,
			resolve: {
				items: function() {
					return {
						'scope':$scope.items.scope
					};
				},
				deps: ['$ocLazyLoad',
                  function( $ocLazyLoad ){
                    return $ocLazyLoad.load(['js/controllers/maintain/maintain.js']);
                }]
			}
		});
	}
	
	
	//  退诊疗卡
	$scope.cardOut = function () {
		//   硬件退卡
		$scope.items.scope.outCard_null();
	}
	
	//   银行卡退卡
	$scope.bankOutCard = function () {
		window.terminal && window.terminal.CloseBankModel();
	}
	
	
	//   退出系统
	$scope.modalMaintainClose = function(){
		// 退出系统
		window.terminal && window.terminal.CloseSystem();
	}
	
	//   重起系统
	$scope.modalMaintainRestart = function(){
		// 退出系统
		window.terminal && window.terminal.ReStartSystem();
	}
	
	
	$scope.tapClick = function(item){
		switch(item.name){
			case 'modal_receipt':
				$scope.modalMaintainReceipt();
			break;
			case 'modalMaintainRestart':
				$scope.modalMaintainRestart();
			break;
			case 'modalMaintainClose':
				$scope.modalMaintainClose();
			break;
			case 'modalMaintainBankOutCard':
				$scope.bankOutCard();
				break;
			case 'modalMaintainCardOut':
				$scope.cardOut();
				break;
			case 'modalMaintainError':
				$scope.items.scope.modelOpenPrintError('系统维护中暂停使用');
				break;
		}
	}
	
	
	//
	$scope.ok = function() {
		$modalInstance.close('ok');
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};
	
	//  run
	var run = function(){
		//   权限验证
		var temp_data = $scope.items.scope.app.admin_info.userRights;
		for(var i in $scope.data.items){
			for(var b in temp_data){
				if (temp_data[b].menuCode == $scope.data.items[i].name || $scope.data.items[i].define_checked){
					$scope.data.items[i].checked = true;
				}
			}
		}
		
	}
	run();
	
});



/**
 *  维护人员相关界面 - 凭条补打
 */
app.controller('modalMaintainReceiptCtrl', function ($scope, $interval, $modal, $modalInstance, items, $filter, httpService, $timeout) {
	
	$scope.items = items;
	
	$scope.items_loadding = false;
	
	//  数据
	$scope.data = {
		checked_items: [],
		//
		'form': {
			'regDate': ''
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

	$scope.chekced_click = function (item) {
		for(var i in $scope.data.items){
			$scope.data.items[i].checked = false;
		}
		item.checked = !item.checked;
	}
	
	
	//   取打印日志
	var ticketPrint = function (cardNo, patientID, regDate){
		$scope.items_loadding = true;
		//
		httpService.adminAjaxGet(httpService.API.href + '/api/yytBase/v1/ticketPrint/' + cardNo + '/' + patientID + '/' + regDate)
		.then(function(res){
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
				//
				$scope.data.page.total = $scope.data.items.length;
				//  分页
				$scope.data.page.pageFn(1);
			}else{
				$scope.data.items = [];
				$scope.data.page.row = [];
				$scope.data.page.total = 0;
			}
		});
	}

	//
	$scope.bhc = function () {
		$scope.data.items = [];
		$scope.data.page.row = [];
		$scope.data.page.total = 0;
		ticketPrint($scope.items.scope.app.user_info.card_no, $scope.items.scope.app.user_info.PatientID, $scope.data.form.regDate);
	}
	

	//   取号
	$scope.outMark = function () {
		//
		var temp_item = null;
		for(var i in $scope.data.items){
			if($scope.data.items[i].checked){
				temp_item = $scope.data.items[i];
				break;
			}
		}
		//
		if(temp_item){
			//    开始打印
			window.terminal && window.terminal.PrintReceipt(temp_item.print, '', '');
		}

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
		} else if (res_Status == '99') {
			//   打开打印错误弹窗
			$scope.items.scope.systemError(res_str);
		} else {
			//  打印异常
			// alert('打印异常');
			//  提交失败
			$scope.items.scope.systemError(res_str);
		}
	}
	

	
	//
	$scope.ok = function() {
		$modalInstance.close('ok');
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};


	//  run
	var run = function () {
		//  
		var regDate = $filter('date')(new Date(), 'yyyy-MM-dd'); 
		$scope.data.form.regDate = regDate;
		//
		$scope.bhc();
	}
	run();
	
	
});