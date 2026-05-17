const getEnv = (key, fallback) => {
  const value = process.env[key];
  return value === undefined || value === null || value === '' ? fallback : value;
};

const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const liveBackendOrigin = 'https://aditri-backend-2.onrender.com';
const localBackendOrigin = 'http://localhost:10000';

const isLoopbackUrl = (value) => {
  try {
    const hostname = new URL(value).hostname;
    return ['localhost', '127.0.0.1'].includes(hostname);
  } catch {
    return false;
  }
};

const resolvePublicUrl = (value, localPath, livePath) => {
  if (value && value !== 'auto' && (isLocalhost || !isLoopbackUrl(value))) return value;
  const origin = isLocalhost ? localBackendOrigin : liveBackendOrigin;
  return `${origin}${isLocalhost ? localPath : livePath}`;
};

const timeoutRaw = getEnv('VITE_API_TIMEOUT_MS', '60000');
const apiTimeoutMs = Number(timeoutRaw);

export const ENV = {
  apiBaseUrl: resolvePublicUrl(getEnv('VITE_API_BASE_URL', 'auto'), '/api', '/api'),
  uploadsBaseUrl: resolvePublicUrl(getEnv('VITE_UPLOADS_BASE_URL', 'auto'), '/uploads', '/uploads'),
  apiTimeoutMs: Number.isFinite(apiTimeoutMs) ? apiTimeoutMs : 15000,
  authTokenKey: getEnv('VITE_AUTH_TOKEN_KEY', 'aditri_token'),
  authUserKey: getEnv('VITE_AUTH_USER_KEY', 'aditri_user'),
  cartKey: getEnv('VITE_CART_KEY', 'aditri_cart'),
  loginPath: getEnv('VITE_LOGIN_PATH', '/login'),
};

export const API_BASE_URL = ENV.apiBaseUrl;
