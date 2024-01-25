import type { Page, Locator } from "playwright-core";
import { test } from "@playwright/test";
import { Locators } from "./Locators";
import { Table } from "./Table";

export default class PageComponent {
  public page: Page;
  public readonly componentType: string;
  private _locators: Locators;
  constructor(page: Page) {
    this.page = page;
    this.componentType = "OCANT";
  }

  get locators(){
    if (this._locators?.page !== this.page){
      this._locators = new Locators(this.page)
    }
    return new Locators(this.page)
  }

  async goto(path: string) {
    await this.page.goto(`main#${path}`);
  }

  public async click提交() {
    await this.locators.button("提交").click();
  }

  public async click确定() {
    await this.locators.button("确定").click();
  }

  public async click新建() {
    await this.locators.button("新建").click();
  }

  /**
   * 生成表格
   * @param tableUniqueText 表格的唯一文本标识符
   * @returns 表格对象
   */
  public table(tableUniqueText: string) {
    return new Table(this.page, tableUniqueText);
  }

  /**
   * 等待动画结束
   * @param locator 元素的定位器
   */
  public async waitForAnimationEnd(locator: Locator) {
    await locator.evaluate((element) =>
      Promise.all(
        element.getAnimations().map((animation) => animation.finished)
      )
    );
  }

  /**
   * 填写表单
   * @param fields 字段名和值的映射
   */
  public async fillForm(
    fields: Map<string | Locator, string | null | Array<string>>
  ) {
    for (const [field, value] of Object.entries(fields)) {
      await test.step(`fill ${value} to ${field}`, async () => {
        let inputAncestors: Locator;
        if (typeof field === "string") {
          inputAncestors = this.locators.locatorFollowingLabel(field);
        } else {
          inputAncestors = field;
        }
        if (!inputAncestors) {
          throw new Error(`Input field "${field}" not found`);
        }
        await this.waitForAnimationEnd(inputAncestors);
        switch (this.componentType) {
          case "OCANT":
            await this.fillOcAntForm(inputAncestors, value);
            break;
          case "C7N":
            await this.fillC7nForm(inputAncestors, value);
            break;
          case "ANT":
            // Implement ANT specific logic here
            break;
          default:
            throw new Error(
              `Unsupported component type "${this.componentType}"`
            );
        }
      });
      continue;
    }
  }

  public async fillTable() {
    // Implement fillTable() method here
  }

  private async fillOcAntForm(
    inputAncestors: Locator,
    value: string | null | Array<string>
  ) {
    const input = inputAncestors.locator("input,textarea");
    const isSelect = await inputAncestors
      .locator(this.locators.hasSelect)
      .count();
    if (isSelect) {
      // Implement select method here
      return;
    }
    const isCascader = await inputAncestors
      .locator(this.locators.hasCascader)
      .count();
    if (isCascader) {
      // Implement cascader method here
      return;
    }
    await input.fill(value as string);
  }

  private async fillC7nForm(input: Locator, value: string | null) {
    const inputType = await input.getAttribute("type");
    const modalCount = await this.locators.modal.count();
    input.click();
    switch (inputType) {
      case "search":
        await this.locators.selectOptions
          .or(this.locators.modal.nth(modalCount + 1))
          .waitFor({ state: "visible" });
        if (await this.locators.selectOptions.count()) {
          if (value === null) {
            await input.selectOption({ index: 0 });
          } else {
            await input.fill(value);
            await input.selectOption({ label: value });
          }
        } else {
          break;
        }
        break;
      case "text":
        await input.fill(value ?? "");
        break;
      default:
        throw new Error(`Unsupported input type "${inputType}"`);
    }
  }

  public async waitForNetworkIdle(options?: { timeout: number }) {
    // 存初次lastResponseEndTime,当循环3次lastResponseEndTime无变化时,认定页面稳定,退出循环
    const tempTime = await this.page.evaluate(() => window.lastResponseEndTime);
    let count = 3
    const startTime = Date.now();
    const { timeout = 30000 } = options || {};
    await test.step("waitForNetworkIdle", async () => {
      while (Date.now() - startTime < timeout && count) {
        const apiCounter = await this.page.evaluate(() => window.apiCounter);
        const lastResponseEndTime = await this.page.evaluate(
          () => window.lastResponseEndTime
        );
        if (!apiCounter && Date.now() - lastResponseEndTime >= 500) {
          if (lastResponseEndTime !== tempTime) {
            return;
          } else {
            count--;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    });
  }
}
