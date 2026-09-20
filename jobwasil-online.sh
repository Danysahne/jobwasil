#!/bin/bash
# Macht Jobwasil öffentlich erreichbar: startet den Proxy (inkl. Web-App)
# und einen Cloudflare-Quick-Tunnel. Beenden mit ./jobwasil-offline.sh
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
RUN="$DIR/.tunnel"
mkdir -p "$RUN"

# Mit --build vorher den Web-Build aktualisieren (nach Code-Änderungen nötig)
if [ "$1" = "--build" ]; then
  echo "⏳ Erzeuge Web-Build ..."
  (cd "$DIR" && EXPO_PUBLIC_API_URL=/api npx expo export --platform web >/dev/null 2>&1)
  echo "✔ Web-Build aktualisiert"
fi

# Alte Instanzen beenden
"$DIR/jobwasil-offline.sh" >/dev/null 2>&1 || true

# Proxy starten (liefert auch den Web-Build aus dist/ aus)
cd "$DIR/jobwasil-proxy"
PORT=3001 WEB_BUILD_DIR=../dist nohup node index.js > "$RUN/proxy.log" 2>&1 &
echo $! > "$RUN/proxy.pid"

# Warten bis der Proxy antwortet
UP=""
for i in $(seq 1 20); do
  if curl -s -o /dev/null http://localhost:3001/api/health; then UP=1; break; fi
  sleep 0.5
done
if [ -z "$UP" ]; then
  echo "✘ Proxy startet nicht — letzte Log-Zeilen:"
  tail -5 "$RUN/proxy.log"
  exit 1
fi
echo "✔ Proxy läuft (Port 3001)"

# Cloudflare-Tunnel starten
nohup cloudflared tunnel --url http://localhost:3001 > "$RUN/tunnel.log" 2>&1 &
echo $! > "$RUN/tunnel.pid"

# Auf die öffentliche URL warten und anzeigen
echo "⏳ Warte auf Tunnel-URL ..."
URL=""
for i in $(seq 1 30); do
  URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$RUN/tunnel.log" | head -1)
  [ -n "$URL" ] && break
  sleep 1
done

if [ -n "$URL" ]; then
  echo "$URL" > "$RUN/url.txt"
  echo ""
  echo "════════════════════════════════════════════"
  echo "  Jobwasil ist online: $URL"
  echo "  Zugangscode nicht vergessen!"
  echo "  Beenden mit: ./jobwasil-offline.sh"
  echo "════════════════════════════════════════════"
else
  echo "✘ Keine Tunnel-URL gefunden — siehe $RUN/tunnel.log"
  exit 1
fi
