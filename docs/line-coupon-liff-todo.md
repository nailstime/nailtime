# LINE Coupon LIFF — Todo List

ลูกค้ากรอกฟอร์มใน LIFF (ภายใน LINE) → ได้ userId → Push คูปอง 50 บาทอัตโนมัติ

---

## 1. LINE Developers Console

- [ ] เข้า https://developers.line.biz → เลือก Provider ของร้าน
- [ ] ตรวจสอบว่ามี **Messaging API channel** อยู่แล้วหรือยัง
  - ถ้ายังไม่มี → สร้างใหม่ ประเภท "Messaging API"
- [ ] คัดลอก **Channel Access Token (long-lived)** เก็บไว้
- [ ] ตรวจสอบว่า LIFF app ที่มีอยู่ (liff/booking) ใช้ channel ไหน
  - ถ้า LIFF กับ Messaging คนละ channel → ต้องสร้าง LIFF app ใหม่ในช่อง Messaging API

---

## 2. สร้าง LIFF App สำหรับ Coupon

- [ ] ใน LINE Developers → LIFF tab → Add LIFF app
  - **Endpoint URL**: `https://nailtimebytt.com/liff/coupon`
  - **Scope**: `profile`
  - **Bot link feature**: On (Aggressive) — ให้ลูกค้า add OA อัตโนมัติ
- [ ] คัดลอก **LIFF ID** ที่ได้ เก็บไว้ใส่ env

---

## 3. Environment Variables

เพิ่มใน `.env.local` และ Vercel Dashboard:

```
NEXT_PUBLIC_LIFF_COUPON_ID=xxxx-xxxxxxxx   # LIFF ID ของ coupon page
LINE_CHANNEL_ACCESS_TOKEN=xxxxxxxxxxxx      # Channel Access Token
```

---

## 4. อัปเดต leads table (Supabase)

รัน SQL นี้ใน Supabase SQL Editor:

```sql
alter table public.leads
  add column if not exists line_uid text;
```

---

## 5. สร้าง API Route สำหรับส่ง Push Message

สร้างไฟล์: `src/app/api/line/coupon/route.ts`

```
POST /api/line/coupon
body: { name, phone, lineUid }

1. บันทึก lead ใน Supabase (name, phone, line_uid)
2. Push message ด้วย LINE Messaging API
   → ข้อความคูปอง 50 บาท + วิธีใช้
3. return { success: true }
```

---

## 6. สร้าง LIFF Coupon Page

สร้างไฟล์: `src/app/liff/coupon/page.tsx`

```
1. liff.init({ liffId: LIFF_COUPON_ID })
2. liff.getProfile() → ได้ userId, displayName
3. แสดงฟอร์มกรอกเบอร์โทร (ชื่อดึงจาก LINE profile)
4. submit → POST /api/line/coupon
5. success → แสดง "รับคูปองแล้ว!" พร้อมรายละเอียด
```

---

## 7. อัปเดต LineCouponForm บนเว็บ

แก้ไฟล์: `src/components/sections/LineCouponForm.tsx`

- เปลี่ยนจากฟอร์มบนเว็บ → ปุ่ม "รับคูปอง 50 บาท"
- คลิก → เปิด `https://liff.line.me/{LIFF_COUPON_ID}`

---

## ลำดับการทำ

1 → 2 → 3 → 4 → 5 → 6 → 7

ทดสอบโดยเปิดลิงก์ LIFF บนมือถือที่ลง LINE แล้ว
