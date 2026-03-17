import React from 'react';
import { type User } from '../utils/reportsStore';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  user?: User | null;
  onLogout?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, user, onLogout }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header - Restored previous design */}
      <header className="glass-header">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4 px-6">
          <div className="flex items-center gap-3">
            <div className="text-primary flex items-center">
              <span className="material-symbols-outlined text-3xl">shield_person</span>
            </div>
            <h1 className="text-lg font-bold leading-tight tracking-tight text-primary">
              Canal de Denúncia <span className="text-primary/60 font-black">Anónima</span>
            </h1>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            {user ? (
              <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-tighter">{user.fullName}</span>
                  <button 
                    onClick={onLogout}
                    className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    Encerrar Sessão
                  </button>
                </div>
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-black">
                  {user.fullName.charAt(0)}
                </div>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('login')}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
              >
                <span className="material-symbols-outlined text-sm">login</span>
                Aceder ao Painel
              </button>
            )}
          </div>
          <div className="md:hidden">
            <span className="material-symbols-outlined text-primary">menu</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero Section - RESTORED ORIGINAL DESIGN */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-primary">
            <img 
              alt="Canal de Denúncia Anónima" 
              className="h-full w-full object-cover opacity-40" 
              src="/R.png" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/90 to-primary/60" />
          </div>
          <div className="relative z-10 w-full">
            <div className="mx-auto max-w-7xl px-6 pt-20 pb-16">
              <div className="max-w-3xl space-y-8 animate-in">
                <div className="inline-flex items-center rounded-full bg-accent-emerald/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-accent-emerald border border-accent-emerald/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald mr-2 animate-pulse"></span>
                  Plataforma Segura e Auditada
                </div>
                <h1 className="text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
                  Integridade e <br/>
                  <span className="text-accent-emerald">Transparência</span> Total
                </h1>
                <p className="text-xl leading-relaxed text-white/80 max-w-2xl font-medium">
                  Um canal seguro para denúncias confidenciais e anônimas. Protegemos a sua identidade enquanto ajudamos a manter os mais altos padrões de ética organizacional.
                </p>
                <div className="flex flex-wrap gap-5 pt-4">
                  <button 
                    onClick={() => onNavigate('new-report')}
                    className="btn-primary"
                  >
                    <span className="material-symbols-outlined">edit_document</span>
                    Registrar Denúncia
                  </button>
                  <button 
                    onClick={() => onNavigate('track-report')}
                    className="btn-secondary"
                  >
                    <span className="material-symbols-outlined">search</span>
                    Acompanhar Processo
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative element */}
          <div className="absolute -bottom-24 -right-24 h-96 w-96 bg-accent-emerald/10 blur-[120px] rounded-full"></div>
        </section>

        <div className="mx-auto max-w-7xl">
          {/* Stats Section */}
          <section className="px-4 md:px-6 py-16 md:py-24 mt-4 md:mt-8 relative z-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {/* Card 1 */}
              <div className="bg-white p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 lg:gap-8">
                <div className="w-12 h-12 md:w-16 lg:w-16 md:h-16 rounded-xl lg:rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl md:text-2xl lg:text-3xl">verified</span>
                </div>
                <div>
                  <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Taxa de Resolução</p>
                  <p className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-800 leading-none">98%</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">Casos finalizados</p>
                </div>
              </div>
              {/* Card 2 */}
              <div className="bg-white p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 lg:gap-8">
                <div className="w-12 h-12 md:w-16 lg:w-16 md:h-16 rounded-xl lg:rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl md:text-2xl lg:text-3xl">schedule</span>
                </div>
                <div>
                  <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Tempo de Resposta</p>
                  <p className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-800 leading-none">&lt; 48h</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">Média até triagem</p>
                </div>
              </div>
              {/* Card 3 */}
              <div className="bg-slate-900 p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 lg:gap-8 sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 md:w-16 lg:w-16 md:h-16 rounded-xl lg:rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl md:text-2xl lg:text-3xl text-emerald-400">lock</span>
                </div>
                <div>
                  <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/50 mb-1">Protecção de Dados</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-black text-white italic leading-tight">Encriptação AES-256</p>
                  <p className="text-xs font-medium text-white/50 mt-1">Segurança bancária</p>
                </div>
              </div>
            </div>
          </section>

          {/* Commitments Section - Restored previous aesthetic */}
          <section className="px-6 py-20 pb-32">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-black tracking-tight text-primary">Padrões de Referência</h2>
              <p className="text-slate-500 mt-4 font-medium">Nossa plataforma segue as melhores práticas de conformidade e segurança da informação.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3 text-center">
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-slate-50 text-accent-emerald">
                  <span className="material-symbols-outlined text-3xl">security</span>
                </div>
                <h3 className="text-xl font-bold text-primary">Dados Encriptados</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Proteção contínua para prevenir acessos não autorizados a informações sensíveis.</p>
              </div>
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-slate-50 text-accent-emerald">
                  <span className="material-symbols-outlined text-3xl">gavel</span>
                </div>
                <h3 className="text-xl font-bold text-primary">Compliance Ético</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Em total conformidade com a legislação de denúncia e proteção de dados em Angola.</p>
              </div>
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-slate-50 text-accent-emerald">
                  <span className="material-symbols-outlined text-3xl">visibility_off</span>
                </div>
                <h3 className="text-xl font-bold text-primary">Confidencialidade</h3>
                <p className="text-slate-500 text-sm leading-relaxed">O sistema não recolhe metadados nem rastreia a origem digital do denunciante.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="col-span-1 md:col-span-2 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="text-primary flex items-center h-10 w-10 bg-primary/5 rounded-lg justify-center">
                    <span className="material-symbols-outlined text-2xl">shield_person</span>
                  </div>
                  <span className="text-xl font-black tracking-tighter text-primary">CANAL DE ÉTICA</span>
                </div>
                <p className="max-w-xs text-sm text-slate-500 italic font-medium">
                  Atuamos para promover a verdade e a integridade corporativa em prol da transparência.
                </p>
            </div>
            <div>
              <h4 className="mb-6 text-[10px] font-black uppercase tracking-widest text-primary">Apoio ao Canal</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><a className="hover:text-accent-emerald cursor-pointer transition-colors">Termos de Privacidade</a></li>
                <li><a className="hover:text-accent-emerald cursor-pointer transition-colors">Código de Ética</a></li>
                <li><a className="hover:text-accent-emerald cursor-pointer transition-colors">Como funciona?</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-50 flex flex-col items-center justify-between md:flex-row">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">© 2026 Plataforma de Denúncia Anónima. Todos os direitos reservados.</p>
            <div className="mt-4 flex gap-6 md:mt-0">
               <span className="material-symbols-outlined text-slate-300 text-xl cursor-pointer hover:text-primary transition-colors">public</span>
               <span className="material-symbols-outlined text-slate-300 text-xl cursor-pointer hover:text-primary transition-colors">verified_user</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

