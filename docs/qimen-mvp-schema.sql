create table if not exists divination_records (
  id text primary key,
  user_id text,
  skill text not null,
  question text,
  input_payload json not null,
  chart_payload json not null,
  ai_summary text,
  source text,
  created_at text not null default current_timestamp,
  updated_at text not null default current_timestamp
);

create index if not exists idx_divination_records_user_created
  on divination_records (user_id, created_at desc);

create index if not exists idx_divination_records_skill_created
  on divination_records (skill, created_at desc);
