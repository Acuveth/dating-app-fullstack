import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from "../contexts/AuthContext";
import { Colors, Typography, Spacing, BorderRadius, Shadows, Components } from '../theme/designSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const BASE_URL = "http://172.20.10.2:5001";

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageLoadStates, setImageLoadStates] = useState({});
  const [retryCount, setRetryCount] = useState({});
  const photoScrollRef = useRef(null);
  const MAX_RETRY_ATTEMPTS = 3;

  useEffect(() => {
    console.log("ProfileScreen - user:", user);
    console.log("ProfileScreen - user photos:", user?.photos);
    if (user?.photos) {
      user.photos.forEach((photo, index) => {
        console.log(`Photo ${index}:`, photo);
      });
    }
  }, [user]);

  // Add a safety timeout for stuck loading states
  useEffect(() => {
    const timer = setTimeout(() => {
      setImageLoadStates(prev => {
        const updated = { ...prev };
        let hasChanges = false;

        Object.keys(updated).forEach(key => {
          if (updated[key] === 'loading') {
            console.log(`Timeout: Forcing ${key} from loading to loaded`);
            updated[key] = 'loaded';
            hasChanges = true;
          }
        });

        return hasChanges ? updated : prev;
      });
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [imageLoadStates]);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          await logout();
          setLoading(false);
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate("ProfileSetup");
  };

  const handleImageError = (imageKey, item, index) => {
    const currentRetries = retryCount[imageKey] || 0;
    console.log(
      `Image error for ${imageKey}, retry attempt: ${currentRetries}`
    );
    console.log("Failed URL:", item.url);

    if (currentRetries < MAX_RETRY_ATTEMPTS) {
      setTimeout(() => {
        setRetryCount((prev) => ({ ...prev, [imageKey]: currentRetries + 1 }));
        setImageLoadStates((prev) => ({ ...prev, [imageKey]: "retrying" }));
      }, 1000 * (currentRetries + 1));
    } else {
      setImageLoadStates((prev) => ({ ...prev, [imageKey]: "error" }));
    }
  };

  const getImageSource = (item, imageKey) => {
    const currentRetries = retryCount[imageKey] || 0;

    // Ensure URL is valid
    if (!item?.url || item.url === "") {
      console.log("Invalid URL detected:", item);
      return null;
    }

    let fullUrl = item.url;

    // Handle different URL types
    if (item.url.startsWith("data:")) {
      // Check if base64 data URI is complete
      if (
        item.url === "data:image/jpeg;base64," ||
        item.url.endsWith("base64,")
      ) {
        console.log("Incomplete base64 data URI detected:", item.url);
        return null;
      }
      // Base64 data URI - use as-is
      fullUrl = item.url;
      console.log("Using base64 data URI directly");
    } else if (
      item.url.startsWith("http://") ||
      item.url.startsWith("https://")
    ) {
      // Full URL - use as-is
      fullUrl = item.url;
    } else if (item.url.startsWith("/uploads/")) {
      // File upload path - prepend base URL
      fullUrl = `${BASE_URL}${item.url}`;
      console.log("Using file upload URL:", fullUrl.substring(0, 50) + "...");
    } else if (item.url.startsWith("/")) {
      // Other absolute path - prepend base URL
      fullUrl = `${BASE_URL}${item.url}`;
    } else {
      // Relative path - prepend base URL with slash
      fullUrl = `${BASE_URL}/${item.url}`;
    }

    // Only add timestamp for server URLs, not data URIs
    const urlWithTimestamp =
      currentRetries > 0 && !item.url.startsWith("data:")
        ? `${fullUrl}${
            fullUrl.includes("?") ? "&" : "?"
          }retry=${currentRetries}&t=${Date.now()}`
        : fullUrl;

    console.log(
      "Constructed image URL:",
      urlWithTimestamp.substring(0, 50) + "..."
    );

    return {
      uri: urlWithTimestamp,
      priority: "high",
      cache:
        currentRetries > 0 && !item.url.startsWith("data:")
          ? "reload"
          : "default",
    };
  };

  const renderPhoto = ({ item, index }) => {
    const imageKey = `${index}-${item?.url || "no-url"}`;
    const loadState = imageLoadStates[imageKey] || "loading";
    const imageSource = getImageSource(item, imageKey);

    console.log(`Rendering photo ${index}, imageKey: ${imageKey}, loadState: ${loadState}`);

    if (!imageSource) {
      return (
        <View style={styles.photoContainer}>
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <View style={styles.errorContent}>
              <Text style={styles.errorIcon}>📷</Text>
              <Text style={styles.errorText}>Image data incomplete</Text>
              <Text style={styles.retryText}>Please re-upload this photo</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.photoContainer}>
        {(loadState === "loading" || loadState === "retrying") && (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
            <Text style={styles.loadingText}>
              {loadState === "retrying" ? "Retrying..." : "Loading..."}
            </Text>
            {loadState === "retrying" && (
              <Text style={styles.retryText}>
                Attempt {(retryCount[imageKey] || 0) + 1}/{MAX_RETRY_ATTEMPTS}
              </Text>
            )}
          </View>
        )}
        {loadState === "error" && (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Text style={styles.errorIcon}>📷</Text>
            <Text style={styles.errorText}>Failed to load image</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setRetryCount((prev) => ({ ...prev, [imageKey]: 0 }));
                setImageLoadStates((prev) => ({
                  ...prev,
                  [imageKey]: "loading",
                }));
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        <Image
          source={imageSource}
          style={[
            styles.photo,
            loadState !== "loaded" && { position: "absolute", opacity: 0 },
          ]}
          resizeMode="cover"
          onLoad={() => {
            console.log(`Image loaded successfully: ${imageKey}`);
            setImageLoadStates((prev) => ({ ...prev, [imageKey]: "loaded" }));
            setRetryCount((prev) => ({ ...prev, [imageKey]: 0 }));
          }}
          onError={(error) => {
            console.log(`Image load error for ${imageKey}:`, error.nativeEvent);
            handleImageError(imageKey, item, index);
          }}
          onLoadStart={() => {
            if (imageLoadStates[imageKey] !== "retrying" && imageLoadStates[imageKey] !== "loaded") {
              setImageLoadStates((prev) => ({ ...prev, [imageKey]: "loading" }));
            }
          }}
        />

        {/* Photo gradient overlay */}
        <LinearGradient
          colors={['transparent', 'transparent', 'rgba(0,0,0,0.8)']}
          style={styles.photoGradient}
        />

        {/* Photo indicators */}
        <View style={styles.photoIndicators}>
          {user?.photos?.map((_, i) => (
            <View
              key={i}
              style={[
                styles.photoIndicator,
                i === currentPhotoIndex && styles.photoIndicatorActive,
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentPhotoIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.neutral[900]} />

      {/* Header with blur effect */}
      <View style={styles.header}>
        <BlurView intensity={80} style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.settingsButton}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity
              style={styles.editHeaderButton}
              onPress={handleEditProfile}
            >
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Enhanced Photo Section */}
        <View style={styles.photoSection}>
          {user?.photos && user.photos.length > 0 ? (
            <FlatList
              ref={photoScrollRef}
              data={user.photos}
              renderItem={renderPhoto}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              snapToInterval={screenWidth}
              decelerationRate="fast"
              bounces={false}
            />
          ) : (
            <View style={styles.noPhotosContainer}>
              <View style={styles.noPhotosCard}>
                <Text style={styles.noPhotosIcon}>📸</Text>
                <Text style={styles.noPhotosTitle}>Add Your Photos</Text>
                <Text style={styles.noPhotosSubtext}>Show your personality with great photos</Text>
                <TouchableOpacity
                  style={styles.addPhotosButton}
                  onPress={handleEditProfile}
                >
                  <Text style={styles.addPhotosButtonText}>Add Photos</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.nameSection}>
              <Text style={styles.displayName}>{user?.displayName}</Text>
              <View style={styles.detailsRow}>
                <View style={styles.ageBadge}>
                  <Text style={styles.ageText}>{user?.age}</Text>
                </View>
                {user?.gender && (
                  <View style={styles.genderBadge}>
                    <Text style={styles.genderText}>
                      {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                    </Text>
                  </View>
                )}
              </View>
              {user?.location?.city && (
                <View style={styles.locationContainer}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText}>{user.location.city}</Text>
                </View>
              )}
            </View>
            <View style={styles.statusContainer}>
              <View style={styles.onlineStatus} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>

          {user?.bio && (
            <View style={styles.bioSection}>
              <Text style={styles.bioLabel}>About Me</Text>
              <Text style={styles.bio}>{user.bio}</Text>
            </View>
          )}
        </View>

        {/* Preferences Card */}
        {user?.preferences && (
          <View style={styles.preferencesCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🎯</Text>
              <Text style={styles.cardTitle}>Dating Preferences</Text>
            </View>
            <View style={styles.preferencesGrid}>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceIcon}>👥</Text>
                <View style={styles.preferenceContent}>
                  <Text style={styles.preferenceLabel}>Looking for</Text>
                  <Text style={styles.preferenceValue}>
                    {user.preferences.gender === 'male' ? 'Men' :
                     user.preferences.gender === 'female' ? 'Women' : 'Everyone'}
                  </Text>
                </View>
              </View>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceIcon}>🎂</Text>
                <View style={styles.preferenceContent}>
                  <Text style={styles.preferenceLabel}>Age range</Text>
                  <Text style={styles.preferenceValue}>
                    {user.preferences.ageMin} - {user.preferences.ageMax} years
                  </Text>
                </View>
              </View>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceIcon}>📍</Text>
                <View style={styles.preferenceContent}>
                  <Text style={styles.preferenceLabel}>Distance</Text>
                  <Text style={styles.preferenceValue}>
                    Within {user.preferences.maxDistance} km
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Conversation Starters Card */}
        {(user?.conversationHelpers?.iceBreakerAnswers?.length > 0 ||
          user?.conversationHelpers?.wouldYouRatherAnswers?.length > 0 ||
          user?.conversationHelpers?.twoTruthsOneLie?.length > 0) && (
          <View style={styles.conversationCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>💬</Text>
              <Text style={styles.cardTitle}>Conversation Starters</Text>
            </View>

            {user?.conversationHelpers?.iceBreakerAnswers?.length > 0 && (
              <View style={styles.helperCategory}>
                <Text style={styles.helperCategoryTitle}>✨ Ice Breakers</Text>
                {user.conversationHelpers.iceBreakerAnswers.slice(0, 3).map((item, index) => (
                  <View key={index} style={styles.helperItemCard}>
                    <Text style={styles.helperQuestion}>{item.question}</Text>
                    <Text style={styles.helperAnswer}>{item.answer}</Text>
                  </View>
                ))}
              </View>
            )}

            {user?.conversationHelpers?.wouldYouRatherAnswers?.length > 0 && (
              <View style={styles.helperCategory}>
                <Text style={styles.helperCategoryTitle}>🤔 Would You Rather</Text>
                {user.conversationHelpers.wouldYouRatherAnswers.slice(0, 2).map((item, index) => (
                  <View key={index} style={styles.helperItemCard}>
                    <Text style={styles.helperQuestion}>
                      {item.question?.option1} <Text style={styles.orText}>or</Text> {item.question?.option2}
                    </Text>
                    <Text style={styles.helperAnswer}>Choice: {item.choice}</Text>
                  </View>
                ))}
              </View>
            )}

            {user?.conversationHelpers?.twoTruthsOneLie?.length > 0 && (
              <View style={styles.helperCategory}>
                <Text style={styles.helperCategoryTitle}>🎭 Two Truths, One Lie</Text>
                {user.conversationHelpers.twoTruthsOneLie.slice(0, 1).map((set, index) => (
                  <View key={index} style={styles.helperItemCard}>
                    <View style={styles.truthLieList}>
                      <Text style={styles.truthLieItem}>• {set.truth1}</Text>
                      <Text style={styles.truthLieItem}>• {set.truth2}</Text>
                      <Text style={styles.truthLieItem}>• {set.lie}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={handleEditProfile}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Colors.primary.gradient}
              style={styles.primaryActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.primaryActionIcon}>✏️</Text>
              <Text style={styles.primaryActionText}>Edit Profile</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryActionButton, loading && styles.buttonDisabled]}
            onPress={handleLogout}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryActionIcon}>
              {loading ? "⏳" : "🚪"}
            </Text>
            <Text style={styles.secondaryActionText}>
              {loading ? "Logging out..." : "Logout"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing for iPhone home indicator */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[900],
  },

  // Header Styles
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerBlur: {
    paddingTop: Spacing['4xl'] + Spacing.base, // Increased for iPhone safe area
    paddingBottom: Spacing.base,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.overlay.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: Typography.fontSize.lg,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[50],
  },
  editHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  editIcon: {
    fontSize: Typography.fontSize.base,
  },

  // Scroll View
  scrollView: {
    flex: 1,
    marginTop: Spacing['6xl'], // Account for header
  },

  // Photo Section
  photoSection: {
    height: screenHeight * 0.6,
    position: 'relative',
  },
  photoContainer: {
    width: screenWidth,
    height: screenHeight * 0.6,
    position: 'relative',
  },
  photo: {
    width: screenWidth,
    height: screenHeight * 0.6,
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  photoIndicators: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.overlay.medium,
  },
  photoIndicatorActive: {
    backgroundColor: Colors.neutral[50],
    width: 24,
  },
  photoPlaceholder: {
    backgroundColor: Colors.neutral[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContent: {
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.neutral[300],
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.base,
  },
  errorIcon: {
    fontSize: Typography.fontSize['3xl'],
    marginBottom: Spacing.base,
  },
  errorText: {
    color: Colors.neutral[300],
    fontSize: Typography.fontSize.base,
    marginBottom: Spacing.sm,
  },
  retryText: {
    color: Colors.neutral[400],
    fontSize: Typography.fontSize.sm,
  },
  retryButton: {
    marginTop: Spacing.base,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: Colors.neutral[50],
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },

  // No Photos State
  noPhotosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  noPhotosCard: {
    alignItems: 'center',
    backgroundColor: Colors.neutral[800],
    borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'],
    ...Shadows.lg,
  },
  noPhotosIcon: {
    fontSize: Typography.fontSize['4xl'],
    marginBottom: Spacing.lg,
  },
  noPhotosTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
    marginBottom: Spacing.sm,
  },
  noPhotosSubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[300],
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  addPhotosButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    ...Shadows.md,
  },
  addPhotosButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[50],
  },

  // Profile Card
  profileCard: {
    backgroundColor: Colors.neutral[800],
    margin: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  nameSection: {
    flex: 1,
  },
  displayName: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
    marginBottom: Spacing.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    marginBottom: Spacing.sm,
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
  genderBadge: {
    backgroundColor: Colors.secondary.main,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  genderText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[50],
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  statusContainer: {
    alignItems: 'center',
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

  // Preferences Card
  preferencesCard: {
    backgroundColor: Colors.neutral[800],
    margin: Spacing.lg,
    marginTop: 0,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  cardIcon: {
    fontSize: Typography.fontSize.xl,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
  },
  preferencesGrid: {
    gap: Spacing.base,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[700],
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    gap: Spacing.base,
  },
  preferenceIcon: {
    fontSize: Typography.fontSize.lg,
  },
  preferenceContent: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[300],
    marginBottom: Spacing.xs,
  },
  preferenceValue: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[50],
    fontWeight: Typography.fontWeight.medium,
  },

  // Conversation Card
  conversationCard: {
    backgroundColor: Colors.neutral[800],
    margin: Spacing.lg,
    marginTop: 0,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  helperCategory: {
    marginBottom: Spacing.lg,
  },
  helperCategoryTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary.main,
    marginBottom: Spacing.base,
  },
  helperItemCard: {
    backgroundColor: Colors.neutral[700],
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  helperQuestion: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary.light,
    marginBottom: Spacing.sm,
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
  truthLieList: {
    gap: Spacing.xs,
  },
  truthLieItem: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[100],
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },

  // Action Buttons
  actionsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.base,
    marginBottom: Spacing.lg,
  },
  primaryActionButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.base,
    gap: Spacing.sm,
  },
  primaryActionIcon: {
    fontSize: Typography.fontSize.lg,
  },
  primaryActionText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[50],
  },
  secondaryActionButton: {
    backgroundColor: Colors.neutral[700],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.neutral[600],
  },
  secondaryActionIcon: {
    fontSize: Typography.fontSize.base,
  },
  secondaryActionText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[200],
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Bottom Spacer
  bottomSpacer: {
    height: Spacing['2xl'], // Extra space for iPhone home indicator
  },
});

export default ProfileScreen;