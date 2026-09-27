#!/bin/bash
# Schneidet den Café-Dialog-Spot zusammen.
#
# Anders als beim Produktspot bringen die Dialogszenen ihren Ton selbst mit
# (Seedance erzeugt Bild und Sprache gemeinsam, nur so passen die Lippen).
# Deshalb werden sie hart aneinandergesetzt statt überblendet — ein Schnitt
# mitten im Satz klingt sonst nach Fehler. Nur der stumme Abbinder bekommt
# einen eingesprochenen Satz.
set -e
cd "$(dirname "$0")"

VOICE="${1:-de-DE-KatjaNeural}"
OUT="jobwasil-dialog-de.mp4"
CLOSING="Jobwasil. Dein Job-Zauberer."
mkdir -p build

ORDER=(d1_problem d2_empfehlung d3_reaktion d4_abbinder)
present=()
for name in "${ORDER[@]}"; do [ -f "clips/$name.mp4" ] && present+=("$name"); done
n=${#present[@]}
[ "$n" -eq 0 ] && { echo "Keine Dialog-Clips in clips/ gefunden."; exit 1; }
echo "Verarbeite $n Szene(n): ${present[*]}"

VTAG=$(echo "$VOICE" | tr -cd 'A-Za-z0-9')
vo="build/vo_${VTAG}_closing.mp3"
[ -f "$vo" ] || python3 -m edge_tts --voice "$VOICE" --rate=-8% \
    --text "$CLOSING" --write-media "$vo" 2>/dev/null

# Jede Szene auf ein einheitliches Format bringen; stumme Clips bekommen
# eine Stilltonspur, sonst bricht das Aneinanderhängen.
list="build/dialog_list.txt"; : > "$list"
for name in "${present[@]}"; do
  norm="build/dnorm_$name.mp4"
  if [ ! -f "$norm" ]; then
    has_audio=$(ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "clips/$name.mp4" | head -1)
    if [ "$name" = "d4_abbinder" ]; then
      # Abbinder: Bild stumm, dafür der eingesprochene Schlusssatz
      ffmpeg -v error -y -i "clips/$name.mp4" -i "$vo" \
        -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24" \
        -filter_complex "[1:a]adelay=300|300,apad[a]" -map 0:v -map "[a]" -shortest \
        -c:v libx264 -preset medium -crf 18 -c:a aac -ar 48000 -ac 2 "$norm"
    elif [ -n "$has_audio" ]; then
      ffmpeg -v error -y -i "clips/$name.mp4" \
        -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24" \
        -c:v libx264 -preset medium -crf 18 -c:a aac -ar 48000 -ac 2 "$norm"
    else
      ffmpeg -v error -y -i "clips/$name.mp4" -f lavfi -i anullsrc=r=48000:cl=stereo \
        -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24" \
        -shortest -c:v libx264 -preset medium -crf 18 -c:a aac "$norm"
    fi
  fi
  echo "file '$PWD/$norm'" >> "$list"
done

ffmpeg -v error -y -f concat -safe 0 -i "$list" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -movflags +faststart "$OUT"

dur=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT")
echo "✔ Fertig: $OUT  (${dur}s)"
