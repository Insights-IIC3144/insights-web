import { initAuth0 } from '@auth0/nextjs-auth0';

const baseURL =
  process.env.AUTH0_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export default initAuth0({ baseURL });
