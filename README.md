# Rule Management System

A lightweight system for managing security rules by tenant, supporting creation, viewing, deletion, and reordering.

<img width="1512" height="982" alt="Screenshot 2025-07-15 at 16 05 02" src="https://github.com/user-attachments/assets/56462804-3016-4476-a74a-51e12cd6e715" />

## 💻 Frontend

Built with **React** and **MUI**, the UI currently supports:

- Rule table with styling and pagination
- Adding rules with multiple sources and destinations
- Deleting rules
- Drag-and-drop reordering



  **Before reordering:**
  
<img width="1487" height="352" alt="Screenshot 2025-07-15 at 16 04 18" src="https://github.com/user-attachments/assets/8f9c9805-bc3a-4f7f-93b6-82db9c3fd7e1" />


**After reordering (moved "D" between "A" and "B"):**

<img width="1508" height="351" alt="Screenshot 2025-07-15 at 16 04 38" src="https://github.com/user-attachments/assets/446d75fa-7e1a-4aa4-9146-588ab3d0f705" />


## ⚙️ Backend

The backend (Node.js + Express + MongoDB) provides full CRUD functionality and includes:

- Rule pagination by tenant
- Rule creation 
- Rule reordering in **O(1)**
- Centralized error handling

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/mtwig95/rule-management-system-.git
cd rule-management-system-/
```

2. Start the backend
   add .env to server
```
   PORT=3001
   MONGO_URI=mongodb://localhost:27017/rulesdb
```

```
cd server
npm install
npm run dev
```
3. Start the frontend
```
cd client
npm install
npm run dev
```
