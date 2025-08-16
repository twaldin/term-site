// Terminal theme configuration matching oh-my-posh stelbent-compact.minimal
// Updated to match the prompt colors from oh-my-posh theme

export const terminalTheme = {
  // Background and foreground to complement oh-my-posh prompt
  background: '#100e23',  // Dark background matching prompt foreground
  foreground: '#ffffff',  // White text for good contrast
  cursor: '#91ddff',      // Light blue cursor matching path segment
  cursorAccent: '#100e23',
  selection: '#757575',   // Gray for selection matching secondary text
  selectionForeground: '#ffffff',
  
  // ANSI colors harmonized with oh-my-posh stelbent theme
  black: '#100e23',       // Dark background color
  red: '#ff8080',         // Error color from status segment
  green: '#95ffa4',       // Git clean state color
  yellow: '#ffee58',      // Terraform segment color
  blue: '#91ddff',        // Path segment color
  magenta: '#89d1dc',     // Git ahead color
  cyan: '#7dcfff',        // Keeping complementary cyan
  white: '#ffffff',       // Clean white
  
  // Bright colors with enhanced versions
  brightBlack: '#757575', // Secondary text color
  brightRed: '#ff9248',   // Git modified color
  brightGreen: '#9fe044', // Bright green
  brightYellow: '#faba4a',
  brightBlue: '#8db0ff',
  brightMagenta: '#c7a9ff',
  brightCyan: '#a4daff',
  brightWhite: '#ffffff',
};

export const terminalConfig = {
  // Font settings matching your ghostty config
  fontFamily: 'JetBrains Mono, "JetBrainsMono Nerd Font Mono", "Fira Code", "Monaco", "Consolas", monospace',
  fontSize: 18, // Matching your ghostty font-size
  fontWeight: 'normal' as const,
  fontWeightBold: 'bold' as const,
  lineHeight: 1.2,
  
  // Terminal behavior
  cursorBlink: true,
  cursorStyle: 'block' as const,
  bellStyle: 'none' as const,
  
  // Scrolling
  scrollback: 10000,
  fastScrollModifier: 'alt' as const,
  
  // Other settings
  allowProposedApi: true,
  allowTransparency: false,
  macOptionIsMeta: true,
  
  // Size
  cols: 120,
  rows: 30,
  
  // Theme
  theme: terminalTheme,
};