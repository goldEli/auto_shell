import { ProjectSelector } from "./project-selector.js";

async function main() {
    const selector = new ProjectSelector();
    
    // Parse command line arguments
    const program = selector.getProgram();
    
    // If no arguments provided, show help
    if (process.argv.length <= 2) {
        program.help();
        return;
    }

    
    try {
        await selector.run();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Run the main function
main().catch(console.error);