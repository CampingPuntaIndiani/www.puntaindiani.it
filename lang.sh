#!/bin/bash

source ./.venv/bin/activate

case $1 in
    "-r")
        echo "Resetting"
        rm -rf ./i18n
        $0 -i
        ;;
    "-i")
        echo "Initializing"
        mkdir -p ./i18n
        pybabel extract -o ./i18n/dict.pot ./templates -F babel.cfg
        pybabel init -i ./i18n/dict.pot -D website -d ./i18n -l en
        pybabel init -i ./i18n/dict.pot -D website -d ./i18n -l it
        pybabel init -i ./i18n/dict.pot -D website -d ./i18n -l nl
        pybabel init -i ./i18n/dict.pot -D website -d ./i18n -l de
        ;;
    "-u")
        echo "Updating"
        pybabel extract -o ./i18n/dict.pot ./templates -F babel.cfg
        pybabel update -i ./i18n/dict.pot -D website -d ./i18n -l en
        pybabel update -i ./i18n/dict.pot -D website -d ./i18n -l it
        pybabel update -i ./i18n/dict.pot -D website -d ./i18n -l nl
        pybabel update -i ./i18n/dict.pot -D website -d ./i18n -l de
        ;;
    "-c")
        echo "compiling"
        pybabel compile -D website -d ./i18n -l en -f
        pybabel compile -D website -d ./i18n -l it -f
        pybabel compile -D website -d ./i18n -l nl -f
        pybabel compile -D website -d ./i18n -l de -f
        ;;
    *)
        echo "Usage:"
        echo "-r reset"
        echo "-i initialize"
        echo "-u update"
        echo "-c compile"
        ;;
esac


