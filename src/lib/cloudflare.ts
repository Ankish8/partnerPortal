export const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;
export const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
export const CLOUDFLARE_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/browser-rendering`;
