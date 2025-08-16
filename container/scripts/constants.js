#!/usr/bin/env node

// Terminal Effects Constants
// Single place to control all animation speeds and delays

const DELAYS = {
  // Typewriter effect delays (milliseconds) - SUPER FAST but still visible
  TYPEWRITER: 0.1,         // Normal typewriter text delay (0.1ms = extremely fast)
  TYPEWRITER_FAST: 0.05,   // Fast typewriter for less important text
  TYPEWRITER_SLOW: 0.2,    // Slow typewriter for emphasis
  
  // Animation delays - SUPER FAST
  ANIMATED_SEPARATOR: 0.1, // Animated separator drawing delay 
  ASCII_TYPEWRITER: 0.1,   // Horizontal ASCII typewriter delay
  
  // Pause delays between sections - MINIMAL
  SECTION_PAUSE: 0,        // Brief pause between major sections
  LINE_PAUSE: 0,           // Pause between lines in lists
};

// ASCII Animation Settings - OPTIMIZED FOR SPEED
const ASCII_SETTINGS = {
  HORIZONTAL_REVEAL: true,  // Enable horizontal typewriter for ASCII
  REVEAL_SPEED: 0.1,       // Speed of horizontal ASCII reveal (0.1ms per character)
  MAX_WIDTH: 120,          // Maximum width for ASCII art
};

module.exports = {
  DELAYS,
  ASCII_SETTINGS
};