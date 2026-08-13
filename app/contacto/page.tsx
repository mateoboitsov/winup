import SoftPage from "@/components/SoftPage";
import ContactForm from "@/components/ContactForm";
import { ArrowUpRight } from "lucide-react";

export default function ContactoPage() {
  return (
    <SoftPage name="contacto">
      <main className="soft-page-inner contact-page">
        <div className="contact-grid">
          <div className="contact-copy">
            <p className="soft-eyebrow">Contacto</p>
            <h1>
              <span className="mark-lime">Hablemos</span>
            </h1>
            <p className="soft-lead">
              ¿Tienes un proyecto encima de la mesa? Cuéntanoslo. Respondemos
              directo, en menos de 24h.
            </p>
          </div>

          <div className="contact-actions">
            <div className="contact-block">
              <p className="ui-label contact-block-label">Email</p>
              <a
                className="contact-link"
                href="mailto:agenciadigitalwinup@gmail.com"
              >
                agenciadigitalwinup<span>@</span>gmail.com
                <ArrowUpRight
                  size={22}
                  strokeWidth={2}
                  className="accent-arrow"
                  aria-hidden
                />
              </a>
            </div>

            <div className="contact-block">
              <p className="ui-label contact-block-label">Teléfono</p>
              <a className="contact-link" href="tel:+34622200545">
                +34 622 20 05 45
              </a>
            </div>

            <div className="contact-block">
              <p className="ui-label contact-block-label">Redes</p>
              <div className="contact-socials">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noreferrer">
                  TikTok
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-section">
          <div className="contact-form-copy">
            <p className="ui-label" style={{ color: "var(--accent)" }}>
              ¿Empezamos?
            </p>
            <h2 className="service-next-title">
              Cuéntanos tu objetivo y te proponemos un plan.
            </h2>
          </div>
          <ContactForm />
        </div>
      </main>
    </SoftPage>
  );
}
