# 🚀 Quick Setup Instructions

## ✅ **Fixed Network Connection Issue**

Your IP address has been automatically configured: `172.20.10.2`

## 🔧 **Steps to Run the App:**

### 1. Start Backend
```bash
cd dating-app-backend
npm run dev
```

You should see:
```
Server running on port 5001
Access from devices: http://172.20.10.2:5001
Access locally: http://localhost:5001
Connected to MongoDB
```

### 2. Start Frontend
```bash
cd dating-app-frontend
npx expo start
```

### 3. Test Connection
In the registration screen, tap **"Test Backend Connection"** first to verify everything works.

## 📱 **Using the App:**

1. **Registration** - Fill out the form and register
2. **Profile Setup** - Add photos, location, and conversation helpers:
   - **Ice Breakers**: Answer up to 3 fun questions (e.g., "Cats or dogs?")
   - **Would You Rather**: Choose your preference from 3 dilemma questions
   - **Two Truths and a Lie**: Create up to 2 sets of statements
3. **Video Matching** - Start matching with other users
4. **Profile Display** - View and edit your conversation helpers
5. **All features work** except real WebRTC (uses camera simulation)

## 🔧 **If You Still Get Network Errors:**

### Option 1: Update IP Address (if your IP changed)
Edit these files and change the IP address to your new one:
- `dating-app-frontend/src/services/authService.js`
- `dating-app-frontend/src/services/userService.js`
- `dating-app-frontend/src/services/matchService.js`
- `dating-app-frontend/src/contexts/SocketContext.js`
- `dating-app-frontend/src/utils/apiTest.js`

Change: `http://172.20.10.2:5001` → `http://YOUR_NEW_IP:5001`

### Option 2: Find Your Current IP
```bash
# Windows
ipconfig | findstr IPv4

# Mac/Linux
ifconfig | grep inet
```

### Option 3: Use Emulator Instead
If using Android Studio emulator or iOS Simulator, the localhost URL will work fine.

## 🎯 **Why Specific Ports?**

- **Port 5001**: Backend server (changed from 5000 because it was in use)
- **Expo default**: Frontend runs on port 8081
- **MongoDB**: Uses default port 27017

Each service needs its own port to avoid conflicts. This is standard for development.

## ✅ **Everything Should Work Now!**

The backend is configured to accept connections from your device at `http://172.20.10.2:5001`

Try registration again - it should work! 🎉