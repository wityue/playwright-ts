import type { Page, Locator } from 'playwright-core';
import { test } from '@playwright/test'

export default class Table {
    readonly tableLocator: Locator
    constructor(private page: Page, private tableUniqueText: string) {
        this.page = page;
        this.tableLocator = this.page.locator('//div[contains(@class,"singleTable")]').filter({ hasText: `${this.tableUniqueText}` });
    }
    
    private async getTableHeaders(): Promise<string[]> {
        const headerTexts = await test.step('Query table headers and return a list', async () => {
            await this.tableLocator.waitFor({ state: "visible" });
            const headers = await this.tableLocator.locator('thead tr th').all();
            const headerTexts = await Promise.all(headers.map(async (header) => {
                return await header.innerText();
            }));
            return headerTexts;
        });
        return headerTexts;
    }

    /**
     * 根据行和列的索引或文本,返回单元格的元素定位器
     * @param row 行索引或文本
     * @param col 列索引或文本
     * @returns 返回单元格的元素定位器
     */
    public async getCellLocator(row: string | number, col: string | number): Promise<Locator> {
        let rowLocator: Locator;
        let col_index: number;
        if (typeof row === 'string') {
            rowLocator = this.tableLocator.locator(`tbody tr`).filter({ has: this.page.getByText(`${row}`, { exact: true }) });
        } else {
            rowLocator = this.tableLocator.locator('tbody').locator('tr').locator("visible=True").nth(row - 1);
        }
        if (typeof col === 'string') {
            const headerTexts = await this.getTableHeaders();
            col_index = headerTexts.indexOf(col);
        } else {
            col_index = col;
        }
        return rowLocator.locator(`td:nth-child(${col_index + 1})`);
    }

}