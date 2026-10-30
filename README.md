# Task Manager — Full-Stack MERN Web Application

An elegant, production-grade Task Management Web Application built with the **MERN** stack (MongoDB, Express, React, Node.js), featuring JWT authentication, role-based access control (User and Administrator), dynamic project analytics, date-range compliance reports with CSV download, and **Groq AI** task description generation.

---

## 1. Project Overview

Task Manager provides a unified collaborative board for planning, executing, and auditing tasks across three workflow stages:
- **Pending**
- **In Progress**
- **Completed** (with strikethrough styling and completion timestamps)

The visual design implements a soft, elegant **pink-purple-lavender** theme (`#7041A5`, `#B34D91`, `#38234C`, `#F8F3FC`, `#FFF2F8`, `#F0E5F8`) inspired by the project screenshots, paired with clean typography using **Plus Jakarta Sans**.

---

## 2. Key Features

- **Strict Independent Folder Structure**: Clean separation between `frontend/` and `backend/`.
- **Two Distinct Roles**:
  - **User (Member)**: Create, view, edit, prioritize, and manage personal tasks; access project statistics and AI description generator.
  - **Administrator**: Dedicated Admin Dashboard (`/admin`), cross-workspace task auditing, date-range filtering, and real-time CSV report export.
- **AI Task Description Generator**: Integrates the **Groq API** (`llama-3.3-70b-versatile`) with server-side per-user rate limiting (1 generation per task title per minute) and editable previews.
- **Projects & Dynamic Chart**: Interactive SVG status distribution chart with **Show/Hide Chart** toggle and live completion metrics.
- **Secure Password Reset**: Cryptographic token generation, expiration checks, and bcrypt password updates with local development helper links.
- **Contact Support**: Validated inquiry submission form with structured backend persistence.
- **Dual Database Architecture**: Direct Mongoose integration with local MongoDB (`mongodb://127.0.0.1:27017/task_manager`) or Atlas, paired with seamless persistent file-backed local storage so the application runs without disruption.

---

## 3. Technology Stack

### Frontend
- **React 19** with functional hooks and Context API (`AuthContext`)
- **Vite 8** for fast bundling and hot reloading
- **Tailwind CSS v4** with custom lavender & purple theme tokens
- **Lucide React** for icons
- **Axios** with JWT request/response interceptors

### Backend
- **Node.js** & **Express.js** REST API
- **MongoDB** & **Mongoose** ORM
- **JWT (JSON Web Tokens)** for stateless authentication
- **bcryptjs** for secure password hashing
- **Groq Cloud API** (`llama-3.3-70b-versatile`) for AI generation
- **CORS** & rate-limiting middleware

---

## 4. Project Folder Structure

```
task-manager/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskCard.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── Admin.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   └── ResetPassword.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── adminController.js
│   │   ├── aiController.js
│   │   └── contactController.js
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── aiRoutes.js
│   │   └── contactRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── adminMiddleware.js
│   ├── services/
│   │   └── groqService.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── server.ts            # Unified dev/production server for port 3000
├── .env.example         # Root environment template
├── .gitignore
├── package.json
└── README.md
```

---

## 5. Environment Variables Setup (`.env`)

Create a `.env` file in the project root (or inside `backend/`):

```bash
# Server Port
PORT=3000
NODE_ENV=development

# Database Configuration (MongoDB Community Server)
MONGO_URI=mongodb://127.0.0.1:27017/task_manager

# Security & JWT
JWT_SECRET=replace-with-a-long-random-secret

# Initial Administrator Credentials (Auto-created on boot)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-unique-strong-password

# Groq Cloud AI API (Get free key at: https://console.groq.com/)
GROQ_API_KEY=your_actual_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

---

## 6. Installation & Running

### Option A: Unified Full-Stack Run (Recommended)

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start the server**:
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:3000`. Both frontend and backend API (`/api/*`) are served on port 3000.

### Option B: Standalone Frontend & Backend

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   node server.js
   # Running on http://localhost:5000
   ```
2. **Start Frontend in another terminal**:
   ```bash
   cd frontend
   npm install
   npm run dev
   # Running on http://localhost:5173 with proxy to http://localhost:5000
   ```

---

## 7. Default Credentials for Testing

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@taskmanager.com` | `Admin@123456` | Full access: Tasks, Projects, Admin Dashboard, Date-Range Reports, CSV Export |
| **Member (User)** | Register via UI or `user@taskmanager.com` | `User@123456` | Personal tasks, Projects, Contact (Admin access strictly denied) |

---

## 8. API Endpoint Documentation

### Authentication
- `POST /api/auth/register` — Register a new member account (`name`, `email`, `password`, `confirmPassword`).
- `POST /api/auth/login` — Sign in and receive JWT token.
- `POST /api/auth/logout` — Invalidate user session.
- `GET /api/auth/me` — Fetch currently authenticated user profile.
- `POST /api/auth/forgot-password` — Generate secure password reset token.
- `POST /api/auth/reset-password` — Set new password using verified token.

### Tasks
- `GET /api/tasks` — List tasks for current user.
- `POST /api/tasks` — Create task (`title`, `description`, `priority`, `status`).
- `GET /api/tasks/:id` — Get single task details.
- `PUT /api/tasks/:id` — Update task fields.
- `PATCH /api/tasks/:id/status` — Quick move between Pending, In Progress, Completed.
- `DELETE /api/tasks/:id` — Remove task permanently.
- `GET /api/projects/stats` — Overall task counts and completion rate.

### Administrator Only (Protected by `requireAdmin`)
- `GET /api/admin/dashboard` — Cross-workspace telemetry, total user accounts, and status counts.
- `GET /api/admin/reports?from=YYYY-MM-DD&to=YYYY-MM-DD` — Filter tasks by date range.
- `GET /api/admin/reports/export?from=YYYY-MM-DD&to=YYYY-MM-DD` — Download report as formatted `.csv` file.

### AI Integration
- `POST /api/ai/generate-description` — Groq AI-powered task description generator with 1-min per-title rate limiting.

### Contact Support
- `POST /api/contact` — Submit user inquiry or feedback message.

---

## 9. Troubleshooting

- **MongoDB Not Running Locally?** The application includes a persistent file fallback adapter in `backend/data/`. All tasks, users, and actions persist automatically across restarts even if MongoDB daemon is not started.
- **Groq API Key Not Provided?** Task creation remains 100% functional; if no Groq key is present, the app gracefully provides a structured actionable template or utilizes the environment's Gemini fallback.
