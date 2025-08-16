FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update package lists and install basic packages first
RUN apt-get update --fix-missing && \
    apt-get install -y ca-certificates apt-transport-https software-properties-common

# Add universe repository and update again
RUN add-apt-repository universe && apt-get update

# Install all required packages in one layer
RUN apt-get install -y \
    bash \
    vim \
    neovim \
    nano \
    grep \
    ripgrep \
    fzf \
    less \
    bat \
    git \
    curl \
    wget \
    unzip \
    tree \
    htop \
    procps \
    coreutils \
    findutils \
    ncurses-base \
    zsh \
    && useradd -m -s /bin/zsh -d /home/portfolio portfolio \
    && mkdir -p /home/portfolio/.bashrc.d \
    && rm -rf /var/lib/apt/lists/*

# Copy dotfiles from build context (submodule)
COPY dotfiles /home/portfolio/.dotfiles

# Copy welcome scripts and projects
COPY container/welcome.sh /home/portfolio/scripts/welcome.sh
COPY container/scripts/ /home/portfolio/scripts/
COPY container/projects/ /home/portfolio/projects/
COPY container/simple-navigation.sh /home/portfolio/navigation.sh

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

# Switch to portfolio user to install Oh My Posh
USER portfolio
WORKDIR /home/portfolio

# Install Oh My Posh
RUN curl -s https://ohmyposh.dev/install.sh | bash -s -- -d /home/portfolio/.local/bin

# Create the zshrc symlink to use our updated dotfiles with oh-my-posh
RUN ln -sf /home/portfolio/.dotfiles/zsh/zshrc /home/portfolio/.zshrc && \
    echo "" >> /home/portfolio/.zshrc && \
    echo "# Load navigation functions" >> /home/portfolio/.zshrc && \
    echo "source /home/portfolio/navigation.sh" >> /home/portfolio/.zshrc

# Switch back to root to continue setup
USER root

# Create directory structure for portfolio content
RUN mkdir -p /home/portfolio/portfolio && \
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

# Set execute permissions for scripts
RUN chmod +x /home/portfolio/scripts/*.sh && \
    chmod +x /home/portfolio/scripts/welcome.sh && \
    chmod +x /home/portfolio/scripts/welcome && \
    chmod +x /home/portfolio/scripts/projects && \
    chmod +x /home/portfolio/scripts/contact && \
    chmod +x /home/portfolio/scripts/help && \
    chmod +x /home/portfolio/navigation.sh

# Create basic directory structure (empty but functional)
RUN mkdir -p /home/portfolio

# Add PATH for scripts and load navigation functions
RUN echo 'export PATH="/home/portfolio/scripts:$PATH"' >> /home/portfolio/.bashrc && \
    echo 'source /home/portfolio/navigation.sh' >> /home/portfolio/.bashrc

# Set proper ownership
RUN chown -R portfolio:portfolio /home/portfolio

# Create a restricted shell environment with welcome screen
RUN echo '#!/bin/zsh' > /home/portfolio/secure-shell.sh && \
    echo 'export HOME=/home/portfolio' >> /home/portfolio/secure-shell.sh && \
    echo 'export USER=portfolio' >> /home/portfolio/secure-shell.sh && \
    echo 'export SHELL=/bin/zsh' >> /home/portfolio/secure-shell.sh && \
    echo 'cd /home/portfolio' >> /home/portfolio/secure-shell.sh && \
    echo '# Load navigation functions' >> /home/portfolio/secure-shell.sh && \
    echo 'source /home/portfolio/navigation.sh' >> /home/portfolio/secure-shell.sh && \
    echo '# Show welcome dashboard on login' >> /home/portfolio/secure-shell.sh && \
    echo '/home/portfolio/scripts/welcome.sh' >> /home/portfolio/secure-shell.sh && \
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
ENV PATH=/home/portfolio/.local/bin:/home/portfolio/scripts:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Default command starts secure shell
CMD ["/home/portfolio/secure-shell.sh"]