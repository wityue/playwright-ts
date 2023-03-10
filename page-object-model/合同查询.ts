import TestComponent from './TestComponent';

export default class 合同查询 extends TestComponent {

    async goto() {
        await super.goto('https://oc-test.onecontract-cloud.com//base/query');
    }

}
