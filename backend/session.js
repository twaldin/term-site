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
  
  async preloadImage() {
    const imageName = 'twaldin/terminal-portfolio:latest';
    console.log(`Preloading Docker image ${imageName} on startup...`);
    
    try {
      // Remove any existing cached image first
      try {
        const image = this.docker.getImage(imageName);
        await image.remove({ force: true });
        console.log(`Removed old cached ${imageName} image`);
      } catch (err) {
        console.log(`No existing image to remove:`, err.message);
      }
      
      // Pull fresh image
      await new Promise((resolve, reject) => {
        this.docker.pull(imageName, (err, stream) => {
          if (err) {
            console.error(`Failed to preload image:`, err);
            reject(err);
            return;
          }
          
          this.docker.modem.followProgress(stream, (err, res) => {
            if (err) {
              console.error(`Failed to preload image:`, err);
              reject(err);
            } else {
              console.log(`Successfully preloaded ${imageName}`);
              this.imagePreloaded = true;
              resolve(res);
            }
          });
        });
      });
    } catch (error) {
      console.error(`Error preloading image:`, error);
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
      
      // Only pull if image wasn't preloaded or if forced
      if (!this.imagePreloaded) {
        console.log(`Image not preloaded, pulling ${imageName}...`);
        try {
          await new Promise((resolve, reject) => {
            this.docker.pull(imageName, (err, stream) => {
            if (err) {
              reject(err);
              return;
            }
            
            this.docker.modem.followProgress(stream, (err, res) => {
              if (err) {
                reject(err);
              } else {
                console.log(`Successfully pulled ${imageName}`);
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
        console.log(`Using preloaded ${imageName} image`);
      }

      // Create Docker container
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
          'PS1=portfolio@twaldin:$ '
        ],
        WorkingDir: '/home/portfolio',
        User: 'portfolio',
        HostConfig: {
          Memory: 512 * 1024 * 1024, // 512MB for LazyVim
          CpuQuota: 50000, // 0.5 CPU for better performance
          PidsLimit: 100,
          ReadonlyRootfs: false, // Allow LazyVim to work properly
          NetworkMode: 'bridge', // Allow network access for package installation
          SecurityOpt: [
            'no-new-privileges:true'
          ]
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

      // Handle container output
      stream.on('data', (data) => {
        const output = data.toString();
        // Filter out Docker debug messages that shouldn't be shown to users
        if (!output.includes('{"stream":true,"stdin":true,"stdout":true,"stderr":true,"hijack":true}')) {
          socket.emit('output', output);
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

      // Set session timeout
      this.setSessionTimeout(sessionId);

      console.log(`Container session created for ${sessionId}`);
      return Promise.resolve();

    } catch (error) {
      console.error(`Failed to create container for session ${sessionId}:`, error);
      throw error;
    }
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