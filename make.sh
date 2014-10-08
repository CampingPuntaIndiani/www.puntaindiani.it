#!/bin/bash

# Create virtualenv
if [ ! -d ".venv" ];then
    virtualenv .venv
    . .venv/bin/activate
    pip install -r requirements.txt
fi

# Reset environment
rm -rf dist
mkdir -p dist

# Static file
cp -r static dist/static
./script/compress.sh

# Gallery
function gallery {
    if [ -f "Gallery/original.md5" ]; then
        old_hash=`head -n1 Gallery/original.md5`
        curr_hash=`find Gallery/original -type f -name "*" -exec md5sum {} + | awk '{print $1}' | sort | md5sum | awk -s" " '{print $1}'`
        if [ "$old_hash" == "$curr_hash" ]; then
            cp -r Galllery/gallery dist/static/img/gallery
            return
        fi
    fi

    python Gallery/build.py
    find Gallery/original -type f -name "*" -exec md5sum {} + | awk '{print $1}' | sort | md5sum | awk -s" " '{print $1}' > Gallery/original.md5
    cp Gallery/out.html template/album.tpl.html
    cp -r Galllery/gallery dist/static/img/gallery
}
gallery()

# Internalization
./lang.sh -c

# Generate Pages
python generator.py


