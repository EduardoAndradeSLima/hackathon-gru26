import { Link } from 'react-router-dom';
import { ArrowRight, Building2, ClipboardCheck, Search, ShieldCheck } from 'lucide-react';

const highlights = [
  { title: 'Dados centralizados', text: 'Unifica vagas, fila, encaminhamentos e historico em uma unica base confiavel.', icon: Building2 },
  { title: 'Decisao assistida', text: 'Sugere opcoes compativeis e explica a recomendacao para a equipe tecnica.', icon: ClipboardCheck },
  { title: 'Transparencia', text: 'Registra logs, status e auditoria para rastreabilidade institucional.', icon: ShieldCheck }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-civic-ink">
      <header className="border-b border-civic-line bg-white">
        <div className="page-shell flex min-h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-card bg-guarulhos-700 text-white">
              <Building2 size={20} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-bold">Guarulhos Social Vagas</span>
              <span className="block text-xs font-semibold text-guarulhos-700">Prefeitura de Guarulhos</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Acesso rapido">
            <Link className="btn-secondary hidden sm:inline-flex" to="/triagem">
              <Search size={18} aria-hidden="true" />
              Buscar atendimento
            </Link>
            <Link className="btn-primary" to="/login">
              Área da gestão
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-photo">
          <div className="page-shell flex min-h-[620px] items-center py-14">
            <div className="max-w-3xl text-white">
              <p className="mb-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-semibold ring-1 ring-white/30">
                Plataforma socioassistencial integrada
              </p>
              <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Guarulhos Social Vagas
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-50">
                Gestão inteligente para conectar cidadãos, CRAS, CREAS, Central de Vagas e OSCs com mais agilidade, segurança e clareza.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="btn bg-white text-guarulhos-900 hover:bg-blue-50" to="/triagem">
                  <Search size={18} aria-hidden="true" />
                  Buscar atendimento
                </Link>
                <Link className="btn border border-white/50 bg-white/10 text-white hover:bg-white/20" to="/login">
                  Gestão institucional
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-8">
          <div className="page-shell grid gap-4 md:grid-cols-3">
            {highlights.map(({ title, text, icon: Icon }) => (
              <article key={title} className="surface p-5">
                <span className="grid size-11 place-items-center rounded-card bg-guarulhos-50 text-guarulhos-700">
                  <Icon size={21} aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-civic-muted">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="page-shell py-12">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase text-guarulhos-700">Serviços e orientação</p>
              <h2 className="mt-2 text-3xl font-bold text-civic-ink">Acesso mais simples para quem precisa e operação mais clara para quem atende.</h2>
              <p className="mt-4 max-w-3xl leading-8 text-civic-muted">
                A triagem inicial orienta o cidadão, identifica vulnerabilidades e prepara uma recomendação para análise profissional. A gestão acompanha fila, ocupação, gargalos e encaminhamentos em tempo real.
              </p>
            </div>
            <div className="surface p-5">
              <h3 className="text-base font-bold">Fluxo integrado</h3>
              <ol className="mt-4 space-y-3 text-sm text-civic-muted">
                <li className="rounded-card bg-slate-50 p-3"><strong className="text-civic-ink">1.</strong> Cidadão ou profissional preenche a triagem.</li>
                <li className="rounded-card bg-slate-50 p-3"><strong className="text-civic-ink">2.</strong> O sistema sugere serviços, OSCs e vagas compatíveis.</li>
                <li className="rounded-card bg-slate-50 p-3"><strong className="text-civic-ink">3.</strong> A equipe humana valida e encaminha com auditoria.</li>
              </ol>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
