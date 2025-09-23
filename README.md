# Real-Time Video Dating Platform MVP

A complete real-time video dating platform built with React Native (Expo) frontend and Node.js backend with WebRTC video chat, Socket.io for real-time communication, and gamified matching features.

## Features

### 🔐 Authentication
- Email/password registration and login
- Google OAuth2 integration (ready for implementation)
- JWT-based authentication
- Profile creation and editing

### 👤 User Profiles
- Basic info: display name, age, bio (140 chars), location, gender
- Photo uploads (up to 3 photos)
- Conversation helpers: ice breakers, "Would You Rather" questions, "Two Truths and a Lie"
- Location-based matching with geolocation

### 💬 Video Matching
- **3-minute trial period** with countdown timer
- **Mutual consent system** - both users must click "Yes" to continue
- Camera-based video interface with picture-in-picture (Expo Go compatible)
- Semi-transparent bio overlay during video calls
- Skip functionality available at any time
- Real-time connection simulation (WebRTC ready for development builds)

### 🎮 Conversation Helpers
- Ice breaker questions (appear every 30 seconds)
- "Would You Rather" game
- "Two Truths and a Lie" option
- Topic spinner with random conversation topics
- Optional overlays that users can dismiss

### 🎯 Matching Algorithm
- Location-based filtering (within X miles)
- Age and gender preference matching
- 24-hour cooldown to prevent re-matching
- Queue system for available users
- Block and report functionality

## Tech Stack

### Frontend (React Native + Expo)
- React Native with Expo
- React Navigation (Stack & Tab navigators)
- Socket.io client for real-time communication
- Expo Camera for video interface (Expo Go compatible)
- Expo Location, Camera, and ImagePicker
- AsyncStorage for local data persistence

### Backend (Node.js)
- Express.js server
- Socket.io for real-time features
- MongoDB with Mongoose ODM
- JWT authentication
- WebRTC signaling server
- Bcrypt password hashing
- Rate limiting and security middleware

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Expo CLI
- Android Studio/Xcode for mobile development

### Backend Setup

1. Navigate to backend directory:
```bash
cd dating-app-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dating-app
JWT_SECRET=your-very-secure-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NODE_ENV=development
```

4. Start MongoDB (if using local installation)

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd dating-app-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the Expo development server:
```bash
npx expo start
```

4. Use Expo Go app on your phone or an emulator to run the app

### Quick Start (Both Services)

**Windows:**
```bash
start-dev.bat
```

**Mac/Linux:**
```bash
./start-dev.sh
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/photos` - Upload photos
- `DELETE /api/users/photos/:photoId` - Delete photo
- `PUT /api/users/location` - Update location
- `PUT /api/users/preferences` - Update matching preferences
- `POST /api/users/block/:userId` - Block user
- `POST /api/users/report/:userId` - Report user

### Matching
- `POST /api/match/find` - Find a new match
- `PUT /api/match/decision/:matchId` - Make yes/no decision
- `POST /api/match/skip/:matchId` - Skip current match
- `GET /api/match/active` - Get active match

## Socket.io Events

### Client to Server
- `user:online` - Mark user as online
- `match:join` - Join a match room
- `match:decision` - Send yes/no decision
- `match:skip` - Skip current match
- `helper:request` - Request conversation helper
- `webrtc:offer/answer/ice-candidate` - WebRTC signaling

### Server to Client
- `match:started` - Match has begun
- `match:timeout` - 3-minute timer expired
- `match:extended` - Both users said yes
- `match:ended` - Match ended
- `timer:update` - Timer countdown update
- `helper:received` - Conversation helper received
- `webrtc:*` - WebRTC signaling events

## Project Structure

```
dating-app/
├── dating-app-backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Match.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── match.js
│   ├── middleware/
│   │   └── auth.js
│   ├── socket/
│   │   └── socketHandler.js
│   ├── utils/
│   │   ├── location.js
│   │   └── conversationHelpers.js
│   ├── server.js
│   └── package.json
│
└── dating-app-frontend/
    ├── src/
    │   ├── screens/
    │   │   ├── LoginScreen.js
    │   │   ├── RegisterScreen.js
    │   │   ├── ProfileSetupScreen.js
    │   │   ├── VideoMatchScreen.js
    │   │   ├── ProfileScreen.js
    │   │   └── LoadingScreen.js
    │   ├── components/
    │   │   ├── VideoCall.js
    │   │   └── ConversationHelpers.js
    │   ├── contexts/
    │   │   ├── AuthContext.js
    │   │   └── SocketContext.js
    │   └── services/
    │       ├── authService.js
    │       ├── userService.js
    │       └── matchService.js
    ├── App.js
    └── package.json
```

## Key Features Implementation

### 3-Minute Timer System
- Real-time countdown displayed during video calls
- Automatic timeout handling
- Decision buttons appear when timer expires
- Both users must click "Yes" to continue

### WebRTC Video Chat
- Peer-to-peer video communication
- Picture-in-picture self-view
- Full-screen partner video
- ICE candidate exchange via Socket.io

### Matching Algorithm
- Location-based filtering using geospatial queries
- Age and gender preference matching
- 24-hour cooldown prevents immediate re-matching
- Queue system handles multiple concurrent users

### Real-time Features
- Instant match notifications
- Live timer updates
- Conversation helpers delivered in real-time
- Connection status monitoring

## Development Notes

### WebRTC Configuration
- STUN servers configured for NAT traversal
- Signaling handled via Socket.io
- Camera/microphone permissions required

### Security Features
- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- Helmet.js security middleware

### Mobile Considerations
- Responsive design for various screen sizes
- Camera/microphone permission handling
- Background/foreground state management
- Network connectivity handling

## Troubleshooting

### Registration Issues

If registration fails with "Registration failed" error:

1. **Check Backend Status**:
   - Ensure backend is running: `cd dating-app-backend && npm run dev`
   - Backend should show: "Server running on port 5001" and "Connected to MongoDB"

2. **Check MongoDB**:
   - Ensure MongoDB is installed and running
   - Default connection: `mongodb://localhost:27017/dating-app`

3. **Test Backend Connection**:
   - In the registration screen, tap "Test Backend Connection" button
   - This will show if the frontend can reach the backend

4. **Check Network**:
   - Frontend uses `http://localhost:5001/api`
   - If using physical device, you may need to use your computer's IP address instead of `localhost`

5. **Common Solutions**:
   ```bash
   # Kill any processes using port 5001
   lsof -ti:5001 | xargs kill -9

   # Restart backend
   cd dating-app-backend
   npm run dev

   # Clear React Native cache
   cd dating-app-frontend
   npx expo start --clear
   ```

### Expo Go Compatibility

- WebRTC video calling requires a development build (not Expo Go)
- Current implementation uses Expo Camera for demonstration
- For full P2P video, create a development build and reinstall `react-native-webrtc`

## Next Steps for Production

1. **Google OAuth Setup**: Configure actual Google OAuth credentials
2. **TURN Servers**: Add TURN servers for better connectivity
3. **Push Notifications**: Implement match notifications
4. **Image Storage**: Use cloud storage (AWS S3, Cloudinary) for photos
5. **Analytics**: Add user behavior tracking
6. **Moderation**: Implement content moderation and safety features
7. **Scaling**: Set up load balancing and database clustering
8. **Testing**: Add comprehensive test coverage

## License

This project is for educational/demonstration purposes. Please ensure you comply with all relevant privacy laws and platform guidelines when deploying.