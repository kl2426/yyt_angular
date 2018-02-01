# angularjs_yyt
==========
## angularjs .net 套壳桌面应用程序
1、.net与js 双向通信

### 硬件说明
1、灯带控制
	1、window.terminal && window.terminal.JSOpenLED('1');  //   打开灯条
	2、window.terminal && window.terminal.JSCloseLED('1');  //   关闭灯条
	3、window.terminal && window.terminal.JSOpenTwinkleLED('1');   //  打开灯条闪烁
	4、window.terminal && window.terminal.JSCloseTwinkleLED('1');   //  关闭灯条闪烁
	//   -1 所有灯条。 1，凭条号。2，入钞号。3，条码扫描口。4，银行卡入口。5，报告单出口。6，诊疗卡出入口。7，未知。
	



PrintReceipt("打印内容","5","1")




JSOpenLED(string index)//打开灯条
index=-1:打开所有的灯条
index=1:灯条1
index=2:灯条2
index=3:灯条3
index=4:灯条4
index=5:灯条5
index=6:灯条6
index=7:灯条7

JSCloseLED(string index)//关闭灯条
index=-1:关闭所有的灯条
index=1:灯条1
index=2:灯条2
index=3:灯条3
index=4:灯条4
index=5:灯条5
index=6:灯条6
index=7:灯条7
JSOpenTwinkleLED(string index)//打开灯条闪烁
index=-1:打开所有的灯条闪烁
index=1:灯条1
index=2:灯条2
index=3:灯条3
index=4:灯条4
index=5:灯条5
index=6:灯条6
index=7:灯条7

JSCloseTwinkleLED(string index)//关闭灯条闪烁
index=-1:关闭所有的灯条闪烁
index=1:灯条1
index=2:灯条2
index=3:灯条3
index=4:灯条4
index=5:灯条5
index=6:灯条6
index=7:灯条7
12:40:00
新云网-蒋涛 2017/10/21 12:40:00
加入了状态的判断了

新云网-蒋涛 2017/10/21 12:40:22
你那一端只需要判断，0和非0了
16:23:34
新云网-蒋涛 2017/10/21 16:23:34
钱箱的接口

JSOpenCashFun(string callfun) 
callfun：js端接收的回调方法
回调js方法并传入json对象
MsgCode：响应代码
-96:禁止钱箱开关故障
-97:钱箱开关柜故障
-98:钱箱开关柜故障
-99:钱箱端口无法打开，机器故障
0:打开端口成功
1000:执行成功获取到收入的现金
MsgError:响应的错误消息
MsgStr:收到的现金金额

JSCloseCashFunstring callfun) 
callfun：js端接收的回调方法
回调js方法并传入json对象
MsgCode：响应代码
1000:执行成功,成功关闭钱箱卡口
MsgError:响应的错误消息
MsgStr:收到的现金金额





钱箱的接口

JSOpenCashFun(string callfun) 
callfun：js端接收的回调方法
回调js方法并传入json对象
MsgCode：响应代码
-96:禁止钱箱开关故障
-97:钱箱开关柜故障
-98:钱箱开关柜故障
-99:钱箱端口无法打开，机器故障
0:打开端口成功
1000:执行成功获取到收入的现金
MsgError:响应的错误消息
MsgStr:收到的现金金额

JSCloseCashFunstring callfun) 
callfun：js端接收的回调方法
回调js方法并传入json对象
MsgCode：响应代码
1000:执行成功,成功关闭钱箱卡口
MsgError:响应的错误消息
MsgStr:收到的现金金额
