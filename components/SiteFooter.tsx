import TransitionLink from "@/components/TransitionLink";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="content-width site-footer-inner">
        <div className="site-footer-spacer" aria-hidden />
        <div className="site-footer-content">
          <div className="site-footer-cols">
            <div className="site-footer-col">
              <p className="ui-label site-footer-col-label">Explorar</p>
              <nav className="site-footer-list" aria-label="Navegación">
                <TransitionLink href="/">Proyectos</TransitionLink>
                <TransitionLink href="/servicios">Servicios</TransitionLink>
                <TransitionLink href="/about">About</TransitionLink>
                <TransitionLink href="/contacto">Contacto</TransitionLink>
              </nav>
            </div>

            <div className="site-footer-col">
              <p className="ui-label site-footer-col-label">Redes</p>
              <nav className="site-footer-list" aria-label="Redes sociales">
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
              </nav>
            </div>
          </div>

          <div className="site-footer-legal">
            <nav className="site-footer-policies" aria-label="Legal">
              <TransitionLink href="/legal/aviso-legal">Aviso legal</TransitionLink>
              <TransitionLink href="/legal/privacidad">Privacidad</TransitionLink>
              <TransitionLink href="/legal/cookies">Cookies</TransitionLink>
            </nav>
            <p className="site-footer-copy">© {year} winup.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
