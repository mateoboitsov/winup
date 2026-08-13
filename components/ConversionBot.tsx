"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Check, MessageCircle, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { WINUP_BOT_GREETING } from "@/lib/winupBotPrompt";

type Role = "user" | "assistant";

type UiMessage = {
  id: string;
  role: Role;
  content: string;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** Tiempo de “está escribiendo…” variable según longitud + jitter humano. */
function typingDelayMs(text: string, index: number) {
  const chars = text.length;
  const base = index === 0 ? 520 : 680;
  const perChar = 28 + Math.random() * 22;
  const thinking = Math.random() < 0.28 ? 450 + Math.random() * 700 : 0;
  const jitter = Math.random() * 420;
  return Math.min(3200, Math.max(600, base + chars * perChar * 0.35 + thinking + jitter));
}

function pauseBetweenBubblesMs() {
  return 320 + Math.random() * 780;
}

export default function ConversionBot() {
  const pathname = usePathname();
  const hidden = pathname === "/";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [fetching, setFetching] = useState(false);
  const [typing, setTyping] = useState(false);
  const [handedOff, setHandedOff] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const playIdRef = useRef(0);
  const greetedRef = useRef(false);
  const pendingHandoffRef = useRef(false);
  const messagesRef = useRef<UiMessage[]>([]);

  messagesRef.current = messages;

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, open, typing, fetching, handedOff]);

  useEffect(() => {
    if (!open || hidden) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(t);
  }, [open, hidden]);

  const stopReveal = () => {
    playIdRef.current += 1;
    pendingHandoffRef.current = false;
    setTyping(false);
  };

  const revealBubbles = async (bubbles: string[]) => {
    const playId = ++playIdRef.current;

    for (let i = 0; i < bubbles.length; i++) {
      if (playId !== playIdRef.current) return;

      setTyping(true);
      await sleep(typingDelayMs(bubbles[i]!, i));
      if (playId !== playIdRef.current) return;

      setTyping(false);
      setMessages((prev) => {
        const next = [
          ...prev,
          {
            id: uid(),
            role: "assistant" as const,
            content: bubbles[i]!,
          },
        ];
        messagesRef.current = next;
        return next;
      });

      if (i < bubbles.length - 1) {
        await sleep(pauseBetweenBubblesMs());
        if (playId !== playIdRef.current) return;
      }
    }

    if (pendingHandoffRef.current && playId === playIdRef.current) {
      pendingHandoffRef.current = false;
      setHandedOff(true);
    }
  };

  useEffect(() => {
    if (!open || hidden || greetedRef.current) return;
    greetedRef.current = true;
    void revealBubbles([...WINUP_BOT_GREETING]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hidden]);

  if (hidden) return null;

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || fetching || handedOff) return;

    // Si el bot estaba tecleando, se interrumpe y responde a lo nuevo
    stopReveal();

    const nextUser: UiMessage = { id: uid(), role: "user", content: trimmed };
    const history = [...messagesRef.current, nextUser];
    messagesRef.current = history;
    setMessages(history);
    setInput("");
    setFetching(true);
    setTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = (await res.json()) as {
        bubbles?: string[];
        reply?: string;
        lead?: { handoff?: boolean };
        savedLeadId?: string | null;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "Error del servidor");
      }

      const bubbles =
        data.bubbles && data.bubbles.length > 0
          ? data.bubbles
          : [data.reply || "puedes repetirme tu nombre y un email o teléfono?"];

      pendingHandoffRef.current = Boolean(data.lead?.handoff || data.savedLeadId);

      setFetching(false);
      await sleep(220 + Math.random() * 480);
      await revealBubbles(bubbles);
    } catch {
      setFetching(false);
      pendingHandoffRef.current = false;
      await revealBubbles([
        "ups, se ha cortado un momento",
        "puedes repetirme tu nombre y un email o teléfono?",
      ]);
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <div className="winup-bot" data-open={open ? "true" : "false"}>
      {open && (
        <section className="winup-bot-panel" aria-label="Chat winup.">
          <header className="winup-bot-header">
            <div>
              <p className="ui-label winup-bot-eyebrow">winup.</p>
              <p className="winup-bot-subtitle">Asistente de conversión</p>
            </div>
            <button
              type="button"
              className="winup-bot-icon-btn"
              aria-label="Cerrar chat"
              onClick={() => setOpen(false)}
            >
              <X size={18} strokeWidth={2} />
            </button>
          </header>

          <div className="winup-bot-messages" ref={listRef} data-lenis-prevent>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`winup-bot-bubble winup-bot-bubble--${m.role}`}
              >
                {m.content}
              </div>
            ))}
            {typing && (
              <div className="winup-bot-bubble winup-bot-bubble--assistant winup-bot-typing">
                <span />
                <span />
                <span />
              </div>
            )}
            {handedOff && (
              <div className="winup-bot-handoff">
                <Check size={14} strokeWidth={2.5} />
                Datos recibidos. El equipo te contactará pronto.
              </div>
            )}
          </div>

          <form className="winup-bot-composer" onSubmit={onSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                handedOff
                  ? "El equipo te contactará pronto"
                  : "Escribe tu mensaje..."
              }
              autoComplete="off"
              disabled={handedOff}
            />
            <button
              type="submit"
              className="winup-bot-send"
              aria-label="Enviar"
              disabled={handedOff || fetching || !input.trim()}
            >
              <Send size={16} strokeWidth={2.5} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="winup-bot-fab"
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <X size={22} strokeWidth={2.25} />
        ) : (
          <MessageCircle size={22} strokeWidth={2.25} />
        )}
      </button>
    </div>
  );
}
