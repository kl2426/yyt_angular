//   test  测试数据

angular.module('app').service('serverTest', function ($http, $q, $filter, $timeout) {
    //   测试总开关
    var test_bol= false;
    //   测试链接
    var arr_url = [
        {
            url: "http://192.168.156.141:80/api/yytBase/v1/patientRecord/001136155600/2018-05-31/2018-05-31",
            form:'{}',
            res:'{"code":"0","status":"succeed","message":"succeed","data":{"ReturnCode":"0","ReturnInfo":"成功","PageListSize":"0","TotalCount":"2","item":[{"DeptID":"5200001","DeptName":"儿科门诊","ExamDrID":"01389","ExamDr":"范新花","ExamDT":"2018-05-17 09:30:30.0","Disease":"","RegistegOrderID":"001136155600-13","visit_status":"2","Temperature":"","Height":"","Pulse":"","Breath":"","BloodPressure":"","Weight":""},{"DeptID":"5200001","DeptName":"儿科门诊","ExamDrID":"01473","ExamDr":"晏敏亮","ExamDT":"2018-05-31 11:45:58.0","Disease":"","RegistegOrderID":"001136155600-15","visit_status":"2","Temperature":"","Height":"","Pulse":"","Breath":"","BloodPressure":"","Weight":""}],"app_req_no":"xyw20180531163018bNzP","wlpt_req_no":"20180531500001528729","timeStamp_out":"2018-05-31 16:32:04"},"succeed":true,"resultMessage":"succeed"}'
        },
        {
            url:"http://192.168.156.141:80/api/yytBase/v1/patientPres",
            form:'{"registegOrderID":"001136155600-15","cardNo":"6433836","outPatientID":"001136155600","startDT":"2018-05-31","endDT":"2018-06-01"}',
            res:'{"code":"0","status":"succeed","message":"succeed","data":{"ReturnCode":"0","ReturnInfo":"成功","item":[{"PresDT":"2018-05-31","Disease":"过敏性皮炎","PrescriptionID":"001136155600/15/1","PrescriptionType":"诊疗","DoctorID":"01473","DocName":"晏敏亮","DeptID":"5200001","DeptName":"儿科门诊","DeptAddress":"地址不详","ExecDeptID":"5200001","ExecDeptName":"儿科门诊","ExecDeptAddress":"地址不详","IsExecutive":"0","ExecTime":"null","ExecOperatorID":"null","TotalFee":"40.00"},{"PresDT":"2018-05-31","Disease":"过敏性皮炎","PrescriptionID":"001136155600/15/2","PrescriptionType":"诊疗","DoctorID":"01473","DocName":"晏敏亮","DeptID":"5200001","DeptName":"儿科门诊","DeptAddress":"地址不详","ExecDeptID":"5200001","ExecDeptName":"儿科门诊","ExecDeptAddress":"地址不详","IsExecutive":"0","ExecTime":"null","ExecOperatorID":"null","TotalFee":"18.23"}],"app_req_no":"xyw20180531163018ZPmB","wlpt_req_no":"20180531600001528765","timeStamp_out":"2018-05-31 16:30:34"},"succeed":true,"resultMessage":"succeed"}'
        },
        {
            url:"http://192.168.156.141:80/api/yytBase/v1/prescriptionInfo",
            form:'{"PrescriptionID":"001136155600/15/1"}',
            res:'{"code":"0","status":"succeed","message":"succeed","data":{"ReturnCode":"0","ReturnInfo":"成功","item":[{"PrescriptionID":"001136155600/15/1","MedicineID":"400478","MedicineName":"血常规(五分类)","MedicineNum":"1.0","MedicineUnitCharge":"20.00","MedicineType":"化验费","MedicineUnit":"次","MedicineStandard":"次","MedicineAddress":"临床检验中心","MedicineDirections":"医技楼二楼","MedicineDosage":"-","MedicineDays":"-","MedicineFrequency":"-","Fee":"20.00"},{"PrescriptionID":"001136155600/15/1","MedicineID":"065592","MedicineName":"C—反应蛋白测定(CRP)-各种免疫学方法","MedicineNum":"1.0","MedicineUnitCharge":"20.00","MedicineType":"化验费","MedicineUnit":"项","MedicineStandard":"项","MedicineAddress":"临床检验中心","MedicineDirections":"医技楼二楼","MedicineDosage":"-","MedicineDays":"-","MedicineFrequency":"-","Fee":"20.00"}],"app_req_no":"xyw20180531163019cHbm","wlpt_req_no":"20180531600001528766","timeStamp_out":"2018-05-31 16:30:34"},"succeed":true,"resultMessage":"succeed"}'
        },
        {
            url: "http://192.168.156.141:80/api/yytBase/v1/prescriptionInfo",
            form: '{"PrescriptionID":"001136155600/15/2"}',
            res: '{"code":"0","status":"succeed","message":"succeed","data":{"ReturnCode":"0","ReturnInfo":"成功","item":[{"PrescriptionID":"001136155600/15/2","MedicineID":"064879","MedicineName":"尿常规—（机器法）","MedicineNum":"1.0","MedicineUnitCharge":"10.00","MedicineType":"化验费","MedicineUnit":"次","MedicineStandard":"次","MedicineAddress":"临床检验中心","MedicineDirections":"医技楼二楼","MedicineDosage":"-","MedicineDays":"-","MedicineFrequency":"-","Fee":"10.00"},{"PrescriptionID":"001136155600/15/2","MedicineID":"063943","MedicineName":"静脉采血","MedicineNum":"2.0","MedicineUnitCharge":"3.00","MedicineType":"注射费","MedicineUnit":"次","MedicineStandard":"次","MedicineAddress":"门诊注射室","MedicineDirections":"null","MedicineDosage":"-","MedicineDays":"-","MedicineFrequency":"-","Fee":"6.00"},{"PrescriptionID":"001136155600/15/2","MedicineID":"405422","MedicineName":"真空采血管（进口）2.20元","MedicineNum":"1.0","MedicineUnitCharge":"2.20","MedicineType":"材料费","MedicineUnit":"根","MedicineStandard":"根","MedicineAddress":"门诊注射室","MedicineDirections":"null","MedicineDosage":"-","MedicineDays":"-","MedicineFrequency":"-","Fee":"2.20"},{"PrescriptionID":"001136155600/15/2","MedicineID":"401800","MedicineName":"一次性尿杯","MedicineNum":"1.0","MedicineUnitCharge":"0.03","MedicineType":"材料费","MedicineUnit":"只","MedicineStandard":"只","MedicineAddress":"门诊注射室","MedicineDirections":"null","MedicineDosage":"-","MedicineDays":"-","MedicineFrequency":"-","Fee":"0.03"}],"app_req_no":"xyw20180531163019YxbZ","wlpt_req_no":"20180531300001528767","timeStamp_out":"2018-05-31 16:31:38"},"succeed":true,"resultMessage":"succeed"}'
        }

    ];

    //  返回测试数据
    this.test = function(url, form) {
        if (url.indexOf('/api/yytBase/v1') > -1){
            // console.log("接口请求：",url);
        }
        if (form){
            // console.log("请求参数：", JSON.stringify(form));
        }
        //  data
        var data = {};
        //  是否找到需要测试的接口
        var has_res = false;
        //
        for(var i in arr_url){
            if (arr_url[i].url == url && arr_url[i].form == JSON.stringify(form ? form : {}) ){
                data = JSON.parse(arr_url[i].res);
                has_res = true;
                console.log("请求地址：", url);
                console.log("请求返回：", data);
                break;
            }
        }
        //
        var deferred = $q.defer();
        $timeout(function () {
            deferred.resolve(data);
        }, 50);
        return { "switch": test_bol, "has_res":has_res, "promise": deferred.promise};
    }

})