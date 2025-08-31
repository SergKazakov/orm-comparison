import { $ } from "zx"

await $`npx prisma generate`

const { PrismaClient } = await import("./generated/prisma/client.js")

const prisma = new PrismaClient({
  log: [{ emit: "event", level: "query" }],
}).$on("query", e => console.log(`${e.query}\n${e.params}`))

export const cleanup = () => prisma.$disconnect()

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
