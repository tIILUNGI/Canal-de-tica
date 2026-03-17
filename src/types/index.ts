// Tipos principais do sistema Canal de Ética

export interface Message {
  id: string;
  sender: 'user' | 'compliance';
  text: string;
  time: string;
  status: 'sent' | 'seen' | 'read';
}

export interface Report {
  id: string;
  protocol: string;
  category: string;
  description: string;
  details: string;
  involved: string;
  evidence?: string;
  evidenceName?: string;
  evidenceType?: string;
  status: 'Novo' | 'Em Análise' | 'Concluído';
  createdAt: string;
  lastUpdate: string;
  messages: Message[];
  userId?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface ReportCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FormStep {
  id: number;
  label: string;
  icon: string;
}
