-- ============================================================
-- Nail Time & Spa — Supabase Data API Grants
--
-- รัน SQL นี้ใน Supabase SQL Editor เพื่อรองรับ
-- Supabase policy ใหม่ (มีผล Oct 30, 2026)
--
-- grants ด้านล่างสอดคล้องกับ RLS policies ใน schema.sql
-- ============================================================

-- ------------------------------------------------------------
-- profiles
-- เฉพาะ authenticated เท่านั้น (ไม่เปิดให้ anon เห็น)
-- ------------------------------------------------------------
grant select, update
  on public.profiles
  to authenticated;

grant all
  on public.profiles
  to service_role;

-- ------------------------------------------------------------
-- services
-- anon อ่านได้ (แสดงบนหน้าเว็บ), admin จัดการผ่าน service_role
-- ------------------------------------------------------------
grant select
  on public.services
  to anon;

grant select
  on public.services
  to authenticated;

grant all
  on public.services
  to service_role;

-- ------------------------------------------------------------
-- time_slots
-- anon อ่านได้ (ดูคิวว่าง), admin จัดการผ่าน service_role
-- ------------------------------------------------------------
grant select
  on public.time_slots
  to anon;

grant select
  on public.time_slots
  to authenticated;

grant all
  on public.time_slots
  to service_role;

-- ------------------------------------------------------------
-- bookings
-- anon: อ่าน + สร้างได้ (รองรับ guest booking / LINE LIFF)
-- authenticated: อ่าน + สร้าง + แก้ไข (ยกเลิก)
-- ------------------------------------------------------------
grant select, insert
  on public.bookings
  to anon;

grant select, insert, update
  on public.bookings
  to authenticated;

grant all
  on public.bookings
  to service_role;

-- ------------------------------------------------------------
-- seo_settings
-- ทุกคนอ่านได้ (ใช้ generate metadata), admin จัดการ
-- ------------------------------------------------------------
grant select
  on public.seo_settings
  to anon;

grant select
  on public.seo_settings
  to authenticated;

grant all
  on public.seo_settings
  to service_role;

-- ------------------------------------------------------------
-- slot_availability (VIEW)
-- ทุกคนอ่านได้ (ใช้เช็คว่าคิวเต็มไหม)
-- ------------------------------------------------------------
grant select
  on public.slot_availability
  to anon;

grant select
  on public.slot_availability
  to authenticated;
