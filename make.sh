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
rm -rf dist
mkdir -p dist

# Static file
cp -r static dist/static

# Compress static
java -jar tool/yuicompressor-2.4.8.jar --charset utf-8 --type css dist/static/css/CampingPuntaIndiani.css -o dist/static/css/CampingPuntaIndiani.min.css
rm dist/static/css/CampingPuntaIndiani.css
java -jar tool/yuicompressor-2.4.8.jar  --charset utf-8 --type js dist/static/js/CampingPuntaIndiani.js -o dist/static/js/CampingPuntaIndiani.min.js
rm dist/static/js/CampingPuntaIndiani.js

# Gallery
function gallery {
    function generate {
        python Gallery/build.py
        find Gallery/original -type f -name "*" -exec md5sum {} + | awk '{print $1}' | sort | md5sum | awk -s" " '{print $1}' > Gallery/original.md5
    }

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
    fi

    cp Gallery/out.html templates/album.tpl.html
    cp -r Gallery/gallery dist/static/img/gallery
}
gallery

# Internalization
./lang.sh -c

# Generate Pages
python generator.py


