import {
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  DataTypes,
  Model,
  Sequelize,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  CreatedAt,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "@sequelize/core/decorators-legacy"
import { PostgresDialect } from "@sequelize/postgres"

import { env } from "./env.mts"

@Table({ modelName: "user", tableName: "users" })
class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  @Attribute(DataTypes.INTEGER)
  @AutoIncrement
  @PrimaryKey
  id: CreationOptional<number>

  @CreatedAt
  createdAt: CreationOptional<Date>

  @UpdatedAt
  updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.TEXT)
  nickname: string
}

@Table({ modelName: "post", tableName: "posts" })
class Post extends Model<InferAttributes<Post>, InferCreationAttributes<Post>> {
  @Attribute(DataTypes.INTEGER)
  @AutoIncrement
  @PrimaryKey
  id: CreationOptional<number>

  @CreatedAt
  createdAt: CreationOptional<Date>

  @UpdatedAt
  updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.INTEGER)
  userId: number

  @Attribute(DataTypes.TEXT)
  title: string

  @Attribute(DataTypes.TEXT)
  content: string
}

@Table({ modelName: "tag", tableName: "tags" })
class Tag extends Model<InferAttributes<Tag>, InferCreationAttributes<Tag>> {
  @Attribute(DataTypes.INTEGER)
  @AutoIncrement
  @PrimaryKey
  id: CreationOptional<number>

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
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  postId: number

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  tagId: number

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
  url: env.DATABASE_URL,
})

export const cleanup = () => sequelize.close()

export const createUser = () => User.create({ nickname: "foo" })

export const updateUser = async (id: number) => {
  const [affected] = await User.update({ nickname: "bar" }, { where: { id } })

  return affected
}

export const updateAndReturnUser = async (id: number) => {
  const [, rows] = await User.update(
    { nickname: "bar" },
    { where: { id }, returning: true },
  )

  return rows
}

export const deleteUser = (id: number) => User.destroy({ where: { id } })

export const findUsers = () =>
  User.findAll({ order: [["id", "desc"]], limit: 1, offset: 0 })

export const findUser = (id: number) => User.findByPk(id)

export const createPost = (userId: number) =>
  Post.create({ userId, title: "foo", content: "foo" })

export const createTag = () => Tag.create({ name: "foo" })

export const createPostTag = (postId: number, tagId: number) =>
  PostTag.create({ postId, tagId })
