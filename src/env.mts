import { cleanEnv, url } from "envalid"

export const env = cleanEnv(Bun.env, {
  DRIZZLE_DATABASE_URL: url(),
  KNEX_DATABASE_URL: url(),
  KYSELY_DATABASE_URL: url(),
  MIKROORM_DATABASE_URL: url(),
  PRISMA_DATABASE_URL: url(),
  SEQUELIZE_DATABASE_URL: url(),
  TYPEORM_DATABASE_URL: url(),
})
