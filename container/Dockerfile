FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update package lists and install basic packages first
RUN apt-get update --fix-missing && \
    apt-get install -y ca-certificates apt-transport-https software-properties-common

# Add universe repository and update again
RUN add-apt-repository universe && apt-get update

# Install curl first for Node.js setup
RUN apt-get install -y curl

# Install Node.js repository
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

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
    wget \
    unzip \
    tree \
    htop \
    procps \
    coreutils \
    findutils \
    ncurses-base \
    zsh \
    nodejs \
    && useradd -m -s /bin/zsh -d /home/portfolio portfolio \
    && mkdir -p /home/portfolio/.bashrc.d \
    && rm -rf /var/lib/apt/lists/*

# Clone dotfiles repository will be done later after user creation

# Copy all scripts
COPY container/scripts/ /home/portfolio/scripts/
COPY container/blog/ /home/portfolio/blog/
COPY container/Univers.flf /usr/share/figlet/Univers.flf

# Install npm packages for enhanced terminal scripts
RUN cd /home/portfolio/scripts && \
    npm install chalk@4.1.2 figlet@1.8.2 gradient-string@2.0.2 marked@4.3.0 marked-terminal@5.2.0 cli-highlight@2.1.11 boxen@5.1.2

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

# Set proper ownership for all user directories
RUN chown -R portfolio:portfolio /home/portfolio/.config && \
    chown -R portfolio:portfolio /home/portfolio/.local && \
    chown -R portfolio:portfolio /home/portfolio/workspace && \
    chown -R portfolio:portfolio /home/portfolio/tmp

# Switch to portfolio user to install Oh My Posh
USER portfolio
WORKDIR /home/portfolio

# Install Oh My Posh
RUN curl -s https://ohmyposh.dev/install.sh | bash -s -- -d /home/portfolio/.local/bin

# Clone dotfiles and project repositories directly into container
RUN git clone https://github.com/twaldin/dotfiles.git /home/portfolio/.dotfiles && \
    mkdir -p /home/portfolio/projects && \
    cd /home/portfolio/projects && \
    git clone https://github.com/twaldin/stm32-games.git && \
    git clone https://github.com/twaldin/sulfur-recipies.git && \
    git clone https://github.com/twaldin/term-site.git && \
    ln -sf /home/portfolio/scripts/stm32-games.sh /home/portfolio/projects/stm32-games/stm32-games.sh && \
    ln -sf /home/portfolio/scripts/term-site.sh /home/portfolio/projects/term-site/term-site.sh && \
    ln -sf /home/portfolio/scripts/sulfur-recipies.sh /home/portfolio/projects/sulfur-recipies/sulfur-recipies.sh && \
    ln -sf /home/portfolio/scripts/dotfiles.sh /home/portfolio/.dotfiles/dotfiles.sh

# Create custom .zshrc with navigation aliases
RUN cp /home/portfolio/.dotfiles/zsh/zshrc /home/portfolio/.zshrc && \
    echo "" >> /home/portfolio/.zshrc && \
    echo "# Portfolio navigation aliases" >> /home/portfolio/.zshrc && \
    echo "alias projects='cd ~/projects && /home/portfolio/scripts/projects.sh'" >> /home/portfolio/.zshrc && \
    echo "alias stm32-games='cd ~/projects/stm32-games && /home/portfolio/scripts/stm32-games.sh'" >> /home/portfolio/.zshrc && \
    echo "alias term-site='cd ~/projects/term-site && /home/portfolio/scripts/term-site.sh'" >> /home/portfolio/.zshrc && \
    echo "alias sulfur-recipies='cd ~/projects/sulfur-recipies && /home/portfolio/scripts/sulfur-recipies.sh'" >> /home/portfolio/.zshrc && \
    echo "alias dotfiles='cd ~/.dotfiles && /home/portfolio/scripts/dotfiles.sh'" >> /home/portfolio/.zshrc && \
    echo "alias home='cd ~ && /home/portfolio/scripts/welcome.sh'" >> /home/portfolio/.zshrc && \
    echo "alias welcome='cd ~ && /home/portfolio/scripts/welcome.sh'" >> /home/portfolio/.zshrc && \
    echo "alias contact='/home/portfolio/scripts/contact'" >> /home/portfolio/.zshrc && \
    echo "alias help='/home/portfolio/scripts/help.sh'" >> /home/portfolio/.zshrc && \
    echo "alias blog='/home/portfolio/scripts/blog'" >> /home/portfolio/.zshrc && \
    chown portfolio:portfolio /home/portfolio/.zshrc

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
    chmod +x /home/portfolio/scripts/welcome && \
    chmod +x /home/portfolio/scripts/contact && \
    chmod +x /home/portfolio/scripts/help && \
    chmod +x /home/portfolio/scripts/blog


# Create basic directory structure (empty but functional)
RUN mkdir -p /home/portfolio

# Add PATH for scripts and portfolio aliases
RUN echo 'export PATH="/home/portfolio/scripts:$PATH"' >> /home/portfolio/.bashrc && \
    echo "# Portfolio navigation aliases" >> /home/portfolio/.bashrc && \
    echo "alias projects='cd ~/projects && /home/portfolio/scripts/projects.sh'" >> /home/portfolio/.bashrc && \
    echo "alias stm32-games='cd ~/projects/stm32-games && /home/portfolio/scripts/stm32-games.sh'" >> /home/portfolio/.bashrc && \
    echo "alias term-site='cd ~/projects/term-site && /home/portfolio/scripts/term-site.sh'" >> /home/portfolio/.bashrc && \
    echo "alias sulfur-recipies='cd ~/projects/sulfur-recipies && /home/portfolio/scripts/sulfur-recipies.sh'" >> /home/portfolio/.bashrc && \
    echo "alias dotfiles='cd ~/.dotfiles && /home/portfolio/scripts/dotfiles.sh'" >> /home/portfolio/.bashrc && \
    echo "alias home='cd ~ && /home/portfolio/scripts/welcome.sh'" >> /home/portfolio/.bashrc && \
    echo "alias welcome='cd ~ && /home/portfolio/scripts/welcome.sh'" >> /home/portfolio/.bashrc && \
    echo "alias contact='/home/portfolio/scripts/contact'" >> /home/portfolio/.bashrc && \
    echo "alias help='/home/portfolio/scripts/help.sh'" >> /home/portfolio/.bashrc && \
    echo "alias blog='/home/portfolio/scripts/blog'" >> /home/portfolio/.bashrc

# Set proper ownership
RUN chown -R portfolio:portfolio /home/portfolio

# Create a restricted shell environment with welcome screen
RUN echo '#!/bin/zsh' > /home/portfolio/secure-shell.sh && \
    echo 'export HOME=/home/portfolio' >> /home/portfolio/secure-shell.sh && \
    echo 'export USER=portfolio' >> /home/portfolio/secure-shell.sh && \
    echo 'export SHELL=/bin/zsh' >> /home/portfolio/secure-shell.sh && \
    echo 'cd /home/portfolio' >> /home/portfolio/secure-shell.sh && \
    echo '# Navigation aliases are loaded in .zshrc' >> /home/portfolio/secure-shell.sh && \
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