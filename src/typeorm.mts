import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DataSource,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"

import { env } from "./env.mts"
import { toCamelCase } from "./toCamelCase.mts"

@Entity("users")
class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @Column({ type: "text" })
  nickname: string
}

@Entity("posts")
class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @Column({ name: "user_id", type: "int4" })
  userId: number

  @Column({ type: "text" })
  title: string

  @Column({ type: "text" })
  content: string
}

@Entity("tags")
class Tag extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @Column({ type: "text" })
  name: string
}

@Entity("post_tags")
export class PostTag extends BaseEntity {
  @Column({ name: "post_id", type: "int4", primary: true })
  postId: number

  @Column({ name: "tag_id", type: "int4", primary: true })
  tagId: number

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date
}

const ds = new DataSource({
  entities: [User, Post, Tag, PostTag],
  logging: true,
  type: "postgres",
  url: env.DATABASE_URL,
})

await ds.initialize()

export const cleanup = () => ds.destroy()

export const createUser = async () => {
  const {
    raw: [row],
  } = await ds
    .createQueryBuilder()
    .insert()
    .into(User)
    .values({ nickname: "foo" })
    .returning("*")
    .execute()

  return toCamelCase(row)
}

export const updateUser = async (id: number) => {
  const { affected } = await User.update(id, { nickname: "bar" })

  return affected
}

export const updateAndReturnUser = async (id: number) => {
  const { raw } = await ds
    .createQueryBuilder()
    .update(User)
    .set({ nickname: "bar" })
    .where({ id })
    .returning("*")
    .execute()

  return raw.map(toCamelCase)
}

export const deleteUser = async (id: number) => {
  const { affected } = await User.delete(id)

  return affected
}

export const findUsers = () =>
  User.find({ order: { id: "desc" }, take: 1, skip: 0 })

export const findUser = (id: number) => User.findOne({ where: { id } })

export const createPost = async (userId: number) => {
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

export const createPostTag = async (postId: number, tagId: number) => {
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
