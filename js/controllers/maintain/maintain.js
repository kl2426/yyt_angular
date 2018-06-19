/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:35:49 
 * @Last Modified by: wu
 * @Last Modified time: 2018-06-02 10:13:52
 */
'use strict';

/**
 *  维护人员相关界面
 */
app.controller('modalMaintainLoginCtrl', function($scope, $interval, $modal, $modalInstance, items, $timeout, httpService, opCookie) {

	$scope.items = items;

	//   清空登录数据
	$scope.items.scope.app.admin_info = null;

	//   弹窗信息
	$scope.form = {
		//
		user: '',
		//
		pwd: ''
	};

	//   打开菜单弹窗
	var modalMaintainMenu = function() {
		//   打开维护界面
		var modalInstance = $modal.open({
			templateUrl: 'tpl/maintain/modal-menu.html',
			controller: 'modalMaintainMenuCtrl',
			windowClass: 'g-modal-none m-modal-maintain',
			animation: false,
			backdrop: false,
			resolve: {
				items: function() {
					return {
						'scope': $scope.items.scope
					};
				},
				deps: ['$ocLazyLoad',
					function($ocLazyLoad) {
						return $ocLazyLoad.load(['js/controllers/maintain/maintain.js']);
					}
				]
			}
		});
	};

	$scope.form_name = 'user';
	//   点击取dom
	$scope.bindName = function(form_name) {
		$scope.form_name = form_name;
	};

	//   数字键盘按下
	$scope.keyb = function(str) {
		// if(str == 'backspace') {
		// 	if($scope.form[$scope.form_name].length > 0) {
		// 		$scope.form[$scope.form_name] = $scope.form[$scope.form_name].substr(0, $scope.form[$scope.form_name].length - 1);
		// 	}
		// } else if(str == 'delete') {
		// 	$scope.form[$scope.form_name] = '';
		// } else if(/[0-9]/.test(str)) {
		// 	if($scope.form[$scope.form_name].length < 16) {
		// 		$scope.form[$scope.form_name] = $scope.form[$scope.form_name] + str.toString();
		// 	}
		// }
	};

	//   取设备信息
	var getAdminInfo = function(terminalNo, mac, cb) {
		httpService.ajaxPost(httpService.API.href + '/api/auth/syslogin', {
				'loginName': terminalNo,
				'password': mac
			})
			.then(function(res) {
				if(res.succeed) {
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
	};

	//  登录
	$scope.login = function() {
		$scope.form.user = $scope.items.scope.app.user_info ? $scope.items.scope.app.user_info.card_no : "";
		$scope.form.pwd = $scope.items.scope.app.user_info ? $scope.items.scope.app.user_info.card_no : "";

		//   登录
		getAdminInfo($scope.form.user, $scope.form.pwd, function(res) {
			//   登录成功 关闭当前登录页
			$timeout(function() {
				$scope.cancel();
			}, 500);
			//   打开 管理菜单页
			modalMaintainMenu();
		});
	};

	//
	$scope.ok = function() {
		$modalInstance.close('ok');
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
		$scope.items.scope.show_maintain = false;
	};

	console.log($modal)

});

/**
 *  维护人员相关界面 - 菜单弹窗
 */
app.controller('modalMaintainMenuCtrl', function ($scope, $interval, $modal, $modalInstance, items, $timeout) {

	$scope.items = items;

	//
	$scope.data = {
		user_card:"",
		items: [{
				name: 'modal-receipt',
				title: '当日凭条补打',
				checked: false,
				define_checked: false
			},
			{
				name: 'modal-jfReceipt',
				title: '门诊缴费凭条补打',
				checked: false,
				define_checked: false
			},
			{
				name: 'modal-netJfReceipt',
				title: '网络缴费凭条补打',
				checked: false,
				define_checked: false
			},
			{
				name: 'modal-jfQuery',
				title: '缴费查询',
				checked: false,
				define_checked: false
			},
			{
				name: 'modal-addCard',
				title: '加卡',
				checked: false,
				define_checked: false
			},
			{
				name: 'modalMaintainError',
				title: '系统维护中',
				checked: false,
				define_checked: false
			},
			{
				name: 'modalMaintainBankOutCard',
				title: '退银行卡',
				checked: false,
				define_checked: false
			},
			{
				name: 'modalMaintainCardOut',
				title: '退诊疗卡',
				checked: false,
				define_checked: false
			},
			{
				name: 'modalMaintainRestart',
				title: '重起系统',
				checked: false,
				define_checked: false
			},
			{
				name: 'modalMaintainClose',
				title: '退出系统',
				checked: false,
				define_checked: false
			}
		]
	};

	//   打开凭条补打界面
	$scope.modalMaintainReceipt = function() {
		//   打开维护界面
		var modalInstance = $modal.open({
			templateUrl: 'tpl/maintain/modal-receipt.html',
			controller: 'modalMaintainReceiptCtrl',
			windowClass: 'g-modal-none m-modal-maintain',
			animation: false,
			backdrop: false,
			resolve: {
				items: function() {
					return {
						'scope': $scope.items.scope
					};
				},
				deps: ['$ocLazyLoad',
					function($ocLazyLoad) {
						return $ocLazyLoad.load(['js/controllers/maintain/maintain-receipt.js']);
					}
				]
			}
		});
	};

	//  门诊缴费凭条补打界面
	$scope.modalMaintainJfReceipt = function() {
		var modalInstance = $modal.open({
			templateUrl: 'tpl/maintain/modal-jfReceipt.html',
			controller: 'modalMaintainJfReceiptCtrl',
			windowClass: 'g-modal-none m-modal-maintain',
			animation: false,
			backdrop: false,
			resolve: {
				items: function() {
					return {
						'scope': $scope.items.scope
					};
				},
				deps: ['$ocLazyLoad',
					function($ocLazyLoad) {
						return $ocLazyLoad.load(['js/controllers/maintain/maintain-jfReceipt.js']);
					}
				]
			}
		});
	};
	
	//	网络缴费凭条补打界面
	$scope.modalMaintainNetJfReceipt = function() {
		var modalInstance = $modal.open({
			templateUrl: 'tpl/maintain/modal-netJfReceipt.html',
			controller: 'modalMaintainNetJfReceiptCtrl',
			windowClass: 'g-modal-none m-modal-maintain',
			animation: false,
			backdrop: false,
			resolve: {
				items: function() {
					return {
						'scope': $scope.items.scope
					};
				},
				deps: ['$ocLazyLoad',
					function($ocLazyLoad) {
						return $ocLazyLoad.load(['js/controllers/maintain/maintain-netJfReceipt.js']);
					}
				]
			}
		});
	};
	
	//	缴费查询界面
	$scope.modalMaintainJfQuery = function() {
		var modalInstance = $modal.open({
			templateUrl: 'tpl/maintain/modal-jfQuery.html',
			controller: 'modalMaintainJfQueryCtrl',
			windowClass: 'g-modal-none m-modal-maintain',
			animation: false,
			backdrop: false,
			resolve: {
				items: function() {
					return {
						'scope': $scope.items.scope
					};
				},
				deps: ['$ocLazyLoad',
					function($ocLazyLoad) {
						return $ocLazyLoad.load(['js/controllers/maintain/maintain-jfQuery.js']);
					}
				]
			}
		});
	};
	

	//	加卡
	$scope.modalMaintainAddCard = function() {
		var modalInstance = $modal.open({
			templateUrl: 'tpl/maintain/modal-addCard.html',
			controller: 'modalMaintainAddCardCtrl',
			windowClass: 'g-modal-none m-modal-maintain',
			animation: false,
			backdrop: false,
			resolve: {
				items: function() {
					return {
						'scope': $scope.items.scope
					};
				},
				deps: ['$ocLazyLoad',
					function($ocLazyLoad) {
						return $ocLazyLoad.load(['js/controllers/maintain/maintain-addCard.js']);
					}
				]
			}
		});
	};

	//  退诊疗卡
	$scope.cardOut = function() {
		//   硬件退卡
		$scope.items.scope.outCard_null();
	};

	//   银行卡退卡
	$scope.bankOutCard = function() {
		window.terminal && window.terminal.CloseBankModel();
	};

	//   退出系统
	$scope.modalMaintainClose = function() {
		// 退出系统
		window.terminal && window.terminal.CloseSystem();
	};

	//   重起系统
	$scope.modalMaintainRestart = function() {
		// 退出系统
		window.terminal && window.terminal.ReStartSystem();
	};

	$scope.tapClick = function(item) {
		switch(item.name) {
			case 'modal-receipt':
				$scope.modalMaintainReceipt();
				break;
			case 'modal-jfReceipt':
				$scope.modalMaintainJfReceipt();
				break;
			case 'modal-netJfReceipt':
				$scope.modalMaintainNetJfReceipt();
				break;
			case 'modal-jfQuery':
				$scope.modalMaintainJfQuery();
				break;
			case 'modal-addCard':
				$scope.modalMaintainAddCard();
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
	};

	//   数字键盘按下
	$scope.keyb = function (str) {
		if(str == 'backspace') {
			if($scope.data.user_card.length > 0) {
				$scope.data.user_card = $scope.data.user_card.substr(0, $scope.data.user_card.length - 1);
			}
		} else if(str == 'delete') {
			$scope.data.user_card = '';
		} else if(/[0-9]/.test(str)) {
			if ($scope.data.user_card.length < 16) {
				$scope.data.user_card = $scope.data.user_card + str.toString();
			}
		}
	};


	//  患者登录 	
	$scope.user_login = function () {
		if(!$scope.data.user_card)return false;
		$scope.login_loadding = true;
		$timeout(function () {
			$scope.login_loadding = false;
		},3000)
		$scope.items.scope.getUserInfo($scope.data.user_card);
		$scope.show_key = false;
	}

	//
	$scope.ok = function() {
		$modalInstance.close('ok');
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
		$scope.items.scope.outCard();
		$scope.items.scope.show_maintain = false;
		
	};

	//  run
	var run = function() {
		//   权限验证
		var temp_data = $scope.items.scope.app.admin_info.userRights;

		for(var i in $scope.data.items) {
			for(var j in temp_data) {
				if(temp_data[j].menuCode == $scope.data.items[i].name || $scope.data.items[i].define_checked) {
					$scope.data.items[i].checked = true;
				}
			}
		}

	};

	run();

});