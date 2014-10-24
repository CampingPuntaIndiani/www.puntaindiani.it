#!/bin/bash

echo "[*] Build website"
./make.sh

echo "[*] Setup deploy dir"
rm -rf ../CampingPuntaIndiani.github.io
cp -r dist ../CampingPuntaIndiani.github.io
cd ../CampingPuntaIndiani.github.io

echo "[*] Setup deploy git env"
git init
git remote add origin git@github.com:CampingPuntaIndiani/CampingPuntaIndiani.github.io.git

echo "[*] Commit & tag"
git add .
git commit -am "release"
if [ ! -z "$1" ]; then
    git tag $1
fi

echo "[*] Push release"
git push -u origin master --force --tags
