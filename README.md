# 🛡️ Rule Management System

A lightweight, full-stack system for managing access policies between network segments, per tenant.
Supports creating, editing, deleting, and reordering rules through a user-friendly interface and efficient backend.

---

## 🖼️ Preview

<img width="1022" alt="Main UI" src="https://github.com/user-attachments/assets/1db51e8b-6090-48b4-9f5f-d0c5ebe8c425" />

---

## ✨ Features

### 🖥️ Frontend (React + MUI)

- Rule table with pagination, sorting, and drag-and-drop reordering
- Add new rules with multi-source & multi-destination support
- Inline editing with “save all” bulk update
- Delete rule with confirmation
- Visual indicators for rule state and index

### 🛠️ Backend (Node.js + Express + MongoDB)

- CRUD API for tenant-specific rule management
- Efficient reordering with `beforeId` / `afterId` logic (O(1))
- Bulk update endpoint for editing multiple rules at once
- Centralized error handling
- Clean, modular controller/service structure

---

## ⚙️ Tech Stack

| Layer    | Tech                               |
| -------- | ---------------------------------- |
| Frontend | React, TypeScript, MUI, DnD Kit    |
| Backend  | Node.js, Express, TypeScript       |
| Database | MongoDB + Mongoose                 |
| Styling  | MUI, CSS-in-JS                     |
| Testing  | Jest, Supertest, MongoMemoryServer |

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/mtwig95/rule-management-system-.git
cd rule-management-system-/
```

### 2. Start the backend

Create a `.env` file in `/server`:

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/rulesdb
```

Then run:

```bash
cd server
npm install
npm run dev
```

### 3. Start the frontend

```bash
cd client
npm install
npm start
```

---

## 👤 Author

Built by [Maytal Slonim Twig](https://github.com/mtwig95) 💙

---

## 👤 Demo

https://github.com/user-attachments/assets/d7edd13b-94d5-48d4-a3cf-ecd2556a5f86


reorder:

https://github.com/user-attachments/assets/c3ca2d00-6c65-4afc-a02e-e842975da2c8


