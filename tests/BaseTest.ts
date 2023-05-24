import { test as base, TestInfo } from '@playwright/test';
import type { Browser, BrowserContext, Page, Response, WebSocket } from 'playwright-core';
import PagesInstance from './PagesInstance'


async function newContext(
  browser: Browser,
  testInfo: TestInfo,
  账户名 = "未指定用户"): Promise<{
    context: BrowserContext,
    close: (testInfo: TestInfo) => Promise<void>
  }> {
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
  await test.step('DeleteFromTheHtmlreport-监听', async () => {
    context.on('response', data => ListenResponse(data));
    context.on('page', page => onPage(pages, page));
  })
  async function close(testInfo: TestInfo): Promise<void> {
    await context.close()
    const testFailed = testInfo.status !== testInfo.expectedStatus;
    const preserveVideo = captureVideo && (videoMode === 'on' || testFailed && videoMode === 'retain-on-failure' || videoMode === 'on-first-retry' && testInfo.retry === 1);
    let counter = 0;
    if (preserveVideo) {
      await Promise.all(pages.map(async (page: Page) => {
        try {
          const savedPath = testInfo.outputPath(`${账户名}${counter ? '-' + counter : ''}.webm`);
          ++counter;
          await page.video()?.saveAs(savedPath);
          await page.video()?.delete();
          testInfo.attachments.push({
            name: 账户名,
            path: savedPath,
            contentType: 'video/webm'
          });
        } catch (e) {
          // Silent catch empty videos.
        }
      }));
    }
  }
  return { context, close }
}

async function newPage(context: BrowserContext, 账户名 = "未指定用户"): Promise<Page> {
  const page = await test.step(`${账户名}-启动Page`, async () => {
    return await context.newPage()
  })
  return page
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

interface WSMessage {
  message: {
    subject?: string;
    content?: string;
  };
}

async function ListenWebScoket(page: Page, ws: WebSocket): Promise<void> {
  const wsmsg = await new Promise(resolve => {
    ws.on('framereceived', event => {
      console.log(event.payload);
      resolve(event.payload);
    });
  });
  // Extract subject and content from wsmsg if it contains message with subject or content
  let subject: string = '', content: string = '';
  if (wsmsg && typeof wsmsg === 'object' && (wsmsg as WSMessage).message) {
    const message = (wsmsg as WSMessage).message;
    subject = message.subject || '';
    content = message.content || '';
    // remove html tag
    content = content.replace(/<\/?[^>]+(>|$)/g, '');
  }
  let popup = page.locator(".c7n-notification-notice:has(.c7n-notification-notice-icon:not(.icon))").locator( "visible=True" )
  if (subject) {
    popup = popup.filter({ hasText: subject });
  }
  if (content) {
    for (const char of content) {
      popup = popup.filter({ hasText: char })
    }
  }
  await popup.evaluate(node => node.style.display = 'none')
}

async function ListenResponse(response: Response): Promise<void> {
  await test.step('DeleteFromTheHtmlreport-监听', async () => {
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
  pages.push(page)
  await test.step('DeleteFromTheHtmlreport-监听', async () => {
    page.on('websocket', ws => ListenWebScoket(page, ws))
  })
}

type Accounts = {
  user_1: PagesInstance;
  user_2: PagesInstance;
  manager: PagesInstance;
  empty: PagesInstance
};

base.beforeAll(async ({ request }) => {
  // 登录有所账号
});

// Extend base test by providing "Accounts"
// This new "test" can be used in multiple test files, and each of them will get the fixtures.
export const test = base.extend<Accounts>({
  user_1: async ({ browser }, use, testInfo): Promise<void> => {
    const { context, close } = await newContext(browser, testInfo, "user_1")
    await use(new PagesInstance(await newPage(context, 'user_1')));
    await close(testInfo);
  },

  user_2: async ({ browser }, use, testInfo): Promise<void> => {
    const { context, close } = await newContext(browser, testInfo, "user_2")
    await use(new PagesInstance(await newPage(context, 'user_2')));
    await close(testInfo);
  },

  manager: async ({ browser }, use, testInfo): Promise<void> => {
    const { context, close } = await newContext(browser, testInfo, "manager")
    await use(new PagesInstance(await newPage(context, 'manager')));
    await close(testInfo);
  },

  // 未登录账号Page.
  empty: async ({ browser }, use, testInfo): Promise<void> => {
    const { context, close } = await newContext(browser, testInfo)
    await use(new PagesInstance(await newPage(context)));
    await close(testInfo);
  },
});

export { expect } from '@playwright/test';
export { PagesInstance };