const optionalEnv = (name: string) => process.env[name] ?? "";

export const env = {
  appUrl: optionalEnv("NEXT_PUBLIC_APP_URL"),
  nextAuthUrl: optionalEnv("NEXTAUTH_URL"),
  nextAuthSecret: optionalEnv("NEXTAUTH_SECRET"),
  emailServer: optionalEnv("EMAIL_SERVER"),
  emailFrom: optionalEnv("EMAIL_FROM"),
  supabaseUrl: optionalEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: optionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: optionalEnv("SUPABASE_SERVICE_ROLE_KEY"),
  r2: {
    accountId: optionalEnv("R2_ACCOUNT_ID"),
    accessKeyId: optionalEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: optionalEnv("R2_SECRET_ACCESS_KEY"),
    bucketName: optionalEnv("R2_BUCKET_NAME"),
    publicBaseUrl: optionalEnv("R2_PUBLIC_BASE_URL")
  },
  qstashToken: optionalEnv("QSTASH_TOKEN"),
  social: {
    youtubeClientId: optionalEnv("YOUTUBE_CLIENT_ID"),
    youtubeClientSecret: optionalEnv("YOUTUBE_CLIENT_SECRET"),
    tiktokClientKey: optionalEnv("TIKTOK_CLIENT_KEY"),
    tiktokClientSecret: optionalEnv("TIKTOK_CLIENT_SECRET"),
    metaAppId: optionalEnv("META_APP_ID"),
    metaAppSecret: optionalEnv("META_APP_SECRET")
  },
  tokenEncryptionKey: optionalEnv("TOKEN_ENCRYPTION_KEY")
};
