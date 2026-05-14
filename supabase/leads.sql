-- ============================================================
-- Nail Time — Leads (LINE Coupon Sign-up)
-- รันใน Supabase SQL Editor เพื่อสร้างตาราง leads
-- ============================================================

create table public.leads (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  phone       text not null,
  coupon_sent boolean default false,
  created_at  timestamptz default now()
);

alter table public.leads enable row level security;

-- ลูกค้าทุกคน (anon/authenticated) สมัครได้
create policy "Anyone can submit lead"
  on public.leads
  for insert
  to anon, authenticated
  with check (
    name is not null and phone is not null
  );

-- เฉพาะ admin ดูรายชื่อ leads ได้
create policy "Admins can view leads"
  on public.leads
  for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update lead"
  on public.leads
  for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

grant insert on public.leads to anon;
grant insert on public.leads to authenticated;
grant all on public.leads to service_role;
