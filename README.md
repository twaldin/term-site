# Terminal Portfolio

My portfolio website that looks like a terminal. Users get an xterm.js terminal that connects to Docker containers where they can run commands, explore my projects, read my blog, etc.

## How it works

- **Frontend**: Next.js app with xterm.js terminal
- **Backend**: Node.js server that spawns Docker containers via Socket.IO
- **Terminal**: Each user gets their own Ubuntu container with my portfolio content
## Project Structure

```
term-site/
├── frontend/          # Next.js app with xterm.js terminal
├── backend/           # Node.js server that manages Docker containers
│   ├── server.js      # Socket.IO server
│   └── session.js     # Container spawning & management
└── container/         # Ubuntu Docker container with portfolio content
    ├── Dockerfile     # Container setup
    └── scripts/       # Portfolio navigation scripts
```

## Security

Each user gets an isolated Docker container with:
- 512MB RAM limit, 0.5 CPU limit
- No network access
- Non-root user (portfolio user)
- Auto-cleanup when disconnected

Users can run destructive commands like `rm -rf /` or fork bombs - they only affect their own container, not the host.

## Commands Available

The container has standard Linux tools plus some custom portfolio navigation:
- `welcome` - Go to home page
- `projects` - View my projects
- `blog` - Read blog posts
- `contact` - Contact info
- `help` - Show available commands

Plus all the usual stuff: `ls`, `cd`, `cat`, `vim`, `grep`, `git`, `tree`, `htop`, etc.

