#!/bin/bash

UGENT_USERNAME=trtoye

# Run script
node main.js

# Save calendar contents into variable
ICS_CONTENTS=`cat calendar-${UGENT_USERNAME}.ics`

# Remove existing calendar file on this branch
rm calendar-${UGENT_USERNAME}.ics

# Stash changed files
git stash

# Switch to gh-pages branch
git checkout gh-pages

# Update calendar
echo $ICS_CONTENTS > calendar-${UGENT_USERNAME}.ics

# Add file
git add calendar-${UGENT_USERNAME}.ics

# Commit
git commit -m "Update calendar for $UGENT_USERNAME"

# Push
git push orgin gh-pages

# Back to master
git checkout master

# Get stash back
git stash apply

