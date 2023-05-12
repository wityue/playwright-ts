import { test as base, TestInfo } from '@playwright/test';
import type { Browser, BrowserContext, Page, Response, WebSocket } from 'playwright-core';
import PagesInstance from './PagesInstance'


async function newContext(
  browser: Browser,
  testInfo: TestInfo,
  账户别名 = "未指定用户"): Promise<{ context: BrowserContext, close: (testInfo: TestInfo) => Promise<void> }> {
  const pages = []
  const video = testInfo.project.use.video;
  const videoMode = normalizeVideoMode(video);
  const captureVideo = shouldCaptureVideo(videoMode, testInfo);
  const videoOptions = captureVideo ? {
    recordVideo: {
      dir: testInfo.outputDir,
      size: typeof video === 'string' ? undefined : video?.size
    }
  } : {};
  const context = await browser.newContext(videoOptions);
  context.on('response', data => ListenResponse(data));
  context.on('page', page => onPage(pages, page));
  async function close(testInfo: TestInfo): Promise<void> {
    await context.close()
    const testFailed = testInfo.status !== testInfo.expectedStatus;
    const preserveVideo = captureVideo && (videoMode === 'on' || testFailed && videoMode === 'retain-on-failure' || videoMode === 'on-first-retry' && testInfo.retry === 1);
    let counter = 0;
    if (preserveVideo) {
      await Promise.all(pages.map(async (page: Page) => {
        try {
          const savedPath = testInfo.outputPath(`${账户别名}${counter ? '-' + counter : ''}.webm`);
          ++counter;
          console.log(savedPath)
          await page.video()?.saveAs(savedPath);
          console.log(`${账户别名}--saved`)
          await page.video()?.delete();
          console.log(`${账户别名}--deleted`)
          testInfo.attachments.push({
            name: 账户别名,
            path: savedPath,
            contentType: 'video/webm'
          });
          console.log(`${账户别名}--attached`)
        } catch (e) {
          // Silent catch empty videos.
        }
      }));
    }
  }
  return { context, close }
}

function normalizeVideoMode(video: any): string {
  if (!video) return 'off';
  let videoMode = typeof video === 'string' ? video : video.mode;
  if (videoMode === 'retry-with-video') videoMode = 'on-first-retry';
  return videoMode;
}

function shouldCaptureVideo(videoMode: string, testInfo: TestInfo): boolean {
  return videoMode === 'on' || videoMode === 'retain-on-failure' || videoMode === 'on-first-retry' && testInfo.retry === 1;
}

async function ListenWebScoket(page: Page, ws: WebSocket): Promise<void> {
  const wsmsg = await new Promise(resolve => {
    ws.on('framereceived', event => {
      console.log(event.payload);
      resolve(event.payload);
    });
  });
  const popup = page.locator(".c7n-notification-notice:has(.c7n-notification-notice-icon:not(.icon))").filter({ hasText: wsmsg as string });
  await popup.evaluate(node => node.style.display = 'none')
}

async function ListenResponse(response: Response): Promise<void> {
  await test.step('报告移除-监听', async () => {
    if (!response.url().includes('https://cdn-')) {
      if (response.status() === 403) {
        console.log("Response status code is 403");
      } else if (response.status() === 200 && await response.headerValue('Content-Type') === 'application/json') {
        try {
          const resJson = await response.json();
          if (resJson.failed) {
            console.log(resJson.message);
          }
        } catch (e) {
          // Silent catch empty videos.
        }
      }
    }
  })
}

async function onPage(pages: Array<Page>, page: Page) {
  await test.step('报告移除-监听', async () => {
    pages.push(page)
    page.on('websocket', ws => ListenWebScoket(page, ws))
  })
}

type Accounts = {
  租户管理员: PagesInstance;
  Flx业务员1_1: PagesInstance;
};

base.beforeAll(async ({ request }) => {
  // 登录有所账号
});

// Extend base test by providing "Accounts"
// This new "test" can be used in multiple test files, and each of them will get the fixtures.
export const test = base.extend<Accounts>({
  租户管理员: async ({ browser }, use, testInfo): Promise<void> => {
    const { context, close } = await newContext(browser, testInfo, "租户管理员")
    await use(new PagesInstance(await context.newPage()));
    await close(testInfo)
  },

  Flx业务员1_1: async ({ browser }, use, testInfo): Promise<void> => {
    const { context, close } = await newContext(browser, testInfo, "Flx业务员1_1")
    await use(new PagesInstance(await context.newPage()));
    await close(testInfo)
  }
});

export { expect } from '@playwright/test';