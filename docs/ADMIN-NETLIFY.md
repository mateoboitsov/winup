# Activar /admin en Netlify

## Importante

- **La web real** está en `https://pablo-climent.netlify.app` (no en `winup.netlify.app`, que es otro sitio ajeno).
- **La CLI de Netlify no puede activar Identity ni Git Gateway** (el comando `addons:create` ya no existe en CLI v26).
- El panel `/admin` **necesita el repo conectado a GitHub** para guardar cambios. Ahora el sitio está desplegado a mano, sin Git.

## Paso 1 — Conectar GitHub (una vez, ~2 min)

En terminal, en esta carpeta:

```bash
netlify link --id 48d08e77-069f-49b9-a1b0-988319dff24c
netlify init
```

Elige: repo existente → `mateoboitsov/winup` → rama `main` → build `pnpm run build` → publish `.next` (o deja lo que proponga el plugin Next.js).

## Paso 2 — Activar Identity + Git Gateway (dashboard, ~2 min)

```bash
netlify open:admin
```

En el navegador:

1. **Identity** → Enable Identity  
2. Registration → **Invite only**  
3. **Git Gateway** → Enable Git Gateway  
4. **Invite users** → email de Pablo

## Paso 3 — Probar

`https://pablo-climent.netlify.app/admin`

Login → editar equipo o legal → Publish (commit a GitHub + redeploy automático).

## Mensaje para Pablo (cuando hayas invitado)

> Pablo, la web la cierro yo esta semana para que esté online antes del 3.  
> Donde falte material (equipo, textos de servicios, datos legales) dejo borradores que podéis cambiar vosotros.  
> Para editar sin depender de mí: **pablo-climent.netlify.app/admin** (te llega invitación por email).  
> Ahí podéis cambiar equipo, fotos y datos legales. Proyectos y servicios más avanzados los vemos si hace falta.  
> Cuando tengáis textos definitivos de servicios o fotos del equipo, los subís por el panel o me los pasáis y los actualizo.
