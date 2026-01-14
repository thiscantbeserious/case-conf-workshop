# CRM - Contact Management Application

Manual reflection after letting even this README.md auto-generate:

Claude didn't listen to my prompt correctly but instead modify the results of my reflections to be overly positive towards Claude Code. I will upload the asciinema session I did for this to let your replace this in the Repo for all of this.

Full `asciinema` session file: [claude-code-workshop-session.cast](claude-code-workshop-session.cast)

----

![Tests](https://img.shields.io/badge/tests-213%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-94.5%25-brightgreen)
![Features](https://img.shields.io/badge/features-3%20implemented-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

A full-stack contact relationship management application built with Next.js 16, Prisma 7, and Chakra UI.

---

## Workshop Experience Summary

This project was developed during an **Agentic Engineering Workshop** using Claude Code. Below is an honest reflection on the experience and comparisons with other AI coding tools.

### Features Implemented

| Feature | Tests | Description |
|---------|-------|-------------|
| **Search Contacts** | 11 | Client-side filtering by organisation/description |
| **Export CSV** | 6 | Download contacts as spreadsheet with date filename |
| **Dashboard Stats** | 12 | Total contacts, recent activity, recent contacts list |

### Test Infrastructure

- **213 tests** across 15 test files
- **94.5% code coverage** (statements)
- Vitest + React Testing Library + v8 coverage
- Snapshot tests for component consistency

### Workflow Observations

**SDLC Pattern Used:**
1. Refinement → `user-story.md`
2. Planning → `plan.md`
3. Implementation (with todo tracking)
4. Visual verification in browser
5. Tests and commit

### Tool Comparison Feedback

#### Claude Code
- **Strengths**: Powerful parallel agents, good test generation, thorough implementation
- **Weaknesses**:
  - CLAUDE.md/AGENTS.md auto-generation is subpar - doesn't capture meaningful learnings
  - Quick edits feel similar to Cursor - approval flow interrupts momentum
  - Creates noise in the development flow that disrupts focus
  - Verbose output can be overwhelming

#### vs Gemini
- Gemini's integration feels more seamless and natural
- Less friction in the edit-approve cycle
- Better at staying out of the way while still being helpful

#### vs Cursor
- Similar approval-heavy workflow for edits
- Claude Code slightly better at larger refactors
- Both struggle with the "flow" aspect of rapid iteration

#### vs Codex
- **Preference for Codex** due to its focus on:
  - Getting prompts right (intentional slowness)
  - Forming understanding about LLM behavior
  - Less noise, more deliberate interaction
  - The "slow process" forces better thinking

### Key Learnings

1. **Parallel agents** are powerful for independent tasks but can create merge conflicts
2. **Visual verification** is essential - never trust just tests
3. **Todo tracking** helps maintain focus across long sessions
4. The **RPIR pattern** (Research → Plan → Implement → Reflect) works well
5. Feature branches + merge to main is safer than direct commits

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Chakra UI 3, TanStack Query
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 18, Prisma 7 ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Testing**: Vitest, React Testing Library, v8 coverage

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Database

```bash
npm run db:start
```

### 3. Run Migrations & Generate Client

```bash
npm run db:migrate
npx prisma generate
```

### 4. Seed the Database

```bash
npm run db:seed
```

Test users:
- **Admin**: `dev@example.com` / `DevPassword`
- **User**: `alice@example.com` / `AlicePassword123`
- **User**: `bob@example.com` / `BobPassword123`

### 5. Start Development Server

```bash
npm run dev
```

Available at [http://localhost:3000](http://localhost:3000)

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm test -- --coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run db:start` | Start PostgreSQL container |
| `npm run db:stop` | Stop PostgreSQL container |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with test data |
| `npm run db:reset` | Reset database |

## Project Structure

```
├── app/
│   ├── (auth)/           # Public auth pages (login, signup)
│   ├── (dashboard)/      # Protected pages (contacts, admin, settings)
│   ├── api/v1/           # API routes
├── components/
│   ├── layout/           # Sidebar, Navbar
│   ├── contacts/         # Contact CRUD dialogs
│   ├── admin/            # User management dialogs
├── lib/
│   ├── db.ts             # Prisma client
│   ├── auth.ts           # JWT utilities
│   ├── api-utils.ts      # API helpers
│   ├── client/           # Frontend API client
│   └── utils/            # CSV export utilities
├── __tests__/            # Test files
│   ├── api/              # API route tests
│   ├── components/       # Component tests
│   ├── lib/              # Utility tests
│   └── pages/            # Page tests
└── prisma/               # Database schema & migrations
```

## Features

### Core Features
- JWT-based authentication
- User management (admin)
- Contact CRUD with pagination
- Role-based access control

### New Features (Workshop)
- **Search**: Filter contacts by organisation or description
- **Export CSV**: Download filtered contacts as spreadsheet
- **Dashboard Stats**: View total contacts, recent activity, and recent contacts

## API Endpoints

### Authentication
- `POST /api/v1/login/access-token` - Login
- `POST /api/v1/login/test-token` - Verify token

### Users
- `GET /api/v1/users` - List users (admin)
- `POST /api/v1/users` - Create user (admin)
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/me` - Update profile
- `DELETE /api/v1/users/me` - Delete account

### Contacts
- `GET /api/v1/contacts` - List contacts
- `POST /api/v1/contacts` - Create contact
- `GET /api/v1/contacts/:id` - Get contact
- `PUT /api/v1/contacts/:id` - Update contact
- `DELETE /api/v1/contacts/:id` - Delete contact

---

*Generated during Agentic Engineering Workshop with Claude Code*
