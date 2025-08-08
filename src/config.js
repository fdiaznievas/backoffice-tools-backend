import 'dotenv/config'

export const config = {
  port: process.env.PORT || 3000,
  origin: process.env.ORIGIN || 'http://localhost:5173',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret',
    days: Number(process.env.JWT_EXPIRES_DAYS || 7),
    cookieName: 'bf_token',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  graph: {
    tenantId: process.env.AZURE_TENANT_ID || '',
    clientId: process.env.AZURE_CLIENT_ID || '',
    clientSecret: process.env.AZURE_CLIENT_SECRET || '',
    senderUpn: process.env.MS_SENDER_UPN || '',
  },
  paths: {
    dbFile: new URL('../data/data.db', import.meta.url).pathname,
  }
}