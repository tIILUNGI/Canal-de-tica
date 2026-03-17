# Canal de Ética - Plataforma de Denúncia Anónima

Sistema seguro para举报 de irregularidades com proteção total de identidade.

## 📋 Visão Geral

O **Canal de Ética** é uma plataforma web desenvolvida para organizações que necessitam de um sistema interno de举报 de irregularidades, assédio, fraude e outras violações éticas. O sistema garante total anonimato ao denunciante enquanto fornece ferramentas poderosas para a equipa de compliance investigar e resolver casos.

## ✨ Funcionalidades Principais

### Para Denunciantes
- **Registro de Denúncia Anónima**: Formulário guiado com 4 passos para reportar incidentes
- **Acompanhamento via Protocolo**: Sistema de tracking para verificar o estado da denúncia
- **Upload de Evidências**: Anexar imagens, PDFs e outros documentos (máx. 5MB)
- **Comunicação Segura**: Canal de mensagens encriptado para esclarecimentos

### Para Administradores (Compliance)
- **Dashboard de Gestão**: Visão geral de todas as denúncias
- **Triagem de Casos**: Estados: Novo → Em Análise → Concluído
- **Visualização de Evidências**: Download de todos os anexos
- **Mensagens com Denunciantes**: Comunicação anónima interna
- **Gestão de Utilizadores**: Controle de acessos e permissões
- **Relatórios & Auditoria**: Estatísticas e exportação CSV

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Estilização**: Tailwind CSS
- **Ícones**: Material Symbols (Google)
- **Fontes**: Inter (Google Fonts)
- **Armazenamento**: LocalStorage (sem backend)

## 📁 Estrutura do Projeto

```
canal-etica-app/
├── src/
│   ├── components/
│   │   ├── admin/           # Componentes do painel admin
│   │   │   ├── AdminSidebar.tsx
│   │   │   └── ReportDetail.tsx
│   │   ├── common/         # Componentes reutilizáveis
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Input.tsx
│   │   ├── LandingPage.tsx
│   │   ├── Login.tsx
│   │   ├── NewReport.tsx
│   │   ├── TrackReport.tsx
│   │   └── AdminDashboard.tsx
│   ├── services/
│   │   └── storage.ts      # Serviço de armazenamento
│   ├── types/
│   │   └── index.ts        # Tipos TypeScript
│   ├── utils/
│   │   └── reportsStore.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/tIILUNGI/Canal-de-tica.git

# Entrar na pasta
cd canal-etica-app

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### Build para Produção

```bash
npm run build
```

O projeto será compilado na pasta `dist/` pronto para deploy.

## 🔐 Segurança

- **Anonimato 100%**: O sistema não recolhe dados pessoais do denunciante
- **Encriptação**: Proteção de dados com estándar AES-256
- **Sem Rastreamento**: Não são guardados metadados ou IP do utilizador
- **Protocolo Único**: Cada denúncia recebe um código de rastreio anónimo

## 📊 Categorias de Denúncia

O sistema suporta as seguintes categorias:
1. **Assédio Moral ou Sexual**
2. **Fraude ou Corrupção**
3. **Conflito de Interesses**
4. **Discriminação**
5. **Outras Violações**

## 👤 Credenciais de Teste

- **Admin**: `admin@etica.ao` (qualquer password funciona para demo)

## 📝 Licença

Este projeto é propriedade da ILUNGI. Todos os direitos reservados © 2026

## 🌍 Idioma

O sistema está configurado em **Português de Angola (pt-AO)**.

---

Desenvolvido com ❤️ para promover a integridade e transparência organizacional.
