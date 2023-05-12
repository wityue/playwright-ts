import PageComponent from './PageComponent';

export default class 合同查询 extends PageComponent {

    async goto() {
        await this.page.goto('/base/query');
    }

}
