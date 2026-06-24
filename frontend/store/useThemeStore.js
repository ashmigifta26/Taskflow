import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useThemeStore = create((set) => ({
  isDarkMode: false,
  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@pref_dark');
      if (savedTheme !== null) {
        set({ isDarkMode: savedTheme === 'true' });
      }
    } catch (e) {
      console.warn('Failed to load theme preference');
    }
  },
  toggleTheme: async (value) => {
    try {
      await AsyncStorage.setItem('@pref_dark', value.toString());
      set({ isDarkMode: value });
    } catch (e) {
      console.warn('Failed to save theme preference');
    }
  }
}));

export const getThemeColors = (isDarkMode) => {
  return isDarkMode ? {
    // Dark Vintage
    background: '#1F2421',
    surface: '#2D3531',
    surfaceAlt: '#3A4540',
    text: '#FAF6EE',
    textSecondary: '#A3BCA9',
    border: '#4A5B52',
    primary: '#8FA89B',
    primaryDark: '#6B8B7A',
    accent: '#C28C8A',
    accentAlt: '#EADEC9',
    sage: '#5C7A65',
    terracotta: '#8B5E5C',
    sand: '#6B5F4E',
    slate: '#4E6782',
    cardShadow: 'rgba(0,0,0,0.4)',
    tabBar: '#2D3531',
    tabBarBorder: '#3A4540',
    progressTrack: '#3A4540',
    progressFill: '#8FA89B',
    quoteBackground: 'rgba(143, 168, 155, 0.12)',
    quoteBorder: 'rgba(143, 168, 155, 0.25)',
  } : {
    // Light Vintage / Warm Pastel
    background: '#FAF6EE',
    surface: '#FFFFFF',
    surfaceAlt: '#F5F0E8',
    text: '#3D5166',
    textSecondary: '#7A8C9E',
    border: '#EADEC9',
    primary: '#5F7995',
    primaryDark: '#4E6782',
    accent: '#C28C8A',
    accentAlt: '#EADEC9',
    sage: '#8FA89B',
    terracotta: '#C28C8A',
    sand: '#EADEC9',
    slate: '#5F7995',
    cardShadow: 'rgba(95, 121, 149, 0.08)',
    tabBar: '#FFFFFF',
    tabBarBorder: '#EADEC9',
    progressTrack: '#EADEC9',
    progressFill: '#8FA89B',
    quoteBackground: 'rgba(95, 121, 149, 0.06)',
    quoteBorder: 'rgba(95, 121, 149, 0.15)',
  };
};

export default useThemeStore;
