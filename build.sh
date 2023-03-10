#!/bin/bash
#
# Eviter de charger dynamiquement les KML/GPX : les inclure dans un bundle du JavaScript
# D'ailleurs neocities.org, hebergeur, ne supporte pas les .gpx (mais le .kml oui, ?)
# Mais :
# +  On ne peut guere inclure de .json, Le controle de "MIME type" complique le melange
#    JSON+JS
#       https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
#       https://caniuse.com/mdn-javascript_statements_import_import_assertions
#       https://marian-caikovski.medium.com/how-to-import-json-into-javascript-module-json-modules-e6721e19a314
#    Alors on bricole ici directement du JS
# +  GpsBabel perd les styles du KML (il s'occupe de geometrie, pas de presentation)
#       gpsbabel -w -r -t -i $ext -f $geo -o geojson -F tmp/$b.json
#    Par contre il produit une sortie facile a parser avec awk pour reduire le nombre de decimales inutles
#    des KML/GPX d'entree (5 decimales de degres = 1.1m)
#    Donc togeojson est plus indique, et il a une CLI, mais il sort du minify'ed
#       npx @tmcw/togeojson-cli $kml

trap exit ERR

rm -rf tmp
mkdir tmp

# GPX/KML to geoJSON
for ext in gpx kml
do
  for geo in ./tracks/*.$ext
  do
    if [ "$geo" == "./tracks/feed.kml" ]; then continue; fi
    b=$(basename $geo .$ext)
    echo "JSONinfy $b = $geo"
    npx @tmcw/togeojson-cli $geo | npx js-beautify > tmp/$b.json
    awk -f json2js.awk -v var=$b tmp/$b.json > tracks/$b.js
  done
done

/bin/ls -l tracks


