#!/usr/bin/env python3
"""Generate the Jobwasil trailer clips via the Kling API.

Reads KLING_API_KEY from trailer/.env, submits all six scenes
(text2video / image2video), polls until done, downloads MP4s to
trailer/clips/. Already-downloaded clips are skipped, so the script
can be re-run safely (e.g. after topping up credits).

Usage:  python3 generate_clips.py [--scene N] [--mode std|pro]
"""

import argparse
import base64
import json
import sys
import time
import urllib.request
from pathlib import Path

DIR = Path(__file__).parent
API = "https://api-singapore.klingai.com"
MODEL = "kling-v2-5-turbo"
MASCOT = DIR.parent / "assets" / "jobwasil" / "jobwasil-magician.png"

NEGATIVE = "text, subtitles, watermark, logo, distorted faces, extra fingers, low quality"

SCENES = [
    {
        "name": "01_logo_intro",
        "type": "image2video",
        "prompt": (
            "The cartoon magician character comes alive: his purple cape gently flows, "
            "golden sparkles and magic stars swirl around him, he raises his wand and a "
            "soft glow builds. Dark indigo background, cinematic light rays, subtle "
            "camera push-in. Playful, magical, premium app trailer style."
        ),
    },
    {
        "name": "02_searching_man",
        "type": "text2video",
        "prompt": (
            "Cinematic vertical shot: a young man in his twenties with Middle Eastern "
            "features stands on a lively German city street at golden hour, looking at "
            "his smartphone with a hopeful smile. Shallow depth of field, warm sunlight, "
            "soft bokeh of trams and pedestrians behind him. Slow dolly-in on his face, "
            "lens flare, filmic color grade."
        ),
    },
    {
        "name": "03_typing_cafe",
        "type": "text2video",
        "prompt": (
            "Close-up over-the-shoulder shot of hands holding a smartphone in a cozy "
            "café, thumb typing on the screen. Warm ambient light, steam from a coffee "
            "cup drifting by, background softly blurred. The phone screen glows softly. "
            "Smooth slow camera orbit, premium tech-ad aesthetic."
        ),
    },
    {
        "name": "04_reading_woman",
        "type": "text2video",
        "prompt": (
            "Cinematic portrait of a young woman wearing a hijab sitting by a window, "
            "reading on her phone and slowly starting to smile with relief and joy. "
            "Soft daylight on her face, rain drops on the window softly out of focus, "
            "gentle push-in camera move, emotional, warm filmic tones."
        ),
    },
    {
        "name": "05_confident_walk",
        "type": "text2video",
        "prompt": (
            "Energetic vertical montage feel: a young man walks confidently through a "
            "modern German office lobby, shakes hands with a smiling manager, morning "
            "light floods through glass walls. Steadicam follow shot, optimistic mood, "
            "crisp corporate-ad cinematography, subtle warm grade."
        ),
    },
    {
        "name": "06_endcard",
        "type": "image2video",
        "prompt": (
            "The cartoon magician character winks and waves his wand, a burst of golden "
            "magic particles fills the frame and settles into a calm glowing halo around "
            "him. Deep violet background brightens slightly, celebratory and warm, "
            "gentle camera pull-back, polished app trailer finale."
        ),
    },
]


def load_key() -> str:
    for line in (DIR / ".env").read_text().splitlines():
        if line.startswith("KLING_API_KEY="):
            return line.split("=", 1)[1].strip()
    sys.exit("KLING_API_KEY fehlt in trailer/.env")


def api(path: str, key: str, payload: dict | None = None) -> dict:
    req = urllib.request.Request(
        f"{API}{path}",
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        method="POST" if payload is not None else "GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            body = json.loads(res.read())
    except urllib.error.HTTPError as e:
        try:
            body = json.loads(e.read())
        except Exception:
            raise RuntimeError(f"Kling API: HTTP {e.code}") from e
    if body.get("code") != 0:
        raise RuntimeError(f"Kling API: {body.get('code')} {body.get('message')}")
    return body["data"]


def submit(scene: dict, key: str, mode: str) -> tuple[str, str]:
    endpoint = f"/v1/videos/{scene['type']}"
    payload = {
        "model_name": MODEL,
        "prompt": scene["prompt"],
        "negative_prompt": NEGATIVE,
        "duration": "5",
        "mode": mode,
    }
    if scene["type"] == "image2video":
        payload["image"] = base64.b64encode(MASCOT.read_bytes()).decode()
    else:
        payload["aspect_ratio"] = "9:16"
    data = api(endpoint, key, payload)
    return data["task_id"], endpoint


def wait(task_id: str, endpoint: str, key: str) -> str:
    for _ in range(120):  # max ~20 min
        data = api(f"{endpoint}/{task_id}", key)
        status = data["task_status"]
        if status == "succeed":
            return data["task_result"]["videos"][0]["url"]
        if status == "failed":
            raise RuntimeError(f"Task fehlgeschlagen: {data.get('task_status_msg')}")
        time.sleep(10)
    raise RuntimeError("Timeout beim Warten auf den Clip")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--scene", type=int, help="nur diese Szene (1-6) generieren")
    ap.add_argument("--mode", default="std", choices=["std", "pro"])
    args = ap.parse_args()

    key = load_key()
    clips = DIR / "clips"
    clips.mkdir(exist_ok=True)

    todo = [SCENES[args.scene - 1]] if args.scene else SCENES
    for scene in todo:
        out = clips / f"{scene['name']}.mp4"
        if out.exists():
            print(f"✔ {scene['name']} existiert schon — übersprungen")
            continue
        print(f"⏳ {scene['name']}: Task wird eingereicht ...")
        task_id, endpoint = submit(scene, key, args.mode)
        print(f"   Task {task_id} — warte auf Generierung (dauert einige Minuten)")
        url = wait(task_id, endpoint, key)
        urllib.request.urlretrieve(url, out)
        print(f"✔ {scene['name']} → {out}")

    print("Fertig. Clips liegen in trailer/clips/")


if __name__ == "__main__":
    main()
