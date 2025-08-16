#!/bin/bash

# Auto-type "welcome" command after shell starts
# This script sends keystrokes to simulate typing

# Small delay to ensure prompt is ready
sleep 0.5

# Type "welcome" character by character with typewriter effect
for char in w e l c o m e; do
    echo -n "$char"
    sleep 0.05
done

# Press Enter to execute the command
echo ""