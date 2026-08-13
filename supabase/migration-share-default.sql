-- Run once on existing Supabase project (new installs use schema.sql)

alter table public.profiles
  alter column share_for_training set default true;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, share_for_training)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'share_for_training')::boolean, true)
  );
  return new;
end;
$$;
