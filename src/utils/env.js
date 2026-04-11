const getEnv = (key, fallback) => {
  const value = import.meta.env[key];
  return value === undefined || value === null || value === '' ? fallback : value;
};

const timeoutRaw = getEnv('VITE_API_TIMEOUT_MS', '15000');
const apiTimeoutMs = Number(timeoutRaw);

export const ENV = {
  apiBaseUrl: getEnv('VITE_API_BASE_URL', '/api'),
  uploadsBaseUrl: getEnv('VITE_UPLOADS_BASE_URL', '/uploads'),
  apiTimeoutMs: Number.isFinite(apiTimeoutMs) ? apiTimeoutMs : 15000,
  authTokenKey: getEnv('VITE_AUTH_TOKEN_KEY', 'aditri_token'),
  authUserKey: getEnv('VITE_AUTH_USER_KEY', 'aditri_user'),
  cartKey: getEnv('VITE_CART_KEY', 'aditri_cart'),
  loginPath: getEnv('VITE_LOGIN_PATH', '/login'),
};
