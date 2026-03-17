// Repositório de denúncias - API para gestão de relatórios
// Este arquivo mantém compatibilidade com código existente
// Os dados são agora geridos pelo serviço storage

import type { Report, User, Message } from '../types';
import { storageService } from '../services/storage';

// Re-export do serviço de storage para uso direto
export const reportsStore = storageService;

// Mantém compatibilidade com código antigo
export type { Report, User, Message };

// Constantes do sistema
export const STATUS = {
  new: 'Novo',
  analysis: 'Em Análise',
  done: 'Concluído'
} as const;

export const CATEGORIES = [
  { id: 'assedio', title: 'Assédio Moral ou Sexual', description: 'Exposição a situações humilhantes ou conduta sexual imprópria.', icon: 'person_off' },
  { id: 'fraude', title: 'Fraude ou Corrupção', description: 'Suborno, desvio de fundos ou falsificação de documentos.', icon: 'account_balance_wallet' },
  { id: 'conflito', title: 'Conflito de Interesses', description: 'Interesses pessoais influenciando o julgamento profissional.', icon: 'handshake' },
  { id: 'discriminacao', title: 'Discriminação', description: 'Tratamento diferenciado por raça, género ou religião.', icon: 'diversity_1' },
  { id: 'outras', title: 'Outras Violações', description: 'Qualquer outra conduta que infrinja o Código de Ética.', icon: 'gavel' }
];

export const STEPS = [
  { id: 1, label: 'CATEGORIA', icon: 'category' },
  { id: 2, label: 'DETALHES', icon: 'description' },
  { id: 3, label: 'ENVOLVIDOS', icon: 'groups' },
  { id: 4, label: 'EVIDÊNCIAS', icon: 'attachment' }
];
