import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import { $ } from "zx"

import { env } from "./env.mts"

await $`npx prisma generate`

const { PrismaClient } = await import("./generated/prisma/client.js")

const pool = new pg.Pool({ connectionString: env.DATABASE_URL })

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
  log: [{ emit: "event", level: "query" }],
}).$on("query", e => console.log(`${e.query}\n${e.params}`))

export const cleanup = async () => {
  await prisma.$disconnect()

  await pool.end()
}

export const createUser = () =>
  prisma.users.create({ data: { nickname: "foo" } })

export const updateUser = async (id: number) => {
  const { count } = await prisma.users.updateMany({
    data: { nickname: "bar" },
    where: { id },
  })

  return count
}

export const updateAndReturnUser = (id: number) =>
  prisma.users.updateManyAndReturn({ data: { nickname: "bar" }, where: { id } })

export const deleteUser = async (id: number) => {
  const { count } = await prisma.users.deleteMany({ where: { id } })

  return count
}

export const findUsers = () =>
  prisma.users.findMany({ orderBy: { id: "desc" }, take: 1, skip: 0 })

export const findUser = (id: number) =>
  prisma.users.findFirst({ where: { id } })

export const createPost = (userId: number) =>
  prisma.posts.create({ data: { userId, title: "foo", content: "foo" } })

export const createTag = () => prisma.tags.create({ data: { name: "foo" } })

export const createPostTag = (postId: number, tagId: number) =>
  prisma.post_tags.create({ data: { postId, tagId } })
