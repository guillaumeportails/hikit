#!/bin/bash
#
# Le controle de "MIME type" rend complique le melange JSON+JS
#   https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
#   https://caniuse.com/mdn-javascript_statements_import_import_assertions
#   https://marian-caikovski.medium.com/how-to-import-json-into-javascript-module-json-modules-e6721e19a314
# Alors on bricole ici directement du JS

rm -rf tmp
mkdir tmp


# GPX/KML to geoJSON
for ext in gpx kml
do
  for geo in tracks/*.$ext
  do
    b=$(basename $geo .$ext)
    echo "JSONinfy $b"
    gpsbabel -w -r -t -i $ext -f $geo -o geojson -F tmp/$b.json
    awk -f json2js.awk -v var=$b tmp/$b.json > tracks/$b.js
  done
done

/bin/ls -l tracks


