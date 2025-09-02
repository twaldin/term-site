const Docker = require('dockerode');
const pty = require('node-pty');

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.docker = new Docker();
    this.maxSessions = 10;
    this.sessionTimeout = 15 * 60 * 1000; // 15 minutes
    this.imagePreloaded = false;
    
    // Preload the image on startup
    this.preloadImage();
  }
  
  async cleanupDockerSmart() {
    console.log('Smart Docker cleanup - keeping only recent images...');
    try {
      // Remove all stopped containers first
      const containers = await this.docker.listContainers({ all: true });
      for (const containerInfo of containers) {
        if (containerInfo.State !== 'running') {
          try {
            const container = this.docker.getContainer(containerInfo.Id);
            await container.remove({ force: true });
            console.log(`Removed stopped container: ${containerInfo.Id}`);
          } catch (err) {
            console.log(`Could not remove container ${containerInfo.Id}:`, err.message);
          }
        }
      }
      
      // Get all images sorted by creation date (newest first)
      const images = await this.docker.listImages();
      const portfolioImages = images
        .filter(img => img.RepoTags && img.RepoTags.some(tag => tag.includes('terminal-portfolio')))
        .sort((a, b) => b.Created - a.Created); // Sort by creation time, newest first
      
      // Keep only the most recent portfolio image, remove the rest
      if (portfolioImages.length > 1) {
        console.log(`Found ${portfolioImages.length} portfolio images, keeping newest, removing ${portfolioImages.length - 1} old ones`);
        for (let i = 1; i < portfolioImages.length; i++) {
          try {
            const image = this.docker.getImage(portfolioImages[i].Id);
            await image.remove({ force: true });
            console.log(`Removed old portfolio image: ${portfolioImages[i].Id}`);
          } catch (err) {
            console.log(`Could not remove old image ${portfolioImages[i].Id}:`, err.message);
          }
        }
      }
      
      // Remove any dangling/untagged images to free up space
      const danglingImages = images.filter(img => !img.RepoTags || img.RepoTags.includes('<none>:<none>'));
      for (const img of danglingImages) {
        try {
          const image = this.docker.getImage(img.Id);
          await image.remove({ force: true });
          console.log(`Removed dangling image: ${img.Id}`);
        } catch (err) {
          console.log(`Could not remove dangling image ${img.Id}:`, err.message);
        }
      }
      
      // Prune system to remove unused data
      try {
        await this.docker.pruneImages({ filters: { dangling: ['true'] } });
        await this.docker.pruneContainers();
        console.log('Pruned unused Docker resources');
      } catch (err) {
        console.log('Could not prune Docker resources:', err.message);
      }
      
    } catch (err) {
      console.error('Error during smart Docker cleanup:', err);
    }
  }
  
  async preloadImage() {
    const imageName = 'twaldin/terminal-portfolio:latest';
    console.log(`Preloading Docker image ${imageName} on startup...`);
    
    try {
      // Wait for Docker to be ready first
      let dockerReady = false;
      let retries = 30;
      while (!dockerReady && retries > 0) {
        try {
          await this.docker.ping();
          dockerReady = true;
          console.log('Docker daemon is ready');
        } catch (err) {
          console.log(`Waiting for Docker daemon... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries--;
        }
      }
      
      if (!dockerReady) {
        console.error('Docker daemon not ready after 30 seconds, skipping preload');
        return;
      }
      
      // Smart cleanup - keep only the most recent image
      await this.cleanupDockerSmart();
      
      // Pull fresh image with explicit latest tag
      console.log('Pulling fresh image from Docker Hub...');
      await new Promise((resolve, reject) => {
        // Force pull from registry by using registry URL
        const pullOptions = {
          authconfig: {} // Empty auth for public images
        };
        
        this.docker.pull(`docker.io/${imageName}`, pullOptions, (err, stream) => {
          if (err) {
            console.error(`Failed to start image pull:`, err);
            reject(err);
            return;
          }
          
          this.docker.modem.followProgress(stream, (err, res) => {
            if (err) {
              console.error(`Failed during image pull:`, err);
              reject(err);
            } else {
              console.log(`Successfully pulled fresh ${imageName} from registry`);
              this.imagePreloaded = true;
              // Clean up any duplicates that might have been created during pull
              this.cleanupDockerSmart().catch(err => console.log('Post-pull cleanup failed:', err));
              resolve(res);
            }
          });
        });
      });
    } catch (error) {
      console.error(`Error preloading image - will pull on demand:`, error);
      this.imagePreloaded = false;
    }
  }

  async createSession(sessionId, socket) {
    // Check session limit
    if (this.sessions.size >= this.maxSessions) {
      throw new Error('Maximum session limit reached');
    }

    try {
      // Always use Docker containers for security and isolation
      // Use local shell only if FORCE_LOCAL_SHELL environment variable is set
      if (process.env.FORCE_LOCAL_SHELL === 'true') {
        console.warn('WARNING: Using local shell - this is unsafe for production!');
        return this.createLocalSession(sessionId, socket);
      }

      // Default: Create Docker container for isolation
      return this.createContainerSession(sessionId, socket);
    } catch (error) {
      console.error(`Error creating session ${sessionId}:`, error);
      throw error;
    }
  }

  createLocalSession(sessionId, socket) {
    console.log(`Creating local shell session for ${sessionId}`);

    // Spawn local shell - using sh for compatibility
    const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/sh';
    const terminal = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 120,
      rows: 30,
      cwd: '/tmp',
      env: {
        TERM: 'xterm-256color',
        PATH: '/usr/local/bin:/usr/bin:/bin',
        HOME: '/tmp'
      }
    });

    // Handle terminal output
    terminal.onData((data) => {
      console.log(`Terminal output for ${sessionId}:`, JSON.stringify(data), 'length:', data.length);
      if (data.length > 0) {
        socket.emit('output', data);
      } else {
        console.log(`Skipping empty output for ${sessionId}`);
      }
    });

    // Handle terminal exit
    terminal.onExit((exitCode) => {
      console.log(`Terminal exited for session ${sessionId} with code ${exitCode}`);
      this.destroySession(sessionId);
      socket.disconnect();
    });

    // Let the shell initialize naturally without interference
    console.log(`Shell initialization started for ${sessionId}`);

    // Store session
    const session = {
      id: sessionId,
      type: 'local',
      terminal: terminal,
      socket: socket,
      startTime: Date.now(),
      lastActivity: Date.now()
    };

    this.sessions.set(sessionId, session);

    // Set session timeout
    this.setSessionTimeout(sessionId);

    console.log(`Local session created for ${sessionId}`);
    return Promise.resolve();
  }

  async createContainerSession(sessionId, socket) {
    console.log(`Creating container session for ${sessionId}`);

    try {
      const imageName = 'twaldin/terminal-portfolio:latest';
      
      // Check if image exists locally
      let imageExists = false;
      try {
        const images = await this.docker.listImages();
        imageExists = images.some(img => 
          img.RepoTags && img.RepoTags.includes(imageName)
        );
      } catch (err) {
        console.error('Failed to list images:', err);
      }
      
      // Pull if image doesn't exist or wasn't preloaded
      if (!imageExists || !this.imagePreloaded) {
        console.log(`Need to pull ${imageName} (exists: ${imageExists}, preloaded: ${this.imagePreloaded})`);
        try {
          await new Promise((resolve, reject) => {
            const pullOptions = {
              authconfig: {} // Empty auth for public images
            };
            
            // Use full registry path to ensure we pull from Docker Hub
            this.docker.pull(`docker.io/${imageName}`, pullOptions, (err, stream) => {
              if (err) {
                reject(err);
                return;
              }
              
              this.docker.modem.followProgress(stream, (err, res) => {
                if (err) {
                  reject(err);
                } else {
                  console.log(`Successfully pulled fresh ${imageName} from Docker Hub`);
                  resolve(res);
                }
              });
            });
          });
          this.imagePreloaded = true;
        } catch (pullError) {
          console.error(`Failed to pull image ${imageName}:`, pullError);
          throw new Error(`Failed to pull terminal image: ${pullError.message}`);
        }
      } else {
        console.log(`Using existing ${imageName} image`);
      }

      // Create Docker container with enhanced security
      const container = await this.docker.createContainer({
        Image: imageName,
        Hostname: 'twaldin',
        Tty: true,
        OpenStdin: true,
        StdinOnce: false,
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: true,
        Env: [
          'TERM=xterm-256color',
          'PS1=portfolio@twaldin:$ ',
          'COLUMNS=120',  // Set default columns for welcome script
          'LINES=30'      // Set default lines
        ],
        WorkingDir: '/home/portfolio',
        User: 'portfolio',
        Labels: {
          'app': 'terminal-portfolio',
          'session': sessionId
        },
        HostConfig: {
          Memory: 512 * 1024 * 1024, // 512MB limit
          CpuQuota: 50000, // 0.5 CPU limit
          PidsLimit: 100, // Process limit
          ReadonlyRootfs: false, // Need write for nvim plugins
          NetworkMode: 'none', // No network access for security
          SecurityOpt: [
            'no-new-privileges:true',
            'seccomp=unconfined' // Required for some terminal operations
          ],
          CapDrop: [ // Drop all capabilities except essential ones
            'ALL'
          ],
          CapAdd: [
            'CHOWN',
            'SETUID',
            'SETGID',
            'DAC_OVERRIDE'
          ],
          Tmpfs: { // Use tmpfs for temp directories
            '/tmp': 'rw,noexec,nosuid,size=100m'
          }
        }
      });

      // Start container
      await container.start();

      // Attach to container
      const stream = await container.attach({
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true,
        hijack: true
      });

      // Track if we've sent the welcome command
      let welcomeSent = false;

      // Handle container output
      stream.on('data', (data) => {
        const output = data.toString();
        // Filter out Docker debug messages that shouldn't be shown to users
        if (!output.includes('{"stream":true,"stdin":true,"stdout":true,"stderr":true,"hijack":true}')) {
          socket.emit('output', output);
          
          // Check if the prompt has appeared and we haven't sent welcome yet
          if (!welcomeSent && output.includes('~ ')) {
            welcomeSent = true;
            console.log(`Prompt detected for session ${sessionId}, auto-typing welcome...`);
            // Small delay to ensure prompt is fully rendered
            setTimeout(() => {
              this.autoTypeWelcome(sessionId);
            }, 200);
          }
        }
      });

      // Handle container close
      stream.on('close', () => {
        console.log(`Container stream closed for session ${sessionId}`);
        this.destroySession(sessionId);
      });

      // Store session
      const session = {
        id: sessionId,
        type: 'container',
        container: container,
        stream: stream,
        socket: socket,
        startTime: Date.now(),
        lastActivity: Date.now()
      };

      this.sessions.set(sessionId, session);

      console.log(`Container session created for ${sessionId}`);
      return Promise.resolve();

    } catch (error) {
      console.error(`Failed to create container for session ${sessionId}:`, error);
      throw error;
    }
  }

  autoTypeWelcome(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.log(`Session ${sessionId} not found for auto-typing welcome`);
      return;
    }

    console.log(`Auto-typing 'welcome' for session ${sessionId}`);
    
    // Type "welcome" letter by letter with delays
    const letters = ['w', 'e', 'l', 'c', 'o', 'm', 'e'];
    let index = 0;
    
    const typeNextLetter = () => {
      if (index < letters.length) {
        this.sendInput(sessionId, letters[index]);
        index++;
        setTimeout(typeNextLetter, 100); // 100ms between letters (slower typing)
      } else {
        // After typing all letters, press Enter
        setTimeout(() => {
          this.sendInput(sessionId, '\r');
          console.log(`Completed auto-typing 'welcome' for session ${sessionId}`);
        }, 100);
      }
    };
    
    typeNextLetter();
  }

  sendInput(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.log(`Session ${sessionId} not found`);
      return;
    }

    console.log(`Received input for ${sessionId}:`, JSON.stringify(data));
    session.lastActivity = Date.now();

    if (session.type === 'local') {
      session.terminal.write(data);
    } else if (session.type === 'container') {
      session.stream.write(data);
    }
  }

  resizeTerminal(sessionId, cols, rows) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.lastActivity = Date.now();

    if (session.type === 'local') {
      session.terminal.resize(cols, rows);
    } else if (session.type === 'container') {
      // Resize container terminal
      session.container.resize({
        h: rows,
        w: cols
      }).catch((error) => {
        console.error(`Failed to resize container terminal for ${sessionId}:`, error);
      });
    }
  }

  async destroySession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    console.log(`Destroying session ${sessionId}`);

    try {
      if (session.type === 'local') {
        if (session.terminal && !session.terminal.killed) {
          session.terminal.kill();
        }
      } else if (session.type === 'container') {
        if (session.stream) {
          session.stream.end();
        }
        
        if (session.container) {
          // Kill and remove container
          await session.container.kill().catch(() => {});
          await session.container.remove({ force: true }).catch(() => {});
        }
      }

      // Clear timeout
      if (session.timeout) {
        clearTimeout(session.timeout);
      }

      this.sessions.delete(sessionId);
      console.log(`Session ${sessionId} destroyed`);

    } catch (error) {
      console.error(`Error destroying session ${sessionId}:`, error);
      this.sessions.delete(sessionId);
    }
  }

  async destroyAllSessions() {
    console.log('Destroying all sessions...');
    const promises = Array.from(this.sessions.keys()).map(sessionId => 
      this.destroySession(sessionId)
    );
    await Promise.all(promises);
    console.log('All sessions destroyed');
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
      console.log(`Session ${sessionId} timed out`);
      this.destroySession(sessionId);
      if (session.socket) {
        session.socket.emit('output', '\r\n[Session timed out]\r\n');
        session.socket.disconnect();
      }
    }, this.sessionTimeout);
  }

  getActiveSessionCount() {
    return this.sessions.size;
  }

  getTotalContainerCount() {
    return Array.from(this.sessions.values()).filter(s => s.type === 'container').length;
  }

  // Cleanup orphaned containers periodically
  async cleanupOrphanedContainers() {
    try {
      const containers = await this.docker.listContainers({
        all: true,
        filters: {
          label: ['app=terminal-portfolio']
        }
      });

      for (const containerInfo of containers) {
        const container = this.docker.getContainer(containerInfo.Id);
        
        // Check if container is in our active sessions
        const isActive = Array.from(this.sessions.values()).some(
          session => session.container && session.container.id === containerInfo.Id
        );

        if (!isActive) {
          console.log(`Cleaning up orphaned container: ${containerInfo.Id}`);
          await container.kill().catch(() => {});
          await container.remove({ force: true }).catch(() => {});
        }
      }
    } catch (error) {
      console.error('Error cleaning up orphaned containers:', error);
    }
  }
}

module.exports = SessionManager;