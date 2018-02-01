/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:39:01 
 * @Last Modified by:   wu 
 * @Last Modified time: 2018-02-01 16:39:01 
 */
'use strict';

/* Controllers */

angular.module('app')
	.controller('AppCtrl', ['$scope', '$translate', '$localStorage', '$window', 'opCookie', 'httpService', 'globalFn', '$interval', '$state','$rootScope','$modal','$timeout',
		function($scope, $translate, $localStorage, $window, opCookie, httpService, globalFn, $interval, $state,$rootScope,$modal,$timeout) {
			// add 'ie' classes to html
			var isIE = !!navigator.userAgent.match(/MSIE/i);
			isIE && angular.element($window.document.body).addClass('ie');
			isSmartDevice($window) && angular.element($window.document.body).addClass('smart');

			// config
			$scope.app = {
				name: '株洲中心医院',
				version: '1.3.3',
				// for chart colors
				color: {
					primary: '#7266ba',
					info: '#23b7e5',
					success: '#27c24c',
					warning: '#fad733',
					danger: '#f05050',
					light: '#e8eff0',
					dark: '#3a3f51',
					black: '#1c2b36'
				},
				settings: {
					themeID: 1,
					navbarHeaderColor: 'bg-black',
					navbarCollapseColor: 'bg-white-only',
					asideColor: 'bg-black',
					headerFixed: true,
					asideFixed: false,
					asideFolded: false,
					asideDock: false,
					container: false
				},
				//   nav
				nav: [],
				//   机器登录信息
				device_info: {},
				//   用户登录信息
				user_info: null,
				//   维护人员数据
				admin_info: null,
				//   服务器时间
				server_time: 1507615982000,
				server_time_week: '星期一'
			}

			// save settings to local storage
			if(angular.isDefined($localStorage.settings)) {
				$scope.app.settings = $localStorage.settings;
			} else {
				$localStorage.settings = $scope.app.settings;
			}
			$scope.$watch('app.settings', function() {
				if($scope.app.settings.asideDock && $scope.app.settings.asideFixed) {
					// aside dock and fixed must set the header fixed.
					$scope.app.settings.headerFixed = true;
				}
				// save to local storage
				$localStorage.settings = $scope.app.settings;
			}, true);

			// angular translate
			$scope.lang = {
				isopen: false
			};
			$scope.langs = {
				en: 'English',
				de_DE: 'German',
				it_IT: 'Italian'
			};
			$scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "English";
			$scope.setLang = function(langKey, $event) {
				// set the current lang
				$scope.selectLang = $scope.langs[langKey];
				// You can change the language during runtime
				$translate.use(langKey);
				$scope.lang.isopen = !$scope.lang.isopen;
			};

			function isSmartDevice($window) {
				// Adapted from http://www.detectmobilebrowsers.com
				var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
				// Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
				return(/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
			}
			
			////  =============================================================================

//			//   取nav
//			$scope.getNav = function() {
//				if(opCookie.getCookie('access_token')) {
//					//
//					httpService.ajaxPost(httpService.API.origin + '/Rest/function/createIndexTree', undefined, 10000, {
//							parentcode: '0'
//						})
//						.then(function(data) {
//							console.log(data)
//							if(data.status == 200) {
//								var temp_nav = data.data;
//								//   组合code
//								if(temp_nav.length > 0) {
//									globalFn.dg_tree(temp_nav, function(item) {
//										item.fucecode_router = item.fucecode.split('-').join('.').toLowerCase();
//									})
//									$scope.app.nav = temp_nav;
//								} else {
//									$scope.app.nav = [];
//								}
//							} else {
//								//$scope.authError = 'Email or Password not right';
//							}
//						}, function(x) {
//							console.log(x)
//							$scope.authError = 'Server Error';
//						});
//				}
//			}

			//   取设备信息
			$scope.getDeviceInfo = function(terminalNo, mac) {
				//
				httpService.ajaxPost(httpService.API.href + '/api/yyt/auth/login', {'terminalNo': terminalNo, 'mac': mac})
				.then(function(res) {
					if(res.succeed){
						//  登录成功 加入cookie
						opCookie.setCookie('access_token', res.data.accessToken, 30 * 24 * 60 * 60);
						opCookie.setCookie('refresh_token', res.data.refreshToken, 30 * 24 * 60 * 60);
						//
						$scope.app.device_info = res.data;
						//   应用权限
						for(var i in $scope.routerMenuArr){
							var temp_bol = true;
							for(var b in res.data.userRights){
								if(i == res.data.userRights[b].menuCode){
									$scope.routerMenuArr[i].hasMenu = true;
									temp_bol = false;
									break;
								}
							}
							if(temp_bol){
								//  未找到 设置无权限
								$scope.routerMenuArr[i].hasMenu = false;
							}
						}
					}else{
						//   请除cookie
						opCookie.clearCookie('access_token');
						opCookie.clearCookie('refresh_token');
						//   错误提示
					}
				});
			}
			
			//  路由权限表  用于菜单是否显示
			$scope.routerMenuArr = {
				'app.card': {hasMenu:false},
				'app.card.id': {hasMenu:false},
				'app.card.department': {hasMenu:false},
				'app.card.department.registered': {hasMenu:false},
				'app.card.department.registered.docinfo': {hasMenu:false},
				'app.card.department.registered.docinfo.dep': {hasMenu:false},
				'app.card.book': {hasMenu:false},
				//
				'app.recharge': {hasMenu:false},
				'app.recharge.recharge': {hasMenu:false},
				'app.recharge.recharge.money': {hasMenu:false},
				'app.recharge.recharge.card': {hasMenu:false},
				'app.recharge.recharge.weixin': {hasMenu:false},
				'app.recharge.payment': {hasMenu:false},
				'app.recharge.payment.pay': {hasMenu:false},
				//
				'app.reservation': {hasMenu:false},
				'app.reservation.restime': {hasMenu:false},
				'app.reservation.restime.department': {hasMenu:false},
				'app.reservation.restime.department.transit': {hasMenu:false},
				'app.reservation.restime.department.transit.registered': {hasMenu:false},
				'app.reservation.restime.department.transit.registered.docinfo': {hasMenu:false},
				'app.reservation.restime.department.transit.registered.docinfo.dep': {hasMenu:false},
				'app.reservation.take': {hasMenu:false},
				'app.reservation.cancel': {hasMenu:false},
				//
				'app.clinic': {hasMenu:false},
				'app.clinic.info': {hasMenu:false},
				//
				'app.hospital': {hasMenu:false},
				'app.hospital.day': {hasMenu:false},
				'app.hospital.total': {hasMenu:false},
				//
				'app.assay': {hasMenu:false},
				'app.assay.info': {hasMenu:false},
				//
				'app.medicine':{hasMenu:false},
				'app.feeslist':{hasMenu:false},
			}
			
			
			//   点击跳转路由
			$scope.openSref = function(router_str){
				//
				if($scope.app.user_info && $scope.app.user_info.card_no){
					//   已插卡
					$state.go(router_str);
				}else{
					//   未插卡
					//   打开插卡弹窗
					$scope.openInCard();
				}
				
			}
			
			// =========================================================================
			

			//   取服务器时间
			var weekday = new Array(7);
			weekday[0] = "星期天";
			weekday[1] = "星期一";
			weekday[2] = "星期二";
			weekday[3] = "星期三";
			weekday[4] = "星期四";
			weekday[5] = "星期五";
			weekday[6] = "星期六";
			var getServerTime = function() {
				$scope.app.server_time = Date.parse(new Date());
				$interval(function() {
					$scope.app.server_time = $scope.app.server_time + 1000;
					$scope.app.server_time_week = weekday[new Date($scope.app.server_time).getDay()];
				}, 1000);
			}

			//   返回上一级
			$scope.locationBk = function(str) {
				var route = $state.current.name;
				var route_url = route.substr(0, route.lastIndexOf('.'));
				if(str) {
					route_url = str;
				}
				$state.go(route_url == 'app' ? 'app.index' : route_url, {}, {reload:true});
			}
			
			//、 ========================================  插卡退卡   ============================================
			//   打开读卡器端口
			$scope.openCardCom = function(){
				//  alert('打开端口')
				window.terminal && window.terminal.OpenTreatmentCard();
			}
			
			//   读诊疗卡
			$scope.readCard = function(){
				window.terminal && window.terminal.ReadTreatmentCard();
			}
			
			//   卡号取用户信息
			$scope.getUserInfo = function(card_no){
				//  log
				// window.terminal && window.terminal.WriteLog(card_no);
				//
				httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/patient/' + card_no)
					.then(function(res) {
						// log
						// window.terminal && window.terminal.WriteLog(JSON.stringify(res));
						//
						if(res.succeed){
							//   写用户信息
							var user_info = res.data.item;
							user_info.card_no = card_no;
							$scope.app.user_info = user_info;
							$scope.$apply();
						}else{
							$scope.outCard();
							$scope.app.user_info = null;
							$scope.$apply();
						}
					});
			}
			
			//   读卡回调
			//   插卡完成回调 写用户信息
			terminal_device.in_out_card.cb_in_ok_card = function(res_Status, res_str) {
				//  关插卡灯
				window.terminal && window.terminal.JSCloseTwinkleLED('6');
				if(res_Status == '0'){
					//  读卡成功
					//  调用用户信息
					$scope.getUserInfo(res_str);
				}else{
					//  读卡失败
					//  alert('读卡失败');
				}
			}


			
			//   诊疗卡点击退卡
			$scope.outCard = function(){
				//   硬件退卡
				window.terminal && window.terminal.CloseTreatmentCard();
				//   清空用户信息返回首页
				$scope.app.user_info = null;
				$scope.locationBk('app.index');
			}
			
			//   插卡
			$scope.openInCard = function(card_no){
				//   打开 插卡弹窗
				var modalInstance = $modal.open({
					templateUrl: 'tpl/modal/modal_in_card.html',
					controller: 'modalCardInCtrl',
					windowClass:'g-modal-none',
					animation:false,
					backdrop:false,
					resolve: {
						items: function() {
							return {
								'scope':$scope,
								'card_no':card_no
							};
						}
					}
				});
		
				modalInstance.result.then(function(selectedItem) {
					console.log(selectedItem)
					//   返回首页
					//  $scope.locationBk('app.index');
					//  关插卡灯
					window.terminal && window.terminal.JSCloseTwinkleLED('6');
					
				}, function() {
					//$log.info('Modal dismissed at: ' + new Date());
				});
			}
			
			//  ====
			
			//   银行卡点击退卡
			//   银行卡退卡
			$scope.bankOutCard = function(){
				window.terminal && window.terminal.CloseBankModel();
			}
			
			//、 ========================================  /插卡退卡   ============================================
			
			
			
			
			//   系统错误
			$scope.systemError = function(str) {
				
				//   打开 退卡弹窗
				var modalInstance = $modal.open({
					templateUrl: 'tpl/modal/modal_error.html',
					controller: 'modalErrorCtrl',
					windowClass:'g-modal-none',
					animation:false,
					backdrop:false,
					resolve: {
						items: function() {
							return {
								'scope':$scope,
								'key':'modalErrorCtrl',
								'keyctrl':'app.index',
								'msg':str
							};
						}
					}
				});
		
				modalInstance.result.then(function(selectedItem) {
					//console.log(selectedItem)
					//   返回首页
					//$scope.locationBk('app.index');
				}, function() {
					//$log.info('Modal dismissed at: ' + new Date());
				});
				
			}
			//   run 系统错误
			//$scope.systemError();
			
			
			//  =========================  维护界面等  =============================
			//   点击10下打开维护人员登录界面
			$scope.maintain = {
				//
				tm:null,
				//   计数器
				number:10,
				//   点击
				click:function(nb){
					$scope.maintain.number = $scope.maintain.number - 1;
					$timeout.cancel($scope.maintain.tm);
					if(nb == 0){
						$scope.ModalMaintainOpen();
					}
					$scope.maintain.tm = $timeout(function(){
						$scope.maintain.number = 10;
					},1500);
				}
			}
			//   打开维护界面
			$scope.ModalMaintainOpen = function(){
				var modalInstance = $modal.open({
					templateUrl: 'tpl/maintain/modal_login.html',
					controller: 'modalMaintainLoginCtrl',
					windowClass:'g-modal-none m-modal-maintain',
					animation:false,
					backdrop:false,
					resolve: {
						items: function() {
							return {
								'scope':$scope
							};
						},
						deps: ['$ocLazyLoad',
	                      function( $ocLazyLoad ){
	                        return $ocLazyLoad.load(['js/controllers/maintain/maintain.js']);
	                    }]
					}
				});
			}
		
			
			
			//  =========================  / 维护界面等  =============================
			
			
			//  =========================  银行支付遮罩层  =============================
			//   关闭
			$scope.modelClosePay = null;
			
			//   打开 
			$scope.modelOpenPay = function(){
				$scope.modelClosePay = $modal.open({
					templateUrl: 'tpl/modal/modal_pay.html',
					controller: 'modalPayCtrl',
					windowClass:'g-modal-none m-modal-pay',
					animation:false,
					backdrop:false,
					resolve: {
						items: function() {
							return {
								'scope':$scope
							};
						}
					}
				});
			}
			
			
			//  =========================  / 银行支付遮罩层  ===========================


			//  =========================  打印机无纸弹窗  =============================
			$scope.modelClosePrintError = null;

			//   打开 
			$scope.modelOpenPrintError = function (res_str) {
				$scope.modelClosePrintError = $modal.open({
					templateUrl: 'tpl/modal/modal_print_error.html',
					controller: 'modalPrintErrorCtrl',
					windowClass: 'g-modal-none m-modal-print-error',
					animation: false,
					backdrop: false,
					resolve: {
						items: function () {
							return {
								'scope': $scope,
								'msg': res_str
							};
						}
					}
				});
			}

			// $scope.modelOpenPrintError('凭条打印机无纸请与工作人员联系');


			//  =========================  / 打印机无纸弹窗  ===========================
			
			
			//  =========================  打印失败凭条内容处理  ===========================
			
			$scope.printStringEndFn = function(str, type){
				var temp_str = '----------------------------------';
				if(type != 0 && str.indexOf(temp_str) > -1){
					str = str.substr(0, str.indexOf(temp_str) + temp_str.length);
					str = str + '\n\n温馨提示：缴费失败但已扣费，请联系工作人员人工处理。\n此凭条清妥善保管';
				}
				return str;
			}
			
			
			//  =========================  / 打印失败凭条内容处理  ===========================
			
			
			
			//  =========================  硬件初始化  =============================
			//   硬件初始化完成回调
			terminal_device.device.cb_onInit = function(res){
				//  log
				window.terminal && window.terminal.WriteLog('硬件初始化完成回调:' + JSON.stringify(res));
				//   自助机登录
				$scope.getDeviceInfo(res.LoaclName1, res.LoaclMAC1);
				//   硬件信息
				var temp_bol = false;
				var temp_msg = '';
				for (var i in res.HDlist1){
					if (res.HDlist1[i].RunStatus1 == 'OFF'){
						temp_bol = true;
						temp_msg = temp_msg + res.HDlist1[i].HardwareDriverError1 + '<br>';
					}
				}
				if(temp_bol){
					//   显示错误弹窗
					// $scope.modelOpenPrintError(temp_msg);
					$scope.systemError(temp_msg);
				}
				
			}

			//   硬件状态变化回调
			terminal_device.device.cb_onChange = function (res) {
				//   自助机登录
				//  $scope.getDeviceInfo(res.LoaclName1, res.LoaclMAC1);
			}
			
			//   硬件
			
			//   是否是自助机
			$scope.isDevice = false;
			if(window.terminal){
				$scope.isDevice = true;
			}
			//  =========================  / 硬件初始化  =============================
			
			
			
			
			//  =========================  提示音  =============================
			$scope.audio_list = {
				//   是否为返回
				is_locationBk: true,
				
//				audio:[
//					{"id":"audio_001","name":"请选择您要办理的业务","src":"img/mp3/请选择您要办理的业务.ogg"},
//					{"id":"audio_002","name":"请插入您的诊疗卡","src":"img/mp3/请插入您的诊疗卡.ogg"},
//					{"id":"audio_003","name":"请将您的身份证放到对应区域以便读取您的证件信息","src":"img/mp3/请将您的身份证放到对应区域以便读取您的证件信息.ogg"},
//					{"id":"audio_004","name":"请选择您要挂号的科室","src":"img/mp3/请选择您要挂号的科室.ogg"},
//					{"id":"audio_005","name":"请选择您要预约的日期","src":"img/mp3/请选择您要预约的日期.ogg"},
//					{"id":"audio_006","name":"请确认您要办理的业务","src":"img/mp3/请确认您要办理的业务.ogg"},
//					{"id":"audio_007","name":"请投币，本机只接收100元面额纸币","src":"img/mp3/请投币，本机只接收100元面额纸币.ogg"},
//					{"id":"audio_008","name":"系统正在处理中，请稍候","src":"img/mp3/系统正在处理中，请稍候.ogg"},
//					{"id":"audio_009","name":"请取走您的凭条","src":"img/mp3/请取走您的凭条.ogg"},
//					{"id":"audio_010","name":"请取走您的诊疗卡","src":"img/mp3/请取走您的诊疗卡.ogg"},
//					{"id":"audio_011","name":"非常抱歉，系统发生故障，请移步到其他终端或到窗口办理","src":"img/mp3/非常抱歉，系统发生故障，请移步到其他终端或到窗口办理.ogg"},
//					{"id":"audio_012","name":"请选择您要挂号的专科名称","src":"img/mp3/请选择您要挂号的专科名称.ogg"},
//					{"id":"audio_013","name":"业务处理成功，请取走您的凭条","src":"img/mp3/业务处理成功，请取走您的凭条.ogg"},
//					{"id":"audio_014","name":"请将您的银行卡插入银联读卡器","src":"img/mp3/请将您的银行卡插入银联读卡器.ogg"},
//					{ "id": "audio_015", "name": "请确认您要待缴费的内容", "src":"img/mp3/请确认您要待缴费的内容.ogg"},
//					{ "id": "audio_016", "name": "请选择您要挂号的医生", "src":"img/mp3/请选择您要挂号的医生.ogg"},
//					{ "id": "audio_017", "name": "请取走您的银行卡", "src":"img/mp3/请取走您的银行卡.ogg"},
//					{ "id": "audio_018", "name": "请选择您要查询的日期", "src":"img/mp3/请选择您要查询的日期.ogg"},
//					{ "id": "audio_019", "name": "请选择您要挂号的时间段", "src":"img/mp3/请选择您要挂号的时间段.ogg"},
//					{ "id": "audio_020", "name": "请选择支付方式", "src":"img/mp3/请选择支付方式.ogg"},
//					{ "id": "audio_021", "name": "请插入您的银行卡", "src":"img/mp3/请插入您的银行卡.ogg"},
//					{ "id": "audio_022", "name": "请点击缴费按钮进行缴费", "src":"img/mp3/请点击缴费按钮进行缴费.ogg"},
//					{ "id": "audio_023", "name": "请取走您的诊疗卡，祝您早日康复", "src":"img/mp3/请取走您的诊疗卡，祝您早日康复.ogg"},
//					{ "id": "audio_024", "name": "请选择缴费的处方", "src":"img/mp3/请选择缴费的处方.ogg"},
//					{ "id": "audio_025", "name": "请选择取药的处方", "src":"img/mp3/请选择取药的处方.ogg"},
//				],
				//  播放
				play:function(dom_id){
					if(!$scope.audio_list.is_locationBk){
						return false;
					}
					//
					$scope.audio_list.stop();
					//
					if(dom_id && $('#' + dom_id)[0]){
						$('#' + dom_id)[0].play();
					}
				},
				//  暂停
				pause:function(dom_id){
					if(dom_id){$('#' + dom_id)[0].pause();}
				},
				//  停止
				stop:function(dom_id){
					if(dom_id){$('#' + dom_id)[0].pause();}
					if(dom_id){$('#' + dom_id)[0].currentTime = 0.0;}
				},
				//  全部停止
				allStop:function(){
					//$('ul[audio-list] audio').each(function(){
					$('#audio_list audio').each(function(){
						this.pause();
						this.currentTime = 0.0;
					});
				}
			};
			//  =========================  /提示音  =============================
			

			//  ========================= 定时器 =============================
			$scope.setglobaldata = {
				timedatalist: [], //定时器数组
				timer: { //定时器模板对象
					interval: null,
					Key: "", //定义的名称
					keyctrl: "", //定义所属的控制器
					fnStopAutoRefresh: function() {}, //定义开关的关闭
					fnAutoRefresh: function() {}, //定义开关的打开
					fnStopAutoRefreshfn: function(tm, fn) {
						tm.fnStopAutoRefresh();
					}, //定义开关的关闭方法
					fnAutoRefreshfn: function(tm) {
						if(tm.keyctrl != $state.current.name) {
							tm.fnStopAutoRefresh();
						} else {
							if(tm.interval == null) {
								tm.fnAutoRefresh();
							}
						}
					}
				},
				addtimer: function(t) { //将数据加入到定时器数组
					var isadd = true;
					for(var i = 0; i < $scope.setglobaldata.timedatalist.length; i++) {
						if($scope.setglobaldata.timedatalist[i].Key == t.key) {
							$scope.setglobaldata.timedatalist[i].fnStopAutoRefresh(); //先关闭定时器
							$scope.setglobaldata.timedatalist.splice(i, 1); //移除对象
						}
					}
					if(isadd) {
						$scope.setglobaldata.timedatalist.push(t);
					}
				},
				gettimer: function(key) { //获取对象
					var temp_timer = null;
					for(var i = 0; i < $scope.setglobaldata.timedatalist.length; i++) {
						if($scope.setglobaldata.timedatalist[i].Key == key) {
							//temp_timer = $scope.setglobaldata.timedatalist[i];
							$scope.setglobaldata.timedatalist[i].fnStopAutoRefresh(); //先关闭定时器
							$scope.setglobaldata.timedatalist.splice(i, 1); //移除对象
							break;
						}
					}
					//return temp_timer ? temp_timer : angular.copy($scope.setglobaldata.timer);
					return angular.copy($scope.setglobaldata.timer);
				}
			};
			//console.log($state.current.name);
			//   监听离开页面取消定时器
			$rootScope.$on('$stateChangeSuccess',
				function(event, toState, toParams, fromState, fromParams) {
					for(var indextm = 0; indextm < $scope.setglobaldata.timedatalist.length; indextm++) {
						if($scope.setglobaldata.timedatalist[indextm].keyctrl == toState.name) {
							$scope.setglobaldata.timedatalist[indextm].fnAutoRefresh();
						} else {
							$scope.setglobaldata.timedatalist[indextm].fnStopAutoRefresh();
						}
					}
					//   停止语音
					$scope.audio_list.allStop();
					
					//  自动退银行卡
					if(
						//   预约挂号
						(fromState.name == 'app.reservation.restime.department.transit.registered.docinfo.dep' && toState.name != 'app.reservation.restime.department.transit.registered.docinfo.dep')
						//   当班挂号
						|| (fromState.name == 'app.card.department.registered.docinfo.dep' && toState.name != 'app.card.department.registered.docinfo.dep')
						//   门诊缴费
						|| (fromState.name == 'app.clinic' && toState.name != 'app.clinic')
						//   门诊缴费 - 详情
						|| (fromState.name == 'app.clinic.info' && toState.name != 'app.clinic.info')
					){
						console.log('离开预约挂号自动退卡');
						//  银行卡退卡
						$scope.bankOutCard();
					}
					
					//   路由是否为返回跳转 返回时控制不播放声音
					if(fromState.name != 'app.index' && (fromState.name.length > toState.name.length)){
						$scope.audio_list.is_locationBk = false;
					}else{
						$scope.audio_list.is_locationBk = true;
					}

					//   关闭未点击关闭日期选择窗
					$(".layui-laydate").remove();
					
				}
			);
			//  ========================= /定时器 =============================

			//   run
			var run = function() {
				//   取nav菜单
				//$scope.getNav();
				//   取设备信息
				$scope.getDeviceInfo();
				//   取服务器时间
				getServerTime();
				//   硬件初始触发
				window.terminal && window.terminal.WEBJSInit('');
			}
			run();

		}
	]);