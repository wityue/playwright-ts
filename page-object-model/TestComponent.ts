import type { Page } from 'playwright-core';

export default abstract class TestComponent {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async fill_快捷操作_填写表单() {

	}

	async fill_快捷操作_填写表格() {

	}
}