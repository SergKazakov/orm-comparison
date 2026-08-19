import {
  CamelCasePlugin,
  type Generated,
  Kysely,
  PostgresDialect,
  sql,
} from "kysely"
import pg from "pg"

import { env } from "./env.mts"

type WithId = { id: Generated<string> }

type WithTimestamp = { createdAt: Generated<Date>; updatedAt: Generated<Date> }

type User = WithId & WithTimestamp & { nickname: string }

type Post = WithId
  & WithTimestamp & { userId: string; title: string; content: string }

type Tag = WithId & WithTimestamp & { name: string }

type PostTag = WithTimestamp & { postId: string; tagId: string }

type Database = { users: User; posts: Post; tags: Tag; postTags: PostTag }

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({ connectionString: env.KYSELY_DATABASE_URL }),
  }),
  log: ["query"],
  plugins: [new CamelCasePlugin()],
})

export const cleanup = () => db.destroy()

export const createUser = (nickname = Bun.randomUUIDv7()) =>
  db
    .insertInto("users")
    .values({ nickname })
    .returningAll()
    .executeTakeFirstOrThrow()

export const createUserOnConflictDoUpdate = (nickname: string) =>
  db
    .insertInto("users")
    .values({ nickname })
    .onConflict(oc =>
      oc
        .column("nickname")
        .doUpdateSet({
          nickname: sql`excluded.nickname`,
          updatedAt: sql`excluded.updated_at`,
        }),
    )
    .returningAll()
    .execute()

export const createUserOnConflictDoNothing = (nickname: string) =>
  db
    .insertInto("users")
    .values({ nickname })
    .onConflict(oc => oc.column("nickname").doNothing())
    .returningAll()
    .execute()

export const updateManyUsers = async (id: string) => {
  const [{ numUpdatedRows }] = await db
    .updateTable("users")
    .set({ updatedAt: sql`now()`, nickname: Bun.randomUUIDv7() })
    .where("id", "=", id)
    .execute()

  return Number(numUpdatedRows)
}

export const updateManyUsersAndReturn = (id: string) =>
  db
    .updateTable("users")
    .set({ updatedAt: sql`now()`, nickname: Bun.randomUUIDv7() })
    .where("id", "=", id)
    .returningAll()
    .execute()

export const deleteManyUsers = async (id: string) => {
  const [{ numDeletedRows }] = await db
    .deleteFrom("users")
    .where("id", "=", id)
    .execute()

  return Number(numDeletedRows)
}

export const deleteManyUsersAndReturn = (id: string) =>
  db.deleteFrom("users").where("id", "=", id).returningAll().execute()

export const findUsers = () =>
  db
    .selectFrom("users")
    .selectAll()
    .orderBy("id", "desc")
    .limit(1)
    .offset(0)
    .execute()

export const findUser = (id: string) =>
  db.selectFrom("users").selectAll().where("id", "=", id).executeTakeFirst()

export const createPost = (userId: string) =>
  db
    .insertInto("posts")
    .values({ userId, title: "foo", content: "foo" })
    .returningAll()
    .executeTakeFirstOrThrow()

export const createTag = () =>
  db
    .insertInto("tags")
    .values({ name: "foo" })
    .returningAll()
    .executeTakeFirstOrThrow()

export const createPostTag = (postId: string, tagId: string) =>
  db
    .insertInto("postTags")
    .values({ postId, tagId })
    .returningAll()
    .executeTakeFirstOrThrow()
