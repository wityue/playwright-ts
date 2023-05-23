import type { Page } from 'playwright-core';
import LoginPage from '../page-object-model/LoginPage';
import DashboardPage from '../page-object-model/DashboardPage';
import PopupDetailPage from '../page-object-model/PopUpDetailPage';
import MyProject from '../page-object-model/MyProject'

export default class PagesInstance {
    page: Page;
    LoginPage: LoginPage;
    DashboardPage: DashboardPage;
    PopupDetailPage: PopupDetailPage;
    MyProject: MyProject;
    
    constructor(page: Page) {
      this.page = page;
      this.LoginPage = new LoginPage(this.page);
      this.DashboardPage = new DashboardPage(this.page);
      this.PopupDetailPage = new PopupDetailPage(this.page);
      this.MyProject = new MyProject(this.page);
    }

    newPagesInstance(page:Page) {
      return new PagesInstance(page)
    }

    newPopupDetailPage(page:Page){
      return this.newPopupDetailPage(page)
    }
}