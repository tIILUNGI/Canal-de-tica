// Modal de detalhes do relatório - Componente de investigação
import React from 'react';
import type { Report } from '../../types';

interface ReportDetailProps {
  report: Report;
  onClose: () => void;
  onStatusChange: (status: Report['status']) => void;
  onSendMessage: (text: string) => void;
  reply: string;
  onReplyChange: (text: string) => void;
}

const triageSteps = [
  { status: 'Novo', icon: 'mark_email_unread', label: 'Triagem Inicial' },
  { status: 'Em Análise', icon: 'rule', label: 'Investigação' },
  { status: 'Concluído', icon: 'task_alt', label: 'Arquivado/Resolvido' }
];

export const ReportDetail: React.FC<ReportDetailProps> = ({
  report,
  onClose,
  onStatusChange,
  onSendMessage,
  reply,
  onReplyChange
}) => {
  const currentStepIdx = triageSteps.findIndex(s => s.status === report.status);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-[98vw] max-w-7xl h-[94vh] rounded-6xl shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Área de Investigação */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col gap-8 custom-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tighter">Investigação de Canal Seguro</h2>
                <p className="text-sm font-black text-slate-400 mt-1 uppercase tracking-widest">Protocolo <span className="text-primary">#{report.protocol}</span></p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Estado do Processo */}
          <div className="space-y-4 bg-slate-50/50 p-6 lg:p-8 rounded-3xl border border-slate-100">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Estado do Processo</span>
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{report.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {triageSteps.map((step, idx) => (
                <button 
                  key={step.status}
                  onClick={() => onStatusChange(step.status as Report['status'])}
                  className={`p-4 lg:p-5 rounded-2xl flex flex-col gap-2 transition-all border-2 text-left ${
                    report.status === step.status 
                      ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-[1.05]' 
                      : currentStepIdx > idx 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                        : 'bg-white border-slate-100 text-slate-300 hover:border-primary/20 hover:text-slate-500'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{step.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-tight">{step.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Coluna Esquerda */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Assunto da Denúncia
                </h4>
                <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Categoria</p>
                    <p className="text-lg lg:text-xl font-black text-slate-800 tracking-tight">{report.category}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Resumo</p>
                    <p className="text-sm font-bold text-slate-600 tracking-tight">{report.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Relato Completo
                </h4>
                <div className="bg-slate-900 p-6 lg:p-8 rounded-3xl text-slate-200 text-sm font-medium leading-[1.8] italic shadow-2xl shadow-slate-200">
                  "{report.details}"
                </div>
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Provas Anexadas
                </h4>
                <div className="bg-white p-4 lg:p-8 rounded-3xl border border-slate-100 shadow-sm min-h-[160px]">
                  {report.evidence ? (
                    <div className="w-full">
                      {report.evidenceType?.startsWith('image/') ? (
                        <div className="group relative rounded-2xl overflow-hidden">
                          <img src={report.evidence} className="w-full h-40 lg:h-48 object-cover" alt="Evidência" />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                            <a href={report.evidence} download={report.evidenceName || 'imagem.jpg'} className="px-4 py-2 bg-white text-slate-800 rounded-lg text-[10px] font-black uppercase">
                              Download
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
                          <span className="material-symbols-outlined text-3xl text-primary">description</span>
                          <div className="flex-1">
                            <p className="text-sm font-black text-slate-700">{report.evidenceName || 'Anexo'}</p>
                            <a href={report.evidence} download={report.evidenceName || 'anexo'} className="text-[10px] text-primary font-bold uppercase">Download</a>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <span className="material-symbols-outlined text-slate-200 text-4xl">no_photography</span>
                      <p className="text-xs font-black text-slate-300 uppercase mt-4">Nenhuma prova anexada</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> Indivíduos Envolvidos
                </h4>
                <div className="bg-white p-4 lg:p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">groups</span>
                  </div>
                  <p className="text-sm font-bold text-slate-600 truncate">{report.involved || 'Nenhum envolvido identificado'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Módulo de Chat */}
        <div className="w-full lg:w-[400px] xl:w-[460px] bg-slate-50 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-100">
          <div className="p-6 lg:p-8 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight">Mensagens</h3>
              <span className="h-3 w-3 bg-emerald-500 rounded-full animate-ping"></span>
            </div>
            <div className="bg-slate-900 rounded-2xl p-4 flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-xl">verified</span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Canal Encriptado</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-4 custom-scrollbar">
            {report.messages.length === 0 ? (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-slate-200 text-4xl">forum</span>
                <h5 className="text-sm font-black text-slate-300 uppercase mt-4">Sem mensagens</h5>
              </div>
            ) : (
              report.messages.map(msg => (
                <div key={msg.id} className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === 'compliance' ? 'ml-auto items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-3xl text-sm font-medium ${
                    msg.sender === 'compliance' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase px-2">
                    {msg.sender === 'compliance' ? 'Compliance' : 'Anónimo'} • {msg.time}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="p-4 lg:p-6 bg-white border-t border-slate-100">
            <div className="relative">
              <textarea 
                value={reply}
                onChange={(e) => onReplyChange(e.target.value)}
                placeholder="Escrever mensagem..."
                className="w-full p-4 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white transition-all text-sm font-medium resize-none h-24 outline-none"
              />
              <button 
                onClick={() => onSendMessage(reply)}
                disabled={!reply.trim()}
                className="absolute right-3 bottom-3 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
