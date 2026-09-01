import legalJson from "@/content/legal.json";

export type LegalData = {
  empresa: {
    denominacion: string;
    nif: string;
    domicilio: string;
    email: string;
    telefono: string;
    dominio: string;
    responsable: string;
    registroMercantil: string;
    actividad: string;
    ciudadJurisdiccion: string;
  };
  cookies: {
    fechaActualizacion: string;
    usaAnalitica: boolean;
    usaMarketing: boolean;
    herramientaAnalitica: string;
  };
};

export function getLegalData(): LegalData {
  return legalJson as LegalData;
}
