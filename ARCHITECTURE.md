# Central Adapta — arquitetura operacional

## Regra principal

O D1 é a única fonte de verdade do workspace. Nenhum módulo pode considerar `localStorage`, estado de componente, Shadow DOM ou cache do navegador como fonte operacional definitiva.

## Estado central

- Persistência: D1, tabela `app_state`.
- Versão: `revision` monotônica.
- Histórico: `state_history`.
- Auditoria operacional: `activity_audit_log`.
- Gateway do front: `GET/PATCH /api/shared-state`.
- Autoria: nome declarado por sessão; serve para log, não para autenticação.

## Estado canônico x metadados derivados

O estado canônico é formado pelos dados que representam decisões e operação: conteúdos, etapas, datas, linhas editoriais, slots, decisões de feriados, comunicação, responsáveis e demais valores editáveis.

Alguns componentes regeneram metadados técnicos durante a renderização. Eles não representam uma nova decisão e não podem criar revisão nem log por conta própria. Hoje entram nessa categoria:

- `holidayContents[].generatedAt`;
- `calendarEntries[].updatedAt` quando a entrada é um informativo de feriado gerado automaticamente (`id` iniciado por `feriado-`).

O adaptador central compara esses objetos de forma canônica: ignora apenas esses timestamps para detectar mudança, mas preserva o objeto completo quando existe uma alteração operacional real.

## Fluxo de leitura

1. A aplicação abre.
2. O gateway lê `/api/shared-state`.
3. O estado retornado pelo D1 substitui o estado em memória.
4. O mesmo estado é espelhado em `central_adapta_v40` apenas para compatibilidade com o front legado.
5. Todos os módulos renderizam a partir desse mesmo estado.

O cache local nunca vence o estado central durante o boot.

## Fluxo de escrita

1. Um módulo altera o estado da interface.
2. O adaptador central calcula o delta canônico.
3. O usuário declara o nome uma vez por sessão.
4. O delta é enviado para `PATCH /api/shared-state`.
5. O Worker aplica a mudança sobre a revisão atual do D1 e registra auditoria.
6. O front relê o estado central confirmado e substitui o espelho local.
7. Em falha de gravação, a interface volta ao último estado confirmado pelo D1.

Mudanças que consistem apenas em metadados derivados de renderização são descartadas antes da escrita e não geram auditoria.

## Sincronização entre navegadores

- Poll do estado central a cada 3 segundos.
- Uma revisão maior substitui o estado local inteiro.
- Se alguém estiver editando um campo, a atualização remota é adiada até o fim da edição.
- Não existe merge silencioso entre dois caches locais divergentes.

## Módulos

Conteúdos, calendário, linhas editoriais, visão geral, feriados e avisos usam o mesmo estado central e o mesmo fluxo de persistência.

Feriados não possui mais uma arquitetura de persistência própria no front. Os endpoints `/api/holiday-*` permanecem temporariamente apenas como compatibilidade/migração e não devem receber novos consumidores.

## localStorage

`central_adapta_v40` é somente um cache de compatibilidade para o front legado. Ele pode ser removido quando os componentes passarem a consumir diretamente `window.__adaptaCentralState`.

Nenhuma nova feature pode depender de uma chave local própria para persistência operacional.

## Próxima etapa estrutural

Eliminar gradualmente o adaptador de `localStorage` do front legado e fazer cada domínio consumir o gateway central diretamente. Isso é uma simplificação interna; não exige mudar a interface já conhecida pela equipe.
