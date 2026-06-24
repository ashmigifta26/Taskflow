import { DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { configureFonts, DefaultTheme as PaperDefaultTheme, DarkTheme as PaperDarkTheme } from 'react-native-paper';

const fontConfig = {
  default: {
    regular: { fontFamily: 'Inter', fontWeight: 'normal' },
    medium: { fontFamily: 'Inter', fontWeight: '500' },
    light: { fontFamily: 'Inter', fontWeight: '300' },
    thin: { fontFamily: 'Inter', fontWeight: '200' },
  },
};

export const LightTheme = {
  ...NavigationDefaultTheme,
  ...PaperDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    ...PaperDefaultTheme.colors,
    primary: '#2563EB',
    background: '#FFFFFF',
    surface: '#F5F7FA',
    text: '#111827',
    secondaryText: '#6B7280',
    success: '#10B981', // green for done
    danger: '#EF4444',   // red for high priority
    warning: '#F59E0B', // yellow for medium priority
  },
  fonts: configureFonts(fontConfig),
};

export const DarkTheme = {
  ...NavigationDarkTheme,
  ...PaperDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    ...PaperDarkTheme.colors,
    primary: '#2563EB',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    secondaryText: '#9CA3AF',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
  },
  fonts: configureFonts(fontConfig),
};
