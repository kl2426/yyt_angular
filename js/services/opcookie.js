/**
 * 常用服务
 */

/**
 * cookie
 */
var DOCUMENT = document;


angular.module('app').factory('opCookie', function($window) {
	
	//设置cookie  
	var setCookie = function(cname, cvalue, seconds) {
		var d = new Date();
		d.setTime(d.getTime() + (seconds * 1000));
		var expires = "expires=" + d.toUTCString();
		DOCUMENT.cookie = cname + "=" + cvalue + "; " + expires;
	}
	//获取cookie  
	var getCookie = function(cname) {
		var name = cname + "=";
		var ca = DOCUMENT.cookie.split(';');
		for(var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while(c.charAt(0) == ' ') c = c.substring(1);
			if(c.indexOf(name) != -1) return c.substring(name.length, c.length);
		}
		return "";
	}
	//清除cookie    
	var clearCookie = function(name) {
		var exp = new Date();
		exp.setTime(exp.getTime() - 1);
		var cval=getCookie(name);
		if(cval!=null)
		DOCUMENT.cookie= name + "="+cval+";expires="+exp.toGMTString();
	}

	

	//
	return {
		setCookie:setCookie,
		getCookie:getCookie,
		clearCookie:clearCookie
	};
});