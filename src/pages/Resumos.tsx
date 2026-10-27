import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock3, CheckCheck, Timer, Sparkles, RefreshCw, CalendarDays } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useWeeklySessions, useTasks, useFocusInsights } from '@/hooks/useAppData';
import { weeklyReport, reportWeek, focusChange, formatFocus } from '@/lib/reports';

const Resumos = () => {
  const [offset, setOffset] = useState(0);
  const sessions = useWeeklySessions(offset);
  const tasks = useTasks();
  const insights = useFocusInsights(offset, sessions.isSuccess && tasks.isSuccess);
  const { start, end, previous } = reportWeek(offset);
  const last = new Date(end); last.setDate(last.getDate() - 1);
  const report = weeklyReport(sessions.data ?? [], tasks.data ?? [], start);
  const before = weeklyReport(sessions.data ?? [], tasks.data ?? [], previous);
  const change = focusChange(report.minutes, before.minutes);
  const pending = sessions.isPending || tasks.isPending;
  const failed = sessions.isError || tasks.isError;
  const advice = insights.refresh.data ?? insights.data;
  const insightError = insights.refresh.error ?? insights.error;
  const loadingAdvice = insights.isFetching || insights.refresh.isPending;
  const date = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  return <>
    <main className="min-h-screen bg-background pb-28">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div><h1 className="font-display text-2xl font-semibold">Resumos</h1><p className="text-sm text-muted-foreground mt-1">Seu ritmo, semana a semana.</p></div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" aria-label="Semana anterior" disabled={offset <= -51} onClick={() => setOffset(v => v - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm text-center min-w-36">{date(start)} — {date(last)}</span>
            <Button size="icon" variant="outline" aria-label="Próxima semana" disabled={offset === 0} onClick={() => setOffset(v => v + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </header>
        {pending && <p role="status" className="text-muted-foreground">Carregando seu resumo…</p>}
        {failed && <div role="alert" className="space-y-3"><p className="text-destructive">Não foi possível carregar seu histórico.</p><Button variant="outline" onClick={() => { sessions.refetch(); tasks.refetch(); }}>Tentar novamente</Button></div>}
        {!pending && !failed && <>
          <section aria-label="Totais da semana" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Tempo de foco', value: formatFocus(report.minutes), icon: Clock3 },
              { label: 'Pomodoros', value: report.pomodoros, icon: Timer },
              { label: 'Tarefas concluídas', value: report.tasks, icon: CheckCheck },
            ].map(({label,value,icon:Icon}) => <div key={label} className="night-card p-5"><Icon strokeWidth={1.5} className="w-5 h-5 text-primary mb-4" /><p className="font-display text-2xl font-semibold tabular-nums">{value}</p><p className="text-sm text-muted-foreground mt-1">{label}</p></div>)}
          </section>
          <section className="space-y-4" aria-label="Gráfico semanal">
            <div className="flex justify-between items-start gap-3 flex-wrap"><h2 className="font-display text-xl font-semibold">Horas focadas</h2><span className="text-sm text-muted-foreground">{offset === 0 ? 'Semana em andamento' : `${report.activeDays} dias com foco`}</span></div>
            <ChartContainer className="h-64 w-full aspect-auto" config={{hours:{label:'Horas de foco',color:'hsl(var(--primary))'}}}>
              <BarChart accessibilityLayer data={report.days.map(d=>({...d,hours:d.minutes/60}))} margin={{left:0,right:8,top:12,bottom:0}}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={12} />
                <YAxis width={40} tickLine={false} axisLine={false} tickFormatter={v=>`${v}h`} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent labelFormatter={(_,payload)=>payload?.[0]?.payload.date} formatter={(_, __, item)=><span>{formatFocus(item.payload.minutes)} · {item.payload.pomodoros} pomodoros · {item.payload.tasks} tarefas</span>} />} />
                <Bar dataKey="hours" fill="var(--color-hours)" radius={[5,5,0,0]} maxBarSize={40} isAnimationActive={false} />
              </BarChart>
            </ChartContainer>
            {report.pomodoros === 0 && <p className="text-sm text-muted-foreground">Nenhuma sessão de foco concluída nesta semana.</p>}
            <div className="border-t border-border pt-4 flex items-start gap-3"><CalendarDays strokeWidth={1.5} className="w-5 h-5 text-primary shrink-0 mt-0.5" /><div className="text-sm space-y-1"><p>{change === null ? 'A semana anterior ainda não tem foco registrado para comparação.' : `${change > 0 ? '+' : ''}${change}% de tempo de foco em relação à semana anterior.`}</p><p className="text-muted-foreground">Semana anterior: {formatFocus(before.minutes)} · {before.pomodoros} pomodoros · {before.tasks} tarefas.{offset === 0 && ' A comparação inclui uma semana ainda em andamento.'}</p></div></div>
            <details className="text-sm"><summary className="cursor-pointer text-muted-foreground">Detalhes por dia</summary><div className="overflow-x-auto mt-3"><table className="w-full text-left"><thead className="text-muted-foreground"><tr><th className="py-2">Dia</th><th>Foco</th><th>Pomodoros</th><th>Tarefas</th></tr></thead><tbody>{report.days.map(d=><tr key={d.date} className="border-t border-border"><td className="py-2">{d.date}</td><td>{formatFocus(d.minutes)}</td><td>{d.pomodoros}</td><td>{d.tasks}</td></tr>)}</tbody></table></div></details>
            {tasks.data?.some(t=>t.done && !t.completed_at) && <p className="text-xs text-muted-foreground">Tarefas antigas sem data de conclusão não entram nos totais semanais.</p>}
          </section>
          <section className="border-t border-border pt-6 space-y-4" aria-label="Sugestões de Lovable AI">
            <div className="flex items-center justify-between gap-3"><h2 className="font-display text-xl font-semibold flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" strokeWidth={1.5} />Seu próximo passo</h2><Button variant="ghost" size="icon" aria-label="Atualizar sugestões" disabled={loadingAdvice} onClick={()=>insights.refresh.mutate()}><RefreshCw className="w-4 h-4" /></Button></div>
            <p className="text-xs text-muted-foreground">Lovable AI · com base nas suas metas, tarefas e sessões</p>
            {loadingAdvice && <p role="status" className="text-muted-foreground">Preparando suas sugestões…</p>}
            {!loadingAdvice && insightError && <div role="alert" className="space-y-3"><p className="text-destructive break-words">{insightError.message}</p><Button variant="outline" onClick={()=>insights.refresh.mutate()}>Tentar novamente</Button></div>}
            {advice && <><p className="text-sm leading-relaxed">{advice.advice.summary}</p><ul className="space-y-3">{advice.advice.tips.map((tip,i)=><li key={i} className="night-card p-5 space-y-2"><h3 className="font-display font-semibold break-words">{tip.title}</h3><p className="text-sm text-muted-foreground leading-relaxed break-words">{tip.detail}</p></li>)}</ul><p className="text-xs text-muted-foreground">Gerado em {new Date(advice.generated_at).toLocaleString('pt-BR')} · sugestões, não mudanças nas suas metas.</p></>}
          </section>
        </>}
      </div>
    </main><BottomNav />
  </>;
};
export default Resumos;
