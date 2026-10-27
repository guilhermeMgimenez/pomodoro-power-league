# Auditoria Focus Time — relatório e backlog

Base verificada: 6 telas (`/` Login, `/home`, `/missoes`, `/amigos`, `/perfil`, 404). Não há backend conectado (sem Lovable Cloud/Supabase), sem testes, sem PWA (sem manifest/service worker), sem som ou notificação. Todos os dados das telas são fixos no código.

## Parte A — Auditoria

| ID | Status | Evidência | O que falta |
|---|---|---|---|
| RF01 | 🟡 | `useTimer.ts`, `TimerDisplay`, `TimerControls` | Conta com setInterval (atrasa em aba inativa); reset existe no hook mas não tem botão na tela |
| RF02 | ❌ | Tarefa única fixa em `Index.tsx` | Criar/listar/agendar tarefas com data, hora e fuso |
| RF03 | 🟡 | `ModeSelector` (25/5/15 fixos) | Personalizar tempos e nº de ciclos até pausa longa; salvar |
| RF04 | ❌ | — | Som e notificação ao iniciar/terminar |
| RF05 | ❌ | `Missoes.tsx` é lista fixa de desafios | Metas curto/médio/longo prazo com tarefas vinculadas |
| RF06 | ❌ | — | Modo zen (ver Parte B) |
| RF07 | ❌ | `Login.tsx` só redireciona; sem cadastro | Cadastro/login reais (senha com hash pelo Cloud), rotas protegidas |
| RF08 | ❌ | — | Sugestões de IA baseadas em metas/tarefas |
| RF09 | ❌ | — | Relatório semanal com gráfico |
| RF10 | ❌ | — | Compartilhar progresso |
| RNF01 | ✅ | Design system "céu noturno" em `index.css` e todas as telas | — |
| RNF02 | ❌ | Dark fixo, sem tema claro | Tema light/dark salvo por usuário |
| RNF03 | 🟡 | Sem chamadas REST ainda | Medir após backend existir |
| RNF04 | 🟡 | Layout `max-w-2xl`, mobile-first | Timer de 320px fixo pode estourar em telas < 360px; não testado |
| RNF05 | 🟡 | XP, streak, ranking, modal de vitória (dados fixos) | Persistir e calcular de verdade |
| UC01 fluxo principal | 🟡 | Iniciar existe | Falta tela de personalização antes de iniciar |
| UC01 exceção 3a | ❌ | — | Validação e mensagem "Tempo inválido…" |
| UC01 FA01 | 🟡 | Iniciar já usa padrão | Falta botão "Início Rápido" explícito |
| CA_HU01_1 | ❌ | — | Meta diária/semanal |
| CA_HU01_2 | ❌ | — | Horário específico da tarefa |
| CA_HU01_3 + BDD | ❌ | — | Notificação com antecedência configurável |
| CA_HU02_1 | ❌ | — | Foco e pausa independentes |
| CA_HU02_2 | 🟡 | Círculo anima por segundo | Deriva quando aba fica em segundo plano |
| CA_HU02_3 | ❌ | Só modal ao fim do foco | Alerta som/notificação no fim de foco e pausa |
| BDD HU02 | ❌ | — | 30:00 + status "Em Foco" |
| CA_HU03_1/2/3 + BDD | ❌ | — | Aba "Resumos", gráfico, card de dicas IA contextual |

## Parte B — Limitações do web e alternativas
- RF06: navegador não bloqueia outros apps/notificações. Alternativa: modo zen em tela cheia, Wake Lock (tela não apaga), aviso ao sair da aba, lembrete para ativar "Não Perturbe"; botão para sair.
- RF04 / CA_HU01_3: notificação com app fechado exige PWA + Web Push + servidor de envio; no iPhone só funciona com o app instalado na tela inicial (iOS 16.4+). Com app aberto: Notification API + som.
- Timer em segundo plano: navegadores reduzem o ritmo; calcular pelo horário de término resolve.
- RF10: postar direto em X/Instagram/Facebook exige apps aprovados e OAuth. Alternativa: Web Share API com imagem gerada do progresso + links de compartilhamento.
- RF02 fusos: gravar em UTC com fuso do usuário e exibir no horário local.

## Parte C — Resumo
- Alta (RF01–05, RNF01): ~25% (RF01 e RNF01 quase prontos; resto ausente)
- Média (RF06, RF07, RNF02–04): ~15%
- Baixa (RF08–10, RNF05): ~10%
- Riscos: sem backend nada persiste; push no iOS; bloqueio de apps inviável no web; dados fixos podem mascarar progresso na apresentação; ausência de testes.

## Parte D — Backlog

**Marco 1 — Núcleo (auth, Pomodoro, tarefas)**
- T01 Ativar Lovable Cloud — RF07 — P — dep: —
- T02 Cadastro/login/logout reais + rotas protegidas + perfil — RF07 — M — dep T01. Pronto: Dado conta nova, Quando entro, Então vejo /home; deslogado em /home volta ao login.
- T03 Timer preciso (horário de término), botão reiniciar, status "Em Foco/Pausa" — RF01, CA_HU02_2 — P.
- T04 Tela de personalização do ciclo + Início Rápido + validação 3a, salvar preferências — RF03, UC01, CA_HU02_1, BDD HU02 — M — dep T02, T03. Pronto: foco 30 → inicia em 30:00 "Em Foco"; foco 0 → mensagem de erro.
- T05 Tarefas: criar/editar/excluir com data, hora, fuso, tempo estimado; progresso somado pelo timer — RF02, CA_HU01_2 — G — dep T02.
- T06 Registrar sessões concluídas no banco — base RF09/RNF05 — P — dep T02, T03.

**Marco 2 — Metas e alertas**
- T07 Metas curto/médio/longo e diária/semanal, tarefas vinculadas (substitui dados fixos de Missões) — RF05, CA_HU01_1 — G — dep T05.
- T08 Som + notificação no fim de foco/pausa (permissão) — RF04, CA_HU02_3 — M — dep T03.
- T09 PWA instalável — RNF04/RF04 — M.
- T10 Lembrete de tarefa com antecedência (Web Push agendado) — CA_HU01_3 + BDD — G — dep T05, T08, T09.
- T11 Modo zen (tela cheia, Wake Lock, desativável) — RF06 — M — dep T03.

**Marco 3 — Relatórios e IA**
- T12 Aba "Resumos" com gráfico semanal de horas e tarefas — RF09, CA_HU03_1 — M — dep T06.
- T13 Card de dicas IA a partir de metas/tarefas/sessões — RF08, CA_HU03_2/3 — M — dep T07, T12.

**Marco 4 — Extras**
- T14 Tema claro/escuro salvo por usuário — RNF02 — M — dep T02.
- T15 XP, streak e ranking reais — RNF05 — G — dep T06.
- T16 Compartilhar progresso (Web Share) — RF10 — P — dep T12.
- T17 Ajustes de telas pequenas + testes das regras (timer, validação, XP) — RNF04/RNF03 — M.

Após aprovar este relatório, diga qual marco devo implementar primeiro (sugestão: Marco 1).
