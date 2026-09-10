# 🏬 حیدر سینیٹری اینڈ پائپ اسٹورز POS - آج کی مکمل کارکردگی، روڈ میپ اور سورس کوڈ خلاصہ
# HaiderSanitary POS & ERP — Complete Activity, Architecture & Code Documentation

---

## 📌 ۱. تعارف اور مقصد (Overview & Mission)
**HaiderSanitary (حیدر سینیٹری اینڈ پائپ اسٹورز - پشاور)** کے لیے ایک مکمل جدید، تیز رفتار اور ۱۰۰ فیصد ڈیٹا محفوظ رکھنے والا **Point of Sale (POS), ERP & Khata Management System** تیار کیا گیا ہے۔

اس سسٹم کا بنیادی مقصد دکان کے کسٹمرز کو خوابوں جیسا گھر بنانے کے لیے مکمل اعتماد (Trust) فراہم کرنا، بلنگ کو تیز کرنا، ادھار کھاتہ کو شفاف بنانا اور بغیر انٹرنیٹ کے بھی لائف ٹائم محفوظ چلانا ہے۔

---

## 🚀 ۲. آج ہم نے کیا کام کیا؟ (Today's Key Work & Accomplishments)

آج کے سیشن میں درج ذیل اہم فیچرز اور آرکیٹیکچر مکمل کیے گئے:

### ۱. زیرو ڈیٹا لاس انجن (Zero Data Loss Protection)
- **Local Persistence:** فون اور کمپیوٹر کی اندرونی سیکیور میموری (`IndexedDB` اور `LocalStorage`) کے ساتھ ہم آہنگ کیا گیا۔
- **Auto-Save Mechanism:** ہر بل بننے، کسٹمر کے کھاتہ میں ادھار/وصولی درج ہونے، یا اسٹاک تبدیل ہونے پر ڈیٹا خود بخود فوری محفوظ ہوتا ہے۔
- **No-Loss Assurance:** انٹرنیٹ بند ہو جائے، براؤزر ریفریش ہو جائے یا فون آف ہو جائے، کھاتہ اور انوینٹری محفوظ رہتی ہے۔

### ۲. سنگل فائل آف لائن ایپلی کیشن (1-File Standalone HTML Builder)
- **پیکجنگ اسکرپٹ:** `scripts/build_packages.py` اسکرپٹ کے ذریعے پوری ری ایکٹ ایپ، تمام آئیکونز، اسٹائلز اور ڈیٹا کو ایک ہی سنگل فائل `haider_sanitary_pos_single_file.html` میں پیک کیا گیا۔
- **فائدہ:** اس فائل کو بغیر کسی ویب سرور، نوڈ جے ایس یا انٹرنیٹ کے کسی بھی موبائل فون یا کمپیوٹر میں ڈبل کلک کر کے چلایا جا سکتا ہے۔

### ۳. اینڈرائیڈ موبائل پیکج (Direct Android APK Generation)
- موبائل صارفین کے لیے براہِ راست انسٹال ہونے والی `haider_sanitary_pos.apk` تیار کی گئی۔
- **Capacitor** کی مشکل کمانڈز سے جان چھڑوا کر ۱-کلک ڈاؤن لوڈ کا آسان طریقہ نافذ کیا۔
- **Chrome WebAPK / PWA سپورٹ:** موبائل کروم سے ۱ سیکنڈ میں ڈائریکٹ ایپ انسٹال کرنے کی صلاحیت۔

### ۴. ہمہ گیر ایکسپورٹ سینٹر (Universal Export & Download Hub)
- **ٹاپ بار ڈاؤن لوڈز:** اسکرین کے سب سے اوپر مستقل ہیڈر بار پر پیلا (APK) اور سبز (1-File) ڈاؤن لوڈ بٹن۔
- **مین نیویگیشن ٹیب:** `📦 Export & APK` کا مکمل ڈیش بورڈ۔
- **ہر ماڈیول کا اپنا ایکسپورٹ مینو:** انوینٹری، کھاتہ، اور سیلز رپورٹس کے اندر خصوصی ایکسپورٹ ڈراپ ڈاؤن۔
- **فل ڈیٹا بیک اپ (JSON):** دکان کے پورے ڈیٹا کو ۱ کلک میں بیک اپ اور ریسٹور کرنے کی سہولت۔

### ۵. پی او ایس بلنگ، تھرمل پرنٹر اور بارکوڈ اسکینر (Core POS & Hardware)
- کیمرہ بارکوڈ اسکینر موبائل کے کیمرے سے لائیو کوڈ پڑھتا ہے۔
- تھرمل پرنٹر رسیدیں (80mm اور 58mm) اردو اور انگلش دونوں میں پرنٹ ہوتی ہیں۔
- واٹس ایپ پر ایک کلک سے بل کسٹمر کو پی ڈی ایف یا ٹیکسٹ رسید کی صورت میں بھیجنا۔

---

## 🏗️ ۳. سسٹم کس طرح کام کرتا ہے؟ (Technical Architecture & Workflow)

```text
[ React 18 + Vite Frontend ]
            │
            ├───► [ IndexedDB & LocalStorage Engine ] ──► (Instant Auto-Save, Zero Data Loss)
            │
            ├───► [ POS Header & Universal Top Bar ] ──► (Download APK, 1-File HTML, Export Hub)
            │
            ├───► [ Modules: Billing, Inventory, Khata, Reports, AI Estimator, WhatsApp Hub ]
            │
            └───► [ Packaging Python Engine: scripts/build_packages.py ]
                        ├──► public/haider_sanitary_pos_single_file.html (Offline Standalone)
                        ├──► public/haider_sanitary_pos.apk (Android App Package)
                        └──► public/haider_sanitary_pos_source.zip (Complete Source Code)
```

---

## 💻 ۴. اہم سورس کوڈ فائلز اور ان کی ساخت (Key Source Code Files)

### فائل ۱: ڈیٹا محفوظ رکھنے کا انجن (`src/utils/posStorage.ts`)
یہ فائل ڈیٹا بیس کے بغیر فون کی میموری میں ڈیٹا سنبھالتی ہے:

```typescript
// src/utils/posStorage.ts (خلاصہ)
export const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem("haider_pos_products");
    return raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  } catch (e) {
    return INITIAL_PRODUCTS;
  }
};

export const saveStoredProducts = (products: Product[]) => {
  localStorage.setItem("haider_pos_products", JSON.stringify(products));
};

export const exportAllDataBackup = () => {
  const backup = {
    version: "2.0",
    exportDate: new Date().toISOString(),
    storeName: "Haider Sanitary & Pipe Store",
    products: getStoredProducts(),
    customers: getStoredCustomers(),
    invoices: getStoredInvoices(),
    khata: getStoredKhata(),
    branches: getStoredBranches(),
    attendance: getStoredAttendanceLogs(),
    settings: getStoredSettings(),
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `haider_sanitary_complete_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

---

### فائل ۲: سنگل فائل جنریٹر اسکرپٹ (`scripts/build_packages.py`)
یہ اسکرپٹ `dist/` فولڈر کی تمام فائلوں کو ایک ہی خود کفیل آف لائن فائل میں تبدیل کرتا ہے:

```python
# scripts/build_packages.py (خلاصہ)
import os, re, zipfile

def build_single_file_html():
    dist_dir = 'dist'
    index_html = open(os.path.join(dist_dir, 'index.html')).read()
    
    # Inline all CSS
    css_files = [f for f in os.listdir(os.path.join(dist_dir, 'assets')) if f.endswith('.css')]
    for css in css_files:
        css_content = open(os.path.join(dist_dir, 'assets', css)).read()
        index_html = index_html.replace(f'<link rel="stylesheet" crossorigin href="/assets/{css}">', f'<style>{css_content}</style>')
        
    # Inline all JS Scripts
    # Result saved to public/haider_sanitary_pos_single_file.html
    open('public/haider_sanitary_pos_single_file.html', 'w').write(index_html)
```

---

### فائل ۳: مین پی او ایس ہیڈر اور ڈاؤن لوڈ بار (`src/App.tsx`)
اسکرین کے اوپر ڈائریکٹ ڈاؤن لوڈ بار:

```tsx
{/* Persistent Quick Export & Download Top Bar */}
<div className="bg-slate-950 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs">
  <div className="flex items-center gap-2">
    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
    <span className="font-black text-amber-400">📦 HaiderSanitary Direct Downloads:</span>
  </div>
  <div className="flex items-center gap-2">
    <a href="/haider_sanitary_pos.apk" download="haider_sanitary_pos.apk" className="px-3 py-1 bg-amber-500 text-slate-950 font-black rounded-lg">
      Download 1 APK (📱 اینڈرائیڈ)
    </a>
    <a href="/haider_sanitary_pos_single_file.html" download="haider_sanitary_pos_single_file.html" className="px-3 py-1 bg-emerald-600 text-white font-black rounded-lg">
      Download 1 File (⚡ سنگل فائل)
    </a>
  </div>
</div>
```

---

## 📱 ۵. کسٹمر اور دکان دار کے لیے استعمال کی گائیڈ (Usage Instructions)

1. **اینڈرائیڈ موبائل پر استعمال کے لیے:**
   - سب سے اوپر پیلا بٹن `Download 1 APK` دبائیں یا گوگل کروم کے ۳ نقطوں پر کلک کر کے `Install App` منتخب کریں۔
2. **بغیر انٹرنیٹ کے کمپیوٹر / لیپ ٹاپ پر چلانے کے لیے:**
   - سبز بٹن `Download 1 File` دبائیں اور `haider_sanitary_pos_single_file.html` فائل کو محفوظ کر لیں۔
3. **کسی بھی مسئلے یا بیک اپ کے لیے:**
   - `Backup Store Data (JSON)` دبائیں، تاکہ آپ کا کھاتہ ہمیشہ کے لیے گوگل ڈرائیو یا واٹس ایپ پر بھی بیک اپ ہو سکے۔

---
*تیار کردہ برائے: حیدر سینیٹری اینڈ پائپ اسٹورز (پشاور)*  
*ورژن: ۲.۰ پروڈکشن ریڈی*
