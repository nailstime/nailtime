-- ============================================================
-- Nail Time & Spa — Supabase Schema
-- วิธีใช้: paste ทั้งหมดนี้ใน Supabase SQL Editor แล้วกด Run
--
-- หมายเหตุหลังรัน schema:
-- 1) ตาราง time_slots จะยังว่างอยู่ ต้องรัน `select public.generate_time_slots();`
--    อย่างน้อย 1 ครั้ง เพื่อสร้างเวลาว่างล่วงหน้า
-- 2) ยังไม่ได้ตั้ง cron job อัตโนมัติ ดูตัวอย่างท้ายไฟล์ในหัวข้อ OPTIONAL CRON JOB
-- 3) ระบบจองใช้ slot จริงทุก 15 นาทีเท่านั้น
--    service duration ต้องหาร 15 ลงตัว เช่น 30, 45, 60, 90 นาที
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (ต่อจาก auth.users ของ Supabase)
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  line_uid    text unique,
  line_display_name text,
  line_picture_url  text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SERVICES (บริการ)
-- ============================================================
create table public.services (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  name_en     text,
  description text,
  duration    int not null default 60 check (duration > 0 and duration % 15 = 0),  -- นาที
  price       numeric(10,2),
  is_active   boolean default true,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

alter table public.services enable row level security;

create policy "Anyone can view active services"
  on public.services for select using (is_active = true);

create policy "Admins can manage services"
  on public.services for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Seed บริการเริ่มต้น
insert into public.services (name, name_en, description, duration, price, sort_order) values
  ('ทำเล็บเจล',     'Gel Nails',       'เจลคุณภาพสูง ติดทนนาน 3–4 สัปดาห์', 60,  null, 1),
  ('เพ้นท์เล็บ',    'Nail Art',        'ลายอิสระ สไตล์ญี่ปุ่น ทุกแบบ',       45,  null, 2),
  ('ต่อเล็บเจล',    'Gel Extension',   'ยาวสวย แข็งแรง รูปทรงตามต้องการ',    90,  null, 3),
  ('อะคีลิก',       'Acrylic',         'ทนทานเป็นพิเศษ รูปทรงสวย',           90,  null, 4),
  ('PVC / แก้ว',    'PVC Glass Effect','เทรนด์ฮิต ดูโมเดิร์น effect ใส',     60,  null, 5),
  ('สปามือ & เท้า', 'Nail Spa',        'ดูแลครบวงจร ขัดผิว นวดผ่อนคลาย',    60,  null, 6);

-- ============================================================
-- TIME SLOTS (ช่วงเวลาว่างแต่ละวัน)
-- ============================================================
create table public.time_slots (
  id          uuid primary key default uuid_generate_v4(),
  slot_date   date not null,
  start_time  time not null,
  end_time    time not null,
  capacity    int not null default 1,  -- จำนวนช่างที่ว่าง
  is_active   boolean default true,
  created_at  timestamptz default now(),
  unique (slot_date, start_time),
  check (end_time = start_time + interval '15 minutes')
);

alter table public.time_slots enable row level security;

create policy "Anyone can view active slots"
  on public.time_slots for select using (is_active = true);

create policy "Admins can manage slots"
  on public.time_slots for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- BOOKINGS (การจอง)
-- ============================================================
create table public.bookings (
  id              uuid primary key default uuid_generate_v4(),
  booking_no      text unique not null default 'NT-' || to_char(now(), 'YYYYMMDD') || '-' || floor(random()*9000+1000)::text,
  user_id         uuid references public.profiles(id),
  -- สำหรับ guest / LINE ที่ยังไม่ login
  guest_name      text,
  guest_phone     text,
  guest_line_uid  text,
  service_id      uuid not null references public.services(id),
  slot_id         uuid references public.time_slots(id) on delete set null,
  slot_date       date not null,
  start_time      time not null,
  end_time        time not null,
  note            text,
  status          text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.bookings enable row level security;

create policy "Users can view own bookings"
  on public.bookings for select using (
    auth.uid() = user_id or guest_line_uid is not null
  );

create policy "Anyone can create booking"
  on public.bookings
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and service_id is not null
    and slot_id is not null
    and slot_date is not null
    and start_time is not null
    and end_time is not null
    and (
      (auth.uid() is not null and user_id = auth.uid())
      or (
        user_id is null
        and guest_name is not null
        and (guest_phone is not null or guest_line_uid is not null)
      )
    )
  );

create policy "Users can cancel own booking"
  on public.bookings for update using (auth.uid() = user_id)
  with check (status = 'cancelled');

create policy "Admins can manage all bookings"
  on public.bookings for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.set_updated_at();

-- View: slot พร้อม booked count (ใช้เช็คว่าเต็มไหม)
create or replace view public.slot_availability as
select
  s.id,
  s.slot_date,
  s.start_time,
  s.end_time,
  s.capacity,
  s.is_active,
  count(b.id) filter (where b.status in ('pending','confirmed')) as booked_count,
  s.capacity - count(b.id) filter (where b.status in ('pending','confirmed')) as available
from public.time_slots s
left join public.bookings b on b.slot_id = s.id
group by s.id;

-- ============================================================
-- SLOT GENERATOR
-- สร้าง time_slots ทุก 15 นาทีล่วงหน้า และลบ slots วันที่ผ่านมาแล้ว
--
-- วิธีรันครั้งแรก:
--   select public.generate_time_slots();
--
-- ค่า default:
--   - สร้างล่วงหน้า 60 วัน
--   - เปิด 10:00 ถึง 18:00
--   - จันทร์-เสาร์
--   - capacity = 1
--
-- ถ้าต้องการเปลี่ยนจำนวนช่าง/ที่นั่ง:
--   select public.generate_time_slots(default_capacity := 2);
-- ============================================================
create or replace function public.generate_time_slots(
  days_ahead int default 60,
  open_time time default '10:00',
  close_time time default '19:30',
  default_capacity int default 1
)
returns void
language plpgsql
as $$
begin
  -- ลบ slot ที่เลยวันทั้งหมดได้ เพราะ bookings เก็บ snapshot วัน/เวลาไว้เองแล้ว
  delete from public.time_slots
  where slot_date < current_date;

  insert into public.time_slots (slot_date, start_time, end_time, capacity)
  select
    d::date,
    slot_start::time,
    (slot_start + interval '15 minutes')::time,
    default_capacity
  from generate_series(current_date, current_date + days_ahead, interval '1 day') d
  cross join lateral generate_series(
    d::timestamp + open_time,
    d::timestamp + close_time - interval '15 minutes',
    interval '15 minutes'
  ) slot_start
  where extract(dow from d) between 0 and 6  -- 0=อา ถึง 6=ส (ทุกวัน)
  on conflict (slot_date, start_time) do nothing;
end;
$$;

-- ============================================================
-- SEO SETTINGS (admin แก้ meta ทุกหน้า)
-- ============================================================
create table public.seo_settings (
  id              uuid primary key default uuid_generate_v4(),
  page_key        text unique not null,  -- 'home', 'booking', 'about' ฯลฯ
  title           text,
  description     text,
  og_title        text,
  og_description  text,
  og_image        text,
  keywords        text,
  updated_at      timestamptz default now()
);

alter table public.seo_settings enable row level security;

create policy "Anyone can read SEO"
  on public.seo_settings for select using (true);

create policy "Admins can manage SEO"
  on public.seo_settings for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Seed SEO หน้าหลัก
insert into public.seo_settings (page_key, title, description, keywords) values
  ('home',    'Nail Time & Spa ネイルタイム — ดอนหัวฬอ ชลบุรี', 'ร้านทำเล็บเจล เพ้นท์เล็บ ต่อเล็บ สไตล์ญี่ปุ่น ดอนหัวฬอ ชลบุรี', 'ร้านทำเล็บ,เล็บเจล,ดอนหัวฬอ,ชลบุรี'),
  ('booking', 'จองนัด — Nail Time & Spa', 'จองนัดทำเล็บออนไลน์ ดูคิวว่างได้ทันที', 'จองนัดทำเล็บ,คิวว่าง'),
  ('liff',    'จองนัดผ่าน LINE — Nail Time & Spa', 'จองนัดทำเล็บผ่าน LINE ง่ายๆ', 'จองนัด LINE,ทำเล็บ');

-- ============================================================
-- OPTIONAL CRON JOB (ยังไม่ได้เปิดใช้งานโดยอัตโนมัติ)
--
-- ถ้าต้องการให้ Supabase สร้าง slot ใหม่ทุกวันเอง:
-- 1) เปิด extension pg_cron ก่อน
-- 2) uncomment SQL ด้านล่าง แล้วรันใน SQL Editor
--
-- หมายเหตุ:
-- - schedule นี้รันทุกวัน 01:00 ตาม timezone ของ database
-- - function จะลบ slot วันที่ผ่านมาแล้ว และเติม slot ล่วงหน้าให้ครบ 60 วัน
-- ============================================================
-- create extension if not exists pg_cron;
--
-- select cron.schedule(
--   'generate-nailtime-slots',
--   '0 1 * * *',
--   $$select public.generate_time_slots();$$
-- );
