# Changelog

All notable changes to TaskMaster Workspaces will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-11 - Alex M.

### Added
- Initial release of TaskMaster Workspaces
- Workspace creation and management (`create`, `switch`, `delete`, `list`)
- Interactive CLI menu interface
- Quick command shortcuts via `tm-workspace` script
- Automatic migration of existing tasks to default workspace
- Workspace archiving on deletion
- Statistics tracking per workspace
- Full integration with TaskMaster MCP tools
- Installation script for easy setup
- Comprehensive documentation and examples

### Features
- Isolated task contexts for different features/projects
- Seamless switching between workspaces
- Automatic task file management
- Metadata tracking for each workspace
- Command-line and interactive interfaces

### Technical
- Compatible with Claude Task Master v0.16.2+
- Node.js 16+ required
- CommonJS module format for compatibility
- Cross-platform shell script launcher
