#!/bin/bash

USERNAME=trtoye

# Run script
node main.js

# Stash calendar
git stash calendar-${USERNAME}.ics

# Switch to gh-pages branch
git checkout gh-pages

# Pop file back
git stash pop

# Commit
git commit -m "Update calendar $USERNAME"

# Push
git push orgin gh-pages

