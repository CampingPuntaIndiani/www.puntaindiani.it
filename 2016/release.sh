#!/bin/bash

echo "[*] Build website"
./make.sh

DEPLOY=../CampingPuntaIndiani.github.io
if [ ! -d $DEPLOY/.git ]; then
    rm -rf $DEPLOY
    echo "[*] Deploy directory does not exists $DEPLOY/.git"
    echo "[*] Setup git & fetch current status"
    git clone git@github.com:CampingPuntaIndiani/CampingPuntaIndiani.github.io.git $DEPLOY
fi

echo "[*] Update data"
find $DEPLOY/*  -maxdepth 0 -not -name '.git' -print0 | xargs -0 rm -rf
cp -r dist/* $DEPLOY

echo "[*] Move to $DEPLOY"
cd $DEPLOY

echo "[*] Add changes"
git add . || exit 1

echo "[*] Commit"
MSG="Update $(date +"%Y-%m-%d %r")"
if [ ! -z "$1" ]; then
    MSG=$1
fi
git commit -am "release" || exit 1

if [ ! -z "$2" ]; then
    echo "[*] Tag"
    git tag $2 || exit 1
fi

echo "[*] Push release" || exit 1
git push -u origin master --force --tags
