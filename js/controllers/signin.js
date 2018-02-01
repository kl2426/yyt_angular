'use strict';

/* Controllers */
// signin controller
app.controller('SigninFormController', ['$scope', 'httpService', '$state','opCookie','Md5', function($scope, httpService, $state,opCookie,Md5) {
	//   清空cookie
	opCookie.clearCookie('access_token');
	opCookie.clearCookie('refresh_token');
	opCookie.clearCookie('user_info');
	
	$scope.user = {};
	$scope.authError = null;
	$scope.logining = true;
	$scope.login = function() {
		$scope.authError = null;
		$scope.logining = false;
		// Try to login
		httpService.ajaxPost(httpService.API.origin + '/oauth/token', undefined, 10000, {
				username: $scope.user.user,
				password: Md5.hex_md5($scope.user.password),
				grant_type: 'password'
			})
			.then(function(data) {
				$scope.logining = true;
				if(data.status == 200){
					opCookie.setCookie('access_token',data.data.access_token,24*60*60);
					//  opCookie.setCookie('expires_in',data.data.expires_in,30);
					//  opCookie.setCookie('jti',data.data.jti,30);
					opCookie.setCookie('refresh_token',data.data.refresh_token,4*60*60);
					//  opCookie.setCookie('scope',data.data.scope,30);
					//  opCookie.setCookie('token_type',data.data.token_type,30);
					$scope.getNav();
					$scope.getUserInfo();
					$state.go('app.index');
				}else{
					$scope.authError = 'Email or Password not right';
				}
			}, function(x) {
				console.log(x)
				$scope.authError = 'Server Error';
			});
	};
}]);