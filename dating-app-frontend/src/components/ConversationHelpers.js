import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
} from 'react-native';

const ConversationHelpers = ({ visible, onClose, onRequestHelper, currentHelper }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  const helpers = [
    {
      id: 'icebreaker',
      title: 'Ice Breaker',
      description: 'Get a random conversation starter',
      icon: '❄️',
    },
    {
      id: 'wouldyourather',
      title: 'Would You Rather',
      description: 'Choose between two options',
      icon: '🤔',
    },
    {
      id: 'topic',
      title: 'Topic Spinner',
      description: 'Get a random topic to discuss',
      icon: '🎯',
    },
  ];

  const renderCurrentHelper = () => {
    if (!currentHelper) return null;

    return (
      <View style={styles.currentHelperContainer}>
        <Text style={styles.currentHelperTitle}>
          {currentHelper.type === 'icebreaker' && '❄️ Ice Breaker'}
          {currentHelper.type === 'wouldyourather' && '🤔 Would You Rather'}
          {currentHelper.type === 'topic' && '🎯 Topic'}
        </Text>

        {currentHelper.type === 'icebreaker' && (
          <Text style={styles.currentHelperContent}>{currentHelper.content}</Text>
        )}

        {currentHelper.type === 'wouldyourather' && (
          <View style={styles.wouldYouRatherContainer}>
            <View style={styles.optionContainer}>
              <Text style={styles.optionText}>{currentHelper.content.option1}</Text>
            </View>
            <Text style={styles.orText}>OR</Text>
            <View style={styles.optionContainer}>
              <Text style={styles.optionText}>{currentHelper.content.option2}</Text>
            </View>
          </View>
        )}

        {currentHelper.type === 'topic' && (
          <Text style={styles.currentHelperContent}>
            Talk about: {currentHelper.content}
          </Text>
        )}

        <TouchableOpacity style={styles.dismissButton} onPress={onClose}>
          <Text style={styles.dismissButtonText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          {currentHelper ? (
            renderCurrentHelper()
          ) : (
            <>
              <Text style={styles.title}>Conversation Helpers</Text>
              <Text style={styles.subtitle}>Need help breaking the ice?</Text>

              <View style={styles.helpersContainer}>
                {helpers.map((helper) => (
                  <TouchableOpacity
                    key={helper.id}
                    style={styles.helperButton}
                    onPress={() => onRequestHelper(helper.id)}
                  >
                    <Text style={styles.helperIcon}>{helper.icon}</Text>
                    <Text style={styles.helperTitle}>{helper.title}</Text>
                    <Text style={styles.helperDescription}>{helper.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxWidth: 340,
    width: '90%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  helpersContainer: {
    marginBottom: 24,
  },
  helperButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  helperIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  helperTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  helperDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#ff4458',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  currentHelperContainer: {
    alignItems: 'center',
  },
  currentHelperTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  currentHelperContent: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  wouldYouRatherContainer: {
    width: '100%',
    marginBottom: 24,
  },
  optionContainer: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  orText: {
    fontSize: 16,
    color: '#ff4458',
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },
  dismissButton: {
    backgroundColor: '#ff4458',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ConversationHelpers;