import type { Page } from 'playwright-core';
import LoginPage from '../page-object-model/LoginPage';
import DashboardPage from '../page-object-model/DashboardPage';
import PopupDetailPage from '../page-object-model/PopUpDetailPage';

export default class PagesInstance {
    page: Page;
    LoginPage: LoginPage;
    DashboardPage: DashboardPage;
    PopupDetailPage: PopupDetailPage
    
    constructor(page: Page) {
      this.page = page;
      this.LoginPage = new LoginPage(this.page);
      this.DashboardPage = new DashboardPage(this.page);
      this.PopupDetailPage = new PopupDetailPage(this.page)
    }

    newPagesInstance(page:Page) {
      return new PagesInstance(page)
    }

    newPopupDetailPage(page:Page){
      return this.newPopupDetailPage(page)
    }
}