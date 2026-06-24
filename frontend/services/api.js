import axios from 'axios';
import { Platform } from 'react-native';

// ─────────────────────────────────────────────────────────────────
// BASE URL CONFIGURATION
//
// Using localtunnel to expose the local backend publicly.
// The tunnel URL works on ANY network (mobile data, different Wi-Fi, etc.)\
//
// If the tunnel URL stops working:
//   1. Restart localtunnel:  npx localtunnel --port 8000 --subdomain taskflow-reminder-app
//   2. The URL will be: https://taskflow-reminder-app.loca.lt (fixed subdomain)
// ─────────────────────────────────────────────────────────────────

const TUNNEL_URL = 'https://taskflow-reminder-app.loca.lt';

let BASE_URL = TUNNEL_URL;

// Web uses localhost directly (no tunnel needed in browser dev)
if (Platform.OS === 'web') {
  BASE_URL = 'http://127.0.0.1:8000';
}

// Allow override via Expo env variable
if (process.env && process.env.EXPO_PUBLIC_API_URL) {
  BASE_URL = process.env.EXPO_PUBLIC_API_URL;
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    // Required by localtunnel to bypass the browser warning/interstitial page
    'Bypass-Tunnel-Reminder': 'true',
    'bypass-tunnel-reminder': 'true',   // also send lowercase variant
    'ngrok-skip-browser-warning': 'true',
  },
});

// ─────────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR — attach auth token on every request
// ─────────────────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    try {
      const useAuthStore = require('../store/useAuthStore').default;
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignore during initial load edge cases
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR — handle auth, retries & network errors
// ─────────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // If the server returned HTML instead of JSON (localtunnel interstitial),
    // treat it as a network error so callers can handle gracefully.
    const ct = response.headers?.['content-type'] || '';
    if (ct.includes('text/html')) {
      const htmlError = new Error(
        'Server returned HTML instead of JSON. ' +
        'The localtunnel interstitial may need to be bypassed. ' +
        'Restart the tunnel: npx localtunnel --port 8000 --subdomain taskflow-reminder-app'
      );
      htmlError.isNetworkError = true;
      return Promise.reject(htmlError);
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    // Auto-logout on token expiry
    if (error.response && error.response.status === 401) {
      try {
        const useAuthStore = require('../store/useAuthStore').default;
        useAuthStore.getState().logout();
      } catch (e) {
        console.error('Error during logout on 401:', e);
      }
      return Promise.reject(error);
    }

    // Retry once on 503 (tunnel not ready) or unexpected 404 on list endpoints
    // These are transient localtunnel cold-start errors.
    const isTransient =
      error.response &&
      (error.response.status === 503 || error.response.status === 404) &&
      !config._retried;

    if (isTransient) {
      config._retried = true;
      // Wait 1.5 s for the tunnel to fully wake up, then retry
      await new Promise((r) => setTimeout(r, 1500));
      return api(config);
    }

    // Enhanced network error messages
    if (!error.response) {
      const networkError = new Error(
        'Cannot connect to server. Please ensure:\n' +
        '1. Your PC running the backend is on\n' +
        '2. The tunnel is active (run: npx localtunnel --port 8000 --subdomain taskflow-reminder-app)\n' +
        '3. You have an internet connection'
      );
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }

    return Promise.reject(error);
  }
);

// Helper to update the base URL at runtime (useful for debugging)
export const updateBaseURL = (url) => {
  BASE_URL = url.startsWith('http') ? url : `http://${url}:8000`;
  api.defaults.baseURL = BASE_URL;
  console.log('[API] Base URL updated to:', BASE_URL);
};

export const getCurrentBaseURL = () => BASE_URL;

export default api;
