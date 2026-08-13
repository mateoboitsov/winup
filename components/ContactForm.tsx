"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import TransitionLink from "@/components/TransitionLink";

const SUBJECTS = [
  "Proyecto nuevo",
  "Prácticas",
  "Otro",
] as const;

type Props = {
  defaultSubject?: (typeof SUBJECTS)[number];
};

export default function ContactForm({ defaultSubject = "Proyecto nuevo" }: Props) {
  const [accepted, setAccepted] = useState(false);

  return (
    <form className="service-next-form" onSubmit={(e) => e.preventDefault()}>
      <fieldset className="service-next-field service-next-subjects">
        <legend>Asunto</legend>
        <div className="service-next-subject-list" role="radiogroup" aria-label="Asunto">
          {SUBJECTS.map((subject) => (
            <label key={subject} className="service-next-subject-option">
              <input
                type="radio"
                name="subject"
                value={subject}
                defaultChecked={subject === defaultSubject}
                required
              />
              <span>{subject}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="service-next-field">
        <span>Nombre</span>
        <input type="text" name="name" placeholder="Tu nombre" autoComplete="name" required />
      </label>
      <label className="service-next-field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          placeholder="tu@email.com"
          autoComplete="email"
          required
        />
      </label>
      <label className="service-next-field">
        <span>Teléfono</span>
        <input
          type="tel"
          name="phone"
          placeholder="+34 600 000 000"
          autoComplete="tel"
        />
      </label>
      <label className="service-next-field">
        <span>Mensaje</span>
        <textarea
          name="message"
          rows={4}
          placeholder="¿Qué necesitas? Brief corto vale."
          required
        />
      </label>
      <label className="service-next-consent">
        <input
          type="checkbox"
          name="consent"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          required
        />
        <span className="service-next-consent-box" aria-hidden>
          {accepted ? <Check size={12} strokeWidth={3} /> : null}
        </span>
        <span>
          Acepto que mis datos se recojan y almacenen.{" "}
          <TransitionLink href="/legal/privacidad">Ver privacidad</TransitionLink>
        </span>
      </label>
      <button type="submit" className="service-next-submit">
        Enviar
      </button>
    </form>
  );
}
