# Nonada Academia - Frontend

Sistema de gestão para academia de artes marciais. Frontend em Angular com Angular Material.

## Pré-requisitos

- Node.js 20+
- npm 10+
- Backend API rodando em `http://localhost:3000`

## Instalação

```bash
npm install
```

## Desenvolvimento

1. Certifique-se de que o backend está rodando em `http://localhost:3000`
2. Inicie o app:

```bash
ng serve
```

3. Acesse: `http://localhost:4200`

## Build de Produção

```bash
ng build
```

## Estrutura do Projeto

```
src/app/
├── core/                  # Guards, interceptors, serviços globais
│   ├── guards/            # AuthGuard, RoleGuard
│   ├── interceptors/      # Auth e Error interceptors
│   └── services/          # AuthService, StorageService
├── shared/                # Componentes, pipes, models compartilhados
│   ├── components/        # CPF Mask, Confirm Dialog, Loading Spinner, etc.
│   ├── models/            # Interfaces e enums
│   ├── pipes/             # CPF Pipe
│   ├── utils/             # Utilitários CPF
│   └── validators/        # Validador CPF
├── features/              # Módulos de funcionalidade
│   ├── public/            # Matrícula (registro público)
│   ├── auth/              # Login
│   ├── checkin/           # Registro de presença
│   └── admin/             # Painel administrativo
│       ├── layout/        # Layout com sidenav
│       ├── dashboard/     # Dashboard
│       ├── students/      # Gestão de alunos
│       ├── payments/      # Serviço de pagamentos
│       └── users/         # Gestão de usuários admin
├── app.ts                 # Componente raiz
├── app.config.ts          # Configuração da aplicação
└── app.routes.ts          # Rotas da aplicação
```

## Rotas

| Rota | Descrição | Auth |
|------|-----------|------|
| `/login` | Login | Não |
| `/matricula` | Formulário de matrícula | Não |
| `/matricula/sucesso` | Confirmação de matrícula | Não |
| `/checkin` | Registro de presença | CHECKIN ou ADMIN |
| `/admin/dashboard` | Dashboard | ADMIN |
| `/admin/alunos` | Lista de alunos | ADMIN |
| `/admin/alunos/:id` | Detalhe do aluno | ADMIN |
| `/admin/usuarios` | Gestão de usuários | ADMIN |

## Tecnologias

- Angular 20
- Angular Material (M3)
- TypeScript (strict mode)
- RxJS
- Standalone Components
- Lazy Loading
- Reactive Forms
