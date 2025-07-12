# TaskMaster Workspaces - Examples 📚

## Common Workflows

### 1. Starting a New Feature

```bash
# Create workspace for the feature
./tm-workspace create feature-user-profiles "User profile management system"

# Switch to it
./tm-workspace switch feature-user-profiles

# Add initial tasks
mcp__taskmaster-ai__add_task \
  prompt="Design user profile database schema" \
  projectRoot="/your/project"

mcp__taskmaster-ai__add_task \
  prompt="Create user profile API endpoints" \
  projectRoot="/your/project"

mcp__taskmaster-ai__add_task \
  prompt="Build user profile UI components" \
  projectRoot="/your/project"

# Check your tasks
./tm-workspace tasks
```

### 2. Managing Multiple Features

```bash
# See all your workspaces
./tm-workspace list

# Output:
# 📂 Available Workspaces:
#
#   ➤ feature-user-profiles [CURRENT]
#     User profile management system
#     3 tasks (0 in-progress, 0 done)
#
#     feature-notifications
#     Push notification system
#     8 tasks (2 in-progress, 3 done)
#
#     default
#     Default workspace
#     15 tasks (1 in-progress, 13 done)

# Quick switch to work on notifications
./tm-workspace switch feature-notifications

# Get next task
./tm-workspace next
```

### 3. Sprint-Based Bug Fixing

```bash
# Create workspace for current sprint
./tm-workspace create sprint-24-bugs "Sprint 24 bug fixes"
./tm-workspace switch sprint-24-bugs

# Import bugs from your issue tracker (manual example)
BUGS=(
  "Fix user login timeout #234"
  "Resolve payment calculation error #235"
  "Address mobile layout issues #236"
  "Fix email template rendering #237"
)

for bug in "${BUGS[@]}"; do
  mcp__taskmaster-ai__add_task \
    prompt="$bug" \
    projectRoot="/your/project"
done

# Track progress
./tm-workspace current
# > 📍 Current workspace: sprint-24-bugs
# > Tasks: 4 (0 in-progress, 0 done, 4 pending)
```

### 4. Experimental Development

```bash
# Create experimental workspace
./tm-workspace create exp-new-architecture "Experimenting with new architecture"
./tm-workspace switch exp-new-architecture

# Parse experimental PRD
mcp__taskmaster-ai__parse_prd \
  input="experimental-architecture.md" \
  projectRoot="/your/project"

# Work on it without affecting main development
./tm-workspace tasks

# If experiment is successful, you can merge tasks
# If not, just delete the workspace
./tm-workspace delete exp-new-architecture  # Auto-archived
```

### 5. Release Management

```bash
# Create release workspace
./tm-workspace create release-v2.0 "Version 2.0 release tasks"
./tm-workspace switch release-v2.0

# Add release tasks
mcp__taskmaster-ai__add_task \
  prompt="Update version numbers in package files" \
  projectRoot="/your/project"

mcp__taskmaster-ai__add_task \
  prompt="Generate changelog from git history" \
  projectRoot="/your/project"

mcp__taskmaster-ai__add_task \
  prompt="Run full test suite" \
  projectRoot="/your/project"

mcp__taskmaster-ai__add_task \
  prompt="Build and package release artifacts" \
  projectRoot="/your/project"

# Use TaskMaster's complexity analysis
mcp__taskmaster-ai__analyze_project_complexity \
  projectRoot="/your/project"
```

### 6. Team Collaboration Pattern

```bash
# Frontend team workspace
./tm-workspace create team-frontend "Frontend team tasks"

# Backend team workspace
./tm-workspace create team-backend "Backend team tasks"

# DevOps workspace
./tm-workspace create team-devops "DevOps and infrastructure tasks"

# Each team member switches to their workspace
./tm-workspace switch team-frontend  # Frontend developer
./tm-workspace switch team-backend   # Backend developer
```

### 7. Interactive Menu Workflow

```bash
# Launch interactive menu
./tm-workspace

# Example session:
# 1. Select option 2 (List all workspaces)
# 2. See all available workspaces
# 3. Select option 3 (Switch workspace)
# 4. Choose workspace from list
# 5. Select option 1 (Show current workspace tasks)
# 6. Select option 6 (Next task in current workspace)
```

### 8. Quick Context Switching

```bash
# Working on feature
./tm-workspace current
# > Working on: feature-user-profiles

# Boss asks about bug status
./tm-workspace switch sprint-24-bugs
./tm-workspace tasks | grep -c "done"
# > 2 bugs fixed

# Back to feature work
./tm-workspace switch feature-user-profiles
./tm-workspace next
```

### 9. Workspace Statistics

```bash
# From interactive menu, select option 7
./tm-workspace

# Or create a quick stats script
for ws in $(ls .taskmaster/workspaces/); do
  echo "=== $ws ==="
  ./tm-workspace switch $ws >/dev/null 2>&1
  ./tm-workspace current
  echo ""
done
```

### 10. Cleanup Old Workspaces

```bash
# List all workspaces
./tm-workspace list

# Delete completed feature workspaces
./tm-workspace delete feature-old-ui
./tm-workspace delete exp-failed-approach

# Deleted workspaces are archived in:
# .taskmaster/archive/

# To permanently remove archives:
# rm -rf .taskmaster/archive/feature-old-ui_*
```

## Pro Tips 🎯

1. **Use descriptive workspace names** - They appear in listings and help you remember context

2. **Create workspace templates** by copying an existing workspace:
   ```bash
   cp -r .taskmaster/workspaces/template .taskmaster/workspaces/new-feature
   ```

3. **Backup important workspaces**:
   ```bash
   tar -czf workspace-backup.tar.gz .taskmaster/workspaces/important-feature
   ```

4. **Integrate with git branches**:
   ```bash
   # Create workspace matching git branch
   BRANCH=$(git rev-parse --abbrev-ref HEAD)
   ./tm-workspace create "$BRANCH" "Tasks for $BRANCH branch"
   ```

5. **Use with aliases for speed**:
   ```bash
   alias tmc="tm current"
   alias tml="tm list"
   alias tms="tm switch"
   alias tmn="tm next"
   ```