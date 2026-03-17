// Serviço de armazenamento local do sistema
import type { Report, User, Message } from '../types';

const REPORTS_KEY = 'canal_etica_reports';
const USERS_KEY = 'canal_etica_users';

export const storageService = {
  // ============ RELATÓRIOS ============
  
  getReports(): Report[] {
    const data = localStorage.getItem(REPORTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getReportByProtocol(protocol: string): Report | undefined {
    const reports = this.getReports();
    return reports.find(r => r.protocol === protocol);
  },

  saveReport(report: Report): void {
    const reports = this.getReports();
    reports.push(report);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  },

  updateReportStatus(protocol: string, status: Report['status']): void {
    const reports = this.getReports();
    const index = reports.findIndex(r => r.protocol === protocol);
    if (index !== -1) {
      reports[index].status = status;
      reports[index].lastUpdate = new Date().toISOString();
      localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    }
  },

  addMessage(protocol: string, message: Message): void {
    const reports = this.getReports();
    const index = reports.findIndex(r => r.protocol === protocol);
    if (index !== -1) {
      reports[index].messages.push(message);
      reports[index].lastUpdate = new Date().toISOString();
      localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    }
  },

  getReportsByUserId(userId: string): Report[] {
    const reports = this.getReports();
    return reports.filter(r => r.userId === userId);
  },

  generateProtocol(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `AO-${year}-${random}`;
  },

  // ============ UTILIZADORES ============

  getUsers(): User[] {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  updateUser(userId: string, data: Partial<User>): User | undefined {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return users[index];
    }
  },

  deleteUser(userId: string): void {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
  },

  getUserByEmail(email: string): User | undefined {
    // Administrador principal (hardcoded para demonstração)
    if (email === 'admin@etica.ao') {
      return {
        id: 'admin-1',
        email: 'admin@etica.ao',
        fullName: 'Administrador do Sistema',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
    }
    const users = this.getUsers();
    return users.find(u => u.email === email);
  }
};

export default storageService;
