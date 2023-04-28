import { test as base } from '@playwright/test';
import type { Browser, BrowserContext, Page } from 'playwright-core';
import 登录页 from '../page-object-model/登录页';
import 合同查询 from '../page-object-model/合同查询';

async function ListenWebScoket(page: Page): Promise<void> {
  async function inner(ws: any): Promise<void> {
    /* 监听到WebSocket后操作 */
  }
}

async function Listen403Response(page: Page): Promise<() => Promise<void>> {
  async function inner(): Promise<void> {
    /* 监听到403后的操作 */
  }
  return inner;
}

async function ListenWarnResponse(page: Page): Promise<() => Promise<void>> {
  async function inner(): Promise<void> {
    /* 监听到警告后的操作 */
  }
  return inner;
}

async function ListenErrorResponse(page: Page): Promise<() => Promise<void>> {
  async function inner(): Promise<void> {
    /* 监听到错误后的操作 */
  }
  return inner;
}

class POM {
  page: Page;
  登录页: 登录页;
  合同查询: 合同查询;

  private static pages: Page[] = [];

  constructor(page: Page) {
    this.page = page;
    this.登录页 = new 登录页(this.page);
    this.合同查询 = new 合同查询(this.page);
  }

  static async create(browser: Browser, testInfo: any, 账户别名 = "未指定用户"): Promise<POM> {
    const video = testInfo.project.use.video;
    const videoMode = this.normalizeVideoMode(video);
    const captureVideo = this.shouldCaptureVideo(videoMode, testInfo);
    const videoOptions = captureVideo ? {
      recordVideo: {
        dir: testInfo.outputDir,
        size: typeof video === 'string' ? undefined : video.size
      }
    } : {};
    const context = await browser.newContext(videoOptions);
    context.on('page', page => this.pages.push(page));
    const page = await context.newPage();
    return new POM(page);
  }

  static async close(context: BrowserContext, testInfo: any, 账户别名 = "未指定用户"): Promise<void> {
    await context.close();
    const video = testInfo.project.use.video;
    const videoMode = this.normalizeVideoMode(video);
    const captureVideo = this.shouldCaptureVideo(videoMode, testInfo);
    const testFailed = testInfo.status !== testInfo.expectedStatus;
    const preserveVideo = captureVideo && (videoMode === 'on' || testFailed && videoMode === 'retain-on-failure' || videoMode === 'on-first-retry' && testInfo.retry === 1);
    let counter = 0;
    if (preserveVideo) {
      await Promise.all(this.pages.map(async (page) => {
        try {
          const savedPath = testInfo.outputPath(`${账户别名}${counter ? '-' + counter : ''}.webm`);
          ++counter;
          await page.video()?.saveAs(savedPath);
          await page.video()?.delete();
          testInfo.attachments.push({
            name: 账户别名,
            path: savedPath,
            contentType: 'video/webm'
          });
        } catch (e) {
          // Silent catch empty videos.
        }
      }));
    }
  }

  private static normalizeVideoMode(video: any): string {
    if (!video) return 'off';
    let videoMode = typeof video === 'string' ? video : video.mode;
    if (videoMode === 'retry-with-video') videoMode = 'on-first-retry';
    return videoMode;
  }

  private static shouldCaptureVideo(videoMode: string, testInfo: any): boolean {
    return videoMode === 'on' || videoMode === 'retain-on-failure' || videoMode === 'on-first-retry' && testInfo.retry === 1;
  }
}

type Accounts = {
  租户管理员: POM;
  Flx业务员1_1: POM;
};

base.beforeAll(async ({ request }) => {
  // 登录有所账号
});

// Extend base test by providing "Accounts"
// This new "test" can be used in multiple test files, and each of them will get the fixtures.
export const test = base.extend<Accounts>({
  租户管理员: async ({ browser }, use, testInfo): Promise<void> => {
    const pom = await POM.create(browser, testInfo);
    await use(pom);
    await POM.close(pom.page.context(), testInfo, "租户管理员");
  },
  Flx业务员1_1: async ({ browser }, use, testInfo): Promise<void> => {
    const pom = await POM.create(browser, testInfo);
    await use(pom);
    await POM.close(pom.page.context(), testInfo, "Flx业务员1_1");
  }
});

export { expect } from '@playwright/test';