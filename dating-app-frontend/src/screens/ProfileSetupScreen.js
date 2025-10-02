import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import ConversationHelpersSetup from '../components/ConversationHelpersSetup';

const ProfileSetupScreen = ({ navigation: navProp }) => {
  const navigation = useNavigation(); // Use hook instead of prop

  console.warn('=== PROFILE SETUP MOUNTED ===');
  console.warn('Navigation from prop exists:', !!navProp);
  console.warn('Navigation from hook exists:', !!navigation);
  console.warn('Navigation methods available:', navigation ? Object.keys(navigation).join(', ') : 'none');

  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    age: user?.age?.toString() || '',
    gender: user?.gender || '',
    bio: user?.bio || '',
    location: user?.location || { city: '', coordinates: null },
    photos: user?.photos || [],
    preferences: user?.preferences || {
      ageMin: 18,
      ageMax: 50,
      gender: 'both',
      maxDistance: 50
    },
    conversationHelpers: user?.conversationHelpers || {
      iceBreakerAnswers: [],
      wouldYouRatherAnswers: [],
      twoTruthsOneLie: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    console.log('ProfileSetupScreen - formData.photos:', formData.photos);
    formData.photos.forEach((photo, index) => {
      console.log(`Photo ${index}:`, {
        hasUri: !!photo.uri,
        hasUrl: !!photo.url,
        hasBase64: !!photo.base64,
        url: photo.url,
        uri: photo.uri?.substring(0, 50) + '...'
      });
    });
  }, [formData.photos]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'We need location access to find matches near you.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Location permission error:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationUpdate = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Please enable location access in settings');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const address = geocode[0];
        const city = `${address.city}, ${address.region}`;

        const locationData = {
          city,
          coordinates: {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          }
        };

        setFormData(prev => ({ ...prev, location: locationData }));
        Alert.alert('Success', `Location set to ${city}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleAddPhoto = async () => {
    if (formData.photos.length >= 3) {
      Alert.alert('Limit Reached', 'You can only add up to 3 photos');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Please enable photo library access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true, // Request base64 data
    });

    if (!result.canceled) {
      const newPhoto = {
        uri: result.assets[0].base64 ? `data:image/jpeg;base64,${result.assets[0].base64}` : result.assets[0].uri,
        type: result.assets[0].type,
        fileName: result.assets[0].fileName || `photo_${Date.now()}.jpg`,
        base64: result.assets[0].base64, // Store base64 for direct use
      };

      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, newPhoto],
      }));
    }
  };

  const handleRemovePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const handleConversationHelpersUpdate = (helpers) => {
    setFormData(prev => ({
      ...prev,
      conversationHelpers: helpers
    }));
  };

  // Helper function to get the correct image source
  const getImageSource = (photo) => {
    if (photo.uri) {
      // New photos from image picker have uri
      return { uri: photo.uri };
    } else if (photo.url) {
      // Existing photos from database have url
      const baseUrl = 'http://172.20.10.2:5001';
      const fullUrl = photo.url.startsWith('http') ? photo.url : `${baseUrl}${photo.url}`;
      return { uri: fullUrl };
    } else {
      // Fallback for photos with neither uri nor url
      console.warn('Photo has no uri or url:', photo);
      return { uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAGklEQVR4nGP8//8/AymIiYkxavTo0aNHjwAAXwYTAG2BnGkAAAAASUVORK5CYII=' };
    }
  };

  const addDebugInfo = (message) => {
    console.warn(message);
    setDebugInfo(prev => prev + message + '\n');
  };

  const handleSave = async () => {
    setDebugInfo(''); // Clear previous debug info
    addDebugInfo('=== SAVE BUTTON PRESSED ===');
    addDebugInfo(`Navigation exists: ${!!navigation}`);
    addDebugInfo(`Navigation type: ${typeof navigation}`);
    addDebugInfo(`Navigation methods: ${navigation ? Object.keys(navigation).join(', ') : 'null'}`);
    addDebugInfo(`Can go back: ${navigation?.canGoBack ? navigation.canGoBack() : 'method not available'}`);

    if (!formData.displayName || !formData.age || !formData.gender) {
      addDebugInfo('ERROR: Missing required fields');
      Alert.alert('Error', 'Please fill in name, age, and gender');
      return;
    }

    if (!formData.location.city) {
      addDebugInfo('ERROR: Missing location');
      Alert.alert('Error', 'Please set your location');
      return;
    }

    try {
      addDebugInfo('Setting loading to true...');
      setLoading(true);
      addDebugInfo('Starting profile save...');

      const profileData = {
        displayName: formData.displayName,
        age: parseInt(formData.age),
        gender: formData.gender,
        bio: formData.bio,
        preferences: formData.preferences,
        conversationHelpers: formData.conversationHelpers,
      };

      addDebugInfo('Calling userService.updateProfile...');
      await userService.updateProfile(profileData);
      addDebugInfo('Profile updated successfully');

      if (formData.location.coordinates) {
        addDebugInfo('Updating location...');
        await userService.updateLocation({
          city: formData.location.city,
          lat: formData.location.coordinates.lat,
          lng: formData.location.coordinates.lng
        });
        addDebugInfo('Location updated successfully');
      }

      let uploadedPhotos = user?.photos || [];

      // Separate existing photos from new photos
      const existingPhotos = formData.photos.filter(photo =>
        photo.url && !photo.base64 // Existing photos have URL but no base64
      );
      const newPhotos = formData.photos.filter(photo =>
        photo.base64 || photo.uri?.startsWith('data:') // New photos have base64 or data URI
      );

      addDebugInfo(`Existing photos: ${existingPhotos.length}, New photos: ${newPhotos.length}`);

      if (newPhotos.length > 0) {
        addDebugInfo('Uploading new photos...');

        // If user has existing photos, add to them; otherwise replace all
        const hasExistingPhotos = existingPhotos.length > 0;
        const photoResponse = hasExistingPhotos
          ? await userService.addPhotos(newPhotos)
          : await userService.uploadPhotos(newPhotos);

        uploadedPhotos = photoResponse.photos;
        addDebugInfo(`Photos ${hasExistingPhotos ? 'added' : 'uploaded'}: ${uploadedPhotos.length} total photos`);
      } else if (existingPhotos.length > 0) {
        // Only existing photos, no new uploads needed
        uploadedPhotos = existingPhotos;
        addDebugInfo(`Keeping existing photos: ${uploadedPhotos.length} photos`);
      }

      const updatedUser = {
        ...user,
        ...formData,
        age: parseInt(formData.age),
        location: formData.location,
        photos: uploadedPhotos
      };

      addDebugInfo('=== SAVE COMPLETED ===');

      // Update user state
      addDebugInfo('Calling updateUser...');
      await updateUser(updatedUser);
      addDebugInfo('updateUser completed');

      // Reset loading state
      setLoading(false);

      // Navigate back after a brief delay to ensure state updates propagate
      addDebugInfo('Scheduling navigation...');
      requestAnimationFrame(() => {
        addDebugInfo('=== ATTEMPTING NAVIGATION ===');
        addDebugInfo(`Navigation exists: ${!!navigation}`);
        addDebugInfo(`Available methods: ${navigation ? Object.keys(navigation).join(', ') : 'none'}`);

        let navigationSuccessful = false;

        try {
          // Force navigation to MainTabs instead of just going back
          // This ensures we don't get caught in the ProfileSetup redirect logic
          if (navigation && navigation.navigate) {
            addDebugInfo('Using navigate to MainTabs');
            navigation.navigate('MainTabs', { screen: 'Profile' });
            addDebugInfo('navigate() to MainTabs called successfully');
            navigationSuccessful = true;
          } else if (navigation && navigation.reset) {
            addDebugInfo('Using navigation reset to MainTabs');
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs', params: { screen: 'Profile' } }],
            });
            addDebugInfo('reset() called successfully');
            navigationSuccessful = true;
          } else if (navigation && navigation.goBack) {
            addDebugInfo('Fallback: Using goBack()');
            navigation.goBack();
            addDebugInfo('goBack() called successfully');
            navigationSuccessful = true;
          } else {
            addDebugInfo('Navigation not available!');
          }
        } catch (navError) {
          addDebugInfo(`Navigation error: ${navError.message}`);
        }

        if (!navigationSuccessful) {
          addDebugInfo('NAVIGATION FAILED - staying on current screen');
        }
      });

    } catch (error) {
      addDebugInfo('=== SAVE ERROR ===');
      addDebugInfo(`Error: ${error.message}`);
      console.warn('=== SAVE ERROR ===');
      console.warn('Error:', error);
      Alert.alert('Error', error.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>

          {debugInfo ? (
            <View style={styles.debugPanel}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <ScrollView style={styles.debugScroll} showsVerticalScrollIndicator={true}>
                <Text style={styles.debugText}>{debugInfo}</Text>
              </ScrollView>
            </View>
          ) : null}

          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Let others get to know you</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <TextInput
            style={styles.input}
            placeholder="Display Name *"
            placeholderTextColor="#666"
            value={formData.displayName}
            onChangeText={(value) => handleInputChange('displayName', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Age *"
            placeholderTextColor="#666"
            value={formData.age}
            onChangeText={(value) => handleInputChange('age', value)}
            keyboardType="numeric"
          />

          <View style={styles.genderSection}>
            <Text style={styles.inputLabel}>Gender *</Text>
            <View style={styles.genderButtons}>
              {['male', 'female', 'other'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderButton,
                    formData.gender === gender && styles.genderButtonSelected
                  ]}
                  onPress={() => handleInputChange('gender', gender)}
                >
                  <Text style={[
                    styles.genderButtonText,
                    formData.gender === gender && styles.genderButtonTextSelected
                  ]}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Bio (140 characters max)"
            placeholderTextColor="#666"
            value={formData.bio}
            onChangeText={(value) => handleInputChange('bio', value)}
            multiline
            maxLength={140}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleLocationUpdate}
            disabled={locationLoading}
          >
            <Text style={styles.locationButtonText}>
              {locationLoading
                ? 'Getting Location...'
                : formData.location.city || 'Set Location *'
              }
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Matching Preferences</Text>

          <View style={styles.preferenceSection}>
            <Text style={styles.inputLabel}>I want to match with</Text>
            <View style={styles.genderButtons}>
              {[{ key: 'male', label: 'Men' }, { key: 'female', label: 'Women' }, { key: 'both', label: 'Everyone' }].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.genderButton,
                    formData.preferences.gender === option.key && styles.genderButtonSelected
                  ]}
                  onPress={() => handleInputChange('preferences', { ...formData.preferences, gender: option.key })}
                >
                  <Text style={[
                    styles.genderButtonText,
                    formData.preferences.gender === option.key && styles.genderButtonTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.ageRangeSection}>
            <Text style={styles.inputLabel}>Age Range: {formData.preferences.ageMin} - {formData.preferences.ageMax}</Text>
            <View style={styles.ageInputs}>
              <TextInput
                style={[styles.input, styles.ageInput]}
                placeholder="Min"
                placeholderTextColor="#666"
                value={formData.preferences.ageMin.toString()}
                onChangeText={(value) => {
                  const age = parseInt(value) || 18;
                  handleInputChange('preferences', { ...formData.preferences, ageMin: age });
                }}
                keyboardType="numeric"
              />
              <Text style={styles.ageRangeSeparator}>to</Text>
              <TextInput
                style={[styles.input, styles.ageInput]}
                placeholder="Max"
                placeholderTextColor="#666"
                value={formData.preferences.ageMax.toString()}
                onChangeText={(value) => {
                  const age = parseInt(value) || 50;
                  handleInputChange('preferences', { ...formData.preferences, ageMax: age });
                }}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.distanceSection}>
            <Text style={styles.inputLabel}>Max Distance: {formData.preferences.maxDistance} km</Text>
            <TextInput
              style={styles.input}
              placeholder="Maximum distance in km"
              placeholderTextColor="#666"
              value={formData.preferences.maxDistance.toString()}
              onChangeText={(value) => {
                const distance = parseInt(value) || 50;
                handleInputChange('preferences', { ...formData.preferences, maxDistance: distance });
              }}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos (Optional, up to 3)</Text>
          <View style={styles.photosContainer}>
            {formData.photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={getImageSource(photo)} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Text style={styles.removePhotoText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {formData.photos.length < 3 && (
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                <Text style={styles.addPhotoText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <ConversationHelpersSetup
            onUpdate={handleConversationHelpersUpdate}
            initialData={formData.conversationHelpers}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Profile'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  input: {
    height: 56,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  locationButton: {
    height: 56,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  locationButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4458',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 32,
    color: '#666',
  },
  genderSection: {
    marginBottom: 16,
  },
  preferenceSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '500',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  genderButtonSelected: {
    backgroundColor: '#ff4458',
    borderColor: '#ff4458',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  genderButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  ageRangeSection: {
    marginBottom: 20,
  },
  ageInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ageInput: {
    flex: 1,
    marginBottom: 0,
  },
  ageRangeSeparator: {
    color: '#666',
    fontSize: 16,
  },
  distanceSection: {
    marginBottom: 16,
  },
  saveButton: {
    height: 56,
    backgroundColor: '#ff4458',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  debugPanel: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    maxHeight: 150,
  },
  debugTitle: {
    color: '#ff4458',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugScroll: {
    maxHeight: 100,
  },
  debugText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 12,
  },
});

export default ProfileSetupScreen;