#!/bin/bash

UGENT_USERNAME=trtoye

# Run script
node main.js

echo " >> Save calendar contents into variable"
ICS_CONTENTS=`cat calendar-${UGENT_USERNAME}.ics`

echo " >> Remove existing calendar file on this branch"
rm calendar-${UGENT_USERNAME}.ics

echo " >> Stash changed files"
git stash

echo " >> Switch to gh-pages branch"
git checkout gh-pages

echo " >> Update calendar"
echo $ICS_CONTENTS > calendar-${UGENT_USERNAME}.ics

echo " >> Add file"
git add calendar-${UGENT_USERNAME}.ics

echo " >> Commit"
git commit -m "Update calendar for $UGENT_USERNAME"

echo " >> Push"
git push orgin gh-pages

echo " >> Back to master"
git checkout master

echo " >> Get stash back"
git stash apply

