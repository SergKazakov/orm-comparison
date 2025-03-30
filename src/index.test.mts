import { beforeAll, describe, expect, it } from "vitest"

type WithId = { id: number }

describe.each([
  ["drizzle"],
  ["knex"],
  ["mikroorm"],
  ["prisma"],
  ["sequelize"],
  ["typeorm"],
])("%s", filename => {
  let cleanup: () => Promise<any>

  let createUser: () => Promise<WithId>

  let updateUser: (id: number) => Promise<any>

  let updateAndReturnUser: (id: number) => Promise<any>

  let deleteUser: (id: number) => Promise<any>

  let findUsers: () => Promise<any>

  let findUser: (id: number) => Promise<any>

  let createPost: (userId: number) => Promise<WithId>

  let createTag: () => Promise<WithId>

  let createPostTag: (postId: number, tagId: number) => Promise<any>

  beforeAll(async () => {
    ;({
      cleanup,
      createUser,
      updateUser,
      updateAndReturnUser,
      deleteUser,
      findUsers,
      findUser,
      createPost,
      createTag,
      createPostTag,
    } = await import(`./${filename}.mts`))

    return async () => {
      await cleanup()
    }
  })

  const withId = { id: expect.any(Number) }

  const withTimestamp = {
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
  }

  it("should create user", async () => {
    await expect(createUser()).resolves.toMatchObject({
      ...withId,
      ...withTimestamp,
      nickname: expect.any(String),
    })
  })

  it("should update user", async () => {
    const user = await createUser()

    await Promise.all(
      [
        { id: user.id, expected: 1 },
        { id: 0, expected: 0 },
      ].map(it => expect(updateUser(it.id)).resolves.toBe(it.expected)),
    )
  })

  it("should update and return user", async () => {
    const user = await createUser()

    const [row] = await updateAndReturnUser(user.id)

    expect(row).toMatchObject({
      ...withId,
      ...withTimestamp,
      nickname: expect.any(String),
    })

    expect(row.updatedAt.getTime()).toBeGreaterThan(row.createdAt.getTime())

    await expect(updateAndReturnUser(0)).resolves.toHaveLength(0)
  })

  it("should delete user", async () => {
    const user = await createUser()

    await Promise.all(
      [
        { id: user.id, expected: 1 },
        { id: 1, expected: 0 },
      ].map(it => expect(deleteUser(it.id)).resolves.toBe(it.expected)),
    )
  })

  it("should find users", async () => {
    await createUser()

    await expect(findUsers()).resolves.toEqual(
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
    const user = await createUser()

    await expect(findUser(user.id)).resolves.toMatchObject({
      ...withId,
      ...withTimestamp,
      nickname: expect.any(String),
    })
  })

  it("should create post", async () => {
    const user = await createUser()

    await expect(createPost(user.id)).resolves.toMatchObject({
      ...withId,
      ...withTimestamp,
      userId: expect.any(Number),
      title: expect.any(String),
      content: expect.any(String),
    })
  })

  it("should create tag", async () => {
    await expect(createTag()).resolves.toMatchObject({
      ...withId,
      ...withTimestamp,
      name: expect.any(String),
    })
  })

  it("should create post tag", async () => {
    const user = await createUser()

    const [post, tag] = await Promise.all([createPost(user.id), createTag()])

    await expect(createPostTag(post.id, tag.id)).resolves.toMatchObject({
      ...withTimestamp,
      postId: expect.any(Number),
      tagId: expect.any(Number),
    })
  })
})
