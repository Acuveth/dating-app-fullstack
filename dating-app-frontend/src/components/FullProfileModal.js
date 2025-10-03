import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { BlurView } from "expo-blur";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Components,
} from "../theme/designSystem";

const { width, height } = Dimensions.get("window");

const FullProfileModal = ({ visible, partner, onClose }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!partner) return null;

  const getImageSource = (photo) => {
    if (photo?.uri) {
      return { uri: photo.uri };
    } else if (photo?.url) {
      return { uri: photo.url };
    }
    return null;
  };

  const renderPhoto = (photo, index) => {
    const imageSource = getImageSource(photo);

    if (!imageSource) {
      return (
        <View style={styles.photoPlaceholder}>
          <View style={styles.photoPlaceholderContent}>
            <Text style={styles.photoPlaceholderIcon}>📷</Text>
            <Text style={styles.photoPlaceholderText}>Photo {index + 1}</Text>
          </View>
        </View>
      );
    }

    return (
      <Image source={imageSource} style={styles.photo} resizeMode="cover" />
    );
  };

  const renderConversationHelper = (type, items) => {
    if (!items || items.length === 0) return null;

    const getHelperInfo = () => {
      switch (type) {
        case "iceBreakerAnswers":
          return {
            title: "Ice Breakers",
            icon: "✨",
            color: Colors.primary.main,
          };
        case "wouldYouRatherAnswers":
          return {
            title: "Would You Rather",
            icon: "🤔",
            color: Colors.secondary.main,
          };
        case "twoTruthsOneLie":
          return { title: "Two Truths, One Lie", icon: "🎭", color: "#A8E6CF" };
        default:
          return { title: "", icon: "", color: Colors.neutral[400] };
      }
    };

    const helperInfo = getHelperInfo();

    return (
      <View style={styles.helperCategory}>
        <View style={styles.helperCategoryHeader}>
          <Text style={styles.helperCategoryIcon}>{helperInfo.icon}</Text>
          <Text style={styles.helperCategoryTitle}>{helperInfo.title}</Text>
          <View
            style={[
              styles.helperCategoryBadge,
              { backgroundColor: helperInfo.color },
            ]}
          >
            <Text style={styles.helperCategoryBadgeText}>{items.length}</Text>
          </View>
        </View>

        {items.slice(0, 3).map((item, index) => (
          <View key={index} style={styles.helperItemCard}>
            {type === "iceBreakerAnswers" && (
              <View style={styles.helperContent}>
                <Text style={styles.helperQuestion}>{item.question}</Text>
                <Text style={styles.helperAnswer}>{item.answer}</Text>
              </View>
            )}
            {type === "wouldYouRatherAnswers" && (
              <View style={styles.helperContent}>
                <Text style={styles.helperQuestion}>
                  {item.question?.option1} <Text style={styles.orText}>or</Text>{" "}
                  {item.question?.option2}
                </Text>
                <View style={styles.choiceContainer}>
                  <Text style={styles.choiceLabel}>Choice:</Text>
                  <Text style={styles.helperAnswer}>{item.choice}</Text>
                </View>
                {item.reason && (
                  <Text style={styles.helperReason}>{item.reason}</Text>
                )}
              </View>
            )}
            {type === "twoTruthsOneLie" && (
              <View style={styles.helperContent}>
                <View style={styles.truthLieList}>
                  <Text style={styles.truthLieStatement}>{item.truth1}</Text>
                  <Text style={styles.truthLieStatement}>{item.truth2}</Text>
                  <Text style={styles.truthLieStatement}>{item.lie}</Text>
                </View>
              </View>
            )}
          </View>
        ))}

        {items.length > 3 && (
          <View style={styles.moreItemsIndicator}>
            <Text style={styles.moreItemsText}>+{items.length - 3} more</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.neutral[900]}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <BlurView intensity={80} style={styles.closeButtonBlur}>
              <Text style={styles.closeButtonText}>←</Text>
            </BlurView>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Profile</Text>

          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Enhanced Photos Section */}
          {partner.photos && partner.photos.length > 0 && (
            <View style={styles.photosSection}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.x / width
                  );
                  setCurrentPhotoIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {partner.photos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    {renderPhoto(photo, index)}
                    <View style={styles.photoOverlay}>
                      <BlurView intensity={60} style={styles.photoCounter}>
                        <Text style={styles.photoCounterText}>
                          {index + 1} / {partner.photos.length}
                        </Text>
                      </BlurView>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {partner.photos.length > 1 && (
                <View style={styles.photoIndicators}>
                  {partner.photos.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.photoIndicator,
                        index === currentPhotoIndex &&
                          styles.activePhotoIndicator,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Enhanced Basic Info */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.nameSection}>
                <Text style={styles.name}>{partner.displayName}</Text>
                <View style={styles.ageLocationContainer}>
                  <View style={styles.ageBadge}>
                    <Text style={styles.ageText}>{partner.age}</Text>
                  </View>
                  {partner.location?.city && (
                    <View style={styles.locationContainer}>
                      <Text style={styles.locationIcon}>📍</Text>
                      <Text style={styles.locationText}>
                        {partner.location.city}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.statusIndicator}>
                <View style={styles.onlineStatus} />
                <Text style={styles.statusText}>Online</Text>
              </View>
            </View>
            {partner.bio && (
              <View style={styles.bioSection}>
                <Text style={styles.bioLabel}>About</Text>
                <Text style={styles.bio}>{partner.bio}</Text>
              </View>
            )}
          </View>

          {/* Enhanced Conversation Helpers */}
          {partner.conversationHelpers && (
            <View style={styles.conversationSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>💬</Text>
                <Text style={styles.sectionTitle}>Conversation Starters</Text>
              </View>

              <View style={styles.helpersGrid}>
                {renderConversationHelper(
                  "iceBreakerAnswers",
                  partner.conversationHelpers.iceBreakerAnswers
                )}
                {renderConversationHelper(
                  "wouldYouRatherAnswers",
                  partner.conversationHelpers.wouldYouRatherAnswers
                )}
                {renderConversationHelper(
                  "twoTruthsOneLie",
                  partner.conversationHelpers.twoTruthsOneLie
                )}

                {!partner.conversationHelpers.iceBreakerAnswers?.length &&
                  !partner.conversationHelpers.wouldYouRatherAnswers?.length &&
                  !partner.conversationHelpers.twoTruthsOneLie?.length && (
                    <View style={styles.emptyHelpersContainer}>
                      <Text style={styles.emptyHelpersIcon}>🤷‍♀️</Text>
                      <Text style={styles.emptyHelpersText}>
                        No conversation starters yet
                      </Text>
                      <Text style={styles.emptyHelpersSubtext}>
                        They haven't added any ice breakers
                      </Text>
                    </View>
                  )}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[900],
  },

  // Header Styles
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing["6xl"], // Increased top margin for better spacing
    paddingBottom: Spacing.base,
    zIndex: 100,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  closeButtonBlur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: Typography.fontSize.xl,
    color: Colors.neutral[50],
    fontWeight: Typography.fontWeight.semibold,
  },
  headerTitleContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[50],
  },
  placeholder: {
    width: 44,
  },
  // Content Styles
  content: {
    marginTop: height * 0.1, // Adjusted to match photo section height
    flex: 1,
  },
  photosSection: {
    height: height * 0.6,
    position: "relative",
  },
  photoContainer: {
    width: width,
    height: height * 0.6,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.neutral[800],
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholderContent: {
    alignItems: "center",
  },
  photoPlaceholderIcon: {
    fontSize: Typography.fontSize["4xl"],
    color: Colors.neutral[500],
    marginBottom: Spacing.sm,
  },
  photoPlaceholderText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[400],
    fontWeight: Typography.fontWeight.medium,
  },
  photoOverlay: {
    position: "absolute",
    top: Spacing["6xl"], // Moved lower to avoid overlap with header
    right: Spacing.lg,
  },
  photoCounter: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  photoCounterText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[50],
    fontWeight: Typography.fontWeight.semibold,
  },
  photoIndicators: {
    position: "absolute",
    bottom: Spacing.xl,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  photoIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.overlay.medium,
  },
  activePhotoIndicator: {
    backgroundColor: Colors.neutral[50],
    ...Shadows.sm,
  },
  // Profile Card Styles
  profileCard: {
    backgroundColor: Colors.neutral[800],
    margin: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: Typography.fontSize["3xl"],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
    marginBottom: Spacing.sm,
  },
  ageLocationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.base,
  },
  ageBadge: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  ageText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[50],
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  locationIcon: {
    fontSize: Typography.fontSize.sm,
  },
  locationText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[300],
    fontWeight: Typography.fontWeight.medium,
  },
  statusIndicator: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  onlineStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.status.success,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.status.success,
    fontWeight: Typography.fontWeight.medium,
  },
  bioSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[700],
    paddingTop: Spacing.lg,
  },
  bioLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[300],
    marginBottom: Spacing.sm,
  },
  bio: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[100],
    lineHeight: Typography.fontSize.base * Typography.lineHeight.relaxed,
  },
  // Conversation Section Styles
  conversationSection: {
    margin: Spacing.lg,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionIcon: {
    fontSize: Typography.fontSize.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
  },
  helpersGrid: {
    gap: Spacing.base,
  },
  helperCategory: {
    backgroundColor: Colors.neutral[800],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.base,
    ...Shadows.sm,
  },
  helperCategoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  helperCategoryIcon: {
    fontSize: Typography.fontSize.lg,
  },
  helperCategoryTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[50],
    flex: 1,
  },
  helperCategoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  helperCategoryBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
  },
  helperItemCard: {
    backgroundColor: Colors.neutral[700],
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  helperContent: {
    gap: Spacing.sm,
  },
  helperQuestion: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary.light,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  helperAnswer: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[100],
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  orText: {
    color: Colors.neutral[400],
    fontWeight: Typography.fontWeight.normal,
  },
  choiceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  choiceLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[400],
    fontWeight: Typography.fontWeight.medium,
  },
  helperReason: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[300],
    fontStyle: "italic",
    lineHeight: Typography.fontSize.xs * Typography.lineHeight.normal,
  },
  truthLieList: {
    gap: Spacing.xs,
  },
  truthLieStatement: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[100],
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  moreItemsIndicator: {
    alignItems: "center",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[600],
  },
  moreItemsText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[400],
    fontWeight: Typography.fontWeight.medium,
  },
  emptyHelpersContainer: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  emptyHelpersIcon: {
    fontSize: Typography.fontSize["2xl"],
    marginBottom: Spacing.sm,
  },
  emptyHelpersText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[300],
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  emptyHelpersSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[400],
    textAlign: "center",
  },
});

export default FullProfileModal;
