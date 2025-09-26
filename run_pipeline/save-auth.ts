import { chromium } from '@playwright/test';
import { gitlabConfig } from './config';
import { onLogin } from './utils';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(gitlabConfig.url);

  await onLogin(page);

  console.log('👉 请在浏览器里手动完成登录，然后在终端按 Ctrl+C 停止');

  // 每 5 秒保存一次登录状态，直到你手动退出
  setInterval(async () => {
    await context.storageState({ path: 'auth.json' });
    console.log('已保存 auth.json');
  }, 1000*5);
})();
