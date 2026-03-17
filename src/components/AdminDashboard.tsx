import React, { useState, useEffect, useMemo } from 'react';
import { type Report, type Message, type User, reportsStore } from '../utils/reportsStore';

const STATUS = {
  new: 'Novo',
  analysis: 'Em Análise',
  done: 'Concluído'
} as const;

const triageSteps: Array<{ status: Report['status']; icon: string; label: string }> = [
  { status: STATUS.new, icon: 'mark_email_unread', label: 'Triagem Inicial' },
  { status: STATUS.analysis, icon: 'rule', label: 'Investigação' },
  { status: STATUS.done, icon: 'task_alt', label: 'Arquivado/Resolvido' }
];

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reply, setReply] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'analysis' | 'done'>('all');
  const [activeSection, setActiveSection] = useState<'denuncias' | 'usuarios' | 'relatorios' | 'config'>('denuncias');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // System Settings State
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowAnonyous: true,
    emailAlerts: true,
    dataRetentionDays: 90
  });

  const handleToggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Initial load
  useEffect(() => {
    const loadData = () => {
      setReports(reportsStore.getReports());
      setUsers(reportsStore.getUsers());
    };
    loadData();
  }, []);

  const handleUpdateStatus = (protocol: string, status: Report['status']) => {
    reportsStore.updateReportStatus(protocol, status);
    const updatedReports = reportsStore.getReports();
    setReports(updatedReports);
    if (selectedReport?.protocol === protocol) {
      setSelectedReport({ ...selectedReport, status, lastUpdate: new Date().toISOString() });
    }
  };


  const handleSendReply = () => {
    if (!reply.trim() || !selectedReport) return;

    const msg: Message = {
      id: crypto.randomUUID(),
      sender: 'compliance',
      text: reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    reportsStore.addMessage(selectedReport.protocol, msg);
    const updatedReport = { ...selectedReport, messages: [...selectedReport.messages, msg], lastUpdate: new Date().toISOString() };
    setSelectedReport(updatedReport);
    setReports(reportsStore.getReports());
    setReply('');
  };

  const systemAdmin = useMemo(() => reportsStore.getUserByEmail('admin@etica.ao'), []);

  const allUsersList = useMemo(() => {
    const list = systemAdmin ? [systemAdmin, ...users] : [...users];
    const seen = new Set<string>();
    return list.filter(u => {
      if (seen.has(u.email)) return false;
      seen.add(u.email);
      return true;
    });
  }, [systemAdmin, users]);

  const reportCountByUser = useMemo(() => {
    const map = new Map<string, number>();
    reports.forEach(r => {
      if (!r.userId) return;
      map.set(r.userId, (map.get(r.userId) ?? 0) + 1);
    });
    return map;
  }, [reports]);

  const userStats = {
    total: allUsersList.length,
    admins: allUsersList.filter(u => u.role === 'admin').length,
    reporters: allUsersList.filter(u => u.role === 'user').length
  };

  const handleToggleRole = (user: User) => {
    if (systemAdmin && user.id === systemAdmin.id) return;
    const nextRole: User['role'] = user.role === 'admin' ? 'user' : 'admin';
    reportsStore.updateUser(user.id, { role: nextRole });
    setUsers(reportsStore.getUsers());
  };

  const handleDeleteUser = (userId: string) => {
    if (systemAdmin && userId === systemAdmin.id) return;
    if (!window.confirm('Tem certeza que deseja remover este utilizador?')) return;
    reportsStore.deleteUser(userId);
    setUsers(reportsStore.getUsers());
  };

  const handleExportCsv = () => {
    const headers = ['Protocolo', 'Categoria', 'Descricao', 'Status', 'Data', 'UltimaAtualizacao', 'Mensagens'];
    const csvEscape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = reports.map(r => ([
      r.protocol,
      r.category,
      r.description,
      r.status,
      new Date(r.createdAt).toLocaleString(),
      new Date(r.lastUpdate).toLocaleString(),
      String(r.messages.length)
    ].map(csvEscape).join(',')));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_compliance_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredReports = reports.filter(r => {
    if (activeTab === 'new') return r.status === STATUS.new;
    if (activeTab === 'analysis') return r.status === STATUS.analysis;
    if (activeTab === 'done') return r.status === STATUS.done;
    return true;
  });

  const reportStats = {
    total: reports.length,
    pending: reports.filter(r => r.status === STATUS.new).length,
    analysis: reports.filter(r => r.status === STATUS.analysis).length,
    done: reports.filter(r => r.status === STATUS.done).length,
    withEvidence: reports.filter(r => !!r.evidence).length,
    messages: reports.reduce((sum, r) => sum + r.messages.length, 0)
  };

  const reportPercent = (value: number) => (reportStats.total === 0 ? 0 : Math.round((value / reportStats.total) * 100));

  const headerSubtitle = (section: string) => {
    if (section === 'denuncias') return 'Gestão de Ocorrências e Triagem';
    if (section === 'usuarios') return 'Controlo de Acessos e Permissões';
    if (section === 'relatorios') return 'Dados Consolidados e Auditoria';
    return 'Parâmetros Globais do Sistema';
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-inter text-slate-700">
      {/* Sidebar - Web Layout */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-white/5">
            <h1 className="text-xl font-black tracking-tighter flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-white text-xl">security</span>
              </div>
              <span>Canal de Denúncia <span className="text-accent-emerald">Anónimas</span></span>
            </h1>
          </div>
          
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2">
              <span className="w-1 h-1 bg-primary rounded-full"></span>
              Gestão Principal
            </p>
            
            <button 
              onClick={() => { setActiveSection('denuncias'); setActiveTab('all'); }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeSection === 'denuncias' ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <span className="material-symbols-outlined">assignment</span>
              <span className="text-sm font-black">Denúncias</span>
              {reportStats.pending > 0 && (
                <span className="ml-auto w-5 h-5 bg-orange-500 text-white rounded-lg flex items-center justify-center text-[10px] font-black animate-pulse">
                  {reportStats.pending}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveSection('usuarios')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeSection === 'usuarios' ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <span className="material-symbols-outlined">group</span>
              <span className="text-sm font-black">Utilizadores</span>
            </button>

            <button 
              onClick={() => setActiveSection('relatorios')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeSection === 'relatorios' ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <span className="material-symbols-outlined">analytics</span>
              <span className="text-sm font-black">Relatórios & Auditoria</span>
            </button>

            <button 
              onClick={() => setActiveSection('config')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${activeSection === 'config' ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm font-black">Definições</span>
            </button>

            {activeSection === 'denuncias' && (
              <div className="mt-10 pt-10 border-t border-white/5 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2">
                  <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                  Processamento
                </p>
                {[
                  { id: 'new', label: 'Em Aberto', status: STATUS.new, color: 'text-orange-400' },
                  { id: 'analysis', label: 'Em Análise', status: STATUS.analysis, color: 'text-blue-400' },
                  { id: 'done', label: 'Concluído', status: STATUS.done, color: 'text-emerald-400' }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'all' | 'new' | 'analysis' | 'done')}
                    className={`w-full flex items-center justify-between px-5 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <span className="text-xs font-black">{tab.label}</span>
                    <span className={`text-[10px] font-black ${tab.color}`}>
                      {reports.filter(r => r.status === tab.status).length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </nav>

          <div className="p-6 border-t border-white/5">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-5 py-4 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all font-black text-xs"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              ENCERRAR SESSÃO
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-24 bg-white border-b border-slate-100 px-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 md:hidden">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {activeSection === 'denuncias' ? 'Centro de Operações' : 
                 activeSection === 'usuarios' ? 'Gestão de Utilizadores' : 
                 activeSection === 'relatorios' ? 'Auditoria Inteligente' : 'Configurações'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                 <span className="h-1.5 w-1.5 bg-primary rounded-full"></span>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{headerSubtitle(activeSection)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
               <span className="material-symbols-outlined text-slate-400 text-sm">schedule</span>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date().toLocaleDateString('pt-AO', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            <div className="h-12 w-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-slate-200">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/30">
          
          {/* VIEW: DENUNCIAS */}
          {activeSection === 'denuncias' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5">
               {/* Metrics Row */}
               <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Acumulado', value: reportStats.total, icon: 'database', color: 'bg-indigo-50 text-indigo-600' },
                    { label: 'Aguardando Triagem', value: reportStats.pending, icon: 'mark_email_unread', color: 'bg-orange-50 text-orange-600' },
                    { label: 'Em Investigação', value: reportStats.analysis, icon: 'rule', color: 'bg-blue-50 text-blue-600' },
                    { label: 'Ciclo Concluído', value: reportStats.done, icon: 'verified', color: 'bg-emerald-50 text-emerald-600' }
                  ].map((m, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-primary/5 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${m.color} mb-4 relative z-10 group-hover:scale-110 transition-transform`}>
                          <span className="material-symbols-outlined">{m.icon}</span>
                       </div>
                       <div className="relative z-10">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.label}</p>
                          <p className="text-3xl font-black text-slate-800 mt-1">{m.value}</p>
                       </div>
                       <div className="absolute -right-6 -bottom-6 opacity-[0.03] rotate-12 transition-transform group-hover:rotate-0">
                          <span className="material-symbols-outlined text-9xl">{m.icon}</span>
                       </div>
                    </div>
                  ))}
               </section>

               {/* Main Table Segment */}
               <section className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-2xl shadow-slate-200/50 overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex flex-wrap items-center justify-between gap-6 bg-slate-50/30">
                     <div>
                        <h3 className="text-lg font-black text-slate-800">Registos de Ocorrência</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Base de dados centralizada</p>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="relative group">
                           <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">manage_search</span>
                           <input 
                              type="text" 
                              placeholder="Filtro rápido..." 
                              className="pl-12 pr-6 py-3 bg-white rounded-2xl border border-slate-200 text-sm w-72 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                           />
                        </div>
                        <button onClick={handleExportCsv} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-600 shadow-sm flex items-center gap-2">
                           <span className="material-symbols-outlined text-lg">download</span>
                           <span className="text-xs font-black uppercase">Exportar</span>
                        </button>
                     </div>
                  </div>

                  <div className="overflow-x-auto">
                    {filteredReports.length > 0 ? (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                            <th className="px-10 py-5">Protocolo</th>
                            <th className="px-10 py-5">Categoria / Assunto</th>
                            <th className="px-10 py-5">Estado Atual</th>
                            <th className="px-10 py-5">Cronologia</th>
                            <th className="px-10 py-5 text-right">Acções</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {filteredReports.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50/80 transition-all group">
                              <td className="px-10 py-6">
                                <div className="flex flex-col">
                                   <span className="text-sm font-black text-primary font-mono bg-primary/5 px-3 py-1 rounded-lg w-fit">#{r.protocol}</span>
                                   {r.evidence && <span className="text-[9px] font-black text-emerald-500 uppercase mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">attachment</span> Com Anexo</span>}
                                </div>
                              </td>
                              <td className="px-10 py-6">
                                <div className="space-y-1">
                                   <p className="text-sm font-black text-slate-700">{r.category}</p>
                                   <p className="text-xs font-medium text-slate-400 truncate max-w-[200px]">{r.description}</p>
                                </div>
                              </td>
                              <td className="px-10 py-6">
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                  r.status === STATUS.new ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
                                  r.status === STATUS.analysis ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                }`}>
                                   <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
                                  {r.status}
                                </span>
                              </td>
                              <td className="px-10 py-6">
                                <div className="flex flex-col">
                                   <span className="text-xs font-black text-slate-500 font-mono tracking-tighter">{new Date(r.createdAt).toLocaleDateString()}</span>
                                   <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Registado via Web</span>
                                </div>
                              </td>
                              <td className="px-10 py-6 text-right">
                                <button 
                                  onClick={() => setSelectedReport(r)}
                                  className="bg-primary text-white font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                                >
                                  Triage Completa
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="py-32 text-center">
                         <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                           <span className="material-symbols-outlined text-4xl text-slate-200">inbox</span>
                         </div>
                         <h4 className="text-lg font-black text-slate-400">Sem registos encontrados</h4>
                         <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">A aguardar novas submissões no canal</p>
                      </div>
                    )}
                  </div>
               </section>
            </div>
          )}

          {/* VIEW: UTILIZADORES */}
          {activeSection === 'usuarios' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-5">
               <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Utilizadores Registados', value: userStats.total, icon: 'group_work', color: 'bg-primary/5 text-primary' },
                    { label: 'Equipa Administrativa', value: userStats.admins, icon: 'admin_panel_settings', color: 'bg-slate-100 text-slate-800' },
                    { label: 'Contas de Denunciante', value: userStats.reporters, icon: 'shield_person', color: 'bg-emerald-50 text-emerald-600' }
                  ].map((m, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm flex items-center gap-6">
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${m.color}`}>
                          <span className="material-symbols-outlined text-3xl">{m.icon}</span>
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                          <p className="text-4xl font-black text-slate-800 tracking-tighter mt-1">{m.value}</p>
                       </div>
                    </div>
                  ))}
               </section>

               <section className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-slate-100 bg-slate-50/20">
                     <h3 className="text-lg font-black text-slate-800">Base de Identidades</h3>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de acessos e permissões do sistema</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                             <th className="px-10 py-5">Perfil de Utilizador</th>
                             <th className="px-10 py-5">Acesso Electrónico</th>
                             <th className="px-10 py-5">Nível de Permissão</th>
                             <th className="px-10 py-5 text-center">Atividade</th>
                             <th className="px-10 py-5 text-right">Governança</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {allUsersList.map(u => {
                            const isMe = u.email === 'admin@etica.ao';
                            return (
                             <tr key={u.id} className="hover:bg-slate-50/50 transition-all">
                                <td className="px-10 py-6">
                                   <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center font-black shadow-inner">
                                         {u.fullName.charAt(0)}
                                      </div>
                                      <div>
                                         <p className="text-sm font-black text-slate-800">{u.fullName}</p>
                                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Registado em {new Date(u.createdAt).toLocaleDateString()}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-10 py-6 text-sm font-bold text-slate-500">{u.email}</td>
                                <td className="px-10 py-6">
                                   <span className={`inline-flex px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                     u.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-primary/10 text-primary'
                                   }`}>
                                      {u.role === 'admin' ? 'Administrador' : 'Denunciante'}
                                   </span>
                                </td>
                                <td className="px-10 py-6 text-center">
                                   <div className="flex flex-col items-center">
                                      <span className="text-sm font-black text-slate-800">{reportCountByUser.get(u.id) ?? 0}</span>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">Relatos</span>
                                   </div>
                                </td>
                                <td className="px-10 py-6 text-right">
                                   {!isMe ? (
                                     <div className="flex items-center justify-end gap-3">
                                        <button 
                                          onClick={() => handleToggleRole(u)}
                                          className="text-[10px] font-black uppercase text-primary hover:underline tracking-widest"
                                        >
                                          Alterar Perfil
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteUser(u.id)}
                                          className="w-10 h-10 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                        >
                                          <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                     </div>
                                   ) : (
                                     <span className="text-[9px] font-black text-slate-300 uppercase italic">Conta Principal</span>
                                   )}
                                </td>
                             </tr>
                            );
                          })}
                       </tbody>
                    </table>
                  </div>
               </section>
            </div>
          )}

          {/* VIEW: RELATORIOS */}
          {activeSection === 'relatorios' && (
            <div className="space-y-10 animate-in zoom-in-95 duration-500">
               <div className="flex items-center justify-between">
                  <div>
                     <h3 className="text-2xl font-black text-slate-800 tracking-tight">Análise de Performance</h3>
                     <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Estatísticas Operacionais e Auditabilidade</p>
                  </div>
                  <button 
                    onClick={handleExportCsv}
                    className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined">description</span>
                    Gerar Relatório em CSV
                  </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Progress Bar Visualization */}
                  <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200/60 shadow-sm flex flex-col gap-8">
                     <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <span className="h-2 w-2 bg-primary rounded-full"></span>
                        Status do Pipeline de Denúncias
                     </h4>
                     
                     <div className="space-y-10">
                        {[
                          { label: 'Denúncias Novas (Aguarda Triagem)', value: reportStats.pending, color: 'bg-orange-500', percent: reportPercent(reportStats.pending) },
                          { label: 'Em Análise (Investigação Ativa)', value: reportStats.analysis, color: 'bg-blue-500', percent: reportPercent(reportStats.analysis) },
                          { label: 'Resolvidas (Compliance Concluído)', value: reportStats.done, color: 'bg-emerald-500', percent: reportPercent(reportStats.done) }
                        ].map((s, i) => (
                          <div key={i} className="space-y-4">
                             <div className="flex items-center justify-between px-1">
                                <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{s.label}</span>
                                <span className="text-sm font-black text-slate-800">{s.value} <span className="text-[10px] text-slate-400 font-bold ml-1">({s.percent}%)</span></span>
                             </div>
                             <div className="h-4 w-full bg-slate-50 rounded-full border border-slate-100 overflow-hidden relative">
                                <div 
                                  className={`absolute inset-y-0 left-0 ${s.color} rounded-full transition-all duration-1000 ease-out`}
                                  style={{ width: `${s.percent}%` }}
                                >
                                   <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent" />
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Operational Summary Card */}
                  <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col gap-10 relative overflow-hidden shadow-2xl shadow-slate-200">
                     <div className="relative z-10 flex flex-col gap-8">
                        <div>
                           <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Resumo Executivo</h4>
                           <p className="text-sm text-slate-400 mt-4 font-medium leading-relaxed">
                              O sistema processou um volume total de <strong className="text-white">{reportStats.total}</strong> ocorrências. 
                              A taxa de fundamentação (com anexos) é de <strong className="text-white">{reportPercent(reportStats.withEvidence)}%</strong>.
                           </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                              <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Engajamento</p>
                              <p className="text-2xl font-black text-white">{reportStats.messages}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Interacções</p>
                           </div>
                           <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                              <p className="text-[10px] font-black uppercase text-slate-500 mb-2">Eficiência</p>
                              <p className="text-2xl font-black text-white">92%</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">SLA Atendimento</p>
                           </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 mt-auto">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                              <span className="material-symbols-outlined text-xs">verified_user</span>
                              Dados auditados e encriptados
                           </p>
                        </div>
                     </div>
                     <div className="absolute -right-16 -bottom-16 opacity-5 rotate-12 scale-150">
                        <span className="material-symbols-outlined text-9xl">analytics</span>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* VIEW: CONFIGURACÕES */}
          {activeSection === 'config' && (
            <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-left-5">
               <div className="bg-white p-12 rounded-4xl border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-black text-slate-800 mb-10 border-b border-slate-50 pb-8 flex items-center gap-3">
                     <span className="material-symbols-outlined text-primary">tune</span>
                     Preferências Globais
                  </h3>
                  
                  <div className="space-y-10">
                     <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary transition-all">
                              <span className="material-symbols-outlined">construction</span>
                           </div>
                           <div>
                              <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">Modo de Manutenção</h4>
                              <p className="text-xs text-slate-400 mt-1">Suspende temporariamente o recebimento de novas queixas.</p>
                           </div>
                        </div>
                        <button onClick={() => handleToggleSetting('maintenanceMode')} className={`w-14 h-8 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-rose-500' : 'bg-slate-200'}`}>
                           <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${settings.maintenanceMode ? 'right-1' : 'left-1'}`} />
                        </button>
                     </div>

                     <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary transition-all">
                              <span className="material-symbols-outlined">person_pin</span>
                           </div>
                           <div>
                              <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">Denúncias Anónimas Operacionais</h4>
                              <p className="text-xs text-slate-400 mt-1">Permite a submissão por utilizadores sem autenticação.</p>
                           </div>
                        </div>
                        <button onClick={() => handleToggleSetting('allowAnonyous')} className={`w-14 h-8 rounded-full transition-all relative ${settings.allowAnonyous ? 'bg-accent-emerald' : 'bg-slate-200'}`}>
                           <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${settings.allowAnonyous ? 'right-1' : 'left-1'}`} />
                        </button>
                     </div>

                     <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary transition-all">
                              <span className="material-symbols-outlined">notification_important</span>
                           </div>
                           <div>
                              <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">Alertas em Tempo Real</h4>
                              <p className="text-xs text-slate-400 mt-1">Notifica a equipa de conformidade sobre casos urgentes.</p>
                           </div>
                        </div>
                        <button onClick={() => handleToggleSetting('emailAlerts')} className={`w-14 h-8 rounded-full transition-all relative ${settings.emailAlerts ? 'bg-accent-emerald' : 'bg-slate-200'}`}>
                           <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${settings.emailAlerts ? 'right-1' : 'left-1'}`} />
                        </button>
                     </div>
                  </div>

                  <div className="mt-16 pt-10 border-t border-slate-50">
                     <button className="bg-primary text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                        Aplicar Configurações
                     </button>
                  </div>
               </div>

               <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col items-center text-center relative overflow-hidden">
                  <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/5 rotate-12">dangerous</span>
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
                     <span className="material-symbols-outlined text-rose-500">warning</span>
                  </div>
                  <h4 className="text-xl font-black tracking-tight">Zona de Risco Crítico</h4>
                  <p className="text-slate-400 text-sm mt-3 max-w-sm leading-relaxed px-4">
                     As acções abaixo são irreversíveis e podem apagar permanentemente todo o histórico de ética da organização.
                  </p>
                  <button className="mt-8 px-10 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20">
                    Purgar Base de Dados de 2026
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* Modal Triage - DETALHES COMPLETOS */}
        {selectedReport && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-[98vw] max-w-7xl h-[94vh] rounded-6xl shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-in zoom-in-95 duration-300">
              
              {/* Report Investigation Area */}
              <div className="flex-1 overflow-y-auto p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col gap-12 custom-scrollbar">
                
                {/* Modal Header */}
                <div className="flex flex-col gap-8">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                           <span className="material-symbols-outlined text-2xl">verified_user</span>
                        </div>
                        <div>
                           <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Investigação de Canal Seguro</h2>
                           <p className="text-sm font-black text-slate-400 mt-1 uppercase tracking-widest">Protocolo <span className="text-primary">#{selectedReport.protocol}</span></p>
                        </div>
                     </div>
                     <button 
                       onClick={() => setSelectedReport(null)}
                       className="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-inner"
                     >
                       <span className="material-symbols-outlined">close</span>
                     </button>
                  </div>

                  {/* Flow Progress */}
                  <div className="space-y-4 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                     <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Estado do Processo</span>
                        <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{selectedReport.status}</span>
                     </div>
                     <div className="grid grid-cols-3 gap-3 relative">
                        {triageSteps.map((step, idx) => {
                          const currentStepIdx = triageSteps.findIndex(s => s.status === selectedReport.status);
                          const isActive = selectedReport.status === step.status;
                          const isDone = currentStepIdx > idx;
                          return (
                            <button 
                              key={step.status}
                              onClick={() => handleUpdateStatus(selectedReport.protocol, step.status)}
                              className={`p-5 rounded-2xl flex flex-col gap-2 transition-all border-2 text-left ${
                                isActive ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[1.05]' : 
                                isDone ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                                'bg-white border-slate-100 text-slate-300 hover:border-primary/20 hover:text-slate-500'
                              }`}
                            >
                               <span className="material-symbols-outlined text-sm">{step.icon}</span>
                               <span className="text-[10px] font-black uppercase tracking-tight">{step.label}</span>
                            </button>
                          );
                        })}
                     </div>
                  </div>
                </div>

                {/* Information Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-10">
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Assunto da Denúncia
                         </h4>
                         <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Categoria</p>
                               <p className="text-xl font-black text-slate-800 tracking-tight">{selectedReport.category}</p>
                            </div>
                            <div className="pt-4 border-t border-slate-50">
                               <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Resumo Ocorrência</p>
                               <p className="text-sm font-bold text-slate-600 tracking-tight">{selectedReport.description}</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Relato Intrínseco
                         </h4>
                         <div className="bg-slate-900 p-8 rounded-3xl text-slate-200 text-sm font-medium leading-[1.8] italic shadow-2xl shadow-slate-200">
                            "{selectedReport.details}"
                         </div>
                      </div>
                   </div>

                   <div className="space-y-10">
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Provas Fornecidas
                         </h4>
                         <div className="bg-white p-4 md:p-8 rounded-3xl border border-slate-100 shadow-sm min-h-[160px]">
                            {selectedReport.evidence ? (
                               <div className="w-full">
                                  {/* Image preview */}
                                  {selectedReport.evidenceType?.startsWith('image/') ? (
                                     <div className="group relative rounded-2xl overflow-hidden cursor-pointer w-full">
                                        <img src={selectedReport.evidence} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700" alt="Evidência" />
                                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                           <a 
                                             href={selectedReport.evidence} 
                                             download={selectedReport.evidenceName || 'imagem.jpg'}
                                             className="px-4 py-2 bg-white text-slate-800 rounded-lg text-[10px] font-black uppercase hover:bg-primary hover:text-white transition-all"
                                           >
                                             Download
                                           </a>
                                        </div>
                                     </div>
                                  ) : selectedReport.evidenceType === 'application/pdf' ? (
                                     /* PDF preview */
                                     <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-blue-50 p-4 md:p-6 rounded-2xl border border-blue-100 group hover:border-blue-300 transition-all">
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                                           <span className="material-symbols-outlined text-2xl md:text-3xl">picture_as_pdf</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                           <p className="text-sm font-black text-slate-700 truncate">{selectedReport.evidenceName || 'Documento PDF'}</p>
                                           <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">Documento PDF anexado</p>
                                        </div>
                                        <a 
                                          href={selectedReport.evidence} 
                                          download={selectedReport.evidenceName || 'documento.pdf'}
                                          className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shrink-0"
                                        >
                                           <span className="material-symbols-outlined">download</span>
                                        </a>
                                     </div>
                                  ) : (
                                     /* Other file types */
                                     <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 group hover:border-primary transition-all">
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-600 shrink-0">
                                           <span className="material-symbols-outlined text-2xl md:text-3xl">insert_drive_file</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                           <p className="text-sm font-black text-slate-700 truncate">{selectedReport.evidenceName || 'Anexo'}</p>
                                           <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{selectedReport.evidenceType || 'Ficheiro anexado'}</p>
                                        </div>
                                        <a 
                                          href={selectedReport.evidence} 
                                          download={selectedReport.evidenceName || 'anexo'}
                                          className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shrink-0"
                                        >
                                           <span className="material-symbols-outlined">download</span>
                                        </a>
                                     </div>
                                  )}
                               </div>
                            ) : (
                              <div className="text-center py-8">
                                 <span className="material-symbols-outlined text-slate-200 text-4xl mb-4">no_photography</span>
                                 <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Nenhuma prova anexada</p>
                              </div>
                            )}
                         </div>
                      </div>

                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Terceiros Citados
                         </h4>
                         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center">
                               <span className="material-symbols-outlined text-sm">groups</span>
                            </div>
                            <p className="text-sm font-bold text-slate-600 truncate">{selectedReport.involved}</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Secure Chat Module */}
              <div className="w-full lg:w-[460px] bg-slate-50 flex flex-col relative border-t lg:border-t-0 lg:border-l border-slate-100">
                 <div className="p-10 border-b border-slate-200 bg-white">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-xl font-black text-slate-800 tracking-tight">Canais de Mensagem</h3>
                       <span className="h-3 w-3 bg-emerald-500 rounded-full animate-ping"></span>
                    </div>
                    <div className="bg-slate-900 rounded-2xl p-4 flex items-center gap-4">
                       <span className="material-symbols-outlined text-primary text-xl">verified</span>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Linha Encriptada para <br/> Esclarecimento com Denunciante</p>
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar pb-40">
                    {selectedReport.messages.length === 0 && (
                      <div className="py-20 text-center px-6">
                         <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-slate-200">forum</span>
                         </div>
                         <h5 className="text-sm font-black text-slate-300 uppercase tracking-widest">Chat Sem Histórico</h5>
                         <p className="text-xs text-slate-400 font-medium mt-2 leading-relaxed">
                            Pode solicitar provas adicionais ou esclarecimentos ao denunciante através deste canal.
                         </p>
                      </div>
                    )}
                    {selectedReport.messages.map((msg) => (
                      <div key={msg.id} className={`flex flex-col gap-2 max-w-[85%] ${msg.sender === 'compliance' ? 'ml-auto items-end animate-in slide-in-from-right-5' : 'items-start animate-in slide-in-from-left-5'}`}>
                         <div className={`p-5 rounded-4xl text-sm font-medium leading-relaxed shadow-lg ${
                           msg.sender === 'compliance' 
                             ? 'bg-primary text-white rounded-tr-none shadow-primary/10' 
                             : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-slate-100'
                         }`}>
                           {msg.text}
                         </div>
                         <div className="flex items-center gap-2 px-2">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                {msg.sender === 'compliance' ? 'Compliance Unit' : 'Relator Anónimo'}
                             </span>
                             <span className="text-[10px] text-slate-300 font-bold">•</span>
                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{msg.time}</span>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="absolute inset-x-0 bottom-0 p-8 bg-white border-t border-slate-100">
                    <div className="relative">
                       <textarea 
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder="Digite as notas ou resposta segura..."
                          className="w-full p-5 pr-20 rounded-4xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white transition-all text-sm font-medium resize-none h-32 outline-none"
                       />
                       <button 
                          onClick={handleSendReply}
                          className="absolute right-4 bottom-4 w-12 h-12 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
                       >
                         <span className="material-symbols-outlined">send</span>
                       </button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
