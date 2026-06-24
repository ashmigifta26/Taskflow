import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useThemeStore, { getThemeColors } from '../store/useThemeStore';

// Color variant configs for the retro stat cards
const CARD_VARIANTS = {
  sage: {
    bg: ['#A3BCA9', '#8FA89B'],
    darkBg: ['#5C7A65', '#4A6B55'],
    text: '#FFFFFF',
    subText: 'rgba(255,255,255,0.75)',
  },
  terracotta: {
    bg: ['#D4A5A3', '#C28C8A'],
    darkBg: ['#8B5E5C', '#7A4F4D'],
    text: '#FFFFFF',
    subText: 'rgba(255,255,255,0.75)',
  },
  sand: {
    bg: ['#F0E4D0', '#EADEC9'],
    darkBg: ['#6B5F4E', '#5A503F'],
    text: '#3D5166',
    subText: '#7A8C9E',
    darkText: '#FAF6EE',
    darkSubText: 'rgba(250,246,238,0.7)',
  },
  slate: {
    bg: ['#7A97B2', '#5F7995'],
    darkBg: ['#4E6782', '#3D5672'],
    text: '#FFFFFF',
    subText: 'rgba(255,255,255,0.75)',
  },
};

export default function StatCard({ label, value, icon, color, variant = 'sage', style, details }) {
  const { isDarkMode } = useThemeStore();
  const theme = getThemeColors(isDarkMode);
  const v = CARD_VARIANTS[variant] || CARD_VARIANTS.sage;

  const gradientColors = isDarkMode ? v.darkBg : v.bg;
  const textColor = isDarkMode ? (v.darkText || v.text) : v.text;
  const subTextColor = isDarkMode ? (v.darkSubText || v.subText) : v.subText;
  
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={[styles.label, { color: subTextColor }]}>{label}</Text>
        </View>
        <Text style={[styles.value, { color: textColor }]}>{value}</Text>
      </View>
      {details && details.length > 0 && (
        <View style={styles.detailsContainer}>
          {details.map((d, i) => (
            <Text key={i} style={[styles.detailText, { color: subTextColor }]}>{d}</Text>
          ))}
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 5,
    minHeight: 100,
    shadowColor: 'rgba(0,0,0,0.12)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  labelRow: {
    flex: 1,
    flexDirection: 'column',
  },
  icon: {
    fontSize: 22,
    marginBottom: 4,
  },
  value: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  detailsContainer: {
    marginTop: 2,
  },
  detailText: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 1,
  },
});
