import { cleanEnv, host, port, str, url } from "envalid"

export const env = cleanEnv(process.env, {
  DATABASE_URL: url(),
  DATABASE_USER: str(),
  DATABASE_PASSWORD: str(),
  DATABASE_HOST: host(),
  DATABASE_PORT: port(),
  DATABASE_NAME: str(),
})
