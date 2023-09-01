import type { Page } from "playwright-core";
import PageComponent from "../page-object-model/PageComponent";
import LoginPage from "../page-object-model/LoginPage";
import DashboardPage from "../page-object-model/DashboardPage";
import PopupDetailPage from "../page-object-model/PopUpDetailPage";
import MyProject from "../page-object-model/MyProject";

// 所有页面实例,当第一次使用实进行实例化,当Page修改后会重新进行实例化,确定页面实例为最新Page对象
export default class PagesInstance {
  page: Page;
  private defalutPage: Page;
  private previousPage: Page;
  LoginPage: LoginPage;
  DashboardPage: DashboardPage;
  PopupDetailPage: PopupDetailPage;
  MyProject: MyProject;
  protected pagesClasses: { [key: string]: any } = {
    LoginPage,
    DashboardPage,
    PopupDetailPage,
    MyProject,
  };
  constructor(page: Page) {
    this.page = page;
    this.defalutPage = page;
    return new Proxy(this, {
      get(target, prop) {
        if (
          typeof target[prop] === "undefined" ||
          (target[prop] instanceof PageComponent &&
            target[prop].page !== target.page)
        ) {
          delete target[prop];
          target[prop] = new target.pagesClasses[prop as string](target.page);
        }
        return target[prop];
      },
    });
  }

  // 切换页面,当不传参时,则切换至实例化类时的默认Page
  //
  // 参数:
  //   - page: 要切换到的页面
  //   - previousPage: 是否切换到上一个页面
  
  switchToPage(page?: Page, previousPage?: false) {
    if (page) {
      this.previousPage = page;
      this.page = page;
      return;
    } else if (previousPage) {
      this.page = this.previousPage;
      return;
    } else {
      this.page = this.defalutPage;
    }
  }

  // 临时停用mask,避免添加mask对playwright操作造成意外影响
  //
  // 参数:
  //   - callback: 要执行的回调函数
  //
  // 返回值:
  //   - Promise<R>: 异步回调函数的返回值
  async temporarilyDisableMask<R>(callback: () => Promise<R>): Promise<R> {
    await this.page.evaluate("window.maskTag=0");
    try {
      return await callback();
    } finally {
      await this.page.evaluate("window.maskTag=1");
    }
  }
}
