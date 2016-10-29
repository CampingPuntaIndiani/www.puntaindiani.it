#!/bin/bash

if [[ -z "$1" ]]; then
    echo "Usage: ./SafeHtml.sh my_file.html"
    exit 1
fi

sed -i.bak 's/Ä/\&#196\;/g' $1
sed -i.bak 's/ä/\&#228\;/g' $1
sed -i.bak 's/É/\&#201\;/g' $1
sed -i.bak 's/é/\&#233\;/g' $1
sed -i.bak 's/Ö/\&#214\;/g' $1
sed -i.bak 's/ö/\&#246\;/g' $1
sed -i.bak 's/Ü/\&#220\;/g' $1
sed -i.bak 's/ü/\&#252\;/g' $1
sed -i.bak 's/ß/\&#223\;/g' $1
sed -i.bak 's/«/\&#171\;/g' $1
sed -i.bak 's/»/\&#187\;/g' $1
sed -i.bak 's/„/\&#132\;/g' $1
sed -i.bak 's/“/\&#147\;/g' $1
sed -i.bak 's/”/\&#148\;/g' $1
sed -i.bak 's/°/\&#176\;/g' $1
sed -i.bak 's/€/\&euro\;/g' $1
sed -i.bak 's/£/\&pound\;/g' $1
rm $1.bak
