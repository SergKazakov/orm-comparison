import { PostgreSqlContainer } from "@testcontainers/postgresql"

export default async () => {
  const container = await new PostgreSqlContainer("postgres:18.2-alpine3.22")
    .withCopyFilesToContainer([
      {
        source: "./src/init.sql",
        target: "/docker-entrypoint-initdb.d/init.sql",
      },
    ])
    .withTmpFs({ "/var/lib/postgresql/18/docker": "" })
    .start()

  process.env.DATABASE_URL = container.getConnectionUri()

  process.env.DATABASE_USER = container.getUsername()

  process.env.DATABASE_PASSWORD = container.getPassword()

  process.env.DATABASE_HOST = container.getHost()

  process.env.DATABASE_PORT = String(container.getPort())

  process.env.DATABASE_NAME = container.getDatabase()

  return async () => {
    await container.stop()
  }
}
