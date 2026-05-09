import { initAuth0 } from '@auth0/nextjs-auth0';

const getBaseUrl = () => {
  if (process.env.AUTH0_BASE_URL) return process.env.AUTH0_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
};

export default initAuth0({ baseURL: getBaseUrl() });
