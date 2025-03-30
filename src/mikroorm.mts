import {
  Entity,
  MikroORM,
  OptionalProps,
  PrimaryKey,
  Property,
  sql,
} from "@mikro-orm/postgresql"

@Entity({ tableName: "users" })
export class User {
  [OptionalProps]?: "createdAt" | "updatedAt"

  @PrimaryKey({ type: "int4" })
  id: number

  @Property({ name: "created_at" })
  createdAt: Date = new Date()

  @Property({ name: "updated_at" })
  updatedAt: Date = new Date()

  @Property({ type: "text" })
  nickname: string
}

@Entity({ tableName: "posts" })
export class Post {
  [OptionalProps]?: "createdAt" | "updatedAt"

  @PrimaryKey({ type: "int4" })
  id: number

  @Property({ name: "created_at" })
  createdAt: Date = new Date()

  @Property({ name: "updated_at" })
  updatedAt: Date = new Date()

  @Property({ name: "user_id", type: "int4" })
  userId: number

  @Property({ type: "text" })
  title: string

  @Property({ type: "text" })
  content: string
}

@Entity({ tableName: "tags" })
export class Tag {
  [OptionalProps]?: "createdAt" | "updatedAt"

  @PrimaryKey({ type: "int4" })
  id: number

  @Property({ name: "created_at" })
  createdAt: Date = new Date()

  @Property({ name: "updated_at" })
  updatedAt: Date = new Date()

  @Property({ type: "text" })
  name: string
}

@Entity({ tableName: "post_tags" })
export class PostTag {
  [OptionalProps]?: "createdAt" | "updatedAt"

  @PrimaryKey({ name: "post_id", type: "int4" })
  postId: number

  @PrimaryKey({ name: "tag_id", type: "int4" })
  tagId: number

  @Property({ name: "created_at" })
  createdAt: Date = new Date()

  @Property({ name: "updated_at" })
  updatedAt: Date = new Date()
}

const orm = await MikroORM.init({
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  dbName: process.env.DATABASE_NAME,
  entities: [User, Post, Tag, PostTag],
  debug: true,
  disableIdentityMap: true,
})

const em = orm.em.fork()

export const cleanup = () => em.getConnection().close()

export const createUser = () =>
  em.qb(User).returning("*").insert({ nickname: "foo" }).execute("get")

export const updateUser = async (id: number) => {
  const { affectedRows } = await em
    .qb(User)
    .update({ updatedAt: sql`now()`, nickname: "bar" })
    .where({ id })

  return affectedRows
}

export const updateAndReturnUser = (id: number) =>
  em
    .qb(User)
    .returning("*")
    .update({ updatedAt: sql`now()`, nickname: "bar" })
    .where({ id })
    .execute("all")

export const deleteUser = async (id: number) => {
  const { affectedRows } = await em.qb(User).delete({ id })

  return affectedRows
}

export const findUsers = () =>
  em.findAll(User, { orderBy: { id: "desc" }, limit: 1, offset: 0 })

export const findUser = (id: number) => em.findOne(User, id)

export const createPost = (userId: number) =>
  em
    .qb(Post)
    .insert({ userId, title: "foo", content: "foo" })
    .returning("*")
    .execute("get")

export const createTag = () =>
  em.qb(Tag).insert({ name: "foo" }).returning("*").execute("get")

export const createPostTag = (postId: number, tagId: number) =>
  em.qb(PostTag).insert({ postId, tagId }).returning("*").execute("get")
