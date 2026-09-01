import Link from "next/link";
import SoftPage from "@/components/SoftPage";
import { getLegalData } from "@/lib/legal";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function LegalShell({ title, children }: Props) {
  return (
    <SoftPage name="legal">
      <main className="soft-page-inner legal-content">
        <p className="soft-eyebrow">Legal</p>
        <h1>{title}</h1>
        <div className="legal-body">{children}</div>
      </main>
    </SoftPage>
  );
}

export function LegalParagraph({ children }: { children: React.ReactNode }) {
  return <p className="soft-lead legal-paragraph">{children}</p>;
}

type LegalLinkProps = {
  href: string;
  children: React.ReactNode;
  external?: boolean;
};

export function LegalLink({ href, children, external }: LegalLinkProps) {
  const isHttp = href.startsWith("http");
  const isMailto = href.startsWith("mailto:");
  const isExternal = external ?? (isHttp || isMailto);

  if (isExternal) {
    return (
      <a
        href={href}
        className="legal-inline-link"
        {...(isHttp ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className="legal-inline-link">
      {children}
    </Link>
  );
}

export function LegalSummary({ children }: { children: React.ReactNode }) {
  return <aside className="legal-summary">{children}</aside>;
}

export function LegalNote({ children }: { children: React.ReactNode }) {
  return <p className="legal-note">{children}</p>;
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="legal-section">
      <h2>{heading}</h2>
      {children}
    </section>
  );
}

export function AvisoLegalContent() {
  const { empresa } = getLegalData();
  const contactoExtra = empresa.telefono ? ` o en el teléfono ${empresa.telefono}` : "";

  return (
    <>
      <LegalParagraph>
        En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la
        Información y de Comercio Electrónico (LSSI-CE), y del Real Decreto-ley 13/2012, de 30 de
        marzo, se facilita a los usuarios la información general del titular de este sitio web y las
        condiciones de uso del mismo.
      </LegalParagraph>

      <LegalSection heading="Datos identificativos del titular">
        <ul>
          <li>
            <strong>Denominación social / titular:</strong> {empresa.denominacion}
          </li>
          <li>
            <strong>NIF/CIF:</strong> {empresa.nif}
          </li>
          <li>
            <strong>Domicilio social:</strong> {empresa.domicilio}
          </li>
          {empresa.registroMercantil ? (
            <li>
              <strong>Datos registrales:</strong> {empresa.registroMercantil}
            </li>
          ) : null}
          <li>
            <strong>Actividad:</strong> {empresa.actividad}
          </li>
          <li>
            <strong>Correo electrónico:</strong> {empresa.email}
          </li>
          {empresa.telefono ? (
            <li>
              <strong>Teléfono:</strong> {empresa.telefono}
            </li>
          ) : null}
          <li>
            <strong>Persona de contacto / administrador:</strong> {empresa.responsable}
          </li>
          <li>
            <strong>Sitio web:</strong> {empresa.dominio}
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Objeto y ámbito de aplicación">
        <p>
          El presente aviso legal regula el acceso, la navegación y el uso del sitio web{" "}
          {empresa.dominio} (en adelante, el «Sitio»), titularidad de {empresa.denominacion} (en
          adelante, el «Titular»).
        </p>
        <p>
          El acceso al Sitio atribuye la condición de usuario (en adelante, el «Usuario») e implica
          la aceptación plena y sin reservas de las condiciones publicadas en esta página. Si no está
          de acuerdo con ellas, debe abstenerse de utilizar el Sitio.
        </p>
        <p>
          El Titular ofrece a través del Sitio información sobre sus servicios de marketing digital,
          comunicación, publicidad, producción de contenido y diseño web, así como formularios de
          contacto y un asistente conversacional para consultas comerciales.
        </p>
      </LegalSection>

      <LegalSection heading="Condiciones de acceso y uso">
        <p>
          El Usuario se compromete a utilizar el Sitio, sus contenidos y servicios de conformidad con
          la ley, la moral, el orden público y el presente aviso legal, absteniéndose de:
        </p>
        <ul>
          <li>
            Introducir o difundir contenidos ilícitos, violentos, discriminatorios o que vulneren
            derechos de terceros.
          </li>
          <li>
            Provocar daños en los sistemas físicos o lógicos del Titular, de sus proveedores o de
            terceros usuarios.
          </li>
          <li>
            Intentar acceder, utilizar o manipular los datos del Titular, de terceros proveedores o
            de otros usuarios sin autorización.
          </li>
          <li>
            Reproducir, copiar, distribuir o transformar los contenidos del Sitio sin autorización del
            Titular o de sus legítimos titulares.
          </li>
        </ul>
        <p>
          El Titular podrá denegar o retirar el acceso al Sitio a Usuarios que incumplan estas
          condiciones, sin necesidad de previo aviso.
        </p>
      </LegalSection>

      <LegalSection heading="Propiedad intelectual e industrial">
        <p>
          El Titular es titular o licenciatario de los derechos de propiedad intelectual e industrial
          del Sitio y de los elementos que lo integran (textos, fotografías, vídeos, logotipos,
          iconos, diseño gráfico, código fuente, software, marcas y nombres comerciales).
        </p>
        <p>
          Queda prohibida la reproducción, distribución, comunicación pública, transformación o
          cualquier otra forma de explotación, total o parcial, sin la autorización expresa y por
          escrito del Titular o de quien ostente los derechos correspondientes.
        </p>
        <p>
          Las marcas, logotipos o signos distintivos de terceros que aparezcan en el Sitio pertenecen
          a sus respectivos titulares, sin que su presencia implique aprobación o relación comercial
          con el Titular.
        </p>
      </LegalSection>

      <LegalSection heading="Exclusión de responsabilidades">
        <p>
          El Titular no garantiza la disponibilidad y continuidad del funcionamiento del Sitio ni la
          ausencia de errores en sus contenidos, aunque adoptará las medidas razonables para evitarlos
          y corregirlos cuando sea posible.
        </p>
        <p>
          El Titular no se responsabiliza de los daños y perjuicios de cualquier naturaleza que
          puedan derivarse de:
        </p>
        <ul>
          <li>
            La falta de disponibilidad, mantenimiento o efectivo funcionamiento del Sitio o de sus
            servicios.
          </li>
          <li>
            La presencia de virus u otros elementos lesivos en los contenidos que puedan producir
            alteraciones en el sistema informático del Usuario.
          </li>
          <li>
            El uso ilícito, negligente o contrario a este aviso legal por parte del Usuario.
          </li>
          <li>
            La falta de licitud, calidad, veracidad o utilidad de los contenidos y servicios de
            terceros enlazados desde el Sitio.
          </li>
        </ul>
        <p>
          El Usuario accede al Sitio bajo su exclusiva responsabilidad. El Titular no será
          responsable de decisiones adoptadas por el Usuario basadas en la información publicada en
          el Sitio.
        </p>
      </LegalSection>

      <LegalSection heading="Enlaces a sitios de terceros">
        <p>
          El Sitio puede incluir enlaces a páginas web de terceros para facilitar el acceso a
          información, contenidos o servicios de otras entidades. El Titular no ejerce control sobre
          dichos sitios y no asume responsabilidad por sus contenidos, políticas o prácticas.
        </p>
        <p>
          La inclusión de enlaces no implica relación, aprobación o recomendación del Titular
          respecto de los sitios enlazados. El Usuario accede a ellos bajo su propia responsabilidad.
        </p>
      </LegalSection>

      <LegalSection heading="Protección de datos y cookies">
        <p>
          El tratamiento de los datos personales del Usuario se describe en la{" "}
          <LegalLink href="/legal/privacidad">política de privacidad</LegalLink>. El uso de cookies
          y tecnologías similares se detalla en la{" "}
          <LegalLink href="/legal/cookies">política de cookies</LegalLink>.
        </p>
        <p>
          Para cualquier consulta relacionada con la protección de datos puede contactar con el
          Titular en <LegalLink href={`mailto:${empresa.email}`}>{empresa.email}</LegalLink>
          {contactoExtra}.
        </p>
      </LegalSection>

      <LegalSection heading="Modificaciones">
        <p>
          El Titular puede modificar en cualquier momento las condiciones del Sitio y del presente
          aviso legal para adaptarlos a cambios legislativos, técnicos o en los servicios ofrecidos.
          Las modificaciones serán efectivas desde su publicación en esta página.
        </p>
        <p>
          Se recomienda al Usuario revisar periódicamente este aviso legal. La versión vigente
          incluye la fecha de la última revisión: septiembre de 2026.
        </p>
      </LegalSection>

      <LegalSection heading="Legislación aplicable y jurisdicción">
        <p>
          Las relaciones entre el Titular y el Usuario se regirán por la legislación española
          vigente. Para la resolución de controversias, el Titular y el Usuario, con renuncia
          expresa a cualquier otro fuero que pudiera corresponderles, se someten a los Juzgados y
          Tribunales de {empresa.ciudadJurisdiccion}, salvo que la normativa aplicable disponga un
          fuero imperativo distinto (por ejemplo, cuando el Usuario actúe como consumidor o usuario
          conforme al Real Decreto Legislativo 1/2007, de 16 de noviembre).
        </p>
      </LegalSection>

      <LegalSection heading="Resolución de litigios en línea">
        <p>
          Conforme al Reglamento (UE) 524/2013, informamos que la Comisión Europea facilita una
          plataforma de resolución de litigios en línea (ODR), accesible en{" "}
          <LegalLink href="https://ec.europa.eu/consumers/odr">
            https://ec.europa.eu/consumers/odr
          </LegalLink>
          . El Titular no está obligado ni se compromete a participar en procedimientos de resolución
          de litigios ante una junta arbitral de consumo, salvo que la normativa aplicable lo exija.
        </p>
      </LegalSection>
    </>
  );
}

export function PrivacidadContent() {
  const { empresa } = getLegalData();
  const contactoExtra = empresa.telefono ? ` o llamando al ${empresa.telefono}` : "";

  return (
    <>
      <LegalParagraph>
        Aquí te explicamos, con palabras normales, qué datos recogemos cuando usas {empresa.dominio},
        para qué los usamos y qué puedes hacer si quieres consultarlos, cambiarlos o borrarlos.
      </LegalParagraph>

      <LegalSummary>
        <h2 className="legal-summary-title">En resumen</h2>
        <ul>
          <li>Solo pedimos lo necesario: contacto, mensaje y, si quieres, teléfono.</li>
          <li>Lo usamos para responderte y gestionar posibles proyectos contigo.</li>
          <li>No vendemos tus datos ni los usamos para cosas raras.</li>
          <li>Puedes escribirnos cuando quieras para ver, corregir o borrar lo que tengamos.</li>
          <li>
            Más detalle sobre cookies en la{" "}
            <LegalLink href="/legal/cookies">política de cookies</LegalLink>.
          </li>
        </ul>
      </LegalSummary>

      <LegalSection heading="Quién es responsable de tus datos">
        <p>
          El responsable es <strong>{empresa.denominacion}</strong>, con domicilio en{" "}
          {empresa.domicilio}. Si tienes dudas, escríbenos a{" "}
          <LegalLink href={`mailto:${empresa.email}`}>{empresa.email}</LegalLink>
          {contactoExtra}.
        </p>
        <ul>
          <li>
            <strong>NIF/CIF:</strong> {empresa.nif}
          </li>
          <li>
            <strong>Persona de contacto:</strong> {empresa.responsable}
          </li>
        </ul>
        <LegalNote>
          Marco legal: Reglamento (UE) 2016/679 (RGPD), Ley Orgánica 3/2018 (LOPDGDD) y Ley
          34/2002 (LSSI-CE). No tenemos delegado de protección de datos porque no nos es
          obligatorio (art. 37 RGPD).
        </LegalNote>
      </LegalSection>

      <LegalSection heading="Qué datos recogemos">
        <p>Depende de cómo nos contactes:</p>
        <ul>
          <li>
            <strong>Formulario de contacto:</strong> nombre, email, teléfono (opcional), asunto y
            mensaje.
          </li>
          <li>
            <strong>Chat de la web:</strong> lo que escribes en la conversación y, si tú quieres,
            tu nombre, email o teléfono para que te respondamos.
          </li>
          <li>
            <strong>Navegación:</strong> datos técnicos básicos (IP, navegador, páginas visitadas)
            y cookies, explicadas en la{" "}
            <LegalLink href="/legal/cookies">política de cookies</LegalLink>.
          </li>
        </ul>
        <p>
          No te pedimos datos sensibles (salud, ideología, origen, etc.). Si nos los envías por
          error, lo mejor es no hacerlo.
        </p>
      </LegalSection>

      <LegalSection heading="Para qué usamos tus datos">
        <p>En la práctica, para esto:</p>
        <ul>
          <li>Leer tu mensaje y responderte.</li>
          <li>Valorar si podemos ayudarte con un proyecto.</li>
          <li>Mantener el contacto si has mostrado interés en nuestros servicios.</li>
          <li>Que la web funcione bien y esté segura.</li>
          <li>Cumplir obligaciones legales si llegamos a trabajar juntos.</li>
        </ul>
        <LegalNote>
          Bases legales: tu consentimiento (art. 6.1.a RGPD), medidas precontractuales si nos
          pides presupuesto (art. 6.1.b), interés legítimo para responder consultas y mantener la
          web (art. 6.1.f) y obligación legal cuando aplique (art. 6.1.c). Puedes retirar tu
          consentimiento escribiendo a {empresa.email}.
        </LegalNote>
      </LegalSection>

      <LegalSection heading="Cuánto tiempo los guardamos">
        <ul>
          <li>
            <strong>Consultas y formulario:</strong> mientras gestionamos tu mensaje y, como máximo,
            2 años desde el último contacto.
          </li>
          <li>
            <strong>Chat:</strong> hasta 2 años o hasta que nos pidas borrarlos.
          </li>
          <li>
            <strong>Si hay relación comercial:</strong> el tiempo que marque la ley (normalmente
            entre 4 y 6 años en temas fiscales y mercantiles).
          </li>
          <li>
            <strong>Cookies y navegación:</strong> según la{" "}
            <LegalLink href="/legal/cookies">política de cookies</LegalLink>.
          </li>
        </ul>
        <p>Cuando ya no hagan falta, los borramos o los anonimizamos.</p>
      </LegalSection>

      <LegalSection heading="Con quién los compartimos">
        <p>
          No vendemos tus datos. Solo los compartimos si hace falta para que la web funcione o si
          la ley nos lo exige:
        </p>
        <ul>
          <li>
            <strong>Netlify</strong> — aloja la web.
          </li>
          <li>
            <strong>Google (Gemini)</strong> — procesa los mensajes del chat para generar
            respuestas automáticas.
          </li>
        </ul>
        <p>Estos proveedores solo pueden usarlos siguiendo nuestras instrucciones.</p>
      </LegalSection>

      <LegalSection heading="Si tus datos salen de Europa">
        <p>
          Algunos proveedores (como Google) pueden tratar datos fuera del Espacio Económico
          Europeo, sobre todo en Estados Unidos. Cuando ocurre, lo hacemos con las garantías que
          exige el RGPD: cláusulas contractuales tipo, decisiones de adecuación u otras medidas
          reconocidas.
        </p>
        <p>
          Si quieres más detalle, escríbenos a{" "}
          <LegalLink href={`mailto:${empresa.email}`}>{empresa.email}</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection heading="El chat con inteligencia artificial">
        <p>
          El asistente de la web usa IA para responder dudas generales y recoger información básica
          si quieres que te contactemos. No toma decisiones que te afecten legalmente (contratos,
          denegaciones, etc.) ni crea perfiles comerciales con datos sensibles.
        </p>
        <LegalNote>Conforme al art. 22 RGPD sobre decisiones automatizadas.</LegalNote>
      </LegalSection>

      <LegalSection heading="¿Tienes que darnos tus datos?">
        <p>
          En el formulario, los campos obligatorios son necesarios para responderte. Sin ellos, no
          podemos tramitar tu solicitud.
        </p>
        <p>
          En el chat, compartir tu email o teléfono es opcional: solo lo pedimos si quieres que un
          humano del equipo te escriba.
        </p>
      </LegalSection>

      <LegalSection heading="Tus derechos">
        <p>Puedes pedirnos, gratis y en cualquier momento:</p>
        <ul>
          <li>
            <strong>Acceso</strong> — saber qué datos tenemos de ti.
          </li>
          <li>
            <strong>Rectificación</strong> — corregir algo que esté mal.
          </li>
          <li>
            <strong>Supresión</strong> — que borremos tus datos.
          </li>
          <li>
            <strong>Oposición o limitación</strong> — que dejemos de usarlos en ciertos casos.
          </li>
          <li>
            <strong>Portabilidad</strong> — recibir tus datos en un formato usable.
          </li>
          <li>
            <strong>Retirar el consentimiento</strong> — si lo diste antes.
          </li>
        </ul>
        <p>
          Escríbenos a <LegalLink href={`mailto:${empresa.email}`}>{empresa.email}</LegalLink>
          {contactoExtra}, di qué derecho quieres ejercer e identifícate con tu DNI o documento
          equivalente. Te respondemos en un mes (máximo tres si el caso es complejo).
        </p>
        <LegalNote>Arts. 12 a 22 RGPD y LOPDGDD.</LegalNote>
      </LegalSection>

      <LegalSection heading="Si algo no te cuadra">
        <p>
          Si crees que no estamos tratando bien tus datos, puedes reclamar ante la Agencia Española
          de Protección de Datos (AEPD):
        </p>
        <p>
          <LegalLink href="https://www.aepd.es">www.aepd.es</LegalLink> — C/ Jorge Juan, 6, 28001
          Madrid.
        </p>
      </LegalSection>

      <LegalSection heading="Cómo los protegemos">
        <p>
          Usamos medidas técnicas y organizativas razonables: conexión cifrada (HTTPS), acceso
          limitado a quien lo necesita y buenas prácticas para evitar accesos no autorizados,
          pérdidas o alteraciones.
        </p>
      </LegalSection>

      <LegalSection heading="Menores">
        <p>
          Esta web no va dirigida a menores de 14 años. Si detectamos datos de un menor sin
          consentimiento de padre, madre o tutor, los eliminamos.
        </p>
      </LegalSection>

      <LegalSection heading="Cambios en esta política">
        <p>
          Podemos actualizar este texto si cambia la ley o añadimos funciones nuevas a la web. La
          versión vigente siempre estará aquí. Última revisión: septiembre de 2026.
        </p>
      </LegalSection>
    </>
  );
}

export function CookiesContent() {
  const { empresa, cookies } = getLegalData();

  return (
    <>
      <LegalParagraph>
        La presente Política de cookies informa sobre el uso de cookies y tecnologías similares en
        el sitio web {empresa.dominio}, titularidad de {empresa.denominacion}, de conformidad con el
        artículo 22.2 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la
        información y de comercio electrónico (LSSI-CE), el Reglamento (UE) 2016/679 (RGPD), la Ley
        Orgánica 3/2018, de 5 de diciembre, de protección de datos personales y garantía de los
        derechos digitales (LOPDGDD) y la Guía sobre el uso de las cookies de la Agencia Española de
        Protección de Datos (AEPD).
      </LegalParagraph>

      <LegalSection heading="Responsable">
        <ul>
          <li>
            <strong>Titular:</strong> {empresa.denominacion}
          </li>
          <li>
            <strong>NIF/CIF:</strong> {empresa.nif}
          </li>
          <li>
            <strong>Domicilio:</strong> {empresa.domicilio}
          </li>
          <li>
            <strong>Email de contacto:</strong> {empresa.email}
          </li>
          <li>
            <strong>Sitio web:</strong> {empresa.dominio}
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="¿Qué son las cookies y tecnologías similares?">
        <p>
          Las cookies son pequeños archivos de texto que los sitios web almacenan en el dispositivo
          del usuario (ordenador, teléfono móvil, tableta u otro equipo) cuando visita una página.
          Permiten, entre otras funciones, almacenar y recuperar información sobre los hábitos de
          navegación del usuario o de su equipo.
        </p>
        <p>
          A efectos de esta política, también se consideran tecnologías similares aquellas que
          permiten almacenar o acceder a información en el terminal del usuario, como el almacenamiento
          local del navegador, identificadores publicitarios o píxeles de seguimiento.
        </p>
      </LegalSection>

      <LegalSection heading="Tipos de cookies según su finalidad">
        <ul>
          <li>
            <strong>Cookies técnicas o necesarias:</strong> permiten la navegación y el uso de las
            funciones esenciales del sitio web. No requieren consentimiento del usuario.
          </li>
          <li>
            <strong>Cookies de preferencias o personalización:</strong> recuerdan información para
            que el usuario acceda al servicio con determinadas características (por ejemplo, idioma).
            Requieren consentimiento previo.
          </li>
          <li>
            <strong>Cookies de analítica o medición:</strong> permiten cuantificar el número de
            usuarios y analizar su comportamiento con fines estadísticos. Requieren consentimiento
            previo, salvo que la información obtenida sea estrictamente anónima y agregada conforme
            a los criterios de la AEPD.
          </li>
          <li>
            <strong>Cookies de publicidad comportamental:</strong> almacenan información del
            comportamiento del usuario para mostrar publicidad personalizada. Requieren consentimiento
            previo.
          </li>
        </ul>
        <p>
          Las cookies también pueden clasificarse según su titularidad (propias, enviadas desde el
          dominio del sitio, o de terceros, enviadas desde dominios ajenos) y según su duración
          (de sesión, se eliminan al cerrar el navegador, o persistentes, permanecen durante un
          plazo determinado).
        </p>
      </LegalSection>

      <LegalSection heading="Cookies utilizadas en este sitio web">
        <p>
          A continuación se detalla el inventario de cookies y tecnologías similares utilizadas en{" "}
          {empresa.dominio}:
        </p>
        <div className="legal-table-wrap">
          <table className="legal-table">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Proveedor</th>
                <th scope="col">Finalidad</th>
                <th scope="col">Tipo</th>
                <th scope="col">Duración</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5}>
                  En la actualidad, este sitio web no instala cookies propias ni de terceros en el
                  dispositivo del usuario para fines de analítica, publicidad o personalización.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {cookies.usaAnalitica ? (
          <p>
            Utilizamos cookies de analítica mediante{" "}
            {cookies.herramientaAnalitica || "herramientas de medición"} para conocer el uso del
            sitio y mejorar su funcionamiento. Estas cookies solo se instalan tras obtener su
            consentimiento expreso.
          </p>
        ) : (
          <p>No utilizamos cookies de analítica de terceros.</p>
        )}
        {cookies.usaMarketing ? (
          <p>
            Utilizamos cookies de publicidad y remarketing para medir la eficacia de campañas y
            mostrar anuncios personalizados. Estas cookies solo se instalan tras obtener su
            consentimiento expreso.
          </p>
        ) : (
          <p>No utilizamos cookies de publicidad ni de marketing.</p>
        )}
        <p>
          El chat integrado en la web no utiliza cookies para almacenar conversaciones en el
          dispositivo del usuario. Los datos facilitados voluntariamente a través del chat se tratan
          conforme a nuestra{" "}
          <LegalLink href="/legal/privacidad">Política de privacidad</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection heading="Base legal del tratamiento">
        <ul>
          <li>
            <strong>Cookies técnicas:</strong> interés legítimo del responsable y necesidad para la
            prestación del servicio solicitado por el usuario (art. 22.2 LSSI-CE).
          </li>
          <li>
            <strong>Cookies no necesarias</strong> (preferencias, analítica, publicidad): consentimiento
            del usuario, que puede retirarse en cualquier momento (art. 6.1.a RGPD y art. 22.2
            LSSI-CE).
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Conservación">
        <p>
          Las cookies técnicas, en su caso, se conservan durante el tiempo estrictamente necesario
          para su finalidad. Las cookies sujetas a consentimiento se mantienen durante el plazo
          indicado en el panel de configuración o en la tabla de cookies, y como máximo durante 24
          meses, salvo que el usuario las elimine antes desde su navegador.
        </p>
      </LegalSection>

      <LegalSection heading="Consentimiento, configuración y revocación">
        <p>
          De conformidad con la normativa vigente, las cookies que no son estrictamente necesarias
          requieren el consentimiento previo, libre, informado, específico e inequívoco del usuario.
          Puede aceptar, rechazar o configurar el uso de cookies no esenciales en cualquier momento
          mediante el panel de configuración de cookies del sitio web, si estuviera disponible, o
          a través de la configuración de su navegador.
        </p>
        <p>
          La retirada del consentimiento no afecta a la licitud del tratamiento basado en el
          consentimiento previo a su retirada. Si bloquea o elimina las cookies técnicas, es posible
          que algunas funcionalidades del sitio web no estén disponibles o no funcionen correctamente.
        </p>
      </LegalSection>

      <LegalSection heading="Cómo gestionar las cookies desde el navegador">
        <p>
          Puede permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la
          configuración de las opciones del navegador que utilice:
        </p>
        <ul>
          <li>
            <LegalLink href="https://support.google.com/chrome/answer/95647?hl=es">
              Google Chrome
            </LegalLink>
          </li>
          <li>
            <LegalLink href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias">
              Mozilla Firefox
            </LegalLink>
          </li>
          <li>
            <LegalLink href="https://support.apple.com/es-es/guide/safari/sfri11471/mac">
              Safari
            </LegalLink>
          </li>
          <li>
            <LegalLink href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09">
              Microsoft Edge
            </LegalLink>
          </li>
        </ul>
        <p>
          Para más información sobre cookies y sus derechos, puede consultar la web de la{" "}
          <LegalLink href="https://www.aepd.es/es/documento/guia-cookies.pdf">
            Agencia Española de Protección de Datos (AEPD)
          </LegalLink>
          .
        </p>
      </LegalSection>

      <LegalSection heading="Destinatarios y transferencias internacionales">
        <p>
          {cookies.usaAnalitica || cookies.usaMarketing
            ? "Algunas cookies pueden ser gestionadas por proveedores ubicados fuera del Espacio Económico Europeo. En esos casos, se adoptarán las garantías previstas en el RGPD (cláusulas contractuales tipo, decisiones de adecuación u otras medidas reconocidas)."
            : "En la actualidad no se realizan transferencias internacionales de datos derivadas del uso de cookies, al no utilizarse cookies de terceros con esa finalidad."}
        </p>
      </LegalSection>

      <LegalSection heading="Derechos del usuario">
        <p>
          Puede ejercer los derechos de acceso, rectificación, supresión, oposición, limitación del
          tratamiento y portabilidad, así como retirar su consentimiento, escribiendo a{" "}
          {empresa.email}. Para más información sobre el tratamiento de sus datos personales,
          consulte nuestra <LegalLink href="/legal/privacidad">Política de privacidad</LegalLink>.
        </p>
        <p>
          Si considera que el tratamiento de sus datos no se ajusta a la normativa, puede presentar
          una reclamación ante la Agencia Española de Protección de Datos (
          <LegalLink href="https://www.aepd.es">www.aepd.es</LegalLink>).
        </p>
      </LegalSection>

      <LegalSection heading="Actualización de la política">
        <p>
          {empresa.denominacion} puede modificar esta Política de cookies para adaptarla a cambios
          legislativos, jurisprudenciales o en el uso de cookies en el sitio web. La fecha de la
          última actualización es el {cookies.fechaActualizacion}.
        </p>
      </LegalSection>

      <LegalSection heading="Contacto">
        <p>
          Para cualquier consulta sobre el uso de cookies en este sitio web, puede contactar con{" "}
          {empresa.denominacion} en {empresa.email}.
        </p>
      </LegalSection>
    </>
  );
}
