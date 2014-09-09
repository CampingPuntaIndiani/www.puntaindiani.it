#!/bin/bash

java -jar yuicompressor-2.4.8.jar -v --charset utf-8 --type css ./dist/static/css/CampingPuntaIndiani.css -o ./dist/static/css/CampingPuntaIndiani.min.css
java -jar yuicompressor-2.4.8.jar -v --charset utf-8 --type js ./dist/static/js/CampingPuntaIndiani.js -o ./dist/static/js/CampingPuntaIndiani.min.js
