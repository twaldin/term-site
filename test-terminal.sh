#!/bin/bash

echo "🧪 Testing Terminal Portfolio Container..."
echo ""

echo "🔍 Testing basic functionality:"
docker run --rm terminal-portfolio:latest zsh -c "
echo '✅ Zsh working'
echo '✅ User:' \$(whoami)
echo '✅ Home:' \$HOME
echo '✅ Theme:' \$(grep ZSH_THEME ~/.zshrc | head -1)
echo '✅ Neovim:' \$(nvim --version | head -1)
echo '✅ Write test:' && echo 'test' > /tmp/test.txt && cat /tmp/test.txt
echo '✅ Tools available:' && which git fzf rg bat tree
"

echo ""
echo "🚀 To start interactive terminal:"
echo "docker run -it --rm terminal-portfolio:latest"
echo ""
echo "🌐 To start full web app:"
echo "1. cd backend && npm start"
echo "2. cd frontend && npm run dev"
echo "3. Open http://localhost:3000"