#!/bin/bash

usage() {
  echo "Usage: $0 [-v] /path/to/xml"
  exit 1
}

verbose=false

while getopts ":v" opt; do
  case $opt in
    v)
      verbose=true
      ;;
    \?)
      usage
      ;;
  esac
done

shift "$((OPTIND-1))"

if [ "$#" -ne 1 ]; then
  usage
fi

xml_path="$1"

if [ ! -f "$xml_path" ]; then
  echo "Error: XML file '$xml_path' does not exist!"
  exit 1
fi

if [ "$verbose" = true ]; then
  node app.js -f "$xml_path" -v true
else
  node app.js -f "$xml_path"
fi
