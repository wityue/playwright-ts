import type { Page } from 'playwright-core';
import 登录页 from '../page-object-model/登录页';
import 合同查询 from '../page-object-model/合同查询';

export default class PagesInstance {
    page: Page;
    登录页: 登录页;
    合同查询: 合同查询;
    
    constructor(page: Page) {
      this.page = page;
      this.登录页 = new 登录页(this.page);
      this.合同查询 = new 合同查询(this.page);
    }
}