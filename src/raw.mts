export const sqlToSelectUsers = `
  select
    *,
    array(
      select
        jsonb_build_object(
          'id', p.id,
          'title', p.id,
          'content', p.id,
          'tags', array(
            select row_to_json(t.*)
            from post_tags pt
            join tags t on pt.tag_id = t.id
            where pt.post_id = p.id
          )
        )
      from posts p
      where p.user_id = u.id
    ) posts
  from users u
`
