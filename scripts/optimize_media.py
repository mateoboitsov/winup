#!/usr/bin/env python3
"""Comprime vídeos e imágenes de public/media para web y GitHub (<50MB/archivo)."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / "public" / "media"

MAX_SIDE = 1280
CRF = 27
PRESET = "veryfast"
# Si ya es web-ok, no reencodificar.
SKIP_MAX_MB = 18
SKIP_MAX_SIDE = 1280
SKIP_MAX_MBPS = 3.0

IMAGE_MAX_BYTES = 380_000
IMAGE_SIZE = "1600x1600>"
IMAGE_QUALITY = 75


def probe(path: Path) -> dict:
    r = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-print_format",
            "json",
            "-show_format",
            "-show_streams",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    data = json.loads(r.stdout)
    video = next((s for s in data["streams"] if s.get("codec_type") == "video"), {})
    fmt = data.get("format") or {}
    return {
        "w": int(video.get("width") or 0),
        "h": int(video.get("height") or 0),
        "dur": float(fmt.get("duration") or video.get("duration") or 0),
        "br": int(fmt.get("bit_rate") or 0),
        "size": path.stat().st_size,
    }


def transcode_video(src: Path, dest: Path) -> None:
    """H.264 1280px max, AAC, faststart. Dest puede coincidir con src."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_name(dest.stem + ".tmp.mp4")
    vf = (
        f"scale='min({MAX_SIDE},iw)':'min({MAX_SIDE},ih)':force_original_aspect_ratio=decrease,"
        "scale=trunc(iw/2)*2:trunc(ih/2)*2"
    )
    cmd = [
        "ffmpeg",
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(src),
        "-vf",
        vf,
        "-c:v",
        "libx264",
        "-preset",
        PRESET,
        "-crf",
        str(CRF),
        "-pix_fmt",
        "yuv420p",
        "-map",
        "0:v:0",
        "-map",
        "0:a?",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        "-ac",
        "2",
        "-movflags",
        "+faststart",
        str(tmp),
    ]
    try:
        subprocess.run(cmd, check=True)
        tmp.replace(dest)
    finally:
        tmp.unlink(missing_ok=True)


def needs_video_optimize(path: Path) -> bool:
    info = probe(path)
    mb = info["size"] / 1e6
    mbps = info["br"] / 1e6 if info["br"] else 0
    side = max(info["w"], info["h"])
    if mb > SKIP_MAX_MB:
        return True
    if side > SKIP_MAX_SIDE:
        return True
    if mbps > SKIP_MAX_MBPS:
        return True
    return False


def optimize_jpeg(path: Path) -> bool:
    if path.stat().st_size <= IMAGE_MAX_BYTES:
        return False
    tmp = path.with_suffix(".tmp.jpg")
    subprocess.run(
        [
            "magick",
            str(path),
            "-auto-orient",
            "-resize",
            IMAGE_SIZE,
            "-strip",
            "-sampling-factor",
            "4:2:0",
            "-quality",
            str(IMAGE_QUALITY),
            "-interlace",
            "Plane",
            f"jpeg:{tmp}",
        ],
        check=True,
        capture_output=True,
    )
    if tmp.stat().st_size < path.stat().st_size:
        tmp.replace(path)
        return True
    tmp.unlink(missing_ok=True)
    return False


def main() -> None:
    videos = sorted(MEDIA.rglob("*.mp4"))
    print(f"{len(videos)} vídeos en {MEDIA.relative_to(ROOT)}", flush=True)
    for path in videos:
        rel = path.relative_to(MEDIA)
        before = path.stat().st_size / 1e6
        if not needs_video_optimize(path):
            print(f"  skip  {rel}  {before:.1f}MB", flush=True)
            continue
        info = probe(path)
        print(
            f"  enc   {rel}  {before:.1f}MB  {info['w']}x{info['h']}  {info['dur']:.0f}s …",
            flush=True,
        )
        transcode_video(path, path)
        after = path.stat().st_size / 1e6
        print(f"        → {after:.1f}MB  ({100 * after / before:.0f}%)", flush=True)

    images = sorted(MEDIA.rglob("*.jpg"))
    shrunk = 0
    for path in images:
        before = path.stat().st_size
        if optimize_jpeg(path):
            after = path.stat().st_size
            print(
                f"  jpg   {path.relative_to(MEDIA)}  {before/1024:.0f}KB → {after/1024:.0f}KB",
                flush=True,
            )
            shrunk += 1
    if not shrunk:
        print("  jpg   sin cambios", flush=True)

    total = sum(p.stat().st_size for p in MEDIA.rglob("*") if p.is_file())
    print(f"\nTotal public/media: {total/1e6:.0f}MB")


if __name__ == "__main__":
    main()
