import { ENV } from './env.js';

export const resolveImageUrl = (url) => {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith('/uploads')) {
    return `${ENV.uploadsBaseUrl.replace(/\/uploads\/?$/, '')}${url}`;
  }
  return url;
};
