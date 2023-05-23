import PageComponent from './PageComponent';

export default class LoginPage extends PageComponent {

    async goto() {
        await super.goto('/projects/list/table');
    }

    get 项目主表() {
        return this.table("项目编号")
    }
}