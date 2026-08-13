import SoftPage from "@/components/SoftPage";
import TransitionLink from "@/components/TransitionLink";
import { ArrowRight } from "lucide-react";
import { ABOUT_STORY, TEAM } from "@/lib/about";

export default function AboutPage() {
  return (
    <SoftPage name="about">
      <main className="soft-page-inner about-page">
        <section className="about-hero">
          <p className="soft-eyebrow">About</p>
          <h1>
            Quiénes <span className="mark-lime">somos</span>
          </h1>
          <p className="soft-lead">
            Somos winup.: un equipo de estrategia, creatividad y ejecución
            digital. Trabajamos cerca de la marca y con una sola obsesión:
            que lo que hacemos se note en el negocio.
          </p>
        </section>

        <section className="about-story" aria-labelledby="about-story-title">
          <p className="ui-label about-section-label">{ABOUT_STORY.eyebrow}</p>
          <div className="about-story-body">
            <h2 id="about-story-title">{ABOUT_STORY.title}</h2>
            {ABOUT_STORY.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>

        <section className="about-team" aria-labelledby="about-team-title">
          <div className="about-team-intro">
            <p className="ui-label about-section-label">El equipo</p>
            <h2 id="about-team-title">
              Las personas detrás de <span className="mark-lime">winup.</span>
            </h2>
            <p className="about-team-lead">
              Roles claros, criterio compartido. Aquí va quién hace qué; los
              nombres se actualizan cuando el equipo esté cerrado.
            </p>
          </div>

          <ul className="about-team-grid">
            {TEAM.map((member) => (
              <li key={`${member.role}-${member.name}`} className="about-member">
                <div className="about-member-photo" aria-hidden />
                <p className="ui-label about-member-role">{member.role}</p>
                <h3 className="about-member-name">{member.name}</h3>
                <p className="about-member-bio">{member.bio}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="soft-cta-row">
          <TransitionLink href="/contacto" className="btn-lime">
            Hablemos
            <ArrowRight size={16} strokeWidth={2.5} />
          </TransitionLink>
          <TransitionLink href="/servicios" className="btn-ghost">
            Ver servicios
          </TransitionLink>
        </div>
      </main>
    </SoftPage>
  );
}
