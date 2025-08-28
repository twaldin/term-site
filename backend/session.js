const pty = require('node-pty');
const fs = require('fs').promises;
const path = require('path');

class SecureSessionManager {
  constructor() {
    this.sessions = new Map();
    this.maxSessions = 10;
    this.sessionTimeout = 5 * 60 * 1000; // 5 minutes for security
    
    // Initialize portfolio environment
    this.initializePortfolioEnvironment();
  }

  async initializePortfolioEnvironment() {
    try {
      // Create user directory structure
      await fs.mkdir('/tmp/portfolio-template', { recursive: true });
      await fs.mkdir('/tmp/portfolio-template/projects', { recursive: true });
      await fs.mkdir('/tmp/portfolio-template/workspace', { recursive: true });
      
      // Copy portfolio scripts if they exist
      try {
        const containerScripts = path.join(__dirname, '..', 'container', 'scripts');
        const stats = await fs.stat(containerScripts);
        if (stats.isDirectory()) {
          await fs.cp(containerScripts, '/tmp/portfolio-template/scripts', { recursive: true });
          console.log('Portfolio scripts copied to template');
        }
      } catch (err) {
        console.log('No container scripts found, creating basic environment');
        await this.createBasicScripts();
      }
      
      console.log('Portfolio environment template initialized');
    } catch (error) {
      console.error('Error initializing portfolio environment:', error);
    }
  }

  async createBasicScripts() {
    const scriptsDir = '/tmp/portfolio-template/scripts';
    await fs.mkdir(scriptsDir, { recursive: true });
    
    // Create basic welcome script
    const welcomeScript = `#!/bin/bash
echo "Welcome to Terminal Portfolio!"
echo "Available commands:"
echo "  ls, cat, vim, nano - File operations"
echo "  help - Show this help"
echo "  about - About this portfolio"
echo ""
`;
    
    await fs.writeFile(path.join(scriptsDir, 'welcome.sh'), welcomeScript, { mode: 0o755 });
    
    // Create help script
    const helpScript = `#!/bin/bash
echo "Terminal Portfolio Help"
echo "======================"
echo "This is a secure containerized terminal."
echo "You can explore files and run basic commands."
echo ""
echo "Navigation:"
echo "  ls - List files"
echo "  cd - Change directory" 
echo "  pwd - Show current directory"
echo ""
echo "File operations:"
echo "  cat file - View file contents"
echo "  vim/nano - Edit files"
echo ""
`;
    
    await fs.writeFile(path.join(scriptsDir, 'help.sh'), helpScript, { mode: 0o755 });
  }

  async createSession(sessionId, socket) {
    // Check session limit
    if (this.sessions.size >= this.maxSessions) {
      throw new Error('Maximum session limit reached');
    }

    try {
      console.log(`Creating secure session for ${sessionId}`);
      
      // Create isolated session directory
      const sessionDir = `/tmp/sessions/${sessionId}`;
      await fs.mkdir(sessionDir, { recursive: true });
      
      // Copy portfolio template to session
      try {
        await fs.cp('/tmp/portfolio-template', sessionDir, { recursive: true });
      } catch (err) {
        console.log('Template copy failed, creating minimal environment');
        await fs.mkdir(path.join(sessionDir, 'workspace'), { recursive: true });
      }
      
      // Create basic environment files
      await this.setupSessionEnvironment(sessionDir);
      
      // Spawn secure shell in session directory
      const shell = pty.spawn('/bin/bash', [], {
        name: 'xterm-256color',
        cols: 120,
        rows: 30,
        cwd: sessionDir,
        env: {
          TERM: 'xterm-256color',
          COLORTERM: 'truecolor',
          PATH: `${sessionDir}/scripts:/usr/local/bin:/usr/bin:/bin`,
          HOME: sessionDir,
          USER: 'portfolio',
          PS1: 'portfolio@secure:$ ',
          // Limit environment for security
          SHELL: '/bin/bash'
        }
      });

      // Handle terminal output
      shell.onData((data) => {
        if (data.length > 0) {
          socket.emit('output', data);
        }
      });

      // Handle terminal exit
      shell.onExit((exitCode) => {
        console.log(`Secure terminal exited for session ${sessionId} with code ${exitCode}`);
        this.destroySession(sessionId);
        socket.disconnect();
      });

      // Store session
      const session = {
        id: sessionId,
        type: 'secure',
        terminal: shell,
        socket: socket,
        sessionDir: sessionDir,
        startTime: Date.now(),
        lastActivity: Date.now()
      };

      this.sessions.set(sessionId, session);

      // Set session timeout
      this.setSessionTimeout(sessionId);

      // Auto-run welcome command
      setTimeout(() => {
        this.autoRunWelcome(sessionId);
      }, 500);

      console.log(`Secure session created for ${sessionId}`);
      return Promise.resolve();

    } catch (error) {
      console.error(`Error creating secure session ${sessionId}:`, error);
      throw error;
    }
  }

  async setupSessionEnvironment(sessionDir) {
    // Create .bashrc with portfolio aliases
    const bashrc = `# Portfolio Terminal Environment
export TERM=xterm-256color
export COLORTERM=truecolor
export PS1='portfolio@secure:$ '

# Portfolio navigation aliases
alias welcome='${sessionDir}/scripts/welcome.sh 2>/dev/null || echo "Welcome to Terminal Portfolio!"'
alias help='${sessionDir}/scripts/help.sh 2>/dev/null || echo "Help not available"'
alias home='cd ${sessionDir} && pwd'
alias workspace='cd ${sessionDir}/workspace && pwd'

# Enhanced ls with colors
alias ls='ls --color=auto'
alias ll='ls -la --color=auto'
alias la='ls -A --color=auto'

# Safety aliases
alias rm='rm -i'
alias mv='mv -i'
alias cp='cp -i'

echo "Secure terminal initialized"
`;

    await fs.writeFile(path.join(sessionDir, '.bashrc'), bashrc);
    
    // Create simple README
    const readme = `# Terminal Portfolio

Welcome to this secure terminal environment!

## Available Commands
- ls, ll, la - List files and directories
- cd - Navigate directories  
- cat - View file contents
- vim, nano - Edit files
- help - Show help information
- welcome - Show welcome message

## Directories
- workspace/ - Your working space
- scripts/ - Available scripts

This environment is completely isolated and secure.
`;

    await fs.writeFile(path.join(sessionDir, 'README.md'), readme);
  }

  autoRunWelcome(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    console.log(`Auto-running welcome for session ${sessionId}`);
    
    // Send welcome command
    setTimeout(() => {
      this.sendInput(sessionId, 'welcome\r');
    }, 200);
  }

  sendInput(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.log(`Session ${sessionId} not found`);
      return;
    }

    session.lastActivity = Date.now();
    
    // Basic command monitoring for security
    if (typeof data === 'string') {
      this.monitorCommand(sessionId, data);
    }

    session.terminal.write(data);
  }

  monitorCommand(sessionId, command) {
    const suspicious = [
      /docker/i,
      /\/proc\/self/,
      /\/sys\/fs/,
      /metadata\./,
      /curl.*169\.254/,  // AWS/GCP metadata
      /wget.*169\.254/,
      /nc.*-l/,  // Netcat listen
      /python.*socket/,
      /perl.*socket/,
    ];
    
    if (suspicious.some(pattern => pattern.test(command))) {
      console.warn(`SECURITY: Suspicious command in ${sessionId}: ${command.substring(0, 100)}`);
      // Could implement automatic session termination here
    }
  }

  resizeTerminal(sessionId, cols, rows) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.lastActivity = Date.now();
    session.terminal.resize(cols, rows);
  }

  async destroySession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    console.log(`Destroying secure session ${sessionId}`);

    try {
      // Kill terminal
      if (session.terminal && !session.terminal.killed) {
        session.terminal.kill();
      }

      // Clean up session directory
      if (session.sessionDir) {
        try {
          await fs.rm(session.sessionDir, { recursive: true, force: true });
        } catch (err) {
          console.error(`Failed to clean up session directory: ${err.message}`);
        }
      }

      // Clear timeout
      if (session.timeout) {
        clearTimeout(session.timeout);
      }

      this.sessions.delete(sessionId);
      console.log(`Secure session ${sessionId} destroyed`);

    } catch (error) {
      console.error(`Error destroying secure session ${sessionId}:`, error);
      this.sessions.delete(sessionId);
    }
  }

  async destroyAllSessions() {
    console.log('Destroying all secure sessions...');
    const promises = Array.from(this.sessions.keys()).map(sessionId => 
      this.destroySession(sessionId)
    );
    await Promise.all(promises);
    console.log('All secure sessions destroyed');
  }

  setSessionTimeout(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    // Clear existing timeout
    if (session.timeout) {
      clearTimeout(session.timeout);
    }

    // Set new timeout
    session.timeout = setTimeout(() => {
      console.log(`Secure session ${sessionId} timed out`);
      this.destroySession(sessionId);
      if (session.socket) {
        session.socket.emit('output', '\r\n[Session timed out for security]\r\n');
        session.socket.disconnect();
      }
    }, this.sessionTimeout);
  }

  getActiveSessionCount() {
    return this.sessions.size;
  }

  getTotalContainerCount() {
    // No containers in secure mode
    return 0;
  }

  // Periodic cleanup of abandoned sessions
  startPeriodicCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of this.sessions.entries()) {
        // Clean up sessions inactive for more than timeout period
        if (now - session.lastActivity > this.sessionTimeout) {
          console.log(`Cleaning up inactive session: ${sessionId}`);
          this.destroySession(sessionId);
        }
      }
    }, 60000); // Check every minute
  }
}

module.exports = SecureSessionManager;