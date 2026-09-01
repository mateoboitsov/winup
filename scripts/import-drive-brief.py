#!/usr/bin/env python3
"""Importa el brief de docs/drive/ → public/media/{id}."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import importlib.util

_spec = importlib.util.spec_from_file_location(
    "import_reels", Path(__file__).resolve().parent / "import-reels.py"
)
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)  # type: ignore[union-attr]
import_reels = _mod.import_reels

ROOT = Path(__file__).resolve().parents[1]
DRIVE = ROOT / "docs" / "drive"
MEDIA = ROOT / "public" / "media"
GALLERY_SIZE = "1600x1600>"
COVER_SIZE = "1600x1600>"
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp"}


def magick_jpeg(src: Path, dest: Path, size: str, quality: int = 80) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "magick",
            str(src),
            "-auto-orient",
            "-resize",
            size,
            "-strip",
            "-sampling-factor",
            "4:2:0",
            "-quality",
            str(quality),
            "-interlace",
            "Plane",
            f"jpeg:{dest}",
        ],
        check=True,
        capture_output=True,
    )


def unzip_to(zip_path: Path, dest: Path) -> Path:
    dest.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path) as zf:
        zf.extractall(dest)
    return dest


def find_zip(*parts: str) -> Path:
    for p in DRIVE.glob("*.zip"):
        name = p.name.casefold()
        if all(part.casefold() in name for part in parts):
            return p
    raise FileNotFoundError(f"Zip no encontrado: {parts}")


def sorted_images(folder: Path) -> list[Path]:
    imgs = [p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() in IMAGE_EXT]
    return sorted(imgs, key=lambda p: p.name.casefold())


def import_fasrm_photos() -> None:
    dest = MEDIA / "14"
    photo_dir = dest / "fotografia"
    rrss_dir = dest / "fotos-redes-sociales"
    photo_dir.mkdir(parents=True, exist_ok=True)
    rrss_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        nuevas = unzip_to(find_zip("FASRM", "Fotos nuevas"), tmp_path / "nuevas")
        redes = unzip_to(find_zip("FASRM", "redes"), tmp_path / "redes")

        # Fotos existentes en raíz → fotografia/
        idx = 1
        for old in sorted(dest.glob("[0-9][0-9].jpg")):
            target = photo_dir / f"{idx:02d}.jpg"
            if not target.exists():
                shutil.move(str(old), str(target))
            idx += 1

        for src in sorted_images(nuevas):
            magick_jpeg(src, photo_dir / f"{idx:02d}.jpg", GALLERY_SIZE)
            idx += 1

        for i, src in enumerate(sorted_images(redes), start=1):
            magick_jpeg(src, rrss_dir / f"{i:02d}.jpg", GALLERY_SIZE)

    galleries = [
        {"slug": "fotografia", "title": "Fotografía"},
        {"slug": "fotos-redes-sociales", "title": "Fotos redes sociales"},
    ]
    (dest / "galleries.json").write_text(
        json.dumps(galleries, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"FASRM: galerías fotografía ({idx - 1} fotos) + redes sociales", flush=True)


def import_corporativas_cover() -> None:
    dest = MEDIA / "22"
    with tempfile.TemporaryDirectory() as tmp:
        folder = unzip_to(find_zip("Corporativas", "PORTADA"), Path(tmp))
        src = sorted_images(folder)[0]
        magick_jpeg(src, dest / "cover.jpg", COVER_SIZE, quality=82)
    print("Corporativas: cover.jpg actualizado", flush=True)


def import_all_reels() -> None:
    jobs: list[tuple[int, str]] = [
        (9, "la laguna"),
        (10, "Bigup"),
        (14, "FASRM Reel"),
        (2, "30 Palacio"),
        (5, "Disquera"),
    ]
    for project_id, needle in jobs:
        zip_path = find_zip(*needle.split())
        with tempfile.TemporaryDirectory() as tmp:
            folder = unzip_to(zip_path, Path(tmp))
            print(f"\n→ Proyecto {project_id:02d}  ({zip_path.name})", flush=True)
            count = import_reels(project_id, folder)
            print(f"   {count} reel(s)", flush=True)


def main() -> None:
    if not DRIVE.is_dir():
        raise SystemExit(f"No existe {DRIVE}")

    print("Importando brief desde docs/drive/\n", flush=True)
    import_all_reels()
    print(flush=True)
    import_fasrm_photos()
    import_corporativas_cover()
    print("\nListo.", flush=True)


if __name__ == "__main__":
    main()
