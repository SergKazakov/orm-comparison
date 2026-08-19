import { MikroORM, defineEntity, p, sql } from "@mikro-orm/postgresql"

import { env } from "./env.mts"

const withId = { id: p.uuid().defaultRaw("uuidv7()").primary() }

const withTimestamps = {
  createdAt: p.datetime().name("created_at").defaultRaw("now()"),
  updatedAt: p.datetime().name("updated_at").defaultRaw("now()"),
}

const User = defineEntity({
  name: "User",
  tableName: "users",
  properties: { ...withId, ...withTimestamps, nickname: p.text().unique() },
})

const Post = defineEntity({
  name: "Post",
  tableName: "posts",
  properties: {
    ...withId,
    ...withTimestamps,
    userId: p.uuid().name("user_id"),
    title: p.text(),
    content: p.text(),
  },
})

const Tag = defineEntity({
  name: "Tag",
  tableName: "tags",
  properties: { ...withId, ...withTimestamps, name: p.text() },
})

const PostTag = defineEntity({
  name: "PostTag",
  tableName: "post_tags",
  properties: {
    ...withTimestamps,
    postId: p.uuid().name("post_id").primary(),
    tagId: p.uuid().name("tag_id").primary(),
  },
})

const orm = await MikroORM.init({
  clientUrl: env.MIKROORM_DATABASE_URL,
  entities: [User, Post, Tag, PostTag],
  debug: true,
  disableIdentityMap: true,
})

const em = orm.em.fork()

export const cleanup = () => em.getConnection().close()

export const createUser = (nickname = Bun.randomUUIDv7()) =>
  em.qb(User).insert({ nickname }).returning("*").execute("get")

export const createUserOnConflictDoUpdate = (nickname: string) =>
  em
    .qb(User)
    .insert({ nickname })
    .onConflict(["nickname"])
    .merge({ nickname })
    .returning("*")
    .execute("all")

export const createUserOnConflictDoNothing = (nickname: string) =>
  em
    .qb(User)
    .insert({ nickname })
    .onConflict(["nickname"])
    .ignore()
    .returning("*")
    .execute("all")

export const updateManyUsers = async (id: string) => {
  const { affectedRows } = await em
    .qb(User)
    .update({ updatedAt: sql`now()`, nickname: Bun.randomUUIDv7() })
    .where({ id })
    .execute("run")

  return affectedRows
}

export const updateManyUsersAndReturn = (id: string) =>
  em
    .qb(User)
    .update({ updatedAt: sql`now()`, nickname: Bun.randomUUIDv7() })
    .where({ id })
    .returning("*")
    .execute("all")

export const deleteManyUsers = async (id: string) => {
  const { affectedRows } = await em.qb(User).delete({ id }).execute("run")

  return affectedRows
}

export const findUsers = () =>
  em.findAll(User, { orderBy: { id: "desc" }, limit: 1, offset: 0 })

export const findUser = (id: string) => em.findOne(User, id)

export const createPost = (userId: string) =>
  em
    .qb(Post)
    .insert({ userId, title: "foo", content: "foo" })
    .returning("*")
    .execute("get")

export const createTag = () =>
  em.qb(Tag).insert({ name: "foo" }).returning("*").execute("get")

export const createPostTag = (postId: string, tagId: string) =>
  em.qb(PostTag).insert({ postId, tagId }).returning("*").execute("get")
