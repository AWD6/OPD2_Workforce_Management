# OPD 2 · ระบบจัดสรรกำลังบุคลากร

เว็บ static สำหรับใช้งานบน GitHub Pages

## วิธี deploy ด้วย GitHub Actions

โปรเจกต์นี้มี workflow อยู่ที่ `.github/workflows/deploy-pages.yml`
ระบบจะ deploy อัตโนมัติทุกครั้งที่ push เข้า branch `main`

1. อัปโหลดไฟล์ทั้งหมดเข้า repository โดยให้ `index.html` อยู่ที่ระดับรากของ repository
2. ตรวจสอบว่า branch หลักชื่อ `main` ถ้าใช้ชื่ออื่น ให้แก้ชื่อ branch ใน `.github/workflows/deploy-pages.yml`
3. ไปที่ **Settings → Pages**
4. ใน **Build and deployment → Source** เลือก **GitHub Actions**
5. ไปที่แท็บ **Actions** แล้วรอ workflow ชื่อ **Deploy OPD 2 Workforce to GitHub Pages** ทำงานเสร็จ
6. เปิด URL ที่ GitHub แสดงใน **Settings → Pages** หรือในรายละเอียดของ workflow

## หมายเหตุ

ไฟล์ข้อมูลที่ผู้ใช้กรอกจะเก็บไว้ใน browser ของเครื่องนั้นผ่าน `localStorage`
ข้อมูลจะไม่ถูกส่งขึ้น server และจะไม่ถูกรวมอยู่ใน GitHub repository