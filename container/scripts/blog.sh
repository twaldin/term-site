#!/bin/bash

# Source shared functions
source "$(dirname "$0")/shared-functions.sh"

# Blog directory structure
BLOG_DIR="/home/portfolio/blog"
POSTS_DIR="$BLOG_DIR/posts"

# Ensure blog directories exist
ensure_blog_dirs() {
    mkdir -p "$POSTS_DIR"
}

# Show blog help with ASCII animation
show_help() {
    clear -x
    animated_separator "═" 139
    ascii_typewriter "blog help" "Univers" "${BOLD}${CYAN}"
    echo ""
    
    typewriter "${BOLD}${WHITE}Available Commands:${RESET}"
    echo ""
    typewriter "${CYAN}blog${RESET}              - List all blog posts"
    typewriter "${CYAN}blog read <id>${RESET}    - Read a specific post (e.g., blog read 001)"
    typewriter "${CYAN}blog search <term>${RESET} - Search posts by content"
    echo ""
    
    typewriter "${BOLD}${WHITE}Examples:${RESET}"
    echo ""
    typewriter "${DIM}blog${RESET}"
    typewriter "${DIM}blog read 001${RESET}"
    typewriter "${DIM}blog read welcome-to-my-blog${RESET}"
    typewriter "${DIM}blog search terminal${RESET}"
    echo ""
    
    animated_separator "═" 139
}

# List all blog posts with animations
list_posts() {
    clear -x
    animated_separator "═" 139
    ascii_typewriter "blog" "Univers" "${BOLD}${CYAN}"
    echo ""
    
    typewriter "${BOLD}${WHITE}📚 Available Blog Posts:${RESET}"
    echo ""
    
    if [ ! -d "$POSTS_DIR" ] || [ -z "$(ls -A "$POSTS_DIR" 2>/dev/null)" ]; then
        typewriter "${DIM}No blog posts found. Check back later!${RESET}"
        echo ""
        animated_separator "═" 139
        return
    fi
    
    # List markdown files sorted by name
    for file in "$POSTS_DIR"/*.md; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            local post_num="${filename:0:3}"
            
            # Extract title from front matter or filename
            local title=$(grep -m1 "^title:" "$file" 2>/dev/null | sed 's/title: *//' | sed 's/^"//' | sed 's/"$//')
            if [ -z "$title" ]; then
                title="${filename%.md}"
            fi
            
            # Extract date
            local date=$(grep -m1 "^date:" "$file" 2>/dev/null | sed 's/date: *//')
            [ -z "$date" ] && date="Unknown date"
            
            # Extract description
            local desc=$(grep -m1 "^description:" "$file" 2>/dev/null | sed 's/description: *//' | sed 's/^"//' | sed 's/"$//')
            [ -z "$desc" ] && desc="No description"
            
            echo -e "${CYAN}  $post_num${RESET} ${BOLD}${WHITE}$title${RESET}"
            echo -e "${DIM}      📅 $date${RESET}"
            echo -e "${WHITE}      $desc${RESET}"
            echo ""
        fi
    done
    
    echo ""
    typewriter "${YELLOW}💡 Usage: ${WHITE}blog read <number> or blog read <filename>${RESET}"
    echo ""
    animated_separator "═" 139
}

# Read a blog post with pager-like interface
read_post() {
    local identifier="$1"
    
    if [ -z "$identifier" ]; then
        typewriter "${RED}❌ Please specify a post to read${RESET}"
        return 1
    fi
    
    local filename=""
    
    # Check if identifier is a number
    if [[ "$identifier" =~ ^[0-9]+$ ]]; then
        local padded_num=$(printf "%03d" "$identifier")
        filename=$(ls "$POSTS_DIR"/${padded_num}-*.md 2>/dev/null | head -1)
        filename=$(basename "$filename" 2>/dev/null)
    else
        # Try as filename
        if [ -f "$POSTS_DIR/$identifier.md" ]; then
            filename="$identifier.md"
        elif [ -f "$POSTS_DIR/$identifier" ]; then
            filename="$identifier"
        fi
    fi
    
    if [ -z "$filename" ] || [ ! -f "$POSTS_DIR/$filename" ]; then
        typewriter "${RED}❌ Post \"$identifier\" not found${RESET}"
        return 1
    fi
    
    clear -x
    
    # Use glow to render the markdown with built-in Tokyo Night theme
    # The -p flag enables pager mode (like less)
    # The -s flag specifies the Tokyo Night style (built-in since v2.0.0)
    # The -w flag sets width
    glow -p -s tokyo-night -w 100 "$POSTS_DIR/$filename"
}

# Search blog posts
search_posts() {
    local query="$1"
    
    if [ -z "$query" ]; then
        typewriter "${RED}❌ Please specify a search term${RESET}"
        return 1
    fi
    
    clear -x
    animated_separator "═" 139
    ascii_typewriter "search" "Univers" "${BOLD}${CYAN}"
    echo ""
    
    typewriter "${BOLD}${WHITE}🔍 Searching for: \"$query\"${RESET}"
    echo ""
    
    local found=0
    
    for file in "$POSTS_DIR"/*.md; do
        if [ -f "$file" ] && grep -qi "$query" "$file"; then
            local filename=$(basename "$file")
            local post_num="${filename:0:3}"
            
            local title=$(grep -m1 "^title:" "$file" 2>/dev/null | sed 's/title: *//' | sed 's/^"//' | sed 's/"$//')
            if [ -z "$title" ]; then
                title="${filename%.md}"
            fi
            
            local date=$(grep -m1 "^date:" "$file" 2>/dev/null | sed 's/date: *//')
            [ -z "$date" ] && date="Unknown date"
            
            echo -e "${CYAN}  $post_num${RESET} ${BOLD}${WHITE}$title${RESET}"
            echo -e "${DIM}      📅 $date${RESET}"
            echo ""
            
            found=1
        fi
    done
    
    if [ $found -eq 0 ]; then
        typewriter "${DIM}No posts found matching \"$query\"${RESET}"
    fi
    
    echo ""
    animated_separator "═" 139
}

# Main blog command handler
main() {
    ensure_blog_dirs
    
    local command="$1"
    shift
    
    case "$command" in
        "read")
            read_post "$1"
            ;;
        "search")
            search_posts "$1"
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        ""|"list")
            list_posts
            ;;
        *)
            echo -e "${RED}Unknown command: $command${RESET}"
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"