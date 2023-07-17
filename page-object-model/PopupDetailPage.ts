import PageComponent from "./PageComponent";

/**
 * 一般为点击其他页面连接跳转至此详情页面,且此详情页面无法跳转至其他页面
 */

export default class PopupDetailPage extends PageComponent {
  async fillFormInThePage() {
    // await this.page.waitForSelector('"工作台"')
  }
}
