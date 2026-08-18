# Central Adapta

Aplicação interna da Central de Comunicação Adapta, publicada em Cloudflare Workers.

## Arquitetura

- `src/worker.js`: API e autenticação
- `source/index.part*.b64`: frontend empacotado; o build recria `public/index.html`
- Cloudflare D1 (`central-adapta-db`): fonte de verdade dos dados editoriais e operacionais
- Cloudflare Workers Builds: deploy automático a cada push na branch `main`

Os dados reais da Central **não são versionados neste repositório**. Seeds, exportações do D1, backups e `.dev.vars` ficam fora do Git.

O `wrangler.jsonc` executa `node scripts/materialize-index.mjs` antes de cada deploy, então o HTML gerado não precisa ser versionado.

> O nome `centraladapta` corresponde ao Worker que já estava conectado a este repositório no Cloudflare Builds.
