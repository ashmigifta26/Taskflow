import { create } from 'zustand';
import taskService from '../services/taskService';

const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,

  fetchTasks: async (category = null, isCompleted = null) => {
    set({ isLoading: true });
    try {
      const data = await taskService.getTasks(category, isCompleted);
      set({ tasks: data, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  addTask: async (taskData) => {
    try {
      const newTask = await taskService.createTask(taskData);
      set((state) => ({ tasks: [...state.tasks, newTask] }));
      return newTask;
    } catch (e) {
      console.warn('addTask error');
      throw e;
    }
  },

  updateTask: async (taskId, taskData) => {
    try {
      const updated = await taskService.updateTask(taskId, taskData);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updated : t)),
      }));
      return updated;
    } catch (e) {
      console.warn('updateTask error');
      throw e;
    }
  },

  toggleComplete: async (taskId, isCompleted) => {
    try {
      const updated = await taskService.toggleComplete(taskId, isCompleted);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? updated : t)),
      }));
    } catch (e) {
      console.warn('toggleComplete error');
    }
  },

  deleteTask: async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
      }));
    } catch (e) {
      console.warn('deleteTask error');
    }
  },
}));

export default useTaskStore;
