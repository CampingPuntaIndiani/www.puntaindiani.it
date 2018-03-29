#!/bin/bash

# require sassc, python, virtualenv

rm -rf dist/

# Create virtualenv
if [ ! -d ".venv" ];then
    virtualenv .venv
    . .venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
else
    . .venv/bin/activate
fi

JSCC='build/closure-compiler-v20161201.jar'

# Reset environment
echo "[+] Clean dist"
rm -rf dist
mkdir -p dist

echo "[+] Copy site map"
cp -vf sitemap.xml dist/sitemap.xml

# Static file
echo "[+] Copy static"
mkdir -p dist/js
cp -r css images fonts pdf index.html dist/
sassc -t compressed -m inline libs/bulma.sass > dist/css/bulma.css
for script in js/*; do
  script=$(basename "$script")
  java -jar $JSCC --charset utf-8 --js "js/$script" --js_output_file "dist/js/$script"
done

# Generate Pages (be sure we can extract strings)
echo "[+] Compile templates"
python build/generator.py || exit 1

# Internalization
echo "[+] Compile lang"
[[ ! -d "i18n" ]] && ./build/lang.sh -i "$(pwd)/i18n" "$(pwd)/pages"
./build/lang.sh -u "$(pwd)/i18n" "$(pwd)/pages"
./build/lang.sh -c "$(pwd)/i18n" "$(pwd)/pages"

# Generate Pages
echo "[+] Compile templates"
python build/generator.py

# Copy CNAME
echo "[+] Copy CNAME config"
cp CNAME dist/CNAME

echo "[+] Completed"
echo "[+] Starting webserver"
cd dist && python -m SimpleHTTPServer
