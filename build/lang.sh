#!/bin/bash

I18N=${2:-"../i18n"}
PAGES=${3:-"../pages"}

BASEDIR=$(dirname "$0")

case $1 in
    "-r")
        echo "Resetting"
        rm -rf "$I18N"
        $0 -i
        ;;
    "-i")
        echo "Initializing"
        mkdir -p "$I18N"
        pybabel extract -o "$I18N"/dict.pot "$PAGES" -F "$BASEDIR"/babel.cfg
        pybabel init -i "$I18N"/dict.pot -D website -d "$I18N" -l en
        pybabel init -i "$I18N"/dict.pot -D website -d "$I18N" -l it
        pybabel init -i "$I18N"/dict.pot -D website -d "$I18N" -l nl
        pybabel init -i "$I18N"/dict.pot -D website -d "$I18N" -l de
        ;;
    "-u")
        echo "Updating"
        pybabel extract -o "$I18N"/dict.pot "$PAGES" -F "$BASEDIR"/babel.cfg
        pybabel update -i "$I18N"/dict.pot -D website -d "$I18N" -l en
        pybabel update -i "$I18N"/dict.pot -D website -d "$I18N" -l it
        pybabel update -i "$I18N"/dict.pot -D website -d "$I18N" -l nl
        pybabel update -i "$I18N"/dict.pot -D website -d "$I18N" -l de
        ;;
    "-c")
        echo "Compiling"
        pybabel compile -D website -d "$I18N" -l en -f
        pybabel compile -D website -d "$I18N" -l it -f
        pybabel compile -D website -d "$I18N" -l nl -f
        pybabel compile -D website -d "$I18N" -l de -f
        ;;
    *)
        echo "Usage:"
        echo "-r reset"
        echo "-i initialize"
        echo "-u update"
        echo "-c compile"
        ;;
esac
