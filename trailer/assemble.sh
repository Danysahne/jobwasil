#!/bin/bash
# Baut aus den generierten Clips und dem Sprechertext den fertigen Spot.
# Aufruf:  ./assemble.sh [stimme]      Standard: de-DE-FlorianMultilingualNeural
set -e
cd "$(dirname "$0")"

VOICE="${1:-de-DE-FlorianMultilingualNeural}"
XF=0.5            # Überblendung zwischen Szenen in Sekunden
RATE="-8%"        # etwas ruhiger als Normaltempo
OUT="jobwasil-spot-de.mp4"

mkdir -p build

# Szene | Clip | Sprechertext
SCENES=(
  "01_ausgangslage|In Deutschland sind über eine Million Stellen ausgeschrieben."
  "02_huerde|Aber wer noch kein Deutsch spricht, kommt an sie nicht heran."
  "03_app|Jobwasil öffnet diese Tür. Die App zeigt die Stellenangebote der Bundesagentur für Arbeit — vollständig auf Arabisch."
  "04_uebersetzung|Man sucht auf Arabisch. Jobwasil übersetzt die Anfrage, findet passende Stellen und überträgt Titel und Beschreibung automatisch."
  "05_merken|Gespeicherte Stellen bleiben auch ohne Internet lesbar. Teilen geht per Fingertipp — bewerben direkt beim Arbeitgeber."
  "06_ergebnis|Aus einer Sprachbarriere wird ein Bewerbungsgespräch."
  "07_abbinder|Jobwasil. Dein Job-Zauberer."
)

present=(); texts=()
for entry in "${SCENES[@]}"; do
  name="${entry%%|*}"; text="${entry#*|}"
  [ -f "clips/$name.mp4" ] && { present+=("$name"); texts+=("$text"); }
done
n=${#present[@]}
[ "$n" -eq 0 ] && { echo "Keine Clips in clips/ gefunden."; exit 1; }
echo "Verarbeite $n Szene(n): ${present[*]}"

# ── Sprecher erzeugen ──────────────────────────────────────────────────────
for i in $(seq 0 $((n-1))); do
  vo="build/vo_${present[$i]}.mp3"
  [ -f "$vo" ] || python3 -m edge_tts --voice "$VOICE" --rate="$RATE" \
      --text "${texts[$i]}" --write-media "$vo" 2>/dev/null
done

# ── Clips vereinheitlichen (720p, H.264, 24 fps, stumm) ────────────────────
for name in "${present[@]}"; do
  norm="build/norm_$name.mp4"
  [ -f "$norm" ] || ffmpeg -v error -y -i "clips/$name.mp4" \
    -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24" \
    -an -c:v libx264 -preset medium -crf 18 "$norm"
done

# ── Video mit Überblendungen aneinanderhängen ──────────────────────────────
inputs=(); for name in "${present[@]}"; do inputs+=(-i "build/norm_$name.mp4"); done

if [ "$n" -eq 1 ]; then
  filter="[0:v]null[vout]"
  offsets=(0)
else
  filter=""; prev="[0:v]"; acc=0
  offsets=(0)
  for i in $(seq 1 $((n-1))); do
    d=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "build/norm_${present[$((i-1))]}.mp4")
    acc=$(python3 -c "print(round($acc + $d - $XF, 3))")
    offsets+=("$acc")
    label="[v$i]"; [ "$i" -eq $((n-1)) ] && label="[vout]"
    filter="$filter$prev[$i:v]xfade=transition=fade:duration=$XF:offset=$(python3 -c "print(round($acc,3))")$label;"
    prev="$label"
  done
  filter="${filter%;}"
fi

# ── Sprecher an den Szenenanfang legen ─────────────────────────────────────
for i in $(seq 0 $((n-1))); do inputs+=(-i "build/vo_${present[$i]}.mp3"); done
afilter=""; amix=""
for i in $(seq 0 $((n-1))); do
  idx=$((n+i))
  start=$(python3 -c "print(int((${offsets[$i]} + 0.35)*1000))")
  afilter="$afilter[$idx:a]adelay=$start|$start,volume=1.0[a$i];"
  amix="$amix[a$i]"
done
afilter="$afilter${amix}amix=inputs=$n:normalize=0[aout]"

ffmpeg -v error -y "${inputs[@]}" \
  -filter_complex "$filter;$afilter" \
  -map "[vout]" -map "[aout]" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -movflags +faststart "$OUT"

dur=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT")
echo "✔ Fertig: $OUT  (${dur}s, Stimme: $VOICE)"
