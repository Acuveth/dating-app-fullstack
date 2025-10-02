import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';
import { testRegistration, testHealth } from '../utils/apiTest';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Components } from '../theme/designSystem';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    age: '',
    gender: 'other',
    bio: '',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTestApi = async () => {
    try {
      setLoading(true);
      await testHealth();
      const result = await testRegistration();
      Alert.alert('API Test Success', 'Backend connection is working!');
    } catch (error) {
      Alert.alert('API Test Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const { email, password, confirmPassword, displayName, age, gender } = formData;

    if (!email || !password || !displayName || !age || !gender) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (parseInt(age) < 18) {
      Alert.alert('Error', 'You must be at least 18 years old');
      return;
    }

    try {
      setLoading(true);
      const response = await register({
        ...formData,
        age: parseInt(age),
      });

      // Don't manually navigate - let AuthContext handle navigation
      // User is now authenticated and will be redirected automatically
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.brandContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoIcon}>💕</Text>
              </View>
              <Text style={styles.brandName}>Join ConnectLive</Text>
              <Text style={styles.brandTagline}>Create your profile and start connecting</Text>
            </View>
          </View>

          {/* Registration Form */}
          <View style={styles.formContainer}>
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Create Your Account</Text>
                <Text style={styles.formSubtitle}>Fill in your details to get started</Text>
              </View>

              {/* Personal Information Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Personal Information</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.neutral[400]}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Display Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="What should people call you?"
                    placeholderTextColor={Colors.neutral[400]}
                    value={formData.displayName}
                    onChangeText={(value) => handleInputChange('displayName', value)}
                    autoComplete="name"
                  />
                </View>

                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Age</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Age"
                      placeholderTextColor={Colors.neutral[400]}
                      value={formData.age}
                      onChangeText={(value) => handleInputChange('age', value)}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1, marginLeft: Spacing.base }]}>
                    <Text style={styles.inputLabel}>Gender</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={formData.gender}
                        onValueChange={(value) => handleInputChange('gender', value)}
                        style={styles.picker}
                        dropdownIconColor={Colors.neutral[300]}
                      >
                        <Picker.Item label="Select" value="" color={Colors.neutral[400]} />
                        <Picker.Item label="Male" value="male" color={Colors.neutral[50]} />
                        <Picker.Item label="Female" value="female" color={Colors.neutral[50]} />
                        <Picker.Item label="Other" value="other" color={Colors.neutral[50]} />
                      </Picker>
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bio (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.bioInput]}
                    placeholder="Tell people a bit about yourself..."
                    placeholderTextColor={Colors.neutral[400]}
                    value={formData.bio}
                    onChangeText={(value) => handleInputChange('bio', value)}
                    multiline
                    maxLength={140}
                    textAlignVertical="top"
                  />
                  <Text style={styles.characterCount}>{formData.bio.length}/140</Text>
                </View>
              </View>

              {/* Security Section */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Security</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Create a strong password"
                    placeholderTextColor={Colors.neutral[400]}
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry
                    autoComplete="new-password"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter your password"
                    placeholderTextColor={Colors.neutral[400]}
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    secureTextEntry
                    autoComplete="new-password"
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                  {loading && <Text style={styles.loadingIcon}>⏳</Text>}
                </TouchableOpacity>

                {/* Development only - Test button */}
                {__DEV__ && (
                  <TouchableOpacity
                    style={[styles.testButton, loading && styles.buttonDisabled]}
                    onPress={handleTestApi}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.testButtonText}>Test Backend</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Sign In Link */}
            <View style={styles.signInSection}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[900],
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing['2xl'],
  },

  // Header Section
  headerSection: {
    paddingTop: Spacing['5xl'], // Increased for iPhone safe area
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  logoIcon: {
    fontSize: Typography.fontSize['3xl'],
  },
  brandName: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[300],
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },

  // Form Section
  formContainer: {
    paddingHorizontal: Spacing.lg,
  },
  formCard: {
    backgroundColor: Colors.neutral[800],
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  formHeader: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  formTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[50],
    marginBottom: Spacing.sm,
  },
  formSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[300],
    textAlign: 'center',
  },

  // Section Styles
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary.main,
    marginBottom: Spacing.lg,
  },

  // Input Styles
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral[200],
    marginBottom: Spacing.sm,
  },
  input: {
    ...Components.input,
    height: 52,
    fontSize: Typography.fontSize.base,
  },
  bioInput: {
    height: 100,
    paddingTop: Spacing.base,
  },
  characterCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[400],
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: Colors.neutral[700],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[600],
  },
  picker: {
    color: Colors.neutral[50],
    height: 52,
  },

  // Button Styles
  buttonContainer: {
    gap: Spacing.base,
  },
  primaryButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[50],
  },
  loadingIcon: {
    fontSize: Typography.fontSize.base,
  },
  testButton: {
    backgroundColor: Colors.neutral[700],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[600],
  },
  testButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral[300],
  },

  // Sign In Section
  signInSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  signInText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[300],
  },
  signInLink: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default RegisterScreen;