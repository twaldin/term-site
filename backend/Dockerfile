# Secure Cloud Run Dockerfile - No Docker-in-Docker
FROM node:18-alpine

# Install bash, zsh and essential tools for terminal functionality + build tools for node-pty
RUN apk add --no-cache bash zsh vim nano git curl wget tree htop procps \
    coreutils findutils ncurses figlet python3 make g++ linux-headers rust cargo

# Install oh-my-posh for pure theme
RUN mkdir -p /usr/share/oh-my-posh/themes && \
    wget -O /usr/local/bin/oh-my-posh https://github.com/JanDeDobbeleer/oh-my-posh/releases/latest/download/posh-linux-amd64 && \
    chmod +x /usr/local/bin/oh-my-posh && \
    wget -O /usr/share/oh-my-posh/themes/pure.omp.json https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/pure.omp.json

# Install bob (nvim version manager) and latest nightly nvim
RUN cargo install bob-nvim && \
    /root/.cargo/bin/bob install nightly && \
    /root/.cargo/bin/bob use nightly && \
    ln -sf /root/.local/share/bob/nvim-bin/nvim /usr/local/bin/nvim && \
    ln -sf /root/.local/share/bob/nvim-bin/nvim /usr/local/bin/vi

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S portfolio && \
    adduser -S portfolio -u 1001 -G portfolio && \
    mkdir -p /home/portfolio && \
    chown -R portfolio:portfolio /home/portfolio

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production && npm cache clean --force

# Copy source code
COPY . .

# Create terminal environment directory
RUN mkdir -p /tmp/portfolio-base && \
    chown -R portfolio:portfolio /tmp/portfolio-base

# Expose port
EXPOSE 3001

# Set security environment variables
ENV NODE_ENV=production
ENV HOME=/home/portfolio
ENV USER=portfolio
ENV SHELL=/bin/bash

# Run as non-root user
USER portfolio

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start server
CMD ["npm", "start"]