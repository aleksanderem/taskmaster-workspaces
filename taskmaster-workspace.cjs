#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

class TaskMasterWorkspace {
  constructor() {
    this.projectRoot = process.cwd();
    this.taskmasterDir = path.join(this.projectRoot, '.taskmaster');
    this.workspacesDir = path.join(this.taskmasterDir, 'workspaces');
    this.configPath = path.join(this.taskmasterDir, 'config.json');
    
    this.ensureDirectories();
    this.loadConfig();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.taskmasterDir)) {
      console.error('❌ TaskMaster not initialized. Run: mcp__taskmaster-ai__initialize_project');
      process.exit(1);
    }
    
    if (!fs.existsSync(this.workspacesDir)) {
      fs.mkdirSync(this.workspacesDir, { recursive: true });
    }
  }

  loadConfig() {
    try {
      this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      if (!this.config.workspaces) {
        this.config.workspaces = {
          current: 'default',
          available: {}
        };
        this.saveConfig();
      }
    } catch (error) {
      console.error('❌ Failed to load config:', error.message);
      process.exit(1);
    }
  }

  saveConfig() {
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  createWorkspace(name, description = '') {
    if (this.config.workspaces.available[name]) {
      console.log(`❌ Workspace '${name}' already exists`);
      return false;
    }

    const workspaceDir = path.join(this.workspacesDir, name);
    const reportsDir = path.join(workspaceDir, 'reports');
    
    // Create directories
    fs.mkdirSync(workspaceDir, { recursive: true });
    fs.mkdirSync(reportsDir, { recursive: true });
    
    // Create initial tasks.json
    const tasksPath = path.join(workspaceDir, 'tasks.json');
    fs.writeFileSync(tasksPath, JSON.stringify({ tasks: [] }, null, 2));
    
    // Create metadata
    const metadata = {
      name,
      description,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        inProgress: 0,
        pending: 0
      },
      tags: []
    };
    fs.writeFileSync(path.join(workspaceDir, 'metadata.json'), JSON.stringify(metadata, null, 2));
    
    // Update config
    this.config.workspaces.available[name] = {
      name: description || name,
      tasksFile: path.join(workspaceDir, 'tasks.json')
    };
    
    // If this is the first workspace, also handle default
    if (Object.keys(this.config.workspaces.available).length === 1) {
      this.migrateDefaultTasks();
    }
    
    this.saveConfig();
    console.log(`✅ Created workspace: ${name}`);
    return true;
  }

  migrateDefaultTasks() {
    const defaultTasksPath = path.join(this.taskmasterDir, 'tasks', 'tasks.json');
    if (fs.existsSync(defaultTasksPath)) {
      // Create default workspace
      const defaultDir = path.join(this.workspacesDir, 'default');
      fs.mkdirSync(path.join(defaultDir, 'reports'), { recursive: true });
      
      // Copy tasks
      fs.copyFileSync(defaultTasksPath, path.join(defaultDir, 'tasks.json'));
      
      // Create metadata
      const tasks = JSON.parse(fs.readFileSync(defaultTasksPath, 'utf8')).tasks || [];
      const stats = this.calculateStats(tasks);
      const metadata = {
        name: 'default',
        description: 'Default workspace (migrated from original tasks)',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        stats,
        tags: ['default', 'migrated']
      };
      fs.writeFileSync(path.join(defaultDir, 'metadata.json'), JSON.stringify(metadata, null, 2));
      
      // Update config
      this.config.workspaces.available.default = {
        name: 'Default workspace',
        tasksFile: path.join(defaultDir, 'tasks.json')
      };
      
      console.log('📦 Migrated existing tasks to default workspace');
    }
  }

  calculateStats(tasks) {
    const stats = {
      totalTasks: tasks.length,
      completedTasks: 0,
      inProgress: 0,
      pending: 0
    };
    
    tasks.forEach(task => {
      if (task.status === 'done') stats.completedTasks++;
      else if (task.status === 'in-progress') stats.inProgress++;
      else if (task.status === 'pending') stats.pending++;
    });
    
    return stats;
  }

  switchWorkspace(name) {
    if (!this.config.workspaces.available[name]) {
      console.log(`❌ Workspace '${name}' does not exist`);
      return false;
    }
    
    this.config.workspaces.current = name;
    this.saveConfig();
    
    // Update the main tasks.json symlink/reference
    this.updateMainTasksFile(name);
    
    console.log(`✅ Switched to workspace: ${name}`);
    return true;
  }

  updateMainTasksFile(workspaceName) {
    const workspaceTasksPath = this.config.workspaces.available[workspaceName].tasksFile;
    const mainTasksPath = path.join(this.taskmasterDir, 'tasks', 'tasks.json');
    
    // Ensure tasks directory exists
    const tasksDir = path.join(this.taskmasterDir, 'tasks');
    if (!fs.existsSync(tasksDir)) {
      fs.mkdirSync(tasksDir, { recursive: true });
    }
    
    // Copy workspace tasks to main location
    if (fs.existsSync(workspaceTasksPath)) {
      fs.copyFileSync(workspaceTasksPath, mainTasksPath);
    }
  }

  listWorkspaces() {
    console.log('\n📂 Available Workspaces:\n');
    
    Object.entries(this.config.workspaces.available).forEach(([key, workspace]) => {
      const metadataPath = path.join(this.workspacesDir, key, 'metadata.json');
      let stats = { totalTasks: 0, inProgress: 0, completedTasks: 0, pending: 0 };
      
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        stats = metadata.stats || stats;
      }
      
      const current = key === this.config.workspaces.current ? ' [CURRENT]' : '';
      const tasksInfo = `${stats.totalTasks} tasks (${stats.inProgress} in-progress, ${stats.completedTasks} done)`;
      
      console.log(`  ${current ? '➤' : ' '} ${key}${current}`);
      console.log(`    ${workspace.name}`);
      console.log(`    ${tasksInfo}`);
      console.log();
    });
  }

  deleteWorkspace(name) {
    if (name === 'default') {
      console.log('❌ Cannot delete default workspace');
      return false;
    }
    
    if (!this.config.workspaces.available[name]) {
      console.log(`❌ Workspace '${name}' does not exist`);
      return false;
    }
    
    // Archive workspace
    const workspaceDir = path.join(this.workspacesDir, name);
    const archiveDir = path.join(this.taskmasterDir, 'archive', name + '_' + Date.now());
    fs.mkdirSync(path.dirname(archiveDir), { recursive: true });
    fs.renameSync(workspaceDir, archiveDir);
    
    // Update config
    delete this.config.workspaces.available[name];
    
    // If current workspace was deleted, switch to default
    if (this.config.workspaces.current === name) {
      this.config.workspaces.current = 'default';
      this.updateMainTasksFile('default');
    }
    
    this.saveConfig();
    console.log(`✅ Archived workspace: ${name}`);
    return true;
  }

  getCurrentWorkspaceTasks() {
    const current = this.config.workspaces.current;
    const tasksPath = this.config.workspaces.available[current]?.tasksFile;
    
    if (!tasksPath || !fs.existsSync(tasksPath)) {
      return [];
    }
    
    const data = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
    return data.tasks || [];
  }

  updateWorkspaceStats(workspaceName) {
    const tasksPath = this.config.workspaces.available[workspaceName]?.tasksFile;
    if (!tasksPath || !fs.existsSync(tasksPath)) return;
    
    const tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8')).tasks || [];
    const stats = this.calculateStats(tasks);
    
    const metadataPath = path.join(this.workspacesDir, workspaceName, 'metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      metadata.stats = stats;
      metadata.lastModified = new Date().toISOString();
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    }
  }
}

// Interactive CLI Menu
class InteractiveMenu {
  constructor() {
    this.workspace = new TaskMasterWorkspace();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.clear();
    console.log('╔════════════════════════════════════════╗');
    console.log('║     TaskMaster Workspace Manager       ║');
    console.log('╚════════════════════════════════════════╝');
    
    await this.showMainMenu();
  }

  async showMainMenu() {
    console.log(`\n📍 Current workspace: ${this.workspace.config.workspaces.current}\n`);
    console.log('Choose an option:\n');
    console.log('  1. 📋 Show current workspace tasks');
    console.log('  2. 📂 List all workspaces');
    console.log('  3. 🔄 Switch workspace');
    console.log('  4. ➕ Create new workspace');
    console.log('  5. 🗑️  Delete workspace');
    console.log('  6. 🎯 Next task in current workspace');
    console.log('  7. 📊 Workspace statistics');
    console.log('  8. 🚪 Exit');
    
    const answer = await this.question('\nSelect option (1-8): ');
    
    switch(answer) {
      case '1':
        await this.showCurrentTasks();
        break;
      case '2':
        this.workspace.listWorkspaces();
        await this.waitForEnter();
        break;
      case '3':
        await this.switchWorkspaceMenu();
        break;
      case '4':
        await this.createWorkspaceMenu();
        break;
      case '5':
        await this.deleteWorkspaceMenu();
        break;
      case '6':
        await this.showNextTask();
        break;
      case '7':
        await this.showStatistics();
        break;
      case '8':
        console.log('\n👋 Goodbye!\n');
        this.rl.close();
        return;
      default:
        console.log('\n❌ Invalid option');
    }
    
    await this.showMainMenu();
  }

  async showCurrentTasks() {
    console.log(`\n📋 Tasks in workspace: ${this.workspace.config.workspaces.current}\n`);
    
    const tasks = this.workspace.getCurrentWorkspaceTasks();
    if (tasks.length === 0) {
      console.log('No tasks in this workspace yet.');
    } else {
      const statusEmojis = {
        'pending': '⏳',
        'in-progress': '🔄',
        'done': '✅',
        'blocked': '🚫',
        'deferred': '⏸️',
        'cancelled': '❌'
      };
      
      tasks.forEach(task => {
        const emoji = statusEmojis[task.status] || '📌';
        console.log(`${emoji} [${task.id}] ${task.title} (${task.status})`);
        if (task.description) {
          console.log(`   ${task.description}`);
        }
      });
    }
    
    await this.waitForEnter();
  }

  async switchWorkspaceMenu() {
    console.log('\n🔄 Switch to workspace:\n');
    
    const workspaces = Object.keys(this.workspace.config.workspaces.available);
    workspaces.forEach((ws, index) => {
      const current = ws === this.workspace.config.workspaces.current ? ' (current)' : '';
      console.log(`  ${index + 1}. ${ws}${current}`);
    });
    
    const answer = await this.question('\nSelect workspace number (or 0 to cancel): ');
    const index = parseInt(answer) - 1;
    
    if (answer === '0') return;
    
    if (index >= 0 && index < workspaces.length) {
      this.workspace.switchWorkspace(workspaces[index]);
    } else {
      console.log('❌ Invalid selection');
    }
    
    await this.waitForEnter();
  }

  async createWorkspaceMenu() {
    const name = await this.question('\n➕ Enter workspace name: ');
    if (!name) return;
    
    const description = await this.question('Enter description (optional): ');
    
    this.workspace.createWorkspace(name, description);
    await this.waitForEnter();
  }

  async deleteWorkspaceMenu() {
    const name = await this.question('\n🗑️  Enter workspace name to delete: ');
    if (!name) return;
    
    const confirm = await this.question(`Are you sure you want to delete '${name}'? (y/N): `);
    if (confirm.toLowerCase() === 'y') {
      this.workspace.deleteWorkspace(name);
    }
    
    await this.waitForEnter();
  }

  async showNextTask() {
    console.log('\n🎯 Getting next task from current workspace...\n');
    
    try {
      // Run TaskMaster next_task command
      const result = execSync(`npx -y --package=task-master-ai task-master-ai next --file "${this.workspace.config.workspaces.available[this.workspace.config.workspaces.current].tasksFile}"`, {
        encoding: 'utf8'
      });
      console.log(result);
    } catch (error) {
      console.log('No pending tasks or error getting next task');
    }
    
    await this.waitForEnter();
  }

  async showStatistics() {
    console.log('\n📊 Workspace Statistics:\n');
    
    Object.entries(this.workspace.config.workspaces.available).forEach(([key, workspace]) => {
      const metadataPath = path.join(this.workspace.workspacesDir, key, 'metadata.json');
      
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        const stats = metadata.stats || {};
        
        console.log(`📂 ${key}:`);
        console.log(`   Total tasks: ${stats.totalTasks || 0}`);
        console.log(`   ✅ Completed: ${stats.completedTasks || 0}`);
        console.log(`   🔄 In Progress: ${stats.inProgress || 0}`);
        console.log(`   ⏳ Pending: ${stats.pending || 0}`);
        console.log(`   📅 Last modified: ${new Date(metadata.lastModified).toLocaleString()}`);
        console.log();
      }
    });
    
    await this.waitForEnter();
  }

  question(prompt) {
    return new Promise(resolve => {
      this.rl.question(prompt, resolve);
    });
  }

  async waitForEnter() {
    await this.question('\nPress Enter to continue...');
  }

  close() {
    this.rl.close();
  }
}

// Main execution
if (require.main === module) {
  const menu = new InteractiveMenu();
  menu.start().catch(console.error);
}

module.exports = { TaskMasterWorkspace };