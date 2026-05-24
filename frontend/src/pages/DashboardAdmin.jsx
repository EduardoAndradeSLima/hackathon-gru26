import { useEffect, useState } from 'react';
import { AlertTriangle, Clock, ClipboardList, Home, Users } from 'lucide-react';
import AlertCard from '../components/AlertCard.jsx';
import DashboardCard from '../components/DashboardCard.jsx';
import Loading from '../components/Loading.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { ChartPanel, SimpleBarChart, SimplePieChart } from '../components/Charts.jsx';
import { api } from '../services/api.js';

export default function DashboardAdmin() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await api.get('/dashboard');
      if (active) {
        setDashboard(data);
        setLoading(false);
      }
    }

    load();
    const interval = window.setInterval(load, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  if (loading) {
    return <Loading label="Carregando painel" />;
  }

  const cards = dashboard.cards;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-guarulhos-700">Painel administrativo</p>
        <h1 className="mt-1 text-3xl font-bold text-civic-ink">Visão em tempo real</h1>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Vagas disponíveis" value={cards.vagas_disponiveis} icon={Home} tone="green" description="Atualizadas pelas OSCs e Central." />
        <DashboardCard title="Vagas ocupadas" value={cards.vagas_ocupadas} icon={ClipboardList} tone="gray" description="Ocupação registrada no sistema." />
        <DashboardCard title="Tempo médio" value={`${cards.tempo_medio_espera} dias`} icon={Clock} tone="yellow" description="Baseado nas solicitações ativas." />
        <DashboardCard title="Pendências" value={cards.solicitacoes_pendentes} icon={AlertTriangle} tone="red" description="Fila aguardando análise ou decisão." />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ChartPanel title="Fila por serviço">
          <SimpleBarChart data={dashboard.charts.fila_por_servico} xKey="servico" dataKey="total" />
        </ChartPanel>
        <ChartPanel title="Ocupação por status">
          <SimplePieChart data={dashboard.charts.ocupacao_por_status} nameKey="status" dataKey="total" />
        </ChartPanel>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="surface p-4">
          <h2 className="mb-4 text-base font-bold">Gargalos</h2>
          <div className="space-y-3">
            {dashboard.gargalos.length === 0 && <p className="text-sm text-civic-muted">Nenhum gargalo crítico no momento.</p>}
            {dashboard.gargalos.map((item) => (
              <div key={item.servico} className="flex items-center justify-between rounded-card bg-guarulhos-50 p-3">
                <div>
                  <p className="font-semibold">{item.servico}</p>
                  <p className="text-sm text-civic-muted">{item.total} solicitações para {item.vagas_disponiveis} vagas disponíveis</p>
                </div>
                <StatusBadge value={item.total > 3 ? 'alta' : 'media'} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {dashboard.alertas_criticos.map((alerta) => (
            <AlertCard
              key={alerta.id}
              title={alerta.cidadao_nome ? `${alerta.tipo_servico} - ${alerta.cidadao_nome}` : alerta.tipo_servico}
              message={alerta.mensagem}
              tone={alerta.prioridade}
            />
          ))}
          {!dashboard.alertas_criticos.length && (
            <AlertCard title="Sem alertas críticos" message="Não há solicitações com risco crítico ou espera acima do parâmetro." />
          )}
        </div>
      </section>

      <section className="surface p-4">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
          <Users size={18} className="text-guarulhos-700" />
          OSCs com maior demanda
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {dashboard.oscs_maior_demanda.slice(0, 3).map((osc) => (
            <article key={osc.nome} className="rounded-card border border-civic-line p-4">
              <p className="font-bold">{osc.nome}</p>
              <p className="mt-2 text-sm text-civic-muted">{osc.encaminhamentos} encaminhamentos e {osc.vagas} vagas cadastradas</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
