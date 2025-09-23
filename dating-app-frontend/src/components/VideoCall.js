import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { useSocket } from '../contexts/SocketContext';

const VideoCall = ({ matchId, partnerId, isInitiator, onConnectionStateChange }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const [isRecording, setIsRecording] = useState(false);
  const [connectionState, setConnectionState] = useState('connecting');
  const cameraRef = useRef(null);

  const { socket } = useSocket();

  useEffect(() => {
    requestCameraPermission();
    if (onConnectionStateChange) {
      onConnectionStateChange(connectionState);
    }
  }, [connectionState]);

  useEffect(() => {
    // Simulate WebRTC connection for demo purposes
    const timer = setTimeout(() => {
      setConnectionState('connected');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'This app needs camera access for video calls.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('Error', 'Failed to request camera permission');
    }
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const startVideoCall = async () => {
    try {
      setIsRecording(true);
      setConnectionState('connected');

      // In a real implementation, this would start WebRTC connection
      // For demo purposes, we'll just show the camera feed

      if (socket) {
        socket.emit('video:call-started', { matchId, partnerId });
      }
    } catch (error) {
      console.error('Error starting video call:', error);
      Alert.alert('Error', 'Failed to start video call');
    }
  };

  const endVideoCall = () => {
    setIsRecording(false);
    setConnectionState('disconnected');

    if (socket) {
      socket.emit('video:call-ended', { matchId, partnerId });
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera access is required for video calls</Text>
          <TouchableOpacity style={styles.retryButton} onPress={requestCameraPermission}>
            <Text style={styles.retryButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main video area - Partner's video would go here */}
      <View style={styles.remoteVideoContainer}>
        <View style={styles.remoteVideoPlaceholder}>
          <Text style={styles.remoteVideoText}>
            {connectionState === 'connecting' ? 'Connecting...' : 'Partner Video'}
          </Text>
          {connectionState === 'connected' && (
            <View style={styles.connectedIndicator}>
              <Text style={styles.connectedText}>🟢 Connected</Text>
            </View>
          )}
        </View>
      </View>

      {/* Local camera preview */}
      <View style={styles.localVideoContainer}>
        <Camera
          ref={cameraRef}
          style={styles.localVideo}
          type={cameraType}
          ratio="16:9"
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
              <Text style={styles.flipButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>

      {/* Connection status indicator */}
      <View style={styles.statusIndicator}>
        <Text style={styles.statusText}>
          {connectionState === 'connecting' && '🟡 Connecting...'}
          {connectionState === 'connected' && '🟢 Connected'}
          {connectionState === 'disconnected' && '🔴 Disconnected'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ff4458',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  remoteVideoContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  remoteVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  remoteVideoText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '500',
  },
  connectedIndicator: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  connectedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  localVideo: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    fontSize: 16,
  },
  statusIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default VideoCall;