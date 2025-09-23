import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { matchService } from '../services/matchService';
import VideoCall from '../components/VideoCall';
import ConversationHelpers from '../components/ConversationHelpers';

const { width, height } = Dimensions.get('window');

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

  const [matchState, setMatchState] = useState('idle'); // idle, finding, matched, ended
  const [currentPartner, setCurrentPartner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showHelpers, setShowHelpers] = useState(false);
  const [showDecisionButtons, setShowDecisionButtons] = useState(false);
  const [userDecision, setUserDecision] = useState(null);

  useEffect(() => {
    if (currentMatch) {
      if (currentMatch.status === 'pending' || currentMatch.status === 'active') {
        setMatchState('matched');
        setShowDecisionButtons(false);
      } else if (currentMatch.status === 'timeout') {
        setShowDecisionButtons(true);
      } else if (currentMatch.status === 'extended') {
        setMatchState('extended');
        setShowDecisionButtons(false);
      } else if (currentMatch.status === 'ended' || currentMatch.status === 'skipped') {
        handleMatchEnded();
      }
    }
  }, [currentMatch]);

  useEffect(() => {
    if (timeRemaining <= 0 && matchState === 'matched') {
      setShowDecisionButtons(true);
    }
  }, [timeRemaining, matchState]);

  const handleStartMatching = async () => {
    if (!user?.location?.city) {
      Alert.alert(
        'Location Required',
        'Please set your location in your profile to start matching.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      setMatchState('finding');

      const response = await matchService.findMatch();

      if (response.match) {
        setCurrentPartner(response.match);
        joinMatch(response.match.matchId);
      } else {
        Alert.alert('No Matches', response.message || 'No matches available right now. Try again later.');
        setMatchState('idle');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
      setMatchState('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (currentMatch?.matchId) {
      skipMatch(currentMatch.matchId);
    }
  };

  const handleDecision = (decision) => {
    setUserDecision(decision);
    if (currentMatch?.matchId) {
      makeDecision(currentMatch.matchId, decision);
    }
  };

  const handleMatchEnded = () => {
    if (currentMatch?.matchId) {
      leaveMatch(currentMatch.matchId);
    }
    setMatchState('idle');
    setCurrentPartner(null);
    setShowDecisionButtons(false);
    setUserDecision(null);
  };

  const handleRequestHelper = (type) => {
    if (currentMatch?.matchId) {
      requestHelper(type, currentMatch.matchId);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderOverlay = () => {
    return (
      <View style={styles.overlay}>
        {/* Timer */}
        {(matchState === 'matched' || matchState === 'extended') && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {matchState === 'extended' ? '∞' : formatTime(timeRemaining)}
            </Text>
          </View>
        )}

        {/* Partner Bio Overlay */}
        {currentPartner && (matchState === 'matched' || matchState === 'extended') && (
          <View style={styles.bioOverlay}>
            <Text style={styles.partnerName}>{currentPartner.displayName}, {currentPartner.age}</Text>
            {currentPartner.bio && (
              <Text style={styles.partnerBio}>{currentPartner.bio}</Text>
            )}
            {currentPartner.location?.city && (
              <Text style={styles.partnerLocation}>📍 {currentPartner.location.city}</Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {/* Helper Button */}
          {(matchState === 'matched' || matchState === 'extended') && (
            <TouchableOpacity
              style={styles.helperButton}
              onPress={() => setShowHelpers(true)}
            >
              <Text style={styles.helperButtonText}>💡</Text>
            </TouchableOpacity>
          )}

          {/* Skip Button */}
          {(matchState === 'matched' || matchState === 'extended') && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          )}

          {/* Decision Buttons */}
          {showDecisionButtons && (
            <View style={styles.decisionButtons}>
              <TouchableOpacity
                style={[styles.decisionButton, styles.passButton]}
                onPress={() => handleDecision('no')}
              >
                <Text style={styles.decisionButtonText}>Pass</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.decisionButton, styles.continueButton]}
                onPress={() => handleDecision('yes')}
              >
                <Text style={styles.decisionButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Current Helper Display */}
        {currentMatch?.currentHelper && (
          <View style={styles.currentHelperOverlay}>
            <Text style={styles.currentHelperText}>
              {currentMatch.currentHelper.type === 'icebreaker' && `💡 ${currentMatch.currentHelper.content}`}
              {currentMatch.currentHelper.type === 'topic' && `🎯 Talk about: ${currentMatch.currentHelper.content}`}
              {currentMatch.currentHelper.type === 'wouldyourather' &&
                `🤔 ${currentMatch.currentHelper.content.option1} OR ${currentMatch.currentHelper.content.option2}`
              }
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderContent = () => {
    switch (matchState) {
      case 'idle':
        return (
          <View style={styles.idleContainer}>
            <Text style={styles.idleTitle}>Ready to meet someone new?</Text>
            <Text style={styles.idleSubtitle}>
              Connect instantly with people in your area through video chat
            </Text>
            <TouchableOpacity
              style={[styles.startButton, loading && styles.startButtonDisabled]}
              onPress={handleStartMatching}
              disabled={loading}
            >
              <Text style={styles.startButtonText}>
                {loading ? 'Finding Match...' : 'Start Matching'}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'finding':
        return (
          <View style={styles.findingContainer}>
            <Text style={styles.findingTitle}>Finding your match...</Text>
            <Text style={styles.findingSubtitle}>
              We're looking for someone special near you
            </Text>
          </View>
        );

      case 'matched':
      case 'extended':
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
        currentHelper={currentMatch?.currentHelper}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  idleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  idleTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  idleSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#ff4458',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 48,
    minWidth: 200,
    alignItems: 'center',
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  findingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  findingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  findingSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  timerContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  bioOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    padding: 16,
  },
  partnerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  partnerBio: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    lineHeight: 20,
  },
  partnerLocation: {
    fontSize: 14,
    color: '#888',
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  helperButton: {
    position: 'absolute',
    top: -60,
    right: 0,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 68, 88, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperButtonText: {
    fontSize: 20,
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  decisionButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  decisionButton: {
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 120,
    alignItems: 'center',
  },
  passButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  continueButton: {
    backgroundColor: '#ff4458',
  },
  decisionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  currentHelperOverlay: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 68, 88, 0.9)',
    borderRadius: 12,
    padding: 16,
  },
  currentHelperText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default VideoMatchScreen;