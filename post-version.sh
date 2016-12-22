#!/usr/bin/env bash

git push origin --tags
git push origin release-main

commit_message=$(git log -1 --format=%B)
git reset --soft HEAD~1
git reset dist/*.js
git commit -m $commit_message
git push origin master -f
