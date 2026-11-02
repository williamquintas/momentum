# Especificações do roadmap do Momentum

## Convenções e limites

Referência: [plan.md](./plan.md), diagnóstico de 30/09/2026 e [tasks.md](./tasks.md). Estes requisitos descrevem trabalho
futuro; não comprovam implementação ou validação.

As SPEC-01 a SPEC-07 são obrigatórias para o próximo beta. As SPEC-08 a SPEC-11 pertencem à etapa Depois. Preservar os
modelos, serviços de armazenamento e interfaces existentes como ponto de partida. Não introduzir backend, contas,
sincronização ou contratos HTTP para executar este roadmap. A base atual usa localStorage, apesar de algumas issues
mencionarem IndexedDB. Uma migração de armazenamento exige proposta separada.

## SPEC-01 — Manutenção de dependências, CI e releases

**Etapa:** Agora, com preparação de release em Próximo. **Prioridade:** P0 para bloqueios; P1 para manutenção e publicação.

**Problema:** PRs pequenas compartilham bloqueios de segurança e versão; grandes grupos misturam migrações incompatíveis.

**Comportamento esperado:** mudanças compatíveis podem ser integradas com verificações confiáveis; releases possuem
validação de versão própria.

**Requisitos:**

- Diagnosticar falhas na base atual e distinguir regressões de problemas anteriores ao diff.
- Corrigir vulnerabilidades que impedem a auditoria sem desativar a verificação obrigatória.
- Não rejeitar uma PR de manutenção apenas porque a tag da versão atual existe. Impedir colisões ao preparar uma release.
- Manter manifest e lockfile coerentes, Node compatível com o projeto e instalação reproduzível.
- Separar atualizações compatíveis de migrações de versões principais. Manter tooling relacionado em versões compatíveis.
- Substituir #117 pela #124 somente após integração validada; tratar sobreposições entre PRs.

**Aceitação:** instalação limpa, tipos, lint, formatação, testes, build e auditoria passam na base reconciliada; manutenção
sem bump passa na regra de versão e uma tentativa de release com tag conflitante falha.

**Dependências:** diagnóstico inicial antes das correções; SPEC-02 para validação final e publicação.

**Referências:** [PR #93](https://github.com/williamquintas/momentum/pull/93),
[PR #129](https://github.com/williamquintas/momentum/pull/129),
[PR #124](https://github.com/williamquintas/momentum/pull/124) e
[verificação de versão](https://github.com/williamquintas/momentum/blob/main/.github/workflows/version-check.yml).

## SPEC-02 — Reconciliação de branches e rastreabilidade

**Etapa:** Agora e publicação em Próximo. **Prioridade:** P0 para reconciliação; P1 para documentação.

**Problema:** checkout desatualizado, branches divergentes e documentos que confundem especificação com implementação.

**Comportamento esperado:** uma base de integração preserva correções recentes e permite identificar o estado real de cada
entrega.

**Requisitos:**

- Incorporar `main` em `develop` por trabalho revisável, preservando correções mais recentes, inclusive de dependências.
- Comparar conteúdo, não apenas quantidade de commits, ao determinar diferenças.
- Usar os estados planejado, integrado em develop e publicado, acompanhados de evidência.
- Triar itens fechados por inatividade; não reabrir automaticamente todos os itens encerrados.
- Renomear #16 para refletir atualização de progresso e separar anexos de #13.
- Proteger itens escolhidos para o roadmap contra encerramento automático e revisar o milestone 0.2.0 ainda aberto.

**Aceitação:** reconciliação sem regressão das correções conhecidas; backlog e documentos concordam sobre o estado das
entregas; cada item concluído possui PR integrada ou release associada e validação pertinente.

**Dependências:** SPEC-01 para manutenção compatível e verificações verdes.

**Referências:** [comparação main/develop](https://github.com/williamquintas/momentum/compare/main...develop),
[PR #94 fechada sem merge](https://github.com/williamquintas/momentum/pull/94),
[milestone 0.2.0](https://github.com/williamquintas/momentum/milestone/2) e `specs/GOALS_INDEX.md`.

## SPEC-03 — Backup e restauração sem perda de dados

**Etapa:** Agora. **Prioridade:** P0.

**Problema:** o caminho de importação de novas metas redefine notas e anexos; restauração precisa preservar mais que o título
e tipo da meta.

**Comportamento esperado:** um backup válido recupera os dados representados pelo formato, mantendo coerência entre metas.

**Requisitos:**

- Separar restauração de criação com valores iniciais; não descartar notas, histórico, datas, estados ou metadados existentes.
- Preservar relações entre metas e dependências de marcos, com identificadores preservados ou remapeados consistentemente.
- Validar estrutura e versão antes da escrita; manter leitura de backups atualmente suportados.
- Respeitar a estratégia de duplicidades apresentada na interface e informar itens importados, atualizados, ignorados ou
  com falha. Uma substituição explicitamente escolhida não deve ser ignorada silenciosamente por ser mais antiga.
- Não interpretar uma importação parcial como sucesso completo; preservar metas não afetadas e manter cache coerente.
- Preservar metadados de anexos existentes no formato, sem prometer backup de conteúdo binário que não esteja nele.

**Aceitação:** exportar e restaurar uma coleção dos seis tipos em armazenamento vazio preserva seus dados e relações;
importação sobre dados existentes segue a estratégia escolhida; arquivo inválido não altera dados; falhas parciais são
identificadas e não apagam metas não afetadas.

**Dependências:** SPEC-02; verificação adicional com notas da SPEC-06.

**Referências:** [issue #50](https://github.com/williamquintas/momentum/issues/50),
[PR #57](https://github.com/williamquintas/momentum/pull/57) e os serviços de importação/exportação existentes.

## SPEC-04 — Funcionamento dos seis tipos de meta

**Etapa:** Próximo. **Prioridade:** P0.

**Problema:** modelos e formulários não comprovam fluxos completos; os tipos avançados estão desativados por padrão e o
caminho inspecionado de hábitos/recorrências não recalcula suas estatísticas.

**Comportamento esperado:** todos os seis tipos podem ser criados, editados, acompanhados, concluídos e recuperados no beta.

**Requisitos por tipo:**

- **Quantitativa:** expor `allowOverAchievement`, preservar a opção na edição e manter cálculo e conclusão coerentes com
  as regras existentes de superação do alvo.
- **Binária:** manter contagem/checklist e histórico coerentes; respeitar os limites definidos no modelo.
- **Qualitativa:** registrar avaliação de 1 a 10 com nota opcional e data; mostrar histórico e calcular progresso conforme
  o cálculo existente de média das avaliações e alvo, quando configurado.
- **Marcos:** permitir gerenciamento conforme a especificação 007, validar dependências e impedir ciclos e conclusão
  bloqueada. Edição não deve destruir registros existentes.
- **Recorrente:** materializar ocorrências conforme a configuração e especificação 008; identificar registros por
  ocorrência e recalcular progresso e estatísticas ao alterar sua conclusão.
- **Hábito:** registrar e corrigir conclusão por dia conforme a frequência e especificação 009; evitar duplicação do mesmo
  dia e recalcular estatísticas e sequências.
- Aplicar regras de data local consistentemente entre formulário, armazenamento e cálculo. Testar virada de dia, mês e
  horário de verão com relógio controlado.
- Não bloquear atualizações legítimas distintas apenas porque resultam no mesmo percentual em um intervalo curto.
- Configurar os seis tipos como disponíveis no beta e preservar leitura de metas existentes quando uma flag muda.

**Aceitação:** cada tipo completa seu fluxo, permanece coerente após recarregar e passa pelo backup; alterações de hábito
ou ocorrência atualizam estatísticas; dois registros legítimos sucessivos são aceitos; dependências inválidas são rejeitadas;
as seis opções aparecem na configuração do beta.

**Dependências:** SPEC-02 e SPEC-03; SPEC-05 para uso pela lista.

**Referências:** [issue #19](https://github.com/williamquintas/momentum/issues/19),
[issue #20](https://github.com/williamquintas/momentum/issues/20), especificações existentes 007, 008 e 009 e calculadores de
progresso atuais.

## SPEC-05 — Experiência mobile e atualização pela lista

**Etapa:** Próximo. **Prioridade:** P1.

**Problema:** registrar progresso exige navegação repetitiva; a issue de responsividade permanece aberta.

**Comportamento esperado:** metas podem ser acompanhadas e atualizadas em tabela ou cartões, inclusive no celular.

**Requisitos:**

- Recuperar a proposta da #87 como referência, usando componentes e regras existentes para os seis tipos.
- Permitir atualização sem abrir previamente o detalhe e sem depender exclusivamente do cache de detalhe.
- Mostrar campos adequados ao tipo; preservar histórico, validação, conclusão e feedback de erro.
- Impedir que clicar em uma ação também navegue pela linha/cartão; manter feedback coerente entre lista e detalhe.
- Oferecer ações utilizáveis em telas estreitas, alvos de toque de pelo menos 44 px e navegação por teclado.
- Manter rolagem horizontal restrita à tabela quando necessária, sem esconder ações essenciais ou causar overflow da página.

**Aceitação:** cadastrar uma meta e atualizar pela lista, sem visitar seu detalhe, funciona para cada tipo; falha ao salvar
não aparece como sucesso; testar tabela/cartões em 320, 375 e 768 px, desktop e teclado.

**Dependências:** SPEC-04 e base da SPEC-02.

**Referências:** [issue #9](https://github.com/williamquintas/momentum/issues/9),
[issue #16](https://github.com/williamquintas/momentum/issues/16) e
[PR #87](https://github.com/williamquintas/momentum/pull/87).

## SPEC-06 — Notas, persistência e recuperação

**Etapa:** Próximo. **Prioridade:** P1.

**Problema:** notas existem em develop, mas não estão publicadas em main; a restauração exige cobertura específica.

**Comportamento esperado:** usuários adicionam, editam e excluem notas com tags, recuperáveis por backup.

**Requisitos:**

- Validar a implementação da #86 na base reconciliada, mantendo o modelo `Note` e as interfaces existentes.
- Preservar conteúdo, tags e datas após edição, recarga, exportação e importação.
- Mostrar carregamento e erro; reverter mudanças otimistas quando a persistência falha.
- Manter editor utilizável em desktop/mobile, respeitando o limite de 5.000 caracteres já adotado.
- Habilitar notas na entrega do beta e separar anexos do encerramento da #13.

**Aceitação:** CRUD com tags, limites, recarga e backup funciona; falha de armazenamento não deixa nota falsa na interface;
notas estão em main após integração e possuem evidência de entrega antes de encerrar a issue correspondente.

**Dependências:** SPEC-02 e SPEC-03.

**Referências:** [issue #13](https://github.com/williamquintas/momentum/issues/13) e
[PR #86](https://github.com/williamquintas/momentum/pull/86).

## SPEC-07 — Preparação do beta, ajuda e acessibilidade

**Etapa:** Próximo. **Prioridade:** P1; validação integrada P0.

**Problema:** o beta precisa orientar usuários sobre uso, backup e limites locais, com experiência acessível e PWA confiável.

**Comportamento esperado:** usuários entendem como começar, proteger seus dados e relatar problemas.

**Requisitos:**

- Incluir orientação inicial curta, ajuda e acesso aos canais de suporte existentes; o onboarding completo fica para Depois.
- Explicar que os dados ficam no navegador, como exportar/restaurar e que limpar dados do navegador pode removê-los.
- Disponibilizar informação de privacidade coerente com o comportamento real e atribuições das dependências; não anunciar
  garantias ou funções que não foram verificadas. Tratar termos da #72 junto à preparação das informações públicas.
- Persistir preferência de animação e respeitar movimento reduzido do sistema como padrão; manter som desativado por
  padrão e oferecer preferência caso o mecanismo de som seja disponibilizado.
- Validar português e inglês, incluindo mensagens de erro e acessibilidade dos fluxos centrais.
- Validar instalação, modo offline e atualização da PWA sem perda de dados ou de alterações ainda não salvas.
- Preparar publicação e instruções de feedback apenas após cumprir os critérios de SPEC-01 a SPEC-07.

**Aceitação:** jornada inicial até registro de progresso e backup é compreensível; teclado e movimento reduzido funcionam;
instalação/offline/atualização passam em matriz de navegadores documentada; limites de plataforma são informados.

**Dependências:** SPEC-01 a SPEC-06 para liberação do beta; redação e investigação podem começar antes.

**Referências:** [#72](https://github.com/williamquintas/momentum/issues/72),
[#73](https://github.com/williamquintas/momentum/issues/73), [#75](https://github.com/williamquintas/momentum/issues/75),
[#77](https://github.com/williamquintas/momentum/issues/77), [#81](https://github.com/williamquintas/momentum/issues/81) e
[PR #45](https://github.com/williamquintas/momentum/pull/45).

## SPEC-08 — Ações em lote

**Etapa:** Depois. **Prioridade:** P2.

**Problema:** organizar várias metas demanda ações repetitivas.

**Comportamento esperado:** seleção explícita permite arquivar, desarquivar ou excluir várias metas com resultado visível.

**Requisitos:** seleção em tabela/cartões; selecionar todos limitado ao conjunto exibido, com alcance informado; confirmação
para exclusão; resultado por item e atualização coerente dos caches. Usar serviços locais; progresso, conclusão em lote e
edição de atributos ficam fora desta primeira entrega.

**Aceitação:** selecionar, limpar seleção, arquivar, desarquivar e excluir respeita o conjunto confirmado; falha parcial
identifica as metas afetadas e permite tentar novamente somente as pendentes; seleções não atingem metas ocultas sem aviso.

**Dependências:** beta concluído e SPEC-05.

**Referência:** [issue #28](https://github.com/williamquintas/momentum/issues/28).

## SPEC-09 — Duplicação de metas

**Etapa:** Depois. **Prioridade:** P2.

**Problema:** criar metas semelhantes exige preencher novamente suas configurações.

**Comportamento esperado:** duplicar abre criação preenchida para revisão, sem alterar a original.

**Requisitos:** copiar configuração, título, descrição, categoria/tags e estrutura específica do tipo; gerar novos IDs e
remapear dependências internas de marcos; reiniciar progresso, histórico, avaliações, registros, notas e anexos; iniciar
ativa, sem arquivamento/favorito e sem relações com outras metas. Datas propostas permanecem editáveis antes de salvar.

**Aceitação:** confirmar cria uma meta independente dos seis tipos; cancelar não escreve; modificar a cópia não altera a
original; dependências internas continuam válidas e nenhum registro de realização é copiado.

**Dependências:** beta concluído e SPEC-04.

**Referência:** [issue #22](https://github.com/williamquintas/momentum/issues/22).

## SPEC-10 — Dashboard pessoal

**Etapa:** Depois. **Prioridade:** P2.

**Problema:** falta uma visão consolidada do acompanhamento pessoal.

**Comportamento esperado:** apresentar metas ativas, vencidas, conclusões e evolução com dados locais.

**Requisitos:** usar metas e histórico existentes; informar período e denominador das métricas; distinguir falta de registros
de valor zero; excluir arquivadas da visão de metas ativas; fornecer acesso aos detalhes e alternativa textual aos gráficos.
Não incluir telemetria de usuários, envio de conteúdo ou infraestrutura de analytics nesta entrega.

**Aceitação:** uma coleção controlada produz totais e evolução esperados; filtros de período não alteram os dados; estados
vazios são compreensíveis; nenhum envio de dados é acrescentado pelo dashboard.

**Dependências:** beta concluído e SPEC-04.

**Referências:** [issue #46](https://github.com/williamquintas/momentum/issues/46) e especificação existente 010.

## SPEC-11 — Onboarding e compartilhamento

**Etapa:** Depois. **Prioridade:** P2.

**Problema:** novos usuários precisam de orientação; reutilização e compartilhamento podem facilitar adoção.

**Comportamento esperado:** orientação opcional ajuda a criar a primeira meta; compartilhamento é uma ação explícita.

**Requisitos:** onboarding pulável e reexecutável, sem duplicar metas; modelos revisáveis antes de salvar; cartão com prévia
e seleção explícita de conteúdo, sem incluir notas privadas por padrão; download como alternativa ao compartilhamento
nativo. Transferência de dados usa exportação validada; não prometer links públicos para metas armazenadas localmente,
sincronização ou integração direta com Instagram. QR code fica para uma etapa posterior.

**Aceitação:** pular/reexecutar funciona; modelo só grava após confirmação; cartão corresponde à prévia; cancelamento não
compartilha; download funciona sem suporte nativo; transferência mantém os critérios de SPEC-03.

**Dependências:** beta concluído; SPEC-03 e SPEC-07.

**Referências:** [#76](https://github.com/williamquintas/momentum/issues/76),
[#80](https://github.com/williamquintas/momentum/issues/80) e [#71](https://github.com/williamquintas/momentum/issues/71).
