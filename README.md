# Terminal Portfolio

A web-based terminal portfolio where technical reviewers can explore projects and resume content through a real Linux terminal environment. Each user session runs in an isolated Docker container with full command access while maintaining host security.

## Quick Start

### Local Development

1. **Start Backend Server**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend runs on http://localhost:3001

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on http://localhost:3000

3. **Open Browser**
   Navigate to http://localhost:3000 to access the terminal interface

### Development Mode Features

- Uses local shell (bash/cmd) instead of Docker containers for easier development
- Hot reload for both frontend and backend changes
- Full terminal functionality with xterm.js
- WebSocket communication between frontend and backend

## Architecture

- **Frontend**: Next.js with xterm.js terminal emulator
- **Backend**: Node.js with Socket.IO for WebSocket communication
- **Terminal**: node-pty for terminal process management
- **Security**: Docker containers with read-only filesystem and resource limits
- **Runtime**: gVisor for enhanced container isolation in production

## Project Structure

```
term-site/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── components/  # Terminal component
│   │   ├── app/         # Next.js app router
│   │   └── lib/         # WebSocket client
├── backend/           # Node.js WebSocket server
│   ├── server.js      # Main server
│   └── session.js     # Session management
├── container/         # Docker container definition
│   ├── Dockerfile     # Alpine Linux container
│   └── build.sh       # Container build script
└── deployment/        # Production deployment config
```

## Security Model

### Container Isolation
- Read-only root filesystem with tmpfs for temporary files
- No network access within containers
- Resource limits: 256MB RAM, 0.25 CPU cores, 50 processes
- Non-root user execution
- Automatic container cleanup on disconnect

### Runtime Security
- gVisor runtime intercepts syscalls before reaching host kernel
- Seccomp profiles limit available system calls
- Container escaping prevented through multiple isolation layers

### User Experience
Users can execute any command including:
- `rm -rf /` - Only affects the ephemeral container
- Fork bombs - Contained within process limits
- Memory exhaustion - Limited by container memory caps

All destructive actions are isolated and containers automatically recover.

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### Backend (.env)
```
NODE_ENV=development
PORT=3001
```

## Available Commands in Terminal

Basic navigation:
- `ls`, `ll`, `la` - List files
- `cd` - Change directory
- `pwd` - Current directory
- `tree` - Directory structure

File operations:
- `cat`, `bat` - View files
- `vim`, `nano` - Edit files
- `grep`, `rg` - Search text
- `fzf` - Fuzzy file finder

System monitoring:
- `htop` - Process monitor
- `ps` - List processes
- `free` - Memory usage
- `df` - Disk usage

Custom commands:
- `help` - Show available commands

## Deployment

See `plan.md` for detailed deployment instructions including:
- Vercel frontend deployment
- Hetzner VPS backend setup
- Docker container security configuration
- gVisor runtime installation

## Cost

- **Development**: Free (local machine)
- **Production**: ~$3.50/month (Hetzner VPS + Vercel free tier)
- **Capacity**: 8-10 concurrent users on basic VPS

## Development Notes

The application uses different terminal backends based on environment:
- **Development**: Local shell via node-pty
- **Production**: Docker containers with Alpine Linux

This allows for rapid development without requiring Docker while maintaining production security through containerization.