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
          <View style={[styles.fullPhoto, styles.photoPlaceholder]}>
            <Text style={styles.errorIcon}>📷</Text>
            <Text style={styles.errorText}>Image data incomplete</Text>
            <Text style={styles.retryText}>Please re-upload this photo</Text>
          </View>
          <View style={styles.photoIndicator}>
            {user?.photos?.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.indicatorDot,
                  i === currentPhotoIndex && styles.indicatorDotActive,
                ]}
              />
            ))}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.photoContainer}>
        {(loadState === "loading" || loadState === "retrying") && (
          <View style={[styles.fullPhoto, styles.photoPlaceholder]}>
            <ActivityIndicator size="large" color="#ff4458" />
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
          <View style={[styles.fullPhoto, styles.photoPlaceholder]}>
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
            styles.fullPhoto,
            loadState !== "loaded" && { position: "absolute", opacity: 0 },
          ]}
          resizeMode="cover"
          onLoad={() => {
            console.log(`Image loaded successfully: ${imageKey}`);
            console.log(`Setting load state to 'loaded' for: ${imageKey}`);
            setImageLoadStates((prev) => {
              const newState = { ...prev, [imageKey]: "loaded" };
              console.log(`Updated imageLoadStates:`, newState);
              return newState;
            });
            setRetryCount((prev) => ({ ...prev, [imageKey]: 0 }));
          }}
          onError={(error) => {
            console.log(`Image load error for ${imageKey}:`, error.nativeEvent);
            handleImageError(imageKey, item, index);
          }}
          onLoadStart={() => {
            console.log(`onLoadStart called for ${imageKey}, current state: ${imageLoadStates[imageKey]}`);
            if (imageLoadStates[imageKey] !== "retrying" && imageLoadStates[imageKey] !== "loaded") {
              console.log(`Setting state to loading for ${imageKey}`);
              setImageLoadStates((prev) => ({
                ...prev,
                [imageKey]: "loading",
              }));
            } else {
              console.log(`Skipping state change for ${imageKey} (already ${imageLoadStates[imageKey]})`);
            }
          }}
        />
        <View style={styles.photoIndicator}>
          {user?.photos?.map((_, i) => (
            <View
              key={i}
              style={[
                styles.indicatorDot,
                i === currentPhotoIndex && styles.indicatorDotActive,
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {user?.photos && user.photos.length > 0 ? (
          <View>
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
          </View>
        ) : (
          <View style={styles.noPhotosFullScreen}>
            <Text style={styles.noPhotosText}>No photos added</Text>
          </View>
        )}

        <View style={styles.profileContent}>
          <View style={styles.header}>
            <View style={styles.nameAgeRow}>
              <Text style={styles.displayName}>{user?.displayName}</Text>
              <Text style={styles.age}>{user?.age}</Text>
            </View>
            {user?.gender && (
              <Text style={styles.gender}>{user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</Text>
            )}
            {user?.location?.city && (
              <Text style={styles.location}>📍 {user.location.city}</Text>
            )}
          </View>

          {user?.bio && (
            <View style={styles.bioSection}>
              <Text style={styles.bio}>{user.bio}</Text>
            </View>
          )}

          {user?.preferences && (
            <View style={styles.preferencesSection}>
              <Text style={styles.sectionTitle}>Matching Preferences</Text>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Looking for:</Text>
                <Text style={styles.preferenceValue}>
                  {user.preferences.gender === 'male' ? 'Men' :
                   user.preferences.gender === 'female' ? 'Women' : 'Everyone'}
                </Text>
              </View>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Age range:</Text>
                <Text style={styles.preferenceValue}>
                  {user.preferences.ageMin} - {user.preferences.ageMax} years
                </Text>
              </View>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Distance:</Text>
                <Text style={styles.preferenceValue}>
                  Within {user.preferences.maxDistance} km
                </Text>
              </View>
            </View>
          )}

          <View style={styles.conversationHelpersSection}>
            {user?.conversationHelpers?.iceBreakerAnswers?.length > 0 && (
              <>
                {user.conversationHelpers.iceBreakerAnswers.map(
                  (item, index) => (
                    <View key={index} style={styles.helperItem}>
                      <Text style={styles.helperQuestion}>{item.question}</Text>
                      <Text style={styles.helperAnswer}>{item.answer}</Text>
                    </View>
                  )
                )}
              </>
            )}

            {user?.conversationHelpers?.wouldYouRatherAnswers?.length > 0 && (
              <>
                {user?.conversationHelpers?.iceBreakerAnswers?.length > 0 && (
                  <View style={styles.sectionDivider} />
                )}
                {user.conversationHelpers.wouldYouRatherAnswers.map(
                  (item, index) => (
                    <View key={index} style={styles.helperItem}>
                      <Text style={styles.helperQuestion}>
                        {item.question?.option1} OR {item.question?.option2}
                      </Text>
                      <Text style={styles.helperAnswer}>
                        Choice: {item.choice}
                      </Text>
                    </View>
                  )
                )}
              </>
            )}

            {user?.conversationHelpers?.twoTruthsOneLie?.length > 0 && (
              <>
                {(user?.conversationHelpers?.iceBreakerAnswers?.length > 0 ||
                  user?.conversationHelpers?.wouldYouRatherAnswers?.length >
                    0) && <View style={styles.sectionDivider} />}
                <Text style={styles.helperTitle}>Two Truths and a Lie</Text>
                {user.conversationHelpers.twoTruthsOneLie.map((set, index) => (
                  <View key={index} style={styles.helperItem}>
                    <Text style={styles.truthLieItem}>• {set.truth1}</Text>
                    <Text style={styles.truthLieItem}>• {set.truth2}</Text>
                    <Text style={styles.truthLieItem}>• {set.lie}</Text>
                  </View>
                ))}
              </>
            )}
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.logoutButton, loading && styles.buttonDisabled]}
              onPress={handleLogout}
              disabled={loading}
            >
              <Text style={styles.logoutButtonText}>
                {loading ? "Logging out..." : "Logout"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingTop: Spacing['3xl'],
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
  editButton: {
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
  photoGallery: {
    flex: 1,
  },
  photoContainer: {
    width: screenWidth,
    height: screenHeight * 0.72,
    position: "relative",
  },
  fullPhoto: {
    width: screenWidth,
    height: screenHeight * 0.72,
  },
  photoIndicator: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginHorizontal: 4,
  },
  indicatorDotActive: {
    backgroundColor: "#ff4458",
    width: 24,
  },
  noPhotosFullScreen: {
    width: screenWidth,
    height: screenHeight * 0.72,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
  },
  noPhotosText: {
    color: "#666",
    fontSize: 18,
  },
  profileContent: {
    padding: 20,
    backgroundColor: "#1a1a1a",
  },
  header: {
    marginBottom: 24,
  },
  nameAgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
  },
  displayName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  age: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  gender: {
    fontSize: 16,
    color: "#ff4458",
    fontWeight: "500",
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: "#888",
    marginBottom: 12,
  },
  bioSection: {
    backgroundColor: "#2a2a2a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  preferencesSection: {
    backgroundColor: "#2a2a2a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  preferenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  preferenceLabel: {
    fontSize: 14,
    color: "#888",
  },
  preferenceValue: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  bio: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 22,
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff4458",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  actionsSection: {
    marginBottom: 24,
  },
  editButton: {
    height: 56,
    backgroundColor: "#ff4458",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  logoutButton: {
    height: 56,
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  conversationHelpersSection: {
    backgroundColor: "#2a2a2a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#333",
    marginVertical: 16,
  },
  helperTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff4458",
    marginBottom: 8,
  },
  helperItem: {
    marginBottom: 12,
  },
  helperSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginBottom: 8,
  },
  helperQuestion: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff4458",
    marginBottom: 6,
  },
  helperAnswer: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
  },
  helperReason: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  truthsLieSet: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  truthItem: {
    fontSize: 14,
    color: "#4ade80",
    marginBottom: 4,
  },
  lieItem: {
    fontSize: 14,
    color: "#f87171",
    marginBottom: 4,
  },
  truthLieItem: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 4,
  },
  photoPlaceholder: {
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#666",
    fontSize: 16,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  errorText: {
    color: "#666",
    fontSize: 14,
  },
  retryText: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#ff4458",
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ProfileScreen;
