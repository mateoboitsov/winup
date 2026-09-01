import SoftPage from "@/components/SoftPage";
import TransitionLink from "@/components/TransitionLink";
import { ArrowRight } from "lucide-react";
import { ABOUT_STORY, TEAM } from "@/lib/about";

export default function AboutPage() {
  return (
    <SoftPage name="about">
      <main className="about-page">
        <section className="about-hero">
          <div className="content-width">
            <h1>
              Quiénes <span className="mark-lime">somos</span>
            </h1>
            <p className="soft-lead">
              Somos winup.: un equipo de estrategia, creatividad y ejecución
              digital. Trabajamos cerca de la marca y con una sola obsesión:
              que lo que hacemos se note en el negocio.
            </p>
          </div>
        </section>

        <section
          className="manifesto service-manifesto"
          aria-label={ABOUT_STORY.eyebrow}
        >
          <div className="manifesto-grid">
            <p className="manifesto-label ui-label">{ABOUT_STORY.eyebrow}</p>
            <div className="about-story-copy">
              {ABOUT_STORY.paragraphs.map((p) => (
                <p key={p} className="manifesto-body service-manifesto-body">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="about-team" aria-labelledby="about-team-title">
          <div className="content-width">
            <div className="about-team-intro">
              <h2 id="about-team-title">Las personas detrás</h2>
            </div>

            <ul className="about-team-grid">
              {TEAM.map((member) => (
                <li key={`${member.role}-${member.name}`} className="about-member">
                  {member.photo ? (
                    <img
                      className="about-member-photo"
                      src={member.photo}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div className="about-member-photo is-placeholder" aria-hidden />
                  )}
                  <h3 className="about-member-name">{member.name}</h3>
                  <p className="about-member-role">{member.role}</p>
                  <p className="about-member-bio">{member.bio}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="about-cta" aria-labelledby="about-cta-title">
          <div className="content-width">
            <h2 id="about-cta-title" className="service-next-title">
              ¿Trabajamos juntos en tu próximo reto?
            </h2>
            <div className="soft-cta-row">
              <TransitionLink href="/contacto" className="btn-lime">
                Hablemos
                <ArrowRight size={16} strokeWidth={2.5} />
              </TransitionLink>
              <TransitionLink href="/servicios" className="btn-ghost">
                Ver servicios
              </TransitionLink>
            </div>
          </div>
        </section>
      </main>
    </SoftPage>
  );
}
