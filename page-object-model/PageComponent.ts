import type { Page, Locator } from 'playwright-core';
import Table from './Table'

export default abstract class PageComponent {
	public readonly page: Page;
	public readonly componentType: string;
	public locators: Locators
	constructor(page: Page) {
		this.page = page;
		this.componentType = "OCANT";
		this.locators = new Locators(page);
	}

	async goto(path: string) {
        await this.page.goto(`main#${path}`);
    }

	public async click提交() {
		await this.locators.button("提交").click()
	}

	public async click确定() {
		await this.locators.button("确定").click()
	}

	public async click新建() {
		await this.locators.button("新建").click()
	}

	
	/**
	 * 生成表格
	 * @param tableUniqueText 表格的唯一文本标识符
	 * @returns 表格对象
	 */
	public table(tableUniqueText: string){
		return new Table(this.page, tableUniqueText)
	}

	/**
	 * 等待动画结束
	 * @param locator 元素的定位器
	 */
	public async waitForAnimationEnd(locator: Locator) {
		await locator.evaluate((element) => Promise.all(
			element
				.getAnimations()
				.map((animation) => animation.finished)
		));
	}

	
	/**
	 * 填写表单
	 * @param fields 字段名和值的映射
	 */
	public async fillForm(fields: Map<string | Locator, string | null | Array<string>>) {
		for (const [field, value] of Object.entries(fields)) {
			let inputAncestors: Locator;
			if (typeof field === 'string') {
				inputAncestors = this.locators.inputAncestors(field);
			} else {
				inputAncestors = field;
			}
			if (!inputAncestors) {
				throw new Error(`Input field "${field}" not found`);
			}
			await this.waitForAnimationEnd(inputAncestors);
			switch (this.componentType) {
				case 'OCANT':
					await this.fillOcAntForm(inputAncestors, value);
					break
				case 'C7N':
					await this.fillC7nForm(inputAncestors, value);
					break;
				case 'ANT':
					// Implement ANT specific logic here
					break;
				default:
					throw new Error(`Unsupported component type "${this.componentType}"`);
			}
			continue;
		}
	}

	public async fillTable() {
		// Implement fillTable() method here
	}

	private async fillOcAntForm(inputAncestors: Locator, value: string | null | Array<string>) {
		const input = inputAncestors.locator("input,textarea")
		const isSelect = await inputAncestors.locator(this.locators.hasSelect).count()
		if (isSelect) {
			// Implement select method here
			return
		}
		const isCascader = await inputAncestors.locator(this.locators.hasCascader).count()
		if (isCascader) {
			// Implement cascader method here
			return
		}
		await input.fill(value as string);
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

	/**
	 * 获取包含'select'的元素的定位器
	 * 项目可根据实际情况修改此定位器
	 * @returns 元素的定位器
	 */
	get hasSelect(): Locator {
		return this.page.locator("//*[contains(class, 'select')]")
	}

	/**
	 * 获取包含'cascader'的元素的定位器
	 * 项目可根据实际情况修改此定位器
	 * @returns 元素的定位器
	 */
	get hasCascader(): Locator {
		return this.page.locator("//*[contains(class, 'cascader')]")
	}

	button(name: string): Locator {
		// name中间不包含空格且为中文时,字符间加入空格,以使用正则匹配
		if (!name.includes(' ') && /^[\u4e00-\u9fa5]+$/.test(name) ) {
			const regex = new RegExp(name.split('').join('.*'), 'i');
			return this.page.locator(`button`).filter({ has: this.page.getByText(regex, { exact: true }) });
		} else {
			return this.page.locator(`button`).filter({ has: this.page.getByText(name, { exact: true }) });
		}
	}

	/**
	 * 取lable后第一个包含input或textarea的元素,便于判断input输入类型
	 * @param name label标签的文本
	 * @param nth 第几个label标签
	 * @returns input或textarea元素的祖先元素的定位器
	 */

	inputAncestors(name: string, nth = -1): Locator {
		const regex = new RegExp(`^\\s*${name}\\s*$`, 'i');
		return this.page.locator("label").filter({ has: this.page.getByText(regex, { exact: true }) }).nth(nth).locator("xpath=/following::*[position()=1]").filter({ has: this.page.locator("input,textarea") })
	}

	/**
	 * 通过label标签获取input或textarea元素
	 * @param name label标签的文本
	 * @param nth 第几个label标签
	 * @returns input或textarea元素的定位器
	 */
	input(name: string, nth = -1): Locator {
		const regex = new RegExp(`^\\s*${name}\\s*$`, 'i');
		return this.page.locator("label").filter({ hasText: regex }).nth(nth).locator("xpath=/following::*[position()=1]").locator("input,textarea")
	}

	get selectOptions(): Locator {
		return this.page.locator(`//div[contains(@class,'select-dropdown') and not (contains(@class,'dropdown-hidden'))]`)
	}

	get modal(): Locator {
		return this.page.locator(`//div[contains(@class,"modal-content")]`)
	}
}