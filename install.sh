#!/bin/bash

# TaskMaster Workspaces Installation Script

echo "═══════════════════════════════════════════"
echo "   TaskMaster Workspaces Installer        "
echo "═══════════════════════════════════════════"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js first: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Make scripts executable
echo "📝 Making scripts executable..."
chmod +x tm-workspace taskmaster-workspace.cjs tmw.cjs

# Get current directory
INSTALL_DIR=$(pwd)

# Ask about alias installation
echo ""
echo "Would you like to add the 'tm' alias to your shell? (y/N)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    # Detect shell
    if [ -n "$ZSH_VERSION" ]; then
        SHELL_RC="$HOME/.zshrc"
    elif [ -n "$BASH_VERSION" ]; then
        SHELL_RC="$HOME/.bashrc"
    else
        echo "⚠️  Unknown shell. Please add this alias manually:"
        echo "    alias tm=\"$INSTALL_DIR/tm-workspace\""
        SHELL_RC=""
    fi
    
    if [ -n "$SHELL_RC" ]; then
        # Check if alias already exists
        if grep -q "alias tm=" "$SHELL_RC"; then
            echo "⚠️  Alias 'tm' already exists in $SHELL_RC"
            echo "   Please update it manually if needed."
        else
            echo "alias tm=\"$INSTALL_DIR/tm-workspace\"" >> "$SHELL_RC"
            echo "✅ Added 'tm' alias to $SHELL_RC"
            echo ""
            echo "   Run 'source $SHELL_RC' or restart your terminal to use the alias."
        fi
    fi
fi

# Check if TaskMaster is initialized
echo ""
echo "Checking TaskMaster installation..."

if [ ! -d ".taskmaster" ]; then
    echo "⚠️  TaskMaster not found in current directory."
    echo ""
    echo "To use TaskMaster Workspaces, you need to:"
    echo "1. Navigate to your project directory"
    echo "2. Initialize TaskMaster: npx task-master-ai init"
    echo "3. Run the workspace manager: $INSTALL_DIR/tm-workspace"
else
    echo "✅ TaskMaster found in current directory"
    
    # Create workspaces directory if it doesn't exist
    if [ ! -d ".taskmaster/workspaces" ]; then
        mkdir -p .taskmaster/workspaces
        echo "✅ Created workspaces directory"
    fi
fi

echo ""
echo "═══════════════════════════════════════════"
echo "✅ Installation complete!"
echo ""
echo "Usage:"
echo "  $INSTALL_DIR/tm-workspace         # Interactive menu"
echo "  $INSTALL_DIR/tm-workspace list    # List workspaces"
echo "  $INSTALL_DIR/tm-workspace current # Current workspace"
echo ""

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]] && [ -n "$SHELL_RC" ]; then
    echo "With alias (after sourcing $SHELL_RC):"
    echo "  tm         # Interactive menu"
    echo "  tm list    # List workspaces"
    echo "  tm current # Current workspace"
    echo ""
fi

echo "See README.md for full documentation."
echo "═══════════════════════════════════════════"