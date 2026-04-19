#!/bin/bash
# blog — list and read blog posts from /home/portfolio/blog/posts
#
# Usage:
#   blog              list all posts (newest first)
#   blog <slug>       render post by slug
#   blog latest       render newest post
#   blog --raw <slug> emit raw markdown (pipeable)

source "$(dirname "$0")/shared-functions.sh"

BLOG_DIR="/home/portfolio/blog/posts"
[[ -d "$BLOG_DIR" ]] || BLOG_DIR="$(dirname "$0")/../blog/posts"   # dev fallback

# frontmatter_get <file> <key>  — reads "key: value" from the YAML frontmatter block
frontmatter_get() {
  awk -v k="$2:" 'NR==1 && /^---$/ {inside=1; next}
                  inside && /^---$/ {exit}
                  inside && index($0,k)==1 {sub(/^[^:]+: */,""); print; exit}' "$1"
}

# body_after_frontmatter <file>
body_after_frontmatter() {
  awk 'NR==1 && /^---$/ {inside=1; next}
       inside && /^---$/ {inside=0; next}
       !inside' "$1"
}

# Pretty-render markdown. glow is vastly better than bat for prose; prefer it.
render_markdown() {
  local cols="${COLUMNS:-$(tput cols 2>/dev/null || echo 80)}"
  # Use most of the available terminal width — glow adds ~4 cols of left
  # margin on its own. Cap at 140 so lines stay readable on ultra-wide
  # windows but let 100-140 col terminals use the room they have.
  local width=$(( cols - 4 ))
  (( width < 60 )) && width=60
  (( width > 140 )) && width=140
  if command -v glow >/dev/null 2>&1; then
    # -p opens glow's full-screen pager with arrow-key scroll + q to quit.
    # Feels native in the xterm and survives long posts.
    glow -p -s dark -w "$width" "$1"
  elif command -v mdcat >/dev/null 2>&1; then
    mdcat --columns "$width" "$1" | less -R
  elif command -v bat >/dev/null 2>&1; then
    bat --language=markdown --color=always "$1"
  else
    cat "$1" | less
  fi
}

list_posts() {
  echo ""
  typewriter "${GREEN}blog${RESET}"
  animated_separator "-" 10 "$GREEN"
  echo ""

  shopt -s nullglob
  local posts=("$BLOG_DIR"/*.md)
  shopt -u nullglob

  if (( ${#posts[@]} == 0 )); then
    typewriter "${DIM}no posts yet.${RESET}"
    echo ""
    return
  fi

  # Sort by date (from frontmatter), newest first
  local rows=()
  for f in "${posts[@]}"; do
    local slug date title
    slug="$(basename "$f" .md)"
    date="$(frontmatter_get "$f" date)"
    title="$(frontmatter_get "$f" title)"
    [[ -z "$date" ]] && date="0000-00-00"
    [[ -z "$title" ]] && title="$slug"
    rows+=("${date}|${slug}|${title}")
  done

  printf '%s\n' "${rows[@]}" | sort -r | while IFS='|' read -r d s t; do
    typewriter "  ${GRAY}${d}${RESET}  ${YELLOW}${s}${RESET}  ${WHITE}${t}${RESET}"
  done

  echo ""
  typewriter "${DIM}read a post:  ${CYAN}blog <slug>${RESET}${DIM}  —  read newest:  ${CYAN}blog latest${RESET}"
  echo ""
}

render_post() {
  local slug="$1"
  local file="$BLOG_DIR/${slug}.md"
  if [[ ! -f "$file" ]]; then
    typewriter "${RED}no post with slug '${slug}'${RESET}"
    echo ""
    typewriter "${DIM}list all:  ${CYAN}blog${RESET}"
    return 1
  fi

  local title date
  title="$(frontmatter_get "$file" title)"
  date="$(frontmatter_get "$file" date)"
  [[ -z "$title" ]] && title="$slug"

  # Build a single markdown document with the title/date injected as real
  # markdown headers so glow renders them inside the pager (styled by the
  # theme) instead of us printing them separately above the pager.
  local tmp
  tmp="$(mktemp -t blog-XXXXXX.md)"
  {
    printf '# %s\n' "$title"
    [[ -n "$date" ]] && printf '_%s_\n' "$date"
    printf '\n'
    body_after_frontmatter "$file"
  } > "$tmp"
  render_markdown "$tmp"
  rm -f "$tmp"
}

latest_post() {
  shopt -s nullglob
  local posts=("$BLOG_DIR"/*.md)
  shopt -u nullglob
  if (( ${#posts[@]} == 0 )); then
    typewriter "${DIM}no posts yet.${RESET}"
    return
  fi
  local latest_slug=""
  local latest_date="0000-00-00"
  for f in "${posts[@]}"; do
    local d
    d="$(frontmatter_get "$f" date)"
    [[ -z "$d" ]] && d="0000-00-00"
    if [[ "$d" > "$latest_date" ]]; then
      latest_date="$d"
      latest_slug="$(basename "$f" .md)"
    fi
  done
  render_post "$latest_slug"
}

case "${1:-}" in
  "" | "list")     list_posts ;;
  "latest")        latest_post ;;
  "--raw")         shift; body_after_frontmatter "$BLOG_DIR/${1}.md" ;;
  *)               render_post "$1" ;;
esac
