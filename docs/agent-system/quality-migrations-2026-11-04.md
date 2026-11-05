# Comitê de qualidade e migrações — 04/11/2026

Base inspecionada: `546307dcc0057e88a72338cfa70faf5dda298b81`.
O checkout começou limpo e sem branch; a coordenação criou `feature/beta-committees` durante a investigação.
Este relatório altera somente documentação. Não houve instalação, mudança de dependências, configuração de build ou publicação.

## Parecer

**Dívida não quitada; migrações planejadas e bloqueadas para aceitação.** Os 30 achados e os avisos de bundle são uma referência
histórica fornecida para investigação. Não há auditoria nem build atual nesta worktree que permita confirmar seus totais,
atribuir os avisos a módulos específicos ou demonstrar uma redução.

Há Node 24.22.1 empacotado pelo Codex em
`C:\Users\willi\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`.
`Get-Command node,npm -All` localizou esse Node e nenhum npm; `Test-Path node_modules` retornou `False`.
O runtime contém pnpm para ferramentas do host, mas isso não comprova um npm pessoal aprovado para o projeto.
Não usar esse gerenciador como substituto nem habilitar npm global/corporativo.

## Evidência local

| Verificação                                             | Estado                     | Resultado e limite                                            |
| ------------------------------------------------------- | -------------------------- | ------------------------------------------------------------- |
| `node -v`                                               | passou                     | v24.22.1; não comprova npm disponível                         |
| `node scripts/check-version.js maintenance`             | passou, exit 0             | manifesto/lockfile concordam em 0.2.2                         |
| `node --test scripts/check-version.node-test.js`        | passou, exit 0             | 10 casos, zero falhas, zero skips; política de versão somente |
| Leitura de manifests, CI, chunks, rotas e hooks PWA     | executada                  | inspeção estática; sem inferir comportamento de browser       |
| `npm ci` e `npm audit --json`                           | bloqueados, não executados | npm pessoal aprovado indisponível                             |
| validate, traduções, Vitest e build                     | bloqueados, não executados | npm e dependências do projeto ausentes                        |
| Comparação de tamanho/ciclos e teste de PWA de produção | bloqueados, não executados | sem artefatos de build antes/depois                           |

## Dependências: versão declarada versus resolvida

Leitura direta de `package.json` e `package-lock.json`; nenhuma dessas versões está instalada nesta worktree.

| Família                | Manifesto                | Lockfile        |
| ---------------------- | ------------------------ | --------------- |
| React / React DOM      | 18.2.0 / 18.2.0          | 18.2.0 / 18.2.0 |
| Ant Design             | 5.12.8                   | 5.12.8          |
| Ant Design icons       | não é dependência direta | 5.6.1           |
| React Router DOM       | ^6.30.6                  | 6.30.6          |
| Zod                    | ^4.6.7                   | 4.6.7           |
| Vite                   | ^6.4.5                   | 6.4.5           |
| vite-plugin-pwa        | ^1.2.0                   | 1.3.0           |
| Rollup / Workbox build | transitivas              | 4.60.1 / 7.4.1  |

`docs/dependency-maintenance.md` ainda diz preservar Zod 3; o manifesto e o lockfile já usam Zod 4.
Essa divergência documental deve ser reconciliada com a decisão e os testes da migração já incorporada.
Não fazer downgrade para satisfazer a descrição histórica. Há imports diretos de `@ant-design/icons` em telas e componentes,
embora o pacote não seja declarado diretamente; registrar essa dependência explicitamente no lote adequado, com lockfile e validação.

## Fila para quitar a dívida

| Ordem / branch proposta            | Trabalho concreto                                                                                                                                                | Critério de saída                                                                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1. `fix/dependency-audit-baseline` | Em npm pessoal isolado: instalação limpa; salvar audit JSON completo e de produção; mapear cada advisory ao caminho de dependência, escopo e correção compatível | revisão exata, npm/Node, comandos e totais por severidade documentados; nenhuma vulnerabilidade dispensada implicitamente          |
| 2. `fix/dependency-advisories`     | Separar pequenos lotes compatíveis; revisar PRs existentes e peer ranges; atualizar manifesto/lock juntos                                                        | nova auditoria demonstra fechamento de cada achado; instalação, validate, traduções, testes e build passam                         |
| 3. `fix/bundle-chunk-cycles`       | Capturar avisos completos e grafo dos chunks; comparar configuração atual com divisão automática e agrupamento mínimo orientado pelo grafo                       | nenhum ciclo de chunk reproduzido; páginas lazy, inicialização, reload e offline funcionam; comparação de bytes e requests anexada |
| 4. `fix/antd-bundle`               | Medir bytes brutos/gzip e módulos da primeira rota e das demais; verificar ícones, componentes efetivamente incluídos e fronteiras lazy                          | redução medida no mesmo cenário; sem regressão de tema, locale, acessibilidade, rotas ou precache                                  |

O gate obrigatório existente é `npm audit --audit-level=high`; CI registra moderadas com `continue-on-error: true` antes dele.
Isso não constitui quitação das baixas/moderadas. Para declarar a dívida quitada, contabilizar também essas severidades no
audit completo. Não aumentar o limite, suprimir avisos ou usar `npm audit fix --force` para obter aceitação.

`vite.config.ts:167` define chunks manuais `vendor`, `antd`, `query`, `state`, `utils` e limite de aviso 1000 kB na linha 179.
As rotas em `src/routes/index.tsx` já usam `lazy`; o layout global já importa Ant Design.
Hipótese a testar: o agrupamento manual altera a fronteira de dependências compartilhadas e concentra custo no chunk Ant Design.
Não há evidência suficiente para atribuir o ciclo a um par específico, prometer que fragmentar o chunk reduz o payload inicial
ou alterar essa configuração sem build comparativo. O arquivo foi preservado.

## Migrações isoladas

Todos os nomes abaixo são branches propostas, ainda não criadas. Cada branch parte de `develop` atualizado, com uma única
família principal e seus peers indispensáveis. Não empilhar PRs apenas para compartilhar um lockfile modificado.
Aceitação comum: instalação limpa sem force/legacy-peer-deps, audit, validate, traduções, suíte completa com skips explícitos,
build e matriz beta de seis tipos/backup/notas. Registrar HEAD e estado dirty antes de cada comparação.

| Branch                  | Entrada e mudança delimitada                                                                                                                                     | Testes específicos / saída                                                                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `feature/react-19`      | revisar primeiro a PR #149 e a de Testing Library #147; atualizar React/DOM/types em conjunto somente após checar peers; considerar etapa React 18.3 para avisos | StrictMode, effects/cleanup, refs, ErrorBoundary, formulários, modais, notificações e testes com act; conferir JSX moderno e compatibilidade Ant Design vigente   |
| `feature/antd-6`        | atualizar primeiro Ant Design 5 para uma versão 5 revisada; resolver deprecações; migrar Ant Design e icons como família                                         | seis formulários, Drawer/Modal/Select/DatePicker, foco e teclado, CSS customizado, claro/escuro, pt/en e mobile/desktop; medir bundle; comparar DOM e tokens      |
| `feature/router-7`      | manter BrowserRouter e modelo declarativo existente; habilitar flags futuras pertinentes em Router 6 uma a uma, depois migrar pacote                             | URLs diretas, back/forward, 404, lazy/Suspense, links relativos, parâmetros de meta e recarga offline; não incluir adoção de framework/SSR                        |
| `fix/pwa-update-safety` | manter atualização de SW separada de upgrade de plugin; alinhar registro, detecção e decisão de recarregar; só migrar plugin em outra branch se necessário       | dois builds de produção consecutivos; documento não salvo, progresso em edição, duas abas, offline/online, atualização adiada/aceita e preservação de dados/cache |

Fontes primárias verificadas em 04/11/2026:

- O [guia React 19](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) recomenda a etapa 18.3 para revelar
  deprecações; exige JSX moderno e atualização dos tipos. A base já usa `createRoot` em `src/main.tsx`.
- O [guia Ant Design 6](https://ant.design/docs/react/migration-v6/) exige React >=18 e icons >=6; orienta atualizar
  primeiro a linha 5 e revisar alterações de DOM/CSS. Portanto Ant Design 6 não exige concluir React 19 antes.
- O [guia versionado Router 7](https://reactrouter.com/7.9.6/upgrading/v6) descreve a transição gradual por flags
  futuras e mínimos Node 20/React 18. Esse documento é guia de migração, não seleção de versão exata atual.
- A [documentação oficial de atualização PWA](https://vite-pwa-org.netlify.app/guide/auto-update.html) alerta sobre
  formulários e distingue atualização automática do SW de reload da UI via módulo virtual.

`vite.config.ts:20` usa `autoUpdate`. `src/hooks/usePwaUpdate.ts` escuta `swUpdated` e `updatefound`, enquanto
`UpdateToast` chama reload na confirmação. A busca em `src` e `index.html` não encontrou registro por módulo virtual nem
emissor de `swUpdated`; a injeção produzida pelo plugin precisa ser inspecionada no build. A ausência do emissor no source
não prova ausência de registro gerado. Verificar especialmente quando o SW assume controle e se a decisão de adiar é efetiva.
O cache `/api/` configurado não comprova persistência das metas, que usam serviços locais.

## Integração com os outros comitês

A coordenação consultou o GitHub e informou PRs existentes: #149 React/types, #147 Testing Library 16, #152 Vitest 5,
#150 jsdom 30, #143 Vite 8, #142 grupo de produção, #144 grupo de desenvolvimento, #146 Zustand 5,
#145 hooks 7, #151 security 4 e #148 lint-staged 17. Este comitê não validou seus diffs/peers nem seus checks.
Reutilizar propostas adequadas após triagem própria; não tratar a lista como lote compatível nem abrir duplicatas.

A restauração segura e a validação beta precedem aceitação das migrações e evolução de produto.
Manutenção normal segue `fix/*` → `develop`; atualização de segurança gerada para `main` precisa de plano de retorno a
`develop`, segundo a política existente. Merge protegido, tag, publicação e dispatch permanecem com a coordenação e a
autorização humana aplicável. Nenhuma dessas operações ocorreu neste comitê.
