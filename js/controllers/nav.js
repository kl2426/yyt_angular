'use strict';

/* Controllers */
// signin controller
app.controller('navController', ['$scope', 'httpService', '$state', function($scope, httpService, $state) {
	
	//
	httpService.ajaxPost(httpService.API.origin + '/Rest/function/createIndexTree', undefined, 10000, {
		parentcode: '0'
	})
	.then(function(data) {
		console.log(data)
		if(data.status == 200){
		}else{
			$scope.authError = 'Email or Password not right';
		}
	}, function(x) {
		console.log(x)
		$scope.authError = 'Server Error';
	});
	
	
}]);