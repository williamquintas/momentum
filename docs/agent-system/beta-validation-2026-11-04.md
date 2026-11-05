# Comitê de consolidação do beta — 04/11/2026

Base inspecionada: `546307dcc0057e88a72338cfa70faf5dda298b81`; checkout inicialmente limpo, HEAD destacado.
Responsabilidade deste comitê: investigar jornadas e cobertura; somente este relatório foi criado.
As constatações abaixo são de inspeção estática, não de execução de jornadas reais. O beta ainda não pode ser aceito.

## Ambiente e evidência

| Verificação                                                       | Estado  | Evidência / limite                                                                                                                                                                           |
| ----------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git rev-parse HEAD` / `git status --short`                       | passed  | Base acima; sem alterações iniciais.                                                                                                                                                         |
| Inventário de testes e skips via `rg`                             | passed  | Oito declarações `describe.skip` e nove `it.skip` encontradas em `src`; uma destas está dentro de suite já pulada. Não representam contagem de casos executados.                             |
| `Test-Path node_modules`                                          | passed  | Retornou `False`; runner Vitest local ausente.                                                                                                                                               |
| `Get-Command node`                                                | passed  | Runtime Codex em `C:/Users/willi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`; isto não comprova instalação pessoal de npm aprovada.                          |
| Vitest, build e preview de produção                               | blocked | Dependências ausentes e instalação pessoal de npm isolada do ambiente corporativo não comprovada. Nenhum npm global/corporativo foi executado e nenhum pacote foi instalado por este comitê. |
| Browser, offline, instalação, atualização e acessibilidade manual | blocked | Sem build de produção/preview desta revisão; nenhuma jornada real foi executada.                                                                                                             |
| CI atual                                                          | not run | Este relatório não atribui à revisão atual resultados de CI de outras revisões.                                                                                                              |

Skills aplicadas: contexto recebido do coordenador, `momentum-verify` e `momentum-ui-acceptance`.
Regras consultadas: `AGENTS.md`, manutenção de dependências, testes, acessibilidade, componentes e `docs/qa-exploratory-tests.md`.

## Matriz mínima de aceitação

Usar dados sintéticos em perfil isolado. Para cada linha: criar pela interface, atualizar, recarregar, exportar,
restaurar em perfil vazio e comparar valores, identidade, datas, histórico e notas. Executar em português/inglês,
tema claro/escuro e larguras móvel/desktop; registrar navegador, viewport e revisão.

| Tipo / jornada | Cenário de aceitação                                                                     | Evidência existente no código                                                                            | Resultado nesta revisão                                           |
| -------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Quantitativa   | 0→50→100, redução de valor, alvo decrescente, decimais e sobreconquista                  | `calculateProgress.test.ts` contém cálculos; criação e progresso integrados estão pulados                | blocked: execução; riscos de restauração abaixo                   |
| Qualitativa    | estados, avaliações e nota; preservar avaliação após recarga/restauração                 | Testes de cálculo por estado/avaliação; integração de criação/progresso pulada                           | blocked: execução                                                 |
| Binária        | contagem parcial e conclusão, cancelamento sem gravação                                  | Testes de campos/cálculo; integração pulada                                                              | blocked: execução                                                 |
| Marcos         | dependências, ordem, concluído/pulado; restaurar IDs relacionados                        | Testes de cálculo; adição de marcos e seleção de tipo parcialmente puladas                               | blocked: execução                                                 |
| Recorrente     | intervalo e datas, ocorrência concluída/perdida, recarga e histórico                     | Cálculo possui casos; integração de progresso pulada                                                     | blocked: execução                                                 |
| Hábito         | frequência, entrada por dia, duplicidade, streak e fuso                                  | Testes de cálculo; bloco Habit do modal pulado; fábrica da integração de progresso não implementa hábito | blocked: execução                                                 |
| Notas          | criar/editar/excluir, tags, limite 5.000, falha de gravação e rollback                   | `useNoteMutations.test.ts:14,20,26` contém apenas `expect(true).toBe(true)`                              | blocked: execução; cobertura funcional dos hooks ausente          |
| Backup         | seis tipos, notas, histórico, relações, realizações; arquivo inválido, duplicado e quota | Serviços de import/export testados com mocks; storage real não é exercitado pelo teste de importação     | blocked: execução; defeitos estáticos P0 abaixo                   |
| PWA            | instalação, segunda abertura offline, refresh, duas versões e edição não salva           | Testes de hook de instalação; suites de botão e integração do header puladas                             | blocked: produção + Chrome desktop/Android e Safari iOS pendentes |
| Acessibilidade | teclado, foco, nomes acessíveis, 44px e contraste                                        | Regras existentes; sem evidência manual atual                                                            | blocked: execução                                                 |

## Achados e próximos patches

### P0 — restauração nova perde identidade, notas e progresso

`src/services/storage/dataImportService.ts:396` chama `createGoal(goalInput)` para metas sem duplicata.
`src/services/storage/goalStorageService.ts:336` gera outro UUID; linhas 343–348 substituem datas, progresso por zero,
notas e anexos por arrays vazios. As relações mantêm referências anteriores.
Reprodução a executar: exportar duas metas relacionadas, uma com 50% e notas; restaurar em perfil vazio;
comparar IDs, relações, progresso, datas e notas com o arquivo. O fluxo estático demonstra as substituições;
o teste atual apenas verifica que o mock `createGoal` foi chamado (`dataImportService.test.ts:27,160`).
Próximo patch: caminho próprio de restauração, sem reutilizar a inicialização de criação; integração com storage real.

### P0 — importação não garante validade por tipo nem gravação integral

`dataImportService.ts:60,112–113` admite tipo quantitativo com campos próprios opcionais; datas são `z.string()`
nas linhas 75–76 e versão é qualquer string na linha 207. O cast da linha 349 não valida invariantes.
`goalStorageService.ts:314–319` grava seis chaves sequencialmente; a importação grava meta a meta e captura erros,
sem rollback do lote. Falha de quota pode deixar importação parcial e índices inconsistentes.
Reprodução a executar: dados sem alvo/datas inválidas/versão desconhecida e falha injetada no segundo `setItem`.
Exigir rejeição antes de escrever e preservação integral do estado anterior. Definir explicitamente atomicidade e
política de recuperação antes de alterar dados reais; os testes devem usar apenas fixtures.

### P1 — duplicidade no próprio arquivo e estratégia replace

`dataImportService.ts:365` obtém um snapshot e não o atualiza no laço. Duas entradas novas com o mesmo ID ou
título/tipo podem ser criadas separadamente; a prévia usa lógica semelhante (421–425).
Em 382–385, `replace` só substitui quando o arquivo é mais recente, como `latest-wins`.
Criar testes para duplicados internos e empates/datas antigas; reconciliar semântica com produto antes de mudar `replace`.

### P1 — backup de sobreconquista e realizações incompleto

`dataImportService.ts:65` rejeita progresso acima de 100, enquanto `calculateProgress.test.ts:66,133` prevê
sobreconquista. Confirmar contrato e testar exportação/restauração de quantitativa acima de 100.
Realizações são persistidas separadamente em `goalStorageService.ts:711–738`; export/import atuais carregam apenas
metas, sem esse conjunto. Definir se o backup completo deve cobri-las, conforme TASK-016, e testar a retenção.

### P1 — atualização PWA precisa prova de preservação de edição

`vite.config.ts:20` usa `registerType: 'autoUpdate'`; `usePwaUpdate.ts:78–79` recarrega imediatamente,
e `UpdateToast.tsx:51–53` aplica essa ação sem consultar edição pendente. O listener de `updatefound` não é removido
no cleanup do hook. Não há teste localizado de `usePwaUpdate`. Isso é risco estático; não foi observada perda real.
Antes de mudar estratégia de SW, usar dois builds de produção e um formulário com alteração não salva;
verificar atualizar/agora/depois, recarga offline e retenção de fixtures. Isolar eventual mudança em branch de PWA.

## Cobertura desativada prioritária

- `src/__tests__/features/goals/CreateGoal.integration.test.tsx:26`: suite de criação.
- `src/__tests__/features/goals/CreateGoalTypes.integration.test.tsx:19`: seleção dos seis tipos.
- `src/__tests__/features/goals/UpdateProgress.integration.test.tsx:105`: integração de progresso; mock de submissão não comprova persistência ponta a ponta.
- `src/__tests__/features/goals/UpdateProgressModal.test.tsx:264,283`: hábito e ação do modal.
- `src/__tests__/features/goals/CreateGoalForm.test.tsx:70,83,120,129`: validação, submit, cancelamento, loading.
- `src/__tests__/features/goals/components/GoalForm/GoalForm.test.tsx:18,57` e `components/MilestoneGoalFields.test.tsx:42,52`: campos e adição de marcos.
- `src/__tests__/components/PwaInstallButton.test.tsx:12` e `HeaderPwa.test.tsx:13`: instalação integrada.
- Também desativadas: NotificationBell e notificationStorage; pertencem à qualidade de notificações.

Não remover `.skip` em bloco para declarar aceitação. Diagnosticar cada causa, usar relógio determinístico,
storage isolado, assertions do resultado persistido e testar rollback. Nenhum teste foi alterado.

## Ordem de execução e encerramento

1. Corrigir e testar a restauração segura numa branch `fix/*` para `develop`, com revisão de domínio.
2. Trocar placeholders de notas por testes de CRUD/rollback e recuperar jornadas de criação/progresso por tipo.
3. Executar a matriz com build de produção e fixtures; anexar evidência por plataforma e limitações reais.
4. Revalidar candidato integrado, nunca aceitar TASK-023/TASK-024 com base somente em build ou suites verdes com skips.

Dependência externa para as execuções bloqueadas: ambiente pessoal Node/npm aprovado e dependências da revisão.
Este relatório prepara o trabalho e identifica bloqueios; não encerra as tarefas do beta nem autoriza publicação.
