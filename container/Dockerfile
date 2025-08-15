FROM alpine:3.19

# Install essential tools and create user
RUN apk add --no-cache \
    bash \
    neovim \
    nano \
    grep \
    ripgrep \
    fzf \
    less \
    bat \
    exa \
    git \
    curl \
    wget \
    tree \
    htop \
    procps \
    coreutils \
    findutils \
    ncurses \
    shadow \
    nodejs \
    npm \
    python3 \
    py3-pip \
    build-base \
    zsh \
    && adduser -D -s /bin/zsh -h /home/portfolio portfolio \
    && mkdir -p /home/portfolio/.bashrc.d

# Install Oh My Zsh
RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Copy dotfiles from build context (submodule)
COPY dotfiles /home/portfolio/.dotfiles

# Create symlinks to dotfiles
RUN ln -sf /home/portfolio/.dotfiles/zsh/zshrc /home/portfolio/.zshrc && \
    ln -sf /home/portfolio/.dotfiles/nvim /home/portfolio/.config/nvim

# Set proper ownership
RUN chown -R portfolio:portfolio /home/portfolio/.dotfiles && \
    chown -R portfolio:portfolio /home/portfolio/.oh-my-zsh && \
    chown -R portfolio:portfolio /home/portfolio/.config && \
    chown -h portfolio:portfolio /home/portfolio/.zshrc

# Create directory structure for portfolio content
RUN mkdir -p /home/portfolio/portfolio && \
    mkdir -p /home/portfolio/projects && \
    mkdir -p /home/portfolio/scripts && \
    chown -R portfolio:portfolio /home/portfolio

# Add welcome message and basic portfolio content
RUN echo "Welcome to Terminal Portfolio!" > /home/portfolio/README.md && \
    echo "" >> /home/portfolio/README.md && \
    echo "This is a secure containerized terminal environment." >> /home/portfolio/README.md && \
    echo "You can run any command here - try 'ls', 'help', or even 'rm -rf /'!" >> /home/portfolio/README.md && \
    echo "" >> /home/portfolio/README.md && \
    echo "Available commands:" >> /home/portfolio/README.md && \
    echo "  ls, ll, la - List files" >> /home/portfolio/README.md && \
    echo "  cat, bat - View file contents" >> /home/portfolio/README.md && \
    echo "  nvim, nano - Edit files" >> /home/portfolio/README.md && \
    echo "  grep, rg - Search text" >> /home/portfolio/README.md && \
    echo "  fzf - Fuzzy file finder" >> /home/portfolio/README.md && \
    echo "  tree - Show directory structure" >> /home/portfolio/README.md && \
    echo "  htop - System monitor" >> /home/portfolio/README.md

# Add a basic help command script
RUN echo '#!/bin/bash' > /home/portfolio/scripts/help && \
    echo 'echo "Terminal Portfolio Commands:"' >> /home/portfolio/scripts/help && \
    echo 'echo "  help     - Show this help message"' >> /home/portfolio/scripts/help && \
    echo 'echo "  ls, ll   - List files and directories"' >> /home/portfolio/scripts/help && \
    echo 'echo "  cat FILE - View file contents"' >> /home/portfolio/scripts/help && \
    echo 'echo "  nvim FILE - Edit file with neovim"' >> /home/portfolio/scripts/help && \
    echo 'echo "  tree     - Show directory tree"' >> /home/portfolio/scripts/help && \
    echo 'echo "  htop     - System monitor"' >> /home/portfolio/scripts/help && \
    echo 'echo "  whoami   - Show current user"' >> /home/portfolio/scripts/help && \
    echo 'echo "  pwd      - Show current directory"' >> /home/portfolio/scripts/help && \
    echo 'echo ""' >> /home/portfolio/scripts/help && \
    echo 'echo "Try destructive commands too:"' >> /home/portfolio/scripts/help && \
    echo 'echo "  rm -rf / - Will only affect this container!"' >> /home/portfolio/scripts/help && \
    echo 'echo "  :(){ :|:& };: - Fork bomb (container will restart)"' >> /home/portfolio/scripts/help && \
    echo 'echo ""' >> /home/portfolio/scripts/help && \
    echo 'echo "This is a secure environment - experiment freely!"' >> /home/portfolio/scripts/help && \
    chmod +x /home/portfolio/scripts/help

# Create basic directory structure (empty but functional)
RUN mkdir -p /home/portfolio

# Add PATH for scripts
RUN echo 'export PATH="/home/portfolio/scripts:$PATH"' >> /home/portfolio/.bashrc

# Set proper ownership
RUN chown -R portfolio:portfolio /home/portfolio

# Switch to non-root user
USER portfolio
WORKDIR /home/portfolio

# Default command
CMD ["/bin/bash"]