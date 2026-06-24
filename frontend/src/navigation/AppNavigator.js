import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { LightTheme, DarkTheme as CustomDarkTheme } from '../theme/theme';
import { useStore } from '../store/useStore';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateReminderScreen from '../screens/CreateReminderScreen';
import ReminderDetailScreen from '../screens/ReminderDetailScreen';
import CalendarScreen from '../screens/CalendarScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isDarkMode } = useStore();
  const theme = isDarkMode ? CustomDarkTheme : LightTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} />
          {user ? (
            <> 
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="CreateReminder" component={CreateReminderScreen} />
              <Stack.Screen name="ReminderDetail" component={ReminderDetailScreen} />
              <Stack.Screen name="Calendar" component={CalendarScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
