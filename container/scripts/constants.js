#!/usr/bin/env node

// Terminal Effects Constants
// Single place to control all animation speeds and delays

const DELAYS = {
  // Typewriter effect delays (milliseconds)
  TYPEWRITER: 1,           // Normal typewriter text delay
  TYPEWRITER_FAST: 1,      // Fast typewriter for less important text
  TYPEWRITER_SLOW: 3,      // Slow typewriter for emphasis
  
  // Animation delays
  ANIMATED_SEPARATOR: 1,   // Animated separator drawing delay
  ASCII_TYPEWRITER: 2,     // Horizontal ASCII typewriter delay
  
  // Pause delays between sections
  SECTION_PAUSE: 50,       // Brief pause between major sections
  LINE_PAUSE: 10,          // Pause between lines in lists
};

// ASCII Animation Settings
const ASCII_SETTINGS = {
  HORIZONTAL_REVEAL: true,  // Enable horizontal typewriter for ASCII
  REVEAL_SPEED: 2,         // Speed of horizontal ASCII reveal (ms per character)
  MAX_WIDTH: 120,          // Maximum width for ASCII art
};

module.exports = {
  DELAYS,
  ASCII_SETTINGS
};