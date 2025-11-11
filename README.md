# Realtime Collaboration Board 🎨

A real-time collaborative whiteboard where multiple users can draw simultaneously.  
Full-stack project using completely free services.

---

## 🚀 Features

- Real-time drawing synchronization between multiple users
- Lightweight backend using Socket.io
- Optional persistence via MongoDB Atlas
- Fully free deployment

---

## 🛠️ Technology Stack

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** Node.js + Express + Socket.io
- **Database:** MongoDB Atlas (Free Tier)
- **Deployment:** Vercel (frontend) + Render (backend)

---

**Notes:**

- The `client` and `server` directories are separate to allow independent development and deployment.
- Do **not** commit your real `.env` file containing sensitive information. Use `.env.example` as a template.
- Node modules and build outputs are excluded via `.gitignore`.

---

## 💻 Local Setup

### Prerequisites

Make sure you have installed:

```bash
node -v
npm -v
git -v

1️⃣ Clone the repository
git clone https://github.com/your-username/realtime-board.git
cd realtime-board

2️⃣ Setup Backend
cd server
npm install
cp .env.example .env
# Fill in your MongoDB connection string in .env
node server.mjs


Backend runs on http://localhost:5000

3️⃣ Setup Frontend
cd ../client
npm install
npm run dev


Open http://localhost:5173 in your browser

Open two windows to test real-time drawing

🌐 Deployment

Frontend: Deploy on Vercel

Backend: Deploy on Render

Make sure to update the Socket.io client URL to the deployed backend URL
