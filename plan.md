# Terminal Portfolio Implementation Plan

## Project Overview

Build a web-based terminal portfolio where technical reviewers interact with a real Linux environment to explore projects and resume content. Each user session runs in an isolated Docker container with full command access while maintaining host security through containerization.

## Architecture

Frontend: Next.js application with xterm.js terminal emulator
Backend: Node.js WebSocket server using node-pty for terminal spawning  
Containers: Alpine Linux containers with read-only filesystem and resource limits
Host: Hetzner VPS running Docker with gVisor runtime for enhanced isolation

## Technology Stack

Frontend Framework: Next.js 14 with TypeScript
Terminal Emulator: xterm.js with fit addon for responsive sizing
WebSocket Library: Socket.IO for reliable bidirectional communication
Backend Runtime: Node.js with Express for HTTP and Socket.IO server
Terminal Interface: node-pty for spawning and controlling terminal processes
Container Runtime: Docker with gVisor (runsc) for syscall interception
Base Image: Alpine Linux 3.19 for minimal attack surface
Process Manager: PM2 for application lifecycle management

## Security Model

Container isolation prevents host access through multiple layers:
- Read-only root filesystem with tmpfs for temporary files
- No network access within containers (--network=none)
- Resource limits: 256MB RAM, 0.25 CPU cores, 50 processes maximum
- Non-root user execution within containers
- gVisor runtime intercepts all syscalls before reaching host kernel
- Automatic container termination after 15 minutes or on disconnect
- Rate limiting: one session per IP address

Users can execute any command including rm -rf / and fork bombs. These only affect the ephemeral container which gets automatically replaced.

## Local Development Setup

Development environment runs containers locally with same security constraints as production. Docker Desktop provides container runtime. Frontend connects to local backend on localhost:3001. Hot reload enabled for both frontend and backend development.

Required local dependencies:
- Node.js 18+ for frontend and backend development
- Docker Desktop for container testing
- gVisor installation for production-equivalent security testing

## Project Structure

```
term-site/
├── frontend/          # Next.js application
│   ├── components/    # Terminal component and UI
│   ├── pages/         # Next.js pages
│   └── lib/           # WebSocket client logic
├── backend/           # Node.js WebSocket server
│   ├── server.js      # Main application entry
│   ├── session.js     # Container session management
│   └── container.js   # Docker container operations
├── container/         # Alpine Linux container definition
│   ├── Dockerfile     # Container image specification
│   └── entrypoint.sh  # Container startup script
└── deployment/        # Production deployment configuration
    ├── docker-compose.yml
    └── nginx.conf
```

## Implementation Phases

Phase 1: Core Terminal Functionality
Create Next.js frontend with xterm.js integration. Implement WebSocket server with node-pty for terminal spawning. Build Alpine container with basic shell access. Establish WebSocket communication between frontend and backend with terminal data streaming.

Phase 2: Container Security Implementation  
Configure Docker containers with security constraints and resource limits. Implement gVisor runtime for enhanced isolation. Add session management with automatic cleanup on disconnect. Implement rate limiting and connection validation.

Phase 3: Production Deployment
Deploy frontend to Vercel with environment-based WebSocket endpoint configuration. Configure Hetzner VPS with Docker and gVisor installation. Deploy backend with PM2 process management and Nginx reverse proxy. Implement health checks and monitoring for container lifecycle.

## Container Implementation

Alpine Linux base provides minimal attack surface with essential tools pre-installed: vim, grep, fzf, less, and basic shell utilities. Container runs as non-root user 'portfolio' with home directory containing placeholder content for navigation testing.

Container lifecycle management handles spawning on WebSocket connection, monitoring for health status, automatic termination on disconnect or timeout, and cleanup of stopped containers to prevent resource leaks.

## WebSocket Communication Protocol

Client sends terminal input as 'input' events with command data. Server responds with 'output' events containing terminal stdout/stderr. Connection management includes 'connect' for session establishment, 'disconnect' for cleanup triggering, and 'error' for connection failure handling.

Session state tracking maintains container ID mapping to WebSocket connections, terminal dimensions for proper rendering, and connection timestamps for timeout enforcement.

## Deployment Configuration

Frontend deployment to Vercel requires environment variable NEXT_PUBLIC_WS_URL pointing to backend WebSocket endpoint. Build process includes TypeScript compilation and static asset optimization.

Backend deployment on Hetzner VPS uses PM2 for process management with automatic restart on failure. Nginx serves as reverse proxy handling WebSocket upgrade headers and SSL termination. Docker daemon configured with gVisor runtime as default for all containers.

## Development Workflow

Local testing requires Docker Desktop running with gVisor installed. Frontend development server runs on port 3000 with backend on port 3001. Environment variables configure WebSocket endpoints for local versus production connectivity.

Container testing involves building Alpine image locally and verifying security constraints function correctly. Integration testing validates WebSocket communication and terminal functionality across different scenarios including connection drops and container failures.

## Production Considerations

Container resource monitoring prevents host resource exhaustion through Docker's built-in limits. Log aggregation captures container lifecycle events and WebSocket connection metrics. Health checks verify backend service availability and container spawning functionality.

Cost optimization targets under $5 monthly through Hetzner VPS selection and efficient container resource allocation. Scaling approach supports up to 10 concurrent users on single VPS with upgrade path to higher-resource instances.

## Security Validation

Attack surface analysis confirms containers cannot access host filesystem, network interfaces, or other containers. Privilege escalation attempts fail due to non-root user and security constraints. Resource exhaustion attacks contained within individual container limits.

Host monitoring validates gVisor syscall interception prevents kernel access from containerized processes. Network isolation verified through container inability to establish external connections or access host services.

## Testing Strategy

Unit tests cover WebSocket communication logic and container management functions. Integration tests validate end-to-end terminal functionality including command execution and output streaming. Security tests verify container isolation and resource limit enforcement.

Load testing simulates multiple concurrent sessions to validate performance characteristics and resource utilization. Failure testing includes container crashes, network disconnections, and resource exhaustion scenarios.