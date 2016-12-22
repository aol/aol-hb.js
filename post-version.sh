#!/usr/bin/env bash

commit_message=$(git log -1 --format=%B)
git reset --soft HEAD~1
git reset dist/*.js
git commit -m $commit_message
git push origin --tags
