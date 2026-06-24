import api from './api';

const notificationService = {
  registerToken: async (token) => {
    const response = await api.post('/notifications/register-token', {
      fcm_token: token,
    });
    return response.data;
  },

  testNotification: async () => {
    const response = await api.post('/notifications/test');
    return response.data;
  },
};

export default notificationService;
