'use strict';
/**
 * Created by Administrator on 2016/7/21.
 * 
 */




/**
 * 
 */
angular.module('app').factory('httpService', function ($http, $q, $filter) {
    //
    var http = {
        dev: {
            protocol: 'http:',
            hostname: '192.168.156.141',
            port: '80',
            hash: ''
        }
    }
    http.dev.origin = http.dev.protocol + '//' + http.dev.hostname + ':' + http.dev.port;
    http.dev.href = http.dev.origin + http.dev.hash;


    //   错误与超时
    var error_obj = {
        //   用于判断状态
        succeed: false,
        //   状态码
        code: -1,
        //   消息
        message: '',
        //
        resultMessage: '',
        //
        status: '',
        //
        data: {}
    }

    //   超时时间 毫秒
    var time_out = 1000 * 30;

    //
    return {

        //========================================================================
        // 下面是通过$http访问后台进行记录的增、删、改、查
        //========================================================================

        //GET请求
        ajaxGet: function (url, params, out) {
            // log
            window.terminal && window.terminal.WriteLog($filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss') + ' rq : url:' + url + '。 params:' + JSON.stringify(params) + '。 timeout:' + out + '。');
            //
            var deferred = $q.defer();
            $http({
                url: url,
                method: "GET",
                params: params,
                timeout: out ? out : time_out,
            })
                .success(function (data, status, headers, config) {
                    // log
                    window.terminal && window.terminal.WriteLog($filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss') + ' res : data:' + JSON.stringify(data) + '。 headers:' + JSON.stringify(headers) + '。');
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    // log
                    window.terminal && window.terminal.WriteLog($filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss') + ' res : data:' + JSON.stringify(data) + '。 headers:' + JSON.stringify(headers) + '。');
                    //  处理超时与错误
                    var temp_obj = angular.copy(error_obj);
                    temp_obj.code = status;
                    deferred.resolve(temp_obj);
                    //deferred.reject('Service error ');
                })
            return deferred.promise;
        },
        //DELETE请求
        ajaxDelete: function (url) {
            var deferred = $q.defer();
            $http({
                url: url,
                method: "DELETE",
                params: {}
            })
                .success(function (data, status, headers, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    //  处理超时与错误
                    var temp_obj = angular.copy(error_obj);
                    temp_obj.code = status;
                    deferred.resolve(temp_obj);
                })
            return deferred.promise;
        },
        //POST请求
        ajaxPost: function (url, data, out, params) {
            // log
            window.terminal && window.terminal.WriteLog($filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss') + ' rq : url:' + url + '。 data:' + JSON.stringify(data) + '。 params:' + JSON.stringify(params) + '。' + '。 timeout:' + out + '。');
            var deferred = $q.defer();
            $http({
                url: url,
                method: "POST",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                data: $.param(data ? data : {}),
                timeout: out ? out : time_out,
                params: params ? params : {}
            }).success(function (data, status, headers, config) {
                // log
                window.terminal && window.terminal.WriteLog($filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss') + ' res : data:' + JSON.stringify(data) + '。 headers:' + JSON.stringify(headers) + '。');

                //          		var temp_obj = {data:data,status:status,headers:headers,config:config};
                var temp_obj = data;
                deferred.resolve(temp_obj);
            }).error(function (data, status, headers, config) {
                // log
                window.terminal && window.terminal.WriteLog($filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss') + ' res : data:' + JSON.stringify(data) + '。 headers:' + JSON.stringify(headers) + '。');
                //  处理超时与错误
                var temp_obj = angular.copy(error_obj);
                temp_obj.code = status;
                deferred.resolve(temp_obj);
                //deferred.reject('Service error ');
            });
            return deferred.promise;
        },
        //PUT请求
        ajaxPut: function (url, row) {
            var deferred = $q.defer();
            $http({
                url: url,
                method: "PUT",
                data: row,
                params: {}
            })
                .success(function (data, status, headers, config) {
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    deferred.reject('Service error ');
                })
            return deferred.promise;
        },


        //   ================  admin  维护人员 =============
        //GET请求
        adminAjaxGet: function (url, params, out) {
            // log
            window.terminal && window.terminal.WriteLog($filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss') + ' rq : url:' + url + '。 params:' + JSON.stringify(params) + '。 timeout:' + out + '。');
            //
            var deferred = $q.defer();
            $http({
                url: url,
                method: "GET",
                headers: { 'hasadmin': 'on' },
                params: params,
                timeout: out ? out : time_out,
            })
                .success(function (data, status, headers, config) {
                    // log
                    window.terminal && window.terminal.WriteLog($filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss') + ' res : data:' + JSON.stringify(data) + '。 headers:' + JSON.stringify(headers) + '。');
                    deferred.resolve(data);
                })
                .error(function (data, status, headers, config) {
                    // log
                    window.terminal && window.terminal.WriteLog($filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss') + ' res : data:' + JSON.stringify(data) + '。 headers:' + JSON.stringify(headers) + '。');
                    //  处理超时与错误
                    var temp_obj = angular.copy(error_obj);
                    temp_obj.code = status;
                    deferred.resolve(temp_obj);
                    //deferred.reject('Service error ');
                })
            return deferred.promise;
        },
        //POST请求
        adminAjaxPost: function (url, data, out, params) {
            // log
            window.terminal && window.terminal.WriteLog($filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss') + ' rq : url:' + url + '。 data:' + JSON.stringify(data) + '。 params:' + JSON.stringify(params) + '。' + '。 timeout:' + out + '。');
            var deferred = $q.defer();
            $http({
                url: url,
                method: "POST",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'hasadmin': 'on' },
                data: $.param(data ? data : {}),
                timeout: out ? out : time_out,
                params: params ? params : {}
            }).success(function (data, status, headers, config) {
                // log
                window.terminal && window.terminal.WriteLog($filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss') + ' res : data:' + JSON.stringify(data) + '。 headers:' + JSON.stringify(headers) + '。');

                //          		var temp_obj = {data:data,status:status,headers:headers,config:config};
                var temp_obj = data;
                deferred.resolve(temp_obj);
            }).error(function (data, status, headers, config) {
                // log
                window.terminal && window.terminal.WriteLog($filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss') + ' res : data:' + JSON.stringify(data) + '。 headers:' + JSON.stringify(headers) + '。');
                //  处理超时与错误
                var temp_obj = angular.copy(error_obj);
                temp_obj.code = status;
                deferred.resolve(temp_obj);
                //deferred.reject('Service error ');
            });
            return deferred.promise;
        },

        //   ================  admin  维护人员 =============



        //
        API: http.dev,
        //   医院代码
        HOSPITAL_CODE: '445178987',
        //   超时时间
        TIME_OUT: time_out,
        //   错误消息
        ERROR_OBJ: error_obj

    };
});
