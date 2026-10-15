<div align="center">

<img src="docs/assets/logo.png" alt="Phone Master" width="120" />

# Phone Master · فون ماستر

**نظام سطح مكتب متكامل لإدارة محل بيع وتصليح الهواتف**
*An offline-first desktop system for managing a mobile phone sales & repair shop*

[![Release](https://img.shields.io/github/v/release/zakidri27/phone-master?style=for-the-badge&color=6366f1)](https://github.com/zakidri27/phone-master/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows-0ea5e9?style=for-the-badge)](#-التثبيت--installation)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=000)](https://react.dev)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848f?style=for-the-badge&logo=electron)](https://www.electronjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Embedded-4169e1?style=for-the-badge&logo=postgresql&logoColor=fff)](https://www.postgresql.org)

[🔗 موقع المشروع](https://zakidri27.github.io/phone-master/) · [⬇️ تحميل النسخة](https://github.com/zakidri27/phone-master/releases/latest) · [🐞 الإبلاغ عن مشكلة](https://github.com/zakidri27/phone-master/issues)

</div>

---

## 🌐 نظرة عامة · Overview

**فون ماستر** تطبيق سطح مكتب (Desktop) احترافي مصمّم لإدارة محل بيع وتصليح الهواتف المحمولة
من الألف إلى الياء: المخزون، نقطة البيع، الفواتير، الصيانة، التقسيط، المصروفات، الأرباح والتقارير.

يعمل التطبيق **بالكامل بدون إنترنت (Offline-first)** — حيث يُشغّل خادم Next.js محلياً داخل
تطبيق Electron، ويقوم تلقائياً بتهيئة **قاعدة بيانات PostgreSQL مدمجة** عند أول تشغيل، دون أي
إعداد يدوي من المستخدم.

> **Phone Master** is a professional **Electron desktop application** for running a phone
> sales & repair shop end-to-end. It is **offline-first**: a local Next.js server runs inside
> Electron and an **embedded PostgreSQL** database is provisioned automatically on first launch —
> zero manual configuration.

---

## ✨ المميزات الرئيسية · Key Features

| # | الوحدة | الوصف |
|---|--------|-------|
| 📦 | **المخزون** | إدارة الهواتف والملحقات: الماركة، الطراز، اللون، السعة، الرAM، الـ IMEI، التكلفة وسعر البيع، تنبيهات الحد الأدنى للمخزون. |
| 🧾 | **نقطة البيع (الكاشير)** | إنشاء فواتير سريعة، خصومات، طرق دفع متعددة، وطباعة الإيصالات. |
| 💰 | **المبيعات** | الفواتير، ربط العملاء، متابعة المبيعات اليومية والإجمالية. |
| 🛒 | **المشتريات** | فواتير الموردين وإعادة تعبئة المخزون. |
| 🔧 | **التصليحات** | تذاكر صيانة، تشخيص الأعطال، قطع الغيار، تعيين الفني، تتبّع الحالة (مستلم → قيد الإصلاح → مكتمل)، الدفعة المقدمة. |
| 📅 | **التقسيط** | الدفعة الأولى، جدول الأقساط الشهرية، الأقساط المتبقية، مواعيد الاستحقاق وسجل الدفعات. |
| 💸 | **المصروفات** | تصنيف المصروفات وطرق الدفع ومتابعتها. |
| 📈 | **الأرباح** | تحليل الأرباح (التكلفة مقابل سعر البيع) وتقارير الربحية. |
| 📊 | **التقارير** | تقارير تفصيلية مع **تصدير إلى Excel**. |
| 👷 | **العاملون** | الأدوار، الرواتب، صلاحيات الوصول لكل صفحة عبر **PIN**. |
| ⚙️ | **الإعدادات** | اسم المحل، الشعار، العملة، نسبة الضريبة، تذييل الإيصال، رمز المدير. |
| 🛡️ | **النسخ الاحتياطي** | نسخ واسترجاع قاعدة البيانات. |

### 🌍 مزايا عامة · General
- 🌐 **ثنائي اللغة (عربي / إنجليزي)** مع دعم كامل لتنسيق **RTL**.
- 🌙 **الوضع الليلي / النهاري**.
- 📴 **يعمل دون إنترنت** — بياناتك تبقى على جهازك.
- 🖥️ **تطبيق سطح مكتب أصلي** بواجهة سريعة وغنية.

---

## 🧩 الوحدات والصفحات · Modules & Pages

```text
تسجيل الدخول  →  الرئيسية  →  { الكاشير · المخزون · المبيعات · المشتريات ·
                                 التصليحات · التقسيط · المصروفات · الأرباح ·
                                 التقارير · العاملون · الإعدادات · النسخ الاحتياطي }
```

**واجهات برمجية (API Routes):** `auth` · `products` · `customers` · `sales` · `purchases` ·
`repairs` · `installments` · `expenses` · `profits` · `reports` · `dashboard` · `settings` ·
`store` · `workers` · `upload` · `backup` · `export-excel` · `reset` · `seed` · `health`

---

## 🛠️ التقنيات المستخدمة · Tech Stack

| الطبقة | التقنية |
|--------|---------|
| **واجهة المستخدم** | Next.js 16 · React 19 · Tailwind CSS · Lucide React |
| **سطح المكتب** | Electron (single-instance، splash screen، تعزيز أمني) |
| **قاعدة البيانات** | PostgreSQL (مدمجة) · Drizzle ORM · driver `pg` |
| **أدوات** | ExcelJS (تصدير Excel) · date-fns · dotenv · electron-builder |

---

## 🏗️ البنية المعمارية · Architecture

```text
┌────────────────────────────  Electron ────────────────────────────┐
│                                                                   │
│   1) ensureDatabase()  ──►  يفحص DATABASE_URL ثم PostgreSQL       │
│                              النظام، وإلا يشغّل PostgreSQL مدمج    │
│                              على منفذ محلي حر (5432–5452)          │
│                                                                   │
│   2) startNextServer() ──►  يشغّل خادم Next.js داخلياً            │
│                              على http://127.0.0.1:3179            │
│                                                                   │
│   3) createWindow()    ──►  نافذة آمنة (contextIsolation +         │
│                              sandbox + حجب الشبكة الخارجية)        │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

- **تشغيل أوفلاين بالكامل**: لا يخرج التطبيق أي طلب للشبكة؛ كل الاتصالات محصورة على
  `127.0.0.1`.
- **قاعدة بيانات محمولة**: إن وُجد PostgreSQL على المنفذ 5432 يُستخدم، وإلا يُشغَّل نسخة مدمجة
  مستقلة تماماً داخل مجلد المستخدم.

### الأمان · Security
- `contextIsolation: true` و `nodeIntegration: false` و `sandbox: true`.
- **حجب جميع الطلبات الشبكية الخارجية** عبر `webRequest.onBeforeRequest`.
- تعطيل أدوات المطوّر ومفاتيح الوظائف (`F12`, `Ctrl+Shift+I`, `Ctrl+U` …).
- قفل النسخة الواحدة (Single-instance lock) لمنع تشغيل نسختين.

---

## ⬇️ التثبيت · Installation

### للمستخدم النهائي (Windows)
1. حمّل المثبّت من صفحة [Releases](https://github.com/zakidri27/phone-master/releases/latest).
2. شغّل `PhoneMaster-Setup-1.0.0.exe` واتبع خطوات التثبيت.
3. افتح **فون ماستر** — سيتم تجهيز قاعدة البيانات تلقائياً عند أول تشغيل.

> **Windows only** — Download the installer from the Releases page and run it. The database is set up automatically on first launch.

### للمطوّرين · For Developers

```bash
# 1) تثبيت الحزم
npm install

# 2) تشغيل واجهة Next.js في وضع التطوير
npm run dev

# 3) تشغيل تطبيق Electron
npm run electron:dev

# 4) بناء نسخة الإنتاج ومثبّت Electron
npm run electron:build
```

**(اختياري)** لاستخدام قاعدة بيانات خارجية، أنشئ ملف `.env` بجانب التطبيق:

```env
DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/app_db
```

---

## 📸 لقطات الشاشة · Screenshots

> تُضاف اللقطات في مجلد [`docs/`](docs). يمكنك تجربة واجهة المشروع مباشرة من
> [صفحة العرض](https://zakidri27.github.io/phone-master/).

---

## 🗺️ خارطة الطريق · Roadmap
- [ ] دعم الطباعة الحرارية للإيصالات.
- [ ] تطبيق جوال مرافق (React Native).
- [ ] مزامنة سحابية اختيارية.
- [ ] لوحة تحكم تحليلية متقدمة.

---

## 🤝 المساهمة · Contributing
المساهمات مرحّب بها. افتح *Issue* لمناقشة التغيير، أو أرسل *Pull Request*.

## 📄 الرخصة · License
هذا المشروع مرخّص تحت **رخصة MIT** — انظر ملف [LICENSE](LICENSE) للتفاصيل.

---

<div align="center">

صُنع بـ ❤️ — **Zaki** · © 2026

⭐ إذا أعجبك المشروع، لا تنسَ تركه بنجمة!

</div>
