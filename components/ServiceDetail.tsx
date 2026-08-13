"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Plus } from "lucide-react";
import { type Service } from "@/lib/services";
import ContactForm from "@/components/ContactForm";

gsap.registerPlugin(useGSAP);

export default function ServiceDetail({ service }: { service: Service }) {
  const container = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setOpenFaq(null);
  }, [service.slug]);

  useGSAP(
    () => {
      gsap.set(".reveal", { opacity: 0, y: 20 });
      gsap.to(".reveal", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
        delay: 0.15,
      });
    },
    { scope: container, dependencies: [service.slug] }
  );

  return (
    <div ref={container} className="service-detail">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="service-hero">
        <div className="service-hero-bg" aria-hidden />
        <div className="service-hero-gradient" aria-hidden />

        <div className="service-hero-content">
          <div
            className="content-width"
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <p
              className="reveal ui-label"
              style={{ color: "var(--accent)", marginBottom: "0.75rem", textAlign: "center" }}
            >
              Servicios / {service.title}
            </p>
            <h1
              className="reveal project-hero-title service-hero-title"
              style={{
                textAlign: "center",
                fontSize: "clamp(1.9rem, 5vw, 4.2rem)",
              }}
            >
              {service.heroTitle}
            </h1>
            {/* VSL: se reactivará cuando el vídeo esté listo
            <div className="reveal service-vsl-placeholder" aria-label="Video VSL">
              VSL
            </div>
            */}
          </div>
        </div>
      </section>

      {/* ── Manifiesto ───────────────────────────────────────────────── */}
      <section className="manifesto service-manifesto">
        <div className="manifesto-grid">
          <p className="manifesto-label ui-label">{service.label}</p>
          <div>
            <p className="manifesto-body service-manifesto-body">{service.statement}</p>
          </div>
        </div>
      </section>

      {/* ── Casos de éxito ───────────────────────────────────────────── */}
      {service.cases && service.cases.length > 0 && (
        <section className="service-cases">
          <div className="content-width">
            {service.casesTitle && (
              <h2 className="service-cases-title">{service.casesTitle}</h2>
            )}
            <div className="service-cases-grid">
              {service.cases.map((c, i) => (
                <div key={i} className="service-case-card">
                  <div className="service-case-thumb" aria-hidden />
                  <p className="service-case-result">{c.result}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      {service.faqs && service.faqs.length > 0 && (
        <section className="service-faq">
          <div className="content-width">
            <div className="service-faq-grid">
              <p className="service-faq-label ui-label">FAQ</p>
              <div className="service-faq-list">
              {service.faqs.map((faq, i) => (
                <div
                  key={i}
                  className="service-faq-item"
                  data-open={openFaq === i ? "true" : "false"}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="service-faq-question">
                    <span>{faq.q}</span>
                    <Plus className="service-faq-icon" size={20} strokeWidth={2} />
                  </div>
                  <div className="service-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="service-next">
        <div className="service-next-inner">
          <div className="service-next-copy">
            <p className="ui-label" style={{ color: "var(--accent)" }}>¿Empezamos?</p>
            <h2 className="service-next-title">
              {service.ctaTitle ?? "Cuéntanos tu objetivo y te proponemos un plan."}
            </h2>
          </div>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
