export const config = {
  environment: process.env.NODE_ENV || 'development',
  apiUrl: process.env.NEXT_PUBLIC_API_BASE || '/api',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  robloxApi: {
    cloudBase: 'https://apis.roblox.com',
    groupsBase: 'https://groups.roblox.com',
  },
  abacusAi: {
    baseUrl: process.env.ABACUS_AI_BASE_URL || 'https://routellm.abacus.ai/v1',
    model: process.env.ABACUS_AI_MODEL || 'gemini-3-flash-preview',
    apiKey: process.env.ABACUS_AI_API_KEY || '',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM_EMAIL || 'noreply@polarisone.com',
    fromName: process.env.SMTP_FROM_NAME || 'Polaris Pilot',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-not-for-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'fallback-key-not-for-production!!',
  },
};
