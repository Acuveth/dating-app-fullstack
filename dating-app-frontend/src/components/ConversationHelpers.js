import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Components } from '../theme/designSystem';

const { width, height } = Dimensions.get('window');

const ConversationHelpers = ({ visible, onClose, onRequestHelper, currentHelper, onDismissHelper, onAnotherTopic }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);

  React.useEffect(() => {
    console.log('🔄 ConversationHelpers visibility changed:', visible);
    if (visible) {
      console.log('📖 Opening ConversationHelpers modal');
      setIsAnimating(false); // Reset animation state when modal opens
    } else {
      console.log('📕 Closing ConversationHelpers modal');
      setIsAnimating(false); // Reset animation state when modal closes
    }
  }, [visible]);

  React.useEffect(() => {
    console.log('🎯 currentHelper changed:', currentHelper);
    if (currentHelper) {
      console.log('📥 New helper content received:', currentHelper.type, currentHelper.content);
      setIsAnimating(false);
      console.log('🔄 Animation state reset for new helper');
    }
  }, [currentHelper]);

  const helpers = [
    {
      id: 'icebreaker',
      title: 'Ice Breakers',
      description: 'Spark conversations with interesting questions',
      icon: '✨',
      gradient: ['#FF6B6B', '#FF8E8E'],
    },
    {
      id: 'wouldyourather',
      title: 'Would You Rather',
      description: 'Fun dilemmas to explore preferences',
      icon: '🤔',
      gradient: ['#4ECDC4', '#7EDDD6'],
    },
    {
      id: 'topic',
      title: 'Deep Dive Topics',
      description: 'Meaningful subjects to discuss together',
      icon: '💭',
      gradient: ['#A8E6CF', '#88D8A3'],
    },
  ];

  const handleHelperPress = (helperId, index) => {
    console.log('🔄 Helper button pressed:', helperId);
    if (isAnimating) {
      console.log('❌ Blocked: Already animating');
      return;
    }

    setIsAnimating(true);
    console.log('✅ Calling onRequestHelper immediately');
    onRequestHelper(helperId);

    // Reset animation state quickly
    setTimeout(() => {
      setIsAnimating(false);
    }, 100);
  };

  const renderCurrentHelper = () => {
    if (!currentHelper) return null;

    const getHelperInfo = () => {
      switch (currentHelper.type) {
        case 'icebreaker':
          return { icon: '✨', title: 'Ice Breaker', gradient: ['#FF6B6B', '#FF8E8E'] };
        case 'wouldyourather':
          return { icon: '🤔', title: 'Would You Rather', gradient: ['#4ECDC4', '#7EDDD6'] };
        case 'topic':
          return { icon: '💭', title: 'Deep Dive', gradient: ['#A8E6CF', '#88D8A3'] };
        default:
          return { icon: '✨', title: 'Helper', gradient: ['#FF6B6B', '#FF8E8E'] };
      }
    };

    const helperInfo = getHelperInfo();

    return (
      <ScrollView style={styles.helperContentScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.helperHeaderRow}>
          <View style={styles.helperHeaderLeft}>
            <View style={styles.helperIconContainer}>
              <Text style={styles.helperIcon}>{helperInfo.icon}</Text>
            </View>
            <Text style={styles.helperTitle}>{helperInfo.title}</Text>
          </View>
          <TouchableOpacity
            style={styles.closeHelperButton}
            onPress={() => {
              if (onDismissHelper) {
                onDismissHelper();
              } else {
                onClose();
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.closeHelperButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentAndButtonRow}>
          <View style={styles.helperContentCard}>
            {currentHelper.type === 'icebreaker' && (
              <Text style={styles.helperQuestion}>{currentHelper.content}</Text>
            )}

            {currentHelper.type === 'wouldyourather' && (
              <View style={styles.wouldYouRatherContainer}>
                <View style={styles.optionCard}>
                  <View style={styles.optionNumber}>
                    <Text style={styles.optionNumberText}>A</Text>
                  </View>
                  <Text style={styles.optionText}>{currentHelper.content.option1}</Text>
                </View>

                <View style={styles.orDivider}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.orLine} />
                </View>

                <View style={styles.optionCard}>
                  <View style={styles.optionNumber}>
                    <Text style={styles.optionNumberText}>B</Text>
                  </View>
                  <Text style={styles.optionText}>{currentHelper.content.option2}</Text>
                </View>
              </View>
            )}

            {currentHelper.type === 'topic' && (
              <View style={styles.topicContainer}>
                <Text style={styles.topicLabel}>Let's talk about:</Text>
                <Text style={styles.topicContent}>{currentHelper.content}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              const now = Date.now();
              const timeSinceLastClick = now - lastClickTime;

              if (onAnotherTopic && currentHelper && !isAnimating && (timeSinceLastClick > 500)) {
                setIsAnimating(true);
                setLastClickTime(now);
                onAnotherTopic(currentHelper.type);
                setTimeout(() => setIsAnimating(false), 200);
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonIcon}>🔄</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={styles.blurBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.handleBar} />

            {currentHelper ? (
              renderCurrentHelper()
            ) : (
              <View style={styles.mainContent}>
                <View style={styles.headerSection}>
                  <Text style={styles.mainTitle}>Conversation Starters</Text>
                  <Text style={styles.mainSubtitle}>Choose a way to spark your conversation</Text>
                </View>

                <ScrollView
                  style={styles.helpersScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {helpers.map((helper, index) => (
                    <TouchableOpacity
                      key={helper.id}
                      style={styles.helperCard}
                      onPress={() => handleHelperPress(helper.id, index)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.helperCardContent}>
                        <View style={styles.helperIconBg}>
                          <Text style={styles.helperCardIcon}>{helper.icon}</Text>
                        </View>
                        <View style={styles.helperTextContent}>
                          <Text style={styles.helperCardTitle}>{helper.title}</Text>
                          <Text style={styles.helperCardDescription}>{helper.description}</Text>
                        </View>
                        <View style={styles.helperArrow}>
                          <Text style={styles.helperArrowText}>→</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeModalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal Overlay
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  blurBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.neutral[800],
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: height * 0.9,
    paddingBottom: Spacing['2xl'],
    ...Shadows.xl,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral[600],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },

  // Main Content
  mainContent: {
    paddingHorizontal: Spacing.xl,
  },
  headerSection: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  mainSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[300],
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },

  // Helper Cards List
  helpersScrollView: {
    maxHeight: height * 0.5,
    marginBottom: Spacing.xl,
  },
  helperCard: {
    backgroundColor: Colors.neutral[700],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.base,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  helperCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  helperIconBg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  helperCardIcon: {
    fontSize: Typography.fontSize.xl,
  },
  helperTextContent: {
    flex: 1,
  },
  helperCardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[50],
    marginBottom: Spacing.xs,
  },
  helperCardDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[300],
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  helperArrow: {
    marginLeft: Spacing.sm,
  },
  helperArrowText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.neutral[400],
  },

  // Close Button
  closeModalButton: {
    backgroundColor: Colors.neutral[600],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[500],
  },
  closeModalButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[200],
  },
  // Helper Content View
  helperContentScroll: {
    paddingHorizontal: Spacing.xl,
    maxHeight: height * 0.75,
  },
  helperHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.base,
  },
  helperHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  helperIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
    ...Shadows.md,
  },
  helperIcon: {
    fontSize: Typography.fontSize.xl,
  },
  helperTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
  },
  closeHelperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.neutral[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.base,
  },
  closeHelperButtonText: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[200],
    lineHeight: 28,
  },

  // Content and Button Row
  contentAndButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  // Helper Content Card
  helperContentCard: {
    backgroundColor: Colors.neutral[700],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flex: 1,
    ...Shadows.sm,
  },
  helperQuestion: {
    fontSize: Typography.fontSize.lg,
    color: Colors.neutral[50],
    textAlign: 'center',
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.relaxed,
    fontWeight: Typography.fontWeight.medium,
  },

  // Would You Rather Styles
  wouldYouRatherContainer: {
    gap: Spacing.base,
  },
  optionCard: {
    backgroundColor: Colors.neutral[600],
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.sm,
  },
  optionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.base,
  },
  optionNumberText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
  },
  optionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[50],
    flex: 1,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[500],
  },
  orText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.main,
    marginHorizontal: Spacing.base,
  },

  // Topic Styles
  topicContainer: {
    alignItems: 'center',
  },
  topicLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[300],
    marginBottom: Spacing.md,
    fontWeight: Typography.fontWeight.medium,
  },
  topicContent: {
    fontSize: Typography.fontSize.lg,
    color: Colors.neutral[50],
    textAlign: 'center',
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.relaxed,
    fontWeight: Typography.fontWeight.medium,
  },

  // Action Buttons
  actionButtonsContainer: {
    marginTop: Spacing.xl,
    paddingBottom: Spacing.base,
  },
  primaryButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.full,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[50],
  },
  primaryButtonIcon: {
    fontSize: Typography.fontSize.xl,
  },
});

export default ConversationHelpers;