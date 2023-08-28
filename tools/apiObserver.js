(function () {
  "use strict";
  let mask = document.createElement("div");
  mask.style =
    "position: fixed;top: 0;right: 0;bottom: 0;left: 0;z-index: 1000;height: 100%;background-color: rgba(0,0,0,.0)";
  mask.id = "networkIdleMask";
  let apiCounterElement = document.createElement("span");
  apiCounterElement.style =
    "font-size: 20px;color: green;position: absolute;top: 95%;left: 95%;transform: translate(-50%, -50%);";
  apiCounterElement.id = "apiCounter";

  // 利用PerformanceObserver最后一次网络请求结束时间,会包含ajaxHooker未包含的部门,如script
  const apiObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    const lastEntryHost = lastEntry.name.match(/^https?:\/\/([^/?#]+)/i)?.[1];
    if (
      lastEntryHost === location.host ||
      lastEntry.name.includes("https://cdn")
    ) {
      window.lastResponseEndTime = Date.now();
    }
  });
  apiObserver.observe({ entryTypes: ["resource"] });

  ajaxHooker.filter([
    {
      url: "/api/",
      async: true,
    },
  ]);

  ajaxHooker.hook((request) => {
    window.apiCounter++;
    if (document.body) {
      apiCounterElement.textContent = "apiCount:" + window.apiCounter;
      mask.appendChild(apiCounterElement);
      document.body.appendChild(mask);
    }
    request.response = (res) => {
      if (
        window.apiCounter === 0 &&
        document.getElementById("networkIdleMask")
      ) {
        const timeOut = 10000;
        const startTime = Date.now();
        const intervalId = setInterval(() => {
          if (
            !window.apiCounter &&
            Date.now() - window.lastResponseEndTime > 300
          ) {
            if (document.getElementById("networkIdleMask")) {
              document.getElementById("networkIdleMask").remove();
            }
            clearInterval(intervalId);
          }
          if (Date.now() - startTime > timeOut) {
            clearInterval(intervalId);
          }
        }, 200);
      }
    };
  });
})();
