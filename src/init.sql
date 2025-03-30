create table users (
  id int generated always as identity (minvalue -2147483648) primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nickname text not null
);

create table posts (
  id int generated always as identity (minvalue -2147483648) primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id int not null references users,
  title text not null,
  content text not null
);

create table tags (
  id int generated always as identity (minvalue -2147483648) primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null
);

create table post_tags (
  post_id int references posts,
  tag_id int references tags,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (post_id, tag_id)
);
