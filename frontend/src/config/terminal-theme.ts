// Gruvbox Dark terminal theme - exact colors from ghostty/iTerm2-Color-Schemes
// Matches your ghostty GruvboxDark theme exactly

export const terminalTheme = {
  // Background and foreground - exact GruvboxDark colors
  background: '#282828',  // GruvboxDark background
  foreground: '#ebdbb2',  // GruvboxDark foreground
  cursor: '#ebdbb2',      // Foreground color for cursor
  cursorAccent: '#282828', // Background for cursor accent
  selection: '#504945',   // GruvboxDark color 0 for selection
  selectionForeground: '#ebdbb2',
  
  // ANSI colors 0-7 (normal colors) - exact GruvboxDark palette
  black: '#282828',       // Color 0 - Background
  red: '#cc241d',         // Color 1 - Red
  green: '#98971a',       // Color 2 - Green
  yellow: '#d79921',      // Color 3 - Yellow
  blue: '#458588',        // Color 4 - Blue
  magenta: '#b16286',     // Color 5 - Magenta
  cyan: '#689d6a',        // Color 6 - Cyan
  white: '#a89984',       // Color 7 - Light Gray
  
  // ANSI colors 8-15 (bright colors) - exact GruvboxDark palette
  brightBlack: '#928374', // Color 8 - Dark Gray
  brightRed: '#fb4934',   // Color 9 - Bright Red
  brightGreen: '#b8bb26', // Color 10 - Bright Green
  brightYellow: '#fabd2f', // Color 11 - Bright Yellow
  brightBlue: '#83a598',  // Color 12 - Bright Blue
  brightMagenta: '#d3869b', // Color 13 - Bright Magenta
  brightCyan: '#8ec07c',  // Color 14 - Bright Cyan
  brightWhite: '#ebdbb2', // Color 15 - Bright White (same as foreground)
};

export const terminalConfig = {
  // Font settings matching your ghostty config
  fontFamily: 'JetBrains Mono, "JetBrainsMono Nerd Font Mono", "Fira Code", "Monaco", "Consolas", monospace',
  fontSize: 12, // Reduced font size for better screen utilization
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