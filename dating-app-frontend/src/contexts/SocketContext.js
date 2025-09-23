import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = 'http://172.20.10.2:5001';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(180);

  useEffect(() => {
    if (user && token) {
      initializeSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user, token]);

  const initializeSocket = () => {

    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      timeout: 20000,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current.emit('user:online', user._id);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('match:started', ({ matchId }) => {
      setCurrentMatch(prev => ({ ...prev, status: 'active', matchId }));
    });

    socketRef.current.on('match:timeout', ({ matchId }) => {
      setCurrentMatch(prev => ({ ...prev, status: 'timeout' }));
    });

    socketRef.current.on('match:extended', ({ matchId }) => {
      setCurrentMatch(prev => ({ ...prev, status: 'extended' }));
    });

    socketRef.current.on('match:ended', ({ matchId, mutual, user1Decision, user2Decision }) => {
      setCurrentMatch(prev => ({
        ...prev,
        status: 'ended',
        mutual,
        user1Decision,
        user2Decision
      }));
    });

    socketRef.current.on('match:skipped', ({ matchId, skippedBy }) => {
      setCurrentMatch(prev => ({ ...prev, status: 'skipped', skippedBy }));
    });

    socketRef.current.on('timer:update', ({ remaining, elapsed }) => {
      setTimeRemaining(remaining);
    });

    socketRef.current.on('helper:received', (helper) => {
      setCurrentMatch(prev => ({
        ...prev,
        currentHelper: helper
      }));
    });

    // Video call events for demo purposes
    socketRef.current.on('video:call-started', ({ matchId, from }) => {
      console.log('Video call started:', matchId, from);
    });

    socketRef.current.on('video:call-ended', ({ matchId, from }) => {
      console.log('Video call ended:', matchId, from);
    });
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  const joinMatch = (matchId) => {
    if (socketRef.current && user) {
      socketRef.current.emit('match:join', { matchId, userId: user._id });
      setCurrentMatch({ matchId, status: 'pending' });
    }
  };

  const leaveMatch = (matchId) => {
    if (socketRef.current) {
      socketRef.current.emit('match:leave', { matchId });
      setCurrentMatch(null);
      setTimeRemaining(180);
    }
  };

  const makeDecision = (matchId, decision) => {
    if (socketRef.current && user) {
      socketRef.current.emit('match:decision', {
        matchId,
        decision,
        userId: user._id
      });
    }
  };

  const skipMatch = (matchId) => {
    if (socketRef.current && user) {
      socketRef.current.emit('match:skip', {
        matchId,
        userId: user._id
      });
    }
  };

  const requestHelper = (type, matchId) => {
    if (socketRef.current) {
      socketRef.current.emit('helper:request', { type, matchId });
    }
  };

  const startVideoCall = (matchId, partnerId) => {
    if (socketRef.current) {
      socketRef.current.emit('video:call-started', { matchId, partnerId });
    }
  };

  const endVideoCall = (matchId, partnerId) => {
    if (socketRef.current) {
      socketRef.current.emit('video:call-ended', { matchId, partnerId });
    }
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    currentMatch,
    timeRemaining,
    joinMatch,
    leaveMatch,
    makeDecision,
    skipMatch,
    requestHelper,
    startVideoCall,
    endVideoCall,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};