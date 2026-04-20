alter table public.children
  add column if not exists gender text not null default 'boy';

alter table public.children
  drop constraint if exists children_gender_check;

alter table public.children
  add constraint children_gender_check check (gender in ('boy', 'girl'));
