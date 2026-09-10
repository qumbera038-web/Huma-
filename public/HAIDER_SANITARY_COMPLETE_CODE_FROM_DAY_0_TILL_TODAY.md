# 📚 حیدر سینیٹری اینڈ پائپ اسٹورز - شروع سے آج تک کی مکمل کوڈنگ اور آرکیٹیکچر ماسٹر بک
# HaiderSanitary Complete Master Codebase Manual (Day 0 to Today)

> **منزل اور مشن:**  
> حیدر سینیٹری (پشاور) کو جدید ترین ڈیجیٹل POS، زیرو ڈیٹا لاس، واٹس ایپ بلنگ، 1-کلک اینڈرائیڈ موبائل ایپ اور ۲۴/۷ کلاؤڈ ہوسٹنگ سے لیس کرنا۔

---

## 📑 فہرِست مضامین (Table of Contents)
1. **روزِ اول سے آج تک کے تمام سنگِ میل (Day 0 to Today Journey)**
2. **سسٹم کا مکمل آرکیٹیکچر ڈایاگرام (Architecture Overview)**
3. **تمام ماڈیولز اور ان کے کوڈ کی لائن بہ لائن تشریح (Line-by-Line Code Guide)**
4. **۱-کلک موبائل انسٹالیشن کا مکمل طریقہ (Android 1-Click Install Guide)**
5. **زیرو ڈیٹا لاس کا ڈیٹا بیس ماڈل (Storage & Data Security)**
6. **مفت کلاؤڈ ہوسٹنگ اور کسٹم ڈومین گائیڈ (Vercel, Netlify & Custom Domain)**

---

## 🌟 ۱. روزِ اول سے آج تک کی مکمل سرگرمی (Chronological Journey)

### مرحلہ ۱: نوڈز اور گوگل کلاؤڈ انٹیگریشن (Day 0 - Initial Setup)
- ایکسپریس (Express.js) سرور اور ویٹ (Vite) فرنٹ اینڈ کا قیام۔
- گوگل جیمینائی AI کا انٹیگریشن تاکہ پلمبنگ اور باتھ روم کے سامان کا تخمینہ لگایا جا سکے۔

### مرحلہ ۲: انوینٹری اور کاؤنٹر بلنگ انجن (Phase 2 - Core POS)
- پائپ، سینیٹری، فوسٹس اور والوز کے لیے مخصوص ریٹیل اور ہول سیل ریٹس۔
- کیمرہ بارکوڈ سکینر اور فوری بلنگ۔

### مرحلہ ۳: زیرو ڈیٹا لاس اور آف لائن صلاحیت (Phase 3 - Storage Reliability)
- انٹرنیٹ اور سرور پر انحصار ختم۔ فون کے اندر لوکل اسٹوریج اور بیک اپ جنریٹر کا قیام۔

### مرحلہ ۴: ادھار کھاتہ، ملٹی برانچ اور واٹس ایپ رسیدیں (Phase 4 - ERP Expansion)
- پلمبرز اور کسٹمرز کا ادھار لیجر، رسید پی ڈی ایف جنریٹر اور ۱-کلک واٹس ایپ شیئرنگ۔
- ملٹی برانچ نیٹ ورک اور انٹر برانچ اسٹاک ٹرانسفر۔

### مرحلہ ۵: سنگل آف لائن فائل بلڈر اور APK جنریٹر (Phase 5 - Autonomous Packages)
- بغیر کسی سرور کے ڈبل کلک پر چلنے والی ۱ فائل: `haider_sanitary_pos_single_file.html`
- موبائل انسٹالر: `haider_sanitary_pos.apk`

### مرحلہ ۶: ۱-کلک موبائل ڈائریکٹ انسٹال (Phase 6 - Native 1-Click PWA)
- براؤزر کا اصلی پرامپٹ کیپچر کر کے ۱ سیکنڈ میں موبائل کی ہوم سکرین پر اصلی ایپ بنا دینا۔

### مرحلہ ۷: ۲۴/۷ مفت ہوسٹنگ اور کسٹم ڈومین (Phase 7 - Production Live)
- `vercel.json` اور `netlify.toml` کنفیگریشن سے `haidersanitary.com` ڈومین کنیکٹ کرنا۔

---

## 💻 ۲. تمام کوڈ فائلز کی لائن بہ لائن تشریح (Code Explanations)

### 📁 src/types.ts (Core Architecture & State)
**عنوان:** مرکزی ڈیٹا ماڈلز اور ٹائپ اسکرپٹ انٹرفیسز | *Core TypeScript Data Interfaces & Models*

**یہ فائل کیوں بنائی گئی؟ (Why it exists):**
- یہ فائل دکان کے ہر ڈیٹا (پراڈکٹ، انوائس، کسٹمر، برانچ، کھاتہ، یوزر) کا ڈھانچہ طے کرتی ہے تاکہ کوئی غلط ڈیٹا نہ بن سکے اور بلنگ میں غلطی صفر ہو۔
- *English:* Defines strong contracts for Products, Invoices, Customers, Khata, Branches, and Users across the entire POS application.

**یہ کوڈ کس طرح کام کرتا ہے؟ (How it works):**
- اس میں Product انٹرفیس میں ریٹیل اور ہول سیل قیمتیں، کارٹن پیک سائز، اسٹاک الرٹ لیول رکھے گئے۔ Invoice میں ڈسکاؤنٹ، کسٹمر آئی ڈی، اور پرنٹنگ اسٹیٹس شامل ہیں۔
- *English:* Exported TypeScript interfaces ensure compile-time type safety across all POS modules.

```typescript
export interface Product {
  id: string;
  name: string;
  nameUrdu?: string;
  category: ProductCategory;
  sku: string;
  purchasePrice: number;
  salePrice: number;
  wholesalePrice?: number;
  stock: number;
  minStockAlert: number;
  unit: string;
  piecesPerCarton?: number;
}
```
---

### 📁 src/utils/posStorage.ts (Zero Data Loss Storage Engine)
**عنوان:** زیرو ڈیٹا لاس اور آف لائن اسٹوریج انجن | *Zero Data Loss Local Storage & Backup Engine*

**یہ فائل کیوں بنائی گئی؟ (Why it exists):**
- دکان دار کا سب سے بڑا خوف ڈیٹا ضائع ہونا ہوتا ہے۔ یہ انجن انشور کرتا ہے کہ اگر انٹرنیٹ بند ہو جائے، بجلی چلی جائے یا فون بند ہو جائے، تب بھی ایک روپے کا نقصان نہ ہو۔
- *English:* Guarantees offline resilience and persistence using LocalStorage and automatic JSON backup generation.

**یہ کوڈ کس طرح کام کرتا ہے؟ (How it works):**
- جب بھی بل کٹتا ہے یا کھاتہ لکھا جاتا ہے، یہ فنکشنز فوری طور پر فون کی ہارڈ ڈرائیو میں ڈیٹا لکھ دیتے ہیں۔
- *English:* Safely reads and writes POS entities with JSON parsing fallbacks to prevent runtime crashes.

```typescript
export const saveStoredInvoices = (invoices: Invoice[]) => {
  localStorage.setItem("haider_pos_invoices", JSON.stringify(invoices));
};

export const exportAllDataBackup = () => {
  const backup = {
    version: "2.0",
    exportDate: new Date().toISOString(),
    storeName: "Haider Sanitary & Pipe Store",
    products: getStoredProducts(),
    customers: getStoredCustomers(),
    invoices: getStoredInvoices(),
    khata: getStoredKhata()
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "haider_sanitary_backup.json";
  a.click();
};
```
---

### 📁 src/App.tsx (Mobile Installation & Native App)
**عنوان:** مرکزی ایپلیکیشن کنٹرولر اور ون کلک انسٹالیشن لسنر | *Main App State Controller & PWA Install Listener*

**یہ فائل کیوں بنائی گئی؟ (Why it exists):**
- پوری ایپ کی نیویگیشن، سیکیورٹی لاک، برانچ سلیکٹر اور موبائل پر 1-Click ڈائریکٹ انسٹال کا ہک یہاں سنبھالا جاتا ہے۔
- *English:* Coordinates global tab state, user authorization, and captures the beforeinstallprompt event for seamless Android installation.

**یہ کوڈ کس طرح کام کرتا ہے؟ (How it works):**
- beforeinstallprompt ایونٹ کو کیپچر کر کے اسٹیٹ میں محفوظ کرتا ہے تاکہ صارف بٹن دبا کر ایپ کو فون کی ہوم سکرین پر لگا سکے۔
- *English:* Registers the beforeinstallprompt event listener and supplies deferredPrompt to modal triggers.

```typescript
const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

useEffect(() => {
  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e);
  };
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
}, []);
```
---

### 📁 src/components/pos/DirectInstallModal.tsx (Mobile Installation & Native App)
**عنوان:** ڈائریکٹ اینڈرائیڈ انسٹالیشن ماڈل | *Direct Android Native Install & Chrome Guide Modal*

**یہ فائل کیوں بنائی گئی؟ (Why it exists):**
- صارفین کو APK ڈاؤن لوڈ کے بعد انسٹال ڈھونڈنے میں دشواری ہوتی تھی۔ یہ ماڈل ۱ کلک میں فون کا اصلی انسٹال پرامپٹ کھولتا ہے۔
- *English:* Allows users to trigger Android's native installation prompt directly with 1 tap or follow 3-dot visual guide.

**یہ کوڈ کس طرح کام کرتا ہے؟ (How it works):**
- deferredPrompt.prompt() چلا کر براؤزر سے 'Install App?' کی منظوری لیتا ہے۔
- *English:* Invokes the native prompt and falls back to an interactive step-by-step installation walkthrough.

```typescript
const handleTriggerNativeInstall = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
  }
};
```
---

### 📁 src/components/pos/BillingCounter.tsx (Billing & Counter Operations)
**عنوان:** کاؤنٹر بلنگ، بارکوڈ اسکینر اور ہول سیل/ریٹیل سوئچر | *Fast Counter Billing with Barcode Scanner & Wholesale Switch*

**یہ فائل کیوں بنائی گئی؟ (Why it exists):**
- دکان کے کاؤنٹر پر گاہکوں کا رش ہوتا ہے۔ یہ اسکرین ۳ سیکنڈ میں بل بنا کر تھرمل رسید نکالنے کے لیے بنائی گئی ہے۔
- *English:* High-speed checkout with instant barcode search, cart calculations, wholesale/retail toggle, and thermal print triggers.

**یہ کوڈ کس طرح کام کرتا ہے؟ (How it works):**
- بارکوڈ اسکین ہوتے ہی پروڈکٹ کارٹ میں شامل ہو جاتی ہے۔ کسٹمر کا پچھلا ادھار خودکار حساب کتاب میں جڑ جاتا ہے۔
- *English:* Maintains local cart state, calculates subtotal, tax, discounts, and commits to invoices and customer khata ledger.

```typescript
const handleAddToCart = (product: Product, quantity = 1) => {
  const price = pricingMode === 'wholesale' && product.wholesalePrice 
    ? product.wholesalePrice 
    : product.salePrice;
  // Adds item, recalculates totals instantly
};
```
---

### 📁 src/components/pos/CustomerKhata.tsx (Customer Khata & Udhaar Ledger)
**عنوان:** کسٹمر کھاتہ، ادھار لیجر اور واٹس ایپ یاد دہانی | *Customer Khata (Udhaar) Ledger & WhatsApp Payment Reminders*

**یہ فائل کیوں بنائی گئی؟ (Why it exists):**
- سینیٹری اور پائپ کے کام میں پلمبرز اور ٹھیکیداروں کا ادھار چلتا ہے۔ یہ کھاتہ شفافیت اور بروقت وصولی کے لیے ہے۔
- *English:* Tracks outstanding debit/credit balances per customer with 1-click WhatsApp payment reminders.

**یہ کوڈ کس طرح کام کرتا ہے؟ (How it works):**
- ہر لین دین پر لیجر انٹری بنتی ہے اور سنگل کلک پر اردو میں واٹس ایپ میسج تیار ہوتا ہے۔
- *English:* Updates customer balance and formats automated Urdu WhatsApp payment reminder links.

```typescript
const sendWhatsAppReminder = (customer: Customer) => {
  const text = `محترم ${customer.name} صاحب، حیدر سینیٹری اینڈ پائپ اسٹور کی طرف سے آپ کا بقایا ادھار Rs. ${customer.balance.toLocaleString()} ہے۔ برائے مہربانی ادائیگی فرمائیں۔ شکریہ!`;
  window.open(`https://wa.me/${customer.phone}?text=${encodeURIComponent(text)}`);
};
```
---

### 📁 src/components/pos/PlumbingAIEstimator.tsx (AI Plumbing Estimator)
**عنوان:** اے آئی پلمبنگ اور باتھ روم بجٹ ایسٹیمیٹر | *AI Plumbing & Dream Bathroom Estimator*

**یہ فائل کیوں بنائی گئی؟ (Why it exists):**
- گاہک کو خوابوں جیسا باتھ روم بنانے کے لیے پائپوں، ایلبوز، سینیٹری فٹنگز کا درست تخمینہ فوری فراہم کر کے اعتماد جیتنا۔
- *English:* Provides dream-home sanitary cost estimations, fittings calculation, and builds customer trust instantly.

**یہ کوڈ کس طرح کام کرتا ہے؟ (How it works):**
- باتھ روم سائز اور فکسچرز کی تعداد لے کر پی پی آر سی، پی وی سی اور سینیٹری اشیاء کا مکمل سامان بریک ڈاؤن بنا دیتا ہے۔
- *English:* Uses generative rules and catalog pricing to produce instant material estimates and bill breakdowns.

```typescript
const calculateBathroomEstimate = (bathroomsCount: number, quality: string) => {
  // Calculates PPRC pipes, sockets, elbows, commodes, basins, and mixer taps
  return estimateSummary;
};
```
---

### 📁 src/components/pos/BranchNetworkManager.tsx (Multi-Branch Management)
**عنوان:** ملٹی برانچ نیٹ ورک اور انٹر برانچ اسٹاک ٹرانسفر | *Multi-Branch Network & Stock Transfer Manager*

**یہ فائل کیوں بنائی گئی؟ (Why it exists):**
- حیدر سینیٹری کی مختلف برانچوں (پشاور کینٹ، جی ٹی روڈ، حیات آباد) کے درمیان مال کی نقل و حرکت اور نفع نقصان کا کنٹرول۔
- *English:* Centralizes multi-branch inventory, inter-branch stock transfers, and store-specific staff oversight.

**یہ کوڈ کس طرح کام کرتا ہے؟ (How it works):**
- ایک برانچ سے دوسری برانچ میں مال ٹرانسفر ہونے پر فوری دونوں برانچوں کا اسٹاک بیلنس اپڈیٹ ہوتا ہے۔
- *English:* Maintains branch IDs across products, invoices, and users with role-based branch filtering.

```typescript
export interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  phone: string;
  managerName: string;
  totalProductsCount: number;
}
```
---

### 📁 scripts/build_packages.py (Packaging & Standalone Offline Engine)
**عنوان:** سنگل فائل اور اے پی کے بلڈر انجن | *Offline Single-File HTML & Android APK Builder*

**یہ فائل کیوں بنائی گئی؟ (Why it exists):**
- پوری ویب ایپ کے درجنوں بنڈلز کو صرف ۱ سنگل HTML فائل اور ۱ اینڈرائیڈ APK میں پیک کرنا تاکہ بنا انٹرنیٹ چلے۔
- *English:* Inlines all compiled JS, CSS, fonts, and assets into an autonomous offline application.

**یہ کوڈ کس طرح کام کرتا ہے؟ (How it works):**
- پائتھون اسکرپٹ dist سے تمام اثاثے اٹھا کر سنگل فائل میں بند کرتا ہے اور درست اینڈرائیڈ زپ فائل بناتا ہے۔
- *English:* Reads dist/index.html, replaces external assets with inlined tags, and generates haider_sanitary_pos_single_file.html.

```typescript
def build_single_html():
    dist_dir = 'dist'
    index_html = open(os.path.join(dist_dir, 'index.html')).read()
    # Inlines all CSS and JS chunks into one single file
    open('public/haider_sanitary_pos_single_file.html', 'w').write(index_html)
```
---

### 📁 vercel.json & netlify.toml (Cloud Hosting & Custom Domain)
**عنوان:** ۲۴/۷ مفت ہوسٹنگ اور کسٹم ڈومین کنفیگریشن | *Zero-Cost 24/7 Hosting & Custom Domain Routing*

**یہ فائل کیوں بنائی گئی؟ (Why it exists):**
- ویب سائٹ کو ماہانہ فیس کے بغیر تاحیات مفت چلانا اور haidersanitary.com سے جوڑنا۔
- *English:* Provides edge rewrites for single-page routing and SSL security for custom domains.

**یہ کوڈ کس طرح کام کرتا ہے؟ (How it works):**
- سنگل پیج ایپلی کیشن کے تمام راؤٹس کو index.html پر ری ڈائریکٹ کرتا ہے تاکہ پیج ریفریش پر 404 ایرر نہ آئے۔
- *English:* Configures serverless edge rewrites and aggressive asset caching headers.

```typescript
{
  "version": 2,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
---
