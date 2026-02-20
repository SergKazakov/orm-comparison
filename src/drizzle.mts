import { desc, eq, sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import * as t from "drizzle-orm/pg-core"
import { Pool } from "pg"

import { env } from "./env.mts"

const withId = { id: t.integer().generatedAlwaysAsIdentity().primaryKey() }

const withTimestamp = {
  createdAt: t
    .timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: t
    .timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}

const users = t.pgTable("users", {
  ...withId,
  ...withTimestamp,
  nickname: t.text().notNull(),
})

const posts = t.pgTable("posts", {
  ...withId,
  ...withTimestamp,
  userId: t
    .integer()
    .notNull()
    .references(() => users.id),
  title: t.text().notNull(),
  content: t.text().notNull(),
})

const tags = t.pgTable("tags", {
  ...withId,
  ...withTimestamp,
  name: t.text().notNull(),
})

const postTags = t.pgTable("post_tags", {
  ...withTimestamp,
  postId: t
    .integer()
    .references(() => posts.id)
    .primaryKey(),
  tagId: t
    .integer()
    .references(() => tags.id)
    .primaryKey(),
})

const db = drizzle(env.DATABASE_URL, { casing: "snake_case", logger: true })

export const cleanup = async () => {
  if (db.$client instanceof Pool) {
    await db.$client.end()
  }
}

export const createUser = async () => {
  const [row] = await db.insert(users).values({ nickname: "foo" }).returning()

  return row
}

export const updateUser = async (id: number) => {
  const rows = await db
    .update(users)
    .set({ updatedAt: sql`now()`, nickname: "bar" })
    .where(eq(users.id, id))
    .returning({ id: users.id })

  return rows.length
}

export const updateAndReturnUser = (id: number) =>
  db
    .update(users)
    .set({ updatedAt: sql`now()`, nickname: "bar" })
    .where(eq(users.id, id))
    .returning()

export const deleteUser = async (id: number) => {
  const rows = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id })

  return rows.length
}

export const findUsers = () =>
  db.select().from(users).orderBy(desc(users.id)).limit(1).offset(0)

export const findUser = async (id: number) => {
  const [row] = await db.select().from(users).where(eq(users.id, id))

  return row
}

export const createPost = async (userId: number) => {
  const [row] = await db
    .insert(posts)
    .values({ userId, title: "foo", content: "foo" })
    .returning()

  return row
}

export const createTag = async () => {
  const [row] = await db.insert(tags).values({ name: "foo" }).returning()

  return row
}

export const createPostTag = async (postId: number, tagId: number) => {
  const [row] = await db.insert(postTags).values({ postId, tagId }).returning()

  return row
}
