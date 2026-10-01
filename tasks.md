# Tarefas do roadmap do Momentum

## Uso e critérios

Referências: [plan.md](./plan.md) e [specs.md](./specs.md). As caixas indicam cumprimento integral dos critérios.
A execução local das TASK-001 a TASK-005 foi autorizada em 01/10/2026. Na mesma data, commit e envio da branch
`fix/ci-release-dependencies` foram autorizados para continuidade no computador pessoal. Merge em main/develop, releases
e alterações de issues/PRs continuam fora do escopo.
Itens com validação ou integração pendente permanecem desmarcados.

- **P0:** bloqueio de integridade, integração ou aceitação do beta.
- **P1:** requisito de manutenção, experiência ou preparação do beta.
- **P2:** evolução após o beta.
- Dependências indicam tarefas que devem estar concluídas antes de encerrar o item. Investigação independente pode começar
  antes, mas não se deve marcar integração, validação ou publicação como concluída sem evidência.
- Registrar evidência de validação e distinguir integrado em develop de publicado. Fechamento de issue não é evidência
  suficiente; revisar estados remotos antes de executar tarefas baseadas no diagnóstico de 30/09/2026.

## Evidências da execução local — 01/10/2026 (America/Sao_Paulo)

### Ambiente e limites

- Worktree: `/Users/wilquintas/.codex/worktrees/tasks-001-005/momentum`, branch `fix/ci-release-dependencies`.
- Base: `origin/develop` em `2d586f8f5806fd1be00dd2bf4e94c9e701e5e621`.
- Main usada na reconciliação desta branch: `9a0776d69a64787172e8eccbecff460d043dc588`.
- As branches divergem (develop 19 commits à frente e 7 atrás de main); esses números não comprovam ausência de features,
  pois o histórico inclui squash. O conteúdo foi comparado separadamente.
- Referências atualizadas por SSH com `~/.ssh/id_ed25519_momentum`, `IdentitiesOnly=yes`.
- Node usado: 24.12.0, instalação existente compatível com o requisito Node >=24. Nenhum runtime ou pacote novo instalado.
- Checkout original preservado em `develop`; plan.md, specs.md e tasks.md originais continuam sem commit e sem alterações.
  As três cópias nesta worktree permitem registrar a execução e manter as referências documentais.
- A preparação inicial ocorreu sem commit ou push. O commit e envio desta branch foram posteriormente autorizados
  para transferência do trabalho, preservando as pendências de validação. Nenhuma issue, PR ou release alterada.
- Os hooks de commit e push chamam npx/npm. As verificações desta transferência usam Node diretamente; os hooks
  são desativados apenas nos comandos de commit/envio, preservando a configuração do repositório. A primeira tentativa
  de push acionou o hook por engano e falhou com tsc ausente; a tentativa corrigida não executa npm.

### Diagnóstico das bases e PRs (TASK-001)

| Fonte / revisão                                                           | Evidência                                                                                                                                                                                                           | Interpretação e limite                                                                                                 |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Main `9a0776d`                                                            | [CI de 14/05/2026](https://github.com/williamquintas/momentum/actions/runs/25862380048) passou; [Version Check](https://github.com/williamquintas/momentum/actions/runs/25862380054) falhou                         | Estado histórico dessa revisão; não representa auditoria atual nem validação desta worktree.                           |
| Develop `2d586f8`                                                         | [CI de 09/04/2026](https://github.com/williamquintas/momentum/actions/runs/24166788707) passou; [Version Check](https://github.com/williamquintas/momentum/actions/runs/24166788713) falhou                         | Mesma distinção: sucesso antigo não comprova segurança ou testes atuais.                                               |
| [PR #124](https://github.com/williamquintas/momentum/pull/124), `4e4b790` | [CI](https://github.com/williamquintas/momentum/actions/runs/34247547588): build, testes, tipos/lint verdes; auditoria falhou; [versão falhou](https://github.com/williamquintas/momentum/actions/runs/34247547594) | Router 6.30.6 substitui a proposta 6.30.4 da #117. Integração e encerramento das PRs não executados.                   |
| [PR #125](https://github.com/williamquintas/momentum/pull/125), `55cc079` | [CI](https://github.com/williamquintas/momentum/actions/runs/34414247606): build, testes, tipos/lint verdes; auditoria falhou; [versão falhou](https://github.com/williamquintas/momentum/actions/runs/34414247551) | Família Vitest 4.1.11 candidata ao lote de ferramentas; ainda sem validação nesta base reconciliada.                   |
| [PR #128](https://github.com/williamquintas/momentum/pull/128), `79567c2` | [CI de 13/09/2026](https://github.com/williamquintas/momentum/actions/runs/34755822657): build, testes, tipos/lint verdes; auditoria registrou 21 vulnerabilidades, 10 altas                                        | Alterar js-yaml isoladamente não eliminou a auditoria obrigatória. O total é histórico, não uma auditoria local atual. |
| [PR #129](https://github.com/williamquintas/momentum/pull/129), `78d2327` | [Logs de 21/09/2026](https://github.com/williamquintas/momentum/actions/runs/35582634407): npm ci falha com ERESOLVE; TypeScript 7.0.2 contra peer >=4.8.4 <6.1.0 de @typescript-eslint/eslint-plugin 8.70.0        | Regressão específica do grupo misto: os jobs param na instalação, antes de testar, compilar ou auditar a aplicação.    |
| [PR #93](https://github.com/williamquintas/momentum/pull/93), `f4ff87f`   | [Checks](https://github.com/williamquintas/momentum/actions/runs/26048289244) registram falhas de build, testes, tipos/lint e auditoria                                                                             | Logs expirados (HTTP 410 na investigação anterior); causa detalhada não comprovada, reprodução local pendente.         |

O [log da regra de versão](https://github.com/williamquintas/momentum/actions/runs/35582634385) confirma
`Tag v0.2.2 already exists`. A regra antiga consultava tags em toda PR de manutenção. Esse bloqueio é independente do lote
TypeScript 7 da #129. Os checks verdes das PRs menores não comprovam que todos os achados de auditoria são regressões dessas
PRs; a atribuição atual depende de auditoria comparativa da base, indisponível nesta execução.

### Política de versão e release (TASK-002)

- `scripts/check-version.js` separa manutenção, preparação de release e release por tag; valida SemVer e as versões do lockfile.
- Manutenção permite a versão já publicada sem consultar tags. Preparação de release exige que a tag remota exata esteja
  ausente; uma falha na consulta interrompe o fluxo. Release por tag exige correspondência com o manifesto.
- O workflow prepara a versão sem tag/commit; valida colisão antes dessas operações; gera changelog sem bump/commit/tag;
  posteriormente cria uma única tag sobre o commit da versão e prevê push atômico das referências.
- Corrigidas referências preexistentes a outputs: `steps.<id>.outputs.<nome>`.
- Dez testes Node passaram: SemVer válido/inválido, versões divergentes, manutenção sem consulta remota, tag existente
  simples/anotada, tag ausente, falha de consulta, tag incompatível, modo inválido e retorno da CLI.
- A CLI também foi validada por consulta SSH real: modo manutenção aceita 0.2.2, modo tag aceita v0.2.2 e modo release
  rejeita a tag remota existente. Nenhuma tag foi criada ou alterada.
- Os workflows foram inspecionados localmente; nenhuma release ou execução remota disparada.

### Bloqueio e lotes pendentes (TASK-003)

Duas tentativas de consultar `vite@6.4.3`, com Node 24 e cache temporário, falharam com
`ENOTFOUND registry.npmjs.org`, tanto no sandbox quanto fora dele. Seguindo o plano, interrompidos os lotes dependentes de
instalação. **Não executados** npm ci, auditoria atual, tipos/lint da aplicação, suíte Vitest ou build nesta worktree.
Não reutilizar o node_modules do checkout antigo como prova da base atual.

O usuário esclareceu que o npm global está desabilitado por segurança e que o npm do Meli não pode ser usado aqui.
As tentativas anteriores usaram o executável da instalação nvm, mas não comprovaram isolamento da configuração corporativa.
As tentativas diretas foram interrompidas após essa orientação. Durante a transferência, o hook pre-push foi acionado
por engano e executou npm run type-check, que falhou por tsc ausente; o envio foi corrigido para não executar esse hook.
A retomada exige identificar um npm pessoal aprovado, separado do ambiente Meli, além de acesso ao registro; não reativar
o npm global nem contornar a política de segurança.

Sequência de retomada quando o registro estiver acessível:

1. Router 6.30.6 da #124; verificar a sobreposição com #117 e manter ambas abertas até integração validada.
2. Correções transitivas compatíveis: #120 brace-expansion, #121 fast-uri, #122 nanoid, #123 browserslist,
   #127 baseline-browser-mapping, #128 js-yaml e #115 postcss; revisar sobreposições antes de adotar cada PR.
3. Família Vitest 4.1.11 da #125, preservando versões acopladas de runner, UI, cobertura e mocker.
4. Vite 6 corrigido (>=6.4.3), Sharp >=0.35.4 da #126 e a menor versão Axios 1.x que elimine os achados obrigatórios;
   reavaliar demais achados com a auditoria atual. Ver [advisory do Vite](https://github.com/vitejs/vite/security/advisories/GHSA-fx2h-pf6j-xcff)
   e [advisory do Sharp](https://github.com/lovell/sharp/security/advisories/GHSA-rgj7-g3m4-5g8c).

Manifesto/lockfile mudaram nesta execução apenas para reconciliar alterações já existentes de main/develop.
Não adotados os novos lotes de segurança, não criado um lockfile sintético e não relaxado o gate de altas/críticas.
Migrações maiores de #93/#129 ficam separadas: React 19, Ant Design 6, Router 7, Zod 4, Zustand 5, TypeScript 7 e outras
migrações principais de ferramentas. A lista e o procedimento estão em [dependency-maintenance.md](./docs/dependency-maintenance.md).

### Reconciliação e manutenção automática (TASK-004 e TASK-005)

- Reconciliação com conflitos resolvidos em package.json/package-lock.json: Axios 1.15.2 de main, i18next 26.0.4,
  Vitest 4.1.3 e esbuild 0.28 de develop; preservadas as demais atualizações transitivas existentes de main.
- Comparação estática: todos os intervalos de dependências diretas preservam a versão mínima mais recente das duas branches;
  as versões diretas do lockfile satisfazem o manifesto. Isso não equivale a instalação limpa ou validação de peers.
- Produto: src/ e specs/ existentes permanecem idênticos a origin/develop; nenhuma funcionalidade removida ou implementada.
- Dependabot: atualizações ordinárias em develop; grupos patch/minor; famílias Vitest e TypeScript ESLint próprias; majors
  individuais; entrada separada de segurança na branch padrão, sem alterar responsáveis, labels ou agenda.
- Sintaxe YAML dos quatro arquivos alterados, referências a outputs e sintaxe Bash dos passos validadas. Formatação dos arquivos alterados conferida, sem formatar o projeto inteiro.
- Para YAML, formatação e comparação SemVer foram usadas ferramentas já disponíveis no checkout original, apenas como
  utilitários; elas não validam dependências ou runtime da aplicação nesta worktree.
- TASK-004 não encerrada: depende da TASK-003 e dos checks obrigatórios da base final. TASK-005 não encerrada: depende da
  TASK-004 e de confirmar PRs futuras após publicação autorizada. Commit e envio da branch foram autorizados para transferência do trabalho; isso não encerra os critérios pendentes.

## Agora — base confiável

### TASK-001 — Diagnosticar os bloqueios de CI

- [x] Concluir TASK-001.
- **Estado em 01/10/2026:** diagnóstico atualizado concluído; lacunas de reprodução local explicitadas abaixo.
- **Prioridade / especificação:** P0 / SPEC-01.
- **Dependências:** nenhuma.
- **Resultado esperado:** relatório atualizado das falhas de auditoria, versão, testes, tipos/lint e build, distinguindo
  problemas da base de regressões das PRs. Mapear correções compatíveis e migrações de versões principais.
- **Validação:** comparar verificações da base e das PRs relevantes; registrar causas com logs/links, sem supor que um
  check verde antigo comprova o estado atual.

### TASK-002 — Corrigir a regra de versão e release

- [ ] Concluir TASK-002.
- **Estado em 01/10/2026:** correção local implementada e política de versão validada em 10 testes; execução do workflow no GitHub pendente.
- **Prioridade / especificação:** P0 / SPEC-01.
- **Dependências:** TASK-001.
- **Resultado esperado:** existência da tag atual não bloqueia manutenção; preparação de release rejeita tag conflitante.
- **Validação:** PR de manutenção sem bump passa; versão inválida e tentativa de release com tag existente falham.

### TASK-003 — Integrar atualizações compatíveis e resolver auditoria

- [ ] Concluir TASK-003.
- **Estado em 01/10/2026:** bloqueada: npm pessoal aprovado ainda não identificado e acesso ao registro falhou; nenhum lote novo de dependências adotado ou declarado validado.
- **Prioridade / especificação:** P0 / SPEC-01.
- **Dependências:** TASK-001 e TASK-002.
- **Resultado esperado:** correções dos achados obrigatórios em pequenos lotes, preservando manifest/lockfile; adotar #124
  e encerrar #117 somente após validação. Substituir grupos #93/#129 e registrar migrações maiores separadamente.
- **Validação:** instalação limpa e verificações obrigatórias verdes em cada lote; sem desativar auditoria, ignorar erros
  de instalação ou presumir que todas as PRs menores são necessárias após resolver sobreposições.

### TASK-004 — Reconciliar main em develop

- [ ] Concluir TASK-004.
- **Estado em 01/10/2026:** merge local preparado, conflitos resolvidos e comparação estática aprovada; dependência TASK-003 e validação da aplicação pendentes.
- **Prioridade / especificação:** P0 / SPEC-02.
- **Dependências:** TASK-003.
- **Resultado esperado:** base de integração reconciliada, preservando correções recentes de main e funcionalidades de
  develop. Não reintroduzir versões antigas de dependências ao resolver conflitos.
- **Validação:** comparar conteúdo final com ambas as branches; executar verificações obrigatórias na base reconciliada.

### TASK-005 — Organizar manutenção automática

- [ ] Concluir TASK-005.
- **Estado em 01/10/2026:** configuração e fluxo documentados, YAML validado; depende da TASK-004 e da observação de PRs futuras após publicação.
- **Prioridade / especificação:** P1 / SPEC-01.
- **Dependências:** TASK-004.
- **Resultado esperado:** atualizações compatíveis agrupadas, migrações de versão principal separadas e fluxo de
  integração documentado; considerar separadamente updates de segurança destinados à branch padrão.
- **Validação:** revisar a configuração e confirmar que PRs futuras mantêm grupos compatíveis e verificações obrigatórias.

### TASK-006 — Corrigir o caminho de restauração

- [ ] Concluir TASK-006.
- **Prioridade / especificação:** P0 / SPEC-03.
- **Dependências:** TASK-004.
- **Resultado esperado:** restauração preserva notas, histórico, estados, datas, metadados e relações, em vez de aplicar
  defaults de criação. Estratégias de duplicidades são respeitadas e erros parciais são informados.
- **Validação:** regressões de importação em armazenamento vazio e existente, arquivos inválidos, referências e dados
  antigos; preservar metas não afetadas e compatibilidade com backups suportados.

### TASK-007 — Comprovar preservação por backup

- [ ] Concluir TASK-007.
- **Prioridade / especificação:** P0 / SPEC-03.
- **Dependências:** TASK-006.
- **Resultado esperado:** matriz de exportação/restauração dos seis tipos com notas, histórico, relações, estados e datas.
- **Validação:** comparação semântica antes/depois, IDs ou remapeamento consistente, duplicidades e falhas parciais; registrar
  que metadados de anexos não equivalem a backup de arquivos binários.

### TASK-008 — Triar e alinhar o backlog

- [ ] Concluir TASK-008.
- **Prioridade / especificação:** P1 / SPEC-02.
- **Dependências:** TASK-004.
- **Resultado esperado:** decidir destino dos itens stale com base no código; esclarecer #16, separar anexos de #13,
  proteger itens do roadmap de encerramento automático e revisar o milestone 0.2.0.
- **Validação:** cada decisão aponta evidência e estado correto; nenhuma issue é marcada concluída apenas por estar fechada.

### TASK-009 — Atualizar documentação histórica

- [ ] Concluir TASK-009.
- **Prioridade / especificação:** P1 / SPEC-02.
- **Dependências:** TASK-008.
- **Resultado esperado:** ROADMAP, índice de especificações e instruções de ambiente refletem código e entregas; distinguir
  documento completo de funcionalidade implementada, corrigir Node e armazenamento descritos quando divergentes.
- **Validação:** cruzar documentação, manifest, serviços e PRs/releases; preservar fontes históricas claramente identificadas.

## Próximo — beta com seis tipos

### TASK-010 — Consolidar metas quantitativas

- [ ] Concluir TASK-010.
- **Prioridade / especificação:** P0 / SPEC-04.
- **Dependências:** TASK-004 e TASK-007.
- **Resultado esperado:** opção de superação do alvo disponível na criação/edição e coerente com progresso e conclusão (#19).
- **Validação:** abaixo, no e acima do alvo, opção ativada/desativada, recarga, histórico e backup.

### TASK-011 — Consolidar metas binárias

- [ ] Concluir TASK-011.
- **Prioridade / especificação:** P0 / SPEC-04.
- **Dependências:** TASK-004 e TASK-007.
- **Resultado esperado:** contagem/checklist, edição, histórico e conclusão coerentes com o modelo atual.
- **Validação:** iniciar, atualizar, desmarcar/corrigir, alcançar limite, concluir, recarregar e restaurar.

### TASK-012 — Consolidar metas qualitativas

- [ ] Concluir TASK-012.
- **Prioridade / especificação:** P0 / SPEC-04.
- **Dependências:** TASK-004 e TASK-007.
- **Resultado esperado:** registrar avaliações de 1 a 10 com nota opcional, consultar histórico e manter o cálculo existente
  relativo à média e alvo configurado (#20).
- **Validação:** limites de avaliação, múltiplos registros, ausência/presença de alvo, recarga e backup.

### TASK-013 — Consolidar metas de marcos

- [ ] Concluir TASK-013.
- **Prioridade / especificação:** P0 / SPEC-04.
- **Dependências:** TASK-004 e TASK-007.
- **Resultado esperado:** gerenciamento da especificação 007, dependências coerentes e progresso baseado nas realizações.
- **Validação:** criar/editar marcos, concluir na ordem permitida, rejeitar ciclos e bloqueios, preservar registros em edição,
  recarga e restauração.

### TASK-014 — Consolidar metas recorrentes

- [ ] Concluir TASK-014.
- **Prioridade / especificação:** P0 / SPEC-04.
- **Dependências:** TASK-004 e TASK-007.
- **Resultado esperado:** ocorrências materializadas pela configuração, alteração de conclusão e recálculo de estatísticas
  e progresso conforme a especificação 008.
- **Validação:** frequências suportadas, virada de dia/mês, correção de ocorrência, registros sucessivos legítimos, recarga e
  backup; controlar relógio e considerar calendário local.

### TASK-015 — Consolidar hábitos

- [ ] Concluir TASK-015.
- **Prioridade / especificação:** P0 / SPEC-04.
- **Dependências:** TASK-004 e TASK-007.
- **Resultado esperado:** registros diários corrigíveis, sem duplicidades do mesmo dia, com estatísticas e sequências
  recalculadas conforme a especificação 009.
- **Validação:** frequência suportada, virada de dia e horário de verão, correção de registro, sequência interrompida,
  atualizações sucessivas legítimas, recarga e backup.

### TASK-016 — Habilitar os seis tipos no beta

- [ ] Concluir TASK-016.
- **Prioridade / especificação:** P0 / SPEC-04.
- **Dependências:** TASK-010, TASK-011, TASK-012, TASK-013, TASK-014 e TASK-015.
- **Resultado esperado:** seis tipos disponíveis na configuração do beta, com flags coerentes e leitura de metas existentes
  preservada quando uma opção muda.
- **Validação:** opções de criação/filtro e leitura dos seis tipos; configuração quantitativa exclusiva, se mantida, não
  desabilita a própria meta quantitativa.

### TASK-017 — Atualizar progresso pela lista

- [ ] Concluir TASK-017.
- **Prioridade / especificação:** P1 / SPEC-05.
- **Dependências:** TASK-010, TASK-011, TASK-012, TASK-013, TASK-014 e TASK-015.
- **Resultado esperado:** recuperar a proposta da #87 para #16, cobrindo os seis tipos sem exigir visita ao detalhe; usar
  validação e serviços existentes, carregando a meta quando faltar cache de detalhe.
- **Validação:** abrir diretamente lista/cartões e registrar cada tipo; histórico, conclusão e caches coerentes; erros sem
  falso sucesso e ação sem navegação involuntária.

### TASK-018 — Resolver o fluxo mobile

- [ ] Concluir TASK-018.
- **Prioridade / especificação:** P1 / SPEC-05.
- **Dependências:** TASK-017.
- **Resultado esperado:** tabela/cartões com ações essenciais acessíveis, alvos de toque de 44 px ou mais e overflow da
  tabela restrito ao seu contêiner (#9).
- **Validação:** 320, 375 e 768 px, desktop e teclado; criação e atualização sem conteúdo ou ações inacessíveis.

### TASK-019 — Validar notas na base reconciliada

- [ ] Concluir TASK-019.
- **Prioridade / especificação:** P1 / SPEC-06.
- **Dependências:** TASK-004 e TASK-007.
- **Resultado esperado:** implementação da #86 preserva CRUD, tags, datas, limite do editor e reversão em falhas.
- **Validação:** criar/editar/excluir, limite de 5.000 caracteres, falha de armazenamento, recarga e exportação/restauração de
  notas; editor em desktop/mobile.

### TASK-020 — Integrar a entrega de notas em main

- [ ] Concluir TASK-020.
- **Prioridade / especificação:** P1 / SPEC-06 e SPEC-02.
- **Dependências:** TASK-019.
- **Resultado esperado:** notas presentes na base main por integração revisável; anexos separados e #13 associada à entrega
  de notas. Registrar integrado em main sem confundir com deployment ou release publicados.
- **Validação:** diff, verificações obrigatórias e disponibilidade na base de release; comprovação de publicação ocorre em
  TASK-025.

### TASK-021 — Preparar orientação e informações do beta

- [ ] Concluir TASK-021.
- **Prioridade / especificação:** P1 / SPEC-07.
- **Dependências:** TASK-018 e TASK-020.
- **Resultado esperado:** orientação inicial curta, ajuda, suporte existente, informação sobre dados locais/backup,
  privacidade e atribuições; considerar propostas #72, #73, #75 e #77 sem prometer funções inexistentes.
- **Validação:** conteúdo corresponde ao comportamento observado e permite criar a primeira meta, proteger dados e relatar
  problema em português e inglês; links funcionam.

### TASK-022 — Consolidar preferências e acessibilidade

- [ ] Concluir TASK-022.
- **Prioridade / especificação:** P1 / SPEC-07.
- **Dependências:** TASK-018.
- **Resultado esperado:** animação configurável e persistida, movimento reduzido do sistema respeitado e som desativado por
  padrão; preferência de som caso o mecanismo esteja disponível (#81).
- **Validação:** teclado, foco, rótulos acessíveis, movimento reduzido, preferências após recarga e mensagens em português e
  inglês.

### TASK-023 — Validar a PWA para o beta

- [ ] Concluir TASK-023.
- **Prioridade / especificação:** P1 / SPEC-07.
- **Dependências:** TASK-016, TASK-018 e TASK-020.
- **Resultado esperado:** instalação, acompanhamento offline e atualização com dados e mudanças não salvas preservados.
- **Validação:** registrar matriz com Chrome desktop/Android e Safari iOS; testar recursos suportados e informar limitações,
  sem exigir suporte inexistente de uma plataforma.

### TASK-024 — Validar o beta integrado

- [ ] Concluir TASK-024.
- **Prioridade / especificação:** P0 / SPEC-01, SPEC-02, SPEC-03, SPEC-04, SPEC-05, SPEC-06 e SPEC-07.
- **Dependências:** TASK-005, TASK-009, TASK-016, TASK-018, TASK-020, TASK-021, TASK-022 e TASK-023.
- **Resultado esperado:** evidência de todos os critérios obrigatórios, sem pendências de integridade ou fluxos dos seis
  tipos; registro claro de riscos e limitações verificadas.
- **Validação:** instalação limpa, verificações obrigatórias, matriz dos seis tipos, backup, mobile, teclado, idiomas e PWA;
  revalidar o candidato após qualquer integração que altere seu conteúdo.

### TASK-025 — Preparar e publicar o beta

- [ ] Concluir TASK-025.
- **Prioridade / especificação:** P1 / SPEC-01, SPEC-02 e SPEC-07.
- **Dependências:** TASK-024.
- **Resultado esperado:** candidato versionado, changelog e instruções de backup/feedback preparados; publicação executada
  apenas no contexto de autorização futura correspondente.
- **Validação:** confirmar versão/tag e artefato publicados, validar jornada essencial no ambiente publicado e atualizar
  estado das entregas com evidência. Merge ou build isolado não comprova deployment.

## Depois — produtividade e evolução

### TASK-026 — Implementar ações em lote iniciais

- [ ] Concluir TASK-026.
- **Prioridade / especificação:** P2 / SPEC-08.
- **Dependências:** TASK-025.
- **Resultado esperado:** seleção em tabela/cartões para arquivar, desarquivar e excluir, com confirmação e resultado por
  item; serviços locais e escopo de seleção explícito (#28).
- **Validação:** conjunto exibido, limpar seleção, confirmação/cancelamento, falha parcial e repetição dos itens pendentes;
  sem atingir metas ocultas ou adicionar progresso em lote nesta entrega.

### TASK-027 — Implementar duplicação de metas

- [ ] Concluir TASK-027.
- **Prioridade / especificação:** P2 / SPEC-09.
- **Dependências:** TASK-025.
- **Resultado esperado:** criação revisável preenchida, nova identidade, progresso reiniciado e dependências internas
  remapeadas; manter a original intacta (#22).
- **Validação:** seis tipos, cancelamento, edição independente, ausência de histórico/notas/realizações copiadas e
  dependências válidas entre marcos.

### TASK-028 — Implementar dashboard pessoal local

- [ ] Concluir TASK-028.
- **Prioridade / especificação:** P2 / SPEC-10.
- **Dependências:** TASK-025.
- **Resultado esperado:** visão de metas ativas, vencidas, conclusões e evolução, com período e critérios visíveis; sem
  telemetria de produto ou envio de conteúdo (#46).
- **Validação:** coleção controlada, métricas corretas, vazio versus zero, arquivadas, filtros e alternativa textual para
  gráficos; nenhum novo envio de dados provocado pela funcionalidade.

### TASK-029 — Implementar onboarding e modelos

- [ ] Concluir TASK-029.
- **Prioridade / especificação:** P2 / SPEC-11.
- **Dependências:** TASK-025.
- **Resultado esperado:** orientação opcional, pulável e reexecutável, com modelos revisáveis antes de salvar (#76).
- **Validação:** pular, reexecutar, cancelar modelo e confirmar sem criar metas duplicadas; teclado e idiomas.

### TASK-030 — Implementar compartilhamento inicial

- [ ] Concluir TASK-030.
- **Prioridade / especificação:** P2 / SPEC-11 e SPEC-03.
- **Dependências:** TASK-025.
- **Resultado esperado:** cartão com prévia e conteúdo escolhido, compartilhamento nativo quando suportado e download
  alternativo; transferência por exportação validada (#80 e parte da #71).
- **Validação:** conteúdo corresponde à prévia, notas privadas não entram por padrão, cancelamento não compartilha e
  download funciona sem suporte nativo; transferência mantém dados. QR e links públicos ficam fora desta entrega.

## Itens sem execução nesta versão do backlog

Anexos, contas/sincronização, biometria, colaboração, gamificação, telemetria do produto e infraestrutura Cloudflare ampla
estão adiados. Não são dependências do beta. Migrações maiores identificadas em TASK-003 exigem backlog separado antes de
execução; não estão implicitamente aprovadas por este documento.
