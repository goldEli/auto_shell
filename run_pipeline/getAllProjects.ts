import { Browser, chromium, Page } from "playwright";
import { gitlabConfig } from "./config";
import { onLogin } from "./utils";

/**
 * 使用 Playwright 打开指定 URL 的方法
 * @param url 要打开的网址
 * @param headless 是否以无头模式运行，默认为 false
 * @returns Promise<{ browser: Browser, page: Page }>
 */
export async function openUrl(
  url: string,
  headless: boolean = false
): Promise<{ browser: Browser; page: Page }> {
  // 启动浏览器
  const browser = await chromium.launch({
    headless,
    slowMo: 50, // 添加延迟以便观察操作
  });
  const context = await browser.newContext({ storageState: 'auth.json' });
  const page = await context.newPage();

  // 创建新页面
//   const page = await browser.newPage();

  // 设置视口大小
  await page.setViewportSize({ width: 1280, height: 720 });

  // 导航到指定 URL
  await page.goto(url);

  // 等待页面加载完成
  await page.waitForLoadState("networkidle");

  console.log(`已成功打开 URL: ${url}`);

  return { browser, page };
}



export async function getProjects(page: Page) {
    // loop #__BVID__168 > div > ul > li
    const liLocator = await page.locator('div.tab-content.gl-tab-content ul.gl-list-none > li').all();

    // console.log(liLocator)
    const projectList: { name: string; href: string }[] = [];

    for (const li of liLocator) {
        const projectName = await li.locator(".gl-avatar-labeled-label").textContent();
        const href = await li.locator("a.gl-avatar-link.gl-link.gl-link-meta").getAttribute("href");
        projectList.push({ name: projectName || "", href: href || "" });
    }

    return projectList;

    // const count = await liLocator.count();
    // console.log(`共有 ${count} 个 li`);
  
    // for (let i = 0; i < count; i++) {
    //   const li = liLocator.nth(i);
    //   const text = await li.innerText();
    //   console.log(`第 ${i + 1} 个 li: ${text}`);
  
    //   // 如果需要操作 li，比如点击
    //   // await li.click();
    // }
    // const projects = await page.locator("ul.gl-list-none > li").all();
    // console.log(projects)
    
    // const projectList: { name: string; href: string }[] = [];
    // for (const project of projects) {
    //     const projectName = await project.locator("a > span").textContent();
    //     const href = await project.locator("a").getAttribute("href");
    //     projectList.push({ name: projectName || "", href: href || "" });
    // }
    // return projectList;
}

async function main() {
  // open https://git.weex.tech/
  const { browser, page } = await openUrl("https://git.weex.tech/");

//   await onLogin(page);

  const projectList = await getProjects(page);
  console.log(projectList);

  // wait for 10 seconds
  await page.waitForTimeout(1000 * 60 * 60 * 24);

  await browser.close();
}

main();
