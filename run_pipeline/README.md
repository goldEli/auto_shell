# Project Selector CLI

A command-line interface for selecting one or more projects from a predefined project list using Commander.js and Inquirer.js.

## Features

- 📋 **List all projects** - Display all available projects with their paths
- 🎯 **Interactive selection** - Choose projects using an interactive menu (multiple selection by default)
- 🔍 **Search projects** - Find projects by name pattern
- 📌 **Pick by index** - Select projects by their index numbers
- ✅ **Multiple selection** - Choose one or more projects at once (default behavior)
- 🌿 **Branch support** - Specify branch name with `-b` flag


## Installation & Usage

### Global Installation (Recommended)
```bash
# Install globally
pnpm link --global

# Now you can use run-pipeline from anywhere
run-pipeline --help
run-pipeline list
run-pipeline select
```

### Local Development
```bash
# Install dependencies
pnpm install

# Run locally
pnpm start list
```

## Usage

### List all projects
```bash
# Global command (recommended)
run-pipeline list

# Or local development
pnpm start list
```

### Interactive project selection (multiple by default)
```bash
# Select multiple projects (default behavior)
run-pipeline select

# Select multiple projects with branch
run-pipeline select -b main

# Select single project only
run-pipeline select --single

# Select single project with branch
run-pipeline select --single -b develop
```

### Search projects by pattern
```bash
# Search for projects containing "web" (multiple selection by default)
run-pipeline search web

# Search with branch specification
run-pipeline search web -b main

# Search with single selection
run-pipeline search admin --single -b develop
```

### Pick projects by index
```bash
# Pick specific projects by index (1-based)
run-pipeline pick 1 3 5

# Pick with branch specification
run-pipeline pick 1 3 5 -b main
```

### Show help
```bash
run-pipeline --help
run-pipeline select --help
```

## Available Commands

| Command | Description | Options |
|---------|-------------|---------|
| `list` | List all available projects | - |
| `select` | Interactively select projects (multiple by default) | `-s, --single`, `-b, --branch <branch>` |
| `search <pattern>` | Search projects by name pattern (multiple by default) | `-s, --single`, `-b, --branch <branch>` |
| `pick <indices...>` | Select projects by index numbers | `-b, --branch <branch>` |

## Examples

### Example 1: List all projects
```bash
$ pnpm start list

📋 Available Projects:

1. WWFrontend / web-trade
   Path: /weex-fronend/web-trade

2. WWFrontend / web-pages-2
   Path: /weex-fronend/web-pages-2
...
```

### Example 2: Pick specific projects with branch
```bash
$ pnpm start pick 1 3 5 -b main

✅ Selected 3 project(s):

🌿 Branch: main

1. WWFrontend / web-trade
   Path: /weex-fronend/web-trade
   Branch: main

2. WWFrontend / web-pages-2
   Path: /weex-fronend/web-pages-2
   Branch: main

3. WWFrontend / web-pages
   Path: /weex-fronend/web-pages
   Branch: main
```

### Example 3: Search projects with branch
```bash
$ pnpm start search admin -b develop

🔍 Found 5 projects matching "admin":

🌿 Branch: develop

1. WWFrontend / admin-web-ad
   Path: /weex-fronend/admin-web-ad
   Branch: develop

2. WWFrontend / admin-web-cs
   Path: /weex-fronend/admin-web-cs
   Branch: develop
...
```

## Key Changes

### Default Behavior Changes
- **Multiple selection is now the default** for `select` and `search` commands
- Use `--single` flag to enable single project selection
- Branch information is displayed when specified with `-b` flag

### New Options
- `-s, --single`: Force single project selection (overrides default multiple selection)
- `-b, --branch <branch>`: Specify branch name for selected projects
