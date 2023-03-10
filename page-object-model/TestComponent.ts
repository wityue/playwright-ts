import type { Page } from 'playwright-core';

export default abstract class TestComponent {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	getFullPath(path: string) : string {
		return "baseUrl()" + path;
	}

	async goto(path: string) {
		await this.page.goto(this.getFullPath(path), {timeout: 60000});
	}

	dataTestId(id:string) : string {
		return `data-tester-id=${id}`;
	}

	async fillDataTestId(id : string, value : string) {
		await this.page.fill(this.dataTestId(id), value);
	}

	async waitForDataTestId(id : string) {
        await this.page.waitForSelector(this.dataTestId(id));
    }

	async getInputValue(selector: string) {
		return await this.page.$eval(selector, el => el.textContent)
	}

	async clickDataTestId(id : string) {
		await this.page.click(this.dataTestId(id));
	}

	async waitForURL(urlPath: string) {
		await this.page.waitForURL(this.getFullPath(urlPath))
	}

	async waitForText(text: string) {
		return await this.page.waitForSelector("text=" + text, {state: 'attached'});
	}

	async sleep(ms: number){
		let start = new Date().getTime();
		while(true)  if(new Date().getTime()-start > ms) break;
	}

	async fill_快捷操作_填写表单(){
		
	}

	async fill_快捷操作_填写表格(){
		
	}
}