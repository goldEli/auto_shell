import { Browser, BrowserContext, Page } from "playwright";
import path from "path";
import { gitlabConfig } from "./config.js";
import { openUrl } from "./utils.js";

export interface Project {
  name: string;
  href: string;
}

export class PipelineExecutor {
  /**
   * Execute pipeline for multiple projects
   * @param projects Array of projects to process
   * @param branch Branch name to use for pipeline
   */
  async executePipelines(projects: Project[], branch: string): Promise<void> {
    console.log(`🚀 Starting to process ${projects.length} projects with branch: ${branch}`);
    const { browser, page, context } = await openUrl(gitlabConfig.url);
    
    try {
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        console.log(`\n📋 Processing project ${i + 1}/${projects.length}: ${project.name}`);
        await this.executePipeline({project, context, branch, browser, page});
      }
    } finally {
      // Close browser when done
      // await browser.close();
    }
  }

  /**
   * Execute pipeline for a single project
   * @param project Project to process
   * @param browser Browser instance
   * @param page Page instance
   * @param branch Branch name to use for pipeline
   */
  private async executePipeline(options: { project: Project, browser: Browser, page: Page, context: BrowserContext, branch: string }): Promise<void> {
    const {project,  context, branch} = options
    console.log("========================================");
    console.log(`🎯 Processing project: ${project.name}`);
    console.log(`📍 Path: ${project.href}`);
    console.log(`🌿 Branch: ${branch}`);
    console.log("========================================");
    
    const url = path.join(gitlabConfig.url, project.href, '/-/pipelines');
    const page = await context.newPage();
    await page.goto(url);

    // Click new pipeline button
    console.log("click new pipeline");
    await page.click('[data-testid="run-pipeline-button"]');

    // Click branch dropdown
    console.log("click branch dropdown");
    await page.click('#dropdown-toggle-btn-27');

    // Wait for dropdown to open
    console.log("wait for 1 second");
    await page.waitForTimeout(1000);

    // Input branch name
    console.log("input branch");
    await page.fill('[data-testid="listbox-search-input"]', branch);

    // Wait for search results
    console.log("wait for 1 second");
    await page.waitForTimeout(1000);

    // Press enter to select branch
    console.log("press enter");
    await page.keyboard.press('Enter');

    // Wait for selection
    console.log("wait for 1 second");
    await page.waitForTimeout(1000);

    // Click run pipeline button
    console.log("run pipeline");
    await page.click('[data-testid="run-pipeline-button"]');

    // Click run all manual jobs
    console.log("click run all manual");
    page.click('[title="Run all manual"]');

  }

  /**
   * Execute pipeline for a single project with new browser instance
   * @param project Project to process
   * @param branch Branch name to use for pipeline
   */
  async executeSinglePipeline(project: Project, branch: string): Promise<void> {
    console.log(`🚀 Starting to process single project: ${project.name}`);
    const { browser, page, context } = await openUrl(gitlabConfig.url);
    
    try {
      await this.executePipeline({project, context, branch, browser, page});
    } finally {
      // await 10 s

      // await browser.close();
    }
  }
}
