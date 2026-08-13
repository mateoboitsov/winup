import { notFound } from "next/navigation";
import SoftPage from "@/components/SoftPage";
import ServiceDetail from "@/components/ServiceDetail";
import { getService, SERVICES } from "@/lib/services";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export default async function ServicioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <SoftPage name={`servicio-${service.slug}`}>
      <ServiceDetail service={service} />
    </SoftPage>
  );
}
