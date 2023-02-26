#!/bin/awk -f
#
# + Produce a JS file from a JSON
# + 5 digits of latitude is 1852*60*0.00001 = 1.1m : enough
# + the JSON fil is an output of gpsbabel (from GPX/KML), with a regular pattern


BEGIN {
  printf "const geo%s =\n", var
}

/^}$/ {    # Last line
  printf "};\n"
  next
}

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

{
  print $0
}
