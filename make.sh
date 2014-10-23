#!/bin/bash

# Create virtualenv
if [ ! -d ".venv" ];then
    virtualenv .venv
    . .venv/bin/activate
    pip install -r requirements.txt
else
    . .venv/bin/activate
fi


# Reset environment
echo "[+] Clean dist"
rm -rf dist
mkdir -p dist

# copy index
echo "[+] Copy index"
cp templates/index.html dist/index.html

# Static file
echo "[+] Copy static"
cp -r static dist/static

# Compress static
echo "[+] Compile static"
java -jar tool/yuicompressor-2.4.8.jar --charset utf-8 --type css dist/static/css/CampingPuntaIndiani.css -o dist/static/css/CampingPuntaIndiani.min.css
rm dist/static/css/CampingPuntaIndiani.css
java -jar tool/yuicompressor-2.4.8.jar  --charset utf-8 --type js dist/static/js/CampingPuntaIndiani.js -o dist/static/js/CampingPuntaIndiani.min.js
rm dist/static/js/CampingPuntaIndiani.js

# Gallery
function gallery {
    function generate {
        echo "[+] Generate Gallery"
        cd ./Gallery && python build.py && cd ..
        find Gallery/original -type f -name "*" -exec md5sum {} + | awk '{print $1}' | sort | md5sum | awk -s" " '{print $1}' > Gallery/original.md5
    }

    echo "[+] Check Gallery"
    if [ ! -f "Gallery/original.md5" ]; then
        rm -rf Gallery/gallery
        generate
    else
        old_hash=`head -n1 Gallery/original.md5`
        curr_hash=`find Gallery/original -type f -name "*" -exec md5sum {} + | awk '{print $1}' | sort | md5sum | awk -s" " '{print $1}'`
        if [ "$old_hash" != "$curr_hash" ]; then
            rm -rf Gallery/gallery
            generate
        fi
        echo "[+] Keeping old Gallery"
    fi

    cp Gallery/out.html templates/album.tpl.html
    cp -r Gallery/gallery dist/static/img/gallery
}
gallery

# Internalization
echo "[+] Compile lang"
./lang.sh -c

# Generate Pages
echo "[+] Compile templates"
python generator.py
