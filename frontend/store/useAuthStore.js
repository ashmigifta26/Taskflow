import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import authService from '../services/authService';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,

  restore: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userJson = await AsyncStorage.getItem('user');
      if (token && userJson) {
        // Re-attach the Authorization header so API calls work after auto-login
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ token, user: JSON.parse(userJson) });
      }
    } catch (e) {
      console.log('Failed to restore session', e);
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authService.login(email, password);
      const token = data.access_token;
      
      await AsyncStorage.setItem('auth_token', token);
      
      // Fetch user profile using the new token
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const user = await authService.getMe();
      
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      await authService.register(name, email, password);
      // Auto login after register
      const data = await authService.login(email, password);
      const token = data.access_token;
      await AsyncStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const user = await authService.getMe();
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    set({ user: null, token: null });
  },

  updateUser: async (updateData) => {
    try {
      const currentUser = get().user || {};
      const updatedUser = { ...currentUser, ...updateData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
      return updatedUser;
    } catch (e) {
      console.error('Failed to update user', e);
      throw e;
    }
  },
}));

export default useAuthStore;
