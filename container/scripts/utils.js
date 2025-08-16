#!/usr/bin/env node

const chalk = require('chalk');
const figlet = require('figlet');
const gradient = require('gradient-string');
const boxen = require('boxen');

// Tokyo Night color theme matching your terminal-theme.ts
const theme = {
  background: '#1a1b26',   // Tokyo Night background
  foreground: '#ffffff',   // White text for contrast
  cursor: '#91ddff',       // Light blue cursor
  
  // ANSI colors from terminal theme
  black: '#1a1b26',        // Dark background
  red: '#ff8080',          // Error color from status segment
  green: '#95ffa4',        // Git clean state color
  yellow: '#ffee58',       // Terraform segment color
  blue: '#91ddff',         // Path segment color
  magenta: '#89d1dc',      // Git ahead color
  cyan: '#7dcfff',         // Complementary cyan
  white: '#ffffff',        // Clean white
  
  // Bright colors
  brightBlack: '#757575',  // Secondary text color
  brightRed: '#ff9248',    // Git modified color
  brightGreen: '#9fe044',  // Bright green
  brightYellow: '#faba4a', // Bright yellow
  brightBlue: '#8db0ff',   // Bright blue
  brightMagenta: '#c7a9ff', // Bright magenta
  brightCyan: '#a4daff',   // Bright cyan
  brightWhite: '#ffffff',  // Bright white
  
  // Aliases for common usage
  primary: '#91ddff',      // Blue - main accent
  secondary: '#95ffa4',    // Green - success
  accent: '#89d1dc',       // Magenta - highlights
  warning: '#ffee58',      // Yellow - warnings
  error: '#ff8080',        // Red - errors
  muted: '#757575'         // Gray - secondary text
};

// Tokyo Night inspired gradient definitions
const gradients = {
  rainbow: gradient(['#ff8080', '#ff9248', '#ffee58', '#95ffa4', '#91ddff', '#89d1dc', '#c7a9ff']),
  ocean: gradient([theme.blue, theme.cyan, theme.brightCyan]),
  sunset: gradient([theme.yellow, theme.brightYellow, theme.brightRed]),
  forest: gradient([theme.green, theme.brightGreen, '#4ade80']),
  neon: gradient([theme.accent, theme.primary, theme.brightMagenta]),
  fire: gradient([theme.red, theme.brightRed, theme.yellow]),
  tokyo: gradient([theme.primary, theme.accent, theme.secondary]),
  primary: gradient([theme.primary, theme.brightBlue]),
  secondary: gradient([theme.secondary, theme.brightGreen]),
  accent: gradient([theme.accent, theme.brightMagenta])
};

// Typewriter effect function
async function typewriter(text, delay = 15, color = 'white') {
  const colorFunc = chalk.hex(theme[color] || color);
  for (let i = 0; i <= text.length; i++) {
    process.stdout.write('\r' + colorFunc(text.slice(0, i)));
    if (i < text.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  process.stdout.write('\n');
}

// Enhanced typewriter with gradient support
async function gradientTypewriter(text, gradientName = 'rainbow', delay = 50) {
  const grad = gradients[gradientName] || gradients.rainbow;
  for (let i = 0; i <= text.length; i++) {
    process.stdout.write('\r' + grad(text.slice(0, i)));
    if (i < text.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  process.stdout.write('\n');
}

// Generate ASCII art with figlet
function generateAscii(text, font = 'Big') {
  try {
    return figlet.textSync(text, { font });
  } catch (error) {
    console.warn(`Font '${font}' not available, using default`);
    return figlet.textSync(text);
  }
}

// Generate gradient ASCII
function gradientAscii(text, gradientName = 'rainbow', font = 'Big') {
  const ascii = generateAscii(text, font);
  const grad = gradients[gradientName] || gradients.rainbow;
  return grad(ascii);
}

// Create gradient border
function gradientBorder(width = 80, char = '═', gradientName = 'neon') {
  const grad = gradients[gradientName] || gradients.neon;
  return grad(char.repeat(width));
}

// Create styled box with gradient border
function gradientBox(content, options = {}) {
  const {
    padding = 1,
    margin = 1,
    borderStyle = 'double',
    gradientName = 'neon',
    title = ''
  } = options;

  const grad = gradients[gradientName] || gradients.neon;
  
  return boxen(content, {
    padding,
    margin,
    borderStyle,
    borderColor: 'cyan', // fallback for terminals that don't support gradients
    title: title ? grad(title) : undefined
  });
}

// Center text function with proper width calculation
function centerText(text, width = 80, color = 'white') {
  // Remove ANSI codes for length calculation
  const cleanText = text.replace(/\u001b\[[0-9;]*m/g, '');
  const padding = Math.max(0, Math.floor((width - cleanText.length) / 2));
  const colorFunc = chalk.hex(theme[color] || color);
  return ' '.repeat(padding) + colorFunc(text);
}

// Animated separator
async function animatedSeparator(width = 80, char = '═', gradientName = 'neon', delay = 10) {
  const grad = gradients[gradientName] || gradients.neon;
  for (let i = 0; i <= width; i++) {
    process.stdout.write('\r' + grad(char.repeat(i)));
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  process.stdout.write('\n');
}

// Get available figlet fonts
function getAvailableFonts() {
  return figlet.fontsSync();
}

// Export functions for use in scripts
module.exports = {
  chalk,
  theme,
  gradients,
  typewriter,
  gradientTypewriter,
  generateAscii,
  gradientAscii,
  gradientBorder,
  gradientBox,
  centerText,
  animatedSeparator,
  getAvailableFonts
};

// CLI usage when run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'test') {
    (async () => {
      console.log(gradientAscii('TEST', 'rainbow'));
      await animatedSeparator(60, '═', 'neon', 20);
      await typewriter('This is a typewriter effect!', 100, 'cyan');
      console.log(gradientBox('This is a gradient box!', { 
        gradientName: 'ocean',
        title: 'Example Box'
      }));
    })();
  } else if (args[0] === 'fonts') {
    console.log('Available fonts:', getAvailableFonts().join(', '));
  } else {
    console.log('Usage: node utils.js [test|fonts]');
  }
}