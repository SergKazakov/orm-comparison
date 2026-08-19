import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
  Sequelize,
  sql,
} from "@sequelize/core"
import {
  Attribute,
  CreatedAt,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from "@sequelize/core/decorators-legacy"
import { PostgresDialect } from "@sequelize/postgres"

import { env } from "./env.mts"

const uuidAttr = { type: DataTypes.UUID, defaultValue: sql.literal("uuidv7()") }

@Table({ modelName: "user", tableName: "users" })
class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  @Attribute(uuidAttr)
  @PrimaryKey
  id: CreationOptional<string>

  @CreatedAt
  createdAt: CreationOptional<Date>

  @UpdatedAt
  updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.TEXT)
  @Unique
  nickname: string
}

@Table({ modelName: "post", tableName: "posts" })
class Post extends Model<InferAttributes<Post>, InferCreationAttributes<Post>> {
  @Attribute(uuidAttr)
  @PrimaryKey
  id: CreationOptional<string>

  @CreatedAt
  createdAt: CreationOptional<Date>

  @UpdatedAt
  updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.UUID)
  userId: string

  @Attribute(DataTypes.TEXT)
  title: string

  @Attribute(DataTypes.TEXT)
  content: string
}

@Table({ modelName: "tag", tableName: "tags" })
class Tag extends Model<InferAttributes<Tag>, InferCreationAttributes<Tag>> {
  @Attribute(uuidAttr)
  @PrimaryKey
  id: CreationOptional<string>

  @CreatedAt
  createdAt: CreationOptional<Date>

  @UpdatedAt
  updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.TEXT)
  name: string
}

@Table({ modelName: "postTag", tableName: "post_tags" })
class PostTag extends Model<
  InferAttributes<PostTag>,
  InferCreationAttributes<PostTag>
> {
  @Attribute(DataTypes.UUID)
  @PrimaryKey
  postId: string

  @Attribute(DataTypes.UUID)
  @PrimaryKey
  tagId: string

  @CreatedAt
  createdAt: CreationOptional<Date>

  @UpdatedAt
  updatedAt: CreationOptional<Date>
}

const sequelize = new Sequelize({
  define: { underscored: true },
  dialect: PostgresDialect,
  logging: console.log,
  logQueryParameters: true,
  models: [User, Post, Tag, PostTag],
  noTypeValidation: true,
  url: env.SEQUELIZE_DATABASE_URL,
})

export const cleanup = () => sequelize.close()

export const createUser = (nickname = Bun.randomUUIDv7()) =>
  User.create({ nickname })

export const createUserOnConflictDoUpdate = (nickname: string) =>
  User.upsert({ nickname })

export const createUserOnConflictDoNothing = (nickname: string) =>
  User.bulkCreate([{ nickname }], {
    conflictAttributes: ["nickname"],
    ignoreDuplicates: true,
  })

export const updateManyUsers = async (id: string) => {
  const [affected] = await User.update(
    { nickname: Bun.randomUUIDv7() },
    { where: { id } },
  )

  return affected
}

export const updateManyUsersAndReturn = async (id: string) => {
  const [, rows] = await User.update(
    { nickname: Bun.randomUUIDv7() },
    { where: { id }, returning: true },
  )

  return rows
}

export const deleteManyUsers = (id: string) => User.destroy({ where: { id } })

export const deleteManyUsersAndReturn = (id: string) =>
  sequelize.query(
    sql`delete from ${sql.identifier(User)} where id = ${id} returning *`,
    { mapToModel: true, model: User },
  )

export const findUsers = () =>
  User.findAll({ order: [["id", "desc"]], limit: 1, offset: 0 })

export const findUser = (id: string) => User.findByPk(id)

export const createPost = (userId: string) =>
  Post.create({ userId, title: "foo", content: "foo" })

export const createTag = () => Tag.create({ name: "foo" })

export const createPostTag = (postId: string, tagId: string) =>
  PostTag.create({ postId, tagId })
