-- Run once in Supabase: SQL Editor > New query > paste > Run
create table subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  created_at timestamptz default now()
);
create table materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  subject_id uuid not null references subjects on delete cascade,
  system text not null check (system in ('British','IB','American')),
  grade int not null check (grade between 6 and 12),
  skill text not null check (skill in ('Reading Skills','Reading Comprehension','Vocabulary Strategies','Grammar','Writing')),
  writing_type text check (writing_type in ('Fiction','Non-fiction','Analytical Essay')),
  folder text not null check (folder in ('PPT','Worksheet')),
  file_name text not null, file_size bigint, mime_type text,
  storage_path text not null,
  created_at timestamptz default now(),
  check ((skill='Writing') = (writing_type is not null))
);
create index on materials (user_id, subject_id);
alter table subjects enable row level security;
alter table materials enable row level security;
create policy "own subjects" on subjects for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "own materials" on materials for all using (user_id=auth.uid()) with check (user_id=auth.uid());

-- Private file bucket; each teacher can only touch the folder named after their user id
insert into storage.buckets (id,name,public) values ('materials','materials',false) on conflict do nothing;
create policy "own files select" on storage.objects for select using (bucket_id='materials' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "own files insert" on storage.objects for insert with check (bucket_id='materials' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "own files delete" on storage.objects for delete using (bucket_id='materials' and (storage.foldername(name))[1]=auth.uid()::text);
