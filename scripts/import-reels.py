#!/usr/bin/env python3
"""Importa vídeos sueltos (p. ej. desde Drive) a public/media/{id}/video-NN.mp4."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from optimize_media import transcode_video

MEDIA = Path(__file__).resolve().parents[1] / "public" / "media"
VIDEO_EXT = {".mp4", ".mov", ".m4v"}


def next_reel_index(dest: Path) -> int:
    existing = sorted(dest.glob("reel-*.mp4"))
    if not existing:
        return 1
    last = existing[-1].stem  # reel-NN
    return int(last.split("-")[1]) + 1


def import_reels(project_id: int, source: Path) -> int:
    dest = MEDIA / str(project_id)
    dest.mkdir(parents=True, exist_ok=True)

    videos = sorted(
        p for p in source.rglob("*") if p.is_file() and p.suffix.lower() in VIDEO_EXT
    )
    if not videos:
        raise RuntimeError(f"Sin vídeos en {source}")

    idx = next_reel_index(dest)
    count = 0
    for src in videos:
        raw = dest / f"reel-{idx:02d}.src.mp4"
        out = dest / f"reel-{idx:02d}.mp4"
        shutil.copy2(src, raw)
        transcode_video(raw, out)
        raw.unlink(missing_ok=True)
        print(f"  → {out.name}  ({src.name})", flush=True)
        idx += 1
        count += 1

    return count


def main() -> None:
    if len(sys.argv) != 3 or not sys.argv[1].isdigit():
        print("Uso: python scripts/import-reels.py <id_proyecto> <carpeta_videos>", file=sys.stderr)
        sys.exit(1)

    project_id = int(sys.argv[1])
    source = Path(sys.argv[2]).expanduser().resolve()
    if not source.is_dir():
        print(f"No existe la carpeta: {source}", file=sys.stderr)
        sys.exit(1)

    print(f"Importando reels → proyecto {project_id:02d}", flush=True)
    count = import_reels(project_id, source)
    print(f"\n{count} vídeo(s) importado(s).", flush=True)


if __name__ == "__main__":
    main()
