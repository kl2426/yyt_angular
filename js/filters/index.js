'use strict';

/* Filters */
// need load the moment.js to use this filter. 
angular.module('app')
	.filter('fromNow', function() {
		return function(date) {
			return moment(date).fromNow();
		}
	})
	.filter('formatTime', function() {
		return function(time) {
			var pos = time.indexOf('.');
			return time.slice(0, pos);
		}
	});