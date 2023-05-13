# playwright-ts
playwright-typescript demo

完全兼容playwright.config.ts配置,主要实现了以下功能:
1.基于用户的page object模式,为每个用户创建独立的context,便于多用户交互测试.
2.用例启动时context层监听http请求,捕获报错请求信息.
3.用例启动时page层监听websocket信息,并将其在page内隐藏,同时输出至console,防止用例误点击失败.
4.html报告中隐藏不需要展示的step,step title 需以"DeleteFromTheHtmlreport"开头

产生的问题:
Html报告中会产生大量监听的step,暂时通过修改源码解决(后期看playwright官方是否提供API),修改信息:
node_modules/@playwright/test/lib/reporters/html.js
方法名:_createTestResult 
steps: result.steps.map(s => this._createTestStep(s)),
改为
steps: result.steps.filter(s => !s.title.startsWith('DeleteFromTheHtmlreport')).map(s => this._createTestStep(s)),

Html报告中,视频附件无法自定义名称,目前通过修改源码解决,修改信息:
node_modules/playwright-core/lib/webpack/htmlReport
查找代码
=== "video" 
将第一个匹配项改为
contentType.startsWith("video/")


TODO:
1.monocart
2.dataclass
