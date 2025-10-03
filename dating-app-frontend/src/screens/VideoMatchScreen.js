import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { matchService } from "../services/matchService";
import VideoCall from "../components/VideoCall";
import ConversationHelpers from "../components/ConversationHelpers";
import FullProfileModal from "../components/FullProfileModal";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Components,
} from "../theme/designSystem";

const { width, height } = Dimensions.get("window");

const VideoMatchScreen = () => {
  const { user } = useAuth();
  const {
    currentMatch,
    timeRemaining,
    joinMatch,
    leaveMatch,
    makeDecision,
    skipMatch,
    requestHelper,
  } = useSocket();

  const [matchState, setMatchState] = useState("idle"); // idle, finding, matched, ended
  const [currentPartner, setCurrentPartner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHelpers, setShowHelpers] = useState(false);
  const [showDecisionButtons, setShowDecisionButtons] = useState(false);
  const [userDecision, setUserDecision] = useState(null);
  const [localCurrentHelper, setLocalCurrentHelper] = useState(null);
  const [showFullProfile, setShowFullProfile] = useState(false);

  // Debug logging for modal states
  useEffect(() => {
    console.log("🔒 showHelpers changed to:", showHelpers);
  }, [showHelpers]);

  useEffect(() => {
    console.log("👤 showFullProfile changed to:", showFullProfile);
  }, [showFullProfile]);

  useEffect(() => {
    console.log("🎯 localCurrentHelper changed:", localCurrentHelper);
  }, [localCurrentHelper]);

  useEffect(() => {
    if (currentMatch) {
      if (
        currentMatch.status === "pending" ||
        currentMatch.status === "active"
      ) {
        setMatchState("matched");
        setShowDecisionButtons(false);
      } else if (currentMatch.status === "timeout") {
        setShowDecisionButtons(true);
      } else if (currentMatch.status === "extended") {
        setMatchState("extended");
        setShowDecisionButtons(false);
      } else if (
        currentMatch.status === "ended" ||
        currentMatch.status === "skipped"
      ) {
        handleMatchEnded();
      }
    }
    // Update local helper state when currentMatch.currentHelper changes
    setLocalCurrentHelper(currentMatch?.currentHelper || null);
  }, [currentMatch]);

  useEffect(() => {
    if (timeRemaining <= 0 && matchState === "matched") {
      setShowDecisionButtons(true);
    }
  }, [timeRemaining, matchState]);

  const handleStartMatching = async () => {
    if (!user?.location?.city) {
      Alert.alert(
        "Location Required",
        "Please set your location in your profile to start matching.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      setLoading(true);
      setMatchState("finding");

      const response = await matchService.findMatch();

      if (response.match) {
        setCurrentPartner(response.match);
        console.log("🔗 Joining match with ID:", response.match.matchId);
        joinMatch(response.match.matchId);
      } else {
        Alert.alert(
          "No Matches",
          response.message || "No matches available right now. Try again later."
        );
        setMatchState("idle");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
      setMatchState("idle");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    console.log("Skip button pressed, currentMatch:", currentMatch);
    if (currentMatch?.matchId) {
      console.log("Calling skipMatch with matchId:", currentMatch.matchId);
      skipMatch(currentMatch.matchId);

      // Immediately find a new match
      try {
        setLoading(true);
        setMatchState("finding");

        const response = await matchService.findMatch();

        if (response.match) {
          setCurrentPartner(response.match);
          console.log("🔗 Joining new match with ID:", response.match.matchId);
          joinMatch(response.match.matchId);
        } else {
          Alert.alert(
            "No Matches",
            response.message ||
              "No matches available right now. Try again later."
          );
          setMatchState("idle");
        }
      } catch (error) {
        Alert.alert("Error", error.message);
        setMatchState("idle");
      } finally {
        setLoading(false);
      }
    } else {
      console.log("No matchId available, cannot skip");
    }
  };

  const handleEndCall = () => {
    if (currentMatch?.matchId) {
      leaveMatch(currentMatch.matchId);
    }
    setMatchState("idle");
    setCurrentPartner(null);
    setShowDecisionButtons(false);
    setUserDecision(null);
  };

  const handleDecision = (decision) => {
    setUserDecision(decision);
    setShowDecisionButtons(false); // Hide decision buttons after choice
    if (currentMatch?.matchId) {
      makeDecision(currentMatch.matchId, decision);
    }
  };

  const handleMatchEnded = () => {
    if (currentMatch?.matchId) {
      leaveMatch(currentMatch.matchId);
    }
    setMatchState("idle");
    setCurrentPartner(null);
    setShowDecisionButtons(false);
    setUserDecision(null);
  };

  const handleRequestHelper = (type) => {
    if (currentMatch?.matchId) {
      requestHelper(type, currentMatch.matchId);
      // Close the helpers modal after requesting
      setShowHelpers(false);
      // Ensure full profile modal is also closed
      setShowFullProfile(false);
    }
  };

  const handleDismissHelper = () => {
    // Clear the local helper state and close the modal
    setLocalCurrentHelper(null);
    setShowHelpers(false);
    // Ensure no modal conflicts
    setShowFullProfile(false);
  };

  const handleAnotherTopic = (type) => {
    console.log(
      "🔄 VideoMatchScreen.handleAnotherTopic called with type:",
      type
    );
    console.log("📞 currentMatch.matchId:", currentMatch?.matchId);
    console.log("🔒 showHelpers before:", showHelpers);
    console.log("👤 showFullProfile before:", showFullProfile);

    // Request another helper of the same type and close the modal
    if (currentMatch?.matchId) {
      console.log("✅ Requesting new helper from server");
      try {
        requestHelper(type, currentMatch.matchId);
        console.log("📞 requestHelper called successfully");

        console.log("📕 Setting showHelpers to false");
        setShowHelpers(false);

        console.log("👤 Setting showFullProfile to false");
        setShowFullProfile(false);

        // Failsafe: If no helper is received within 5 seconds, assume we're out of content
        setTimeout(() => {
          console.log("⏰ Failsafe timeout: No helper received in 5 seconds");
          console.log(
            "🚨 Possibly out of topics - ensuring modal stays closed"
          );
          setShowHelpers(false);
          setShowFullProfile(false);
        }, 5000);

        console.log("✅ handleAnotherTopic completed successfully");
      } catch (error) {
        console.error("❌ Error in handleAnotherTopic:", error);
      }
    } else {
      console.log("❌ No matchId available, cannot request helper");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderOverlay = () => {
    return (
      <View style={styles.overlay}>
        {/* Modern Timer */}
        {(matchState === "matched" || matchState === "extended") && (
          <BlurView intensity={80} style={styles.timerContainer}>
            <View style={styles.timerContent}>
              <Text style={styles.timerLabel}>Time</Text>
              <Text style={styles.timerText}>
                {matchState === "extended" ? "∞" : formatTime(timeRemaining)}
              </Text>
            </View>
          </BlurView>
        )}

        {/* End Call Button */}
        {(matchState === "matched" || matchState === "extended") && (
          <TouchableOpacity
            style={styles.endCallButton}
            onPress={handleEndCall}
            activeOpacity={0.8}
          >
            <BlurView intensity={80} style={styles.endCallButtonBlur}>
              <Text style={styles.endCallButtonText}>×</Text>
            </BlurView>
          </TouchableOpacity>
        )}

        {/* Modern Partner Bio Card */}
        {currentPartner &&
          (matchState === "matched" || matchState === "extended") && (
            <TouchableOpacity
              style={styles.bioOverlay}
              onPress={() => setShowFullProfile(true)}
              activeOpacity={0.9}
            >
              <BlurView intensity={90} style={styles.bioCard}>
                <View style={styles.bioHeader}>
                  <View>
                    <Text style={styles.partnerName}>
                      {currentPartner.displayName}, {currentPartner.age}
                    </Text>
                    {currentPartner.location?.city && (
                      <Text style={styles.partnerLocation}>
                        📍 {currentPartner.location.city}
                      </Text>
                    )}
                  </View>
                  <View style={styles.profileIndicator}>
                    <Text style={styles.profileIndicatorText}>👤</Text>
                  </View>
                </View>
                {currentPartner.bio && (
                  <Text
                    style={styles.partnerBio}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {currentPartner.bio}
                  </Text>
                )}
                <View style={styles.tapHint}>
                  <Text style={styles.tapHintText}>
                    Tap to view full profile
                  </Text>
                </View>
              </BlurView>
            </TouchableOpacity>
          )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* Modern Helper and Skip Buttons in Same Row */}
          {(matchState === "matched" || matchState === "extended") &&
            !showDecisionButtons && (
              <View style={styles.topButtonsRow}>
                <TouchableOpacity
                  style={styles.helperButton}
                  onPress={() => setShowHelpers(true)}
                  activeOpacity={0.8}
                >
                  <BlurView intensity={80} style={styles.helperButtonContent}>
                    <Text style={styles.helperButtonIcon}>💡</Text>
                    <Text style={styles.helperButtonText}>Ideas</Text>
                  </BlurView>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                  activeOpacity={0.8}
                >
                  <BlurView intensity={60} style={styles.skipButtonContent}>
                    <Text style={styles.skipButtonIcon}>⏭️</Text>
                    <Text style={styles.skipButtonText}>Skip</Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            )}

          {/* Modern Decision Buttons */}
          {showDecisionButtons && (
            <View style={styles.decisionButtons}>
              <TouchableOpacity
                style={styles.passButton}
                onPress={() => handleDecision("no")}
                activeOpacity={0.8}
              >
                <BlurView intensity={80} style={styles.decisionButtonContent}>
                  <Text style={styles.decisionButtonIcon}>👎</Text>
                  <Text style={styles.decisionButtonText}>Pass</Text>
                </BlurView>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => handleDecision("yes")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={Colors.primary.gradient}
                  style={styles.decisionButtonContent}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.decisionButtonIcon}>💖</Text>
                  <Text
                    style={[
                      styles.decisionButtonText,
                      styles.continueButtonText,
                    ]}
                  >
                    Continue
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Modern Helper Display */}
        {localCurrentHelper && (
          <View
            style={styles.currentHelperOverlay}
            pointerEvents={showHelpers || showFullProfile ? "none" : "auto"}
          >
            <BlurView intensity={95} style={styles.helperCard}>
              <Text style={styles.helperTypeIcon}>
                {localCurrentHelper.type === "icebreaker" && "💡"}
                {localCurrentHelper.type === "topic" && "🎯"}
                {localCurrentHelper.type === "wouldyourather" && "🤔"}
              </Text>

              <Text style={styles.currentHelperText}>
                {localCurrentHelper.type === "icebreaker" &&
                  localCurrentHelper.content}
                {localCurrentHelper.type === "topic" &&
                  `Talk about: ${localCurrentHelper.content}`}
                {localCurrentHelper.type === "wouldyourather" &&
                  `${localCurrentHelper.content.option1} OR ${localCurrentHelper.content.option2}`}
              </Text>

              <TouchableOpacity
                style={styles.dismissHelperButton}
                onPress={() => setLocalCurrentHelper(null)}
              >
                <Text style={styles.dismissHelperButtonText}>×</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        )}
      </View>
    );
  };

  const renderContent = () => {
    switch (matchState) {
      case "idle":
        return (
          <View style={styles.idleContainer}>
            <View style={styles.heroSection}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoIcon}>💕</Text>
                <Text style={styles.brandName}>ConnectLive</Text>
              </View>

              <Text style={styles.idleTitle}>Ready to spark a connection?</Text>
              <Text style={styles.idleSubtitle}>
                Meet amazing people in your area through live video
                conversations
              </Text>
            </View>

            <View style={styles.ctaSection}>
              <TouchableOpacity
                style={[
                  styles.startButton,
                  loading && styles.startButtonDisabled,
                ]}
                onPress={handleStartMatching}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={Colors.primary.gradient}
                  style={styles.startButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.startButtonText}>
                    {loading ? "Finding Your Match..." : "Start Matching"}
                  </Text>
                  <Text style={styles.startButtonIcon}>✨</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🎥</Text>
                  <Text style={styles.featureText}>Live Video Chat</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>⚡</Text>
                  <Text style={styles.featureText}>Instant Matching</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🛡️</Text>
                  <Text style={styles.featureText}>Safe & Secure</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case "finding":
        return (
          <View style={styles.findingContainer}>
            <View style={styles.loadingAnimation}>
              <View style={styles.pulseCircle}>
                <View style={styles.innerCircle}>
                  <Text style={styles.loadingIcon}>💖</Text>
                </View>
              </View>
            </View>

            <Text style={styles.findingTitle}>Finding Your Perfect Match</Text>
            <Text style={styles.findingSubtitle}>
              Connecting you with someone amazing nearby...
            </Text>

            <View style={styles.loadingSteps}>
              <View style={styles.step}>
                <View style={styles.stepIndicator} />
                <Text style={styles.stepText}>Analyzing preferences</Text>
              </View>
              <View style={styles.step}>
                <View style={[styles.stepIndicator, styles.stepActive]} />
                <Text style={styles.stepText}>Finding compatible people</Text>
              </View>
              <View style={styles.step}>
                <View style={styles.stepIndicator} />
                <Text style={styles.stepText}>Preparing connection</Text>
              </View>
            </View>
          </View>
        );

      case "matched":
      case "extended":
        return (
          <>
            <VideoCall
              matchId={currentMatch?.matchId}
              partnerId={currentPartner?._id}
              isInitiator={true}
            />
            {renderOverlay()}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />

      {renderContent()}

      <ConversationHelpers
        visible={showHelpers}
        onClose={() => setShowHelpers(false)}
        onRequestHelper={handleRequestHelper}
        onDismissHelper={handleDismissHelper}
        onAnotherTopic={handleAnotherTopic}
        currentHelper={localCurrentHelper}
      />

      <FullProfileModal
        visible={showFullProfile}
        partner={currentPartner}
        onClose={() => setShowFullProfile(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[900],
  },

  // Idle Screen Styles
  idleContainer: {
    flex: 1,
    paddingHorizontal: Spacing["2xl"],
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["4xl"],
  },
  logoIcon: {
    fontSize: Typography.fontSize["6xl"],
    marginBottom: Spacing.md,
  },
  brandName: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
    letterSpacing: 1,
  },
  idleTitle: {
    fontSize: Typography.fontSize["4xl"],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: Typography.fontSize["4xl"] * Typography.lineHeight.tight,
  },
  idleSubtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.neutral[300],
    textAlign: "center",
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.relaxed,
    paddingHorizontal: Spacing.lg,
  },
  ctaSection: {
    paddingBottom: Spacing["5xl"],
  },
  startButton: {
    marginBottom: Spacing["2xl"],
    borderRadius: BorderRadius.xl,
    ...Shadows.lg,
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing["3xl"],
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[50],
  },
  startButtonIcon: {
    fontSize: Typography.fontSize.lg,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: Spacing.lg,
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
  },
  featureIcon: {
    fontSize: Typography.fontSize.xl,
    marginBottom: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[400],
    textAlign: "center",
    fontWeight: Typography.fontWeight.medium,
  },
  // Finding Screen Styles
  findingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  loadingAnimation: {
    marginBottom: Spacing["4xl"],
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary.main,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.3,
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.main,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIcon: {
    fontSize: Typography.fontSize["2xl"],
  },
  findingTitle: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  findingSubtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.neutral[300],
    textAlign: "center",
    marginBottom: Spacing["3xl"],
  },
  loadingSteps: {
    width: "100%",
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  stepIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.neutral[600],
    marginRight: Spacing.base,
  },
  stepActive: {
    backgroundColor: Colors.primary.main,
  },
  stepText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[300],
    fontWeight: Typography.fontWeight.medium,
  },
  // Video Overlay Styles
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  timerContainer: {
    position: "absolute",
    top: Spacing["6xl"] + Spacing.base, // Extra margin for iPhone safe area
    left: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    zIndex: 15,
  },
  timerContent: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    alignItems: "center",
  },
  timerLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[300],
    fontWeight: Typography.fontWeight.medium,
    marginBottom: 2,
  },
  timerText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
  },
  // End Call Button Styles
  endCallButton: {
    position: "absolute",
    top: Spacing["6xl"] + Spacing["xl"], // Lower position
    right: Spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    zIndex: 20,
  },
  endCallButtonBlur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  endCallButtonText: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
    lineHeight: 28,
  },
  // Partner Bio Card Styles
  bioOverlay: {
    position: "absolute",
    bottom: 100,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  bioCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    overflow: "hidden",
  },
  bioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  partnerName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
    marginBottom: Spacing.xs,
  },
  partnerLocation: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[300],
    fontWeight: Typography.fontWeight.medium,
  },
  partnerBio: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[100],
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
    marginBottom: Spacing.md,
  },
  profileIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.main,
    justifyContent: "center",
    alignItems: "center",
  },
  profileIndicatorText: {
    fontSize: Typography.fontSize.lg,
  },
  tapHint: {
    alignItems: "center",
  },
  tapHintText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[400],
    fontStyle: "italic",
  },
  // Action Buttons Styles
  actionButtonsContainer: {
    position: "absolute",
    bottom: Spacing["2xl"], // Added bottom margin for iPhone home indicator
    left: Spacing.lg,
    right: Spacing.lg,
    alignItems: "center",
  },
  topButtonsRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
    width: "100%",
  },
  helperButton: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    ...Shadows.md,
    flex: 1,
  },
  helperButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  helperButtonIcon: {
    fontSize: Typography.fontSize.lg,
  },
  helperButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[50],
  },
  // Skip Button Styles
  skipButton: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    flex: 1,
  },
  skipButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  skipButtonIcon: {
    fontSize: Typography.fontSize.base,
  },
  skipButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[50],
  },
  // Decision Buttons Styles
  decisionButtons: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  passButton: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    flex: 1,
  },
  continueButton: {
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    flex: 1,
    ...Shadows.md,
  },
  decisionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  decisionButtonIcon: {
    fontSize: Typography.fontSize.lg,
  },
  decisionButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[300],
  },
  continueButtonText: {
    color: Colors.neutral[50],
  },
  // Helper Overlay Styles
  currentHelperOverlay: {
    position: "absolute",
    top: 160, // Increased further for iPhone safe area
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 9999,
    elevation: 9999,
  },
  helperCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    overflow: "hidden",
    gap: Spacing.sm,
  },
  helperTypeIcon: {
    fontSize: Typography.fontSize.xl,
  },
  dismissHelperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.overlay.light,
    justifyContent: "center",
    alignItems: "center",
  },
  dismissHelperButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
  },
  currentHelperText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[50],
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },
});

export default VideoMatchScreen;
