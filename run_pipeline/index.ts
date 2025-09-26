import { gitlabConfig } from "./config";
import { Page } from "playwright";

export async function onLogin(page: Page) {
  // input username
  await page.fill("#user_login", gitlabConfig.username);
  await page.fill("#user_password", gitlabConfig.password);
  await page.click(
    "body > div.gl-h-full.gl-flex.gl-flex-wrap > div.container.gl-self-center > div > div.gl-my-5 > div.gl-w-full.gl-ml-auto.gl-mr-auto.bar > div.js-non-oauth-login > form > button"
  );
//   await page.waitForLoadState("networkidle");
}