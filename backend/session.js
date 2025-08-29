const pty = require('node-pty');
const fs = require('fs').promises;
const path = require('path');

class SecureSessionManager {
	constructor() {
		this.sessions = new Map();
		this.maxSessions = 10;
		this.sessionTimeout = 60 * 60 * 1000; // 1 hour timeout for active terminal usage
		this.initialized = false;

		// Initialize portfolio environment asynchronously
		this.initializePortfolioEnvironment().catch(error => {
			console.error('Failed to initialize portfolio environment:', error);
		});
	}

	async initializePortfolioEnvironment() {
		console.log('Starting portfolio environment initialization...');

		try {
			// Create user directory structure
			console.log('Creating base directories...');
			await fs.mkdir('/tmp/portfolio-template', { recursive: true });
			await fs.mkdir('/tmp/portfolio-template/projects', { recursive: true });
			await fs.mkdir('/tmp/portfolio-template/workspace', { recursive: true });

			// Copy portfolio scripts and configs from embedded container directory
			const containerPath = path.join(__dirname, 'container');
			console.log('Checking for container directory at:', containerPath);

			try {
				const stats = await fs.stat(containerPath);
				if (stats.isDirectory()) {
					console.log('Container directory found, copying contents...');

					// Copy scripts
					const scriptsPath = path.join(containerPath, 'scripts');
					try {
						await this.copyDirectory(scriptsPath, '/tmp/portfolio-template/scripts');
						console.log('Scripts copied successfully');
					} catch (scriptsErr) {
						console.log('Failed to copy scripts:', scriptsErr.message);
					}

					// Copy blog posts
					const blogPath = path.join(containerPath, 'blog');
					try {
						await this.copyDirectory(blogPath, '/tmp/portfolio-template/blog');
						console.log('Blog posts copied successfully');
					} catch (blogErr) {
						console.log('Failed to copy blog posts:', blogErr.message);
					}

					// Copy figlet font
					const fontPath = path.join(containerPath, 'Univers.flf');
					try {
						await fs.copyFile(fontPath, '/tmp/portfolio-template/Univers.flf');
						console.log('Figlet font copied successfully');
					} catch (fontErr) {
						console.log('Figlet font not copied:', fontErr.message);
					}

					console.log('Complete portfolio environment copied to template');
				}
			} catch (err) {
				console.log('Container directory not found, creating basic environment:', err.message);
				await this.createBasicScripts();
			}

			console.log('Portfolio environment template initialized successfully');
			this.initialized = true;
		} catch (error) {
			console.error('Error initializing portfolio environment:', error);
			console.log('Continuing with basic environment...');

			// Even if initialization fails, try to create basic environment
			try {
				await this.createBasicScripts();
				console.log('Basic environment created successfully');
			} catch (basicErr) {
				console.error('Failed to create basic environment:', basicErr);
			}

			// Always mark as initialized so server can start
			this.initialized = true;
		}
	}

	async copyDirectory(src, dest) {
		await fs.mkdir(dest, { recursive: true });
		const entries = await fs.readdir(src, { withFileTypes: true });

		for (const entry of entries) {
			const srcPath = path.join(src, entry.name);
			const destPath = path.join(dest, entry.name);

			if (entry.isDirectory()) {
				await this.copyDirectory(srcPath, destPath);
			} else {
				await fs.copyFile(srcPath, destPath);
			}
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
				await this.copyDirectory('/tmp/portfolio-template', sessionDir);
			} catch (err) {
				console.log('Template copy failed, creating minimal environment:', err.message);
				await fs.mkdir(path.join(sessionDir, 'workspace'), { recursive: true });
				await fs.mkdir(path.join(sessionDir, 'scripts'), { recursive: true });
			}

			// Create basic environment files
			await this.setupSessionEnvironment(sessionDir);

			// Spawn zsh shell in session directory with full environment
			const shell = pty.spawn('/bin/zsh', [], {
				name: 'xterm-256color',
				cols: 120,
				rows: 30,
				cwd: sessionDir,
				env: {
					TERM: 'xterm-256color',
					COLORTERM: 'truecolor',
					PATH: `${sessionDir}/scripts:/usr/local/bin:/usr/bin:/bin:/sbin`,
					HOME: sessionDir,
					USER: 'portfolio',
					SHELL: '/bin/zsh',
					ZDOTDIR: sessionDir,
					// Enable colors for ls and other tools
					CLICOLOR: '1',
					LSCOLORS: 'ExFxBxDxCxegedabagacad',
					// Set figlet font directory
					FIGLET_FONTDIR: sessionDir
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

			// Auto-run welcome with typewriter effect after a short delay
			setTimeout(() => {
				this.runAutoWelcome(sessionId);
			}, 1500); // Give time for shell to fully initialize

			console.log(`Secure session created for ${sessionId} with full portfolio environment`);
			return Promise.resolve();

		} catch (error) {
			console.error(`Error creating secure session ${sessionId}:`, error);
			throw error;
		}
	}

	async setupSessionEnvironment(sessionDir) {
		// Create .zshrc with full portfolio configuration
		const zshrc = `
export TERM=xterm-256color
export COLORTERM=truecolor
export SHELL=/bin/zsh

export CYAN='\\033[38;2;142;192;124m'      # Bright Cyan #8ec07c
export GREEN='\\033[38;2;184;187;38m'      # Bright Green #b8bb26
export WHITE='\\033[38;2;235;219;178m'     # Foreground #ebdbb2
export YELLOW='\\033[38;2;250;189;47m'     # Bright Yellow #fabd2f
export BLUE='\\033[38;2;131;165;152m'      # Bright Blue #83a598
export RED='\\033[38;2;251;73;52m'         # Bright Red #fb4934
export MAGENTA='\\033[38;2;211;134;155m'   # Bright Magenta #d3869b
export ORANGE='\\033[38;2;254;128;25m'     # Orange
export GRAY='\\033[38;2;146;131;116m'      # Gray #928374
export BG='\\033[48;2;29;32;33m'           # Background #1d2021
export FG='\\033[38;2;235;219;178m'        # Foreground #ebdbb2
export RESET='\\033[0m'
export BOLD='\\033[1m'
export DIM='\\033[2m'

alias welcome='cd ${sessionDir} && ${sessionDir}/scripts/welcome.sh'
alias help='${sessionDir}/scripts/help.sh'
alias about='${sessionDir}/scripts/about.sh'
alias contact='${sessionDir}/scripts/contact.sh'
alias blog='${sessionDir}/scripts/blog.sh'
alias projects='cd ${sessionDir}/projects && ${sessionDir}/scripts/projects.sh'
alias dotfiles='cd ${sessionDir}/projects/dotfiles && ${sessionDir}/scripts/dotfiles.sh'
alias stm32-games='cd ${sessionDir}/projects/stm32-games && ${sessionDir}/scripts/stm32-games.sh'
alias sulfur-recipies='cd ${sessionDir}/projects/sulfur-recipies && ${sessionDir}/scripts/sulfur-recipies.sh'
alias term-site='cd ${sessionDir}/projects/term-site && ${sessionDir}/scripts/term-site.sh'

# Neovim alias
alias vi='nvim'

eval "$(oh-my-posh init zsh --config /usr/share/oh-my-posh/themes/pure.omp.json)"

if [ -f "${sessionDir}/Univers.flf" ]; then
    export FIGLET_FONTDIR="${sessionDir}"
fi
`;

		await fs.writeFile(path.join(sessionDir, '.zshrc'), zshrc);

		// Also create .bashrc for compatibility
		const bashrc = `# Fallback bash configuration
source ${sessionDir}/.zshrc
`;
		await fs.writeFile(path.join(sessionDir, '.bashrc'), bashrc);

		// Copy figlet font to user session if available
		const fontSource = '/tmp/portfolio-template/Univers.flf';
		const fontDest = path.join(sessionDir, 'Univers.flf');
		try {
			await fs.copyFile(fontSource, fontDest);
		} catch (err) {
			console.log('Figlet font not available for session');
		}

		// Clone projects into projects directory
		await this.cloneProjects(sessionDir);

		// Setup nvim configuration after dotfiles are cloned
		await this.setupNvimConfig(sessionDir);
	}

	async cloneProjects(sessionDir) {
		const projectsDir = path.join(sessionDir, 'projects');

		// Ensure projects directory exists
		await fs.mkdir(projectsDir, { recursive: true });

		const projects = [
			{ name: 'term-site', url: 'https://github.com/twaldin/term-site.git' },
			{ name: 'stm32-games', url: 'https://github.com/twaldin/stm32-games.git' },
			{ name: 'dotfiles', url: 'https://github.com/twaldin/dotfiles.git' },
			{ name: 'sulfur-recipies', url: 'https://github.com/twaldin/sulfur-recipies.git' }
		];

		const { spawn } = require('child_process');

		for (const project of projects) {
			const projectPath = path.join(projectsDir, project.name);

			try {
				// Check if project already exists
				try {
					await fs.access(projectPath);
					console.log(`Project ${project.name} already exists, skipping clone`);
					continue;
				} catch {
					// Project doesn't exist, proceed with clone
				}

				console.log(`Cloning ${project.name} from ${project.url}...`);

				await new Promise((resolve, reject) => {
					const gitClone = spawn('git', ['clone', project.url, projectPath], {
						stdio: ['pipe', 'pipe', 'pipe'],
						timeout: 30000 // 30 second timeout
					});

					gitClone.on('close', (code) => {
						if (code === 0) {
							console.log(`Successfully cloned ${project.name}`);
							resolve();
						} else {
							console.error(`Failed to clone ${project.name}, exit code: ${code}`);
							reject(new Error(`Git clone failed for ${project.name}`));
						}
					});

					gitClone.on('error', (error) => {
						console.error(`Error cloning ${project.name}:`, error.message);
						reject(error);
					});
				});

			} catch (error) {
				console.error(`Failed to clone ${project.name}:`, error.message);
				// Continue with other projects even if one fails
			}
		}

		console.log('Project cloning completed');
	}

	async setupNvimConfig(sessionDir) {
		try {
			const dotfilesNvimPath = path.join(sessionDir, 'projects', 'dotfiles', 'nvim');
			const sessionNvimPath = path.join(sessionDir, '.config', 'nvim');

			// Check if dotfiles nvim config exists
			try {
				await fs.access(dotfilesNvimPath);
			} catch {
				console.log('Dotfiles nvim config not found, keeping basic config');
				return;
			}

			// Ensure .config directory exists
			await fs.mkdir(path.join(sessionDir, '.config'), { recursive: true });

			// Copy nvim config from dotfiles
			console.log('Copying nvim configuration from dotfiles...');
			await this.copyDirectory(dotfilesNvimPath, sessionNvimPath);

			// Install vim plugins using vim-pack
			console.log('Installing nvim plugins...');
			await this.installNvimPlugins(sessionDir);

			console.log('Nvim configuration setup completed');

		} catch (error) {
			console.error('Failed to setup nvim config:', error.message);
			console.log('Continuing with basic nvim config');
		}
	}

	async installNvimPlugins(sessionDir) {
		const { spawn } = require('child_process');

		try {
			// Run nvim with native vim.pack plugin installation
			console.log('Installing nvim plugins with vim.pack (this may take a moment)...');

			await new Promise((resolve, reject) => {
				// Use vim.pack native package manager commands
				const pluginInstall = spawn('nvim', [
					'--headless',
					'-c', 'vim.pack.install()',
					'-c', 'quitall'
				], {
					cwd: sessionDir,
					stdio: ['pipe', 'pipe', 'pipe'],
					timeout: 120000, // 2 minute timeout for plugin installation
					env: {
						...process.env,
						HOME: sessionDir,
						XDG_CONFIG_HOME: path.join(sessionDir, '.config')
					}
				});

				let output = '';
				let errorOutput = '';

				pluginInstall.stdout.on('data', (data) => {
					output += data.toString();
				});

				pluginInstall.stderr.on('data', (data) => {
					errorOutput += data.toString();
				});

				pluginInstall.on('close', (code) => {
					if (code === 0) {
						console.log('Nvim plugins installed successfully with vim.pack');
						resolve();
					} else {
						console.log('Plugin installation completed with code:', code);
						console.log('Output:', output);
						console.log('Error output:', errorOutput);
						// Don't reject - plugins might still work
						resolve();
					}
				});

				pluginInstall.on('error', (error) => {
					console.error('Error installing nvim plugins:', error.message);
					// Don't reject - continue without plugins
					resolve();
				});
			});

		} catch (error) {
			console.error('Failed to install nvim plugins:', error.message);
			// Continue without plugins
		}
	}

	runAutoWelcome(sessionId) {
		const session = this.sessions.get(sessionId);
		if (!session) {
			return;
		}

		console.log(`Running auto-welcome with typewriter effect for session ${sessionId}`);

		// Create flag file
		const sessionDir = session.sessionDir;
		const flagFile = `${sessionDir}/.welcomed`;

		// if already welcomed
		const fs = require('fs');
		if (fs.existsSync(flagFile)) {
			return;
		}

		fs.writeFileSync(flagFile, '');

		setTimeout(() => {
			this.typeCommand(sessionId, 'welcome');
		}, 10);
	}

	typeCommand(sessionId, command) {
		const session = this.sessions.get(sessionId);
		if (!session) {
			return;
		}

		let index = 0;
		const typeNextChar = () => {
			if (index < command.length) {
				session.terminal.write(command[index]);
				index++;
				setTimeout(typeNextChar, 100);
			} else {
				// Send enter to execute the command
				setTimeout(() => {
					session.terminal.write('\r');
				}, 100);
			}
		};

		typeNextChar();
	}

	sendInput(sessionId, data) {
		const session = this.sessions.get(sessionId);
		if (!session) {
			console.log(`Session ${sessionId} not found`);
			return;
		}

		session.lastActivity = Date.now();
		session.terminal.write(data);
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
