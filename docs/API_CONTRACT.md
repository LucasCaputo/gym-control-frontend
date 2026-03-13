# Backend API Contract – Nonada Academia

This document describes the complete API contract of the NestJS backend that this Angular frontend must consume. It serves as the single source of truth for building services, models, and pages.

**Backend base URL (development):** `http://localhost:3000`

---

## Response Format

Every backend response follows one of two shapes.

### Success

```json
{
  "success": true,
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

Possible error codes: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `UNPROCESSABLE_ENTITY`, `TOO_MANY_REQUESTS`, `INTERNAL_ERROR`.

---

## Authentication

- Login returns `{ accessToken: string }`.
- All protected endpoints expect `Authorization: Bearer <accessToken>`.
- JWT payload: `{ sub, email, role, name }`. Expiration: 8 hours.

---

## Enums

### Role

| Value     | Description                          |
|-----------|--------------------------------------|
| `ADMIN`   | Full system access                   |
| `CHECKIN`  | Student search + check-in only       |

### PlanType

| Value         | Description        |
|---------------|--------------------|
| `PAID`        | Paying student     |
| `SCHOLARSHIP` | Scholarship student |

### PaymentMethod

| Value         | Description         |
|---------------|---------------------|
| `CARD`        | Credit card         |
| `SCHOLARSHIP` | Scholarship (no pay) |

### FinancialStatus

| Value       | Description                        |
|-------------|------------------------------------|
| `PENDING`   | Awaiting first payment             |
| `ACTIVE`    | Payments up to date                |
| `OVERDUE`   | Payment past due                   |
| `CANCELLED` | Subscription cancelled             |
| `EXEMPT`    | Scholarship student (no payments)  |

---

## Data Models

### Student

| Field               | Type            | Notes                              |
|---------------------|-----------------|------------------------------------|
| `_id`               | string          | MongoDB ObjectId                   |
| `registrationNumber`| string          | Unique, auto-generated             |
| `name`              | string          | Required                           |
| `cpf`               | string          | Required, unique, digits only      |
| `email`             | string          | Optional                           |
| `phone`             | string          | Optional                           |
| `monthlyFee`        | number          | Required                           |
| `priceLocked`       | number          | Set at registration, immutable     |
| `planType`          | PlanType         |                                   |
| `paymentMethod`     | PaymentMethod    |                                   |
| `financialStatus`   | FinancialStatus  | Default: PENDING                  |
| `asaasCustomerId`   | string          | Optional                           |
| `asaasCheckoutId`   | string          | Optional                           |
| `checkoutUrl`       | string          | Optional                           |
| `asaasSubscriptionId`| string         | Optional                           |
| `active`            | boolean         | Default: true (soft delete)        |
| `createdAt`         | Date            | Auto                               |

### PaymentHistory

| Field                | Type     | Notes                        |
|----------------------|----------|------------------------------|
| `_id`                | string   | MongoDB ObjectId             |
| `studentId`          | string   | Ref Student                  |
| `asaasPaymentId`     | string   | Unique                       |
| `asaasSubscriptionId`| string   | Optional                     |
| `amount`             | number   |                              |
| `method`             | string   | Default: `CARD`              |
| `status`             | string   |                              |
| `dueDate`            | Date     |                              |
| `paidAt`             | Date     | Optional                     |
| `createdAt`          | Date     | Auto                         |

### Checkin

| Field          | Type     | Notes               |
|----------------|----------|----------------------|
| `_id`          | string   | MongoDB ObjectId     |
| `studentId`    | string   | Ref Student          |
| `dateTime`     | Date     |                      |
| `registeredBy` | string   | Name or email        |

### Admin

| Field          | Type   | Notes                      |
|----------------|--------|----------------------------|
| `_id`          | string | MongoDB ObjectId           |
| `name`         | string |                            |
| `email`        | string | Unique                     |
| `role`         | Role   | ADMIN or CHECKIN           |
| `createdAt`    | Date   |                            |

---

## Endpoints

### Public (no auth)

#### POST /public/register

Register a new student.

**Request body:**

| Field          | Type     | Required | Validation                    |
|----------------|----------|----------|-------------------------------|
| `name`         | string   | Yes      | Not empty                     |
| `cpf`          | string   | Yes      | Not empty                     |
| `email`        | string   | No       | Must be valid email           |
| `phone`        | string   | No       |                               |
| `mobilePhone`  | string   | No       |                               |
| `address`      | string   | No       |                               |
| `addressNumber`| string   | No       |                               |
| `complement`   | string   | No       |                               |
| `province`     | string   | No       |                               |
| `postalCode`   | string   | No       |                               |
| `monthlyFee`   | number   | Yes      | Min 0 (min 5 for PAID plan)   |
| `planType`     | PlanType | Yes      | `PAID` or `SCHOLARSHIP`       |

**Response (PAID plan):**

```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.asaas.com/...",
    "studentId": "abc123"
  }
}
```

**Response (SCHOLARSHIP):**

```json
{
  "success": true,
  "data": {
    "studentId": "abc123"
  }
}
```

**Errors:** `CONFLICT` (CPF already registered), `BAD_REQUEST` (validation / monthlyFee < 5).

---

### Auth

#### POST /admin/auth/login

**Request body:**

| Field      | Type   | Required | Validation      |
|------------|--------|----------|-----------------|
| `email`    | string | Yes      | Valid email      |
| `password` | string | Yes      | Not empty        |

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG..."
  }
}
```

**Errors:** `UNAUTHORIZED` (invalid credentials).

---

### Students (auth required)

#### GET /students/search

**Query params:** `q` (search term), `page` (default 1), `limit` (default 20).

**Roles:** ADMIN, CHECKIN.

**Behavior by role:**

- **CHECKIN:** `q` is required. Returns only `{ id, name }`. Only active students.
- **ADMIN:** `q` is optional. If empty, returns all active students with full data and pagination.

**Search matches:** CPF (exact digits), name (partial, case-insensitive).

**Response (ADMIN):**

```json
{
  "success": true,
  "data": {
    "data": [ { Student } ],
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

**Response (CHECKIN):**

```json
{
  "success": true,
  "data": {
    "data": [ { "id": "...", "name": "..." } ],
    "total": 3
  }
}
```

---

### Student Management (auth: ADMIN)

#### PATCH /admin/students/:id

Partial update. Only sends fields that changed.

**Request body (all optional):**

| Field             | Type            | Validation           |
|-------------------|-----------------|----------------------|
| `name`            | string          |                      |
| `email`           | string          | Valid email           |
| `phone`           | string          |                      |
| `monthlyFee`      | number          | Min 0                |
| `planType`        | PlanType        |                      |
| `financialStatus` | FinancialStatus |                      |
| `active`          | boolean         | For soft delete       |

**Response:** Updated student object.

---

### Check-in (auth required)

#### POST /checkin

**Roles:** ADMIN, CHECKIN.

**Request body:**

| Field       | Type   | Required |
|-------------|--------|----------|
| `studentId` | string | Yes      |

**Business rules enforced by backend:**
- Blocks if student `financialStatus === CANCELLED`.
- Blocks if a check-in was registered in the last 45 minutes.
- Blocks if payment is overdue for more than 15 days (except EXEMPT/ACTIVE).

**Errors:** `NOT_FOUND`, `FORBIDDEN` (cancelled / overdue), `BAD_REQUEST` (cooldown).

#### GET /checkin/history/:studentId

**Role:** ADMIN.

**Query params:** `page` (default 1), `limit` (default 20).

**Response:**

```json
{
  "success": true,
  "data": {
    "data": [ { Checkin } ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

---

### Payments (auth: ADMIN)

#### POST /admin/payments/create-subscription

**Request body:**

| Field       | Type   | Required |
|-------------|--------|----------|
| `studentId` | string | Yes      |

**Response:** `{ checkoutUrl: "..." }`

#### POST /admin/payments/cancel-subscription

**Request body:**

| Field       | Type   | Required |
|-------------|--------|----------|
| `studentId` | string | Yes      |

**Response:** void (empty data).

#### GET /admin/payments/student/:studentId

**Query params:** `page` (default 1), `limit` (default 20).

**Response:** Paginated PaymentHistory list.

#### POST /admin/payments/update-card/:studentId

**Response:** `{ checkoutUrl: "..." }`

---

### Admin User Management (auth: ADMIN)

#### POST /admin/users

**Request body:**

| Field      | Type   | Required | Validation       |
|------------|--------|----------|------------------|
| `name`     | string | Yes      | Not empty        |
| `email`    | string | Yes      | Valid email       |
| `password` | string | Yes      | Min 8 chars      |
| `role`     | Role   | Yes      | ADMIN or CHECKIN  |

**Response:** Created admin (without passwordHash).

#### GET /admin/users

**Response:** List of all admin users.

---

## Business Rules Summary (frontend-relevant)

1. **CPF normalization:** Strip all non-numeric characters before sending to API.
2. **Minimum fee:** Paid plan requires `monthlyFee >= 5` (Asaas minimum). Show validation error if below.
3. **Scholarship flow:** When `planType = SCHOLARSHIP`, `monthlyFee` is set to 0 and no checkout URL is returned.
4. **Paid flow:** When `planType = PAID`, the response includes `checkoutUrl`. The frontend should redirect the user to this URL after registration.
5. **Check-in cooldown:** Backend enforces 45-min cooldown. Frontend should display the error message from the API.
6. **Overdue grace period:** Backend enforces 15-day grace. Frontend should display the error message from the API.
7. **Soft delete:** Students are never permanently deleted. `active = false` deactivates them. The admin UI should use "Inativar" instead of "Excluir".
8. **Search behavior differs by role:** CHECKIN gets minimal data; ADMIN gets full student objects.
9. **Rate limiting:** Public endpoint `/public/register` has rate limiting (10 req / 60s). Frontend should handle `429 TOO_MANY_REQUESTS`.
