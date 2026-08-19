import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Project, ProjectGallery, ProjectVideo } from "@/lib/projects";

type GalleryMeta = {
  slug: string;
  title: string;
};

function mediaDir(id: number) {
  return path.join(process.cwd(), "public", "media", String(id));
}

function numericName(file: string) {
  const match = file.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function readProjectGalleries(projectId: number, dir: string): ProjectGallery[] | undefined {
  const metaPath = path.join(dir, "galleries.json");
  if (!existsSync(metaPath)) return undefined;

  const meta = JSON.parse(readFileSync(metaPath, "utf8")) as GalleryMeta[];
  const galleries = meta
    .map(({ slug, title }) => {
      const subdir = path.join(dir, slug);
      if (!existsSync(subdir)) return null;

      const images = readdirSync(subdir)
        .filter((file) => /^\d+\.jpe?g$/i.test(file))
        .sort((a, b) => numericName(a) - numericName(b))
        .map((file) => `/media/${projectId}/${slug}/${file}`);

      return images.length > 0 ? { title, images } : null;
    })
    .filter((gallery): gallery is ProjectGallery => gallery !== null);

  return galleries.length > 0 ? galleries : undefined;
}

/** Lee public/media/{id} y rellena galería y vídeos con lo que haya en disco. */
export function attachProjectMedia(project: Project): Project {
  const dir = mediaDir(project.id);
  if (!existsSync(dir)) {
    return { ...project, images: [], videos: undefined };
  }

  const galleries = readProjectGalleries(project.id, dir);
  const files = readdirSync(dir, { withFileTypes: true });
  const images = files
    .filter((entry) => entry.isFile() && /^\d+\.jpe?g$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => numericName(a) - numericName(b))
    .map((file) => `/media/${project.id}/${file}`);

  const videos: ProjectVideo[] = files
    .filter((entry) => entry.isFile() && /^video-\d+\.mp4$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => numericName(a) - numericName(b))
    .map((file) => {
      const num = numericName(file);
      const numberedPoster = `${String(num).padStart(2, "0")}.jpg`;
      const posterPath = path.join(dir, numberedPoster);
      const coverPath = path.join(dir, "cover.jpg");

      return {
        src: `/media/${project.id}/${file}`,
        poster: existsSync(posterPath)
          ? `/media/${project.id}/${numberedPoster}`
          : existsSync(coverPath)
            ? `/media/${project.id}/cover.jpg`
            : undefined,
      };
    });

  return {
    ...project,
    cover: `/media/${project.id}/cover.jpg`,
    images: galleries ? galleries.flatMap((gallery) => gallery.images) : images,
    galleries,
    videos: videos.length > 0 ? videos : undefined,
  };
}
