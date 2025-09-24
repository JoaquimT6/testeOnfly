#!/usr/bin/env bash
set -euo pipefail

# Instala/atualiza o pacote local @onfly/random-node dentro de custom/.n8n/custom
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CUSTOM_DIR="${ROOT_DIR}/custom/.n8n/custom"

echo "› Preparing custom dir: ${CUSTOM_DIR}"
mkdir -p "${CUSTOM_DIR}"
cd "${CUSTOM_DIR}"

# Garante um package.json minimal
if [ ! -f package.json ]; then
  cat > package.json <<'JSON'
{
  "name": "n8n-custom-extensions",
  "private": true,
  "description": "Local holder for custom/community nodes",
  "license": "UNLICENSED",
  "dependencies": {
    "@onfly/random-node": "file:../../random-node"
  }
}
JSON
else
  # Atualiza/garante a dependência local
  node -e "const fs=require('fs');const p='./package.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));j.dependencies=j.dependencies||{};j.dependencies['@onfly/random-node']='file:../../random-node';fs.writeFileSync(p,JSON.stringify(j,null,2));console.log('› Ensured dependency in package.json');"
fi

echo "› Installing deps in ${CUSTOM_DIR}"
npm install

echo "› Restarting n8n container to reload extensions"
docker compose restart n8n

echo "✓ Done. Open http://localhost:5678 and search for the 'Random' node."
