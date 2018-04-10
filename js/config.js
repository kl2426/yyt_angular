/*
 * @Author: wu 308822989@qq.com 
 * @Date: 2018-02-01 16:38:37 
 * @Last Modified by:   wu 
 * @Last Modified time: 2018-02-01 16:38:37 
 */
// config

var app =
	angular.module('app')
	//
	.config(
		['$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
			function($controllerProvider, $compileProvider, $filterProvider, $provide) {

				// lazy controller, directive and service
				app.controller = $controllerProvider.register;
				app.directive = $compileProvider.directive;
				app.filter = $filterProvider.register;
				app.factory = $provide.factory;
				app.service = $provide.service;
				app.constant = $provide.constant;
				app.value = $provide.value;
			}
		])
	.config(['$translateProvider', function($translateProvider) {
		// Register a loader for the static files
		// So, the module will search missing translation tables under the specified urls.
		// Those urls are [prefix][langKey][suffix].
		$translateProvider.useStaticFilesLoader({
			prefix: 'l10n/',
			suffix: '.js'
		});
		// Tell the module what language to use by default
		$translateProvider.preferredLanguage('en');
		// Tell the module to store the language in the local storage
		$translateProvider.useLocalStorage();
	}])

	.config(['$httpProvider', function($httpProvider) {
		//   HTTP拦截器
		$httpProvider.interceptors.push(['$rootScope', '$q', 'opCookie', '$injector', function($rootScope, $q, opCookie, $injector) {
			return {
				request: function(config) {
					// Header - Token
					config.headers = config.headers || {};
					if(opCookie.getCookie('access_token') && config.url.indexOf('/auth/login') < 0) {
						config.headers['Authorization'] = 'Bearer ' + opCookie.getCookie('access_token');
					} else if(config.url.indexOf('/oauth/token?grant_type=refresh_token') >= 0) {
						config.headers['Authorization'] = 'Bearer ' + opCookie.getCookie('refresh_token');
					} else {
						//config.headers['Authorization'] = 'Basic dGVzdDp0ZXN0';
					};

					//   hasadmin == on / off   on  管理员请求 放管理员token
					if(config.headers.hasadmin == 'on' && opCookie.getCookie('access_admin_token') && config.url.indexOf('/auth/syslogin') < 0) {
						config.headers['Authorization'] = 'Bearer ' + opCookie.getCookie('access_admin_token');
					} else if(config.headers.hasadmin == 'on' && config.url.indexOf('/auth/syslogin?grant_type=refresh_token') >= 0) {
						config.headers['Authorization'] = 'Bearer ' + opCookie.getCookie('refresh_admin_token');
					} else {
						//config.headers['Authorization'] = 'Basic dGVzdDp0ZXN0';
					};

					return config;
				},

				response: function(response) {
					//   invalid_token
					return response || $q.when(response);
				},

				responseError: function(response) {
					// Session has expired
					if(response.status == 401 && response.data.error == 'invalid_token') {

						opCookie.clearCookie('access_token');

						var SessionService = $injector.get('SessionService');
						var $http = $injector.get('$http');
						var deferred = $q.defer();

						//   是否有cookie用户信息
						if(!opCookie.getCookie('user_info')) {
							//   没有用户信息跳转到登录
							window.location.href = '/#/access/signin';
						}

						// Create a new session (recover the session)
						// We use login method that logs the user in using the current credentials and
						// returns a promise
						SessionService.readToken().then(deferred.resolve, deferred.reject);

						// When the session recovered, make the same backend call again and chain the request
						return deferred.promise.then(function() {
							return $http(response.config);
						});
					}
					//   刷新token失败
					if(response.config.url.indexOf('/oauth/token?grant_type=refresh_token') >= 0 && response.data.error == 'invalid_token') {
						window.location.href = '/#/access/signin';
					}
					return $q.reject(response);
				}
			}
		}])
	}])

app.factory('SessionService', ['$http', '$q', 'httpService', 'opCookie', function($http, $q, httpService, opCookie) {
	var token = null;
	var sessionService = {};
	var differred = $q.defer();

	sessionService.readToken = function() {
		return $http({
				method: 'POST',
				url: httpService.API.origin + '/oauth/token?grant_type=refresh_token'
				//   &username=' + JSON.parse(unescape(opCookie.getCookie('user_info'))).useraccount  + '&password=' + JSON.parse(unescape(opCookie.getCookie('user_info'))).userpasswd
			})
			.success(function(res) {
				opCookie.setCookie('access_token', res.access_token, 24 * 60 * 60);
				opCookie.setCookie('refresh_token', res.refresh_token, 4 * 60 * 60);
				//console.log('Auth Success and token received: ' + JSON.stringify(res.data));

				// Extract the token details from the received JSON object
				//token = res.data;
				differred.resolve(res);
			}, function(res) {
				console.log('Error occurred : ' + JSON.stringify(res));
				differred.reject(res);
			})
	};

	sessionService.getToken = function() {
		return token;
	};

	sessionService.isAnonymous = function() {
		if(token)
			return true;
		else
			return false;
	};

	return sessionService;
}])