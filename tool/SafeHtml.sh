#!/bin/bash

sed -i.bak s/Ä/&#196;/g $1
sed -e.bak s/ä/&#228;/g $1
sed -e.bak s/É/&#201;/g $1
sed -e.bak s/é/&#233;/g $1
sed -e.bak s/Ö/&#214;/g $1
sed -e.bak s/ö/&#246;/g $1
sed -e.bak s/Ü/&#220;/g $1
sed -e.bak s/ü/&#252;/g $1
sed -e.bak s/ß/&#223;/g $1
sed -e.bak s/«/&#171;/g $1
sed -e.bak s/»/&#187;/g $1
sed -e.bak s/„/&#132;/g $1
sed -e.bak s/“/&#147;/g $1
sed -e.bak s/”/&#148;/g $1
sed -e.bak s/°/&#176;/g $1
sed -e.bak s/€/&euro;/g $1
sed -e.bak s/£/&pound;/g $1
