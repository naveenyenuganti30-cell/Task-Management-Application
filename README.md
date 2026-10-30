# TaskFlow — Modern Full-Stack Task & Workflow Management Application

TaskFlow is a production-ready, full-stack task management application engineered for speed, intuitive workflow organization, and team productivity.

---

## 🌟 Core Features

- **Interactive Kanban Boards**: Drag-and-drop tasks across *To Do*, *In Progress*, and *Completed* columns with real-time status transitions.
- **Card Grid & List Views**: Easily toggle between Kanban columns and card grid views based on your workflow preference.
- **Productivity & KPI Analytics**: Real-time metrics tracking Total Tasks, In Progress, Completed, Overdue tasks, and an overall completion rate meter.
- **Smart Deadlines & Priority Routing**: Automatic calculation of overdue tasks, today's focus, and 7-day upcoming deadlines with tailored visual alert tags (High, Medium, Low).
- **Celebration Confetti**: Rewarding micro-interactions powered by confetti animations whenever you finish a task.
- **Comprehensive Filtering & Sorting**: Instant debounced search, filtering by status, priority, category tags, and due dates, with ascending/descending sorting.
- **Recent Activity Audit Trail**: Automatic logging of task creation, status updates, and deletions for accountability.
- **Customizable Themes**: Seamless Dark Mode, Light Mode, and System Theme preferences with smooth glassmorphism styling.
- **1-Click Test Drive (Demo Account)**: Instant login button to test drive all features without having to type credentials.
- **Zero-Config Database**: Seamless fallback to an in-memory MongoDB server for instant out-of-the-box local development, or configure your own MongoDB Atlas URI in `server/.env`.

---

## 🏗️ Tech Stack

### Frontend (`/client`)
- **React 19** + **Vite 8**
- **Tailwind CSS v4** + Modern Glassmorphism
- **Lucide Icons**
- **Canvas Confetti**
- **Axios** with JWT Request & Response Interceptors

### Backend (`/server`)
- **Node.js** + **Express** (ES Modules)
- **MongoDB** & **Mongoose 8** (with `mongodb-memory-server` dev fallback)
- **JWT Authentication** + **Bcrypt** Password Hashing
- **Helmet**, **CORS**, and **Express-Rate-Limit**
- **Express-Validator** for robust request validation

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```
> The server will start on `http://localhost:5000`. If `MONGODB_URI` is not set in `server/.env`, it will automatically launch an in-memory MongoDB instance for immediate use.

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
> The frontend will launch at `http://localhost:5173`. In development, Vite automatically proxies API requests (`/api`) to the backend at port 5000.

---

## 🔑 Demo Account
On the login screen, click **"1-Click Test Drive (Demo Account)"** to immediately log in as `alex.dev@taskflow.demo` with preloaded workflows!
