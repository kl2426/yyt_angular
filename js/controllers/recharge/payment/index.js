/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:36:07 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-21 11:31:58
 */
'use strict';

/**
 * 缴费
 */
app.controller('rechargePaymentCtrl', function($scope, $interval) {

	//   当前页面返回秒数
	$scope.countdown_time = 6000;

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("rechargePayment");
	if(tm.Key != "rechargePayment") {
		tm.Key = "rechargePayment";
		tm.keyctrl = "app.recharge.payment";
		tm.fnAutoRefresh = function() {
			console.log("开始调用定时器");
			tm.interval = $interval(function() {
				if($scope.countdown_time > 0) {
					$scope.countdown_time = $scope.countdown_time - 1;
				} else {
					$interval.cancel(tm.interval);
					tm.interval = null;
					$scope.countdown_time = 20;
				}
			}, 1000);
		};
		tm.fnStopAutoRefresh = function() {
			$scope.countdown_time = 20;
			console.log("进入取消方法");
			if(tm.interval != null) {
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

	/**
	 * 表格1
	 */
	$scope.table_data = {
		form: {
			fucecode: "",
			fuceismenu: "",
			fucename: "",
			fuceparentcode: "0",
			ownerType: 0,
			page: 1,
			pageSize: 10,
			sortname: "a.FUCECREATETIME",
			sortorder: "desc"
		},
		//   表格数据
		table_res: {
			code: "0001",
			message: "ok",
			rows: [{
					"order": "1",
					"title": "呼吸内科1",
					"type": "专家",
					"date": "2017年10月20日 下午",
					"state": "未取号",
					checked: false
				},
				{
					"order": "1",
					"title": "呼吸内科1",
					"type": "专家",
					"date": "2017年10月20日 下午",
					"state": "未取号"
				},
				{
					"order": "1",
					"title": "呼吸内科1",
					"type": "专家",
					"date": "2017年10月20日 下午",
					"state": "未取号"
				},
				{
					"order": "1",
					"title": "呼吸内科1",
					"type": "专家",
					"date": "2017年10月20日 下午",
					"state": "未取号"
				},
				{
					"order": "1",
					"title": "呼吸内科1",
					"type": "专家",
					"date": "2017年10月20日 下午",
					"state": "未取号"
				},
			],
			total: 2,
			//
			maxSize: 5
		},
		//   翻页
		pageChanged: function() {
			//  查询
			findFunctionList($scope.table_data.form);
		},
		//   每页显示多少条
		selectChanged: function() {
			findFunctionList($scope.table_data.form);
		}
	}

});
