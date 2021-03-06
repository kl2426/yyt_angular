/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:38:52 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-08 14:16:10
 */
'use strict';

/**
 * Config for the router
 */
angular.module('app')
	.run(
		['$rootScope', '$state', '$stateParams',
			function($rootScope, $state, $stateParams) {
				$rootScope.$state = $state;
				$rootScope.$stateParams = $stateParams;
			}
		]
	)
	.config(
		['$stateProvider', '$urlRouterProvider',
			function($stateProvider, $urlRouterProvider) {

				$urlRouterProvider
					.otherwise('/app/index');
				$stateProvider
					.state('app', {
						abstract: true,
						url: '/app',
						templateUrl: 'tpl/app.html',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									//return $ocLazyLoad.load(['js/controllers/modal/modal.js']);
								}
							]
						}
					})
					.state('app.index', {
						url: '/index',
						templateUrl: 'tpl/index/index.html',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									//return $ocLazyLoad.load(['js/controllers/modal/modal.js']);
								}
							]
						}
					})

					//  =======================建卡/挂号==============================
					//   建卡/挂号
					.state('app.card', {
						url: '/card',
						templateUrl: 'tpl/card/index.html',
						controller: 'cardCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/card/index.js']);
								}
							]
						}
					})

					//   身份证建卡
					.state('app.card.id', {
						url: '/id',
						templateUrl: 'tpl/card/id/index.html',
						controller: 'cardIdCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/card/id/index.js']);
								}
							]
						}
					})

					//   挂号 选择科室
					.state('app.card.department', {
						url: '/department',
						templateUrl: 'tpl/card/department/index.html',
						controller: 'cardDepartmentCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/card/department/index.js']);
								}
							]
						}
					})

					//   挂号 选择医生
					.state('app.card.department.registered', {
						url: '/registered',
						templateUrl: 'tpl/card/department/registered/index.html',
						controller: 'cardDepartmentRegisteredCtrl',
						params: {
							'deptCode': '',
							'deptName': '',
							'deptArea': ''
						},
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/card/department/registered/index.js']);
								}
							]
						}
					})

					//   挂号 医生排班
					.state('app.card.department.registered.docinfo', {
						url: '/docinfo',
						templateUrl: 'tpl/card/department/registered/docinfo/index.html',
						controller: 'cardDepartmentRegisteredDocinfoCtrl',
						params: {
							'deptName': '',
							'doct_name': '',
							'deptCode': '',
							'doctorCode': ''
						},
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/card/department/registered/docinfo/index.js']);
								}
							]
						}
					})

					//   挂号 确认挂号
					.state('app.card.department.registered.docinfo.dep', {
						url: '/dep',
						templateUrl: 'tpl/card/department/registered/docinfo/dep/index.html',
						controller: 'cardDepartmentRegisteredDocinfoDepCtrl',
						params: {
							'sumMoney': '',
							'am_pm': '',
							'deptName': '',
							'doct_name': '',
							'schedulingID': '',
							'clinic_time_start': '',
							'clinic_time_end': ''
						},
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/card/department/registered/docinfo/dep/index.js']);
								}
							]
						}
					})

					//   购买病历本
					.state('app.card.book', {
						url: '/book',
						templateUrl: 'tpl/card/book/index.html',
						controller: 'cardBookCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/card/book/index.js']);
								}
							]
						}
					})

					//  =======================   / 建卡/挂号  ==========================

					//  =======================   缴费  ==========================

					//   缴费/充值
					.state('app.recharge', {
						url: '/recharge',
						templateUrl: 'tpl/recharge/index.html',
						controller: 'rechargeCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/recharge/index.js']);
								}
							]
						}
					})

					//   充值
					.state('app.recharge.recharge', {
						url: '/recharge',
						templateUrl: 'tpl/recharge/recharge/index.html',
						controller: 'rechargeRechargeCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/recharge/recharge/index.js']);
								}
							]
						}
					})

					//   现金充值
					.state('app.recharge.recharge.money', {
						url: '/money',
						templateUrl: 'tpl/recharge/recharge/money/index.html',
						controller: 'rechargeRechargeMoneyCtrl'
					})

					//   银行卡充值
					.state('app.recharge.recharge.card', {
						url: '/card',
						templateUrl: 'tpl/recharge/recharge/card/index.html',
						controller: 'rechargeRechargeCardCtrl'
					})
					//   手机充值
					.state('app.recharge.recharge.weixin', {
						url: '/weixin',
						templateUrl: 'tpl/recharge/recharge/weixin/index.html',
						controller: 'rechargeRechargeWeixinCtrl'
					})

					//   缴费
					.state('app.recharge.payment', {
						url: '/payment',
						templateUrl: 'tpl/recharge/payment/index.html',
						controller: 'rechargePaymentCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/recharge/payment/index.js']);
								}
							]
						}
					})
					//   缴费 - 支付
					.state('app.recharge.payment.pay', {
						url: '/pay',
						templateUrl: 'tpl/recharge/payment/pay/index.html',
						controller: 'rechargePaymentPayCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/recharge/payment/pay/index.js']);
								}
							]
						}
					})

					//  =======================  / 缴费  ==========================

					//  =======================   预约  ==========================
					//   预约
					.state('app.reservation', {
						url: '/reservation',
						templateUrl: 'tpl/reservation/index.html',
						controller: 'reservationCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/reservation/index.js']);
								}
							]
						}
					})

					//   预约挂号时间哪天
					.state('app.reservation.restime', {
						url: '/restime',
						templateUrl: 'tpl/reservation/restime/index.html',
						controller: 'reservationRestimeCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/reservation/restime/index.js']);
								}
							]
						}
					})

					//   预约挂号 - 一级科室
					.state('app.reservation.restime.department', {
						url: '/department',
						templateUrl: 'tpl/reservation/restime/department/index.html',
						controller: 'reservationRestimeDepartmentCtrl',
						//   预约时间 // 星期
						params: {
							'restime': '',
							'restime_date_week': ''
						},
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/reservation/restime/department/index.js']);
								}
							]
						}
					})

					//   预约挂号 - 二级科室(专科名称)
					.state('app.reservation.restime.department.transit', {
						url: '/transit',
						templateUrl: 'tpl/reservation/restime/department/transit/index.html',
						controller: 'reservationRestimeDepartmentTransitCtrl',
						params: {
							'restime': '',
							'restime_date_week': '',
							'hosOrgCode': '',
							'topHosDeptCode': ''
						},
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/reservation/restime/department/transit/index.js']);
								}
							]
						}
					})

					//   预约挂号 - 选择医生
					.state('app.reservation.restime.department.transit.registered', {
						url: '/registered',
						templateUrl: 'tpl/reservation/restime/department/transit/registered/index.html',
						controller: 'reservationRestimeDepartmentTransitRegisteredCtrl',
						params: {
							'restime': '',
							'restime_date_week': '',
							'hosOrgCode': '',
							'hosDeptCode': ''
						},
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/reservation/restime/department/transit/registered/index.js']);
								}
							]
						}
					})

					//   预约挂号 - 医生号源
					.state('app.reservation.restime.department.transit.registered.docinfo', {
						url: '/docinfo',
						templateUrl: 'tpl/reservation/restime/department/transit/registered/docinfo/index.html',
						controller: 'reservationRestimeDepartmentTransitRegisteredDocinfoCtrl',
						params: {
							'restime': '',
							'restime_date_week': '',
							'hosOrgCode': '',
							'hosDeptCode': '',
							'hosDoctCode': ''
						},
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/reservation/restime/department/transit/registered/docinfo/index.js']);
								}
							]
						}
					})

					//   预约挂号
					.state('app.reservation.restime.department.transit.registered.docinfo.dep', {
						url: '/dep',
						templateUrl: 'tpl/reservation/restime/department/transit/registered/docinfo/dep/index.html',
						controller: 'reservationRestimeDepartmentTransitRegisteredDocinfoDepCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/reservation/restime/department/transit/registered/docinfo/dep/index.js']);
								}
							]
						}
					})

					//   预约取号
					.state('app.reservation.take', {
						url: '/take',
						templateUrl: 'tpl/reservation/take/index.html',
						controller: 'reservationTakeCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/reservation/take/index.js']);
								}
							]
						}
					})

					//   预约取号
					.state('app.reservation.cancel', {
						url: '/cancel',
						templateUrl: 'tpl/reservation/cancel/index.html',
						controller: 'reservationCancelCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/reservation/take.js']);
								}
							]
						}
					})
					
					//  网络当班挂号凭条打印 - 列表/打印
					.state('app.reservation.department', {
						url: '/department',
						templateUrl: 'tpl/reservation/department/index.html',
						controller: 'reservationDepartmentCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/reservation/department/index.js']);
								}
							]
						}
					})

					//  =======================  / 预约  ==========================

					//  =======================  门诊处方  ==========================
					//   门诊处方 - 列表
					.state('app.clinic', {
						url: '/clinic',
						templateUrl: 'tpl/clinic/index.html',
						controller: 'clinicCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/clinic/index.js']);
								}
							]
						}
					})

					//   门诊处方 - 明细
					.state('app.clinic.info', {
						url: '/info',
						templateUrl: 'tpl/clinic/info/index.html',
						controller: 'clinicInfoCtrl',
						params: {
							'PrescriptionID': '',
							'registegOrderID': '',
							'PresDT': '',
							'ExecDeptName': ''
						},
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/clinic/info/index.js']);
								}
							]
						}
					})

					//  =======================  / 门诊处方  ==========================

					//  =======================  住院清单  ==========================
					//   住院清单
					.state('app.hospital', {
						url: '/hospital',
						templateUrl: 'tpl/hospital/index.html',
						controller: 'hospitalCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/hospital/index.js']);
								}
							]
						}
					})

					//   住院清单 - 日清单
					.state('app.hospital.day', {
						url: '/day',
						templateUrl: 'tpl/hospital/day/index.html',
						controller: 'hospitalDayCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/hospital/day/index.js']);
								}
							]
						}
					})

					//   住院清单 - 总清单
					.state('app.hospital.total', {
						url: '/total',
						templateUrl: 'tpl/hospital/total/index.html',
						controller: 'hospitalTotalCtrl',
						params: {
							'status': '',
							'inp_no': '',
							'PatSex': '',
							'PatName': ''
						},
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['ui.select']).then(
										function() {
											return $ocLazyLoad.load(['js/controllers/hospital/total/index.js']);
										}
									);
								}
							]
						}
					})
					//   住院清单 - 总清单 - 详情
					.state('app.hospital.total.info', {
						url: '/info',
						templateUrl: 'tpl/hospital/total/info/index.html',
						controller: 'hospitalTotalInfoCtrl',
						params: {
							'PatientID': '',
							'Times': '',
							'InpatientNo': '',
							'inp_no': '',
							'PatSex': '',
							'PatName': ''
						},
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['ui.select']).then(
										function() {
											return $ocLazyLoad.load(['js/controllers/hospital/total/info/index.js']);
										}
									);
								}
							]
						}
					})
					//  =======================  / 住院清单  ==========================

					//  =======================  发药取号  ==========================
					//   发药取号
					.state('app.medicine', {
						url: '/medicine',
						templateUrl: 'tpl/medicine/index.html',
						controller: 'medicineCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/medicine/index.js']);
								}
							]
						}
					})

					//   发药取号
					.state('app.medicine.info', {
						url: '/info',
						templateUrl: 'tpl/medicine/info/index.html',
						controller: 'medicineInfoCtrl',
						params: {
							'PrescRecordID': ''
						},
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/medicine/info/index.js']);
								}
							]
						}
					})
					//  =======================  / 发药取号  ==========================

					//  =======================  化验单查询   ==========================
					//   门诊处方 - 列表
					.state('app.assay', {
						url: '/assay',
						templateUrl: 'tpl/assay/index.html',
						controller: 'assayCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/assay/index.js']);
								}
							]
						}
					})

					//   门诊处方 - 明细
					.state('app.assay.info', {
						url: '/info',
						templateUrl: 'tpl/assay/info/index.html',
						controller: 'assayInfoCtrl',
						params: {
							'assay_no': ''
						},
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/assay/info/index.js']);
								}
							]
						}
					})

					//  =======================  / 化验单查询  ==========================

					//  =======================  门诊费用清单   ==========================
					//   门诊费用清单 - 列表
					.state('app.feeslist', {
						url: '/feeslist',
						templateUrl: 'tpl/feeslist/index.html',
						controller: 'feeslistCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/feeslist/index.js']);
								}
							]
						}
					})

					//  =======================  / 门诊费用清单  ==========================

					//  =======================  网络凭条打印   ==========================
					//   网络凭条打印
					.state('app.networkpayment', {
						url: '/networkpayment',
						templateUrl: 'tpl/networkpayment/index.html',
						controller: 'networkpaymentCtrl',
						resolve: {
							deps: ['$ocLazyLoad',
								function($ocLazyLoad) {
									return $ocLazyLoad.load(['js/controllers/networkpayment/index.js']);
								}
							]
						}
					})

				//  =======================  / 网络凭条打印  ==========================

			}
		]
	);