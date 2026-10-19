# Notie Study & Notes Application 📚

Notie is a professional, feature-rich MERN stack study and research workspace designed for students and researchers. It features split-screen document viewing (PDFs, PPTs, handwritten notes), digital note-taking, AI-powered study assistance, a Pomodoro timer, DSA progress tracker, exam prep, and multi-tenant database persistence.

---

## 🚀 Key Features

- **Split-Screen Workspace**: Open up to 4 synchronized panes simultaneously to view PDF materials, PPT slides, handwritten notes, and digital notes side-by-side.
- **Indexed Chapters & Subtopics**: Organize subjects with serial numbered chapters and fractional subtopics (`1.1`, `1.2`, etc.).
- **Files & Folders Hierarchy**: Browse and upload materials organized into folders per topic.
- **Digital Notes & Rich Text**: Create and auto-save comprehensive notes for every topic.
- **AI Study Assistant**: Get instant study advice, summaries, and analytics insights.
- **Pomodoro Timer & Planner**: Maintain productivity and track your study schedule.
- **Dark Mode Support**: Seamless theme toggling with custom dark color palettes (`#280B0F`).

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, Lucide Icons, TanStack React Query.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Authentication, bcrypt.
- **AI Service**: Python Flask, Google Gemini AI microservice.

---

## ⚙️ Getting Started & Database Management

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB (Running locally or via MongoDB Atlas connection string)

### 2. Backend Setup
```bash
cd backend/node-backend
npm install
```
Create a `.env` file in `backend/node-backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/notie_db
JWT_SECRET=your_secure_jwt_secret
PYTHON_AI_URL=http://localhost:5001
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Database Management
- **MongoDB Compass / mongosh**: Connect to your `notie_db` database instance to manage collections (`users`, `subjects`, `topics`, `materials`, `folders`, `digitalnotes`) securely.

---

## 📄 License & Attribution

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude Code <noreply@anthropic.com>
