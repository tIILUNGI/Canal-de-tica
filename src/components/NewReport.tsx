import React, { useState } from 'react';
import { type Report, reportsStore } from '../utils/reportsStore';

const steps = [
  { id: 1, label: 'CATEGORIA', icon: 'category' },
  { id: 2, label: 'DETALHES', icon: 'description' },
  { id: 3, label: 'ENVOLVIDOS', icon: 'groups' },
  { id: 4, label: 'EVIDÊNCIAS', icon: 'attachment' }
];

const categories = [
  { id: 'assedio', title: 'Assédio Moral ou Sexual', description: 'Exposição a situações humilhantes ou conduta sexual imprópria.', icon: 'person_off' },
  { id: 'fraude', title: 'Fraude ou Corrupção', description: 'Suborno, desvio de fundos ou falsificação de documentos.', icon: 'account_balance_wallet' },
  { id: 'conflito', title: 'Conflito de Interesses', description: 'Interesses pessoais influenciando o julgamento profissional.', icon: 'handshake' },
  { id: 'discriminacao', title: 'Discriminação', description: 'Tratamento diferenciado por raça, género ou religião.', icon: 'diversity_1' },
  { id: 'outras', title: 'Outras Violações', description: 'Qualquer outra conduta que infrinja o Código de Ética.', icon: 'gavel' }
];

interface EvidenceFile {
  data: string;
  name: string;
  type: string;
}

const NewReport: React.FC<{ onBack: () => void, userId?: string }> = ({ onBack, userId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [involved, setInvolved] = useState('');
  const [details, setDetails] = useState('');
  const [evidence, setEvidence] = useState<EvidenceFile | null>(null);
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);

  const handleSubmit = () => {
    const protocol = reportsStore.generateProtocol();
    const now = new Date().toISOString();
    
    const newReport: Report = {
      id: crypto.randomUUID(),
      protocol,
      category: categories.find(c => c.id === selectedCategory)?.title || selectedCategory,
      description,
      details,
      involved,
      evidence: evidence?.data || '',
      evidenceName: evidence?.name || '',
      evidenceType: evidence?.type || '',
      status: 'Novo',
      createdAt: now,
      lastUpdate: now,
      messages: [],
      userId: userId
    };

    reportsStore.saveReport(newReport);
    setSubmittedReport(newReport);
    setCurrentStep(5); // Success step
  };

  if (currentStep === 5 && submittedReport) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 font-inter">
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-white max-w-5xl w-full p-12 rounded-[3rem] shadow-2xl shadow-primary/5 text-center border border-primary/5 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <span className="material-symbols-outlined text-5xl">verified</span>
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Submissão Concluída</h2>
            <p className="text-slate-500 mb-10 font-medium leading-relaxed">
              Obrigado pela sua coragem e integridade. A sua denúncia foi registada sob um canal ultra-seguro. Guarde o protocolo abaixo.
            </p>
            
            <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-primary/20 mb-10 group transition-all hover:bg-white hover:border-solid">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Protocolo Único AO-2026</span>
              <div className="text-5xl font-black text-primary mt-4 font-mono tracking-tighter">
                {submittedReport.protocol}
              </div>
            </div>

            <div className="flex flex-col gap-3">
               <button 
                  onClick={onBack}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
               >
                  Finalizar e Sair
                  <span className="material-symbols-outlined text-sm">logout</span>
               </button>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-xs">lock</span>
                  Este protocolo nunca será enviado por e-mail para sua proteção.
               </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 font-inter">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary/5 px-8 h-20 flex items-center justify-between">
        <button onClick={onBack} className="text-primary font-black flex items-center gap-2 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all">
          <span className="material-symbols-outlined text-sm">arrow_back_ios</span>
          <span className="hidden md:inline">Cancelar Participação</span>
        </button>
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined scale-75">shield_person</span>
           </div>
           <span className="text-sm font-black text-slate-800 tracking-tight">Registo de Ocorrência</span>
        </div>
        <div className="hidden md:flex gap-1">
           {[1,2,3,4].map(s => (
              <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${currentStep >= s ? 'bg-primary' : 'bg-slate-200'}`} />
           ))}
        </div>
      </header>

        <main className="flex-1 mt-24 mb-16 px-6 flex">
        <div className="max-w-7xl mx-auto w-full">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-primary/5 overflow-hidden flex flex-col md:flex-row min-h-[70vh] lg:min-h-[80vh]">
            {/* Sidebar Progress (Desktop) */}
            <div className="hidden md:flex md:w-72 bg-slate-900 p-12 flex-col gap-10">
               {steps.map(s => (
                 <div key={s.id} className={`flex items-center gap-4 transition-all duration-500 ${currentStep === s.id ? 'opacity-100 scale-105' : 'opacity-30'}`}>
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${currentStep >= s.id ? 'bg-primary text-white' : 'bg-slate-800 text-slate-500'}`}>
                        <span className="material-symbols-outlined text-sm">{s.icon}</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-primary/70 uppercase tracking-widest leading-none">Passo 0{s.id}</span>
                        <span className="text-xs font-black text-white uppercase mt-1 tracking-tight">{s.label}</span>
                     </div>
                 </div>
               ))}
               <div className="mt-auto pt-10 border-t border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed font-mono">
                     Encriptação 256-bit AES <br/> Anonimato Garantido
                  </p>
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 md:p-14 flex flex-col relative">
               <div className="flex-1 animate-in fade-in slide-in-from-right-10 duration-500">
                  {currentStep === 1 && (
                    <div className="space-y-8">
                       <h2 className="text-3xl font-black text-slate-800 tracking-tight">Qual o tipo de incidente?</h2>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {categories.map(cat => (
                            <button 
                              key={cat.id}
                              onClick={() => setSelectedCategory(cat.id)}
                              className={`p-6 rounded-3xl border-2 text-left flex flex-col gap-4 transition-all ${
                                selectedCategory === cat.id 
                                  ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]' 
                                  : 'border-slate-50 bg-slate-50/30 hover:bg-white hover:border-primary/20'
                              }`}
                            >
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedCategory === cat.id ? 'bg-primary text-white' : 'bg-white text-slate-400'}`}>
                                  <span className="material-symbols-outlined">{cat.icon}</span>
                               </div>
                               <div>
                                  <h4 className="font-black text-slate-800 leading-tight">{cat.title}</h4>
                                  <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">{cat.description}</p>
                               </div>
                            </button>
                          ))}
                       </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-8">
                       <h2 className="text-3xl font-black text-slate-800 tracking-tight">Detalhes do Relato</h2>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Título Resumo</label>
                             <input 
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Uma frase curta que resume o caso..."
                                className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-700"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Relato Completo</label>
                             <textarea 
                                rows={8}
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="Descreva os factos, datas, locais e como tudo aconteceu..."
                                className="w-full p-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium text-slate-600 leading-relaxed resize-none"
                             />
                          </div>
                       </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-8">
                       <h2 className="text-3xl font-black text-slate-800 tracking-tight">Indivíduos Envolvidos</h2>
                       <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomes e Cargos</label>
                          <textarea 
                             rows={6}
                             value={involved}
                             onChange={(e) => setInvolved(e.target.value)}
                             placeholder="Ex: Pedro Silva (Diretor), Maria Santos (RH)..."
                             className="w-full p-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-medium text-slate-600 leading-relaxed resize-none"
                          />
                          <p className="text-xs text-slate-400 mt-4 italic font-medium">Se não souber os cargos, pode descrever as características físicas ou departamentos.</p>
                       </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-8">
                       <h2 className="text-3xl font-black text-slate-800 tracking-tight">Provas e Evidências</h2>
                       <div className="space-y-6">
                           <div className="relative group">
                              <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-200 rounded-[2.5rem] cursor-pointer bg-slate-50/50 hover:bg-white hover:border-primary transition-all group overflow-hidden">
                                 {evidence && evidence.type.startsWith('image/') ? (
                                    <div className="absolute inset-0">
                                       <img src={evidence.data} className="w-full h-full object-cover opacity-20" alt="Pre-view" />
                                    </div>
                                 ) : null}
                                 <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                                    {evidence ? (
                                      <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-3xl">
                                          {evidence.type === 'application/pdf' ? 'picture_as_pdf' : evidence.type.startsWith('image/') ? 'image' : 'insert_drive_file'}
                                        </span>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                                           <span className="material-symbols-outlined text-3xl">upload_file</span>
                                        </div>
                                        <p className="mb-2 text-sm text-slate-700 font-black">Carregar Arquivo Digital</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Formatos: PDF, PNG, JPG, DOC (Máx. 5MB)</p>
                                      </>
                                    )}
                                 </div>
                                 <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        if (file.size > 5 * 1024 * 1024) {
                                          alert('O ficheiro não pode exceder 5MB');
                                          return;
                                        }
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          setEvidence({
                                            data: reader.result as string,
                                            name: file.name,
                                            type: file.type || 'application/octet-stream'
                                          });
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                 />
                              </label>
                           </div>
                           
                           {evidence && (
                             <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-in zoom-in-95">
                                <span className="material-symbols-outlined text-emerald-600">verified</span>
                                <div className="flex-1">
                                  <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">{evidence.name}</span>
                                  <p className="text-[10px] text-emerald-600 font-medium">{evidence.type}</p>
                                </div>
                                <button onClick={() => setEvidence(null)} className="ml-auto text-rose-500 font-black text-[10px] uppercase hover:underline">Remover</button>
                             </div>
                           )}
                       </div>
                    </div>
                  )}
               </div>

               {/* Action Buttons */}
               <div className="mt-14 pt-10 border-t border-slate-50 flex items-center justify-between">
                  <button 
                     onClick={currentStep === 1 ? onBack : () => setCurrentStep(s => s - 1)}
                     className="px-8 py-4 font-black text-slate-400 hover:text-slate-800 transition-all flex items-center gap-2"
                  >
                     {currentStep === 1 ? 'Anular' : (
                       <>
                         <span className="material-symbols-outlined text-sm">west</span>
                         Anterior
                       </>
                     )}
                  </button>
                  
                  {currentStep < 4 ? (
                    <button 
                       disabled={
                         (currentStep === 1 && !selectedCategory) || 
                         (currentStep === 2 && (!description || !details))
                       }
                       onClick={() => setCurrentStep(s => s + 1)}
                       className="bg-primary text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all flex items-center gap-3"
                    >
                       Continuar
                       <span className="material-symbols-outlined">east</span>
                    </button>
                  ) : (
                    <button 
                       onClick={handleSubmit}
                       className="bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                       Submeter Participação
                       <span className="material-symbols-outlined">send</span>
                    </button>
                  )}
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewReport;
