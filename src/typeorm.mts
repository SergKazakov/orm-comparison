import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DataSource,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm"

import { env } from "./env.mts"
import { toCamelCase } from "./toCamelCase.mts"

@Entity("users")
class User extends BaseEntity {
  @PrimaryColumn({ type: "uuid", default: () => "uuidv7()" })
  id: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @Column({ type: "text", unique: true })
  nickname: string
}

@Entity("posts")
class Post extends BaseEntity {
  @PrimaryColumn({ type: "uuid", default: () => "uuidv7()" })
  id: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @Column({ name: "user_id", type: "uuid" })
  userId: string

  @Column({ type: "text" })
  title: string

  @Column({ type: "text" })
  content: string
}

@Entity("tags")
class Tag extends BaseEntity {
  @PrimaryColumn({ type: "uuid", default: () => "uuidv7()" })
  id: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @Column({ type: "text" })
  name: string
}

@Entity("post_tags")
export class PostTag extends BaseEntity {
  @Column({ name: "post_id", type: "uuid", primary: true })
  postId: string

  @Column({ name: "tag_id", type: "uuid", primary: true })
  tagId: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}

const ds = new DataSource({
  entities: [User, Post, Tag, PostTag],
  logging: true,
  type: "postgres",
  url: env.TYPEORM_DATABASE_URL,
})

await ds.initialize()

export const cleanup = () => ds.destroy()

export const createUser = async (nickname = Bun.randomUUIDv7()) => {
  const {
    raw: [row],
  } = await ds
    .createQueryBuilder()
    .insert()
    .into(User)
    .values({ nickname })
    .returning("*")
    .execute()

  return toCamelCase(row)
}

export const createUserOnConflictDoUpdate = async (nickname: string) => {
  const { raw } = await ds
    .createQueryBuilder()
    .insert()
    .into(User)
    .values({ nickname })
    .orUpdate(["nickname"], ["nickname"])
    .returning("*")
    .execute()

  return raw.map((row: object) => toCamelCase(row))
}

export const createUserOnConflictDoNothing = async (nickname: string) => {
  const { raw } = await ds
    .createQueryBuilder()
    .insert()
    .into(User)
    .values({ nickname })
    .orIgnore()
    .returning("*")
    .execute()

  return raw.map((row: object) => toCamelCase(row))
}

export const updateManyUsers = async (id: string) => {
  const { affected } = await User.update(id, { nickname: Bun.randomUUIDv7() })

  return affected
}

export const updateManyUsersAndReturn = async (id: string) => {
  const { raw } = await ds
    .createQueryBuilder()
    .update(User)
    .set({ nickname: Bun.randomUUIDv7() })
    .where({ id })
    .returning("*")
    .execute()

  return raw.map((row: object) => toCamelCase(row))
}

export const deleteManyUsers = async (id: string) => {
  const { affected } = await User.delete(id)

  return affected
}

export const deleteManyUsersAndReturn = async (id: string) => {
  const { raw } = await ds
    .createQueryBuilder()
    .delete()
    .from(User)
    .where({ id })
    .returning("*")
    .execute()

  return raw.map((row: object) => toCamelCase(row))
}

export const findUsers = () =>
  User.find({ order: { id: "desc" }, take: 1, skip: 0 })

export const findUser = (id: string) => User.findOne({ where: { id } })

export const createPost = async (userId: string) => {
  const {
    raw: [row],
  } = await ds
    .createQueryBuilder()
    .insert()
    .into(Post)
    .values({ userId, title: "foo", content: "foo" })
    .returning("*")
    .execute()

  return toCamelCase(row)
}

export const createTag = async () => {
  const {
    raw: [row],
  } = await ds
    .createQueryBuilder()
    .insert()
    .into(Tag)
    .values({ name: "foo" })
    .returning("*")
    .execute()

  return toCamelCase(row)
}

export const createPostTag = async (postId: string, tagId: string) => {
  const {
    raw: [row],
  } = await ds
    .createQueryBuilder()
    .insert()
    .into(PostTag)
    .values({ postId, tagId })
    .returning("*")
    .execute()

  return toCamelCase(row)
}
