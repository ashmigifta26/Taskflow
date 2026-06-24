import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore, { getThemeColors } from '../store/useThemeStore';

export default function EmptyState({ icon, title, subtitle, buttonText, onButtonPress }) {
  const { isDarkMode } = useThemeStore();
  const theme = getThemeColors(isDarkMode);

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      {buttonText && onButtonPress && (
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]} 
          onPress={onButtonPress}
          activeOpacity={0.8}
        >
          <Ionicons name="add-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 36,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  icon: {
    fontSize: 42,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
