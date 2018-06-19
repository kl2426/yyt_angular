/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:35:41 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-21 10:56:05
 */

'use strict';
/**
 * 住院清单   总清单
 */
app.controller('hospitalTotalCtrl', function($scope, $interval, httpService, $filter, $timeout, $stateParams) {

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
		form: {
			'inp_no': ''
		},
		//
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
	}

	//   住院次数
	var getInpatientNO = function(PatientID) {
		//
		$scope.items_loadding = true;
		//
		httpService.ajaxGet(httpService.API.href + '/api/yytBase/v1/getInpatientNO/' + PatientID)
			.then(function(res) {
				//
				$scope.items_loadding = false;
				//
				if(res.succeed) {
					if(res.data.item.__proto__.constructor == Array) {
						$scope.data.items = res.data.item;
					} else {
						$scope.data.items = [res.data.item];
					}
					//  序号
					for(var i in $scope.data.items) {
						$scope.data.items[i].index = +i + 1;
					}
					$scope.data.page.total = $scope.data.items.length;
					//  分页
					$scope.data.page.pageFn(1);

				} else {
					$scope.data.items = [];
					$scope.data.page.total = 0;
				}
			});
	}

	//  身份证登录
	$scope.statusID = function() {
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
	terminal_device.build_card.cb_id = function(obj) {
		//
		if(obj && obj.MsgCode == '1000') {
			//   性别
			if(obj.MsgStr.PeopleSex == '男') {
				$scope.PatSex = '1';
			} else if(obj.MsgStr.PeopleSex == '女') {
				$scope.PatSex = '2';
			} else {
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
		} else {
			//
			switch(obj.MsgCode) {
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
	$scope.statusCARD = function() {
		if($scope.app.user_info && $scope.app.user_info.card_no) {
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
			$scope.openInCard_modalInstance.result.then(function(selectedItem) {
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

			}, function() {
				//
			});
		}
	}

	//开始定义定时器
	var tm = $scope.setglobaldata.gettimer("hospitalTotalCtrl");
	if(tm.Key != "hospitalTotalCtrl") {
		tm.Key = "hospitalTotalCtrl";
		tm.keyctrl = "app.hospital.total";
		tm.fnAutoRefresh = function() {
			console.log("开始调用定时器");
			tm.interval = $interval(function() {
				if($scope.countdown_time > 0) {
					$scope.countdown_time = $scope.countdown_time - 1;
				} else {
					$interval.cancel(tm.interval);
					tm.interval = null;
					//$scope.countdown_time = 20;
					//   返回上一级
					$scope.locationBk();
				}
			}, 1000);
		};
		tm.fnStopAutoRefresh = function() {
			$scope.countdown_time = 60;
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

	var run = function() {
		//   停止语音
		$scope.audio_list.allStop();
		//   播放声音
		$scope.audio_list.play('audio_026');
		//
		if($stateParams.status != '') {
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
