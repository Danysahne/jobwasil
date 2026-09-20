#!/bin/bash
# Beendet den Cloudflare-Tunnel und den Jobwasil-Proxy.
DIR="$(cd "$(dirname "$0")" && pwd)"
RUN="$DIR/.tunnel"

stopped=0
for name in tunnel proxy; do
  if [ -f "$RUN/$name.pid" ]; then
    PID=$(cat "$RUN/$name.pid")
    if kill "$PID" 2>/dev/null; then
      echo "✔ $name beendet (PID $PID)"
      stopped=1
    fi
    rm -f "$RUN/$name.pid"
  fi
done

# Sicherheitsnetz: alles auf Port 3001 und übrige Quick-Tunnel beenden
lsof -ti :3001 2>/dev/null | xargs kill 2>/dev/null && stopped=1
pkill -f "cloudflared tunnel --url http://localhost:3001" 2>/dev/null && stopped=1

rm -f "$RUN/url.txt"
[ "$stopped" = "1" ] && echo "Jobwasil ist offline." || echo "Es lief nichts."
