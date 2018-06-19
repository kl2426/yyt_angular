/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:39:01 
 * @Last Modified by: wu
 * @Last Modified time: 2018-06-02 10:13:18
 */
'use strict';

/* Controllers */

angular.module('app')
	.controller('AppCtrl', ['$scope', '$translate', '$localStorage', '$window', 'opCookie', 'httpService', 'globalFn', '$interval', '$state', '$rootScope', '$modal', '$timeout', '$filter',
		function($scope, $translate, $localStorage, $window, opCookie, httpService, globalFn, $interval, $state, $rootScope, $modal, $timeout, $filter) {
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
				//   机器状态信息
				device_status: null,
				//   用户登录信息
				user_info: null,
				//   维护人员数据
				admin_info: null,
				//   服务器时间
				server_time: 1507615982000,
				server_time_week: '星期一'
			};

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
			//						}, function() {
			//							$scope.authError = 'Server Error';
			//						});
			//				}
			//			}

			//   取设备信息
			$scope.getDeviceInfo = function(terminalNo, mac) {
				//
				httpService.ajaxPost(httpService.API.href + '/api/yyt/auth/login', {
						'terminalNo': terminalNo,
						'mac': mac
					})
					.then(function(res) {
						if(res.succeed) {
							//  登录成功 加入cookie
							opCookie.setCookie('access_token', res.data.accessToken, 30 * 24 * 60 * 60);
							opCookie.setCookie('refresh_token', res.data.refreshToken, 30 * 24 * 60 * 60);
							//
							$scope.app.device_info = res.data;
							//   应用权限
							for(var i in $scope.routerMenuArr) {
								var temp_bol = true;
								for(var b in res.data.userRights) {
									if(i == res.data.userRights[b].menuCode) {
										$scope.routerMenuArr[i].hasMenu = true;
										temp_bol = false;
										break;
									}
								}
								if(temp_bol) {
									//  未找到 设置无权限
									$scope.routerMenuArr[i].hasMenu = false;
								}
							}
						} else {
							//   请除cookie
							opCookie.clearCookie('access_token');
							opCookie.clearCookie('refresh_token');
							//   错误提示
						}
					});
			};

			//  路由权限表  用于菜单是否显示
			$scope.routerMenuArr = {
				'app.card': {
					hasMenu: false
				},
				'app.card.id': {
					hasMenu: false
				},
				'app.card.department': {
					hasMenu: false
				},
				'app.card.department.registered': {
					hasMenu: false
				},
				'app.card.department.registered.docinfo': {
					hasMenu: false
				},
				'app.card.department.registered.docinfo.dep': {
					hasMenu: false
				},
				'app.card.book': {
					hasMenu: false
				},
				//
				'app.recharge': {
					hasMenu: false
				},
				'app.recharge.recharge': {
					hasMenu: false
				},
				'app.recharge.recharge.money': {
					hasMenu: false
				},
				'app.recharge.recharge.card': {
					hasMenu: false
				},
				'app.recharge.recharge.weixin': {
					hasMenu: false
				},
				'app.recharge.payment': {
					hasMenu: false
				},
				'app.recharge.payment.pay': {
					hasMenu: false
				},
				//
				'app.reservation': {
					hasMenu: false
				},
				'app.reservation.restime': {
					hasMenu: false
				},
				'app.reservation.restime.department': {
					hasMenu: false
				},
				'app.reservation.restime.department.transit': {
					hasMenu: false
				},
				'app.reservation.restime.department.transit.registered': {
					hasMenu: false
				},
				'app.reservation.restime.department.transit.registered.docinfo': {
					hasMenu: false
				},
				'app.reservation.restime.department.transit.registered.docinfo.dep': {
					hasMenu: false
				},
				'app.reservation.take': {
					hasMenu: false
				},
				'app.reservation.department': {
					hasMenu: false
				},
				'app.reservation.cancel': {
					hasMenu: false
				},
				//
				'app.clinic': {
					hasMenu: false
				},
				'app.clinic.info': {
					hasMenu: false
				},
				//
				'app.hospital': {
					hasMenu: false
				},
				'app.hospital.day': {
					hasMenu: false
				},
				'app.hospital.total': {
					hasMenu: false
				},
				//
				'app.assay': {
					hasMenu: false
				},
				'app.assay.info': {
					hasMenu: false
				},
				//
				'app.medicine': {
					hasMenu: false
				},
				'app.feeslist': {
					hasMenu: false
				},
				//
				'app.networkpayment': {
					hasMenu: false
				},

				//   住院预交金充值 银行卡充值 按钮
				'app.recharge.recharge.btn1': {
					hasMenu: false
				},
				//   住院预交金充值 现金充值 按钮
				'app.recharge.recharge.btn2': {
					hasMenu: false
				},

				//   住院总清单打印 按钮
				'app.hospital.total.info.btn1': {
					hasMenu: false
				}

			};

			//   点击跳转路由
			$scope.openSref = function(router_str) {
				//
				if($scope.app.user_info && $scope.app.user_info.card_no) {
					//   已插卡
					$state.go(router_str);
				} else {
					//   未插卡
					//   打开插卡弹窗
					$scope.openInCard();
				}

			};

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
			};

			//   返回上一级
			$scope.locationBk = function(str) {
				var route = $state.current.name;
				var route_url = route.substr(0, route.lastIndexOf('.'));
				if(str) {
					route_url = str;
				}
				$state.go(route_url == 'app' ? 'app.index' : route_url, {}, {
					reload: true
				});
			};

			// ========================================  插卡退卡   ============================================
			//   打开读卡器端口
			$scope.openCardCom = function() {
				//  alert('打开端口')
				window.terminal && window.terminal.OpenTreatmentCard();
			};

			//   读诊疗卡
			$scope.readCard = function() {
				window.terminal && window.terminal.ReadTreatmentCard();
			};

			//   卡号取用户信息
			$scope.getUserInfo = function(card_no) {
				httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/patient/' + card_no)
					.then(function(res) {
						if(res.succeed) {
							//   写用户信息
							var user_info = res.data.item;
							user_info.card_no = card_no;
							$scope.app.user_info = user_info;
							// 去患者姓名前后空格
							$scope.app.user_info.PatName = $.trim($scope.app.user_info.PatName);
							//   关闭提示弹窗
							if($scope.openInCard_modalInstance) {
								$scope.openInCard_modalInstance.close(true);
							}
							//   如果是首页 且没有打开维护 打开 开启自动退卡定时器
							if ($state.current.name == "app.index" && !$scope.show_maintain){
								//   自动退诊疗卡
								tm.fnStopAutoRefreshfn(tm);
								$scope.countdown_time = 30;
								tm.fnAutoRefreshfn(tm);
							}

						} else {
							$scope.outCard();
							$scope.app.user_info = null;
						}
					});
			};

			//   读卡回调
			//   插卡完成回调 写用户信息
			terminal_device.in_out_card.cb_in_ok_card = function(res_Status, res_str) {
				// log
				window.terminal && window.terminal.WriteLog('硬件：插卡完成回调 ' + ' res_Status:' + JSON.stringify(res_Status) + ' res_str:' + JSON.stringify(res_str));
				//  关插卡灯
				window.terminal && window.terminal.JSCloseTwinkleLED('6');
				if(res_Status == '0') {
					//  读卡成功
					//  调用用户信息
					$scope.getUserInfo(res_str);
				} else {
					//  读卡失败
					//  alert('读卡失败');
				}
			};

			//   点击退卡
			$scope.outCard = function() {
				//   停止定时器 - 自动退诊疗卡
				tm.fnStopAutoRefreshfn(tm);
				//   硬件退卡
				//	诊疗卡
				window.terminal && window.terminal.CloseTreatmentCard();
				//	社保卡
				window.terminal && window.terminal.CloseSocialSecurityCard();
				//   清空用户信息返回首页
				$scope.app.user_info = null;
				$scope.locationBk('app.index');
				//
				//   停止语音
				$scope.audio_list.allStop();
				//
				$scope.audio_list.play('audio_033');
			};

			//   诊疗卡退卡 无其他操作
			$scope.outCard_null = function() {
				//   硬件退卡
				window.terminal && window.terminal.CloseTreatmentCard();
			};

			//   插卡
			//   插卡弹窗句柄
			$scope.openInCard_modalInstance = null;
			//
			$scope.openInCard = function(card_no) {
				//   打开 插卡弹窗
				$scope.openInCard_modalInstance = $modal.open({
					templateUrl: 'tpl/modal/modal_in_card.html',
					controller: 'modalCardInCtrl',
					windowClass: 'g-modal-none',
					animation: false,
					backdrop: false,
					resolve: {
						items: function() {
							return {
								'scope': $scope,
								'card_no': card_no
							};
						}
					}
				});

				$scope.openInCard_modalInstance.result.then(function(selectedItem) {
					//   返回首页
					//  关插卡灯
					window.terminal && window.terminal.JSCloseTwinkleLED('6');

				}, function() {

				});
			};

			//   银行卡点击退卡
			//   银行卡退卡
			$scope.bankOutCard = function() {
				window.terminal && window.terminal.CloseBankModel();
			};

			// ========================================  /插卡退卡   ============================================

			//   系统错误
			$scope.systemError = function(str) {

				//   打开 退卡弹窗
				var modalInstance = $modal.open({
					templateUrl: 'tpl/modal/modal_error.html',
					controller: 'modalErrorCtrl',
					windowClass: 'g-modal-none',
					animation: false,
					backdrop: false,
					resolve: {
						items: function() {
							return {
								'scope': $scope,
								'key': 'modalErrorCtrl',
								'keyctrl': 'app.index',
								'msg': str
							};
						}
					}
				});

				modalInstance.result.then(function(selectedItem) {
					//   返回首页
					//$scope.locationBk('app.index');
				}, function() {

				});

			};
			//   run 系统错误
			//$scope.systemError();

			//  =========================  维护界面等  =============================
			//   点击10下打开维护人员登录界面
			$scope.maintain = {
				//
				tm: null,
				//   计数器
				number: 10,
				//   点击
				click: function(nb) {
					$scope.maintain.number = $scope.maintain.number - 1;
					$timeout.cancel($scope.maintain.tm);
					if(nb == 0) {
						$scope.ModalMaintainOpen();
					}
					$scope.maintain.tm = $timeout(function() {
						$scope.maintain.number = 10;
					}, 1500);
				}
			};
			//   打开维护界面
			$scope.ModalMaintainOpen = function() {
				//  停止首页自动退卡
				$scope.index_tm.fnStopAutoRefreshfn($scope.index_tm);
				$scope.show_maintain = true;
				//
				var modalInstance = $modal.open({
					templateUrl: 'tpl/maintain/modal-login.html',
					controller: 'modalMaintainLoginCtrl',
					windowClass: 'g-modal-none m-modal-maintain',
					animation: false,
					backdrop: false,
					resolve: {
						items: function() {
							return {
								'scope': $scope
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

			//  =========================  / 维护界面等  =============================

			//  =========================  银行支付遮罩层  =============================
			//   关闭
			$scope.modelClosePay = null;

			//   打开
			$scope.modelOpenPay = function() {
				$scope.modelClosePay = $modal.open({
					templateUrl: 'tpl/modal/modal_pay.html',
					controller: 'modalPayCtrl',
					windowClass: 'g-modal-none m-modal-pay',
					animation: false,
					backdrop: false,
					resolve: {
						items: function() {
							return {
								'scope': $scope
							};
						}
					}
				});
			};

			//  =========================  / 银行支付遮罩层  ===========================

			//  =========================  打印机无纸弹窗  =============================
			$scope.modelClosePrintError = null;

			//   打开
			$scope.modelOpenPrintError = function(res_str) {
				$scope.modelClosePrintError = $modal.open({
					templateUrl: 'tpl/modal/modal_print_error.html',
					controller: 'modalPrintErrorCtrl',
					windowClass: 'g-modal-none m-modal-print-error',
					animation: false,
					backdrop: false,
					resolve: {
						items: function() {
							return {
								'scope': $scope,
								'msg': res_str
							};
						}
					}
				});
			};

			// $scope.modelOpenPrintError('凭条打印机无纸请与工作人员联系');

			//  =========================  / 打印机无纸弹窗  ===========================

			//  =========================  打印失败凭条内容处理  ===========================

			$scope.printStringEndFn = function(str, type) {
				var temp_str = '----------------------------------';
				if(type != 0 && str.indexOf(temp_str) > -1) {
					str = str.substr(0, str.indexOf(temp_str) + temp_str.length);
					str = str + '\n\n温馨提示：缴费失败但已扣费，请联系工作人员人工处理。\n此凭条清妥善保管';
				}
				return str;
			};

			//  =========================  / 打印失败凭条内容处理  ===========================

			//  =========================  硬件初始化  =============================
			//   硬件初始化完成回调
			terminal_device.device.cb_onInit = function(res) {
				//  log
				window.terminal && window.terminal.WriteLog('硬件初始化完成回调:' + JSON.stringify(res));
				//  设备状态
				$scope.app.device_status = res;
				//   自助机登录
				$scope.getDeviceInfo(res.LoaclName1, res.LoaclMAC1);
				//   硬件信息
				var temp_bol = false;
				var temp_msg = '';
				for(var i in res.HDlist1) {
					temp_msg = temp_msg + res.HDlist1[i].HardwareDriverError1 + '<br>';
					if(res.HDlist1[i].RunStatus1 == 'OFF') {
						temp_bol = true;
					}
				}
				if(temp_bol) {
					//   显示错误弹窗
					$scope.modelOpenPrintError(temp_msg);
				}

				//   上报硬件信息
				//   由于要登录自助机所以 延迟提交
				$timeout(function() {
					for(var i in res.HDlist1) {
						upTerStatus(res.HDlist1[i]);
					}
				}, 10000);

			};

			//   硬件状态变化回调
			terminal_device.device.cb_onChange = function(res) {
				//  log
				window.terminal && window.terminal.WriteLog('硬件状态变化回调:' + JSON.stringify(res));
				//  设备状态
				$scope.app.device_status = res;
				//   自助机登录
				//  $scope.getDeviceInfo(res.LoaclName1, res.LoaclMAC1);
			};

			//   硬件状态上报
			//   0：终端机 1:凭条打印机 2:报告单打印机 3:密钥键盘 4:身份证读卡器 5:诊疗卡读卡器 6:银行卡读卡器 7:灯条 8:钱箱 9:条码扫描 10:诊疗卡发卡器
			var upTerStatus = function(item) {
				//   设备确定
				var temp_device = '';
				switch(item.HardwareDriverType1) {
					case 'null0':
						temp_device = 0;
						break;
					case 'PrintReceipt':
						temp_device = 1;
						break;
					case 'Winspool':
						temp_device = 2;
						break;
					case 'null3':
						temp_device = 3;
						break;
					case 'CVRAPI':
						temp_device = 4;
						break;
					case 'TreatmentCard':
						temp_device = 5;
						break;
					case 'CSBank':
						temp_device = 6;
						break;
					case 'LEDAPI':
						temp_device = 7;
						break;
					case 'OpenCash':
						temp_device = 8;
						break;
					case 'null9':
						temp_device = 9;
						break;
					case 'TreatmentCardCreate':
						temp_device = 10;
						break;

					default:
						break;
				}
				//   硬件状态上报表单格式
				var upTerStatus_item = {
					// statusId: '',
					terminalId: $scope.app.device_info.user.terminalId,
					terminalNo: $scope.app.device_info.user.terminalNo,
					terminalName: $scope.app.device_info.user.terminalName,
					partsType: temp_device,
					partsRunStatus: item.HardwareDriverOnOrOff1,
					partsOffStatus: item.RunStatus1 == 'ON' ? 'run' : 'error',
					partsStatusNote: item.HardwareDriverError1,
					runDate: $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
				};
				//
				httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/upTerStatus', upTerStatus_item)
					.then(function(res) {
						//
						if(res.succeed) {
							//
						} else {
							//
						}
					});
			};

			//   硬件

			//   是否是自助机
			$scope.isDevice = false;
			if(window.terminal) {
				$scope.isDevice = true;
			}
			//  =========================  / 硬件初始化  =============================

			//  =========================  提示音  =============================
			$scope.audio_list = {
				//   是否为返回
				is_locationBk: true,
				//  播放
				play: function(dom_id) {
					if(!$scope.audio_list.is_locationBk) {
						return false;
					}
					//
					$scope.audio_list.stop();
					//
					if(dom_id && $('#' + dom_id)[0]) {
						$('#' + dom_id)[0].play();
					}
				},
				//  暂停
				pause: function(dom_id) {
					if(dom_id) {
						$('#' + dom_id)[0].pause();
					}
				},
				//  停止
				stop: function(dom_id) {
					if(dom_id) {
						$('#' + dom_id)[0].pause();
					}
					if(dom_id) {
						$('#' + dom_id)[0].currentTime = 0.0;
					}
				},
				//  全部停止
				allStop: function() {
					$('#audio_list audio').each(function() {
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
						||
						(fromState.name == 'app.card.department.registered.docinfo.dep' && toState.name != 'app.card.department.registered.docinfo.dep')
						//   门诊缴费
						||
						(fromState.name == 'app.clinic' && toState.name != 'app.clinic')
						//   门诊缴费 - 详情
						||
						(fromState.name == 'app.clinic.info' && toState.name != 'app.clinic.info')
						//   住院缴费
						||
						(fromState.name == 'app.recharge.recharge' && toState.name != 'app.recharge.recharge')
					) {
						//  银行卡退卡
						$scope.bankOutCard();
						//  银行卡关灯
						window.terminal && window.terminal.JSCloseTwinkleLED('4');
					}

					//   路由是否为返回跳转 返回时控制不播放声音
					if(fromState.name != 'app.index' && (fromState.name.length > toState.name.length)) {
						$scope.audio_list.is_locationBk = false;
					} else {
						$scope.audio_list.is_locationBk = true;
					}

					//   关闭未点击关闭日期选择窗
					$(".layui-laydate").remove();

				}
			);
			//  ========================= /定时器 =============================



			//   当前页面返回秒数
			$scope.countdown_time = 30;

			//开始定义定时器
			var tm = $scope.setglobaldata.gettimer("indexCtrl");
			if (tm.Key != "indexCtrl") {
				tm.Key = "indexCtrl";
				tm.keyctrl = "app.index";
				tm.fnAutoRefresh = function () {
					console.log("开始调用定时器");
					if (!($scope.app.user_info && $scope.app.user_info.card_no))return;
					tm.interval = $interval(function () {
						if ($scope.countdown_time > 0) {
							$scope.countdown_time = $scope.countdown_time - 1;
						} else {
							$interval.cancel(tm.interval);
							tm.interval = null;
							//   退卡
							$scope.outCard();
						}
					}, 1000);
				};
				tm.fnStopAutoRefresh = function () {
					$scope.countdown_time = 30;
					console.log("进入取消方法");
					if (tm.interval != null) {
						$interval.cancel(tm.interval);
						tm.interval = null;
						console.log("进入取消成功");
					}
					tm.interval = null;
				};
				$scope.setglobaldata.addtimer(tm);
			}
			//结束定义定时器

			tm.fnAutoRefreshfn(tm);
			//
			$scope.index_tm = tm;
			//   是否打开维护界面   true 打开  false 未打开
			$scope.show_maintain = false;


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
			};

			run();

		}
	]);