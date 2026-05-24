import { Link } from 'react-router-dom';
import { ArrowRight, Building2, ClipboardCheck, Search, ShieldCheck } from 'lucide-react';
import BrandLogo from '../components/BrandLogo.jsx';

const highlights = [
  { title: 'Triagem ILPI padronizada', text: 'Checklist unico para idade, mobilidade, alimentacao, higiene, cognicao, cuidador, moradia, renda e saude.', icon: ClipboardCheck },
  { title: 'Decisao humana assistida', text: 'O sistema sugere grau, prioridade e vaga compativel, mas a assinatura final continua com a equipe tecnica.', icon: ShieldCheck },
  { title: 'Fila e vagas em tempo real', text: 'Status do cidadao, encaminhamento e disponibilidade da vaga ficam sincronizados para reduzir retrabalho.', icon: Building2 }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-civic-ink">
      <header className="border-b border-guarulhos-600 bg-guarulhos-500">
        <div className="page-shell flex min-h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <BrandLogo compact />
          </Link>
          <nav className="flex items-center gap-2" aria-label="Acesso rapido">
            <Link className="btn-secondary hidden sm:inline-flex" to="/triagem">
              <Search size={18} aria-hidden="true" />
              Triagem ILPI
            </Link>
            <Link className="btn bg-guarulhos-900 text-white hover:bg-guarulhos-700" to="/login">
              Area da gestao
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
                Plataforma publica para vagas ILPI
              </p>
              <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                FacilitaGRU
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">
                Triagem objetiva, prioridade justa e encaminhamento assistido para idosos que precisam de acolhimento institucional.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="btn bg-white text-guarulhos-900 hover:bg-guarulhos-50" to="/triagem">
                  <Search size={18} aria-hidden="true" />
                  Iniciar triagem ILPI
                </Link>
                <Link className="btn border border-white/50 bg-white/10 text-white hover:bg-white/20" to="/login">
                  Gestao institucional
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-8">
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
              <p className="text-sm font-bold uppercase text-guarulhos-700">Diferencial do projeto</p>
              <h2 className="mt-2 text-3xl font-bold text-civic-ink">Uma fila ILPI mais justa, rastreavel e rapida.</h2>
              <p className="mt-4 max-w-3xl leading-8 text-civic-muted">
                O FacilitaGRU calcula grau de dependencia e indice de vulnerabilidade, identifica vagas compativeis e avisa a equipe regional para avaliacao. Isso reduz dados incompletos, encaminhamentos errados e dependencia de processos manuais.
              </p>
            </div>
            <div className="surface p-5">
              <h3 className="text-base font-bold">Fluxo vencedor</h3>
              <ol className="mt-4 space-y-3 text-sm text-civic-muted">
                <li className="rounded-card bg-guarulhos-50 p-3"><strong className="text-civic-ink">1.</strong> Triagem ILPI guiada e obrigatoria.</li>
                <li className="rounded-card bg-guarulhos-50 p-3"><strong className="text-civic-ink">2.</strong> Classificacao automatica de grau e risco.</li>
                <li className="rounded-card bg-guarulhos-50 p-3"><strong className="text-civic-ink">3.</strong> Pre-encaminhamento com validacao humana.</li>
              </ol>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
