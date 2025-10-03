import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Alert, Text, TouchableOpacity, Dimensions } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { BlurView } from 'expo-blur';
import { useSocket } from "../contexts/SocketContext";
import { Colors, Typography, Spacing, BorderRadius, Shadows, Components } from '../theme/designSystem';

const { width, height } = Dimensions.get('window');

const VideoCall = ({
  matchId,
  partnerId,
  isInitiator,
  onConnectionStateChange,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState("front");
  const [isRecording, setIsRecording] = useState(false);
  const [connectionState, setConnectionState] = useState("connecting");
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
      setConnectionState("connected");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const requestCameraPermission = async () => {
    try {
      if (!permission) {
        return;
      }

      if (!permission.granted) {
        const newPermission = await requestPermission();
        if (!newPermission.granted) {
          Alert.alert(
            "Camera Permission Required",
            "This app needs camera access for video calls.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      Alert.alert("Error", "Failed to request camera permission");
    }
  };

  const toggleCameraType = () => {
    setCameraType(cameraType === "back" ? "front" : "back");
  };

  const startVideoCall = async () => {
    try {
      setIsRecording(true);
      setConnectionState("connected");

      // In a real implementation, this would start WebRTC connection
      // For demo purposes, we'll just show the camera feed

      if (socket) {
        socket.emit("video:call-started", { matchId, partnerId });
      }
    } catch (error) {
      console.error("Error starting video call:", error);
      Alert.alert("Error", "Failed to start video call");
    }
  };

  const endVideoCall = () => {
    setIsRecording(false);
    setConnectionState("disconnected");

    if (socket) {
      socket.emit("video:call-ended", { matchId, partnerId });
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <Text style={styles.loadingIcon}>📹</Text>
          </View>
          <Text style={styles.loadingText}>Initializing camera...</Text>
          <Text style={styles.loadingSubtext}>Please wait a moment</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionContent}>
            <View style={styles.permissionIcon}>
              <Text style={styles.permissionIconText}>📹</Text>
            </View>
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionText}>
              ConnectLive needs camera access to enable video calls with your matches
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestCameraPermission}
              activeOpacity={0.8}
            >
              <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
              <Text style={styles.permissionButtonIcon}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main video area - Partner's video */}
      <View style={styles.remoteVideoContainer}>
        {connectionState === "connecting" ? (
          <View style={styles.connectingContainer}>
            <View style={styles.connectingAnimation}>
              <View style={styles.pulseRing} />
              <View style={styles.connectingIcon}>
                <Text style={styles.connectingIconText}>💖</Text>
              </View>
            </View>
            <Text style={styles.connectingTitle}>Connecting...</Text>
            <Text style={styles.connectingSubtext}>Establishing video connection</Text>
          </View>
        ) : (
          <View style={styles.partnerVideoPlaceholder}>
            <View style={styles.partnerVideoIcon}>
              <Text style={styles.partnerVideoIconText}>👤</Text>
            </View>
            <Text style={styles.partnerVideoText}>Partner's Video</Text>
            <Text style={styles.partnerVideoSubtext}>Video feed will appear here</Text>
          </View>
        )}
      </View>

      {/* Enhanced local camera preview */}
      <View style={styles.localVideoContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.localVideo}
          facing={cameraType}
          ratio="16:9"
        >
          {/* Camera controls overlay */}
          <View style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={toggleCameraType}
              activeOpacity={0.8}
            >
              <BlurView intensity={80} style={styles.flipButtonBlur}>
                <Text style={styles.flipButtonIcon}>🔄</Text>
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Camera quality indicator */}
          <View style={styles.qualityIndicator}>
            <BlurView intensity={60} style={styles.qualityBadge}>
              <Text style={styles.qualityText}>HD</Text>
            </BlurView>
          </View>
        </CameraView>

        {/* Local video border glow */}
        <View style={styles.localVideoBorder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[900],
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.lg,
  },
  loadingIcon: {
    fontSize: Typography.fontSize['2xl'],
  },
  loadingText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[50],
    marginBottom: Spacing.sm,
  },
  loadingSubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[300],
    textAlign: 'center',
  },

  // Permission State
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  permissionContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.lg,
  },
  permissionIconText: {
    fontSize: Typography.fontSize['3xl'],
  },
  permissionTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
    marginBottom: Spacing.base,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[300],
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
    marginBottom: Spacing['2xl'],
  },
  permissionButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  permissionButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[50],
  },
  permissionButtonIcon: {
    fontSize: Typography.fontSize.base,
  },
  // Remote Video Styles
  remoteVideoContainer: {
    flex: 1,
    backgroundColor: Colors.neutral[800],
    position: 'relative',
  },
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  connectingAnimation: {
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary.main,
    opacity: 0.3,
    top: -10,
    left: -10,
  },
  connectingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  connectingIconText: {
    fontSize: Typography.fontSize['2xl'],
  },
  connectingTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
    marginBottom: Spacing.sm,
  },
  connectingSubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[300],
    textAlign: 'center',
  },
  partnerVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  partnerVideoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.neutral[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  partnerVideoIconText: {
    fontSize: Typography.fontSize['2xl'],
    color: Colors.neutral[400],
  },
  partnerVideoText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[300],
    marginBottom: Spacing.sm,
  },
  partnerVideoSubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[400],
    textAlign: 'center',
  },
  // Local Video Styles
  localVideoContainer: {
    position: 'absolute',
    top: Spacing['6xl'] + Spacing.base, // Extra margin for iPhone safe area
    right: Spacing.lg,
    width: 120, // Slightly smaller for better fit
    height: 160, // Adjusted height proportionally
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    zIndex: 5,
    elevation: 5,
  },
  localVideo: {
    flex: 1,
  },
  localVideoBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: BorderRadius.lg + 2,
    borderWidth: 2,
    borderColor: Colors.primary.main,
    ...Shadows.lg,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
  },
  flipButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  flipButtonBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonIcon: {
    fontSize: Typography.fontSize.base,
  },
  qualityIndicator: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
  },
  qualityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  qualityText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
  },
});

export default VideoCall;
