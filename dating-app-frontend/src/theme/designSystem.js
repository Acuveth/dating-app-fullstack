// Modern Design System for Dating App

export const Colors = {
  // Primary Brand Colors
  primary: {
    main: '#FF6B6B',      // Vibrant coral-red
    light: '#FF8E8E',     // Lighter variant
    dark: '#FF4444',      // Darker variant
    gradient: ['#FF6B6B', '#FF8E8E'], // Gradient variants
  },

  // Secondary Colors
  secondary: {
    main: '#4ECDC4',      // Teal accent
    light: '#7EDDD6',     // Light teal
    dark: '#3CBAB1',      // Dark teal
  },

  // Neutral Colors (Modern dark theme)
  neutral: {
    900: '#0A0A0A',       // Pure black
    800: '#121212',       // Near black
    700: '#1E1E1E',       // Dark gray
    600: '#2A2A2A',       // Medium dark
    500: '#404040',       // Medium gray
    400: '#666666',       // Light gray
    300: '#888888',       // Lighter gray
    200: '#AAAAAA',       // Very light gray
    100: '#E5E5E5',       // Almost white
    50: '#FFFFFF',        // Pure white
  },

  // Status Colors
  status: {
    success: '#10B981',   // Green
    warning: '#F59E0B',   // Amber
    error: '#EF4444',     // Red
    info: '#3B82F6',      // Blue
  },

  // Overlay Colors
  overlay: {
    dark: 'rgba(0, 0, 0, 0.8)',
    medium: 'rgba(0, 0, 0, 0.6)',
    light: 'rgba(0, 0, 0, 0.4)',
    blur: 'rgba(0, 0, 0, 0.95)',
  }
};

export const Typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 48,
  },

  // Font weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 24,
  }
};

// Component styles for consistency
export const Components = {
  // Button variants
  button: {
    primary: {
      backgroundColor: Colors.primary.main,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.base,
      paddingHorizontal: Spacing.xl,
      ...Shadows.md,
    },
    secondary: {
      backgroundColor: Colors.neutral[600],
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.base,
      paddingHorizontal: Spacing.xl,
      borderWidth: 1,
      borderColor: Colors.neutral[500],
    },
    ghost: {
      backgroundColor: 'transparent',
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.base,
      paddingHorizontal: Spacing.xl,
      borderWidth: 1,
      borderColor: Colors.primary.main,
    }
  },

  // Input styles
  input: {
    backgroundColor: Colors.neutral[700],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.neutral[600],
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[50],
  },

  // Card styles
  card: {
    backgroundColor: Colors.neutral[700],
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.md,
  },

  // Modal styles
  modal: {
    backgroundColor: Colors.neutral[800],
    borderRadius: BorderRadius.xl,
    ...Shadows.xl,
  }
};

// Animation durations
export const Animation = {
  fast: 150,
  normal: 250,
  slow: 350,
  spring: {
    damping: 15,
    stiffness: 150,
  }
};