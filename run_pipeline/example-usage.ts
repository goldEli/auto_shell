import { ProjectSelector } from './project-selector.js';
import { projectList } from './config.js';

/**
 * Example usage of the ProjectSelector
 */
async function demonstrateUsage() {
    console.log('🚀 Project Selector Examples\n');

    // Example 1: List all projects
    console.log('1. Listing all projects:');
    const selector = new ProjectSelector();
    
    // Simulate the list command
    console.log('\n📋 Available Projects:\n');
    projectList.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name}`);
        console.log(`   Path: ${project.href}\n`);
    });

    // Example 2: Pick specific projects by index
    console.log('\n2. Picking projects by index (1, 3, 5):');
    const selectedIndices = [0, 2, 4]; // 1-based to 0-based conversion
    console.log(`\n✅ Selected ${selectedIndices.length} project(s):\n`);
    selectedIndices.forEach((index, i) => {
        const project = projectList[index];
        console.log(`${i + 1}. ${project.name}`);
        console.log(`   Path: ${project.href}\n`);
    });

    // Example 3: Search projects by pattern
    console.log('\n3. Searching projects containing "web":');
    const searchPattern = 'web';
    const filteredProjects = projectList.filter(project => 
        project.name.toLowerCase().includes(searchPattern.toLowerCase())
    );
    
    console.log(`🔍 Found ${filteredProjects.length} projects matching "${searchPattern}":\n`);
    filteredProjects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name}`);
        console.log(`   Path: ${project.href}\n`);
    });

    // Example 4: Get project by name
    console.log('\n4. Getting specific project by name:');
    const targetProject = projectList.find(project => 
        project.name.includes('admin-web')
    );
    
    if (targetProject) {
        console.log(`Found: ${targetProject.name}`);
        console.log(`Path: ${targetProject.href}`);
    } else {
        console.log('Project not found');
    }
}

// Run the demonstration
demonstrateUsage().catch(console.error);
