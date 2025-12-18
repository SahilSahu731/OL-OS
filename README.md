# 🌟 OL-OS (One Life Operating System)

> **Master your life with the ultimate all-in-one productivity and personal growth platform.**

![Status](https://img.shields.io/badge/Status-In%20Development-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-green?style=for-the-badge)

## 📖 Overview

**OL-OS** is a comprehensive Life Operating System designed to help you organize, track, and optimize every dimension of your life. Whether you're tracking daily habits, managing your finances, planning content, or focusing on long-term goals, OL-OS provides a unified, beautiful, and gamified interface to keep you on track.

Built with meaningful aesthetics and performance in mind, it combines the flexibility of Notion with the structure of a dedicated app.

## ✨ Key Features

### 🎯 Core Productivity
-   **Habit Tracker**: Track daily habits with advanced metrics (Score, Weight, HP) and streak visualization.
-   **Task Management**: Organize tasks with a powerful dashboard, custom views, and Notion-style rich text editing.
-   **Roadmap Planning**: Visualize your life's phases and major milestones on an interactive roadmap.
-   **Focus Mode**: Dedicated tools to eliminate distractions and boost deep work.

### 💰 Life Management
-   **Finance Dashboard**: Comprehensive tracking of income, expenses, and budget analysis.
-   **12-Category System**: Structure your tasks and goals across 12 distinct life dimensions.
-   **Vault**: Secure, organized storage for your essential notes, documents, and resources.
-   **Workout Tracker**: Log workouts and monitor your physical progress.

### 🚀 Creative & Social
-   **Content Management System (CMS)**: Plan, draft, and schedule content for Twitter/X, Instagram, and other platforms.
-   **Content Calendar**: Visualize your posting schedule and manage drafts.

### 🎨 Experience
-   **Gamification**: Earn XP, maintain streaks, and level up your life stats.
-   **Premium UI/UX**: Features glassmorphism, smooth animations (Framer Motion), and a dynamic responsive design.
-   **Themes**: Fully supported Dark and Light modes.

## 🛠️ Tech Stack

OL-OS is built with a modern, type-safe full-stack architecture:

### Frontend
*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Language**: TypeScript
*   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/), Vanilla CSS
*   **State Management**: Zustand
*   **Animations**: Framer Motion
*   **UI Components**: Radix UI, Lucide React
*   **Forms & Validation**: React Hook Form, Zod

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express 5
*   **Database**: MongoDB (with Mongoose)
*   **Language**: TypeScript
*   **Authentication**: JWT, Bcrypt
*   **Scheduler**: Node Cron

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
-   **Node.js** (v18+ recommended)
-   **MongoDB** (Local or Atlas URI)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/SahilSahu731/OL-OS.git
    cd OL-OS
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/ol-os
    JWT_SECRET=your_super_secret_key
    # Add other necessary keys
    ```

3.  **Setup Frontend**
    ```bash
    cd ../frontend
    npm install
    ```
    Create a `.env.local` file in the `frontend` directory:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:5000/api
    ```

### Running the App

1.  **Start the Backend Server**
    ```bash
    cd backend
    npm run dev
    ```

2.  **Start the Frontend Development Server**
    ```bash
    cd frontend
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
OL-OS/
├── backend/                # Express & Node.js Backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── ...
│   └── ...
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/            # App Router pages & layouts
│   │   ├── components/     # Reusable UI components
│   │   ├── stores/         # Zustand state stores
│   │   └── ...
│   └── ...
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the ISC License.
