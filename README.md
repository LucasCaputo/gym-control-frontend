# Nonada Academia – Frontend

Web application for managing a martial arts academy. Built with **Angular** and **Angular Material**.

## Prerequisites

- **Node.js** 20+
- **npm** 10+
- Backend API running at `http://localhost:3000`

## Installation

```bash
npm install
```

## Development

1. Ensure the backend API is running at `http://localhost:3000`.
2. Start the app:

```bash
ng serve
```

3. Open: `http://localhost:4200`

## Production build

```bash
ng build
```

## Project structure

```
src/app/
├── core/                  # Guards, interceptors, global services
│   ├── guards/            # AuthGuard, RoleGuard
│   ├── interceptors/      # Auth and Error interceptors
│   └── services/          # AuthService, StorageService
├── shared/                # Shared components, pipes, models
│   ├── components/        # CPF Mask, Confirm Dialog, Loading Spinner, etc.
│   ├── models/            # Interfaces and enums
│   ├── pipes/             # CPF Pipe
│   ├── utils/             # CPF utilities
│   └── validators/        # CPF validator
├── features/              # Feature modules
│   ├── public/            # Registration (public form)
│   ├── auth/              # Login
│   ├── checkin/           # Class attendance (check-in)
│   └── admin/             # Admin panel
│       ├── layout/        # Layout with sidenav
│       ├── dashboard/     # Dashboard
│       ├── students/      # Student management
│       ├── payments/      # Payments
│       └── users/         # Admin user management
├── app.ts                 # Root component
├── app.config.ts         # Application config
└── app.routes.ts         # Application routes
```

## Routes

| Route | Description | Auth |
|-------|-------------|------|
| `/login` | Login | No |
| `/matricula` | Registration form | No |
| `/matricula/sucesso` | Registration confirmation | No |
| `/checkin` | Check-in (attendance) | CHECKIN or ADMIN |
| `/admin/dashboard` | Dashboard | ADMIN |
| `/admin/alunos` | Student list | ADMIN |
| `/admin/alunos/:id` | Student detail | ADMIN |
| `/admin/usuarios` | User management | ADMIN |

## Roles

- **ADMIN** – Full access: students, payments, check-ins, users.
- **CHECKIN** – Reception: search students and register check-ins only.

## Tech stack

- **Angular** 20
- **Angular Material** (M3)
- **TypeScript** (strict mode)
- **RxJS**
- Standalone components
- Lazy loading
- Reactive forms
- SSR (Angular SSR)

## API

The app expects a NestJS REST API. The full contract is documented in `docs/API_CONTRACT.md`.
