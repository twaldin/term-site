#!/bin/bash
source "$(dirname "$0")/shared-functions.sh"
emit_url "about"

echo ""
create_box "About Me" "Hi, I'm Tim. I'm 19 and from San Francisco, CA, and
Currently, I'm a Web Programming and Design student at Purdue University
and am working on tradeupbot.app (check it out!)

In my spare time I like to make side projects, like the one you're reading.

type contact to see my contact info
type projects to see my projects" "$PURPLE" 80
echo ""
