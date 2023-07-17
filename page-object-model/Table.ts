import type { Page, Locator } from "playwright-core";
import { test } from "@playwright/test";
import { Locators } from "./Locators";

export class Table {
  private locators: Locators;
  private readonly tableLocator: Locator;

  /**
   * 构造函数
   * @param page 页面对象
   * @param tableUniqueText 表格唯一文本,可以接收一组文本。
   */
  constructor(private page: Page, private tableUniqueText: string | string[]) {
    this.locators = new Locators(page);
    if (typeof tableUniqueText === "string") {
      this.tableLocator = this.locators.table.filter({
        hasText: `${this.tableUniqueText}`,
      });
    } else {
      this.tableLocator = tableUniqueText.reduce(
        (acc, text) => acc.filter({ hasText: text }),
        this.locators.table
      );
    }
  }

  private async getTableHeaders(): Promise<string[]> {
    return await test.step(
      "Query table headers and return a list",
      async () => {
        await this.tableLocator.waitFor({ state: "visible" });
        const headers = await this.tableLocator.locator("thead tr th").all();
        return Promise.all(headers.map((header) => header.innerText()));
      }
    );
  }

  /**
   * 根据行和列的索引或文本,返回单元格的元素定位器
   * @param row 行索引或文本
   * @param col 列索引或文本
   * @returns 返回单元格的元素定位器
   */
  public async getCellLocator(
    row: string | number,
    col: string | number
  ): Promise<Locator> {
    const rowLocator = this.getRowLocator(row);
    const colIndex = await this.getColumnIndex(col);
    return rowLocator.locator(`td:nth-child(${colIndex + 1})`);
  }

  private getRowLocator(row: string | number): Locator {
    if (typeof row === "string") {
      return this.tableLocator
        .locator(`tbody tr`)
        .filter({ has: this.page.getByText(`${row}`, { exact: true }) });
    } else {
      return this.tableLocator
        .locator("tbody tr")
        .locator("visible=true")
        .nth(row - 1);
    }
  }

  private async getColumnIndex(col: string | number): Promise<number> {
    if (typeof col === "string") {
      const headerTexts = await this.getTableHeaders();
      return headerTexts.indexOf(col);
    } else {
      return col;
    }
  }
}
