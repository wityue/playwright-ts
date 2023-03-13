import TestComponent from './TestComponent';

export default class 合同查询 extends TestComponent {

    async goto() {
        await this.page.goto('/base/query');
    }

}
