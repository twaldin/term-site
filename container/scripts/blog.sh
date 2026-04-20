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

# Pretty-render markdown. Prefer mdcat: emits OSC 8 hyperlinks so xterm.js
# shows clickable link text without a raw URL next to it.
#
# No pager. Content goes straight to stdout so xterm's native scrollback
# handles paging (wheel / j / k / arrows work throughout, not only after
# you've paged to the end of a `less` buffer). After content, we emit
# OSC 9998 — the frontend handler calls xterm.scrollToTop() so the viewport
# always parks at the post title even on long posts.
render_markdown() {
  # Width detection is annoyingly flaky inside a docker-mediated PTY: tput
  # can return a stale value, $COLUMNS can be whatever the env was at spawn,
  # stty reads from fd 0 which may or may not be a tty depending on how the
  # script got invoked. Take the max of everything we can query.
  local cols=0 t
  t="$(tput cols 2>/dev/null)";                       [[ "$t" =~ ^[0-9]+$ ]] && (( t > cols )) && cols=$t
  t="$(stty size 2>/dev/null | awk '{print $2}')";    [[ "$t" =~ ^[0-9]+$ ]] && (( t > cols )) && cols=$t
  [[ "$COLUMNS" =~ ^[0-9]+$ ]]                     && (( COLUMNS > cols )) && cols=$COLUMNS
  # Allow narrow renders for mobile captures (< 60 cols). Only fall back to
  # the default when we truly couldn't determine a width.
  (( cols < 20 )) && cols=100
  local width=$(( cols - 4 ))
  (( width < 20 )) && width=20
  clear
  if command -v mdcat >/dev/null 2>&1; then
    mdcat --columns "$width" "$1"
  elif command -v glow >/dev/null 2>&1; then
    glow -s dark -w "$width" "$1"
  elif command -v bat >/dev/null 2>&1; then
    bat --language=markdown --color=always "$1"
  else
    cat "$1"
  fi
  emit_scroll_top
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

  # OSC 8 hyperlinks so the slug is clickable — xterm.js + WebLinksAddon
  # renders the visible text as a link that navigates to the blog page.
  #
  # We can't route this line through typewriter()'s `echo -e` pass: the OSC 8
  # terminator (ESC \) ends with a literal `\` byte, and when it's immediately
  # followed by ${RESET}="\033[0m" in the string, `echo -e` collapses the two
  # backslashes into one and strips the leading \ off the reset sequence —
  # which then renders as literal "033[0m" text next to the slug.
  # Solution: resolve all escapes up-front with $'...' (so the string holds
  # real ESC/`\` bytes) and write with `echo` (no `-e` reinterpretation).
  local esc_reset=$'\033[0m'
  local esc_dim=$'\033[2m'
  local esc_gray=$'\033[38;2;146;131;116m'
  local esc_yellow=$'\033[38;2;250;189;47m'
  local esc_white=$'\033[38;2;235;219;178m'
  local osc_open=$'\033]8;;'
  local osc_close=$'\033\\'

  local idx=1
  printf '%s\n' "${rows[@]}" | sort -r | while IFS='|' read -r d s t; do
    echo "  ${esc_dim}${idx}${esc_reset}  ${esc_gray}${d}${esc_reset}  ${esc_yellow}${osc_open}https://tim.waldin.net/blog/${s}${osc_close}${s}${osc_open}${osc_close}${esc_reset}  ${esc_white}${t}${esc_reset}"
    idx=$((idx + 1))
  done

  echo ""
  typewriter "${DIM}read:  ${CYAN}blog <N>${RESET}${DIM}  ${CYAN}blog <slug>${RESET}${DIM}  ${CYAN}blog latest${RESET}${DIM}   (fuzzy match: ${CYAN}blog haiku${RESET}${DIM} works too)${RESET}"
  echo ""
}

render_post() {
  local slug="$1"
  local file="$BLOG_DIR/${slug}.md"

  # Numeric shortcut: `blog 1` → newest, `blog 2` → second newest, ...
  if [[ ! -f "$file" ]] && [[ "$slug" =~ ^[0-9]+$ ]]; then
    local idx="$slug"
    local sorted=()
    shopt -s nullglob
    local pf
    for pf in "$BLOG_DIR"/*.md; do
      local s d
      s="$(basename "$pf" .md)"
      d="$(frontmatter_get "$pf" date)"
      [[ -z "$d" ]] && d="0000-00-00"
      sorted+=("${d}|${s}")
    done
    shopt -u nullglob
    # shellcheck disable=SC2207
    sorted=($(printf '%s\n' "${sorted[@]}" | sort -r | cut -d'|' -f2))
    if (( idx >= 1 )) && (( idx <= ${#sorted[@]} )); then
      slug="${sorted[$((idx - 1))]}"
      file="$BLOG_DIR/${slug}.md"
    fi
  fi

  # Fuzzy match: any substring of a slug matches
  if [[ ! -f "$file" ]]; then
    local matches=()
    shopt -s nullglob
    local pf
    for pf in "$BLOG_DIR"/*.md; do
      local s
      s="$(basename "$pf" .md)"
      # case-insensitive substring match
      if [[ "${s,,}" == *"${slug,,}"* ]]; then
        matches+=("$s")
      fi
    done
    shopt -u nullglob
    if (( ${#matches[@]} == 1 )); then
      slug="${matches[0]}"
      file="$BLOG_DIR/${slug}.md"
    elif (( ${#matches[@]} > 1 )); then
      typewriter "${YELLOW}multiple matches for '${slug}':${RESET}"
      local m
      for m in "${matches[@]}"; do
        typewriter "  ${CYAN}${m}${RESET}"
      done
      echo ""
      typewriter "${DIM}be more specific, or use ${CYAN}blog <N>${RESET}"
      return 1
    fi
  fi

  if [[ ! -f "$file" ]]; then
    typewriter "${RED}no post matching '${slug}'${RESET}"
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
    # Footer nav so readers always have an obvious way back. Rendered inside
    # the same mdcat pass so styling matches the post body.
    printf '\n\n---\n\n'
    printf '**navigation** — `blog` all posts · `projects` project list · `home` welcome screen · `help` full command list\n'
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
