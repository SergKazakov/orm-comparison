create table users (
  id uuid default uuidv7() primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nickname text not null unique
);

create table posts (
  id uuid default uuidv7() primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid not null references users,
  title text not null,
  content text not null
);

create table tags (
  id uuid default uuidv7() primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null
);

create table post_tags (
  post_id uuid references posts,
  tag_id uuid references tags,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (post_id, tag_id)
);
