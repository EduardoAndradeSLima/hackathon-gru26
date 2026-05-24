import { useEffect, useState } from 'react';
import { Building2, ClipboardCheck, Home, Users } from 'lucide-react';
import AlertCard from '../components/AlertCard.jsx';
import DashboardCard from '../components/DashboardCard.jsx';
import Loading from '../components/Loading.jsx';
import { ChartPanel, SimpleBarChart, SimplePieChart } from '../components/Charts.jsx';
import { api } from '../services/api.js';

export default function DashboardGerencial() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data } = await api.get('/dashboard');
        if (active) {
          setDashboard(data);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Nao foi possivel carregar os indicadores.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
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
    return <Loading label="Carregando indicadores" />;
  }

  if (error || !dashboard) {
    return <AlertCard title="Indicadores indisponiveis" message={error || 'Nao foi possivel carregar o dashboard gerencial.'} tone="alto" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-guarulhos-700">Dashboard gerencial</p>
        <h1 className="mt-1 text-3xl font-bold text-civic-ink">Indicadores estratégicos</h1>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard title="Cidadãos acompanhados" value={dashboard.cards.cidadaos_acompanhados} icon={Users} />
        <DashboardCard title="OSCs ativas" value={dashboard.cards.oscs_ativas} icon={Building2} tone="green" />
        <DashboardCard title="Triagens ILPI" value={dashboard.cards.triagens_ilpi || 0} icon={ClipboardCheck} tone="yellow" />
        <DashboardCard title="Vagas ILPI disponíveis" value={dashboard.cards.vagas_disponiveis} icon={Home} tone="green" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ChartPanel title="Demanda por região">
          <SimpleBarChart data={dashboard.charts.demanda_por_regiao} xKey="regiao" dataKey="total" />
        </ChartPanel>
        <ChartPanel title="Prioridade da fila">
          <SimplePieChart data={dashboard.charts.prioridades} nameKey="prioridade" dataKey="total" />
        </ChartPanel>
        <ChartPanel title="Triagem ILPI por grau">
          <SimpleBarChart data={dashboard.charts.triagens_por_grau || []} xKey="grau" dataKey="total" />
        </ChartPanel>
        <ChartPanel title="Indice de vulnerabilidade ILPI">
          <SimplePieChart data={dashboard.charts.triagens_por_risco || []} nameKey="risco" dataKey="total" />
        </ChartPanel>
      </section>

      <section className="surface p-4">
        <h2 className="text-base font-bold">Mapa de calor operacional</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {dashboard.charts.demanda_por_regiao.map((item) => (
            <div key={item.regiao} className="rounded-card border border-civic-line bg-guarulhos-50 p-4">
              <p className="font-bold">{item.regiao}</p>
              <div className="mt-3 h-3 rounded-full bg-slate-200">
                <div className="h-3 rounded-full bg-guarulhos-500" style={{ width: `${Math.min(item.total * 25, 100)}%` }} />
              </div>
              <p className="mt-2 text-sm text-civic-muted">{item.total} demandas registradas</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
