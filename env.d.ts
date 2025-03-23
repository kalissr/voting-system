declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string
    JWT_SECRET: string
    BLOB_READ_WRITE_TOKEN: string
    UPSTASH_REDIS_REST_URL?: string
    UPSTASH_REDIS_REST_TOKEN?: string
    NODE_ENV: "development" | "production" | "test"
  }
}

