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
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import ConversationHelpersSetup from '../components/ConversationHelpersSetup';

const ProfileSetupScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    age: user?.age?.toString() || '',
    bio: user?.bio || '',
    location: user?.location || { city: '', coordinates: null },
    photos: user?.photos || [],
    conversationHelpers: user?.conversationHelpers || {
      iceBreakerAnswers: [],
      wouldYouRatherAnswers: [],
      twoTruthsOneLie: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

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
    });

    if (!result.canceled) {
      const newPhoto = {
        uri: result.assets[0].uri,
        type: result.assets[0].type,
        fileName: result.assets[0].fileName || `photo_${Date.now()}.jpg`,
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

  const handleSave = async () => {
    console.log('Save button pressed!');
    console.log('FormData:', formData);

    if (!formData.displayName || !formData.age) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    if (!formData.location.city) {
      Alert.alert('Error', 'Please set your location');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting profile save...');

      const profileData = {
        displayName: formData.displayName,
        age: parseInt(formData.age),
        bio: formData.bio,
        conversationHelpers: formData.conversationHelpers,
      };

      await userService.updateProfile(profileData);

      if (formData.location.coordinates) {
        await userService.updateLocation({
          city: formData.location.city,
          lat: formData.location.coordinates.lat,
          lng: formData.location.coordinates.lng
        });
      }

      let uploadedPhotos = user?.photos || [];
      if (formData.photos.length > 0) {
        const photoResponse = await userService.uploadPhotos(formData.photos);
        uploadedPhotos = photoResponse.photos;
        console.log('Photos uploaded:', uploadedPhotos);
      }

      const updatedUser = {
        ...user,
        ...formData,
        age: parseInt(formData.age),
        location: formData.location,
        photos: uploadedPhotos
      };

      updateUser(updatedUser);
      console.log('Profile save completed successfully!');
    } catch (error) {
      console.log('Profile save error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
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
          <Text style={styles.sectionTitle}>Photos (Optional, up to 3)</Text>
          <View style={styles.photosContainer}>
            {formData.photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: photo.uri }} style={styles.photo} />
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
});

export default ProfileSetupScreen;