# Marco 1 — Núcleo (foco desktop)

Recursos só de celular (PWA, push, Wake Lock) ficam fora por enquanto.

## O que o usuário vai ter
1. **Conta real**: criar conta com nome, e-mail e senha (entra direto, sem confirmar e-mail), entrar e sair. Senha protegida com hash pelo Lovable Cloud. Telas internas só abrem logado; o Perfil mostra o nome e e-mail reais e tem botão "Sair".
2. **Timer confiável**: conta pelo horário de término (não atrasa com a aba em segundo plano), botão "Reiniciar" e status visível "Em Foco" / "Em Pausa" / "Descanso".
3. **Ciclo Pomodoro personalizável** (UC01): ao clicar Iniciar abre uma janela com tempo de foco, pausa curta, pausa longa e botões "Iniciar" e "Início Rápido" (25/5/15). Foco zero ou negativo mostra "Tempo inválido. O tempo de foco deve ser maior que zero." Os tempos ficam salvos na conta.
4. **Tarefas**: nova página "Tarefas" (no menu) para criar, editar, concluir e excluir tarefas com nome, data, horário, fuso e tempo estimado. Na home, escolhe-se a tarefa atual; cada minuto de foco soma no progresso dela.
5. **Histórico de sessões**: cada sessão de foco concluída é gravada (base para relatórios e XP nos próximos marcos). A pontuação diária da home passa a vir dessas sessões.

## Critérios de pronto
- Dado conta nova, Quando entro, Então vejo a home; deslogado ao abrir /home volto ao login.
- Dado foco de 30 min, Quando clico Iniciar, Então o timer mostra 30:00 e status "Em Foco".
- Dado foco 0, Quando clico Iniciar, Então vejo a mensagem de tempo inválido e posso corrigir.
- Dado tarefa de 200 min com 60 feitos, Quando concluo 25 min de foco nela, Então mostra 85/200.
- Dado tarefa às 14:00 criada em São Paulo, Então ela aparece às 14:00 no horário local.

## Detalhes técnicos
- Ativar Lovable Cloud; habilitar login por e-mail com auto-confirmação.
- Tabelas (com GRANT + RLS por `auth.uid()`):
  - `profiles` (id → auth.users, display_name), criada por trigger no cadastro a partir do nome enviado.
  - `pomodoro_settings` (user_id PK, focus_minutes, short_break_minutes, long_break_minutes, CHECK > 0).
  - `tasks` (id, user_id, title, scheduled_at timestamptz, timezone text, estimated_minutes, completed_minutes, done, created_at).
  - `focus_sessions` (id, user_id, task_id null, mode, minutes, completed_at).
- `AuthProvider` + `ProtectedRoute`; Login com abas Entrar/Criar conta; Perfil com dados reais.
- `useTimer` refeito com `endAt` (Date.now) e tick de 250 ms; regra de validação em função pura.
- Dados via React Query (hooks `useTasks`, `useSettings`, `useSessions`).
- Testes (vitest) para: validação de tempo, cálculo do timer por horário de término, soma de minutos na tarefa.
- Registrar decisões em `AGENTS.md`.
