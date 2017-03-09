#!/bin/bash

USERNAME=trtoye

# Run script
node main.js

# Stash calendar
git stash

# Switch to gh-pages branch
git checkout gh-pages

# Remove existing calendar file
rm calendar-${USERNAME}.ics

# Pop file back
git stash apply

# Add file
git add calendar-${USERNAME}.ics

# Commit
git commit -m "Update calendar for $USERNAME"

# Push
git push orgin gh-pages

# Back to master
git checkout master

