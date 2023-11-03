// 观察DOM变化，对新增的按钮等进行disable或hidden,同时获取loading元素数量
const domObserver = new MutationObserver((mutationsList) => {
  // 供apiObserver.js判断当前dom正在变动
  window.domStatus = 1;
  // listenElementsClassName中元素出现style.display属性将被设置为none,且不会被恢复,防止此类元素出现影响UI自动化操作其他元素
  // 如需判断页面中存在这些这些元素,只需playwrigh locator.waitFor("attached")即可.
  const listenElementsClassName = ["c7n-notification-notice request"];
  // 临时被禁用,网络结束后启用的元素
  const findAllElementsNeedToDisable = (element) => [
    ...(element.tagName === "BUTTON" && !element.disabled
      ? [(element.disabled = true && element)]
      : []),
    ...(element.tagName === "INPUT" && !element.disabled
      ? [(element.disabled = true && element)]
      : []),
    ...(element.tagName === "svg" &&
      !element.ariaHidden &&
      !element.closest("button")
      ? [(element.closest("div").hidden = true && element.closest("div"))]
      : []),
    ...Array.from(element.children || []).flatMap(findAllElementsNeedToDisable),
  ];
  let elementsToRestore = [];
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      const { target, addedNodes } = mutation;
      if (target instanceof HTMLElement && target.classList && addedNodes.length > 0) {
        const disabledElements = Array.from(addedNodes || []).flatMap(findAllElementsNeedToDisable);
        elementsToRestore = elementsToRestore.concat(disabledElements);
        addedNodes.forEach((addedNode) => {
          if (typeof addedNode.className === 'string') {
            for (const className of listenElementsClassName) {
              if (addedNode.className.includes(className)) {
                addedNode.style.display = "none";
                break;
              }
            }
          }
        });
      }
    }
  }
  // 当目前无loading,且最后一次网络请求结束timeOut时间以上,恢复元素状态.
  if (elementsToRestore.length > 0) {
    const timeOut = 90;
    const intervalId = setInterval(() => {
      const now = Date.now();
      if (!window.apiCounter && now - window.lastResponseEndTime > timeOut && now - window.lastDomEndTime > timeOut + 20) {
        for (const element of elementsToRestore) {
          if (
            element instanceof HTMLButtonElement ||
            element instanceof HTMLInputElement
          ) {
            element.disabled = false;
          } else if (element.tagName === "DIV") {
            element.hidden = false;
          }
        }
        clearInterval(intervalId);
      }
    }, timeOut);
  }
  window.lastDomEndTime = Date.now();
  window.domStatus = 0;
});
if (document.body) {
  domObserver.observe(document.body, { childList: true, subtree: true });
} else {
  window.addEventListener("DOMContentLoaded", () =>
    domObserver.observe(document.body, { childList: true, subtree: true })
  );
}