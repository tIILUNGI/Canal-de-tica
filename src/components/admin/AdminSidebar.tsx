// Sidebar do painel de administração
import React from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  reportStats: {
    pending: number;
    total: number;
  };
  onLogout: () => void;
}

export const AdminSidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  reportStats,
  onLogout
}) => {
  const menuItems = [
    { id: 'denuncias', label: 'Denúncias', icon: 'assignment' },
    { id: 'usuarios', label: 'Utilizadores', icon: 'group' },
    { id: 'relatorios', label: 'Relatórios & Auditoria', icon: 'analytics' },
    { id: 'config', label: 'Definições', icon: 'settings' }
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-8 border-b border-white/5">
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-xl">security</span>
            </div>
            <span>Canal de Denúncia <span className="text-accent-emerald">Anónimas</span></span>
          </h1>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2">
            <span className="w-1 h-1 bg-primary rounded-full"></span>
            Gestão Principal
          </p>
          
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                activeSection === item.id 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm font-black">{item.label}</span>
              {item.id === 'denuncias' && reportStats.pending > 0 && (
                <span className="ml-auto w-5 h-5 bg-orange-500 text-white rounded-lg flex items-center justify-center text-[10px] font-black animate-pulse">
                  {reportStats.pending}
                </span>
              )}
            </button>
          ))}

          {/* Filtros de estado */}
          {activeSection === 'denuncias' && (
            <div className="mt-10 pt-10 border-t border-white/5 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2">
                <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                Processamento
              </p>
              {[
                { id: 'new', label: 'Em Aberto', color: 'text-orange-400' },
                { id: 'analysis', label: 'Em Análise', color: 'text-blue-400' },
                { id: 'done', label: 'Concluído', color: 'text-emerald-400' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  className={`w-full flex items-center justify-between px-5 py-3 rounded-xl transition-all text-slate-500 hover:text-slate-300`}
                >
                  <span className="text-xs font-black">{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Logout */}
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
  );
};

export default AdminSidebar;
