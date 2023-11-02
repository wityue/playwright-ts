(function () {
  "use strict";
  const win = window.unsafeWindow || document.defaultView || window;
  win.maskTag = 1;
  win.dialogTag = 1;
  let mask = document.createElement("div");
  mask.style =
      "position: fixed;top: 0;right: 0;bottom: 0;left: 0;z-index: 1000;height: 100%;background-color: rgba(0,0,0,.0)";
  mask.id = "networkIdleMask";
  let apiCounterElement = document.createElement("span");
  apiCounterElement.style =
      "font-size: 20px;color: red;position: absolute;top: 3%;left: 53%;transform: translate(-50%, -50%);";
  apiCounterElement.id = "apiCounter";
  // 利用PerformanceObserver最后一次网络请求结束时间,会包含ajaxHooker未包含的部门,如script
  const apiObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      // const lastEntryHost = lastEntry.name.match(/^https?:\/\/([^/?#]+)/i)?.[1];
      // if (
      //   lastEntryHost === location.host ||
      //   lastEntry.name.includes("https://cdn")
      // ) {
      if (lastEntry.name.includes("https://cdn")) {
          win.lastResponseEndTime = Date.now();
      }
  });
  apiObserver.observe({
      entryTypes: ["resource"]
  });
  ajaxHooker.filter([
      {
            url: /^https:\/\/(oc-test|demo)\.cloudlong.cn/,
          async: true,
  },
]);
  ajaxHooker.hook((request) => {
      win.apiCounter++;
      try {
          if (win.maskTag) {
              apiCounterElement.textContent = "apiCount:" + win.apiCounter;
              if (!document.getElementById("networkIdleMask")) {
                  mask.appendChild(apiCounterElement);
                  document.body.appendChild(mask);
              }
              request.response = (res) => {
                if (win.dialogTag && res.status === 403){
                    win.alert("API:" + res.finalUrl + "-----failInfo:Response status is 403");
                }else if(win.dialogTag && res.json && res.json.hasOwnProperty("failed"))
                {
                    win.alert("API:" + res.finalUrl + "-----failInfo:" + res.json.message);
                }
                if (
                    win.apiCounter === 0 &&
                    document.getElementById("networkIdleMask")
                ) {
                    const timeOut = 10000;
                    const startTime = Date.now();
                    const intervalId = setInterval(() => {
                        if (
                            !win.apiCounter &&
                            Date.now() - win.lastResponseEndTime > 80
                        ) {
                            if (document.getElementById("networkIdleMask")) {
                                document.getElementById("networkIdleMask").remove();
                            }
                            clearInterval(intervalId);
                        }
                        if (Date.now() - startTime > timeOut) {
                            clearInterval(intervalId);
                        }
                    }, 80);
                }
              };
          }
      } catch (error) {
          console.log(error);
      }
  });
})();