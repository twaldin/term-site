// Terminal theme configuration matching ghostty setup
// Based on your ghostty config: tokyonight theme, JetBrainsMono font, 18px

export const terminalTheme = {
  // TokyoNight color palette
  background: '#1a1b26',
  foreground: '#c0caf5',
  cursor: '#c0caf5',
  cursorAccent: '#1a1b26',
  selection: '#283457',
  selectionForeground: '#c0caf5',
  
  // ANSI colors (matching tokyonight_night from your nvim config)
  black: '#15161e',
  red: '#f7768e',
  green: '#9ece6a',
  yellow: '#e0af68',
  blue: '#7aa2f7',
  magenta: '#bb9af7',
  cyan: '#7dcfff',
  white: '#a9b1d6',
  
  // Bright colors
  brightBlack: '#414868',
  brightRed: '#ff899d',
  brightGreen: '#9fe044',
  brightYellow: '#faba4a',
  brightBlue: '#8db0ff',
  brightMagenta: '#c7a9ff',
  brightCyan: '#a4daff',
  brightWhite: '#c0caf5',
};

export const terminalConfig = {
  // Font settings matching your ghostty config
  fontFamily: 'JetBrains Mono, "JetBrainsMono Nerd Font Mono", "Fira Code", "Monaco", "Consolas", monospace',
  fontSize: 18, // Matching your ghostty font-size
  fontWeight: 'normal',
  fontWeightBold: 'bold',
  lineHeight: 1.2,
  
  // Terminal behavior
  cursorBlink: true,
  cursorStyle: 'block',
  bellStyle: 'none',
  
  // Scrolling
  scrollback: 10000,
  fastScrollModifier: 'alt',
  
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