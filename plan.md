# Roadmap do Momentum: Agora / Próximo / Depois

## Objetivo e limites

Preparar um beta público confiável para uso pessoal e diário, mantendo os dados no navegador e disponibilizando os seis
tipos de meta: quantitativa, binária, qualitativa, marcos, recorrente e hábito.

As decisões de produto são: organizar o roadmap por etapas, sem datas de entrega presumidas, e incluir todos os tipos no
próximo beta. Habilitar flags sem validar os fluxos completos não atende ao objetivo.

A entrega documental inicial, definida em 30/09/2026, contém o planejamento em [plan.md](./plan.md),
[specs.md](./specs.md) e [tasks.md](./tasks.md). Em 01/10/2026, o usuário autorizou a execução local das TASK-001 a TASK-005
na branch `fix/ci-release-dependencies` e, posteriormente, commit e envio dessa branch para continuar no computador pessoal.
As evidências e pendências estão em tasks.md. Esse envio não encerra tarefas sem validação nem autoriza merge em main/develop,
publicação de releases ou alterações de issues/PRs.

## Diagnóstico de 30/09/2026

O diagnóstico abaixo corresponde à consulta feita durante a análise do roadmap. Não representa uma nova verificação a cada
leitura deste arquivo.

| Evidência                                                                                                                        | Estado observado                                                | Implicação                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [Issues](https://github.com/williamquintas/momentum/issues)                                                                      | 4 abertas; 17 issues com label `stale`                          | Triar propostas encerradas por inatividade; fechamento não comprova implementação.                                |
| [PRs](https://github.com/williamquintas/momentum/pulls)                                                                          | 13 abertas, todas de dependências                               | Recuperar a manutenção antes de expandir o produto.                                                               |
| [Release v0.2.2](https://github.com/williamquintas/momentum/releases/tag/v0.2.2)                                                 | Última release publicada consultada                             | Usar como referência de entrega publicada, sem presumir o estado do deployment atual.                             |
| [Comparação main/develop](https://github.com/williamquintas/momentum/compare/main...develop)                                     | Branches divergentes; checkout local anterior ao estado remoto  | Reconciliar conteúdo preservando correções recentes; contagem de commits não equivale a funcionalidades ausentes. |
| [PR #86](https://github.com/williamquintas/momentum/pull/86) / [issue #13](https://github.com/williamquintas/momentum/issues/13) | Notas integradas em `develop`, ausentes em `main`; issue aberta | Validar e publicar o trabalho existente; separar anexos.                                                          |
| [PR #87](https://github.com/williamquintas/momentum/pull/87) / [issue #16](https://github.com/williamquintas/momentum/issues/16) | Atualização rápida proposta; PR fechada sem merge               | Recuperar a proposta e ampliar a cobertura para os seis tipos.                                                    |

### Publicado, integrado e pendente

- **Integrado em main e associado a releases publicadas:** favoritos, arquivamento, progresso, PWA, traduções,
  importação/exportação e notificações de release. A existência dessas funções não comprova ausência de defeitos.
- **Integrado somente em develop:** notas e melhorias visuais das PRs #86 e #85. Exigem validação na base reconciliada.
- **Pendente:** atualização pela lista, aceitação mobile da #9, ações em lote da #28 e liberação validada dos tipos avançados.
- **Encerrado por inatividade:** propostas como avaliações qualitativas, duplicação e dashboard precisam ser confrontadas
  com o código atual antes de definir seu destino.

### Bloqueios técnicos observados

- As 13 PRs abertas falham em `Security Audit` e `Version Consistency Check`. Os grupos #93 e #129 também falham em testes,
  build e verificação de tipos/lint. O último CI de push consultado em cada branch principal passou em abril/maio; esse
  resultado histórico não substitui validação atual.
- A verificação de versão rejeita a existência da tag da versão atual, mesmo em PRs de manutenção.
- O caminho de importação de metas novas chama uma criação que redefine notas e anexos como arrays vazios. A leitura
  estática indica perda de conteúdo restaurado e exige teste de regressão.
- Hábitos e recorrências calculam progresso usando estatísticas que não são recalculadas no caminho de atualização
  inspecionado. Ocorrências, registros e estatísticas devem permanecer coerentes.
- Marcos, recorrências e hábitos estão desativados por padrão no código remoto consultado. O ambiente publicado não foi
  inspecionado.

## Agora — recuperar uma base confiável

| Ordem | Prioridade | Entrega                                                                        | Especificações | Tarefas             |
| ----- | ---------- | ------------------------------------------------------------------------------ | -------------- | ------------------- |
| 1     | P0         | Diagnosticar CI, corrigir regra de versão e atualizar dependências compatíveis | SPEC-01        | TASK-001 a TASK-003 |
| 2     | P0         | Reconciliar `main` em `develop`, preservando correções recentes                | SPEC-02        | TASK-004            |
| 3     | P1         | Organizar manutenção automática e separar migrações de versões principais      | SPEC-01        | TASK-005            |
| 4     | P0         | Corrigir restauração e comprovar preservação de dados                          | SPEC-03        | TASK-006 e TASK-007 |
| 5     | P1         | Alinhar backlog e documentação com o estado real das entregas                  | SPEC-02        | TASK-008 e TASK-009 |

### Encaminhamento das PRs abertas

| PRs                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Encaminhamento futuro                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#93](https://github.com/williamquintas/momentum/pull/93) e [#129](https://github.com/williamquintas/momentum/pull/129)                                                                                                                                                                                                                                                                                                                                                                                                                                              | Substituir grandes grupos por atualizações compatíveis menores; separar migrações de React, Ant Design, Router, Zod, TypeScript e ferramentas de build. |
| [#124](https://github.com/williamquintas/momentum/pull/124)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Adotar como atualização do Router 6; inclui versões mais recentes que a #117.                                                                           |
| [#117](https://github.com/williamquintas/momentum/pull/117)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Encerrar como substituída somente após integrar e validar a #124.                                                                                       |
| [#115](https://github.com/williamquintas/momentum/pull/115), [#120](https://github.com/williamquintas/momentum/pull/120), [#121](https://github.com/williamquintas/momentum/pull/121), [#122](https://github.com/williamquintas/momentum/pull/122), [#123](https://github.com/williamquintas/momentum/pull/123), [#125](https://github.com/williamquintas/momentum/pull/125), [#126](https://github.com/williamquintas/momentum/pull/126), [#127](https://github.com/williamquintas/momentum/pull/127) e [#128](https://github.com/williamquintas/momentum/pull/128) | Integrar em pequenos lotes, priorizando achados da auditoria e verificando sobreposição entre atualizações.                                             |

**Passagem para Próximo:** base reconciliada, instalação reproduzível, verificações obrigatórias verdes, regressão de
restauração passando e backlog alinhado. A auditoria de segurança permanece obrigatória.

## Próximo — beta com os seis tipos

| Prioridade | Entrega                                                         | Especificações             | Tarefas             |
| ---------- | --------------------------------------------------------------- | -------------------------- | ------------------- |
| P0         | Consolidar cada tipo e habilitar os seis no beta                | SPEC-04                    | TASK-010 a TASK-016 |
| P1         | Atualizar progresso pela lista e resolver o uso mobile          | SPEC-05                    | TASK-017 e TASK-018 |
| P1         | Validar notas existentes e integrar sua entrega em main         | SPEC-06                    | TASK-019 e TASK-020 |
| P1         | Orientação inicial, ajuda, armazenamento local e acessibilidade | SPEC-07                    | TASK-021 e TASK-022 |
| P1         | Validar instalação, modo offline e atualização da PWA           | SPEC-07                    | TASK-023            |
| P0         | Validar o beta de forma integrada                               | SPEC-01 a SPEC-07          | TASK-024            |
| P1         | Preparar e publicar a release após cumprir os critérios         | SPEC-01, SPEC-02 e SPEC-07 | TASK-025            |

A atualização rápida deverá reutilizar as regras existentes e funcionar sem navegação prévia ao detalhe. As propostas
#19 e #20 entram como lacunas dos tipos quantitativo e qualitativo. As especificações existentes 007, 008 e 009 orientam
marcos, recorrências e hábitos, sem considerar documentação equivalente a implementação.

**Passagem para Depois:** seis tipos utilizáveis, notas preservadas em backup, fluxo mobile acessível, PWA validada,
verificações obrigatórias verdes e beta publicado com instruções para backup e relato de problemas.

## Depois — produtividade e evolução

| Ordem | Prioridade | Entrega                                                    | Especificações | Tarefas  |
| ----- | ---------- | ---------------------------------------------------------- | -------------- | -------- |
| 1     | P2         | Ações em lote: arquivar, desarquivar e excluir             | SPEC-08        | TASK-026 |
| 2     | P2         | Duplicação como nova meta, com progresso reiniciado        | SPEC-09        | TASK-027 |
| 3     | P2         | Dashboard pessoal com cálculos locais                      | SPEC-10        | TASK-028 |
| 4     | P2         | Onboarding e modelos para a primeira meta                  | SPEC-11        | TASK-029 |
| 5     | P2         | Cartões de compartilhamento e transferência por exportação | SPEC-11        | TASK-030 |

As referências principais são #28, #22, #46, #76, #80 e #71. Nenhuma funcionalidade desta etapa bloqueia o beta.

### Melhorias adiadas

- Anexos: separados de notas; exigem definição própria de capacidade, armazenamento e recuperação.
- Contas, sincronização, biometria (#78), colaboração e gamificação (#79): fora dos requisitos do beta local.
- Telemetria do produto: separada do dashboard pessoal; não coletar eventos ou conteúdo de metas como efeito dessa entrega.
- Infraestrutura ampla (#47): priorizar deployment e previews reproduzíveis com a infraestrutura existente; KV, R2,
  Durable Objects e Terraform dependem de necessidades futuras concretas.
- QR codes (#71): não são requisito do primeiro compartilhamento; exportação já oferece a base de portabilidade.
- Botão flutuante mobile (#70) e contato (#74): revisar após resolver o fluxo mobile e aproveitar canais de suporte existentes.

## Critérios de evidência e validação

P0 indica bloqueio de integridade ou do beta; P1 indica requisito de experiência ou preparação do beta; P2 indica evolução
posterior. Dependências são pré-requisitos de conclusão, não proibição de investigação paralela.

A entrega futura exige testes dos seis tipos, restauração, duplicidades, limites de calendário, dependências entre marcos,
mobile, teclado, movimento reduzido, português/inglês e PWA. As tarefas detalham a evidência exigida.

O diagnóstico foi baseado em inspeção estática e verificações remotas do GitHub. Não houve reprodução em navegador,
teste local da aplicação ou inspeção do deployment publicado. Esta criação documental valida somente os três documentos.

O repositório é externo ao Melisource. Em operações Git futuras, usar `~/.ssh/id_ed25519_momentum`; a API do GitHub usa
autenticação HTTPS própria. Não registrar credenciais nos documentos.
