# Deployment Guide - Symposium Management System

## 🚀 Quick Deployment with Render (Free Tier)

This guide will help you deploy your project to Render.com in 15 minutes.

---

## 📋 Prerequisites

1. **GitHub Account** - Push your code to GitHub
2. **Render Account** - Sign up at https://render.com (free)
3. **MySQL Database** - We'll use Render's MySQL service

---

## Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
cd "d:/movies/PRAGA/DBMS project"
git init
git add .
git commit -m "Initial commit - Symposium Management System"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/DBMS-project.git
git push -u origin main
```

---

## Step 2: Deploy Database on Render

1. Go to https://dashboard.render.com
2. Click **New** → **PostgreSQL** (or MySQL if available)
3. Name: `symposium-db`
4. Database: `symposium_management`
5. Click **Create Database**
6. Wait for database to be ready (2-3 minutes)
7. Click on your database → **Connect** → **External Connection**
8. Copy the connection details (Host, Port, User, Password)

---

## Step 3: Deploy Backend on Render

1. Go to https://dashboard.render.com
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:

   **Name:** `symposium-backend`
   
   **Environment:** Node
   
   **Root Directory:** `backend`
   
   **Build Command:** `npm install`
   
   **Start Command:** `npm start`

5. Click **Advanced** → **Environment Variables**:
   ```
   DB_HOST = your-database-host.com
   DB_USER = your-database-user
   DB_PASSWORD = your-database-password
   DB_NAME = symposium_management
   DB_PORT = 3306
   PORT = 5000
   ```

6. Click **Deploy Web Service**
7. Wait for deployment (3-5 minutes)
8. Copy your backend URL (e.g., https://symposium-backend.onrender.com)

---

## Step 4: Import Database Schema

1. Go to your database in Render
2. Click **Connect** → **Internal Connection** or use external tools
3. Run the schema file:
   ```sql
   -- Copy contents of database/schema-fixed.sql
   -- Paste and execute in Render's database interface
   ```

---

## Step 5: Update Frontend API URL

Edit `frontend/src/services/apiService.js`:

```javascript
const api = axios.create({
  baseURL: 'https://symposium-backend.onrender.com/api', // Change this
  timeout: 10000
});
```

Commit and push this change:
```bash
git add frontend/src/services/apiService.js
git commit -m "Update API URL for production"
git push
```

---

## Step 6: Deploy Frontend on Render

1. Go to https://dashboard.render.com
2. Click **New** → **Static Site**
3. Connect your GitHub repository
4. Configure:

   **Name:** `symposium-frontend`
   
   **Root Directory:** `frontend`
   
   **Build Command:** `npm install && npm run build`
   
   **Publish Directory:** `build`

5. Click **Deploy Static Site**
6. Wait for deployment (2-3 minutes)

---

## Step 7: Update Backend CORS

Edit `backend/src/server.js`:

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://symposium-frontend.onrender.com']
}));
```

Commit and push:
```bash
git add backend/src/server.js
git commit -m "Update CORS for production"
git push
```

---

## ✅ Your App is Live!

**Frontend URL:** https://symposium-frontend.onrender.com
**Backend URL:** https://symposium-backend.onrender.com/api

---

## 📊 Monitor Your Deployment

- **Dashboard:** https://dashboard.render.com
- **Logs:** Click on each service to view logs
- **Database:** Monitor database usage and connections

---

## 🔧 Troubleshooting

**Backend fails to start:**
- Check environment variables match database credentials
- Verify database is accessible from backend
- Check logs in Render dashboard

**Frontend can't connect to backend:**
- Verify backend URL is correct in apiService.js
- Check CORS settings in backend
- Ensure backend is running

**Database connection errors:**
- Verify database credentials
- Check database is running
- Ensure firewall allows connections

---

## 💰 Free Tier Limits (Render)

- **Web Services:** 750 hours/month free
- **Databases:** 90 days free trial for PostgreSQL
- **Bandwidth:** 100GB/month free

After free tier, approximate costs:
- Backend: $7/month
- Frontend: Free (static)
- Database: $7/month

---

## 🚀 Next Steps

1. Test your deployed application
2. Set up custom domain (optional)
3. Configure SSL certificates (automatic on Render)
4. Set up monitoring and alerts

---

## 📞 Support

- Render Documentation: https://render.com/docs
- Community: https://community.render.com
- Your deployed app logs available in Render dashboard
