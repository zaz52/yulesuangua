create table if not exists divination_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  skill text not null,
  question text not null default '',
  input_payload jsonb not null default '{}'::jsonb,
  chart_dto jsonb not null default '{}'::jsonb,
  ai_answer text null,
  status text not null default 'completed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint divination_records_skill_check
    check (skill in (
      'bazi',
      'ziwei',
      'qimen',
      'liuyao',
      'meihua',
      'daliuren',
      'xiaoliuren',
      'yinyuan',
      'hehun',
      'fojiao',
      'fengshui',
      'daily-fortune',
      'tarot'
    )),
  constraint divination_records_status_check
    check (status in ('pending', 'completed', 'failed'))
);

create index if not exists divination_records_user_created_idx
  on divination_records (user_id, created_at desc);

create index if not exists divination_records_skill_created_idx
  on divination_records (skill, created_at desc);
