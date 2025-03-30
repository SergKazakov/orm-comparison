import { knex } from "knex"
import { toCamelCase } from "./toCamelCase.mts"

type WithId = { id: number }

type WithTimestamp = { created_at: Date; updated_at: Date }

type User = WithId & WithTimestamp & { nickname: string }

type Post = WithId &
  WithTimestamp & { user_id: number; title: string; content: string }

type Tag = WithId & WithTimestamp & { name: string }

type PostTag = WithTimestamp & { post_id: number; tag_id: number }

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
  connection: process.env.DATABASE_URL,
  debug: true,
  postProcessResponse: result =>
    Array.isArray(result) ? result.map(toCamelCase) : toCamelCase(result),
})

export const cleanup = () => db.destroy()

export const createUser = async () => {
  const [row] = await db("users").insert({ nickname: "foo" }, "*")

  return row
}

export const updateUser = async (id: number) => {
  const rows = await db("users")
    .update({ updated_at: db.raw`now()`, nickname: "bar" }, "id")
    .where({ id })

  return rows.length
}

export const updateAndReturnUser = (id: number) =>
  db("users")
    .update({ updated_at: db.raw`now()`, nickname: "bar" }, "*")
    .where({ id })

export const deleteUser = async (id: number) => {
  const rows = await db("users").delete("id").where({ id })

  return rows.length
}

export const findUsers = () =>
  db.select().from("users").orderBy("id", "desc").limit(1).offset(0)

export const findUser = (id: number) => db.first().from("users").where({ id })

export const createPost = async (userId: number) => {
  const [row] = await db("posts").insert(
    { user_id: userId, title: "foo", content: "foo" },
    "*",
  )

  return row
}

export const createTag = async () => {
  const [row] = await db("tags").insert({ name: "foo" }, "*")

  return row
}

export const createPostTag = async (postId: number, tagId: number) => {
  const [row] = await db("post_tags").insert(
    { post_id: postId, tag_id: tagId },
    "*",
  )

  return row
}
