# Comitês de consolidação do Momentum — 04/11/2026

**Atualização:** a [implementação e validação de 05/11](implementation-2026-11-05.md) registra os patches executados
e substitui o estado de bloqueio do ambiente deste diagnóstico inicial.

Base: `546307dcc0057e88a72338cfa70faf5dda298b81`, inicialmente limpa em detached HEAD.
Branch de trabalho criada: `feature/beta-committees`. Coordenação e integração: agente principal.
Este registro complementa [tasks.md](../../tasks.md); não substitui suas dependências nem encerra tarefas.

## Distribuição e entregas

Três agentes trabalharam simultaneamente; a coordenação cobre Gitflow e reúne as cinco frentes solicitadas.
Os comitês são unidades desta execução, não agentes permanentemente registrados ou automações.

| Frente                | Responsável                                               | Escopo e evidência                                                                                     |
| --------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Beta                  | `momentum-quality-investigator`                           | [Matriz de jornadas](beta-validation-2026-11-04.md), TASK-007 e TASK-010–024                           |
| Qualidade e migrações | Worker, skills dependency-triage/verify                   | [Dívida e planos isolados](quality-migrations-2026-11-04.md), TASK-003                                 |
| Produto e integridade | `momentum-domain-reviewer`                                | [Prioridades e revisão de persistência](product-priorities-2026-11-04.md), TASK-006–009 e TASK-026–030 |
| Gitflow e integração  | Agente principal, skills context/verify/release-readiness | Estado remoto, gates e sequência abaixo                                                                |

Cada escritor possui seu próprio relatório; revisores não alteram runtime. O agente principal persiste a revisão
do domínio, cujo perfil é somente leitura. Correções de produto e dependências exigem patches verificáveis separados.

## Decisões e ordem de execução

1. Desbloquear ambiente pessoal Node 24/npm >=10 isolado, usando o lockfile existente. Nenhum npm global/corporativo
   foi executado e nenhuma dependência foi instalada nesta execução.
2. Priorizar TASK-006/007: restauração preservando identidade, notas, progresso, relações e estatísticas dos seis tipos;
   validar falhas de gravação e repetição de importação antes de anunciar backup seguro.
3. Reativar/corrigir as jornadas críticas desabilitadas e validar TASK-010–024 com dados sintéticos representativos,
   incluindo produção offline e atualização PWA. Inspeção estática não satisfaz cenário real.
4. Recalcular auditoria e medir bundles na mesma revisão; corrigir lotes compatíveis em branches `fix/*` independentes.
   Os 30 achados e tamanhos de bundles citados anteriormente são históricos, não resultados atuais.
5. Preparar React 19, Ant Design 6, Router 7 e alterações PWA separadamente, conforme o plano de qualidade.
   Só aceitar migração depois de peers, regressões, backup e PWA verificados; sem atualização ampla por arrasto.
6. Após os critérios do beta, executar as evoluções segundo TASK-026–030. Dashboard, lote e duplicação podem ter
   planejamento paralelo, mas persistência compartilhada deve manter um único escritor por patch.

## Snapshot remoto e reconciliação

Consulta pelo conector GitHub em 04/11/2026:

- [Comparação main → develop](https://github.com/williamquintas/momentum/compare/main...develop): histórico divergente,
  develop 21 commits à frente e 8 atrás, base main `56fb3b575fb545628b960779d41a01c6b53a6d0b`.
  Squash exige comparação de conteúdo; esses números não demonstram perda de funcionalidades.
- [Manifesto main](https://github.com/williamquintas/momentum/blob/main/package.json) declara `0.3.0`;
  o manifesto local declara `0.2.2`. Reconciliar package/lock/changelog antes do próximo candidato;
  não executar bump para mascarar a divergência.
- Busca de issues abertas retornou [#28](https://github.com/williamquintas/momentum/issues/28),
  [#16](https://github.com/williamquintas/momentum/issues/16), [#13](https://github.com/williamquintas/momentum/issues/13)
  e [#9](https://github.com/williamquintas/momentum/issues/9). Retorno de busca não é inventário completo.
- Há novas PRs Dependabot #142–152, incluindo React, Vite, Vitest e ferramentas com majors.
  Reutilizar evidência e propostas existentes sem misturar migrações ou tratar PR aberta como pronta para merge.

## Gitflow e critérios de passagem

| Etapa                              | Condição de saída                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| `feature/*` ou `fix/*` → `develop` | Diff isolado, revisão de domínio, checks da revisão, auditoria para dependências               |
| `release/*` → `main`               | Candidato congelado, versões consistentes, changelog, TASK-024 e recuperação documentados      |
| Tag/release sobre main             | SHA integrado aprovado, tag exata livre ou correspondente, CI/artefato verificados             |
| `main` → `develop`                 | PR de sincronização preserva conteúdo, versões e novas correções; checks na revisão resultante |

Manter merge que preserve ancestralidade na sincronização quando permitido; squash repetido torna a análise de
divergência menos informativa. Nenhuma configuração de proteção foi consultada ou alterada nesta execução.

Pendências concretas da automação atual:

- `.github/workflows/release.yml` em modo manual prepara versão e faz push direto para `main`; adaptar em patch
  próprio para preparar `release/*` e PR revisável, publicando a tag somente após integração autorizada.
- `package.json` contém `npm run release` com push direto em main; substituir esse atalho junto da correção acima.
- O workflow de release compila, mas não exige sozinho todos os checks de beta; verificar CI do SHA publicado.
- Revalidar versão, changelog e metadados do artefato após a integração; não assumir que tag prova deployment.

Critérios de aceitação desse patch de automação: preparação sem tag/push em main; bloqueio de colisão e lookup remoto
com falha; release por tag sem novo bump; tag aponta ao SHA aprovado; teste de sincronização sem perder mudanças.
Preparar localmente é autorizado. Merge protegido, push/tag/publicação e dispatch seguem a autorização explícita
prevista em [governance.md](governance.md); a presente solicitação define o fluxo, sem nomear publicação de versão.

## Verificação desta entrega

Executados com o Node empacotado do Codex, sem npm:

- `node --test scripts/check-version.node-test.js`: **passed**, exit 0, 10 testes, nenhum skip.
- `node scripts/check-version.js maintenance`: **passed**, exit 0, versão local 0.2.2 consistente com lockfile.
- Leitura de fontes e consulta GitHub: executadas; achados de comportamento são estáticos, sem reprodução no navegador.
- `git diff --check` e checagem dos links Markdown locais dos quatro relatórios e `tasks.md`: **passed**, exit 0.
- Prettier dos documentos: **blocked**, dependências locais ausentes; não foi declarado check de formatação completo.
- Instalação limpa, auditoria, Vitest da aplicação, tipos/lint, build e PWA real: **blocked**, faltam dependências
  e instalação npm pessoal aprovada identificada nesta worktree.

Resultado: comitês executados, diagnósticos e planos entregues. Beta, dívida de segurança, migrações e features
permanecem pendentes de implementação e validação; nenhuma caixa de conclusão do roadmap foi marcada.
