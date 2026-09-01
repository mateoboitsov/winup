#!/usr/bin/env bash
# Abre el panel de Netlify del proyecto winup y muestra los pasos que no se pueden hacer por CLI.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Sitio: pablo-climent (48d08e77-069f-49b9-a1b0-988319dff24c)"
echo "→ URL:   https://pablo-climent.netlify.app/admin"
echo ""
echo "La CLI no activa Identity/Git Gateway. Abriendo el dashboard..."
netlify link --id 48d08e77-069f-49b9-a1b0-988319dff24c 2>/dev/null || true
netlify open:admin
echo ""
echo "En el dashboard:"
echo "  1. Identity → Enable"
echo "  2. Registration → Invite only"
echo "  3. Services → Git Gateway → Enable"
echo "  4. Invite users → email de Pablo"
echo ""
echo "Si Git Gateway falla, conecta el repo antes: netlify init"
echo "Guía: docs/ADMIN-NETLIFY.md"
