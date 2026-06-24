import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = '@taskflow_tasks';
const LAST_SYNC_KEY = '@taskflow_last_sync';

/**
 * Save all tasks to local storage (for offline support)
 */
export const saveTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch (error) {
    console.error('[Storage] Failed to save tasks:', error);
  }
};

/**
 * Load all tasks from local storage
 */
export const loadTasks = async () => {
  try {
    const data = await AsyncStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[Storage] Failed to load tasks:', error);
    return [];
  }
};

/**
 * Save or update a single task in local cache
 */
export const saveTask = async (task) => {
  try {
    const tasks = await loadTasks();
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      tasks[idx] = task;
    } else {
      tasks.push(task);
    }
    await saveTasks(tasks);
  } catch (error) {
    console.error('[Storage] Failed to save task:', error);
  }
};

/**
 * Remove a task from local cache by ID
 */
export const removeTask = async (taskId) => {
  try {
    const tasks = await loadTasks();
    const updated = tasks.filter((t) => t.id !== taskId);
    await saveTasks(updated);
  } catch (error) {
    console.error('[Storage] Failed to remove task:', error);
  }
};

/**
 * Get last sync timestamp
 */
export const getLastSync = async () => {
  try {
    return await AsyncStorage.getItem(LAST_SYNC_KEY);
  } catch {
    return null;
  }
};

/**
 * Clear all cached data
 */
export const clearStorage = async () => {
  try {
    await AsyncStorage.multiRemove([TASKS_KEY, LAST_SYNC_KEY]);
  } catch (error) {
    console.error('[Storage] Failed to clear storage:', error);
  }
};
