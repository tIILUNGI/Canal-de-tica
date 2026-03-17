import React, { useState } from 'react';
import { type Report, type Message, type User, reportsStore } from '../utils/reportsStore';

interface TrackReportProps {
  onBack: () => void;
  user?: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const TrackReport: React.FC<TrackReportProps> = ({ onBack, user, onNavigate, onLogout }) => {
  const [protocol, setProtocol] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [userReports, setUserReports] = useState<Report[]>(user ? reportsStore.getReportsByUserId(user.id) : []);
  const [searchError, setSearchError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'denuncias' | 'perfil' | 'search'>(user ? 'denuncias' : 'search');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  // Removed useEffect synchronization because component now uses keys in App.tsx

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = reportsStore.getReportByProtocol(protocol.trim());
    if (found) {
      setSelectedReport(found);
      setSearchError('');
    } else {
      setSearchError('Protocolo não encontrado. Verifique os dados e tente novamente.');
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedReport) return;

    const msg: Message = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    reportsStore.addMessage(selectedReport.protocol, msg);
    const updated = { 
      ...selectedReport, 
      messages: [...selectedReport.messages, msg], 
      lastUpdate: new Date().toISOString() 
    };
    setSelectedReport(updated);
    setNewMessage('');
    
    // Refresh user list if in dashboard
    if (user) {
       setUserReports(reportsStore.getReportsByUserId(user.id));
    }
  };

  const handleSaveProfile = () => {
    if (!user) return;
    reportsStore.updateUser(user.id, { fullName: editName, email: editEmail });
    setIsEditingProfile(false);
    // Reload to propagate changes to parent App state
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter text-slate-700">
      {/* Sidebar - Portal do Usuário */}
      {user && (
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="p-8">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm">shield_person</span>
                  </div>
                  <h1 className="text-sm font-black text-primary tracking-tighter uppercase">Painel <span className="text-slate-400">Privado</span></h1>
               </div>
            </div>
            
            <nav className="flex-1 px-6 space-y-2">
              <button 
                onClick={() => setActiveTab('denuncias')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'denuncias' ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50 font-bold'}`}
              >
                <span className="material-symbols-outlined text-lg">assignment</span>
                <span className="text-xs uppercase tracking-widest">Minhas Denúncias</span>
              </button>
              <button 
                onClick={() => setActiveTab('perfil')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'perfil' ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50 font-bold'}`}
              >
                <span className="material-symbols-outlined text-lg">person_edit</span>
                <span className="text-xs uppercase tracking-widest">Meu Perfil</span>
              </button>
              
              <div className="pt-8 mt-4 border-t border-slate-50">
                <button 
                  onClick={() => onNavigate('new-report')}
                  className="w-full bg-accent-emerald text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-accent-emerald/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Nova Participação
                </button>
              </div>
            </nav>

            <div className="p-6 border-t border-slate-50 space-y-2">
               <button onClick={onBack} className="w-full flex items-center gap-3 px-5 py-3 text-slate-400 hover:text-primary transition-all font-bold text-xs uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm">home</span>
                  Início
               </button>
               <button onClick={onLogout} className="w-full flex items-center gap-3 px-5 py-3 text-rose-400 hover:bg-rose-50 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Sair
               </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Responsive Header */}
        <header className="h-24 bg-white border-b border-slate-100 px-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            {!user && (
              <button onClick={onBack} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined">west</span>
              </button>
            )}
            {user && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 md:hidden flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">menu</span>
              </button>
            )}
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {activeTab === 'denuncias' ? 'Acompanhamento de Casos' : 
                 activeTab === 'perfil' ? 'Gestão de Identidade' : 'Rastreio de Protocolo'}
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Sistema Seguro e Criptografado</p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{user.fullName}</p>
                <span className="text-[9px] text-accent-emerald font-black uppercase flex items-center gap-1 mt-0.5">
                   <span className="h-1 w-1 bg-accent-emerald rounded-full animate-pulse"></span>
                   Ligação Segura
                </span>
              </div>
              <div className="h-12 w-12 bg-slate-100 text-primary rounded-2xl flex items-center justify-center font-black shadow-inner">
                 {user.fullName.charAt(0)}
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-10 bg-slate-50/30 custom-scrollbar">
          <div className="max-w-5xl mx-auto w-full animate-in fade-in duration-500">
            
            {/* VIEW: PESQUISA ANÓNIMA (Sem login) */}
            {activeTab === 'search' && !selectedReport && (
              <div className="py-20 flex flex-col items-center">
                 <div className="bg-white w-full max-w-2xl p-12 rounded-4xl shadow-2xl shadow-primary/5 border border-primary/5">
                    <div className="w-20 h-20 bg-primary/5 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                       <span className="material-symbols-outlined text-4xl">manage_search</span>
                    </div>
                    <div className="text-center mb-10">
                       <h3 className="text-2xl font-black text-slate-800 tracking-tight">Verificar Estado</h3>
                       <p className="text-slate-500 text-sm mt-2 font-medium">Use o seu protocolo para acompanhar o andamento da queixa.</p>
                    </div>
                    
                    <form onSubmit={handleSearch} className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Número do Protocolo</label>
                          <input 
                             type="text" 
                             value={protocol}
                             onChange={(e) => setProtocol(e.target.value.toUpperCase())}
                             placeholder="Ex: AO-2026-XXXX"
                             className="w-full px-8 py-5 rounded-2xl border-2 border-slate-50 focus:border-primary focus:bg-white bg-slate-50 transition-all font-mono font-bold text-xl outline-none"
                             required
                          />
                       </div>
                       {searchError && (
                         <p className="bg-rose-50 text-rose-500 p-4 rounded-xl text-xs font-bold text-center border border-rose-100 italic">
                            {searchError}
                         </p>
                       )}
                       <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                          Consultar Agora
                          <span className="material-symbols-outlined">send</span>
                       </button>
                    </form>
                 </div>
              </div>
            )}

            {/* VIEW: LISTA DE DENÚNCIAS (Logado) */}
            {activeTab === 'denuncias' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-slate-200 pb-8">
                   <div>
                      <h3 className="text-3xl font-black text-slate-800 tracking-tighter">Ocorrências Registadas</h3>
                      <p className="text-sm text-slate-400 font-medium">Lista cronológica das suas participações no canal.</p>
                   </div>
                   <div className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Total: {userReports.length}
                   </div>
                </div>

                {userReports.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5">
                    {userReports.map(r => (
                      <button 
                        key={r.id}
                        onClick={() => setSelectedReport(r)}
                        className="flex items-center justify-between p-8 bg-white rounded-4xl border border-slate-100 hover:border-primary/30 hover:shadow-2xl transition-all group overflow-hidden relative"
                      >
                        <div className="flex flex-col items-start gap-1 relative z-10">
                          <div className="flex items-center gap-3 mb-2">
                             <span className="bg-primary/5 px-3 py-1 rounded-lg text-[10px] font-black text-primary font-mono tracking-widest uppercase">#{r.protocol}</span>
                             <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                r.status === 'Novo' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
                                r.status === 'Em Análise' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                             }`}>{r.status}</span>
                          </div>
                          <span className="text-xl font-black text-slate-800 group-hover:text-primary transition-colors tracking-tight">{r.description}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                             <span className="material-symbols-outlined text-sm">calendar_today</span>
                             {new Date(r.createdAt).toLocaleDateString('pt-AO')}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 relative z-10">
                           {r.messages.length > 0 && (
                              <div className="flex flex-col items-center">
                                 <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <span className="material-symbols-outlined text-lg">forum</span>
                                 </div>
                                 <span className="text-[9px] font-black text-blue-500 mt-1 uppercase">{r.messages.length}</span>
                              </div>
                           )}
                           <span className="material-symbols-outlined text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-2 text-2xl">chevron_right</span>
                        </div>
                        {/* Interactive glow effect */}
                        <div className="absolute top-0 right-0 w-24 h-full bg-linear-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-32 text-center bg-white rounded-4xl border-2 border-dashed border-slate-100 flex flex-col items-center">
                     <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-5xl">edit_square</span>
                     </div>
                     <h4 className="text-xl font-black text-slate-400 uppercase tracking-tighter">Nenhuma Denúncia</h4>
                     <p className="text-sm text-slate-400 mt-2 font-medium">O seu histórico está vazio no momento.</p>
                     <button 
                        onClick={() => onNavigate('new-report')}
                        className="mt-8 text-primary font-black uppercase tracking-widest text-[10px] hover:underline"
                     >Submeter agora</button>
                  </div>
                )}
              </div>
            )}

            {/* VIEW: PERFIL (Logado) */}
            {activeTab === 'perfil' && user && (
               <div className="bg-white p-12 rounded-4xl border border-slate-100 shadow-sm animate-in zoom-in-95 duration-500">
                  <div className="flex items-center gap-10 mb-16 border-b border-slate-50 pb-16">
                     <div className="w-32 h-32 bg-primary/5 text-primary rounded-[2.5rem] flex items-center justify-center text-5xl font-black shadow-inner relative group">
                        {user.fullName.charAt(0)}
                        <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="material-symbols-outlined text-white">photo_camera</span>
                        </div>
                     </div>
                     {!isEditingProfile ? (
                       <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                             <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{user.fullName}</h3>
                             <span className="bg-accent-emerald/10 text-accent-emerald px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-accent-emerald/20">Verificado</span>
                          </div>
                          <p className="text-xl font-medium text-slate-400">{user.email}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 italic">Membro desde {new Date(user.createdAt).getFullYear()}</p>
                       </div>
                     ) : (
                       <div className="flex-1 space-y-5 animate-in slide-in-from-right-4">
                          <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                             <input 
                               type="text" 
                               value={editName} 
                               onChange={(e) => setEditName(e.target.value)}
                               className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl focus:border-primary outline-none font-bold"
                             />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Correio Electrónico</label>
                             <input 
                               type="email" 
                               value={editEmail} 
                               onChange={(e) => setEditEmail(e.target.value)}
                               className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl focus:border-primary outline-none font-bold"
                             />
                          </div>
                       </div>
                     )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-6">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Dados Consolidados</label>
                        <div className="grid grid-cols-2 gap-5">
                           <div className="bg-slate-50 p-8 rounded-3xl text-center border border-slate-100 shadow-inner">
                              <p className="text-4xl font-black text-primary tracking-tighter">{userReports.length}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Denúncias</p>
                           </div>
                           <div className="bg-slate-50 p-8 rounded-3xl text-center border border-slate-100 shadow-inner">
                              <p className="text-4xl font-black text-accent-emerald tracking-tighter">{userReports.filter(r => r.status === 'Concluído').length}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Resolvidas</p>
                           </div>
                        </div>
                     </div>
                     <div className="flex flex-col justify-center gap-4">
                        {!isEditingProfile ? (
                          <button 
                            onClick={() => setIsEditingProfile(true)} 
                            className="bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                          >
                             <span className="material-symbols-outlined text-lg">edit</span>
                             Actualizar Perfil
                          </button>
                        ) : (
                          <div className="flex gap-4">
                             <button 
                               onClick={handleSaveProfile} 
                               className="flex-1 bg-accent-emerald text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-accent-emerald/20 hover:scale-105 transition-all"
                             >Confirmar</button>
                             <button 
                               onClick={() => setIsEditingProfile(false)} 
                               className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                             >Anular</button>
                          </div>
                        )}
                        <p className="text-[9px] text-slate-400 font-bold uppercase text-center tracking-widest opacity-60">Sessão protegida por tokens de segurança</p>
                     </div>
                  </div>

                  <div className="mt-16 p-8 bg-amber-50/50 rounded-3xl border border-amber-100 flex gap-6 items-center">
                     <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">security_update_good</span>
                     </div>
                     <p className="text-xs text-amber-800 leading-relaxed font-medium">
                        <strong>Informação de Segurança:</strong> A sua identidade real permanece sob sigilo absoluto, protegida pela lei angolana de proteção de dados. A organização só tem acesso ao conteúdo descritivo das participações.
                     </p>
                  </div>
               </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL: DETALHES E CHAT INVESTIGATIVO */}
      {selectedReport && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-primary/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-[98vw] max-w-7xl h-[94vh] rounded-6xl shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-in zoom-in-95 duration-500">
            
            {/* Info Section */}
            <div className="flex-1 overflow-y-auto p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col gap-12 custom-scrollbar">
               <div className="flex items-center justify-between border-b border-slate-50 pb-10">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                       <span className="text-[11px] font-black text-primary font-mono bg-primary/5 px-3 py-1.5 rounded-lg uppercase tracking-widest border border-primary/10">Ref: #{selectedReport.protocol}</span>
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          selectedReport.status === 'Novo' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
                          selectedReport.status === 'Em Análise' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                       }`}>{selectedReport.status}</span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tighter leading-tight mt-4">{selectedReport.description}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedReport(null)} 
                    className="h-16 w-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm shrink-0"
                  >
                     <span className="material-symbols-outlined text-3xl">close</span>
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-10">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Monitorização</h4>
                        <div className="bg-slate-50/50 p-8 rounded-4xl border border-slate-100 space-y-6">
                           <div>
                              <p className="text-[10px] font-black text-primary uppercase mb-2">Progresso da Investigação</p>
                              <div className="flex items-center gap-4">
                                 <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden border border-slate-300 shadow-inner">
                                    <div 
                                      className="h-full bg-primary transition-all duration-1000 shadow-lg" 
                                      style={{ width: selectedReport.status === 'Novo' ? '20%' : selectedReport.status === 'Em Análise' ? '65%' : '100%' }}
                                    ></div>
                                 </div>
                                 <span className="text-sm font-black text-slate-800">{selectedReport.status === 'Novo' ? '20%' : selectedReport.status === 'Em Análise' ? '65%' : '100%'}%</span>
                              </div>
                           </div>
                           <div className="pt-6 border-t border-slate-200">
                              <p className="text-[10px] font-black text-primary uppercase mb-1">Área Incidente</p>
                              <p className="text-lg font-black text-slate-800 tracking-tight italic">{selectedReport.category}</p>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Conteúdo do Relato</h4>
                        <div className="bg-white p-10 rounded-4xl border border-slate-100 shadow-inner text-md text-slate-600 leading-relaxed font-medium italic relative overflow-hidden">
                           "{selectedReport.details}"
                           <div className="absolute bottom-4 right-4 text-slate-100 group-hover:text-primary/5 transition-colors">
                              <span className="material-symbols-outlined text-6xl">format_quote</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-10">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-2">Ficheiros de Suporte</h4>
                        {selectedReport.evidence ? (
                           selectedReport.evidence.startsWith('data:image') ? (
                              <div className="rounded-4xl overflow-hidden border-4 border-white shadow-2xl bg-white p-2 group transition-all hover:scale-[1.02]">
                                 <img src={selectedReport.evidence} alt="Evidência" className="w-full h-56 object-cover rounded-3xl" />
                                 <div className="p-4 text-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                       <span className="material-symbols-outlined text-sm">image_search</span>
                                       Digitalização_Evidencia_01
                                    </p>
                                 </div>
                              </div>
                           ) : (
                              <div className="p-6 bg-white rounded-3xl border-2 border-slate-100 flex items-center gap-6 group hover:border-primary transition-all cursor-pointer">
                                 <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-3xl">task</span>
                                 </div>
                                 <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-black truncate text-slate-700">{selectedReport.evidence}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Documento Digital Auditado</p>
                                 </div>
                              </div>
                           )
                        ) : (
                           <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-4xl bg-slate-50/50">
                              <span className="material-symbols-outlined text-slate-200 text-5xl mb-4">attach_file_off</span>
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sem evidências físicas</p>
                           </div>
                        )}
                     </div>
                     
                     <div className="p-10 bg-slate-900 rounded-4xl text-white relative overflow-hidden group shadow-2xl shadow-slate-200">
                        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/5 rotate-12 group-hover:rotate-0 transition-transform">verified_user</span>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-emerald mb-4">Estatuto de Proteção</h4>
                        <p className="text-sm leading-relaxed text-slate-400 font-medium">As comunicações entre o denunciante e o compliance estão protegidas pelo artigo 5.º da Lei angolana n.º 22/11, garantindo que o anonimato é uma condição imutável em todo o processo.</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Chat Module */}
            <div className="w-full lg:w-[480px] bg-slate-50 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-100 relative shadow-2xl">
               <div className="p-12 border-b border-slate-200 bg-white/50 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <span className="h-3 w-3 bg-accent-emerald rounded-full animate-pulse shadow-lg shadow-accent-emerald/50"></span>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Linha Directa</h3>
                     </div>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">RSA 4096-bit</span>
                  </div>
                  <div className="bg-slate-900/5 px-4 py-2 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest italic text-center">
                     Canal reservado para esclarecimentos técnicos
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-10 space-y-8 pb-44 custom-scrollbar">
                  {selectedReport.messages.length === 0 && (
                     <div className="py-24 text-center px-10">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                           <span className="material-symbols-outlined text-slate-100 text-4xl">message</span>
                        </div>
                        <p className="text-xs text-slate-400 font-bold italic leading-relaxed">
                           A unidade de Compliance ainda não enviou mensagens. Pode usar este campo para adicionar informações que se tenha esquecido.
                        </p>
                     </div>
                  )}
                  {selectedReport.messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col gap-2 max-w-[95%] ${msg.sender === 'user' ? 'ml-auto items-end animate-in slide-in-from-right-5' : 'items-start animate-in slide-in-from-left-5'}`}>
                      <div className={`p-6 rounded-3xl text-sm shadow-xl leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-primary text-white rounded-tr-none shadow-primary/20' 
                          : 'bg-white text-slate-600 border border-slate-100 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-2 px-3">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {msg.sender === 'user' ? 'Remetente Anónimo' : 'Unidade de Ética'}
                         </span>
                         <span className="text-slate-200 text-xs">•</span>
                         <span className="text-[9px] font-bold text-slate-300 italic">{msg.time}</span>
                      </div>
                    </div>
                  ))}
               </div>

               <div className="absolute inset-x-0 bottom-0 p-8 bg-white/90 backdrop-blur-2xl border-t border-slate-100 shadow-2xl">
                   <div className="relative group">
                     <textarea 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escreva aqui..."
                        className="w-full p-6 pr-16 rounded-4xl bg-slate-50 border-2 border-slate-50 focus:border-primary focus:bg-white transition-all text-sm font-medium resize-none h-24 outline-none custom-scrollbar"
                     ></textarea>
                     <button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="absolute right-4 bottom-4 w-12 h-12 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 hover:scale-110 active:scale-90 disabled:opacity-20 disabled:grayscale transition-all flex items-center justify-center"
                     >
                       <span className="material-symbols-outlined text-xl">send</span>
                     </button>
                   </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackReport;
