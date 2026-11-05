# Implementação e validação — 05/11/2026

Base: `546307dcc0057e88a72338cfa70faf5dda298b81`. Branch local: `feature/beta-committees`.
Resultados pertencem à árvore de trabalho com os diffs desta entrega, ainda sem commit ou integração remota.
Este relatório atualiza o [diagnóstico inicial](committees-2026-11-04.md); os bloqueios de ambiente de então
não representam o estado atual. Não encerra integralmente TASK-006/007/023/024/025.

## Mudanças implementadas

| Frente       | Implementação                                                                                                                                                                                        | Evidência                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Restauração  | Caminho em lote preserva identidade, progresso, notas, datas, estatísticas e relações; corrige replace de backup antigo e duplicatas; valida versão, datas, campos por tipo e dependências de marcos | 47 testes de import/export com armazenamento real em memória, incluindo seis tipos e falhas injetadas        |
| Persistência | Journal restrito à restauração; recuperação de falhas; lease de 60 s impede leitura de desfazer writer ativo; preserva erro de quota e leitura de metas legadas sem estatísticas                     | Regressões reproduzidas e corrigidas; testes de escrita concorrente simulada, recuperação e CRUD sem journal |
| Criação      | Recuperada suite que estava desativada, agora usa o GoalForm efetivamente usado pela aplicação                                                                                                       | 10 testes ativos: seis submissões pela UI, storage/export, campos, validação, cancelamento e quota           |
| Notas        | Rejeita conteúdo vazio, só espaços e mais de 5.000 caracteres antes de alterar cache/storage                                                                                                         | 14 testes de CRUD, tags/datas, cache, rollback, limites e meta ausente; substituem placeholders              |
| PWA          | Atualização em modo prompt, detecção de worker esperando, ativação somente após confirmação, limpeza de listeners e proteção da outra aba contra reload automático                                   | 8 testes de hook; dois builds de produção e duas abas testados no Edge                                       |
| Bundles      | Modais importam GoalForm diretamente; removido agrupamento forçado de todo Ant Design                                                                                                                | Dois avisos de ciclo desapareceram; comparação abaixo; rotas e recarga offline testadas                      |
| Gitflow      | Guard de PRs para feature/fix → develop, release → main e main → develop; contribuições externas limitadas à entrada de manutenção; exceções Dependabot documentadas                                 | 18 testes, incluindo consistência do bootstrap do workflow                                                   |
| Release      | Publica somente tag existente integrada em main, após checks; validação sem permissão de escrita separada da publicação; SHA do checkout no artefato                                                 | 2 testes de release com Git sintético e parse dos workflows                                                  |

O atalho `npm run release` que fazia push direto em main foi removido. Preparação segue release/\* e PR para main;
tag e publicação dependem da autorização prevista na governança. Nenhuma tag, release, dispatch, merge ou push executado.
Os guards passam a atuar no GitHub após integração; configuração de branch protection não foi alterada.

## Ambiente e checks

Node pessoal empacotado pelo Codex, versão 24.22.1. Npm oficial 10.9.4 preparado em diretório temporário,
com integridade verificada e configurações user/global e cache separados do ambiente corporativo.
Nenhum npm global ou corporativo usado. Lockfile preservado; nenhuma atualização de dependências nesta entrega.
As dependências locais passaram a estar disponíveis após a instalação autorizada na execução anterior.

Vitest precisou de TEMP/TMP dentro de `node_modules/.cache/test-temp`: o diretório temporário padrão do sandbox
causava EPERM em rename do cache Vite. Não houve relaxamento de assertions, gates ou thresholds.

| Comando/check                                                                                                                 | Resultado                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node node_modules/vitest/vitest.mjs run --reporter=dot`                                                                      | **passed**, exit 0; 410 testes aprovados, 37 skipped; 29 arquivos aprovados, 5 skipped                                                                        |
| `node --test scripts/check-version.node-test.js scripts/check-gitflow.node-test.js scripts/check-release-commit.node-test.js` | **passed**, exit 0; 30 testes, zero skipped; TEMP/TMP apontaram para diretório de teste dentro do workspace                                                   |
| `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.src.json`                                                          | **passed**, exit 0                                                                                                                                            |
| `node node_modules/eslint/bin/eslint.js . --ext .ts,.tsx,.js,.jsx`                                                            | **passed**, exit 0; scripts são ignorados pelo lint padrão existente e foram verificados separadamente com ESLint recommended                                 |
| `node node_modules/prettier/bin/prettier.cjs --check "**/*.{ts,tsx,js,jsx,json,md,yml,yaml}"`                                 | **passed** antes deste relatório; documentos finais formatados e checados novamente                                                                           |
| `node scripts/validateTranslations.js`                                                                                        | **passed**, exit 0; 622 chaves em 10 idiomas                                                                                                                  |
| TypeScript + `node node_modules/vite/bin/vite.js build`                                                                       | **passed**, exit 0; build de produção em dist                                                                                                                 |
| Auditoria registrada em `node_modules/.cache/momentum-audit-final.json`                                                       | evidência anterior nesta árvore: 0 altas/críticas, 11 moderadas, 2 baixas; **não reexecutada nesta sessão** porque o npm pessoal aprovado não está disponível |
| Parse YAML de release.yml e gitflow.yml                                                                                       | **passed**, sem chaves duplicadas ou erro de sintaxe                                                                                                          |
| `node scripts/check-version.js maintenance`                                                                                   | **passed**, exit 0; package/lock em 0.2.2                                                                                                                     |
| `git diff --check`                                                                                                            | **passed** na revisão dos patches; rechecado após documentação                                                                                                |

CI remota desta árvore: **not run**. Resultados são locais; nenhum sucesso antigo de CI foi reutilizado.
Permanecem warnings preexistentes de act em suites antigas, atribuição a const em notificationStorage.test.ts
e anotações PURE do Zod no build. Não há novos avisos de chunk circular nem chunk acima do limite existente de 1.000 kB.

## Comparação de bundles

Baseline: build local antes das correções de imports/configuração, com os arquivos de implementação ainda em evolução.
Final: código desta entrega. Mesmas dependências e mesma configuração de minificação, source maps e gzip.
Medição soma bytes gzip dos arquivos JavaScript alcançados por imports estáticos do entrypoint HTML;
não representa tempo de carregamento, tráfego com cache nem o conjunto de todas as rotas.

| Medida                                  | Baseline                | Final                               |
| --------------------------------------- | ----------------------- | ----------------------------------- |
| Arquivos JS na cadeia estática inicial  | 6                       | 5                                   |
| Bytes JS brutos nessa cadeia            | 1.856.433               | 1.285.868                           |
| Bytes gzip nessa cadeia                 | 555.949                 | 386.363                             |
| Maior chunk minificado                  | 1.114,06 kB, Ant Design | 910,15 kB, entrypoint compartilhado |
| Avisos de reexport circular de GoalForm | 2                       | 0                                   |
| Precache total informado pelo plugin    | 2.455,64 KiB            | 2.463,18 KiB                        |

A melhora é da carga inicial e da distribuição entre rotas; o precache completo não diminuiu.
O limite de aviso não foi aumentado. Aumento de requests nas rotas lazy deve ser acompanhado no uso real.

## Jornadas reais no navegador

Edge instalado, headless, perfis temporários vazios, dados sintéticos e pedidos externos bloqueados.
Chromium empacotado falhou ao iniciar; a troca para Edge permitiu a validação.

- Desktop 1280×900, inglês, tema claro: criar quantitativa, abrir detalhe, atualizar 0 → 50%, adicionar nota,
  recarregar e reler progresso/nota; segunda recarga offline preserva a jornada.
- Settings: baixar JSON; validar identidade, progresso e nota do conteúdo exportado.
- Outro perfil vazio, viewport 375×812: importar o JSON pela interface, abrir a meta e comparar ID, progresso,
  nota e createdAt; sem overflow horizontal do documento nessa tela.
- Atualização: dois builds **distintos**, segundo com flags de marcos/recorrentes/hábitos habilitadas só para QA.
  “Later” preserva um rascunho; outra aba aceita “Update Now” e recarrega; a aba do rascunho não navega e mantém o texto.
- Nenhum pageerror nessas jornadas. Não se trata de cobertura integral de acessibilidade ou de todos os dispositivos.
- A repetição do harness de navegador nesta sessão não iniciou o Edge headless no sandbox; os resultados acima são logs
  anteriores desta árvore de implementação, não uma nova execução vinculada a um SHA commitado.

Harnesses e logs locais: `node_modules/.cache/qa-browser.cjs`, `qa-pwa-update.cjs`, `vitest-final.log`,
`build-final.log` e `momentum-audit-final.json`. São evidências locais ignoradas pelo Git, não novas dependências do projeto.

## Pendências explícitas e próxima sequência

1. **Backup completo:** eventos de realização em `goal_completions` ainda estão fora do formato exportado atual.
   Preservação de metadados de anexos não inclui arquivos binários. Journal usa quota temporária adicional;
   lease não é mutex e não oferece garantia ACID entre abas. Validar concorrência e recuperação em plataformas reais.
2. **Beta:** restam 37 testes desativados (5 arquivos). A suíte de progresso foi reativada e agora tem 21 casos ativos,
   incluindo envio datado de hábito; o ciclo dos seis tipos ainda não foi exercitado integralmente no navegador.
   Os seis tipos foram criados na suite ativa com flags explícitas; a configuração padrão continua ocultando
   marcos/recorrentes/hábitos. Habilitação geral depende da aceitação de progresso e calendário desses tipos.
3. **Qualidade:** 13 entradas vulneráveis atuais; o total histórico 30 não foi atribuído a esta implementação.
   A auditoria propõe migrações maiores/downgrades em parte das cadeias. Deepmerge publicado ainda está em 4.3.1;
   Router corrigido envolve a linha 7; glob/minimatch exigem triagem de compatibilidade com Workbox e ESLint.
   Não foi usado override de major nem audit fix --force. A dívida permanece aberta.
4. **Migrações:** executar [planos isolados](quality-migrations-2026-11-04.md) de React 19, Ant Design 6,
   Router 7 e eventuais upgrades do plugin PWA com peers e testes próprios. As branches de migração são propostas,
   não implementações existentes. A correção PWA atual não atualiza o plugin.
5. **Produto:** seguir [prioridades](product-priorities-2026-11-04.md) após os gates de beta: duplicação,
   onboarding/modelos, dashboard local, lote e compartilhamento. Não há implementação dessas features nesta entrega.
6. **Gitflow:** revisão/PR para develop, reconciliar main/develop e versão antes de release/\*; revalidar o SHA resultante.
   Main remoto consultado no diagnóstico estava em 0.3.0, enquanto esta base develop é 0.2.2; não houve bump artificial.

Android, Safari/iOS, modo escuro, teclado/contraste completos e seis tipos com progresso real em dispositivos:
**not run**. CI remota, auditoria npm nesta sessão, PR/revisão, merge, tag, GitHub Release e deployment também não foram
executados/confirmados. Não declarar beta pronto ou dívida quitada com base no resultado parcial desta entrega.
