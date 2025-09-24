# testeOnfly

Conector **Random** para o **n8n** que gera **um número aleatório verdadeiro** via **Random.org**, aceitando **Min** e **Max** (inteiros inclusivos).  
O repositório inclui **Docker Compose** para subir **n8n (1.85.4) + PostgreSQL 16**, bem como o pacote **TypeScript/Node 22** do custom node.

## Sumário
- [Pré-requisitos](#pré-requisitos)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Instalação das dependências](#instalação-das-dependências)
- [Execução local com Docker](#execução-local-com-docker)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Instalar o custom node no n8n](#instalar-o-custom-node-no-n8n)
- [Executar os testes](#executar-os-testes)
- [Como usar no editor do n8n](#como-usar-no-editor-do-n8n)
- [Notas técnicas](#notas-técnicas)
- [Solução de problemas](#solução-de-problemas)
- [Entrega (como o avaliador valida)](#entrega-como-o-avaliador-valida)
- [Licença](#licença)

---

## Pré-requisitos
- **Node.js 22 LTS**
- **npm**
- **Docker + Docker Compose**
- **Git** (opcional)

> **Dica Windows:** evite rodar o projeto dentro do **OneDrive**. Use um caminho local como `C:\dev\onfly-n8n-random-node` para que o Docker reflita corretamente os arquivos montados por volume.

---

## Estrutura do projeto
```
onfly-n8n-random-node/
├─ docker-compose.yml
├─ .env.example
├─ README.md
├─ custom/
│ └─ .n8n/
│    └─ custom/ # holder onde os custom/community nodes são instalados
└─ random-node/ # pacote npm do custom node (TypeScript)
   ├─ package.json # "type": "commonjs", "n8n.nodes": ["dist/Random.node.js"]
   ├─ tsconfig.json # module: commonjs
   ├─ tests/
   └─ src/
      ├─ index.ts
      ├─ Random.node.ts
      └─ random.svg # ícone do node
```

---

## Instalação das dependências
Instale apenas o pacote do custom node (não há dependências na raiz):

```bash
# Linux/Mac
cd random-node
npm install
npm run build
```

```powershell
# Windows PowerShell
cd .\random-node
npm install
npm run build
```

Isso gera a saída em random-node/dist/.

---

## Execução local com Docker
Copie o arquivo de variáveis:

```bash
cp .env.example .env
```

```powershell
Copy-Item .env.example .env
```

Suba os serviços:

```bash
docker compose up -d
```

O editor do n8n ficará acessível em http://localhost:5678.

---

## Configuração do ambiente
Arquivo `.env` (baseado no `.env.example`):

```ini
POSTGRES_USER=n8n
POSTGRES_PASSWORD=n8n
POSTGRES_DB=n8n

N8N_HOST=localhost
GENERIC_TIMEZONE=America/Sao_Paulo
```

O `docker-compose.yml` mapeia o volume `./custom/.n8n → /home/node/.n8n` e define `N8N_COMMUNITY_PACKAGES_ENABLED=true` para habilitar community/custom packages.

---

## Instalar o custom node no n8n
O n8n carrega custom nodes a partir de `/home/node/.n8n/custom/node_modules` (no container).  
Portanto, instale no diretório `custom/.n8n/custom` do host (que é o volume montado).

### Opção A — Instalar via tarball (`npm pack`) (recomendado)
Gerar o pacote `.tgz`:

```bash
cd random-node
npm run build
npm pack        # gera onfly-random-node-0.1.0.tgz
cd ..
```

Instalar o tarball no holder:

```bash
cd custom/.n8n/custom
# se ainda não existir, crie um package.json simples aqui:
# { "name": "n8n-custom-extensions", "private": true, "dependencies": {} }
npm install ../../random-node/onfly-random-node-0.1.0.tgz
```

Reiniciar o n8n:

```bash
cd ../../..
docker compose restart n8n
```

### Opção B — Instalar via `file:` (alternativa)
```bash
cd random-node
npm run build
cd ../custom/.n8n/custom
npm install ../../random-node
cd ../../..
docker compose restart n8n
```

### Validar no container
```bash
docker exec -it n8n sh -lc "ls -la /home/node/.n8n/custom/node_modules/@onfly/random-node/dist"
# Deve listar Random.node.js
```

---

## Executar os testes
Há um teste simples de integração que chama o **Random.org** e confere o intervalo.

```bash
cd random-node
npm run test                 # usa MIN=1, MAX=60 por padrão

# range custom:
MIN=10 MAX=20 npm run test
```

No Windows PowerShell:

```powershell
cd .\random-node
npm run test
$env:MIN="10"; $env:MAX="20"; npm run test
```

---

## Como usar no editor do n8n
1. Acesse http://localhost:5678
2. **+ New workflow**
3. Adicione **Manual Trigger** (gatilho inicial)
4. Clique em **+ Add node** (catálogo completo) → pesquise **Random** (categoria **Custom**)
5. Selecione a operação **True Random Number Generator**
6. Informe **Min** e **Max** (inteiros) e clique **Execute**

**Saída esperada (exemplo):**
```json
{
  "value": 22,
  "min": 1,
  "max": 60,
  "source": "random.org",
  "endpoint": "https://www.random.org/integers/?num=1&min=1&max=60&col=1&base=10&format=plain&rnd=new",
  "timestamp": "2025-09-24T15:00:00.000Z"
}
```

---

## Notas técnicas
- **Node 22 + TypeScript**
- Build em **CommonJS** no `package.json` ("type": "commonjs") e `tsconfig.json` ("module": "CommonJS")
- Integração obrigatória com **Random.org** via endpoint GET (formato plain)
- Validações:
  - `Min` e `Max` inteiros
  - `Min ≤ Max`
  - Parse e verificação do retorno dentro do range
- Ícone **SVG** incluído (`src/random.svg`)
- Export para o n8n via:
  ```json
  "n8n": { "nodes": ["dist/Random.node.js"] }
  ```

---

## Solução de problemas

**1) O editor não abre em `localhost:5678`**  
- Verifique containers/portas:
  ```bash
  docker ps
  docker port n8n
  docker compose logs --tail=200 n8n
  ```
- Conflito de portas? Troque para `5680:5678` no compose.
- Tente `http://127.0.0.1:5678`.

**2) O node não aparece em “Custom”**  
- Confirme o caminho no container:
  ```bash
  docker exec -it n8n sh -lc "ls -la /home/node/.n8n/custom/node_modules/@onfly/random-node/dist"
  ```
- Reinicie o serviço:
  ```bash
  docker compose restart n8n
  ```
- Hard reload no navegador (**Ctrl+F5**).

**3) Log mostra `require() of ES Module ... not supported`**  
- Garanta que:
  - `random-node/package.json` tem `"type": "commonjs"`
  - `random-node/tsconfig.json` tem `"module": "CommonJS"`

**4) Windows/OneDrive não reflete arquivos no container**  
- Use um diretório **fora do OneDrive** (ex.: `C:\dev\...`) ou marque as pastas como **“Sempre manter neste dispositivo”**.

**5) `429 Too Many Requests` do Random.org**  
- Aguarde alguns segundos e execute novamente (rate limit do serviço público).

---

## Entrega (como o avaliador valida)
1. Clonar o repo
2. `cp .env.example .env`
3. `docker compose up -d`
4. `cd random-node && npm install && npm run build`
5. `cd ../custom/.n8n/custom && npm install ../../random-node`
6. `docker compose restart n8n`
7. Abrir http://localhost:5678 e testar o node **Random**



---

## Licença
MIT
