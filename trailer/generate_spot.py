#!/usr/bin/env python3
"""Generate the German Jobwasil spot via the Higgsfield API.

Reads HIGGSFIELD_API_KEY from trailer/.env, submits every scene from
spot-de.md, polls until each is done and downloads the MP4 into
trailer/clips/. Finished clips are skipped, so the script is safe to re-run.

  python3 generate_spot.py                 # alle Szenen
  python3 generate_spot.py --scene 4       # nur Szene 4 (z. B. neu würfeln)
  python3 generate_spot.py --list-models   # verfügbare Modelle anzeigen
  python3 generate_spot.py --model <pfad>  # anderes Modell verwenden
"""

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

DIR = Path(__file__).parent
API = "https://api.higgsfield.ai"
DEFAULT_MODEL = "bytedance/seedance-2.5/text-to-video"
MASCOT = DIR.parent / "assets" / "jobwasil" / "jobwasil-magician.png"

NEGATIVE = (
    "text, subtitles, watermark, logo, user interface, app screen, "
    "readable screen content, distorted faces, extra fingers, low quality"
)

SCENES = [
    {
        "name": "01_ausgangslage",
        "seconds": 7,
        "prompt": (
            "Wide cinematic shot of a busy German city street in warm morning light. "
            "A young man in his twenties stands still amid the moving crowd, holding a "
            "phone at his side, looking up at the buildings around him. Shallow depth of "
            "field, people and a tram blurred in motion behind him. Slow dolly-in. "
            "Natural documentary colour grade."
        ),
    },
    {
        "name": "02_huerde",
        "seconds": 7,
        "prompt": (
            "Close-up on the face of a young man of Middle Eastern appearance, lit by the "
            "cool glow of a phone screen held below "
            "frame, the screen itself never visible. His eyes scan, his brow tightens "
            "slightly, he exhales. Dim evening room, soft rim light from a window. "
            "Static shot, very shallow focus, quiet and intimate."
        ),
    },
    {
        "name": "03_app",
        "seconds": 10,
        "prompt": (
            "Over-the-shoulder shot in a warm café: hands hold a smartphone, thumb "
            "tapping. The phone is angled so the screen reads only as a soft warm glow. "
            "Steam rises from a cup, afternoon light through the window, background "
            "softly blurred. Slow orbit around the hands. Premium tech-commercial look."
        ),
    },
    {
        "name": "04_uebersetzung",
        "seconds": 10,
        "prompt": (
            "Abstract motion-graphics scene: elegant Arabic calligraphy strokes float in "
            "dark violet space and gracefully transform into German letterforms, golden "
            "particles trailing the transition. No readable words. Cinematic depth, "
            "volumetric light, slow drifting camera. Premium, magical, restrained."
        ),
    },
    {
        "name": "05_merken",
        "seconds": 10,
        "prompt": (
            "Cinematic portrait of a young woman wearing a hijab sitting by a "
            "rain-flecked window, phone in hand, a small relieved smile spreading across "
            "her face as she reads. The screen is out of frame. Soft grey daylight, warm "
            "skin tones, gentle push-in. Emotional and calm."
        ),
    },
    {
        "name": "06_ergebnis",
        "seconds": 9,
        "prompt": (
            "A young man of Middle Eastern appearance in a clean shirt walks through a "
            "bright modern German office "
            "lobby and shakes hands with a smiling woman in business attire. Morning sun "
            "floods through tall glass walls. Steadicam follow shot, optimistic, crisp "
            "corporate cinematography."
        ),
    },
    {
        "name": "07_abbinder",
        "seconds": 7,
        "image": True,  # mascot as the starting frame, so he stays on model
        "prompt": (
            "The cartoon magician character raises his wand; a burst of golden magic "
            "particles fills the frame and settles into a calm glowing halo around him. "
            "Deep violet background, gentle camera pull-back, warm and celebratory."
        ),
    },
]


def load_key() -> str:
    env = DIR / ".env"
    if env.exists():
        for line in env.read_text().splitlines():
            if line.startswith("HIGGSFIELD_API_KEY="):
                key = line.split("=", 1)[1].strip()
                if key:
                    return key
    sys.exit("HIGGSFIELD_API_KEY fehlt in trailer/.env")


def call(path: str, key: str, payload: dict | None = None) -> dict:
    url = path if path.startswith("http") else f"{API}/{path.lstrip('/')}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={
            "Authorization": f"Key {key}",
            "Content-Type": "application/json",
            # Cloudflare rejects the default Python-urllib agent with 1010.
            "User-Agent": "jobwasil-spot/1.0",
        },
        method="POST" if payload is not None else "GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as res:
            return json.loads(res.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")[:400]
        raise RuntimeError(f"Higgsfield HTTP {e.code}: {body}") from e


def submit(scene: dict, key: str, model: str, ratio: str, resolution: str) -> tuple[str, str]:
    payload = {
        "prompt": scene["prompt"],
        "negative_prompt": NEGATIVE,
        "duration": scene["seconds"],
        "aspect_ratio": ratio,
        "resolution": resolution,
        "generate_audio": False,  # voiceover and music are added in the edit
    }
    if scene.get("image"):
        import base64

        payload["image"] = (
            "data:image/png;base64," + base64.b64encode(MASCOT.read_bytes()).decode()
        )
    data = call(model, key, payload)
    request_id = data.get("request_id") or data["id"]
    # The API hands back its own status host — use it rather than guessing.
    status_url = data.get("status_url") or f"{API}/requests/{request_id}/status"
    return request_id, status_url


def wait(status_url: str, key: str) -> str:
    for _ in range(180):  # up to ~30 min
        data = call(status_url, key)
        status = (data.get("status") or "").lower()
        if status == "completed":
            video = data.get("video") or {}
            return video.get("url") or data["url"]
        if status in {"failed", "nsfw", "canceled"}:
            raise RuntimeError(f"Szene {status}: {data.get('error') or data}")
        time.sleep(10)
    raise RuntimeError("Zeitüberschreitung beim Warten auf den Clip")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--scene", type=int, help="nur diese Szene (1-7)")
    ap.add_argument("--model", default=DEFAULT_MODEL, help="Modellpfad der Higgsfield-API")
    ap.add_argument("--ratio", default="16:9", choices=["16:9", "9:16", "1:1"])
    # 1080p costs roughly twice the credits of 720p for the same clip.
    ap.add_argument("--resolution", default="720p", choices=["480p", "720p", "1080p"])
    ap.add_argument("--list-models", action="store_true")
    args = ap.parse_args()

    key = load_key()

    if args.list_models:
        print(json.dumps(call("/models", key), indent=2, ensure_ascii=False)[:3000])
        return

    clips = DIR / "clips"
    clips.mkdir(exist_ok=True)

    todo = [SCENES[args.scene - 1]] if args.scene else SCENES
    for scene in todo:
        out = clips / f"{scene['name']}.mp4"
        if out.exists():
            print(f"✔ {scene['name']} liegt schon vor — übersprungen")
            continue
        print(f"⏳ {scene['name']} ({scene['seconds']}s, {args.resolution}) wird eingereicht …")
        request_id, status_url = submit(
            scene, key, args.model, args.ratio, args.resolution
        )
        print(f"   Auftrag {request_id} — warte auf Generierung (ca. 2-3 min)")
        url = wait(status_url, key)
        urllib.request.urlretrieve(url, out)
        print(f"✔ {scene['name']} → {out}")

    print("\nFertig. Clips liegen in trailer/clips/")


if __name__ == "__main__":
    main()
