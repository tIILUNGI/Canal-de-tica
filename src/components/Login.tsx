import React, { useState } from 'react';
import { reportsStore, type User } from '../utils/reportsStore';

interface LoginProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Unified login logic
    setTimeout(() => {
      if (isRegistering) {
        const existing = reportsStore.getUserByEmail(email);
        if (existing) {
          setError('Este e-mail já está registado.');
          setIsLoading(false);
          return;
        }
        const newUser: User = {
          id: crypto.randomUUID(),
          email,
          fullName,
          role: 'user', // Default registered users are reporters
          createdAt: new Date().toISOString()
        };
        reportsStore.saveUser(newUser);
        onLogin(newUser);
      } else {
        const user = reportsStore.getUserByEmail(email);
        // Simple password check (demonstration only)
        if (user && (password === 'admin123' || password === 'user123' || isRegistering === false)) {
          onLogin(user);
        } else {
          setError('Credenciais inválidas. Verifique o e-mail e palavra-passe.');
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 font-inter">
      <header className="p-6">
        <button onClick={onBack} className="text-primary hover:bg-white p-2 rounded-xl transition-all flex items-center gap-2 font-bold shadow-sm md:shadow-none">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="hidden md:inline">Voltar para o Início</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 -mt-12">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-4xl p-10 shadow-2xl shadow-primary/5 border border-primary/5">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6 shadow-inner">
              <span className="material-symbols-outlined text-4xl">
                {isRegistering ? 'person_add' : 'lock'}
              </span>
            </div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              {isRegistering ? 'Criar Conta' : 'Aceder ao Portal'}
            </h2>
            <p className="text-slate-500 text-sm mt-3 font-medium">
              {isRegistering 
                ? 'Registe-se para submeter e gerir as suas denúncias de forma segura.' 
                : 'Utilize as suas credenciais para aceder ao seu painel de controlo.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-slate-50 focus:border-primary focus:bg-white bg-slate-50 transition-all outline-none font-medium text-slate-700"
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">E-mail</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-slate-50 focus:border-primary focus:bg-white bg-slate-50 transition-all outline-none font-medium text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Palavra-passe</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border-2 border-slate-50 focus:border-primary focus:bg-white bg-slate-50 transition-all outline-none font-medium text-slate-700"
                  required
                />
              </div>
            </div>

            {!isRegistering && (
              <div className="flex justify-end">
                <button type="button" className="text-xs font-bold text-primary hover:underline">Esqueceu a palavra-passe?</button>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
            >
              {isLoading ? (
                <span className="animate-spin material-symbols-outlined">progress_activity</span>
              ) : (
                <>
                  {isRegistering ? 'Criar Minha Conta' : 'Entrar no Sistema'}
                  <span className="material-symbols-outlined">login</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center border-t border-slate-50 pt-8">
            <p className="text-sm text-slate-500 font-medium mb-2">
              {isRegistering ? 'Já possui uma conta ativa?' : 'Ainda não possui uma conta?'}
            </p>
            <button 
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-primary font-black hover:underline transition-colors"
            >
              {isRegistering ? 'Fazer Login agora' : 'Registe-se gratuitamente'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
