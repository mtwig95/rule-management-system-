# Rule Management System

A lightweight system for managing security rules by tenant, supporting creation, viewing, deletion, and reordering.

## 💻 Frontend

Built with **React** and **MUI**, the UI currently supports:

- Rule table with styling and pagination
- Adding rules with multiple sources and destinations
- Deleting rules
- Drag-and-drop reordering



  **Before reordering:**
![Screenshot 2025-07-15 at 15.56.23.png](../../../../var/folders/zw/1s7k9q196bzbsyf4h3m78xl40000gn/T/TemporaryItems/NSIRD_screencaptureui_uRs2yw/Screenshot%202025-07-15%20at%2015.56.23.png)

**After reordering (moved "D" between "A" and "B"):**
![Screenshot 2025-07-15 at 15.57.09.png](../../../../var/folders/zw/1s7k9q196bzbsyf4h3m78xl40000gn/T/TemporaryItems/NSIRD_screencaptureui_Tcp6cs/Screenshot%202025-07-15%20at%2015.57.09.png)


## ⚙️ Backend

The backend (Node.js + Express + MongoDB) provides full CRUD functionality and includes:

- Rule pagination by tenant
- Rule creation 
- Rule reordering in **O(1)**
- Centralized error handling

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/rule-management-system-.git
cd rule-management-system-/
```

2. Start the backend
```
npm install
npm run dev
```
3. Start the frontend
```
cd client
npm install
npm run dev
```

![Screenshot 2025-07-15 at 15.59.22.png](../../../../var/folders/zw/1s7k9q196bzbsyf4h3m78xl40000gn/T/TemporaryItems/NSIRD_screencaptureui_lOgtja/Screenshot%202025-07-15%20at%2015.59.22.png)