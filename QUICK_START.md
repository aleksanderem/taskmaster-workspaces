# TaskMaster Workspaces - Quick Start 🚀

## 1. Install (30 seconds)

```bash
# Clone or download this repository
git clone https://github.com/aleksanderem/taskmaster-workspaces.git
cd taskmaster-workspaces

# Run installer
./install.sh
```

## 2. Start Using (In your project)

```bash
# Go to your project with TaskMaster
cd /your/project

# If TaskMaster not initialized yet:
npx task-master-ai init

# Create your first workspace
/path/to/taskmaster-workspaces/tm-workspace create my-feature

# Switch to it
/path/to/taskmaster-workspaces/tm-workspace switch my-feature

# Add a task
mcp__taskmaster-ai__add_task prompt="Build awesome feature" projectRoot="$(pwd)"

# See your tasks
/path/to/taskmaster-workspaces/tm-workspace tasks
```

## 3. With Alias (Recommended)

If you installed the alias during setup:

```bash
tm                    # Open menu
tm create my-feature  # Create workspace  
tm switch my-feature  # Switch to it
tm tasks             # See tasks
tm next              # Get next task
```

That's it! You're ready to manage multiple task contexts. 🎉

See `README.md` for full documentation.