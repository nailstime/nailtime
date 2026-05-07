-- ============================================================
-- 1. อัพเดต generate_time_slots ให้รวมวันอาทิตย์ด้วย
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
  where extract(dow from d) between 0 and 6  -- 0=อา, 1=จ, ..., 6=ส (ทุกวัน)
  on conflict (slot_date, start_time) do nothing;
end;
$$;


-- ============================================================
-- 2. สร้าง function บำรุงรักษา slot รายเดือน
--    - ลบ time_slots เดือนก่อนหน้า (bookings ไม่ลบ)
--    - สร้าง time_slots เดือนถัดไป 30 วัน
-- ============================================================
create or replace function public.monthly_slot_maintenance()
returns void
language plpgsql
as $$
declare
  prev_month_start date := date_trunc('month', current_date - interval '1 month')::date;
  prev_month_end   date := (date_trunc('month', current_date)::date - 1);
  next_month_start date := date_trunc('month', current_date + interval '1 month')::date;
  next_month_end   date := next_month_start + 29;  -- 30 วัน (วันแรก + 29)
begin
  -- ลบ time_slots เดือนก่อน
  -- bookings ยังอยู่ครบ เพราะ slot_id เป็น on delete set null
  delete from public.time_slots
  where slot_date between prev_month_start and prev_month_end;

  -- สร้าง time_slots เดือนถัดไป
  insert into public.time_slots (slot_date, start_time, end_time, capacity)
  select
    d::date,
    slot_start::time,
    (slot_start + interval '15 minutes')::time,
    1  -- ปรับ capacity ตรงนี้ถ้าต้องการ
  from generate_series(next_month_start, next_month_end, interval '1 day') d
  cross join lateral generate_series(
    d::timestamp + '10:00'::time,
    d::timestamp + '19:30'::time - interval '15 minutes',
    interval '15 minutes'
  ) slot_start
  where extract(dow from d) between 0 and 6
  on conflict (slot_date, start_time) do nothing;

  raise notice 'ลบ slots % ถึง % | สร้าง slots % ถึง %',
    prev_month_start, prev_month_end, next_month_start, next_month_end;
end;
$$;


-- ============================================================
-- 3. เปิด pg_cron (ถ้ายังไม่ได้เปิด)
--    → ต้องเปิดใน Supabase Dashboard → Database → Extensions → pg_cron ก่อน
--      หรือรัน SQL บรรทัดนี้ (ต้องใช้ Supabase Pro ขึ้นไป)
-- ============================================================
create extension if not exists pg_cron;


-- ============================================================
-- 4. ตั้ง cron job: รันวันที่ 1 ของทุกเดือน เวลา 01:00 น.
-- ============================================================
select cron.schedule(
  'monthly-slot-maintenance',  -- ชื่อ job (unique)
  '0 1 1 * *',                 -- cron expression: วันที่ 1, ทุกเดือน, 01:00
  $$select public.monthly_slot_maintenance();$$
);


-- ============================================================
-- 5. รัน generate_time_slots ทันที เพื่อเพิ่ม slot วันอาทิตย์
--    ที่ยังไม่มีในระบบ (จะ skip วันที่มีอยู่แล้ว)
-- ============================================================
select public.generate_time_slots();


-- ============================================================
-- ตรวจสอบ cron jobs ที่ตั้งไว้
-- ============================================================
-- select * from cron.job;

-- ถ้าต้องการลบ cron job:
-- select cron.unschedule('monthly-slot-maintenance');

-- ทดสอบ function โดยไม่ต้องรอวันที่ 1:
-- select public.monthly_slot_maintenance();
