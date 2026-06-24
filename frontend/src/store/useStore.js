import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import api from '../api/apiClient';
import * as Notifications from 'expo-notifications';
export const useStore = create(devtools(persist((set, get) => ({
  user: null, // { token, email }
  reminders: [],
  loading: false,
  error: null,
  expoPushToken: null,
  isDarkMode: false,

  // Auth actions
  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      set({ user: data, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },
  register: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/register', { email, password });
      set({ user: data, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },
  guestLogin: () => {
    const guestToken = 'guest-token-placeholder';
    set({ user: { token: guestToken, email: 'guest' } });
    // Register for push notifications on guest login
    get().registerForPushNotificationsAsync();
  },
  logout: () => set({ user: null, reminders: [], expoPushToken: null }),

  // Reminder actions
  fetchReminders: async () => {
    if (!get().user) return;
    set({ loading: true });
    try {
      const { data } = await api.get('/reminders', {
        headers: { Authorization: `Bearer ${get().user?.token}` },
      });
      set({ reminders: data, loading: false });
      // Register for push notifications after fetching data
      get().registerForPushNotificationsAsync();
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },
  addReminder: async (reminder) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/reminders', reminder, {
        headers: { Authorization: `Bearer ${get().user?.token}` },
      });
      // Schedule a local notification for the reminder
      await get().scheduleReminderNotification(data);
      set(state => ({ reminders: [data, ...state.reminders], loading: false }));
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },
  updateReminder: async (id, updates) => {
    set({ loading: true });
    try {
      const { data } = await api.put(`/reminders/${id}`, updates, {
        headers: { Authorization: `Bearer ${get().user?.token}` },
      });
      // Cancel any existing scheduled notification and reschedule with new data
      await get().cancelScheduledNotification(id);
      await get().scheduleReminderNotification(data);
      set(state => ({
        reminders: state.reminders.map(r => (r.id === id ? data : r)),
        loading: false,
      }));
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },
  deleteReminder: async (id) => {
    set({ loading: true });
    try {
      await api.delete(`/reminders/${id}`, {
        headers: { Authorization: `Bearer ${get().user?.token}` },
      });
      // Cancel any scheduled notification for this reminder
      await get().cancelScheduledNotification(id);
      set(state => ({ reminders: state.reminders.filter(r => r.id !== id), loading: false }));
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },
  toggleComplete: async (id, completed) => {
    await get().updateReminder(id, { completed });
  },
  toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode })),
  // Notification helpers
  registerForPushNotificationsAsync: async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      set({ error: 'Failed to get push token permissions!' });
      return;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    set({ expoPushToken: token });
  },
  sendTestNotification: async () => {
    if (!get().expoPushToken) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This is a test push notification from TaskFlow.',
      },
      trigger: null,
    });
  },
  scheduleReminderNotification: async (reminder) => {
    if (!reminder.due_date) return;
    const trigger = new Date(reminder.due_date);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title || 'Reminder',
        body: reminder.description || '',
        data: { reminderId: reminder.id },
      },
      trigger,
    });
  },
  cancelScheduledNotification: async (reminderId) => {
    // Expo Notifications does not provide direct ID cancellation without storing identifiers.
    // For simplicity, we clear all pending notifications and rely on fetch to reschedule remaining.
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
})), {
  name: 'taskflow-storage',
});
