import { desc, eq, sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import * as t from "drizzle-orm/pg-core"

import { env } from "./env.mts"

const withId = {
  id: t
    .uuid()
    .default(sql`uuidv7()`)
    .primaryKey(),
}

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
  nickname: t.text().notNull().unique(),
})

const posts = t.pgTable("posts", {
  ...withId,
  ...withTimestamp,
  userId: t
    .uuid()
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
    .uuid()
    .references(() => posts.id)
    .primaryKey(),
  tagId: t
    .uuid()
    .references(() => tags.id)
    .primaryKey(),
})

const db = drizzle(env.DRIZZLE_DATABASE_URL, {
  casing: "snake_case",
  logger: true,
})

export const cleanup = () => db.$client.end()

export const createUser = async (nickname = Bun.randomUUIDv7()) => {
  const [row] = await db.insert(users).values({ nickname }).returning()

  return row
}

export const createUserOnConflictDoUpdate = (nickname: string) =>
  db
    .insert(users)
    .values({ nickname })
    .onConflictDoUpdate({
      target: users.nickname,
      set: {
        nickname: sql`excluded.nickname`,
        updatedAt: sql`excluded.updated_at`,
      },
    })
    .returning()

export const createUserOnConflictDoNothing = (nickname: string) =>
  db
    .insert(users)
    .values({ nickname })
    .onConflictDoNothing({ target: users.nickname })
    .returning()

export const updateManyUsers = async (id: string) => {
  const rows = await db
    .update(users)
    .set({ updatedAt: sql`now()`, nickname: Bun.randomUUIDv7() })
    .where(eq(users.id, id))
    .returning({ id: users.id })

  return rows.length
}

export const updateManyUsersAndReturn = (id: string) =>
  db
    .update(users)
    .set({ updatedAt: sql`now()`, nickname: Bun.randomUUIDv7() })
    .where(eq(users.id, id))
    .returning()

export const deleteManyUsers = async (id: string) => {
  const rows = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id })

  return rows.length
}

export const deleteManyUsersAndReturn = (id: string) =>
  db.delete(users).where(eq(users.id, id)).returning()

export const findUsers = () =>
  db.select().from(users).orderBy(desc(users.id)).limit(1).offset(0)

export const findUser = async (id: string) => {
  const [row] = await db.select().from(users).where(eq(users.id, id))

  return row
}

export const createPost = async (userId: string) => {
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

export const createPostTag = async (postId: string, tagId: string) => {
  const [row] = await db.insert(postTags).values({ postId, tagId }).returning()

  return row
}
