#!/bin/bash

echo "[*] Build website"
./make.sh

DEPLOY=../CampingPuntaIndiani.github.io
if [ ! -d $DEPLOY]; then
    echo "[*] Deploy directory does not exists"
    echo "[*] Setup git & fetch current status"
    git clone git@github.com:CampingPuntaIndiani/CampingPuntaIndiani.github.io.git $DEPLOY
fi

echo "[*] Update data"
find $DEPLOY  -maxdepth 1 -not -name '.git' -print0 | xargs -0 rm -rf
cp -r dist $DEPLOY

echo "[*] Add changes"
git add .

echo "[*] Commit"
MSG="Update $(date +"%Y-%m-%d %r")"
if [ ! -z "$1" ]; then
    MSG=$1
fi
git commit -am "release"

if [ ! -z "$2" ]; then
    echo "[*] Tag"
    git tag $2
fi

echo "[*] Push release"
git push -u origin master --force --tags
