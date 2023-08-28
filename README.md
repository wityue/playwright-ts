# 项目名称

基于playwright-test实现的Page Object Demo

## 说明

主要实现了:  
1.多用户交互,使用用例级别的context fixture,确保每个用户执行用例时都有独立的context环境。  
2.监听HTTP请求，捕获接口异常报错，确保接口的稳定性和测试的可靠性。  
3.监听WebSocket消息，隐藏弹窗并输出消息内容到控制台,避免弹窗造成用例误失败。  
4.封装表单和表格填写方法，通过{key1: value1, key2: value2}的方式快速操作。  
5.集成dataclass,进行测试数据管理,与表单和表格的填写方法结合,使测试更轻松.  
6.注入javascript脚本,监听xhr以及fetch类型API请求，仅当无API正在请求时，放开web界面操作,过滤规则在tools/apiObserver.js中进行配置.  
7.注入javascript脚本,监听dom变化,对新出现的button,input等按钮disble,当无API正在请求时，恢复disable元素状态.

## 安装 && 测试

npm install  
npx playwright test  

具体操作可至playwright官网学习:<https://playwright.dev/docs/intro>

## 测试报告

### 如使用playwright html-reporter,以下两处源码可根据自身情况修改  

1.html-reporter video附件重命名后,无法在video页签下展示,如不重命名,则只能通过观看video内容确定是哪个用户在操作,可修改以下源码解决:  
路径:node_modules/playwright-core/lib/webpack/htmlReport  
查找内容:
==="video"  
将第一个匹配项修改为
contentType.startsWith("video/")  

2.由于监听http请求和Websocket消息,会产生大量相关内容在报告中,影响测试报告阅读体验,可修改以下源码解决:  
路径:node_modules/@playwright/test/lib/reporters/html.js  
方法名:_createTestResult  
steps: result.steps.map(s => this._createTestStep(s)),  
修改为:  
steps: result.steps.filter(s => !s.title.startsWith('DeleteFromTheHtmlreport')).map(s => this._createTestStep(s)),

### 也可参照playwright官方文档,使用第三方报告

<https://playwright.dev/docs/test-reporters#html-reporter>

## 项目结构说明

### page-object-model

#### PageCompoment.ts 包含:页面基础类PageCompoment和通用定位器类Locators

Locators内通用的定位器可根据项目自行适配。  
PageCompoment内的fillForm和fillTable方法也需要自行实现,目前方法相当于伪代码,提供了实现的思路。  
fillTable可通过Table类获取cellLocator后直接调用fillForm进行填写操作。  

#### table.ts 获取表格cellLocator

table在Locators内定义,需要根据项目情况自行适配。  
获取到cellLocator后,可使用playwright Locator的所有方法进行操作。  

#### 其他Page对象,继承PageCompoment,实现Page内方法

### data-factory

dataclass 官方文档:<https://dataclass.js.org/guide/>  
继承dataclass编写数据类,每个表单可作为一个单独的数据类进行定义。

### tests

#### PagesInstance.ts

在此页进行page对象的实例化,然后BaseTest.ts用户fixture内对此类进行实例,以达到每个用户都可操作所有Page的目的。  

#### BaseTest.ts

包含Context的创建和关闭方法,以及继承playwright test编写的各个用户fixture信息,其他用例从此文件import test即可进行用例编写,编写方式可至playwright官方文档学习。  

### tools

#### ajaxHooker.js

引用cxxjackie脚本,增加API请求计数,感谢原作者,原文链接:<https://bbs.tampermonkey.net.cn/thread-3284-13-1.html>

#### apiObserver.js

调用ajaxHooker方法,实现当有API请求（XHR和Fetch类型）时,增加蒙层,禁止操作，当前无API正在请求且上一API请求结束300ms以上,删除蒙层,恢复操作.

#### domObserver.js

监听dom变化,对新出现的button及input等元素进行disable及enable操作.
