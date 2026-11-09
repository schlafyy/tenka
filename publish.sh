#!/bin/sh
# Publishes the game to GitHub Pages: creates the public repo schlafyy/tenka, pushes, turns on Pages.
# Later updates: commit, then `git push` (Pages redeploys by itself).
set -e
cd "$(dirname "$0")"
GH="/c/Program Files/GitHub CLI/gh.exe"
BRANCH="$(git branch --show-current)"
"$GH" auth setup-git
"$GH" repo create tenka --public --description "An idle game of the Sengoku period: one house, sixty-eight provinces, 1467 onward." --source . --remote origin --push
"$GH" api -X POST repos/schlafyy/tenka/pages -f "source[branch]=$BRANCH" -f "source[path]=/" --jq '"Pages turned on: " + .html_url'
echo "The site is usually live 1-2 minutes after this."
