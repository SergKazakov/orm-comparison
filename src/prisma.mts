import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

import { env } from "./env.mts"

const { PrismaClient } = await import("./generated/prisma/client.js")

const pool = new pg.Pool({ connectionString: env.PRISMA_DATABASE_URL })

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
  log: [{ emit: "event", level: "query" }],
}).$on("query", e => console.log(`${e.query}\n${e.params}`))

export const cleanup = async () => {
  await prisma.$disconnect()

  await pool.end()
}

export const createUser = (nickname = Bun.randomUUIDv7()) =>
  prisma.users.create({ data: { nickname } })

export const createUserOnConflictDoUpdate = (nickname: string) =>
  prisma.users.upsert({
    create: { nickname },
    update: { nickname },
    where: { nickname },
  })

export const createUserOnConflictDoNothing = (nickname: string) =>
  prisma.users.createMany({ data: { nickname }, skipDuplicates: true })

export const updateManyUsers = async (id: string) => {
  const { count } = await prisma.users.updateMany({
    data: { nickname: Bun.randomUUIDv7() },
    where: { id },
  })

  return count
}

export const updateManyUsersAndReturn = (id: string) =>
  prisma.users.updateManyAndReturn({
    data: { nickname: Bun.randomUUIDv7() },
    where: { id },
  })

export const deleteManyUsers = async (id: string) => {
  const { count } = await prisma.users.deleteMany({ where: { id } })

  return count
}

export const deleteManyUsersAndReturn = (id: string) =>
  prisma.$queryRaw<Awaited<ReturnType<typeof prisma.users.findMany>>>`
    delete from users
    where id = ${id}
    returning
      id,
      created_at "createdAt",
      updated_at "updatedAt",
      nickname
  `

export const findUsers = () =>
  prisma.users.findMany({ orderBy: { id: "desc" }, take: 1, skip: 0 })

export const findUser = (id: string) =>
  prisma.users.findFirst({ where: { id } })

export const createPost = (userId: string) =>
  prisma.posts.create({ data: { userId, title: "foo", content: "foo" } })

export const createTag = () => prisma.tags.create({ data: { name: "foo" } })

export const createPostTag = (postId: string, tagId: string) =>
  prisma.post_tags.create({ data: { postId, tagId } })
