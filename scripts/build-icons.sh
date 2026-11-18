#!/bin/sh
# Rebuild browser and home-screen icons from the vector brand mark (ImageMagick).
set -eu
cd "$(dirname "$0")/.."

for size in 16 32; do
  magick -background none -density 768 public/favicon.svg -resize "${size}x${size}" "public/favicon-${size}.png"
done
magick -background none -density 768 public/favicon.svg -resize 180x180 public/apple-touch-icon.png
magick -background none -density 768 public/favicon.svg -resize 512x512 public/icon-512.png
magick public/favicon-16.png public/favicon-32.png public/favicon.ico
