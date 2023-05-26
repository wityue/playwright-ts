import type { Page, Locator } from 'playwright-core';

export class Locators {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    get table(): Locator {
        return this.onlyVisible(this.page.locator('//div[contains(@class,"singleTable")]'), true)
    }

    button(name: string, onlyVisible = true): Locator {
        let buttonLocator = this.page.locator(`button`)
        // name中间不包含空格且为中文时,字符间加入空格,以使用正则匹配
        if (!name.includes(' ') && /^[\u4e00-\u9fa5]+$/.test(name)) {
            const regex = new RegExp(name.split('').join('.*'), 'i');
            buttonLocator = buttonLocator.filter({ has: this.page.getByText(regex, { exact: true }) });
        } else {
            buttonLocator = buttonLocator.filter({ has: this.page.getByText(name, { exact: true }) });
        }
        return this.onlyVisible(buttonLocator, onlyVisible)
    }

    /**
     * lable后的第一个元素,用于定位字段后的输入框或只读文本
     * @param name label标签的文本
     * @param nth 第几个label标签
     * @returns label后的第一个元素
     */
    locatorFollowingLabel(name: string, nth = -1, onlyVisible = true): Locator {
        const regex = new RegExp(`^\\s*${name}\\s*$`, 'i');
        const locator = this.page.locator("label").filter({ has: this.page.getByText(regex, { exact: true }) }).nth(nth).locator("xpath=/following::*[position()=1]")
        return this.onlyVisible(locator, onlyVisible)
    }

    /**
     * 通过label标签获取input或textarea元素
     * @param name label标签的文本
     * @param nth 第几个label标签
     * @returns input或textarea元素的定位器
     */
    input(name: string, nth = -1, onlyVisible = true): Locator {
        return this.locatorFollowingLabel(name, nth, onlyVisible).locator("input,textarea")
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

    get selectOptions(): Locator {
        return this.page.locator(`//div[contains(@class,'select-dropdown') and not (contains(@class,'dropdown-hidden'))]`)
    }

    get modal(): Locator {
        return this.page.locator(`//div[contains(@class,"modal-content")]`)
    }


    /**
     * 根据visible参数过滤定位器
     * @param locator 元素的定位器
     * @param visible 是否只返回可见元素
     * @returns 过滤后的定位器
     */
    onlyVisible(locator: Locator, visible?: boolean): Locator {
        if (visible) {
            return locator.filter({ has: this.page.locator("visible=true") });
        }
        return locator;
    }
}