import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { requestNotificationPermissions, scheduleDailySummary } from './services/notifications';
import api from './services/api';
import taskService from './services/taskService';
import useAuthStore from './store/useAuthStore';
import useThemeStore, { getThemeColors } from './store/useThemeStore';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import AddTaskScreen from './screens/AddTaskScreen';
import TaskListScreen from './screens/TaskListScreen';
import TaskDetailsScreen from './screens/TaskDetailsScreen';
import EditTaskScreen from './screens/EditTaskScreen';
import AddReminderScreen from './screens/AddReminderScreen';
import NotificationScreen from './screens/NotificationScreen';
import ProfileScreen from './screens/ProfileScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import CalendarScreen from './screens/CalendarScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  const { isDarkMode } = useThemeStore();
  const theme = getThemeColors(isDarkMode);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'CalendarTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'TasksTab') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopWidth: 1,
          borderTopColor: theme.tabBarBorder,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="CalendarTab" component={CalendarScreen} options={{ title: 'Calendar' }} />
      <Tab.Screen name="TasksTab" component={TaskListScreen} options={{ title: 'Tasks' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const { token, restore } = useAuthStore();
  const { isDarkMode, loadTheme } = useThemeStore();
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadTheme();
      await restore(); // Reload saved token/user → auto-login
      setIsRestoring(false);
    };
    init();
  }, []);

  // Request notification permissions and schedule daily summary on app launch
  useEffect(() => {
    const initNotifications = async () => {
      if (!token) return; // Only if logged in
      try {
        const granted = await requestNotificationPermissions();
        if (granted) {
          try {
            const allTasks = await taskService.getTasks();
            const pendingCount = allTasks.filter(t => t.status !== 'Completed').length;
            await scheduleDailySummary(pendingCount);
          } catch (fetchErr) {
            await scheduleDailySummary(0);
          }
        }
      } catch (error) {
        console.warn('[App] Notification init error:', error);
      }
    };
    initNotifications();
  }, [token]);

  if (isRestoring) {
    // Show a blank screen while restoring session (prevents Login flash)
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {token ? (
              // Authenticated Stack
              <>
                <Stack.Screen name="Main" component={MainTabNavigator} />
                <Stack.Screen name="AddTask" component={AddTaskScreen} />
                <Stack.Screen name="TaskList" component={TaskListScreen} />
                <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
                <Stack.Screen name="EditTask" component={EditTaskScreen} />
                <Stack.Screen name="AddReminder" component={AddReminderScreen} />
                <Stack.Screen name="Notifications" component={NotificationScreen} />
                <Stack.Screen name="Analytics" component={AnalyticsScreen} />
                <Stack.Screen name="Calendar" component={CalendarScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
              </>
            ) : (
              // Unauthenticated Stack
              <Stack.Screen name="Login" component={LoginScreen} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}