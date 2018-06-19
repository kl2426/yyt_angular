/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:38:16 
 * @Last Modified by: wu
 * @Last Modified time: 2018-03-09 16:17:55
 */

/**
 * md5
 */

angular.module('app').service('Md5', function() {
	var hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase        */
	var b64pad = ""; /* base-64 pad character. "=" for strict RFC compliance   */
	var chrsz = 8; /* bits per input character. 8 - ASCII; 16 - Unicode      */
	/**
	 * 供外部调用的方法
	 */
	this.hex_md5 = function(s) {

		return binl2hex(core_md5(str2binl(s), s.length * chrsz));
	}
	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length
	 */
	function core_md5(x, len) {
		/* append padding */
		x[len >> 5] |= 0x80 << ((len) % 32);
		x[(((len + 64) >>> 9) << 4) + 14] = len;

		var a = 1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d = 271733878;

		for(var i = 0; i < x.length; i += 16) {
			var olda = a;
			var oldb = b;
			var oldc = c;
			var oldd = d;

			a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
			d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
			c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
			b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
			a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
			d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
			c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
			b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
			a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
			d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
			c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
			b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
			a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
			d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
			c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
			b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

			a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
			d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
			c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
			b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
			a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
			d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
			c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
			b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
			a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
			d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
			c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
			b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
			a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
			d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
			c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
			b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

			a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
			d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
			c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
			b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
			a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
			d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
			c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
			b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
			a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
			d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
			c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
			b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
			a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
			d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
			c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
			b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

			a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
			d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
			c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
			b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
			a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
			d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
			c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
			b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
			a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
			d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
			c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
			b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
			a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
			d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
			c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
			b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

			a = safe_add(a, olda);
			b = safe_add(b, oldb);
			c = safe_add(c, oldc);
			d = safe_add(d, oldd);
		}
		return Array(a, b, c, d);
	}

	function md5_cmn(q, a, b, x, s, t) {
		return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
	}

	function md5_ff(a, b, c, d, x, s, t) {
		return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}

	function md5_gg(a, b, c, d, x, s, t) {
		return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}

	function md5_hh(a, b, c, d, x, s, t) {
		return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}

	function md5_ii(a, b, c, d, x, s, t) {
		return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}
	/*
	 * Calculate the HMAC-MD5, of a key and some data
	 */
	function core_hmac_md5(key, data) {
		var bkey = str2binl(key);
		if(bkey.length > 16) bkey = core_md5(bkey, key.length * chrsz);
		var ipad = Array(16),
			opad = Array(16);
		for(var i = 0; i < 16; i++) {
			ipad[i] = bkey[i] ^ 0x36363636;
			opad[i] = bkey[i] ^ 0x5C5C5C5C;
		}
		var hash = core_md5(ipad.concat(str2binl(data)), 512 + data.length * chrsz);
		return core_md5(opad.concat(hash), 512 + 128);
	}
	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return(msw << 16) | (lsw & 0xFFFF);
	}
	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt) {
		return(num << cnt) | (num >>> (32 - cnt));
	}
	/*
	 * Convert a string to an array of little-endian words
	 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
	 */
	function str2binl(str) {
		var bin = Array();
		var mask = (1 << chrsz) - 1;
		for(var i = 0; i < str.length * chrsz; i += chrsz)
			bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (i % 32);
		return bin;
	}
	/*
	 * Convert an array of little-endian words to a string
	 */
	function binl2str(bin) {
		var str = "";
		var mask = (1 << chrsz) - 1;
		for(var i = 0; i < bin.length * 32; i += chrsz)
			str += String.fromCharCode((bin[i >> 5] >>> (i % 32)) & mask);
		return str;
	}
	/*
	 * Convert an array of little-endian words to a hex string.
	 */
	function binl2hex(binarray) {
		var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
		var str = "";
		for(var i = 0; i < binarray.length * 4; i++) {
			str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) + hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xF);
		}
		return str;
	}
	/*
	 * Convert an array of little-endian words to a base-64 string
	 */
	function binl2b64(binarray) {
		var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var str = "";
		for(var i = 0; i < binarray.length * 4; i += 3) {
			var triplet = (((binarray[i >> 2] >> 8 * (i % 4)) & 0xFF) << 16) | (((binarray[i + 1 >> 2] >> 8 * ((i + 1) % 4)) & 0xFF) << 8) | ((binarray[i + 2 >> 2] >> 8 * ((i + 2) % 4)) & 0xFF);
			for(var j = 0; j < 4; j++) {
				if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
				else str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
			}
		}
		return str;
	}
})

/**
 * 
 */
angular.module('app').service('globalFn', function() {

	//  递归树
	this.dg_tree = function(tree, fn) {
		for(var i = 0; i < tree.length; i++) {
			fn(tree[i]);
			if(tree[i].childrenList && tree[i].childrenList.length > 0) {
				this.dg_tree(tree[i].childrenList, fn);
			}
		}
	}

	/*    生成全部学科门类树      */
	this.outTree = function(det) {
		if(det.length < 1) return [{
			label: '全部菜单',
			fucecode: "0",
			children: [],
			level: 0
		}];
		//
		var tree = {};
		//
		for(var a in det) {
			var item = det[a];
			item.label = item.fucename;

			if(!tree[item.fucecode]) {
				tree[item.fucecode] = {};
			}
			//   压入当前数据
			tree[item.fucecode] = $.extend({}, tree[item.fucecode], item);
			//   添加树属性
			if(!("children" in tree[item.fucecode])) tree[item.fucecode].children = [];
			//   找
			if(tree[item.fuceparentcode]) {
				tree[item.fuceparentcode].children.push(tree[item.fucecode]);
			} else {
				tree[item.fuceparentcode] = {
					children: [tree[item.fucecode]]
				};
			}
		}

		//
		var data_tree = [{
			label: '全部菜单',
			fucecode: "0",
			children: tree[0].children,
			level: 0
		}];

		//   添加层级
		this.dg_tree(data_tree, function(item) {
			for(var t_item in item.children) {
				item.children[t_item].level = item.level + 1;
			}
		});
		return data_tree;
	}

	/**
	 * 凭条打印单据 文本 模板
	 */
	this.slipTemplate = {
		//  挂号
		"registration": function() {

		}
	}

	//   排序
	this.compare = function(prop) {
		return function(obj1, obj2) {
			var val1 = obj1[prop];
			var val2 = obj2[prop];
			if(!isNaN(Number(val1)) && !isNaN(Number(val2))) {
				val1 = Number(val1);
				val2 = Number(val2);
			}
			if(val1 < val2) {
				return -1;
			} else if(val1 > val2) {
				return 1;
			} else {
				return 0;
			}
		}
	}

	/**
	 * 浮点 小数相加 精度处理
	 * int1  数字1
	 * int2  数字2
	 * tofx 取几位小数
	 * @return Number 数字形
	 */
	this.numberSumFloat = function(int1, int2, tofx) {
		var jd = 100000000;
		//   转换成数字形
		int1 = +int1;
		int2 = +int2;
		//  
		int1 = Math.round(int1 * jd).toString();
		int1 = int1.substr(0, int1.indexOf('.') > -1 ? int1.indexOf('.') - 1 : int1.length);
		int1 = +int1;
		//
		int2 = Math.round(int2 * jd).toString();
		int2 = int2.substr(0, int2.indexOf('.') > -1 ? int2.indexOf('.') - 1 : int2.length);
		int2 = +int2;
		//
		return +(((int1 + int2) / jd).toFixed(tofx));
	};

	/**
	 ** 加法函数，用来得到精确的加法结果
	 ** 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
	 ** 调用：accAdd(arg1,arg2)
	 ** 返回值：arg1加上arg2的精确结果
	 **/
	this.accAdd = function(arg1, arg2) {
		var r1, r2, m, c;
		try {
			r1 = arg1.toString().split(".")[1].length;
		} catch(e) {
			r1 = 0;
		}
		try {
			r2 = arg2.toString().split(".")[1].length;
		} catch(e) {
			r2 = 0;
		}
		c = Math.abs(r1 - r2);
		m = Math.pow(10, Math.max(r1, r2));
		if(c > 0) {
			var cm = Math.pow(10, c);
			if(r1 > r2) {
				arg1 = Number(arg1.toString().replace(".", ""));
				arg2 = Number(arg2.toString().replace(".", "")) * cm;
			} else {
				arg1 = Number(arg1.toString().replace(".", "")) * cm;
				arg2 = Number(arg2.toString().replace(".", ""));
			}
		} else {
			arg1 = Number(arg1.toString().replace(".", ""));
			arg2 = Number(arg2.toString().replace(".", ""));
		}
		return(arg1 + arg2) / m;
	}

	/**
	 ** 减法函数，用来得到精确的减法结果
	 ** 说明：javascript的减法结果会有误差，在两个浮点数相减的时候会比较明显。这个函数返回较为精确的减法结果。
	 ** 调用：accSub(arg1,arg2)
	 ** 返回值：arg1加上arg2的精确结果
	 **/
	this.accSub = function(arg1, arg2) {
		var r1, r2, m, n;
		try {
			r1 = arg1.toString().split(".")[1].length;
		} catch(e) {
			r1 = 0;
		}
		try {
			r2 = arg2.toString().split(".")[1].length;
		} catch(e) {
			r2 = 0;
		}
		m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
		n = (r1 >= r2) ? r1 : r2;
		return((arg1 * m - arg2 * m) / m).toFixed(n);
	}

	/**
	 ** 乘法函数，用来得到精确的乘法结果
	 ** 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
	 ** 调用：accMul(arg1,arg2)
	 ** 返回值：arg1乘以 arg2的精确结果
	 **/
	this.accMul = function(arg1, arg2) {
		var m = 0,
			s1 = arg1.toString(),
			s2 = arg2.toString();
		try {
			m += s1.split(".")[1].length;
		} catch(e) {}
		try {
			m += s2.split(".")[1].length;
		} catch(e) {}
		return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
	}

	/** 
	 ** 除法函数，用来得到精确的除法结果
	 ** 说明：javascript的除法结果会有误差，在两个浮点数相除的时候会比较明显。这个函数返回较为精确的除法结果。
	 ** 调用：accDiv(arg1,arg2)
	 ** 返回值：arg1除以arg2的精确结果
	 **/
	this.accDiv = function(arg1, arg2) {
		var t1 = 0,
			t2 = 0,
			r1, r2;
		try {
			t1 = arg1.toString().split(".")[1].length;
		} catch(e) {}
		try {
			t2 = arg2.toString().split(".")[1].length;
		} catch(e) {}
		with(Math) {
			r1 = Number(arg1.toString().replace(".", ""));
			r2 = Number(arg2.toString().replace(".", ""));
			return(r1 / r2) * pow(10, t2 - t1);
		}
	}

})

//   声音文件定义
var audio_list_fn = function() {
	var data_array = [{
			"id": "audio_001",
			"name": "请选择您要办理的业务",
			"src": "img/mp3/请选择您要办理的业务.ogg"
		},
		{
			"id": "audio_002",
			"name": "请插入您的诊疗卡",
			"src": "img/mp3/请插入您的诊疗卡.ogg"
		},
		{
			"id": "audio_003",
			"name": "请将您的身份证放到对应区域以便读取您的证件信息",
			"src": "img/mp3/请将您的身份证放到对应区域以便读取您的证件信息.ogg"
		},
		{
			"id": "audio_004",
			"name": "请选择您要挂号的科室",
			"src": "img/mp3/请选择您要挂号的科室.ogg"
		},
		{
			"id": "audio_005",
			"name": "请选择您要预约的日期",
			"src": "img/mp3/请选择您要预约的日期.ogg"
		},
		{
			"id": "audio_006",
			"name": "请确认您要办理的业务",
			"src": "img/mp3/请确认您要办理的业务.ogg"
		},
		{
			"id": "audio_007",
			"name": "请投币，本机只接收100元面额纸币",
			"src": "img/mp3/请投币，本机只接收100元面额纸币.ogg"
		},
		{
			"id": "audio_008",
			"name": "系统正在处理中，请稍候",
			"src": "img/mp3/系统正在处理中，请稍候.ogg"
		},
		{
			"id": "audio_009",
			"name": "请取走您的凭条",
			"src": "img/mp3/请取走您的凭条.ogg"
		},
		{
			"id": "audio_010",
			"name": "请取走您的诊疗卡",
			"src": "img/mp3/请取走您的诊疗卡.ogg"
		},
		{
			"id": "audio_011",
			"name": "非常抱歉，系统发生故障，请移步到其他终端或到窗口办理",
			"src": "img/mp3/非常抱歉，系统发生故障，请移步到其他终端或到窗口办理.ogg"
		},
		{
			"id": "audio_012",
			"name": "请选择您要挂号的专科名称",
			"src": "img/mp3/请选择您要挂号的专科名称.ogg"
		},
		{
			"id": "audio_013",
			"name": "业务处理成功，请取走您的凭条",
			"src": "img/mp3/业务处理成功，请取走您的凭条.ogg"
		},
		{
			"id": "audio_014",
			"name": "请将您的银行卡插入银联读卡器",
			"src": "img/mp3/请将您的银行卡插入银联读卡器.ogg"
		},
		{
			"id": "audio_015",
			"name": "请确认您要待缴费的内容",
			"src": "img/mp3/请确认您要待缴费的内容.ogg"
		},
		{
			"id": "audio_016",
			"name": "请选择您要挂号的医生",
			"src": "img/mp3/请选择您要挂号的医生.ogg"
		},
		{
			"id": "audio_017",
			"name": "请取走您的银行卡",
			"src": "img/mp3/请取走您的银行卡.ogg"
		},
		{
			"id": "audio_018",
			"name": "请选择您要查询的日期",
			"src": "img/mp3/请选择您要查询的日期.ogg"
		},
		{
			"id": "audio_019",
			"name": "请选择您要挂号的时间段",
			"src": "img/mp3/请选择您要挂号的时间段.ogg"
		},
		{
			"id": "audio_020",
			"name": "请选择支付方式",
			"src": "img/mp3/请选择支付方式.ogg"
		},
		{
			"id": "audio_021",
			"name": "请插入您的银行卡",
			"src": "img/mp3/请插入您的银行卡.ogg"
		},
		{
			"id": "audio_022",
			"name": "请点击缴费按钮进行缴费",
			"src": "img/mp3/请点击缴费按钮进行缴费.ogg"
		},
		{
			"id": "audio_023",
			"name": "请取走您的诊疗卡，祝您早日康复",
			"src": "img/mp3/请取走您的诊疗卡，祝您早日康复.ogg"
		},
		{
			"id": "audio_024",
			"name": "请选择缴费的处方",
			"src": "img/mp3/请选择缴费的处方.ogg"
		},
		{
			"id": "audio_025",
			"name": "请选择取药的处方",
			"src": "img/mp3/请选择取药的处方.ogg"
		},
		{
			"id": "audio_026",
			"name": "请选择您要查询的方式",
			"src": "img/mp3/请选择您要查询的方式.ogg"
		},
		{
			"id": "audio_027",
			"name": "请选择您要查看的报告单",
			"src": "img/mp3/请选择您要查看的报告单.ogg"
		},
		{
			"id": "audio_028",
			"name": "请输入您要查询的日期",
			"src": "img/mp3/请输入您要查询的日期.ogg"
		},
		{
			"id": "audio_029",
			"name": "请选择缴费的处方或点击缴费按钮进行全部缴费",
			"src": "img/mp3/请选择缴费的处方或点击缴费按钮进行全部缴费.ogg"
		},
		{
			"id": "audio_030",
			"name": "请选择您要建卡的方式",
			"src": "img/mp3/请选择您要建卡的方式.ogg"
		},
		{
			"id": "audio_031",
			"name": "请插入您的社保卡",
			"src": "img/mp3/请插入您的社保卡.ogg"
		},
		{
			"id": "audio_032",
			"name": "请取走您的社保卡",
			"src": "img/mp3/请取走您的社保卡.ogg"
		},
		{
			"id": "audio_033",
			"name": "请取走您的卡片",
			"src": "img/mp3/请取走您的卡片.ogg"
		}
	];
	for(var i in data_array) {
		var dom_li = $('<li><h4>' + data_array[i].name + '</h4><audio id="' + data_array[i].id + '" controls><source type="audio/ogg"></audio></li>');
		dom_li.find('source').attr('src', data_array[i].src);
		$('#audio_list > ul').append(dom_li);
	}
}
audio_list_fn();