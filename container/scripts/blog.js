#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const marked = require('marked');
const TerminalRenderer = require('marked-terminal');
const { highlight } = require('cli-highlight');
const { chalk, theme, gradients, typewriter, gradientAscii, gradientBorder, gradientBox } = require('./utils.js');

// Configure marked with terminal renderer
marked.setOptions({
  renderer: new TerminalRenderer({
    // Styling options
    heading: chalk.hex(theme.primary).bold,
    blockquote: chalk.hex(theme.muted).italic,
    code: (code, lang) => {
      if (lang) {
        try {
          return highlight(code, { language: lang, theme: 'tokyo-night' });
        } catch (e) {
          return chalk.hex(theme.yellow)(code);
        }
      }
      return chalk.hex(theme.yellow)(code);
    },
    codespan: chalk.hex(theme.yellow),
    strong: chalk.hex(theme.secondary).bold,
    em: chalk.hex(theme.accent).italic,
    link: chalk.hex(theme.cyan).underline,
    list: chalk.hex(theme.white),
    listitem: chalk.hex(theme.white),
    paragraph: chalk.hex(theme.white),
    tab: 4,
    width: 80
  })
});

class BlogSystem {
  constructor() {
    this.blogDir = '/home/portfolio/blog';
    this.postsDir = path.join(this.blogDir, 'posts');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.blogDir)) {
      fs.mkdirSync(this.blogDir, { recursive: true });
    }
    if (!fs.existsSync(this.postsDir)) {
      fs.mkdirSync(this.postsDir, { recursive: true });
      this.createSamplePosts();
    }
  }

  createSamplePosts() {
    const samplePosts = [
      {
        filename: '001-welcome-to-my-blog.md',
        content: `---
title: Welcome to My Terminal Blog
date: 2024-08-16
tags: [terminal, blog, introduction]
description: Welcome to my unique terminal-based blog system!
---

# Welcome to My Terminal Blog! 🚀

Hey there! Welcome to my **terminal-based blog** - a unique way to share thoughts and experiences directly in the command line.

## What Makes This Special?

- **Pure terminal experience** - No web browsers needed
- **Markdown powered** - Write in markdown, render beautifully in terminal
- **Syntax highlighting** - Code blocks look amazing
- **Tokyo Night theme** - Matching your terminal colors perfectly

## Cool Features

### Code Highlighting
\`\`\`javascript
const blog = new TerminalBlog();
blog.render('This looks amazing!');
\`\`\`

### Lists Work Great
- Terminal animations
- Gradient borders  
- Typewriter effects
- ASCII art generation

> This is a blockquote that demonstrates the styling capabilities.

## What's Next?

I'll be sharing insights about:
1. **Development projects** - STM32 games, web apps, and more
2. **Terminal customization** - Making CLI tools beautiful
3. **Learning experiences** - Documenting the journey

*Happy reading in the terminal!* ✨
`
      },
      {
        filename: '002-building-terminal-portfolio.md',
        content: `---
title: Building a Terminal-Based Portfolio
date: 2024-08-16
tags: [terminal, portfolio, xterm.js, docker]
description: How I built this interactive terminal portfolio website
---

# Building a Terminal-Based Portfolio

Creating a portfolio that runs entirely in the terminal was an exciting challenge that combines modern web technologies with classic command-line aesthetics.

## The Tech Stack

### Frontend
- **Next.js** - React framework for the web interface
- **xterm.js** - Terminal emulator in the browser
- **Socket.IO** - Real-time communication

### Backend  
- **Node.js** - Server runtime
- **node-pty** - Spawning pseudo-terminals
- **Docker** - Containerized terminal environment

## Why Terminal?

1. **Unique Experience** - Stand out from typical web portfolios
2. **Developer-Friendly** - Natural environment for tech content
3. **Security** - Sandboxed Docker container
4. **Fun Factor** - Interactive and engaging

## Implementation Highlights

### Dynamic ASCII Art
\`\`\`bash
# Using figlet with Univers font
figlet -f Univers "twald.in"
\`\`\`

### Gradient Borders
Beautiful terminal borders using gradient-string library for that modern aesthetic.

### Typewriter Effects
Every text output uses typewriter animation for dramatic effect.

## Challenges Overcome

- **Font sizing** - Dynamic calculation for responsive ASCII art
- **Color theming** - Consistent Tokyo Night colors throughout
- **Security** - Proper containerization and user isolation
- **Performance** - Efficient WebSocket communication

The result? A portfolio that feels like a real terminal but runs safely in your browser! 🎯
`
      },
      {
        filename: '003-tokyo-night-terminal-setup.md',
        content: `---
title: Tokyo Night Terminal Setup
date: 2024-08-16
tags: [terminal, theme, colors, setup]
description: Creating the perfect Tokyo Night terminal environment
---

# Tokyo Night Terminal Setup 🌃

Tokyo Night has become one of the most popular color schemes for developers, and for good reason - it's easy on the eyes and looks absolutely stunning.

## Color Palette

The Tokyo Night theme uses these beautiful colors:

### Primary Colors
- **Background**: \`#1a1b26\` - Deep dark blue
- **Foreground**: \`#ffffff\` - Clean white text
- **Primary**: \`#91ddff\` - Bright blue for accents

### Semantic Colors  
- **Success**: \`#95ffa4\` - Bright green
- **Warning**: \`#ffee58\` - Warm yellow
- **Error**: \`#ff8080\` - Soft red
- **Info**: \`#89d1dc\` - Calm cyan

## Terminal Applications

### Ghostty Configuration
\`\`\`toml
# ~/.config/ghostty/config
background = #1a1b26
foreground = #ffffff
cursor-color = #91ddff
palette = [
  "#1a1b26", "#ff8080", "#95ffa4", "#ffee58",
  "#91ddff", "#89d1dc", "#7dcfff", "#ffffff"
]
\`\`\`

### Zsh with Oh My Posh
Using the stelbent-compact.minimal theme for a clean, informative prompt.

## Why These Colors Work

1. **Low Eye Strain** - Dark background reduces fatigue
2. **High Contrast** - Excellent readability
3. **Aesthetic Appeal** - Modern, professional look
4. **Semantic Meaning** - Colors convey information naturally

The result is a terminal environment that's both beautiful and functional! ✨
`
      }
    ];

    samplePosts.forEach(post => {
      const filePath = path.join(this.postsDir, post.filename);
      fs.writeFileSync(filePath, post.content);
    });
  }

  async listPosts() {
    try {
      console.log(gradientAscii('BLOG', 'tokyo', 'Univers'));
      await gradientBorder(80, '═', 'tokyo');
      
      const files = fs.readdirSync(this.postsDir)
        .filter(file => file.endsWith('.md'))
        .sort();

      if (files.length === 0) {
        await typewriter('No blog posts found.', 50, 'muted');
        return;
      }

      await typewriter('📚 Available Blog Posts:', 30, 'primary');
      console.log('');

      for (const file of files) {
        const filePath = path.join(this.postsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const frontMatter = this.parseFrontMatter(content);
        
        const postNumber = file.substring(0, 3);
        const title = frontMatter.title || file.replace('.md', '');
        const date = frontMatter.date || 'Unknown date';
        const description = frontMatter.description || 'No description';

        console.log(chalk.hex(theme.cyan)(`  ${postNumber}`) + 
                   chalk.hex(theme.white).bold(` ${title}`));
        console.log(chalk.hex(theme.muted)(`      📅 ${date}`));
        console.log(chalk.hex(theme.white)(`      ${description}`));
        console.log('');
      }

      console.log(chalk.hex(theme.yellow)('💡 Usage: ') + 
                 chalk.hex(theme.white)('blog read <number> or blog read <filename>'));
    } catch (error) {
      console.error(chalk.hex(theme.error)('Error listing posts:'), error.message);
    }
  }

  async readPost(identifier) {
    try {
      let filename;
      
      // Check if identifier is a number (like 001, 002)
      if (/^\d+$/.test(identifier)) {
        const paddedNumber = identifier.padStart(3, '0');
        const files = fs.readdirSync(this.postsDir);
        filename = files.find(file => file.startsWith(paddedNumber));
      } else {
        // Assume it's a filename
        filename = identifier.endsWith('.md') ? identifier : `${identifier}.md`;
      }

      if (!filename) {
        await typewriter(`❌ Post "${identifier}" not found.`, 50, 'error');
        return;
      }

      const filePath = path.join(this.postsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        await typewriter(`❌ Post file "${filename}" not found.`, 50, 'error');
        return;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const { frontMatter, markdown } = this.parseFrontMatterAndContent(content);

      // Display header
      console.clear();
      await gradientBorder(80, '═', 'primary');
      
      if (frontMatter.title) {
        console.log(gradientAscii(frontMatter.title.substring(0, 20), 'primary', 'Univers'));
      }
      
      if (frontMatter.date) {
        console.log(chalk.hex(theme.muted)(`📅 ${frontMatter.date}`));
      }
      
      if (frontMatter.tags && frontMatter.tags.length > 0) {
        console.log(chalk.hex(theme.accent)(`🏷️  ${frontMatter.tags.join(', ')}`));
      }
      
      await gradientBorder(80, '═', 'primary');
      console.log('');

      // Render markdown with typewriter effect for dramatic reveal
      const rendered = marked.parse(markdown);
      const lines = rendered.split('\n');
      
      for (const line of lines) {
        console.log(line);
        if (line.trim()) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log('');
      await gradientBorder(80, '═', 'primary');
      console.log(chalk.hex(theme.muted)('💡 Type "blog" to return to post list'));

    } catch (error) {
      console.error(chalk.hex(theme.error)('Error reading post:'), error.message);
    }
  }

  parseFrontMatter(content) {
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!frontMatterMatch) return {};

    const frontMatterText = frontMatterMatch[1];
    const frontMatter = {};
    
    frontMatterText.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        let value = valueParts.join(':').trim();
        
        // Handle arrays (tags)
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(tag => tag.trim().replace(/['"]/g, ''));
        }
        
        frontMatter[key.trim()] = value;
      }
    });
    
    return frontMatter;
  }

  parseFrontMatterAndContent(content) {
    const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (frontMatterMatch) {
      const frontMatter = this.parseFrontMatter(content);
      const markdown = frontMatterMatch[2];
      return { frontMatter, markdown };
    }
    
    return { frontMatter: {}, markdown: content };
  }

  async searchPosts(query) {
    try {
      console.log(gradientAscii('SEARCH', 'accent', 'Univers'));
      await gradientBorder(80, '═', 'accent');
      
      const files = fs.readdirSync(this.postsDir).filter(file => file.endsWith('.md'));
      const results = [];

      for (const file of files) {
        const filePath = path.join(this.postsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const { frontMatter, markdown } = this.parseFrontMatterAndContent(content);
        
        // Search in title, tags, and content
        const searchIn = [
          frontMatter.title || '',
          (frontMatter.tags || []).join(' '),
          markdown
        ].join(' ').toLowerCase();

        if (searchIn.includes(query.toLowerCase())) {
          results.push({
            file,
            title: frontMatter.title || file.replace('.md', ''),
            date: frontMatter.date || 'Unknown date',
            description: frontMatter.description || 'No description'
          });
        }
      }

      if (results.length === 0) {
        await typewriter(`🔍 No posts found matching "${query}"`, 50, 'muted');
        return;
      }

      await typewriter(`🔍 Found ${results.length} post(s) matching "${query}":`, 30, 'accent');
      console.log('');

      for (const result of results) {
        const postNumber = result.file.substring(0, 3);
        console.log(chalk.hex(theme.cyan)(`  ${postNumber}`) + 
                   chalk.hex(theme.white).bold(` ${result.title}`));
        console.log(chalk.hex(theme.muted)(`      📅 ${result.date}`));
        console.log(chalk.hex(theme.white)(`      ${result.description}`));
        console.log('');
      }

    } catch (error) {
      console.error(chalk.hex(theme.error)('Error searching posts:'), error.message);
    }
  }
}

// CLI Interface
async function main() {
  const blog = new BlogSystem();
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'list') {
    await blog.listPosts();
  } else if (command === 'read' && args[1]) {
    await blog.readPost(args[1]);
  } else if (command === 'search' && args[1]) {
    await blog.searchPosts(args[1]);
  } else {
    console.log(gradientBox(`
Blog System Usage:

📚 blog              - List all posts
📖 blog read <id>    - Read a specific post (e.g., blog read 001)
🔍 blog search <term> - Search posts

Examples:
  blog
  blog read 001
  blog read welcome-to-my-blog
  blog search terminal
`, { 
      gradientName: 'tokyo',
      title: '📝 Blog Help'
    }));
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = BlogSystem;