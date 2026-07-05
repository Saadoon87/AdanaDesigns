-- Replace these emails with your two approved login emails before running.
insert into public.allowed_users (email)
values
  ('you@example.com'),
  ('wife@example.com')
on conflict (email) do nothing;
