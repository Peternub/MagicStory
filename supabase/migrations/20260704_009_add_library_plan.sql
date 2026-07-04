insert into public.subscription_plans (
  code,
  name,
  description,
  price_rub,
  stories_limit,
  is_active
)
values (
  'library-monthly',
  'Библиотека',
  'Ежемесячный доступ к каталогу готовых сказок',
  59,
  0,
  true
)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  price_rub = excluded.price_rub,
  stories_limit = excluded.stories_limit,
  is_active = excluded.is_active;
