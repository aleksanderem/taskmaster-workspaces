#!/usr/bin/env node

// TaskMaster Workspace CLI - Quick commands
const { TaskMasterWorkspace } = require('./taskmaster-workspace.cjs');
const { execSync } = require('child_process');
const path = require('path');

const workspace = new TaskMasterWorkspace();
const args = process.argv.slice(2);
const command = args[0];

function showHelp() {
  console.log(`
TaskMaster Workspace Manager - Quick Commands

Usage: tmw <command> [options]

Commands:
  current          Show current workspace and tasks count
  list, ls         List all workspaces
  switch <name>    Switch to workspace
  create <name>    Create new workspace
  delete <name>    Delete workspace
  tasks            Show tasks in current workspace
  next             Get next task from current workspace
  add <task>       Add task to current workspace
  menu             Open interactive menu

Examples:
  tmw current              # Show current workspace
  tmw switch feature-auth  # Switch to feature-auth workspace
  tmw create bugfixes      # Create new bugfixes workspace
  tmw add "Fix login bug"  # Add task to current workspace
  tmw menu                 # Open interactive menu
`);
}

async function runCommand() {
  const projectRoot = process.cwd();
  
  switch(command) {
    case 'current':
      const current = workspace.config.workspaces.current;
      const tasks = workspace.getCurrentWorkspaceTasks();
      const stats = workspace.calculateStats(tasks);
      console.log(`📍 Current workspace: ${current}`);
      console.log(`   Tasks: ${stats.totalTasks} (${stats.inProgress} in-progress, ${stats.completedTasks} done, ${stats.pending} pending)`);
      break;
      
    case 'list':
    case 'ls':
      workspace.listWorkspaces();
      break;
      
    case 'switch':
      const targetWorkspace = args[1];
      if (!targetWorkspace) {
        console.log('❌ Please specify workspace name');
        process.exit(1);
      }
      workspace.switchWorkspace(targetWorkspace);
      break;
      
    case 'create':
      const newWorkspace = args[1];
      if (!newWorkspace) {
        console.log('❌ Please specify workspace name');
        process.exit(1);
      }
      const description = args.slice(2).join(' ');
      workspace.createWorkspace(newWorkspace, description);
      break;
      
    case 'delete':
      const deleteWorkspace = args[1];
      if (!deleteWorkspace) {
        console.log('❌ Please specify workspace name');
        process.exit(1);
      }
      workspace.deleteWorkspace(deleteWorkspace);
      break;
      
    case 'tasks':
      const currentTasks = workspace.getCurrentWorkspaceTasks();
      if (currentTasks.length === 0) {
        console.log('No tasks in current workspace');
      } else {
        console.log(`\n📋 Tasks in ${workspace.config.workspaces.current}:\n`);
        currentTasks.forEach(task => {
          const status = task.status === 'done' ? '✅' : 
                        task.status === 'in-progress' ? '🔄' : '⏳';
          console.log(`${status} [${task.id}] ${task.title}`);
        });
      }
      break;
      
    case 'next':
      try {
        const currentWorkspace = workspace.config.workspaces.current;
        const tasksFile = workspace.config.workspaces.available[currentWorkspace].tasksFile;
        
        console.log(`🎯 Next task in ${currentWorkspace}:\n`);
        
        // Use TaskMaster CLI with proper syntax
        execSync(`cd "${projectRoot}" && npx -y task-master-ai next --file "${tasksFile}"`, {
          stdio: 'inherit'
        });
      } catch (error) {
        console.log('No pending tasks or error getting next task');
      }
      break;
      
    case 'add':
      const taskDescription = args.slice(1).join(' ');
      if (!taskDescription) {
        console.log('❌ Please provide task description');
        process.exit(1);
      }
      
      try {
        const currentWorkspace = workspace.config.workspaces.current;
        const tasksFile = workspace.config.workspaces.available[currentWorkspace].tasksFile;
        
        console.log(`➕ Adding task to ${currentWorkspace}...`);
        
        // Use MCP tool directly through task-master-ai CLI
        execSync(`cd "${projectRoot}" && npx -y task-master-ai add --prompt "${taskDescription}" --file "${tasksFile}"`, {
          stdio: 'inherit'
        });
        
        // Update stats
        workspace.updateWorkspaceStats(currentWorkspace);
      } catch (error) {
        console.log('❌ Error adding task:', error.message);
      }
      break;
      
    case 'menu':
      // Launch interactive menu
      require('./taskmaster-workspace.cjs');
      break;
      
    case 'help':
    case undefined:
      showHelp();
      break;
      
    default:
      console.log(`❌ Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

runCommand().catch(console.error);