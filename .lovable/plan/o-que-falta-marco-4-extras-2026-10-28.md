# O que falta — Marco 4 (Extras)

Os marcos 1, 2 e 3 estão prontos. Falta o Marco 4, e há telas que ainda mostram números de exemplo.

## Ainda com números de exemplo
- Home: "Streak 5 dias".
- Perfil: XP 1250, 5 dias, 12 conquistas e "Atividade Recente".
- Amigos: placar com pessoas de exemplo.

## Itens do Marco 4
1. **Stardust, Constelação e Fase da lua de verdade (T15):** Stardust = minutos de foco concluídos. Constelação = dias seguidos com pelo menos um foco. Fase da lua = nível calculado pelo Stardust (Nova → Supernova). Home e Perfil passam a mostrar esses valores reais, e a atividade recente vem das sessões.
2. **Céu Coletivo / Amigos (T15):** adicionar amigos pelo e-mail, aceitar ou recusar convites e ver o ranking semanal real. Cada pessoa só vê nome e Stardust dos amigos, nunca as tarefas deles.
3. **Compartilhar progresso (T16):** botão em Resumos que usa o compartilhamento do navegador. Quando ele não existir, copia um texto com o resumo da semana.
4. **Telas pequenas e testes (T17):** o timer passa a se ajustar a telas estreitas, e as novas regras (Constelação, nível, ranking) ganham testes.

## Fora por decisão anterior
- Tema claro (T14): o design aprovado usa só o modo escuro. Fica fora, a menos que vocês peçam.
- PWA, lembretes com o app fechado e tela sempre acesa: adiados porque o foco agora é desktop.

## Detalhes técnicos
- Funções puras em `src/lib/gamification.ts` (streak por dia local, nível por Stardust), com testes no vitest.
- Tabela `friendships` (requester, addressee, status) com RLS para as duas partes. Uma função `security definer` devolve só o nome e o Stardust semanal dos amigos aceitos. Outra função faz a busca exata por e-mail para enviar o convite.
- Hooks novos em `useAppData.ts`. Web Share API com fallback para a área de transferência.
- Atualizar `AGENTS.md` e `roadmap.md`.
