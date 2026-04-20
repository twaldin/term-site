const Docker = require('dockerode');

class SessionManager {
  constructor() {
    this.sessions = new Map();

    // Configure Docker client
    const dockerOptions = {};

    if (process.env.DOCKER_HOST) {
      const hostParts = process.env.DOCKER_HOST.replace('tcp://', '').split(':');
      dockerOptions.host = hostParts[0];
      dockerOptions.port = parseInt(hostParts[1]) || 2375;
    }

    this.docker = new Docker(dockerOptions);
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
        .sort((a, b) => b.Created - a.Created);

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

      // Remove any dangling/untagged images
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
          console.log('Connected to Docker daemon');
        } catch (err) {
          console.log(`Waiting for Docker daemon... (${retries} retries left):`, err.message);
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

      // Check if image exists locally
      try {
        const images = await this.docker.listImages();
        const imageExists = images.some(img =>
          img.RepoTags && img.RepoTags.includes(imageName)
        );

        if (imageExists) {
          console.log(`Found locally built ${imageName} image`);
          this.imagePreloaded = true;
        } else {
          console.log(`WARNING: ${imageName} not found locally.`);
          this.imagePreloaded = false;
        }
      } catch (err) {
        console.error('Error checking for local image:', err);
        this.imagePreloaded = false;
      }
    } catch (error) {
      console.error(`Error preloading image - will pull on demand:`, error);
      this.imagePreloaded = false;
    }
  }

  async createSession(sessionId, socket, initCommand) {
    if (this.sessions.size >= this.maxSessions) {
      throw new Error('Maximum session limit reached');
    }

    return this.createContainerSession(sessionId, socket, initCommand);
  }

  async createContainerSession(sessionId, socket, initCommand) {
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

      if (!imageExists) {
        console.log(`WARNING: ${imageName} not found locally. Container creation may fail.`);
      } else {
        console.log(`Using existing ${imageName} image`);
      }

      // Create Docker container with hardened security
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
          // UTF-8 locale so less / cat / pagers treat multi-byte sequences
          // (em-dash, box-drawing chars, nerd-font glyphs) as text rather
          // than printing them as `<E2><80><94>` binary-escapes.
          'LANG=C.UTF-8',
          'LC_ALL=C.UTF-8'
          // NOTE: COLUMNS / LINES intentionally NOT set here. Scripts that
          // read them at startup would render at the wrong size until the
          // first client resize lands (the "tiny nvim until you zoom once"
          // bug). Size comes from the PTY via TIOCGWINSZ once we've applied
          // the first resize from the client — see firstResizeApplied gate.
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
            'no-new-privileges:true'
          ],
          CapDrop: [
            'ALL'
          ],
          CapAdd: [],
          Tmpfs: {
            '/tmp': 'rw,noexec,nosuid,size=100m'
          }
        }
      });

      // Start container
      await container.start();

      // Pre-resize to a sensible default BEFORE the client resize arrives.
      // Fallback safety-net kicks in at 6s; if it fires, PTY is already at
      // 140x40 instead of docker's 80x24 default — so blog/welcome renders
      // at a usable width even in the worst case. Real client resize arrives
      // shortly after and overrides this.
      try {
        await container.resize({ h: 40, w: 140 });
      } catch (e) {
        console.warn(`Initial pre-resize failed for ${sessionId}:`, e?.message || e);
      }

      // Attach to container
      const stream = await container.attach({
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true,
        hijack: true
      });

      // Handle container output. The initCommand (welcome / projects / etc)
      // must not fire until BOTH (a) the shell prompt has appeared AND (b) the
      // first resize has been applied to the PTY. Otherwise scripts render
      // figlet boxes / nvim / blog output at the default 80x24 TTY size and
      // the whole screen looks "small until you zoom once". The resizeTerminal
      // handler below flips firstResizeApplied and also drives this gate.
      stream.on('data', (data) => {
        const output = data.toString();
        if (!output.includes('{"stream":true,"stdin":true,"stdout":true,"stderr":true,"hijack":true}')) {
          socket.emit('output', output);

          const session = this.sessions.get(sessionId);
          if (session && !session.promptSeen && output.includes('~ ')) {
            session.promptSeen = true;
            this.maybeRunInitCommand(sessionId);
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
        lastActivity: Date.now(),
        initCommand: initCommand,
        // Gates for running the initCommand: both must be true before we
        // auto-type anything. See stream.on('data') + resizeTerminal.
        promptSeen: false,
        firstResizeApplied: false,
        initCommandRun: false,
      };

      this.sessions.set(sessionId, session);

      // Safety net: if the client never sends a resize (half-broken client
      // shouldn't deadlock the welcome screen), force the gate open after 6s.
      // 6s covers slow mobile dynamic-import + socket-connect paths where
      // 2s was firing early and init was running at the docker default 80x24.
      // Pre-resize above already put us at 140x40 for this worst case.
      setTimeout(() => {
        const s = this.sessions.get(sessionId);
        if (s && !s.firstResizeApplied) {
          console.warn(`Session ${sessionId}: no resize within 6s, releasing initCommand gate`);
          s.firstResizeApplied = true;
          this.maybeRunInitCommand(sessionId);
        }
      }, 6000);

      // Set session timeout
      this.setSessionTimeout(sessionId);

      console.log(`Container session created for ${sessionId}`);

    } catch (error) {
      console.error(`Failed to create container for session ${sessionId}:`, error);
      throw error;
    }
  }

  autoTypeCommand(sessionId, command) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    if (!command || typeof command !== 'string') command = 'welcome';
    // Safety: whitelist characters so we never execute arbitrary shell chars via URL.
    // Any character outside [a-z0-9 _./-] drops us back to plain welcome.
    // Char whitelist — matches the frontend's SAFE_CMD_RE. Blocks shell
    // metachars (; | & > < ` $ ( ) { } [ ] " ' \ * ? etc). The frontend
    // also enforces BLOCKED_HEADS, so by the time a command reaches here
    // it's already been through one layer of validation.
    if (!/^[a-z0-9 ._/+=:,@-]+$/i.test(command) || command.length > 200) {
      console.warn(`Rejected initCommand for ${sessionId}: ${command} — falling back to welcome`);
      command = 'welcome';
    }

    console.log(`Auto-typing '${command}' for session ${sessionId}`);

    const chars = command.split('');
    let index = 0;

    const typeNext = () => {
      if (index < chars.length) {
        this.sendInput(sessionId, chars[index]);
        index++;
        setTimeout(typeNext, 60);
      } else {
        setTimeout(() => {
          this.sendInput(sessionId, '\r');
        }, 100);
      }
    };

    typeNext();
  }

  sendInput(sessionId, data) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.lastActivity = Date.now();
    session.stream.write(data);
  }

  resizeTerminal(sessionId, cols, rows) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.lastActivity = Date.now();
    session.container.resize({
      h: rows,
      w: cols
    }).then(() => {
      if (!session.firstResizeApplied) {
        session.firstResizeApplied = true;
        this.maybeRunInitCommand(sessionId);
      }
    }).catch((error) => {
      console.error(`Failed to resize container terminal for ${sessionId}:`, error);
    });
  }

  // Run the initCommand only once both the shell prompt has appeared AND the
  // first client resize has been applied to the PTY. This avoids rendering
  // welcome / nvim / blog at the default TTY size before the real viewport
  // dimensions are known.
  maybeRunInitCommand(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    if (session.initCommandRun) return;
    if (!session.promptSeen || !session.firstResizeApplied) return;

    session.initCommandRun = true;
    const cmd = session.initCommand || 'welcome';
    console.log(`Session ${sessionId}: prompt+resize ready, auto-typing '${cmd}'`);
    setTimeout(() => this.autoTypeCommand(sessionId, cmd), 200);
  }

  async destroySession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    console.log(`Destroying session ${sessionId}`);

    try {
      if (session.stream) {
        session.stream.end();
      }

      if (session.container) {
        await session.container.kill().catch(() => {});
        await session.container.remove({ force: true }).catch(() => {});
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
    if (!session) return;

    if (session.timeout) {
      clearTimeout(session.timeout);
    }

    session.timeout = setTimeout(() => {
      console.log(`Session ${sessionId} timed out`);
      const { socket } = session;
      this.destroySession(sessionId);
      if (socket) {
        socket.emit('output', '\r\n[Session timed out]\r\n');
        socket.disconnect();
      }
    }, this.sessionTimeout);
  }

  getActiveSessionCount() {
    return this.sessions.size;
  }

  getTotalContainerCount() {
    return this.sessions.size;
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
