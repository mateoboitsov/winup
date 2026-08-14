import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import type { Project, ProjectVideo } from "@/lib/projects";

function mediaDir(id: number) {
  return path.join(process.cwd(), "public", "media", String(id));
}

function numericName(file: string) {
  const match = file.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

/** Lee public/media/{id} y rellena galería y vídeos con lo que haya en disco. */
export function attachProjectMedia(project: Project): Project {
  const dir = mediaDir(project.id);
  if (!existsSync(dir)) {
    return { ...project, images: [], videos: undefined };
  }

  const files = readdirSync(dir);
  const images = files
    .filter((file) => /^\d+\.jpe?g$/i.test(file))
    .sort((a, b) => numericName(a) - numericName(b))
    .map((file) => `/media/${project.id}/${file}`);

  const videos: ProjectVideo[] = files
    .filter((file) => /^video-\d+\.mp4$/i.test(file))
    .sort((a, b) => numericName(a) - numericName(b))
    .map((file) => ({
      src: `/media/${project.id}/${file}`,
      poster: `/media/${project.id}/cover.jpg`,
    }));

  return {
    ...project,
    cover: `/media/${project.id}/cover.jpg`,
    images,
    videos: videos.length > 0 ? videos : undefined,
  };
}
