#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "› Building random-node"
pushd "${ROOT_DIR}/random-node" >/dev/null
npm install
npm run build
popd >/dev/null

echo "› Reinstalling into custom/.n8n/custom"
bash "${ROOT_DIR}/scripts/custom-install.sh"
