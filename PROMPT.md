# Prompt completo – Frontend Academia (Angular + Angular Material)

You are a senior frontend engineer specialized in Angular, Angular Material and TypeScript.

Your task is to design and implement a production-ready frontend application for a martial arts academy management system.

The system must consume a NestJS REST API whose full contract is documented in `docs/API_CONTRACT.md`. Read that file before writing any code. It is the single source of truth for endpoints, models, DTOs, enums and response formats.

The system must follow Angular best practices and be modular, responsive and ready for production.

## TECH STACK

- Angular (latest stable, currently v19+)
- Angular Material as the UI component library
- TypeScript in strict mode
- RxJS for async data flows
- Reactive Forms with validation
- Angular Router with guards and lazy loading
- Standalone components (no NgModules except where strictly required)

## ANGULAR CLI MCP

This project has the Angular CLI MCP server configured in `.cursor/mcp.json`.

Before implementing any feature, use the MCP tools to ensure you follow Angular best practices:

- Use `get_best_practices` to retrieve the Angular Best Practices Guide and follow it strictly.
- Use `search_documentation` when unsure about an Angular API, pattern or feature.
- Use `find_examples` to find authoritative code examples for modern Angular patterns.
- Use `list_projects` to verify the workspace structure after scaffolding.

The MCP is the authoritative reference for Angular conventions. Do not guess Angular APIs; look them up.

## ENVIRONMENT AND LOCAL SETUP

**Environment variables**

The project must use Angular environments (`environment.ts` / `environment.development.ts`) for configuration.

Required variables:

- `apiBaseUrl` (default for development: `http://localhost:3000`)
- `production` (boolean)

**Local development**

Document in README:

1. Install dependencies: `npm install`
2. Ensure the backend API is running at `http://localhost:3000`
3. Start the app: `ng serve`
4. Access: `http://localhost:4200`

## BUSINESS CONTEXT

The system manages a martial arts academy.

Students do not log in to the system. They interact only during registration via a public form.

The academy reception has a computer logged into the system using a CHECKIN role to register class attendance.

Administrators manage the entire system.

## ROLES

Only two roles exist.

**ADMIN**
Full control of the system. Can manage students, payments, check-ins, and admin users.

**CHECKIN**
Used by the reception computer to search students and register check-ins. Minimal UI, optimized for speed.

## ARCHITECTURE

### Project structure

```
src/
  app/
    core/
      guards/
        auth.guard.ts
        role.guard.ts
      interceptors/
        auth.interceptor.ts
        error.interceptor.ts
      services/
        auth.service.ts
        storage.service.ts
    shared/
      models/
        student.model.ts
        payment.model.ts
        checkin.model.ts
        admin.model.ts
        api-response.model.ts
        enums.ts
      components/
        cpf-mask/
        confirm-dialog/
        loading-spinner/
        financial-status-badge/
      pipes/
        cpf.pipe.ts
      utils/
        cpf.utils.ts
      validators/
        cpf.validator.ts
    features/
      public/
        registration/
          registration.component.ts
          registration-success.component.ts
      auth/
        login/
          login.component.ts
      checkin/
        checkin.component.ts
        services/
          checkin.service.ts
      admin/
        layout/
          admin-layout.component.ts
        dashboard/
          dashboard.component.ts
        students/
          student-list/
            student-list.component.ts
          student-detail/
            student-detail.component.ts
          student-edit-dialog/
            student-edit-dialog.component.ts
          services/
            student.service.ts
        payments/
          services/
            payment.service.ts
        users/
          user-list/
            user-list.component.ts
          user-create-dialog/
            user-create-dialog.component.ts
          services/
            admin-user.service.ts
    app.component.ts
    app.config.ts
    app.routes.ts
  environments/
    environment.ts
    environment.development.ts
```

### Rules

- All components must be standalone.
- Feature modules must be lazy-loaded via the router.
- Services in `core/` are app-wide singletons (providedIn: root).
- Services in `features/*/services/` are feature-scoped.
- Models and enums in `shared/models/` must mirror the backend contract exactly (see `docs/API_CONTRACT.md`).
- Shared UI components go in `shared/components/`.
- No business logic in components. Components call services; services call the API.
- Every HTTP call must go through a dedicated service. Components never use HttpClient directly.

## API INTEGRATION

### Base URL

Use `environment.apiBaseUrl` for all HTTP calls. Never hardcode URLs.

### Response unwrapping

The backend wraps every response in `{ success: true, data: ... }` or `{ success: false, error: ... }`.

Create a generic API response model:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

Services should unwrap `data` from successful responses and throw on errors.

### Pagination

Paginated endpoints return:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

### Authentication interceptor

Create an HTTP interceptor that:

1. Reads the JWT token from localStorage.
2. Attaches `Authorization: Bearer <token>` to every request except those to `/public/*`.
3. On 401 response: clears stored token, redirects to `/login`.

### Error interceptor

Create an HTTP interceptor that:

1. Catches error responses.
2. Extracts the `error.message` from the backend response body.
3. Displays the message using MatSnackBar.
4. For `429 TOO_MANY_REQUESTS`: shows "Too many attempts. Please wait before trying again."

## ROUTING

```
/                        → redirect to /login
/matricula               → PublicRegistrationComponent (no auth)
/matricula/sucesso       → RegistrationSuccessComponent (no auth)
/login                   → LoginComponent (no auth)
/checkin                 → CheckinComponent (requires auth, role: CHECKIN or ADMIN)
/admin                   → AdminLayoutComponent (requires auth, role: ADMIN)
  /admin/dashboard       → DashboardComponent
  /admin/alunos          → StudentListComponent
  /admin/alunos/:id      → StudentDetailComponent
  /admin/usuarios        → UserListComponent
```

### Route guards

**AuthGuard**: checks if JWT exists and is not expired. Redirects to `/login` if not.

**RoleGuard**: checks if the logged-in user has the required role. Redirects to `/login` if not.

The guards must decode the JWT payload to read `role` and `exp` without a backend call.

### Post-login redirect

After successful login:

- If role is ADMIN → navigate to `/admin/dashboard`
- If role is CHECKIN → navigate to `/checkin`

## PAGES AND COMPONENTS

### Public Registration Page (`/matricula`)

Full-width page without sidenav. Clean, modern layout.

Use Angular Material Stepper with 3 steps:

**Step 1 – Personal Data**
- Name (required)
- CPF (required, with mask `000.000.000-00`, validated)
- Email (optional, validated as email)
- Phone (optional)
- Mobile phone (optional)

**Step 2 – Address (optional)**
- Address
- Number
- Complement
- Neighborhood (province)
- Postal code (with mask `00000-000`)

**Step 3 – Plan**
- Plan type: radio group (PAID / SCHOLARSHIP)
- Monthly fee: number input, visible only when plan is PAID, min value 5

**Submit behavior:**
- Normalize CPF (strip non-digits) before sending.
- If SCHOLARSHIP: call API, on success navigate to `/matricula/sucesso` with a success message.
- If PAID: call API, on success redirect to `checkoutUrl` returned by the API (external Asaas page).

**Error handling:**
- CPF already registered (409 CONFLICT): show message on the CPF field.
- Validation errors: show per-field errors.
- Rate limit (429): show snackbar.

### Registration Success Page (`/matricula/sucesso`)

Simple page with a success message for scholarship students. No navigation to admin areas.

### Login Page (`/login`)

Centered card with:
- Email input (required, email validation)
- Password input (required, with show/hide toggle)
- Login button with loading state
- On success: store token in localStorage, redirect based on role.
- On error: show "Invalid credentials" message.

### Check-in Page (`/checkin`)

Optimized for reception use. Minimal, fast UI.

**Layout:**
- Search bar at the top (autofocus, placeholder "Search by name or CPF")
- Results list below with student name
- Clicking a student triggers the check-in

**Behavior:**
- Minimum 3 characters to trigger search.
- Debounce search input by 400ms.
- Call `GET /students/search?q=<term>` (CHECKIN role returns only id and name).
- On click: show confirmation dialog "Register check-in for [Student Name]?"
- On confirm: call `POST /checkin` with `{ studentId }`.
- On success: show success snackbar, clear search.
- On error (45-min cooldown, cancelled, overdue): show error snackbar with the backend message.

**Header:**
- Show logged-in user name.
- Logout button.

### Admin Layout (`/admin`)

Angular Material Sidenav layout:

**Sidenav items:**
- Dashboard
- Students
- Admin Users

**Toolbar:**
- App title: "Nonada Academia"
- Logged-in user name
- Logout button

### Admin Dashboard (`/admin/dashboard`)

Summary cards showing:
- Total active students (from search endpoint with no query)
- Quick actions: "New Registration" link, "Check-in" link

### Student List (`/admin/alunos`)

**Features:**
- Search bar (name or CPF, debounced 400ms)
- Table with columns: Name, CPF (formatted), Plan, Financial Status, Active
- Financial status displayed as colored badge:
  - ACTIVE: green
  - PENDING: yellow/amber
  - OVERDUE: red
  - CANCELLED: gray
  - EXEMPT: blue
- Pagination using MatPaginator
- Click row → navigate to `/admin/alunos/:id`
- Bulk action is not required.

### Student Detail (`/admin/alunos/:id`)

**Student info card:**
- Name, CPF (formatted), Email, Phone
- Plan type, Payment method
- Monthly fee, Price locked
- Financial status (badge)
- Active status
- Registration number
- Created at

**Action buttons:**
- Edit (opens dialog)
- Deactivate / Activate (toggle `active` with confirmation dialog)
- Create Subscription (if no active subscription)
- Cancel Subscription (if active subscription, with confirmation)
- Update Card (generates new checkout URL, show it in a dialog or copy to clipboard)

**Tabs:**
- Payment History: table with columns Date Due, Amount, Status, Paid At. Paginated.
- Check-in History: table with columns Date/Time, Registered By. Paginated.

### Student Edit Dialog

MatDialog with form fields matching `UpdateStudentDto`:
- Name
- Email
- Phone
- Monthly fee (number, min 0)
- Plan type (select)
- Financial status (select)

Save calls `PATCH /admin/students/:id` with only changed fields.

### Admin User List (`/admin/usuarios`)

**Features:**
- Table with columns: Name, Email, Role, Created At
- "New User" button opens create dialog
- No edit or delete (not supported by backend)

### Admin User Create Dialog

MatDialog with form:
- Name (required)
- Email (required, email validation)
- Password (required, min 8 characters, with show/hide toggle)
- Role (select: ADMIN, CHECKIN)

Calls `POST /admin/users`.

## SHARED COMPONENTS

### CPF Mask Directive

Formats CPF input as `000.000.000-00` while typing. Stores only digits in the form control value.

### Confirm Dialog

Reusable MatDialog that accepts title, message and optional confirm/cancel button labels. Returns boolean on close.

### Loading Spinner

Overlay spinner component for async operations.

### Financial Status Badge

Component that renders the financial status as a colored MatChip or badge:
- ACTIVE → green
- PENDING → amber
- OVERDUE → red
- CANCELLED → gray
- EXEMPT → blue

### CPF Pipe

Pipe that formats a digits-only CPF string as `000.000.000-00` for display.

## MODELS AND ENUMS

All TypeScript interfaces and enums must be defined in `shared/models/` and must exactly match the backend contract documented in `docs/API_CONTRACT.md`.

```typescript
// enums.ts
enum Role { ADMIN = 'ADMIN', CHECKIN = 'CHECKIN' }
enum PlanType { PAID = 'PAID', SCHOLARSHIP = 'SCHOLARSHIP' }
enum PaymentMethod { CARD = 'CARD', SCHOLARSHIP = 'SCHOLARSHIP' }
enum FinancialStatus { PENDING = 'PENDING', ACTIVE = 'ACTIVE', OVERDUE = 'OVERDUE', CANCELLED = 'CANCELLED', EXEMPT = 'EXEMPT' }
```

## FORM VALIDATION

- CPF: required, must have exactly 11 digits after stripping non-numeric characters.
- Email: Angular built-in email validator.
- Monthly fee (PAID plan): required, min 5.
- Password (admin create): required, min length 8.
- Use Reactive Forms exclusively. No template-driven forms.
- Show validation errors below fields using `<mat-error>`.

## UX AND DESIGN

### Theme

Use Angular Material theming with a custom palette. Suggested primary color: deep blue or indigo. Accent: amber or teal. Warn: red.

### Typography

Use Angular Material typography system. All text in Portuguese (Brazil).

### Responsiveness

- Registration page: full-width, mobile-friendly.
- Check-in page: optimized for a single screen at the reception desk.
- Admin layout: responsive sidenav (side mode on desktop, over mode on mobile).

### Feedback

- Loading states: disable buttons and show spinner during API calls.
- Success operations: MatSnackBar with green/success styling.
- Error operations: MatSnackBar with red/error styling, message from API.
- Destructive actions (deactivate, cancel subscription): require confirmation dialog.
- Empty states: show a message with an icon when lists are empty.

### Language

All visible text in the UI must be in Portuguese (Brazil):
- "Matrícula" (Registration)
- "Alunos" (Students)
- "Presença" (Check-in)
- "Pagamentos" (Payments)
- "Usuários" (Users)
- "Mensalidade" (Monthly fee)
- "Bolsista" (Scholarship)
- "Inativar" (Deactivate) — never "Excluir" (Delete)
- "Buscar" (Search)
- Etc.

## SERVICES

### AuthService

- `login(email, password): Observable<void>` — calls API, stores token, decodes payload.
- `logout(): void` — clears token, navigates to `/login`.
- `getToken(): string | null`
- `getUser(): { sub, email, role, name } | null` — decoded from JWT.
- `isAuthenticated(): boolean`
- `hasRole(role: Role): boolean`

### StudentService

- `search(q, page, limit): Observable<PaginatedResponse<Student>>`
- `update(id, data): Observable<Student>`
- `register(data): Observable<{ checkoutUrl?: string; studentId: string }>`

### CheckinService

- `create(studentId): Observable<Checkin>`
- `getHistory(studentId, page, limit): Observable<PaginatedResponse<Checkin>>`

### PaymentService

- `getStudentPayments(studentId, page, limit): Observable<PaginatedResponse<PaymentHistory>>`
- `createSubscription(studentId): Observable<{ checkoutUrl: string }>`
- `cancelSubscription(studentId): Observable<void>`
- `updateCard(studentId): Observable<{ checkoutUrl: string }>`

### AdminUserService

- `create(data): Observable<Admin>`
- `list(): Observable<Admin[]>`

## IMPLEMENTATION PRIORITY

The system must be generated in the following strict order.

1. **Step 1** – Scaffold Angular project with Angular Material. Configure environments, theme, and global styles.
2. **Step 2** – Generate shared models, enums, and utility functions (CPF utils, pipes, validators).
3. **Step 3** – Generate core services (AuthService, StorageService), interceptors, and guards.
4. **Step 4** – Generate routing structure with lazy-loaded feature routes and guards.
5. **Step 5** – Generate Login page.
6. **Step 6** – Generate Admin layout (sidenav, toolbar, logout).
7. **Step 7** – Generate Public Registration page with stepper and form validation.
8. **Step 8** – Generate Check-in page.
9. **Step 9** – Generate Student List page with search, table, and pagination.
10. **Step 10** – Generate Student Detail page with tabs (payment history, check-in history).
11. **Step 11** – Generate Student Edit dialog and payment action buttons.
12. **Step 12** – Generate Admin User management (list + create dialog).
13. **Step 13** – Generate Dashboard page.
14. **Step 14** – Generate shared components (confirm dialog, loading spinner, financial status badge).
15. **Step 15** – Final polish: empty states, error handling edge cases, responsive adjustments.

Do not skip steps. Do not implement pages before services and models exist. Shared components can be generated as needed during page implementation.

## GENERATE

- Complete Angular project scaffold
- Angular Material setup with custom theme
- All shared models and enums matching backend contract
- All services with full API integration
- JWT authentication with interceptors and guards
- All pages and components listed above
- Reactive forms with complete validation
- Routing with lazy loading and role-based guards
- Responsive layout
- Portuguese (Brazil) text throughout the UI
