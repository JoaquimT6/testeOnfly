# @onfly/random-node

Custom node para n8n que gera **um número aleatório verdadeiro** usando **Random.org**.

## Build
```bash
npm install
npm run build
```

## Teste rápido (integração)
```bash
npm run test
# ou
MIN=10 MAX=20 npm run test
```

## Export para n8n
O pacote exporta o node via campo `"n8n.nodes"` no `package.json` (build em `dist/Random.node.js`).
