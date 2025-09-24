# Random (n8n Custom Node) — Recruta Onfly

Conector **Random** para o n8n que gera um número aleatório **verdadeiro** via **Random.org**, aceitando *Min* e *Max* (inteiros inclusivos).Inclui **Docker Compose** para subir **n8n + PostgreSQL**, mapeando a pasta de **custom nodes**.

## ⚙️ Requisitos
- Docker & Docker Compose
- Node.js 22 LTS + npm/pnpm (para compilar o node localmente)
- Make (opcional) — ou use os scripts `.sh` equivalentes

## 🧱 Arquitetura do repositório
```
onfly-n8n-random-node/
├─ docker-compose.yml
├─ .env.example
├─ README.md
├─ scripts/
│  ├─ custom-install.sh
│  └─ custom-rebuild.sh
├─ custom/
│  └─ .n8n/custom/
│     └─ package.json        # pacote "casca" onde instalamos o node custom
└─ random-node/              # pacote npm do node custom
   ├─ package.json
   ├─ tsconfig.json
   ├─ README.md
   └─ src/
      ├─ index.ts
      ├─ Random.node.ts
      └─ random.svg
```

## 🚀 Subindo a infra (n8n + Postgres)
1. Copie o arquivo de exemplo de variáveis:
   ```bash
   cp .env.example .env
   ```
2. Suba os containers:
   ```bash
   docker compose up -d
   ```
   - O n8n ficará acessível em: **http://localhost:5678**

> Observação: os volumes mapeiam `./custom/.n8n` para `/home/node/.n8n` dentro do container do n8n.

## 🛠️ Build e instalação do Custom Node
No host (fora do container), compile o node:

```bash
# dentro do diretório do repositório
cd random-node
npm install
npm run build
cd ..
```

Agora instale o pacote compilado **dentro** da pasta `.n8n/custom` (que é montada no container):
```bash
bash scripts/custom-install.sh
```

Esse script:
- Entra em `custom/.n8n/custom`
- Instala a dependência local `@onfly/random-node` (via `file:`)
- Reinicia o container do n8n (para recarregar extensões)

Se fizer alterações no código do node no futuro:
```bash
bash scripts/custom-rebuild.sh
```

## 🧪 Testes
Para este desafio, incluímos um teste simples de integração que valida a chamada ao **Random.org** (sem mocks).
Execute localmente do *host* (fora do container):
```bash
cd random-node
npm run test
```

> Os testes verificam se o valor retornado está dentro do intervalo `[MIN, MAX]`.
> Você pode ajustar `MIN`/`MAX` via variáveis de ambiente (defaults `1..60`):
> ```bash
> MIN=10 MAX=20 npm run test
> ```

## 📦 Como usar no n8n
Com tudo instalado e o n8n rodando:
1. Abra o **Editor** do n8n: http://localhost:5678
2. Clique em **+ Add node** → procure por **Random** (grupo *Custom*).
3. Selecione a operação **True Random Number Generator**.
4. Informe **Min** e **Max** (inteiros). Execute o node.
5. A saída estará no campo `json.value`, com metadados:
   ```json
   {
     "value": 17,
     "min": 1,
     "max": 60,
     "source": "random.org",
     "endpoint": "https://www.random.org/integers/?num=1&min=1&max=60&col=1&base=10&format=plain&rnd=new"
   }
   ```

## 🧰 Variáveis & credenciais
Este conector usa apenas a **API pública** do Random.org (endpoint *GET* plano).Caso queira usar a versão com **API key**, é simples adaptar no código (headers e endpoint JSON-RPC).

## 📝 Notas de implementação
- Desenvolvido com **Node 22 LTS** + **TypeScript**.
- Compatível com n8n **self-hosted** `1.85.4` (imagem oficial `n8nio/n8n:1.85.4`).
- Respeita a convenção de **Community/Custom Nodes** do n8n: export via `"n8n.nodes"` no `package.json` e assets (SVG) referenciados via `file:`.
- Erros comuns (ex.: `min > max`) disparam `NodeOperationError` com mensagem amigável.

## 📤 Entrega
- Faça *fork* / publique em um repositório **público** no GitHub.
- Inclua este README e confirme que `docker compose up -d` + `scripts/custom-install.sh` habilitam o node no n8n.
- Envie o link do repositório para o e-mail solicitado.

**Boa sorte!**
