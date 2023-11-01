import { test as base, expect, TestInfo } from "@playwright/test";
import type {
  Browser,
  BrowserContext,
  Page,
} from "playwright-core";
import PagesInstance from "./PagesInstance";

declare global {
  interface Window {
    apiCounter: number;
    lastResponseEndTime: number;
  }
}

async function newContext(
  browser: Browser,
  testInfo: TestInfo,
  账户名 = "未指定用户"
): Promise<{
  context: BrowserContext;
  close: (testInfo: TestInfo) => Promise<void>;
}> {
  let pages: Page[] = [];
  const video = testInfo.project.use.video;
  const videoMode = normalizeVideoMode(video);
  const captureVideo = shouldCaptureVideo(videoMode, testInfo);
  const videoOptions = captureVideo
    ? {
        recordVideo: {
          dir: testInfo.outputDir,
          size: typeof video === "string" ? undefined : video?.size,
        },
      }
    : {};
  const context = await browser.newContext(videoOptions);
  context.on("dialog", async (dialog) => { 
    const message = dialog.message(); 
    await dialog.accept();
    expect.soft(message, { message: "API报错：" + message }).not.toContain("failInfo")
  })
  context.on("page", (page) => pages.push(page));

  // 使用MutationObserver监听DOM变化，结合PerformanceObserver获取最后一次响应的返回时间，以达到loading时禁止点击输入等操作.
  await context.addInitScript({
    path: __dirname + "/../tools/ajaxHooker.js",
  });
  await context.addInitScript({
    path: __dirname + "/../tools/apiObserver.js",
  });
  await context.addInitScript({
    path: __dirname + "/../tools/domObserver.js",
  });

  async function close(testInfo: TestInfo): Promise<void> {
    await context.close();
    const testFailed = testInfo.status !== testInfo.expectedStatus;
    const preserveVideo =
      captureVideo &&
      (videoMode === "on" ||
        (testFailed && videoMode === "retain-on-failure") ||
        (videoMode === "on-first-retry" && testInfo.retry === 1));
    let counter = 0;
    if (preserveVideo) {
      await Promise.all(
        pages.map(async (page: Page) => {
          try {
            const savedPath = testInfo.outputPath(
              `${账户名}${counter ? "-" + counter : ""}.webm`
            );
            ++counter;
            await page.video()?.saveAs(savedPath);
            await page.video()?.delete();
            testInfo.attachments.push({
              name: 账户名,
              path: savedPath,
              contentType: "video/webm",
            });
          } catch (e) {
            // Silent catch empty videos.
          }
        })
      );
    }
  }
  return { context, close };
}

async function newPage(
  context: BrowserContext,
  账户名 = "未指定用户"
): Promise<Page> {
  const page = await test.step(`${账户名}-启动Page`, async () => {
    return await context.newPage();
  });
  return page;
}

function normalizeVideoMode(video: any): string {
  if (!video) return "off";
  let videoMode = typeof video === "string" ? video : video.mode;
  if (videoMode === "retry-with-video") videoMode = "on-first-retry";
  return videoMode;
}

function shouldCaptureVideo(videoMode: string, testInfo: TestInfo): boolean {
  return (
    videoMode === "on" ||
    videoMode === "retain-on-failure" ||
    (videoMode === "on-first-retry" && testInfo.retry === 1)
  );
}

type Accounts = {
  user_1: PagesInstance;
  user_2: PagesInstance;
  manager: PagesInstance;
  empty: PagesInstance;
};

base.beforeAll(async ({}) => {
  // 登录有所账号
});

// Extend base test by providing "Accounts"
// This new "test" can be used in multiple test files, and each of them will get the fixtures.
export const test = base.extend<Accounts>({
  user_1: async ({ browser }, use, testInfo): Promise<void> => {
    const { context, close } = await newContext(browser, testInfo, "user_1");
    await use(new PagesInstance(await newPage(context, "user_1")));
    await close(testInfo);
  },

  user_2: async ({ browser }, use, testInfo): Promise<void> => {
    const { context, close } = await newContext(browser, testInfo, "user_2");
    await use(new PagesInstance(await newPage(context, "user_2")));
    await close(testInfo);
  },

  manager: async ({ browser }, use, testInfo): Promise<void> => {
    const { context, close } = await newContext(browser, testInfo, "manager");
    await use(new PagesInstance(await newPage(context, "manager")));
    await close(testInfo);
  },

  // 未登录账号Page.
  empty: async ({ browser }, use, testInfo): Promise<void> => {
    const { context, close } = await newContext(browser, testInfo);
    await use(new PagesInstance(await newPage(context)));
    await close(testInfo);
  },
});

export { expect } from "@playwright/test";
export { PagesInstance, newContext, newPage };
