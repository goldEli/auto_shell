import { Command } from "commander";
import inquirer from "inquirer";
import { gitlabConfig, projectList } from "./config.js";
import { openUrl } from "./utils.js";
import { Browser, Page } from "playwright";
import path from "path";

interface Project {
  name: string;
  href: string;
}

class ProjectSelector {
  private program: Command;
  selectedProjects: Project[] = [];
  inputBranchName: string = "";

  constructor() {
    this.program = new Command();
    this.setupCommands();
  }

  private async doProjects(projects: Project[], branch: string) {
    const  { browser, page } = await openUrl(gitlabConfig.url)
    for (const project of projects) {
      await this.doProject(project, browser, page, branch);
    }
  }

  private async doProject(project: Project, browser: Browser, page: Page, branch: string) {
    console.log("--------------------------------");
    console.log(`do project ${project.name} ${project.href}`);
    console.log("--------------------------------");
    const url = path.join(gitlabConfig.url, project.href, '/-/pipelines');
    await page.goto(url);

    // click new pipeline 
    // data-testid="run-pipeline-button"
    console.log("click new pipeline");
    await page.click('[data-testid="run-pipeline-button"]');

    // click branch dropdown,
    console.log("click branch dropdown");
    // await page.click('[data-testid="base-dropdown-toggle"]');
    await page.click('#dropdown-toggle-btn-27');

    // wait for 1 second
    console.log("wait for 1 second");
    await page.waitForTimeout(1000);


    // input branch
    console.log("input branch");
    await page.fill('[data-testid="listbox-search-input"]', branch);

    // wait for 1 second
    console.log("wait for 1 second");
    await page.waitForTimeout(1000);

    // press enter
    console.log("press enter");
    await page.keyboard.press('Enter');

    // wait for 1 second
    console.log("wait for 1 second");
    await page.waitForTimeout(1000);

    // click run pipeline
    console.log("run pipeline");
    await page.click('[data-testid="run-pipeline-button"]');


    //  title="Run all manual"
    console.log("click run all manual");
    await page.click('[title="Run all manual"]');

    // wait for 1 second
    console.log("wait for 1 second");
    // await page.waitForTimeout(1000);

    return Promise.resolve();
  }

  private setupCommands() {
    this.program
      .name("project-selector")
      .description("Select one or more projects from the project list")
      .version("1.0.0");

    // List all projects
    this.program
      .command("list")
      .description("List all available projects")
      .action(() => {
        this.listProjects();
      });

    // Interactive project selection
    this.program
      .command("select")
      .description("Interactively select one or more projects")
      .option("-s, --single", "Allow only single project selection", false)
      .option("-b, --branch <branch>", "Specify branch name")
      .action(async (options) => {
        const selectedProjects = await this.selectProjects(!options.single, options.branch);
        console.log(selectedProjects);
        await this.doProjects(selectedProjects, options.branch);

      });

    // Select projects by name pattern
    this.program
      .command("search <pattern>")
      .description("Search and select projects by name pattern")
      .option("-s, --single", "Allow only single project selection", false)
      .option("-b, --branch <branch>", "Specify branch name")
      .action(async (pattern, options) => {
        await this.searchProjects(pattern, !options.single, options.branch);
      });

    // Select projects by index
    this.program
      .command("pick <indices...>")
      .description("Select projects by index numbers (space-separated)")
      .option("-b, --branch <branch>", "Specify branch name")
      .action((indices, options) => {
        this.pickProjectsByIndex(indices, options.branch);
      });
  }

  private listProjects() {
    console.log("\n📋 Available Projects:\n");
    projectList.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name}`);
      console.log(`   Path: ${project.href}\n`);
    });
    console.log(`Total: ${projectList.length} projects`);
  }

  private async selectProjects(allowMultiple: boolean, branch?: string) {
    const choices = projectList.map((project, index) => ({
      name: `${project.name} (${project.href})`,
      value: index,
      short: project.name,
    }));

    try {
      const answers = await inquirer.prompt([
        {
          type: allowMultiple ? "checkbox" : "list",
          name: "selectedProjects",
          message: allowMultiple
            ? "Select one or more projects (use space to select, enter to confirm):"
            : "Select a project:",
          choices: choices,
          pageSize: 10,
          validate: (input: any) => {
            if (allowMultiple) {
              return input.length > 0 || "Please select at least one project";
            } else {
              return input !== undefined || "Please select a project";
            }
          },
        },
      ]);
      const selectedIndices = Array.isArray(answers.selectedProjects)
        ? answers.selectedProjects
        : [answers.selectedProjects];

      this.displaySelectedProjects(selectedIndices, branch);
      return selectedIndices.map((index) => projectList[index]);
    } catch (error) {
      console.error("Error during project selection:", error);
      return [];
    }
  }

  private async searchProjects(pattern: string, allowMultiple: boolean, branch?: string) {
    const filteredProjects = projectList.filter((project) =>
      project.name.toLowerCase().includes(pattern.toLowerCase())
    );

    if (filteredProjects.length === 0) {
      console.log(`❌ No projects found matching pattern: "${pattern}"`);
      return [];
    }

    console.log(
      `🔍 Found ${filteredProjects.length} projects matching "${pattern}":\n`
    );

    const choices = filteredProjects.map((project, index) => ({
      name: `${project.name} (${project.href})`,
      value: projectList.indexOf(project),
      short: project.name,
    }));


    try {
      const answers = await inquirer.prompt([
      {
        type: allowMultiple ? "checkbox" : "list",
        name: "selectedProjects",
        message: allowMultiple
          ? "Select one or more projects:"
          : "Select a project:",
        choices: choices,
        pageSize: 10,
      },
    ]);
      const selectedIndices = Array.isArray(answers.selectedProjects)
        ? answers.selectedProjects
        : [answers.selectedProjects];

      this.displaySelectedProjects(selectedIndices, branch);
      return selectedIndices.map((index) => projectList[index]);
    } catch (error) {
      console.error("Error during project selection:", error);
      return [];
    }
  }

  private pickProjectsByIndex(indices: string[], branch?: string) {
    const selectedProjects: Project[] = [];
    const invalidIndices: number[] = [];

    indices.forEach((indexStr) => {
      const index = parseInt(indexStr) - 1; // Convert to 0-based index
      if (index >= 0 && index < projectList.length) {
        selectedProjects.push(projectList[index]);
      } else {
        invalidIndices.push(parseInt(indexStr));
      }
    });

    if (invalidIndices.length > 0) {
      console.log(`❌ Invalid indices: ${invalidIndices.join(", ")}`);
      console.log(`Valid range: 1-${projectList.length}`);
    }

    if (selectedProjects.length > 0) {
      console.log(`\n✅ Selected ${selectedProjects.length} project(s):\n`);
      if (branch) {
        console.log(`🌿 Branch: ${branch}\n`);
      }
      selectedProjects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name}`);
        console.log(`   Path: ${project.href}`);
        if (branch) {
          console.log(`   Branch: ${branch}`);
        }
        console.log();
      });
    }

    return selectedProjects;
  }

  private displaySelectedProjects(indices: number[], branch?: string) {
    console.log(`\n✅ Selected ${indices.length} project(s):\n`);
    if (branch) {
      console.log(`🌿 Branch: ${branch}\n`);
    }
    indices.forEach((index, i) => {
      const project = projectList[index];
      console.log(`${i + 1}. ${project.name}`);
      console.log(`   Path: ${project.href}`);
      if (branch) {
        console.log(`   Branch: ${branch}`);
      }
      console.log();
    });
  }

  public async run() {
    await this.program.parseAsync();
  }

  public getProgram() {
    return this.program;
  }
}

// Export for use in other files
export { ProjectSelector };
export type { Project };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const selector = new ProjectSelector();
  selector.run().catch(console.error);
}
