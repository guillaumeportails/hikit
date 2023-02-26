#!/bin/awk -f
#
# + Produce a JS file from a JSON
# + 5 digits of latitude is 1852*60*0.00001 = 1.1m : enough
# + altitude can be ignored
# + the JSON file output of gpsbabel (from GPX/KML) or js-beautify,
#   adheres to a regular pattern


BEGIN {
  printf "const geo%s =\n", var
}

/^}$/ {    # Last line
  printf "};\n"
  next
}

# gps babel output

/^ +-?[0-9]+\.[0-9]+,$/ {
  x = $1 + 0.0
  printf " %.5f,\n", x
  next
}

/^ +-?[0-9]+\.[0-9]+$/ {
  x = $1 + 0.0
  printf " %.5f\n", x
  next
}


# js-beautify output
/^ +\[-?[0-9\.]+, +-?[0-9\.]+, +-?[0-9\.]+\],?$/ {
  lng = substr($1, 2) + 0.0
  lat = $2 + 0.0
  end = (substr($3, length($3), 1) == ",")
  printf "  [ %.5f, %.5f ]%s    // %s\n", lng, lat, (end) ? "," : " ", $0
  next
}


{
  print $0
}
