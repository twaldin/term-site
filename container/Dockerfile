FROM alpine:3.19

# Install essential tools and create user
RUN apk add --no-cache \
    bash \
    vim \
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
    zsh \
    && adduser -D -s /bin/zsh -h /home/portfolio portfolio \
    && mkdir -p /home/portfolio/.bashrc.d

# Copy dotfiles from build context (submodule)
COPY dotfiles /home/portfolio/.dotfiles

# Create writable directories for user data
RUN mkdir -p /home/portfolio/.config && \
    mkdir -p /home/portfolio/.local/share && \
    mkdir -p /home/portfolio/.local/state && \
    mkdir -p /home/portfolio/.local/bin && \
    mkdir -p /home/portfolio/.cache && \
    mkdir -p /home/portfolio/.config/nvim && \
    mkdir -p /home/portfolio/workspace && \
    mkdir -p /home/portfolio/tmp

# Create simple nvim config (no LazyVim) with TokyoNight colors
RUN echo 'set number' > /home/portfolio/.config/nvim/init.vim && \
    echo 'set relativenumber' >> /home/portfolio/.config/nvim/init.vim && \
    echo 'set tabstop=2' >> /home/portfolio/.config/nvim/init.vim && \
    echo 'set shiftwidth=2' >> /home/portfolio/.config/nvim/init.vim && \
    echo 'set expandtab' >> /home/portfolio/.config/nvim/init.vim && \
    echo 'syntax enable' >> /home/portfolio/.config/nvim/init.vim && \
    echo 'set background=dark' >> /home/portfolio/.config/nvim/init.vim && \
    echo 'highlight Normal ctermfg=15 ctermbg=0' >> /home/portfolio/.config/nvim/init.vim && \
    echo 'highlight Comment ctermfg=8' >> /home/portfolio/.config/nvim/init.vim && \
    echo 'highlight String ctermfg=10' >> /home/portfolio/.config/nvim/init.vim && \
    echo 'highlight Keyword ctermfg=12' >> /home/portfolio/.config/nvim/init.vim && \
    echo 'highlight Function ctermfg=14' >> /home/portfolio/.config/nvim/init.vim && \
    echo 'highlight Type ctermfg=13' >> /home/portfolio/.config/nvim/init.vim && \
    echo 'highlight LineNr ctermfg=8' >> /home/portfolio/.config/nvim/init.vim

# Create basic .vimrc with same config  
RUN ln -sf /home/portfolio/.config/nvim/init.vim /home/portfolio/.vimrc

# Create symlink to your original zshrc
RUN ln -sf /home/portfolio/.dotfiles/zsh/zshrc /home/portfolio/.zshrc

# Set proper ownership for all user directories
RUN chown -R portfolio:portfolio /home/portfolio/.config && \
    chown -R portfolio:portfolio /home/portfolio/.local && \
    chown -R portfolio:portfolio /home/portfolio/workspace && \
    chown -R portfolio:portfolio /home/portfolio/tmp && \
    chown -h portfolio:portfolio /home/portfolio/.zshrc

# Switch to portfolio user to install Oh My Zsh
USER portfolio
WORKDIR /home/portfolio
RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Restore your original zshrc symlink (Oh My Zsh overwrites it)
RUN rm -f /home/portfolio/.zshrc && \
    ln -sf /home/portfolio/.dotfiles/zsh/zshrc /home/portfolio/.zshrc

# Switch back to root to continue setup
USER root

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

# Create a restricted shell environment
RUN echo '#!/bin/zsh' > /home/portfolio/secure-shell.sh && \
    echo 'export HOME=/home/portfolio' >> /home/portfolio/secure-shell.sh && \
    echo 'export USER=portfolio' >> /home/portfolio/secure-shell.sh && \
    echo 'export SHELL=/bin/zsh' >> /home/portfolio/secure-shell.sh && \
    echo 'cd /home/portfolio' >> /home/portfolio/secure-shell.sh && \
    echo 'exec /bin/zsh' >> /home/portfolio/secure-shell.sh && \
    chmod +x /home/portfolio/secure-shell.sh && \
    chown portfolio:portfolio /home/portfolio/secure-shell.sh

# Switch to non-root user and set working directory
USER portfolio
WORKDIR /home/portfolio

# Set environment variables for security
ENV HOME=/home/portfolio
ENV USER=portfolio
ENV SHELL=/bin/zsh
ENV PATH=/home/portfolio/scripts:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Default command starts secure shell
CMD ["/home/portfolio/secure-shell.sh"]