/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:35:49 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-08 14:12:22
 */
'use strict';

/**
 *  维护人员相关界面 - 缴费凭条补打
 */
app.controller('modalMaintainJfReceiptCtrl', function($scope, $interval, $modal, $modalInstance, items, $filter, httpService, $timeout, globalFn) {

	$scope.items = items;

	$scope.items_loadding = false;

	//  数据
	$scope.data = {
		checked_items: [],
		//
		'form': {
			'regDate': ''
		},
		'items': [],
		//   对items 数据进行分页
		'page': {
			pageIndex: 1,
			pageSize: 8,
			total: 0,
			row: [],
			//   分页初始化
			pageFn: function(index) {
				if($scope.data.page.total > (index - 1) * $scope.data.page.pageSize) {
					$scope.data.page.row = $scope.data.items.slice((index - 1) * $scope.data.page.pageSize, $scope.data.page.pageSize * index);
					$scope.data.page.pageIndex = index;
				} else {
					$scope.data.page.row = $scope.data.items.slice(0, $scope.data.page.pageSize * index);
					$scope.data.page.pageIndex = 1;
				}
			}
		}
	};

	$scope.chekced_click = function(item) {
		for(var i in $scope.data.items) {
			$scope.data.items[i].checked = false;
		}
		item.checked = !item.checked;
	};

	//   取补打数据
	var receiptList = function(inertf, value, date) {
		$scope.items_loadding = true;
		//
		var temp_obj = {
			inertf: inertf,
			value: value,
			date: date
		};

		httpService.adminAjaxPost(httpService.API.href + '/api/yytBack/v1/logprint', temp_obj)
			.then(function(res) {
				$scope.items_loadding = false;
				//
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						res.data.item = res.data.item;
					} else {
						res.data.item = [res.data.item];
					}
				}

				$scope.data.items = res.data.item;

				for(var i in $scope.data.items) {
					var temp_obj = {
						inertf: 'PrescriptionInfo',
						value: $scope.data.items[i].PrescriptionID,
						date: $scope.data.form.regDate
					};
					//   执行科室筛选	处方明细中的项目
					prescriptionInfo(temp_obj, $scope.data.items[i]);

					//	序号
					for(var i in $scope.data.items) {
						$scope.data.items[i].index = +i + 1;
					}
					//								//								
					$scope.data.page.total = $scope.data.items.length;
					//	分页
					$scope.data.page.pageFn(1);
				}
			});
	};

	//   处方明细
	var prescriptionInfo = function(temp_obj, item) {
		httpService.ajaxPost(httpService.API.href + '/api/yytBack/v1/logprint', temp_obj)
			.then(function(res) {
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						res.data.item = res.data.item;
					} else {
						res.data.item = [res.data.item];
					}
					item.res_PrescriptionID = res.data.item;
				} else {
					item.res_PrescriptionID = [];
				}
			});
	};

	/**
	 * 筛选数据  按执行科室 筛选明细凭条数据
	 * items data.items
	 * @returns array 数组
	 */
	var filter_info_items = function(data_items) {
		var items = angular.copy(data_items);
		//
		var temp_arr = [];
		//  遍历处方记录
		for(var i = 0; i < items.length; i++) {
			//  遍历明细
			var temp_obj = {};
			var items_2 = items[i].res_PrescriptionID;
			//
			for(var b = 0; b < items_2.length; b++) {
				//  加入处方信息
				items_2[b].Prescription_item = items[i];
				//
				if(items_2[b].MedicineAddress in temp_obj) {
					//   有这个执行科室了
				} else {
					temp_obj[items_2[b].MedicineAddress] = [];
				}
				//  加入相关执行科室药品明细
				temp_obj[items_2[b].MedicineAddress].push(items_2[b]);
			}
			//  解析数组
			for(var b in temp_obj) {
				//   计算明细凭条总金额
				var temp_money = 0;
				//
				for(var h = 0; h < temp_obj[b].length; h++) {
					//
					temp_money = globalFn.accAdd(temp_money, (globalFn.accMul(temp_obj[b][h].MedicineNum, temp_obj[b][h].MedicineUnitCharge)));
				}
				//   处方信息加入计算的拆分凭条金额
				for(var h = 0; h < temp_obj[b].length; h++) {
					//
					temp_obj[b][h].Prescription_item.temp_TotalFee = temp_money;
				}
				//   加入数组
				temp_arr.push(temp_obj[b]);
			}
		}
		return temp_arr;
	};

	//   补打
	$scope.outMark = function() {
		//
		var temp_item = null;
		for(var i in $scope.data.items) {
			if($scope.data.items[i].checked) {
				if($scope.data.items[i].__proto__.constructor == Array) {
					temp_item = $scope.data.items[i];
				} else {
					temp_item = [$scope.data.items[i]];
				}
				break;
			}
		}
		//   打印凭条
		if(temp_item) {
			$scope.statusFn1(temp_item);
		}
	};

	//   缴费凭条返回
	$scope.res_jfPrint = null;
	//   查询打印凭条
	var jfPrint = function(temp_obj) {
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/jfPrint', temp_obj)
			.then(function(res) {
				if(res.succeed) {
					//
					$scope.res_jfPrint = res.data;
					//	if(res.data.PrintTimes == 0) {
					//    开始打印
					window.terminal && window.terminal.PrintReceipt(res.data.print, '', '');
					//	}
				} else {
					//  提交失败
					$scope.items.scope.systemError('打印失败请与维护人员联系');
				}
			});
	};

	//   筛选后数据
	$scope.has_filter = [];

	//   缴费成功 打印凭条
	$scope.statusFn1 = function(temp_item) {
		//	执行科室筛选出	处方明细项目
		if($scope.has_filter.length < 1) {
			$scope.has_filter = filter_info_items(temp_item);
		}

		//   打印凭条
		var temp_obj = {
			cardNo: $scope.items.scope.app.user_info.card_no,
			patName: $scope.items.scope.app.user_info.PatName,
			patientID: $scope.items.scope.app.user_info.PatientID,
			yHCardNo: '',
			fPFlow: '',
			success: '成功',
			execDeptName: '',
			paymentCharge: '',
			prescRecordID: '',
			visitDate: '',
			detailed: '',
			num: ''
		};
		//
		for(var i in $scope.has_filter) {
			if($scope.has_filter[i].print_ok) {
				//  已打印
			} else {
				//  未打印
				//  执行科室
				temp_obj.execDeptName = $scope.has_filter[i][0].MedicineAddress;
				//  支付金额
				temp_obj.paymentCharge = $scope.has_filter[i][0].Prescription_item.TotalFee;
				//  处方记录ID
				temp_obj.prescRecordID = $scope.has_filter[i][0].Prescription_item.PrescriptionID;
				//  看诊时间
				temp_obj.visitDate = $scope.has_filter[i][0].Prescription_item.PresDT;
				//  加入药品明细
				var temp_detailed = angular.copy($scope.has_filter[i]);
				for(var j in temp_detailed) {
					temp_detailed[j].Prescription_item = undefined;
					temp_detailed[j].floor_name = temp_detailed[j].MedicineDirections;
				}
				temp_obj.detailed = JSON.stringify(temp_detailed);
				//  加入凭条打印次数
				temp_obj.num = +i + 1;
				//  调用打印凭条接口
				jfPrint(temp_obj);
				//  设置为已打印
				$scope.has_filter[i].print_ok = true;
				//  退出循环
				break;
			}
		}
		//
		//	$scope.has_filter = [];
	};

	//   凭条打印更新 打印结果上传
	var printLog = function() {
		// log
		window.terminal && window.terminal.WriteLog('res 门诊缴费(凭条补打) /api/yytMace/v1/printLog:' + JSON.stringify({
			lid: $scope.res_jfPrint.lid
		}));
		//
		httpService.ajaxPost(httpService.API.href + '/api/yytMace/v1/printLog', {
				lid: $scope.res_jfPrint.lid,
				type: $scope.bankCorrectStatus == 0 ? 1 : 0
			})
			.then(function(res) {
				// log
				window.terminal && window.terminal.WriteLog('res 门诊缴费(凭条补打) /api/yytMace/v1/printLog:' + JSON.stringify(res));
			});
	};

	//   打印完成回调
	terminal_device.print_receipt.cb_print_receipt = function(res_Status, res_str) {
		if(res_Status == '0') {
			//  正常打印  设置
			//  灯光提示
			window.terminal && window.terminal.JSOpenTwinkleLED('1');
			//  5秒关闭
			$timeout(function() {
				window.terminal && window.terminal.JSCloseTwinkleLED('1');
			}, 5000);

			//  继续打印 下一条
			$scope.statusFn1();
			//  调用凭条打印更新
			printLog();
		} else if(res_Status == '99') {
			//   打开打印错误弹窗
			$scope.items.scope.systemError(res_str);
		} else {
			//  打印异常
			//  提交失败
			$scope.items.scope.systemError(res_str);
		}
	};

	//
	$scope.ok = function() {
		$modalInstance.close('ok');
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

	//
	$scope.bhc = function() {
		$scope.data.items = [];
		$scope.data.page.row = [];
		$scope.data.page.total = 0;
		receiptList('GetOutPatientPres', $scope.items.scope.app.user_info.card_no, $scope.data.form.regDate);
	};

	//  run
	var run = function() {
		//
		var regDate = $filter('date')(new Date(), 'yyyy-MM-dd');
		$scope.data.form.regDate = regDate;
		//
		$scope.bhc();
	};

	run();
});