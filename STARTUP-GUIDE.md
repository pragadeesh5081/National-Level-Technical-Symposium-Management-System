# Startup Guide - National Level Technical Symposium Management System

## Quick Start Instructions

### Step 1: Open Project Folder
1. Open VS Code
2. Open the folder: `D:\movies\PRAGA\DBMS project`

### Step 2: Start Backend Server
1. Open **Terminal** in VS Code (`Ctrl + `` ` ``)
2. Navigate to backend folder:
   ```bash
   cd backend
   ```
3. Start backend server:
   ```bash
   npm start
   ```
4. **Keep this terminal open** - you should see:
   ```
   Server is running on port 5000
   API available at: http://localhost:5000/api
   Database connected successfully
   ```

### Step 3: Start Frontend Server
1. Open **New Terminal** in VS Code (`Ctrl + Shift + `` ` ``)
2. Navigate to frontend folder:
   ```bash
   cd frontend
   ```
3. Start frontend server:
   ```bash
   npm start
   ```
4. **Keep this terminal open** - you should see:
   ```
   Compiled successfully!
   You can now view symposium-management-frontend in the browser.
   Local: http://localhost:3000
   ```

### Step 4: Access Application
Open your browser and go to: **http://localhost:3000**

---

## One-Click Startup Script

### Option 1: Create a batch file for easy startup

Create a file named `start-project.bat` in the project root:

```batch
@echo off
echo Starting National Level Technical Symposium Management System...
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"

echo.
echo Starting Frontend Server...
cd ../frontend
start "Frontend Server" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Access the application at: http://localhost:3000
pause
```

### Option 2: PowerShell Startup Script

Create a file named `start-project.ps1` in the project root:

```powershell
Write-Host "Starting National Level Technical Symposium Management System..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access the application at: http://localhost:3000" -ForegroundColor Green
Read-Host "Press Enter to exit"
```

---

## Troubleshooting

### If Backend Fails to Start:
1. **Check MySQL is running**: Open "MySQL 8.0 Command Line Client" and test connection
2. **Check .env file**: Ensure password is correct (`praga@123`)
3. **Port conflict**: Kill processes using ports 5000 or 3000:
   ```bash
   netstat -ano | findstr :5000
   taskkill /PID [process_id] /F
   ```

### If Frontend Fails to Start:
1. **Port 3000 in use**: Kill the process
2. **Dependencies missing**: Run `npm install` in frontend folder
3. **Node.js not found**: Ensure Node.js is installed

### Common Commands:
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Check what's using ports
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Install dependencies if needed
cd backend && npm install
cd ../frontend && npm install
```

---

## Project Structure Reminder

```
DBMS project/
|-- backend/          # Node.js server (port 5000)
|   |-- src/
|   |-- package.json
|   |-- .env           # MySQL configuration
|
|-- frontend/         # React app (port 3000)
|   |-- src/
|   |-- package.json
|
|-- database/          # SQL files
|   |-- schema.sql
|   |-- sample_data.sql
|
|-- docs/             # Documentation
```

---

## Quick Access URLs

- **Application**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Documentation**: http://localhost:5000

---

## Database Status

Your MySQL database `symposium_management` is already set up with:
- 8 Participants
- 8 Events  
- 8 Coordinators
- 16 Registrations
- 14 Event Assignments

**No database setup needed - just start the servers!**

---

## Tips

1. **Always start backend first**, then frontend
2. **Keep both terminals open** while working
3. **Use the startup scripts** for convenience
4. **Bookmark** http://localhost:3000 for easy access
5. **Check terminal output** if something doesn't work

---

**Happy Coding! Your Symposium Management System is ready to use!**
