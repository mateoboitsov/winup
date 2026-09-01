# winup. — Cómo editar la web (para Pablo)

La web está **cerrada para publicar** con contenido de borrador donde haga falta. Pablo puede ir completándola sin depender de Mateo para cada cambio.

## Panel de edición (recomendado)

1. Entra en **`https://[tu-dominio]/admin`**
2. Inicia sesión con el usuario que configure Mateo en Netlify
3. Edita:
   - **Quiénes somos** → historia + equipo (nombre, cargo, bio, foto)
   - **Legal** → NIF, domicilio, responsable, email, dominio

> **Primera vez:** en Netlify hay que activar *Identity* y *Git Gateway* (lo hace Mateo en 5 minutos). Sin eso, `/admin` no guarda cambios.

## Qué puede editar Pablo solo

| Sección | Dónde | Cómo |
|---|---|---|
| Equipo e historia | `/admin` → Quiénes somos | Panel visual |
| Datos legales | `/admin` → Legal | Panel visual |
| Fotos del equipo | `/admin` (campo Foto) | Se guardan en `public/media/equipo/` |
| Proyectos (fotos/reels) | Carpetas en `public/media/{número}/` | Pedir a Mateo o subir por Drive |
| Textos de servicios | Archivo `lib/services.ts` | Por ahora Mateo; se puede pasar a panel más adelante |

## Qué falta que rellene Pablo (cuando pueda)

- Completar en **Legal** (panel `/admin`): NIF, domicilio, responsable, dominio definitivo
- Sustituir **nombres y fotos del equipo** en `/admin`
- Revisar textos de **servicios** si quiere cambiar casos de éxito (ahora hay ejemplos genéricos)
- Enviar textos definitivos de servicios cuando los tenga (sustituimos los borradores)

## Entrega y dominio

- La web está en **Netlify** (deploy automático al subir cambios a GitHub)
- Para el dominio propio: comprar dominio → en Netlify añadir dominio custom → cambiar DNS donde compró el dominio
- Mateo puede **mantener la web** (cambios por WhatsApp) o pasar acceso al repo si preferís autonomía total

## Contacto

Mateo — cambios urgentes o dudas de edición.
