# AlexTech Backend - Deployment Guide

## ⚡ Quick Deploy to Vercel

### Step 1: Prepare Files
Make sure you have these files:
```
backend/
├── server.js
├── package.json
├── vercel.json
└── .env
```

### Step 2: Update .env
Open `.env` file and replace `YOUR_PASSWORD_HERE` with your actual MongoDB password:
```
MONGODB_URI=mongodb+srv://dralextech_db_user:YOUR_ACTUAL_PASSWORD@cluster0.sseg1yv.mongodb.net/alextech?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=AlexTech_Secret_Key_2026_Sherif
PORT=5000
```

### Step 3: Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
npm i -g vercel
vercel login
cd backend
vercel --prod
```

**Option B: Using GitHub**
1. Create a new GitHub repo
2. Upload these files to the repo
3. Go to vercel.com → New Project → Import GitHub repo
4. Deploy!

### Step 4: Add Environment Variables on Vercel
After deploying, go to:
- Project Settings → Environment Variables
- Add:
  - Name: `MONGODB_URI` | Value: (your full URI with password)
  - Name: `JWT_SECRET` | Value: `AlexTech_Secret_Key_2026_Sherif`

### Step 5: Get Your Backend URL
After deployment, Vercel will give you a URL like:
```
https://alextech-backend.vercel.app
```

### Step 6: Update Frontend
Open `alextech-platform.html` and find this line:
```javascript
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://your-backend.vercel.app/api';
```

Replace `'https://your-backend.vercel.app/api'` with your actual URL:
```javascript
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://alextech-backend.vercel.app/api';
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register (Admin) |
| GET | `/api/employees` | Get all employees |
| POST | `/api/employees` | Add employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Add task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/files` | Get all files |
| POST | `/api/files` | Add file |
| DELETE | `/api/files/:id` | Delete file |
| GET | `/api/meetings` | Get all meetings |
| POST | `/api/meetings` | Add meeting |
| DELETE | `/api/meetings/:id` | Delete meeting |
| GET | `/api/export` | Export all data |
| POST | `/api/import` | Import data |
| GET | `/api/health` | Health check |

## 🔐 Default Login
- Username: `admin`
- Password: `admin123`
