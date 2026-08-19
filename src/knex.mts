import { knex } from "knex"

import { env } from "./env.mts"
import { toCamelCase } from "./toCamelCase.mts"

type WithId = { id: string }

type WithTimestamp = { created_at: Date; updated_at: Date }

type User = WithId & WithTimestamp & { nickname: string }

type Post = WithId
  & WithTimestamp & { user_id: string; title: string; content: string }

type Tag = WithId & WithTimestamp & { name: string }

type PostTag = WithTimestamp & { post_id: string; tag_id: string }

declare module "knex/types/tables.js" {
  interface Tables {
    users: User

    posts: Post

    tags: Tag

    post_tags: PostTag
  }
}

const db = knex({
  client: "pg",
  connection: env.KNEX_DATABASE_URL,
  debug: true,
  postProcessResponse: result =>
    Array.isArray(result)
      ? result.map(row => toCamelCase(row))
      : toCamelCase(result),
})

export const cleanup = () => db.destroy()

export const createUser = async (nickname = Bun.randomUUIDv7()) => {
  const [row] = await db("users").insert({ nickname }).returning("*")

  return row
}

export const createUserOnConflictDoUpdate = (nickname: string) =>
  db("users")
    .insert({ nickname })
    .onConflict("nickname")
    .merge({
      nickname: db.raw("excluded.nickname"),
      updated_at: db.raw("excluded.updated_at"),
    })
    .returning("*")

export const createUserOnConflictDoNothing = (nickname: string) =>
  db("users")
    .insert({ nickname })
    .onConflict("nickname")
    .ignore()
    .returning("*")

export const updateManyUsers = async (id: string) => {
  const rows = await db("users")
    .update({ updated_at: db.raw("now()"), nickname: Bun.randomUUIDv7() })
    .where({ id })
    .returning("id")

  return rows.length
}

export const updateManyUsersAndReturn = (id: string) =>
  db("users")
    .update({ updated_at: db.raw("now()"), nickname: Bun.randomUUIDv7() })
    .where({ id })
    .returning("*")

export const deleteManyUsers = async (id: string) => {
  const rows = await db("users").delete("id").where({ id })

  return rows.length
}

export const deleteManyUsersAndReturn = (id: string) =>
  db("users").delete().where({ id }).returning("*")

export const findUsers = () =>
  db.select().from("users").orderBy("id", "desc").limit(1).offset(0)

export const findUser = (id: string) => db.first().from("users").where({ id })

export const createPost = async (userId: string) => {
  const [row] = await db("posts")
    .insert({ user_id: userId, title: "foo", content: "foo" })
    .returning("*")

  return row
}

export const createTag = async () => {
  const [row] = await db("tags").insert({ name: "foo" }).returning("*")

  return row
}

export const createPostTag = async (postId: string, tagId: string) => {
  const [row] = await db("post_tags")
    .insert({ post_id: postId, tag_id: tagId })
    .returning("*")

  return row
}
