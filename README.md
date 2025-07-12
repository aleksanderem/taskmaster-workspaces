# TaskMaster Workspaces 🚀

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://coff.ee/alexem)

A workspace management system for [Claude Task Master](https://github.com/eyaltoledano/claude-task-master), enabling isolated task contexts for different features, projects, or workflows.

## Features ✨

- **🗂️ Multiple Workspaces** - Create isolated task environments for different features or projects
- **🔄 Easy Switching** - Quick context switching between workspaces
- **📊 Task Statistics** - Track progress per workspace
- **🗃️ Archive System** - Safely delete workspaces with automatic archiving
- **🎯 Full TaskMaster Integration** - Works seamlessly with all TaskMaster MCP tools
- **💻 Interactive CLI** - User-friendly menu and command-line interface

## Prerequisites 📋

1. **Node.js** (v16 or higher)
2. **Claude Task Master** initialized in your project:
   ```bash
   npx task-master-ai init
   ```

## Installation 🛠️

1. Clone this repository or download the files:
   ```bash
   git clone https://github.com/aleksanderem/taskmaster-workspaces.git
   cd taskmaster-workspaces
   ```

2. Run the installation script:
   ```bash
   ./install.sh
   ```

   Or manually:
   ```bash
   chmod +x tm-workspace taskmaster-workspace.cjs tmw.cjs
   # Optionally add to your PATH or create an alias
   echo 'alias tm="/path/to/taskmaster-workspaces/tm-workspace"' >> ~/.zshrc
   ```

## Usage 🎮

### Interactive Menu
```bash
./tm-workspace
# or with alias
tm
```

### Quick Commands
```bash
# Show current workspace and task count
./tm-workspace current

# List all workspaces
./tm-workspace list

# Create new workspace
./tm-workspace create feature-auth "Authentication system"

# Switch workspace
./tm-workspace switch feature-auth

# Show tasks in current workspace
./tm-workspace tasks

# Get next task
./tm-workspace next
```

### Integration with TaskMaster MCP

After switching workspaces, all TaskMaster MCP commands automatically use the active workspace:

```bash
# Switch to a workspace
./tm-workspace switch feature-payments

# All MCP commands now use this workspace
mcp__taskmaster-ai__add_task prompt="Implement Stripe integration" projectRoot="/your/project"
mcp__taskmaster-ai__get_tasks projectRoot="/your/project"
mcp__taskmaster-ai__next_task projectRoot="/your/project"
```

## Workspace Structure 📁

```
.taskmaster/
├── workspaces/
│   ├── default/
│   │   ├── tasks.json      # Tasks for default workspace
│   │   ├── metadata.json   # Workspace metadata
│   │   └── reports/        # Complexity reports
│   ├── feature-auth/
│   │   ├── tasks.json
│   │   ├── metadata.json
│   │   └── reports/
│   └── [your-workspace]/
├── tasks/
│   └── tasks.json          # Active workspace (auto-managed)
├── config.json             # TaskMaster config + workspace info
└── archive/                # Deleted workspaces
```

## Examples 💡

### Feature Development Workflow
```bash
# Create workspace for new feature
./tm-workspace create feature-notifications "Push notification system"

# Switch to it
./tm-workspace switch feature-notifications

# Parse PRD specific to this feature
mcp__taskmaster-ai__parse_prd input="notifications-prd.txt" projectRoot="/your/project"

# Work on tasks
./tm-workspace tasks
./tm-workspace next
```

### Bug Fixing Workflow
```bash
# Create dedicated bugfix workspace
./tm-workspace create bugfix-sprint-23 "Sprint 23 bug fixes"
./tm-workspace switch bugfix-sprint-23

# Add bugs to fix
mcp__taskmaster-ai__add_task prompt="Fix login timeout issue #234" projectRoot="/your/project"
mcp__taskmaster-ai__add_task prompt="Resolve payment calculation bug #235" projectRoot="/your/project"

# Track progress
./tm-workspace current
```

### Context Switching
```bash
# Working on feature
./tm-workspace current
# > 📍 Current workspace: feature-notifications
# > Tasks: 12 (3 in-progress, 2 done, 7 pending)

# Urgent bugfix needed!
./tm-workspace switch bugfix-critical
./tm-workspace next

# Back to feature work
./tm-workspace switch feature-notifications
```

## Commands Reference 📖

| Command | Description |
|---------|-------------|
| `tm-workspace` | Launch interactive menu |
| `tm-workspace current` | Show current workspace info |
| `tm-workspace list` | List all workspaces |
| `tm-workspace create <name> [desc]` | Create new workspace |
| `tm-workspace switch <name>` | Switch to workspace |
| `tm-workspace delete <name>` | Delete (archive) workspace |
| `tm-workspace tasks` | Show tasks in current workspace |
| `tm-workspace next` | Get next task to work on |
| `tm-workspace menu` | Force interactive menu |

## Configuration ⚙️

Workspaces are stored in `.taskmaster/workspaces/` in your project. The system automatically:
- Migrates existing tasks to a `default` workspace on first run
- Updates `.taskmaster/config.json` with workspace information
- Maintains backward compatibility with TaskMaster

## Tips & Best Practices 💡

1. **Naming Convention**:
   - Features: `feature-<name>`
   - Bugfixes: `bugfix-<issue-number>` or `bugfix-<sprint>`
   - Experiments: `exp-<name>`
   - Releases: `release-<version>`

2. **Temporary Workspaces**:
   ```bash
   ./tm-workspace create temp-investigation "Quick investigation"
   # ... work ...
   ./tm-workspace delete temp-investigation  # Auto-archived
   ```

3. **Regular Cleanup**:
   - Review and delete completed feature workspaces
   - Archives are kept in `.taskmaster/archive/`

## Troubleshooting 🔧

**"TaskMaster not initialized"**
- Run `npx task-master-ai init` in your project root

**"Workspace already exists"**
- Choose a different name or delete the existing one

**Changes not reflected after switch**
- Ensure `.taskmaster/tasks/tasks.json` was updated
- Try running `./tm-workspace current` to verify

**Can't add tasks via CLI**
- Use TaskMaster MCP tools directly: `mcp__taskmaster-ai__add_task`
- The CLI add command has known formatting issues with some shells

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## Author 👨‍💻

**Alex M.**  
GitHub: [@aleksanderem](https://github.com/aleksanderem)

### Support the Project ☕

If you find this tool useful, consider buying me a coffee!

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://coff.ee/alexem)

## License 📄

MIT License - feel free to use in your projects!

## Acknowledgments 🙏

Built by Alex M. to enhance [Claude Task Master](https://github.com/eyaltoledano/claude-task-master) with workspace management capabilities.
