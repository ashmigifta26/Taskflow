import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import useThemeStore, { getThemeColors } from '../store/useThemeStore';

export default function CustomButton({
  title,
  onPress,
  style,
  textStyle,
  type = 'primary',
  disabled = false,
  loading = false,
  icon,
  size = 'normal',
}) {
  const { isDarkMode } = useThemeStore();
  const theme = getThemeColors(isDarkMode);

  // Dynamic overrides for different types based on our premium theme
  const getDynamicStyles = () => {
    switch (type) {
      case 'primary':
        return {
          backgroundColor: theme.primary,
          shadowColor: theme.primary,
        };
      case 'secondary':
        return {
          backgroundColor: theme.surfaceAlt,
          borderWidth: 1.5,
          borderColor: theme.border,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: theme.primary,
        };
      case 'danger':
        return {
          backgroundColor: theme.terracotta,
          shadowColor: theme.terracotta,
        };
      case 'ghost':
        return {
          backgroundColor: isDarkMode ? 'rgba(143, 168, 155, 0.15)' : 'rgba(95, 121, 149, 0.15)',
        };
      case 'accent':
        return {
          backgroundColor: theme.accent,
          shadowColor: theme.accent,
        };
      case 'success':
        return {
          backgroundColor: theme.sage,
        };
      default:
        return {};
    }
  };

  const getDynamicTextColor = () => {
    switch (type) {
      case 'primary':
      case 'danger':
      case 'success':
        return '#FFFFFF';
      case 'secondary':
        return theme.text;
      case 'outline':
        return theme.primary;
      case 'ghost':
        return theme.primary;
      case 'accent':
        return isDarkMode ? '#FAF6EE' : '#3D5166';
      default:
        return theme.text;
    }
  };

  const buttonStyles = [
    styles.button,
    getDynamicStyles(),
    size === 'small' && styles.small,
    size === 'large' && styles.large,
    disabled && styles.disabled,
    style,
  ];

  const textColor = getDynamicTextColor();
  const textStyles = [
    styles.text,
    { color: textColor },
    size === 'small' && styles.smallText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          color={textColor}
          size="small"
        />
      ) : (
        <View style={styles.inner}>
          {icon && <Text style={[styles.icon, { color: textColor }]}>{icon}</Text>}
          <Text style={textStyles}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginVertical: 5,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 36,
    borderRadius: 10,
    marginVertical: 2,
  },
  large: {
    paddingVertical: 18,
    minHeight: 58,
    borderRadius: 16,
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  smallText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
