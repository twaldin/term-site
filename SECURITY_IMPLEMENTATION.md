# Security Implementation Guide

## Solution A: Google Cloud Run with gVisor (Recommended)

### Architecture Changes
1. **Remove Docker-in-Docker completely**
2. **Use Cloud Run's built-in isolation**
3. **Implement session management without Docker API**

### New Backend Architecture

```javascript
// backend/secure-session.js
const { spawn } = require('child_process');
const pty = require('node-pty');

class SecureSessionManager {
  createSession(sessionId, socket) {
    // No Docker needed - Cloud Run handles isolation
    const shell = pty.spawn('/bin/bash', [], {
      name: 'xterm-256color',
      cols: 120,
      rows: 30,
      cwd: '/home/user',
      env: {
        TERM: 'xterm-256color',
        // Restricted environment
        PATH: '/usr/local/bin:/usr/bin:/bin',
        HOME: '/home/user'
      }
    });
    
    // Each Cloud Run instance is already isolated
    // No container escape possible with gVisor
  }
}
```

### Deployment Configuration

```yaml
# cloudrun.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: terminal-portfolio
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/execution-environment: gen2  # Uses gVisor
    spec:
      containers:
      - image: gcr.io/PROJECT_ID/terminal-portfolio
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
        env:
        - name: NODE_ENV
          value: production
```

### Security Benefits
- **gVisor kernel isolation** prevents syscall exploits
- **No Docker daemon** access whatsoever
- **Automatic scaling** with isolated instances
- **Built-in DDoS protection**

---

## Solution B: Stay on Fly.io with Firecracker (Compromise)

### Remove Docker-in-Docker

```dockerfile
# backend/Dockerfile.secure
FROM node:18-alpine

# No Docker daemon needed
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Create isolated user environment
RUN adduser -D -s /bin/sh terminal && \
    mkdir -p /home/terminal/workspace

USER terminal
EXPOSE 3001
CMD ["npm", "start"]
```

### Implement Pseudo-Terminal Without Docker

```javascript
// backend/fly-secure-session.js
const pty = require('node-pty');
const fs = require('fs').promises;
const path = require('path');

class FlySecureSession {
  async createSession(sessionId, socket) {
    // Create isolated directory for this session
    const sessionDir = `/tmp/sessions/${sessionId}`;
    await fs.mkdir(sessionDir, { recursive: true });
    
    // Copy terminal portfolio files
    await this.copyPortfolioFiles(sessionDir);
    
    // Create chrooted environment
    const shell = pty.spawn('chroot', [
      sessionDir,
      '/bin/sh'
    ], {
      name: 'xterm-256color',
      cols: 120, 
      rows: 30
    });
    
    // Limit resources using Linux cgroups
    await this.applyResourceLimits(shell.pid);
  }
  
  async applyResourceLimits(pid) {
    // CPU limit: 0.5 cores
    await fs.writeFile(
      `/sys/fs/cgroup/cpu/terminal/${pid}/cpu.cfs_quota_us`,
      '50000'
    );
    
    // Memory limit: 256MB
    await fs.writeFile(
      `/sys/fs/cgroup/memory/terminal/${pid}/memory.limit_in_bytes`,
      '268435456'
    );
  }
}
```

### Fly.io Configuration

```toml
# fly.toml
app = "term-site-secure"
primary_region = "iad"

[build]
  dockerfile = "backend/Dockerfile.secure"

[experimental]
  enable_consul = false
  enable_docker = false  # Disable Docker

[[services]]
  internal_port = 3001
  protocol = "tcp"

[[vm]]
  cpu_kind = "shared"
  cpus = 2
  memory_mb = 1024

# No Docker mounts needed
```

---

## Solution C: WebContainers (Browser-Based)

### Use StackBlitz WebContainers API

```javascript
// frontend/components/WebTerminal.tsx
import { WebContainer } from '@webcontainer/api';

export function WebTerminal() {
  useEffect(() => {
    const initContainer = async () => {
      // Runs entirely in browser
      const container = await WebContainer.boot();
      
      // Mount file system
      await container.mount({
        'package.json': {
          file: {
            contents: JSON.stringify(packageJson)
          }
        }
      });
      
      // Start terminal
      const terminal = container.spawn('sh');
      
      // Completely isolated in browser sandbox
      // No server-side execution at all
    };
  }, []);
}
```

### Benefits
- **Zero server-side risk** - runs in browser
- **Perfect isolation** via browser sandbox
- **No infrastructure costs**
- **Can't access host** by design

---

## Security Hardening Checklist

### Immediate Actions
- [ ] Remove Docker-in-Docker from backend
- [ ] Disable Docker socket mounting
- [ ] Implement rate limiting per IP
- [ ] Add session timeouts (5 minutes)
- [ ] Restrict network access from containers

### Network Security
```javascript
// backend/security-middleware.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 sessions per IP
  message: 'Too many sessions from this IP'
});

// Block container network access
const containerNetworkPolicy = {
  NetworkMode: 'none',  // No network
  // OR
  NetworkMode: 'bridge',
  ExtraHosts: ['metadata.google.internal:127.0.0.1'], // Block metadata
  DnsOptions: ['ndots:0'],  // Prevent DNS queries
};
```

### Resource Limits
```javascript
const containerLimits = {
  Memory: 256 * 1024 * 1024,     // 256MB max
  CpuQuota: 25000,                // 0.25 CPU
  PidsLimit: 50,                  // Max 50 processes
  ULimit: [
    { Name: 'nofile', Soft: 1024, Hard: 1024 },  // File descriptors
    { Name: 'nproc', Soft: 32, Hard: 32 }        // Processes
  ],
  ReadonlyRootfs: true,           // Read-only filesystem
  TmpfsSize: 64 * 1024 * 1024,    // 64MB /tmp
};
```

### Security Headers
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],  // For terminal
      connectSrc: ["'self'", "wss:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## Migration Path

### Phase 1: Immediate Fixes (1 day)
1. Remove Docker-in-Docker
2. Implement basic PTY sessions
3. Add rate limiting

### Phase 2: Platform Migration (3-5 days)
1. Set up Google Cloud Run project
2. Modify backend for Cloud Run
3. Test gVisor isolation
4. Migrate DNS and deploy

### Phase 3: Enhanced Security (1 week)
1. Implement session recording/auditing
2. Add intrusion detection
3. Set up monitoring/alerting
4. Penetration testing

---

## Cost Analysis

| Solution | Monthly Cost | Security Level | Complexity |
|----------|-------------|----------------|------------|
| Cloud Run | $0-5 | Excellent (gVisor) | Low |
| Fly.io + Fixes | $0-7 | Good | Medium |
| WebContainers | $0 | Perfect (browser) | Low |
| AWS Fargate | $20+ | Excellent | High |

---

## Testing Security

### Test Commands (Safe)
```bash
# These should all fail in secure setup:

# Try to access Docker
docker ps

# Try to escape chroot
python3 -c 'import os; os.chdir("/"); os.chroot("/")'

# Try to access host network
curl http://metadata.google.internal

# Try to fork bomb (should hit PID limit)
:(){ :|:& };:

# Try to consume memory (should hit limit)
tail /dev/zero
```

### Monitoring
```javascript
// backend/security-monitor.js
class SecurityMonitor {
  detectSuspiciousActivity(session, command) {
    const suspicious = [
      /docker/i,
      /\/proc\/self/,
      /\/sys\/fs/,
      /metadata\./,
      /curl.*169\.254/,  // AWS/GCP metadata
    ];
    
    if (suspicious.some(pattern => pattern.test(command))) {
      console.warn(`SECURITY: Suspicious command in ${session}: ${command}`);
      // Alert and potentially terminate session
    }
  }
}
```