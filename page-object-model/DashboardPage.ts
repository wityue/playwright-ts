import PageComponent from './PageComponent';

export default class DashboardPage extends PageComponent {

    async waitForMe() {
        await this.page.getByText('我的项目', { exact: true }).waitFor({ state: 'visible' })
    }

}
