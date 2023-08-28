// 观察DOM变化，对新增的按钮等进行disable或hidden,同时获取loading元素数量
const domObserver = new MutationObserver((mutationsList) => {
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
      if (mutation.target instanceof HTMLElement && mutation.target.classList) {
        if (mutation.addedNodes.length > 0) {
          const disabledElements = Array.from(
            mutation.addedNodes || []
          ).flatMap(findAllElementsNeedToDisable);
          elementsToRestore = elementsToRestore.concat(disabledElements);
        }
      }
    }
  }
  // 当目前无loading,且最后一次网络请求结束timeOut时间以上,恢复元素状态.
  if (elementsToRestore.length > 0) {
    const timeOut = 300;
    const intervalId = setInterval(() => {
      const now = Date.now();
      if (!window.apiCounter && now - window.lastResponseEndTime > timeOut) {
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
    }, timeOut + 100);
  }
});
if (document.body) {
  domObserver.observe(document.body, { childList: true, subtree: true });
} else {
  window.addEventListener("DOMContentLoaded", () =>
    domObserver.observe(document.body, { childList: true, subtree: true })
  );
}
