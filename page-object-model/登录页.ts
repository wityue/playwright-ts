import 组件 from './TestComponent';

export default class 登录页 extends 组件 {

    async goto() {
        await this.page.goto('/oauth/login');
    }

    async 登录(账号: string, 密码: string) {
        await this.page.fill('#username', 账号)
        await this.page.fill('#password', 密码)
        await this.page.check('#checkbox')
        this.page.keyboard.press('Enter');
        // await this.page.waitForSelector('"工作台"')
    }
}