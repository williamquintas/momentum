# Comitê de produto e integridade — 04/11/2026

Base: `546307dcc0057e88a72338cfa70faf5dda298b81`. Revisão estática pelo `momentum-domain-reviewer`,
persistida pela coordenação. Nenhum dado pessoal acessado e nenhuma alteração de runtime.

## Prioridade imediata: TASK-006/007, SPEC-03

Restauração segura precede aceitação do beta e funcionalidades P2. Separar restauração dos defaults de criação.
Os achados abaixo são confirmados por leitura do fluxo, sem reprodução em runtime.
Perda de dados no backup é tratada como bloqueio P0 da aceitação, independentemente da severidade de cada defeito.

| Achado                                                   | Gatilho e efeito                                                                                                                                              | Fonte                                                                                             |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| P1: novas metas restauradas perdem identidade e conteúdo | Backup com duas metas relacionadas e notas em armazenamento vazio: novos IDs, notas/anexos vazios, progresso zero, datas novas e relações antigas sem destino | `dataImportService.ts:396` → `goalStorageService.ts:340–348`                                      |
| P1: estatísticas descartadas                             | Schema não declara `completionStats`/`habitStrength`; parse remove campos. Atualização de hábito/recorrente pode lançar ao ler estatísticas ausentes          | `dataImportService.ts:56–201,237`; `goal.types.ts:244,255`; `UpdateProgressModal.tsx:502,521–525` |
| P1: dados/índices sem atomicidade                        | Falha na segunda das seis gravações deixa índice com ID sem dados; falhas posteriores podem divergir filtros. Catch apenas relança                            | `goalStorageService.ts:314–319`                                                                   |
| P2: substituir ignora backup antigo                      | Comparação de datas ocorre antes da estratégia `replace`, impedindo recuperação de versão anterior                                                            | `dataImportService.ts:382–392`                                                                    |

Paths dos serviços: `src/services/storage/`; tipos: `src/types/goal.types.ts`; modal em
`src/features/goals/components/UpdateProgressModal/UpdateProgressModal.tsx`.

Primeiro patch proposto: `fix/backup-restore-integrity`, de `develop` para `develop`.
Ownership: importação, persistência dedicada, serialização/tipos e testes em `src/services/storage/__tests__/`.

Critérios de aceitação:

- Exportar → restaurar → reler → reexportar preserva dados dos seis tipos, notas, histórico, estados, datas,
  estatísticas, relações e metadados disponíveis.
- Preservar IDs ou remapear com mapa único, incluindo relações e dependências de marcos.
- Verificar `skip`, `latest-wins` e `replace` com backups anteriores, iguais e posteriores.
- Validar versão, datas, referências e estrutura por tipo antes de escrever.
- Injetar falha em cada posição da gravação: armazenamento recuperável, índices coerentes e resultado verdadeiro.
- Manter metas não afetadas e testar repetição da importação sem duplicação inesperada.
- Usar storage sintético sem mockar a persistência que descarta dados; o teste atual mocka `createGoal`/`updateGoal`
  em `dataImportService.test.ts:27–33`.
- Preservação de metadados de anexos não promete backup de arquivos binários.

## Ordem recomendada de evolução

| Ordem | Entrega existente            | Aceitação essencial                                                                                          |
| ----- | ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1     | TASK-006/007, restauração    | Round-trip dos seis tipos e recuperação de falha                                                             |
| 2     | TASK-010–025, beta           | Jornadas, notas, mobile, idiomas e PWA comprovados                                                           |
| 3     | TASK-027, duplicação         | Criação revisável, cancelamento sem gravação, novas identidades, realizações reiniciadas e marcos remapeados |
| 4     | TASK-029, onboarding/modelos | Opcional, pulável, reexecutável, confirmação sem duplicar metas                                              |
| 5     | TASK-028, dashboard local    | Período/denominador explícitos, vazio versus zero, arquivadas e alternativa textual                          |
| 6     | TASK-026, lote               | Seleção visível, confirmação, resultado por item e repetição só de falhas                                    |
| 7     | TASK-030, compartilhamento   | Prévia fiel, privacidade de notas, cancelamento sem envio e download alternativo                             |

TASK-026–030 continuam dependentes de TASK-025. A ordem entre P2 é recomendação, sem marcar entrega concluída.
Não incluir progresso/conclusão em lote, telemetria, links públicos ou QR na primeira entrega.

## Reconciliação com GitHub

Consultas individuais e comentários em 04/11/2026:

- [#28](https://github.com/williamquintas/momentum/issues/28), lote: aberta.
- [#22](https://github.com/williamquintas/momentum/issues/22), duplicação;
  [#46](https://github.com/williamquintas/momentum/issues/46), dashboard;
  [#76](https://github.com/williamquintas/momentum/issues/76), onboarding;
  [#80](https://github.com/williamquintas/momentum/issues/80), compartilhamento;
  [#71](https://github.com/williamquintas/momentum/issues/71), QR; e
  [#50](https://github.com/williamquintas/momentum/issues/50), backup: fechadas.
- Comentários de #22/#46/#76/#80 registram fechamento automático por inatividade; `state_reason=completed`
  não comprova entrega funcional.
- Propostas antigas de backend em #28 e analytics Cloudflare em #46 não substituem SPEC-08/10:
  serviços locais e dashboard pessoal sem telemetria.

Nenhuma issue alterada. Revisadas SPEC-03/08–11, testes e caminho Settings → import/export → goalStorage → localStorage.
Vitest, build, navegador, falhas injetadas e mobile/PWA: **blocked**, dependências locais ausentes e npm pessoal
isolado não estabelecido. Nenhuma jornada real declarada aprovada.
