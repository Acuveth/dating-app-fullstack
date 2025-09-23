import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  console.log('ProfileScreen - user photos:', user?.photos);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.photosSection}>
            {user?.photos && user.photos.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {user.photos.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo.url }}
                    style={styles.photo}
                    onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noPhotos}>
                <Text style={styles.noPhotosText}>No photos added</Text>
              </View>
            )}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.displayName}>{user?.displayName}</Text>
            <Text style={styles.age}>Age: {user?.age}</Text>
            {user?.location?.city && (
              <Text style={styles.location}>📍 {user.location.city}</Text>
            )}
            {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
          </View>
        </View>

        <View style={styles.conversationHelpersSection}>
          {user?.conversationHelpers?.iceBreakerAnswers?.length > 0 && (
            <View style={styles.helperCategory}>
              <Text style={styles.helperTitle}>Ice Breakers</Text>
              {user.conversationHelpers.iceBreakerAnswers.map((item, index) => (
                <View key={index} style={styles.helperItem}>
                  <Text style={styles.helperQuestion}>Q: {item.question}</Text>
                  <Text style={styles.helperAnswer}>A: {item.answer}</Text>
                </View>
              ))}
            </View>
          )}

          {user?.conversationHelpers?.wouldYouRatherAnswers?.length > 0 && (
            <View style={styles.helperCategory}>
              <Text style={styles.helperTitle}>Would You Rather</Text>
              {user.conversationHelpers.wouldYouRatherAnswers.map(
                (item, index) => (
                  <View key={index} style={styles.helperItem}>
                    <Text style={styles.helperQuestion}>
                      {item.question?.option1} OR {item.question?.option2}
                    </Text>
                    <Text style={styles.helperAnswer}>
                      Choice: {item.choice}
                    </Text>
                    {item.reason && (
                      <Text style={styles.helperReason}>
                        Why: {item.reason}
                      </Text>
                    )}
                  </View>
                )
              )}
            </View>
          )}

          {user?.conversationHelpers?.twoTruthsOneLie?.length > 0 && (
            <View style={styles.helperCategory}>
              <Text style={styles.helperTitle}>Two Truths and a Lie</Text>
              {user.conversationHelpers.twoTruthsOneLie.map((set, index) => (
                <View key={index} style={styles.truthsLieSet}>
                  {set.category && (
                    <Text style={styles.helperCategory}>{set.category}</Text>
                  )}
                  <Text style={styles.truthItem}>• {set.truth1}</Text>
                  <Text style={styles.truthItem}>• {set.truth2}</Text>
                  <Text style={styles.lieItem}>• {set.lie} (lie)</Text>
                </View>
              ))}
            </View>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  profileCard: {
    backgroundColor: "#2a2a2a",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  photosSection: {
    marginBottom: 20,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },
  noPhotos: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 12,
  },
  noPhotosText: {
    color: "#666",
    fontSize: 16,
  },
  infoSection: {
    marginBottom: 20,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  age: {
    fontSize: 16,
    color: "#888",
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: "#888",
    marginBottom: 12,
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  helperCategory: {
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  helperTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff4458",
    marginBottom: 8,
  },
  helperItem: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 12,
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
});

export default ProfileScreen;
