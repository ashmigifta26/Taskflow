import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

const CHANNEL_ID = 'taskflow-reminders';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Ensures the Android notification channel exists.
 * Safe to call multiple times.
 */
const ensureChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'TaskFlow Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
    });
  }
};

/**
 * Request notification permissions. Returns true if granted.
 */
export const requestNotificationPermissions = async () => {
  if (!Device.isDevice) {
    // Simulator/emulator — permissions not required for local notifications
    return true;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    });
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Permission not granted.');
    return false;
  }

  await ensureChannel();
  return true;
};

/**
 * Schedule a local notification for a task's due date/time.
 * Returns the notification identifier (used to cancel later).
 */
export const scheduleTaskReminder = async (task) => {
  if (!task.due_date) {
    console.log('[Notifications] Skipping scheduling: No due date');
    return null;
  }

  try {
    await ensureChannel();

    const dateStr = task.due_date;
    const now = new Date();

    // If no due time provided, default to 1 hour from now if today, else 9 AM
    let hour = 9;
    let minute = 0;

    if (task.due_time) {
      [hour, minute] = task.due_time.split(':').map(Number);
    } else {
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (dateStr === todayStr) {
        hour = now.getHours() + 1;
        minute = now.getMinutes();
      }
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    const triggerDate = new Date(year, month - 1, day, hour, minute, 0);

    console.log(`[Notifications] Attempting to schedule notification for: ${triggerDate.toLocaleString()}`);

    if (triggerDate <= now) {
      console.log('[Notifications] Skipping scheduling: Time is in the past');
      return null;
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Task Reminder',
        body: task.title,
        data: { taskId: task.id },
        priority: Notifications.AndroidNotificationPriority.HIGH,
        // No `sound` field — avoids "custom sound not found" error since no
        // sound file is bundled. The channel's default sound plays instead.
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: CHANNEL_ID, // Required on Android
      },
    });

    console.log(`[Notifications] Successfully scheduled with ID: ${identifier}`);
    return identifier;
  } catch (error) {
    console.error('[Notifications] Failed to schedule reminder:', error);
    return null;
  }
};

/**
 * Cancel a scheduled notification by its identifier.
 */
export const cancelTaskReminder = async (notificationId) => {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('[Notifications] Failed to cancel reminder:', error);
  }
};

/**
 * Cancel ALL scheduled notifications.
 */
export const cancelAllReminders = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[Notifications] Failed to cancel all reminders:', error);
  }
};

/**
 * Schedule a daily summary notification at 8 AM.
 */
export const scheduleDailySummary = async (pendingCount) => {
  try {
    await ensureChannel();

    // Cancel any existing daily summary first
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content?.data?.type === 'daily_summary') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📋 Good morning!',
        body: `You have ${pendingCount} pending task${pendingCount !== 1 ? 's' : ''} today.`,
        data: { type: 'daily_summary' },
        priority: Notifications.AndroidNotificationPriority.HIGH,
        // No `sound` field — channel default sound plays instead
      },
      trigger: {
        type: 'daily', // Correct string value for expo-notifications ~56.x
        hour: 8,
        minute: 0,
        channelId: CHANNEL_ID, // Required on Android
      },
    });

    console.log('[Notifications] Daily summary scheduled at 8:00 AM');
  } catch (error) {
    console.error('[Notifications] Failed to schedule daily summary:', error);
  }
};
