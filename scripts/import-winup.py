#!/usr/bin/env python3
"""Importa los zips de Downloads/Clientes/Winup a public/media (JPEG web + mp4)."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
import tempfile
from collections import defaultdict
from pathlib import Path
from zipfile import ZipFile, ZipInfo

sys.path.insert(0, str(Path(__file__).resolve().parent))
from optimize_media import transcode_video

WINUP = Path("/Users/mateoboitsov/Downloads/Clientes/Winup")
MEDIA = Path("/Users/mateoboitsov/Codigo/pablo climent/public/media")
MANIFEST = Path("/Users/mateoboitsov/Codigo/pablo climent/scripts/winup-manifest.json")

IMAGE_EXT = {".jpg", ".jpeg", ".png", ".heic", ".webp", ".tif", ".tiff"}
VIDEO_EXT = {".mp4", ".mov", ".m4v"}
CORPORATIVAS_GALLERY = 12
COVER_SIZE = "1600x1600>"
GALLERY_SIZE = "1600x1600>"


def fold(s: str) -> str:
    return s.casefold()


def find_zip(prefix: str) -> Path:
    prefix_f = fold(prefix)
    matches = [
        p
        for p in WINUP.glob("*.zip")
        if fold(p.name).startswith(prefix_f)
    ]
    if not matches:
        raise FileNotFoundError(f"No hay zip que empiece por {prefix!r}")
    return sorted(matches)[0]


def is_junk(filename: str) -> bool:
    n = filename.replace("\\", "/").lower()
    base = n.rsplit("/", 1)[-1]
    if "__macosx" in n or base.startswith(".") or base == ".ds_store":
        return True
    if base.endswith(".opdownload") or ".opdownload." in base:
        return True
    if base.endswith((".pdf", ".txt", ".doc", ".docx")):
        return True
    return False


def zip_files(zf: ZipFile) -> list[ZipInfo]:
    out = []
    for info in zf.infolist():
        if info.is_dir() or is_junk(info.filename):
            continue
        out.append(info)
    return out


def ext_of(filename: str) -> str:
    return Path(filename).suffix.lower()


def is_cover_name(filename: str) -> bool:
    return fold(Path(filename).stem) in {"portada", "cover"}


def natural_key(filename: str) -> list:
    name = Path(filename.replace("\\", "/")).name
    return [int(p) if p.isdigit() else fold(p) for p in re.split(r"(\d+)", name)]


def extract_to(zf: ZipFile, info: ZipInfo, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with zf.open(info) as src, dest.open("wb") as out:
        shutil.copyfileobj(src, out)


def magick_jpeg(src: Path, dest: Path, size: str, quality: int) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
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
    ]
    subprocess.run(cmd, check=True, capture_output=True)


def convert_image(zf: ZipFile, info: ZipInfo, dest: Path, size: str, quality: int) -> None:
    suffix = ext_of(info.filename) or ".bin"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        extract_to(zf, info, tmp_path)
        magick_jpeg(tmp_path, dest, size, quality)
    finally:
        tmp_path.unlink(missing_ok=True)


def images_of(infos: list[ZipInfo]) -> list[ZipInfo]:
    imgs = [i for i in infos if ext_of(i.filename) in IMAGE_EXT]
    imgs.sort(key=lambda i: (0 if is_cover_name(i.filename) else 1, natural_key(i.filename)))
    return imgs


def videos_of(infos: list[ZipInfo]) -> list[ZipInfo]:
    vids = [i for i in infos if ext_of(i.filename) in VIDEO_EXT]
    vids.sort(key=lambda i: i.file_size)
    return vids


def split_cover_gallery(imgs: list[ZipInfo]) -> tuple[ZipInfo | None, list[ZipInfo]]:
    if not imgs:
        return None, []
    covers = [i for i in imgs if is_cover_name(i.filename)]
    cover = covers[0] if covers else imgs[0]
    gallery = [i for i in imgs if i is not cover]
    return cover, gallery


def pick_corporativas(infos: list[ZipInfo]) -> tuple[ZipInfo | None, list[ZipInfo]]:
    groups: dict[str, list[ZipInfo]] = defaultdict(list)
    for info in infos:
        if ext_of(info.filename) not in IMAGE_EXT:
            continue
        parts = info.filename.replace("\\", "/").split("/")
        client = parts[1] if len(parts) > 1 else "otros"
        if "cañada" in fold(client) or "canada" in fold(client):
            continue
        groups[client].append(info)

    selected: list[ZipInfo] = []
    for client, files in sorted(groups.items(), key=lambda kv: fold(kv[0])):
        files.sort(key=lambda i: i.file_size, reverse=True)
        selected.extend(files[:2])

    selected.sort(key=lambda i: i.file_size, reverse=True)
    if not selected:
        return None, []
    cover = selected[0]
    gallery = [i for i in selected if i is not cover][:CORPORATIVAS_GALLERY]
    return cover, gallery


def import_project(
    zf: ZipFile,
    dest_id: int,
    infos: list[ZipInfo],
    *,
    max_videos: int | None = None,
    corporativas: bool = False,
) -> dict:
    dest = MEDIA / str(dest_id)
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)

    if corporativas:
        cover, gallery = pick_corporativas(infos)
    else:
        cover, gallery = split_cover_gallery(images_of(infos))

    videos = videos_of(infos)
    if max_videos is not None:
        videos = videos[:max_videos]

    image_count = 0
    if cover:
        convert_image(zf, cover, dest / "cover.jpg", COVER_SIZE, 82)
    elif videos:
        # Portada generada del primer frame si no hay still.
        tmp_vid = dest / "_poster_src.mp4"
        extract_to(zf, videos[0], tmp_vid)
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(tmp_vid),
                "-frames:v",
                "1",
                "-q:v",
                "4",
                str(dest / "cover.jpg"),
            ],
            check=True,
            capture_output=True,
        )
        tmp_vid.unlink(missing_ok=True)
    else:
        raise RuntimeError(f"Proyecto {dest_id}: sin imagen ni vídeo")

    for i, info in enumerate(gallery, start=1):
        convert_image(
            zf,
            info,
            dest / f"{i:02d}.jpg",
            GALLERY_SIZE,
            80,
        )
        image_count += 1

    video_count = 0
    for i, info in enumerate(videos, start=1):
        raw = dest / f"video-{i:02d}.src.mp4"
        out = dest / f"video-{i:02d}.mp4"
        extract_to(zf, info, raw)
        transcode_video(raw, out)
        raw.unlink(missing_ok=True)
        video_count += 1

    return {
        "id": dest_id,
        "images": image_count,
        "videos": video_count,
        "cover": bool((dest / "cover.jpg").exists()),
    }


def main() -> None:
    MEDIA.mkdir(parents=True, exist_ok=True)
    jobs = [
        ("BRANDING", 1, None, False),
        ("PROYECTO 30 PALACIO DE LOS DEPORTES", 2, None, False),
        ("PROYECTO ARDE BOGOTA", 3, None, False),
        ("CAÑADA HONDA", 4, None, False),
        ("PROYECTO LA DISQUERA", 5, None, False),
        ("PROYECTO TURISMO DE LA REGION DE MURCIA", 6, None, False),
        ("PROYECTO XWHITE", 7, None, False),
        ("SABEAMURCIA", 8, None, False),
        ("PROYECTO LA LAGUNA", 9, None, False),
        ("bigup", 10, None, False),
        ("HOTEL NELVA", 11, None, False),
        ("ODISEO", 12, None, False),
        ("LICOR43", 13, None, False),
        ("FASRM", 14, None, False),
        ("FORBES", 15, None, False),
        ("FLEXOMED", 16, None, False),
        ("AUDITORIO VICTOR VILLEGAS", 17, None, False),
        ("GUIA SAN JAVIER", 18, None, False),
        ("LAURA RAYOS", 19, None, False),
        ("SABOREAGUILAS", 20, None, False),
        ("SAN JORGE", 21, None, False),
        ("FOTOS CORPORATIVAS DE NEGOCIOS", 22, 0, True),
    ]

    only = {int(a) for a in sys.argv[1:] if a.isdigit()}
    results = []
    for prefix, pid, max_videos, corporativas in jobs:
        if only and pid not in only:
            continue
        zpath = find_zip(prefix)
        print(f"→ {pid:02d}  {zpath.name}", flush=True)
        with ZipFile(zpath) as zf:
            infos = zip_files(zf)
            if max_videos == 0:
                infos = [i for i in infos if ext_of(i.filename) not in VIDEO_EXT]
            result = import_project(
                zf,
                pid,
                infos,
                max_videos=None if max_videos == 0 else max_videos,
                corporativas=corporativas,
            )
        print(
            f"   cover={result['cover']}  fotos={result['images']}  vídeos={result['videos']}",
            flush=True,
        )
        results.append(result)

    MANIFEST.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"\nManifiesto: {MANIFEST}")


if __name__ == "__main__":
    main()
