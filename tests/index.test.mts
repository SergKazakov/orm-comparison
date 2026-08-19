import { beforeAll, describe, expect, it } from "vitest"

describe.each(
  Object.entries({
    drizzle: () => import("../src/drizzle.mts"),
    knex: () => import("../src/knex.mts"),
    kysely: () => import("../src/kysely.mts"),
    mikroorm: () => import("../src/mikroorm.mts"),
    prisma: () => import("../src/prisma.mts"),
    sequelize: () => import("../src/sequelize.mts"),
    typeorm: () => import("../src/typeorm.mts"),
  }),
)("%s", (_, loader) => {
  let orm: Awaited<ReturnType<typeof loader>>

  beforeAll(async () => {
    orm = await loader()

    return async () => {
      await orm.cleanup()
    }
  })

  const withId = { id: expect.any(String) }

  const withTimestamp = {
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
  }

  const missingId = Bun.randomUUIDv7()

  it("should create user", async () => {
    await expect(orm.createUser()).resolves.toMatchObject({
      ...withId,
      ...withTimestamp,
      nickname: expect.any(String),
    })
  })

  it("should create user on conflict do update", async () => {
    const nickname = Bun.randomUUIDv7()

    await orm.createUserOnConflictDoUpdate(nickname)

    await expect(
      orm.createUserOnConflictDoUpdate(nickname),
    ).resolves.toBeDefined()
  })

  it("should create user on conflict do nothing", async () => {
    const nickname = Bun.randomUUIDv7()

    await orm.createUserOnConflictDoNothing(nickname)

    await orm.createUserOnConflictDoNothing(nickname)
  })

  it("should update user", async () => {
    const user = await orm.createUser()

    await Promise.all(
      [
        { id: user.id, expected: 1 },
        { id: missingId, expected: 0 },
      ].map(it =>
        expect(orm.updateManyUsers(it.id)).resolves.toBe(it.expected),
      ),
    )
  })

  it("should update and return user", async () => {
    const user = await orm.createUser()

    const [row] = await orm.updateManyUsersAndReturn(user.id)

    expect(row).toMatchObject({
      ...withId,
      ...withTimestamp,
      nickname: expect.any(String),
    })

    expect(row.updatedAt.getTime()).toBeGreaterThan(row.createdAt.getTime())

    await expect(orm.updateManyUsersAndReturn(missingId)).resolves.toHaveLength(
      0,
    )
  })

  it("should delete user", async () => {
    const user = await orm.createUser()

    await Promise.all(
      [
        { id: user.id, expected: 1 },
        { id: missingId, expected: 0 },
      ].map(it =>
        expect(orm.deleteManyUsers(it.id)).resolves.toBe(it.expected),
      ),
    )
  })

  it("should delete and return user", async () => {
    if (!("deleteManyUsersAndReturn" in orm)) {
      return
    }

    const user = await orm.createUser()

    await expect(orm.deleteManyUsersAndReturn(user.id)).resolves.toMatchObject([
      {
        id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        nickname: expect.any(String),
      },
    ])

    await expect(orm.deleteManyUsersAndReturn(user.id)).resolves.toHaveLength(0)
  })

  it("should find users", async () => {
    await orm.createUser()

    await expect(orm.findUsers()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...withId,
          ...withTimestamp,
          nickname: expect.any(String),
        }),
      ]),
    )
  })

  it("should find user", async () => {
    const user = await orm.createUser()

    await expect(orm.findUser(user.id)).resolves.toMatchObject({
      ...withId,
      ...withTimestamp,
      nickname: expect.any(String),
    })
  })

  it("should create post", async () => {
    const user = await orm.createUser()

    await expect(orm.createPost(user.id)).resolves.toMatchObject({
      ...withId,
      ...withTimestamp,
      userId: expect.any(String),
      title: expect.any(String),
      content: expect.any(String),
    })
  })

  it("should create tag", async () => {
    await expect(orm.createTag()).resolves.toMatchObject({
      ...withId,
      ...withTimestamp,
      name: expect.any(String),
    })
  })

  it("should create post tag", async () => {
    const user = await orm.createUser()

    const [post, tag] = await Promise.all([
      orm.createPost(user.id),
      orm.createTag(),
    ])

    await expect(orm.createPostTag(post.id, tag.id)).resolves.toMatchObject({
      ...withTimestamp,
      postId: expect.any(String),
      tagId: expect.any(String),
    })
  })
})
