import type { Page, Locator } from 'playwright-core';
export default abstract class PageComponent {
	public readonly page: Page;
	public readonly componentType: string;
	public locators: Locators
	constructor(page: Page) {
		this.page = page;
		this.componentType = "OCANT";
		this.locators = new Locators(page);
	}

	public async fillForm(fields: Map<string | Locator, string | null>) {
		for (const [field, value] of Object.entries(fields)) {
			let input: Locator;
			if (typeof field === 'string') {
				input = this.locators.input(field);
			} else {
				input = field;
			}
			if (!input) {
				throw new Error(`Input field "${field}" not found`);
			}
			switch (this.componentType) {
				case 'OCANT':
					this.fillOcAntForm(input, value);
					break
				case 'C7N':
					this.fillC7nForm(input, value)
					break;
				case 'ANT':
					// Implement ANT specific logic here
					break;
				default:
					throw new Error(`Unsupported component type "${this.componentType}"`);
			}
		}
	}

	public async fillTable() {
		// Implement fillTable() method here
	}

	private async fillOcAntForm(input: Locator, value: string | null) {
		const inputType = await input.getAttribute("type")
		const modalCount = await this.locators.modal.count()
		input.click()
		switch (inputType) {
			case 'search':
				await this.locators.selectOptions.or(this.locators.modal.nth(modalCount + 1)).waitFor({ state: "visible" })
				if (await this.locators.selectOptions.count()) {
					if (value === null) {
						await input.selectOption({ index: 0 });
					} else {
						await input.fill(value);
						await input.selectOption({ label: value });
					}
				} else {
					break
				}
				break;
			case 'text':
				await input.fill(value ?? '');
				break;
			default:
				throw new Error(`Unsupported input type "${inputType}"`);
		}
	}

	private async fillC7nForm(input: Locator, value: string | null) {
		const inputType = await input.getAttribute("type")
		const modalCount = await this.locators.modal.count()
		input.click()
		switch (inputType) {
			case 'search':
				await this.locators.selectOptions.or(this.locators.modal.nth(modalCount + 1)).waitFor({ state: "visible" })
				if (await this.locators.selectOptions.count()) {
					if (value === null) {
						await input.selectOption({ index: 0 });
					} else {
						await input.fill(value);
						await input.selectOption({ label: value });
					}
				} else {
					break
				}
				break;
			case 'text':
				await input.fill(value ?? '');
				break;
			default:
				throw new Error(`Unsupported input type "${inputType}"`);
		}
	}
}

class Locators {
	page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	button(name: string) {
		return this.page.locator(`button[data-test-id='${name}']`);
	}

	input(name: string) {
		return this.page.locator(`//*[contains(text(), "${name}")]/following::div[position()=1]`).locator("input,textarea");
	}

	get selectOptions() {
		return this.page.locator(`//div[contains(@class,'select-dropdown') and not (contains(@class,'dropdown-hidden'))]`)
	}

	get modal() {
		return this.page.locator(`//div[contains(@class,"modal-content")]`);
	}
}