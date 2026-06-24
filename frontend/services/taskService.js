import api from './api';

const taskService = {
  getTasks: async (category = null, isCompleted = null) => {
    try {
      const response = await api.get('/tasks/');
      let tasks = response.data;
      if (category) {
        tasks = tasks.filter(t => t.category === category);
      }
      if (isCompleted !== null) {
        const status = isCompleted ? 'Completed' : 'Pending';
        tasks = tasks.filter(t => t.status === status);
      }
      return tasks;
    } catch (e) {
      console.warn("Error fetching tasks from API");
      return [];
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks/', taskData);
      return response.data;
    } catch (e) {
      console.warn("Error creating task API");
      throw e;
    }
  },

  updateTask: async (taskId, taskData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (e) {
      console.warn("Error updating task API");
      throw e;
    }
  },

  deleteTask: async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (e) {
      console.warn("Error deleting task API");
      throw e;
    }
  },

  toggleComplete: async (taskId, isCompleted) => {
    try {
      const status = isCompleted ? 'Completed' : 'Pending';
      const response = await api.put(`/tasks/${taskId}`, { status });
      return response.data;
    } catch (e) {
      console.warn("Error toggling task API");
      throw e;
    }
  },
};

export default taskService;
