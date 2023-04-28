import type { Page } from 'playwright-core';

export default abstract class TestComponent {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async fill_快捷操作_填写表单(fields: Record<string, string | number>) {
		for (const [field, value] of Object.entries(fields)) {
			const input = await this.page.$(`input[name="${field}"]`);
			if (!input) {
				throw new Error(`Input field "${field}" not found`);
			} 
			const inputType = await input.evaluate((el) => {
				const classList = el.classList;
				if (classList.contains('ocant')) {
					return 'OCANT';
				} else {
					const parentClassList = el.parentElement?.classList;
					if (parentClassList?.contains('ocant')) {
						return 'OCANT';
					} else {
						return 'C7N';
					}
				}
			});
			const inputType = await input.evaluate((el) => el.getAttribute('type'));
			if (inputType === 'text') {
				await input.fill(value);
			} else if (inputType === 'select-one') {
				await input.selectOption({ value });
			} else {
				throw new Error(`Unsupported input type "${inputType}" for field "${field}"`);
			}
		}
	}

	async fill_快捷操作_填写表格() {

	}
}