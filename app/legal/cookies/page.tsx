import SoftPage from "@/components/SoftPage";

export default function CookiesPage() {
  return (
    <SoftPage name="legal-cookies">
      <main className="soft-page-inner">
        <p className="soft-eyebrow">Legal</p>
        <h1>
          Política de <span className="mark-lime">cookies</span>
        </h1>
        <p className="soft-lead">
          Texto legal pendiente de revisión. Aquí se detallarán las cookies
          usadas, su finalidad y cómo gestionarlas.
        </p>
      </main>
    </SoftPage>
  );
}
