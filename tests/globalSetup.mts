import pg from "pg"
import { GenericContainer, Wait } from "testcontainers"

export default async function globalSetup() {
  const container = await new GenericContainer("postgres:18.3-alpine3.22")
    .withEnvironment({ POSTGRES_HOST_AUTH_METHOD: "trust" })
    .withExposedPorts(5432)
    .withTmpFs({ "/var/lib/postgresql/18/docker": "rw" })
    .withCopyFilesToContainer([
      {
        source: "./src/init.sql",
        target: "/docker-entrypoint-initdb.d/init.sql",
      },
    ])
    .withWaitStrategy(
      Wait.forLogMessage(/database system is ready to accept connections/, 2),
    )
    .start()

  const baseUrl = `postgres://postgres@${container.getHost()}:${container.getMappedPort(5432)}`

  const admin = new pg.Client({ connectionString: `${baseUrl}/template1` })

  await admin.connect()

  for (const it of [
    "drizzle",
    "knex",
    "kysely",
    "mikroorm",
    "prisma",
    "sequelize",
    "typeorm",
  ]) {
    await admin.query(`create database ${it} with template postgres`)

    Bun.env[`${it.toUpperCase()}_DATABASE_URL`] = `${baseUrl}/${it}`
  }

  await admin.end()

  return async () => {
    await container.stop()
  }
}
