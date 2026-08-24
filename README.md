# Central Adapta

Aplicação interna da Central de Comunicação Adapta, publicada em Cloudflare Workers.

## Arquitetura

- `src/worker-auto-seed.js`: API, autenticação e bootstrap automático do D1
- `data/seed.part*.js`: base inicial versionada da Central, usada apenas para inicialização/migração
- `source/index.part*.b64`: frontend empacotado; o build recria `public/index.html`
- `source/guiadehash/`: fonte do guia público; o build recria `public/guiadehash.html` e seus assets
- Cloudflare D1 (`central-adapta-db`): fonte de verdade dos dados editoriais e operacionais depois da inicialização
- Cloudflare Workers Builds: deploy automático a cada push na branch `main`

## Rotas públicas

- `/care`: preview Adapta Care
- `/guiadehash`: guia interativo sobre extrações e hash

## Regra de dados

A base inicial fica versionada no GitHub para permitir bootstrap automático. O Worker aplica essa base apenas quando o D1 ainda não foi inicializado ou quando precisa concluir a migração de bootstrap já marcada pelo sistema.

Depois disso, o conteúdo vivo não é reimportado do GitHub a cada abertura: alterações feitas na Central continuam sendo lidas e gravadas no D1. Isso evita duas fontes de verdade e impede que uma exclusão ou edição legítima seja desfeita pelo seed.

Backups e `.dev.vars` continuam fora do Git.

O `wrangler.jsonc` executa os materializadores necessários antes de cada deploy, então os HTMLs gerados não precisam ser versionados.

> O nome `centraladapta` corresponde ao Worker conectado a este repositório no Cloudflare Builds.

Pipeline de deploy automático validado em produção em 18/08/2026.
