import SoftPage from "@/components/SoftPage";

export default function AvisoLegalPage() {
  return (
    <SoftPage name="legal-aviso">
      <main className="soft-page-inner">
        <p className="soft-eyebrow">Legal</p>
        <h1>
          Aviso <span className="mark-lime">legal</span>
        </h1>
        <p className="soft-lead">
          Texto legal pendiente de revisión. Aquí irá la información societaria,
          datos de contacto y condiciones de uso del sitio.
        </p>
      </main>
    </SoftPage>
  );
}
