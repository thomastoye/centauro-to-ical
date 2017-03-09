#!/bin/bash

USERNAME=trtoye

# Run script
node main.js

# Stash calendar
git stash

# Switch to gh-pages branch
git checkout gh-pages

# Pop file back
git stash pop

# Add file
git add calendar-${USERNAME}.ics

# Commit
git commit -m "Update calendar for $USERNAME"

# Push
git push orgin gh-pages

# Back to master
git checkout master

