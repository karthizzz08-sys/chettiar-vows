
alter function public.set_updated_at() set search_path = public;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop policy if exists "Profile photos public read" on storage.objects;
create policy "Profile photos read by exact path"
  on storage.objects for select
  using (bucket_id = 'profile-photos' and array_length(string_to_array(name,'/'),1) >= 2);
update storage.buckets set public = false where id = 'profile-photos';
