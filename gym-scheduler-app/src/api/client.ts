import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ensureApiSuffix(url: string) {
  return url.endsWith('/api') ? url : `${url}/api`;
}

function getExpoHost() {
  const hostUri =
    (Constants?.expoConfig as any)?.hostUri ||
    (Constants as any)?.manifest?.debuggerHost ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;

  if (typeof hostUri !== 'string' || hostUri.length === 0) {
    return null;
  }

  return hostUri.split(':')[0] || null;
}

function replaceLocalhostWithReachableHost(url: string) {
  if (!/localhost|127\.0\.0\.1/i.test(url)) {
    return url;
  }

  const expoHost = getExpoHost();
  if (expoHost) {
    return url.replace(/localhost|127\.0\.0\.1/gi, expoHost);
  }

  if (Platform.OS === 'android') {
    // Android emulator cannot access host machine via localhost.
    return url.replace(/localhost|127\.0\.0\.1/gi, '10.0.2.2');
  }

  return url;
}

function resolveBaseURL() {
  const publicEnvUrl = process.env.EXPO_PUBLIC_API_URL;
  const extraApiUrl = (Constants?.expoConfig?.extra as any)?.API_URL;

  // In local development, prefer the locally reachable URL first.
  if (__DEV__) {
    if (typeof publicEnvUrl === 'string' && publicEnvUrl.length > 0) {
      const normalized = ensureApiSuffix(publicEnvUrl);
      return replaceLocalhostWithReachableHost(normalized);
    }

    const expoHost = getExpoHost();
    if (expoHost) {
      return `http://${expoHost}:8000/api`;
    }

    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000/api';
    }

    return 'http://127.0.0.1:8000/api';
  }

  const envUrl = publicEnvUrl || extraApiUrl;

  if (typeof envUrl === 'string' && envUrl.length > 0) {
    const normalized = ensureApiSuffix(envUrl);
    return replaceLocalhostWithReachableHost(normalized);
  }

  const expoHost = getExpoHost();
  if (expoHost) {
    return `http://${expoHost}:8000/api`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api';
  }

  return 'http://127.0.0.1:8000/api';
}

const BASE_URL = resolveBaseURL();

console.log('[API] baseURL =', BASE_URL);

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  async config => {
    // Fallback: ensure token is attached even if app state just restored/login just completed.
    const hasAuthHeader = Boolean(config.headers?.Authorization || config.headers?.authorization);
    if (!hasAuthHeader) {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          config.headers = config.headers ?? {};
          (config.headers as any).Authorization = `Bearer ${storedToken}`;
        }
      } catch (e) {
        console.log('[API] unable to read token from storage', e);
      }
    }
    return config;
  },
  error => Promise.reject(error)
);


api.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error);
  }
);

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

