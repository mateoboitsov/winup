import SoftPage from "@/components/SoftPage";
import TransitionLink from "@/components/TransitionLink";
import { ArrowRight } from "lucide-react";
import { SERVICES, serviceHref } from "@/lib/services";

export default function ServiciosPage() {
  return (
    <SoftPage name="servicios">
      <main className="soft-page-inner">
        <p className="soft-eyebrow">Servicios</p>
        <h1>
          Cómo <span className="mark-lime">trabajamos</span>
        </h1>
        <p className="soft-lead">
          Redes, contenido, eventos, publicidad y web: todo lo que tu marca
          necesita para conectar, crecer y convertir.
        </p>

        <div className="soft-grid">
          {SERVICES.map((service, i) => (
            <TransitionLink
              key={service.slug}
              href={serviceHref(service.slug)}
              className="soft-card soft-card-link"
            >
              <span className="soft-card-index" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2>{service.title}</h2>
                <p>{service.statement}</p>
              </div>
            </TransitionLink>
          ))}
        </div>

        <div className="soft-cta-row">
          <TransitionLink href="/contacto" className="btn-lime">
            Hablemos
            <ArrowRight size={16} strokeWidth={2.5} />
          </TransitionLink>
          <TransitionLink href="/" className="btn-ghost">
            Ver proyectos
          </TransitionLink>
        </div>
      </main>
    </SoftPage>
  );
}
