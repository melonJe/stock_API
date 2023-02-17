export default () => ({
  server: {
    port: process.env.PORT || '3000',
    mode: process.env.MODE || 'dev',
  },
  database: {
    host: process.env.DB_HOST || '',
    port: process.env.DB_PORT || '',
    name: process.env.DB_NAME || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET_KEY || '',
    access: process.env.JWT_ACCESS_TOKEN_PERIOD ?? 1,
    refresh: process.env.JWT_REFRESH_TOKEN_PERIOD ?? 7,
  },
});
