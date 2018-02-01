'use strict';


//     .net 回调函数
var terminal_device = {
	//   硬件初始化回调
	device:{
		//  初始化
		cb_onInit: null,
		//  硬件状态变化
		cb_onChange: null,

	},
	//   进退卡
	in_out_card:{
		//  插入卡回调   string: loadding
		cb_in_card:null,
		//  插入卡完成回调  json string: str
		cb_in_ok_card:null,
		//  退卡完成加调  string: 状态码
		cb_out_ok_card:null
	},
	
	//   build_card  建卡挂号
	build_card:{
		//  身份证回调  
		cb_id:null,
		//  充值现金回调 
		cb_money:null,
		//  关闭充值现金回调 
		cb_money_close:null,
		//  银行交易 充正回调
		cb_money_filling:null,
		//  建卡成功回调  null
		cb_card:null
	},
	
	//  print  凭条打印机关
	print_receipt:{
		//   开始打印凭条
		//  print_start:null,
		//   打印凭条回调
		cb_print_receipt:null,
	},
	
	//   取药机回调
	medicine:{
		cb_medicine:null,
	},
	//   住院清单打印
	print_hospital:{
		//  住院总清单
		cb_print_all_hospital:null,
	}
	
	
}


