import { notFound } from "next/navigation";
import { getProject, PROJECTS_DATA } from "@/lib/projects";
import { attachProjectMedia } from "@/lib/projectMedia";
import ProjectDetail from "@/components/ProjectDetail";

export function generateStaticParams() {
  return PROJECTS_DATA.map((p) => ({ id: String(p.id) }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProject(Number(id));
  if (!project) notFound();

  return <ProjectDetail project={attachProjectMedia(project)} />;
}
