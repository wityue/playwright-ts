import PageComponent from "./PageComponent";

export default class LoginPage extends PageComponent {
  async goto() {
    await this.page.goto("/login");
  }

  async 登录(账号: string, 密码: string) {
    await this.page.getByPlaceholder("手机号或工作邮箱").fill(账号);
    await this.page.getByPlaceholder("密码").fill(密码);
    this.page.keyboard.press("Enter");
  }
}
