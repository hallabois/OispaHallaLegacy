for f in ./theme-*/*.png; do
        cwebp -q 100 "$f" -o "${f%.png}.webp"
done
rm -rf ./theme-*/*.png
