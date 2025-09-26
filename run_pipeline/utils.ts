import { Browser, BrowserContext, chromium, Page } from "@playwright/test";
import { gitlabConfig } from "./config";

export async function onLogin(page: Page) {
  // input username
  await page.fill("#user_login", gitlabConfig.username);
  await page.fill("#user_password", gitlabConfig.password);
  await page.click(
    "body > div.gl-h-full.gl-flex.gl-flex-wrap > div.container.gl-self-center > div > div.gl-my-5 > div.gl-w-full.gl-ml-auto.gl-mr-auto.bar > div.js-non-oauth-login > form > button"
  );
  //   await page.waitForLoadState("networkidle");
}

export async function save_auth() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(gitlabConfig.url);

  await onLogin(page);

  console.log("👉 请在浏览器里手动完成登录，然后在终端按 Ctrl+C 停止");

  // 每 5 秒保存一次登录状态，直到你手动退出
  setInterval(async () => {
    await context.storageState({ path: "auth.json" });
    console.log("已保存 auth.json");
  }, 1000 * 5);
}

export async function openUrl(
  url: string,
  headless: boolean = false
): Promise<{ browser: Browser; page: Page; context: BrowserContext }> {
  // 启动浏览器
  const browser = await chromium.launch({
    headless,
    slowMo: 50, // 添加延迟以便观察操作
  });
  const context = await browser.newContext({ storageState: "auth.json" });
  const page = await context.newPage();


  // 创建新页面
  //   const page = await browser.newPage();

  // 设置视口大小
  await page.setViewportSize({ width: 1280, height: 720 });

  // 导航到指定 URL
  await page.goto(url);

  // 等待页面加载完成
  await page.waitForLoadState("networkidle");


  // 等待 1 秒
  await page.waitForTimeout(1000);

  // 如果跳转 gitlab 登录页面，则登录
  if (url.includes("users/sign_in")) {
    await save_auth()
    await page.waitForTimeout(1000 * 5);

    return openUrl(url, headless);
  }



  console.log(`已成功打开 URL: ${url}`);

  return { browser, page, context };
}
