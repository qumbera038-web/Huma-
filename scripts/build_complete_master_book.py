import os
import zipfile
import json
import time

def generate_master_markdown_and_html():
    print("Building Master Code and Activity Book from Day 0 till Today...")
    
    # Files and their detailed explanations in Urdu & English
    file_catalog = [
        {
            "category": "Core Architecture & State",
            "file": "src/types.ts",
            "title_ur": "مرکزی ڈیٹا ماڈلز اور ٹائپ اسکرپٹ انٹرفیسز",
            "title_en": "Core TypeScript Data Interfaces & Models",
            "why_ur": "یہ فائل دکان کے ہر ڈیٹا (پراڈکٹ، انوائس، کسٹمر، برانچ، کھاتہ، یوزر) کا ڈھانچہ طے کرتی ہے تاکہ کوئی غلط ڈیٹا نہ بن سکے اور بلنگ میں غلطی صفر ہو۔",
            "why_en": "Defines strong contracts for Products, Invoices, Customers, Khata, Branches, and Users across the entire POS application.",
            "how_ur": "اس میں Product انٹرفیس میں ریٹیل اور ہول سیل قیمتیں، کارٹن پیک سائز، اسٹاک الرٹ لیول رکھے گئے۔ Invoice میں ڈسکاؤنٹ، کسٹمر آئی ڈی، اور پرنٹنگ اسٹیٹس شامل ہیں۔",
            "how_en": "Exported TypeScript interfaces ensure compile-time type safety across all POS modules.",
            "snippet": """export interface Product {
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
}"""
        },
        {
            "category": "Zero Data Loss Storage Engine",
            "file": "src/utils/posStorage.ts",
            "title_ur": "زیرو ڈیٹا لاس اور آف لائن اسٹوریج انجن",
            "title_en": "Zero Data Loss Local Storage & Backup Engine",
            "why_ur": "دکان دار کا سب سے بڑا خوف ڈیٹا ضائع ہونا ہوتا ہے۔ یہ انجن انشور کرتا ہے کہ اگر انٹرنیٹ بند ہو جائے، بجلی چلی جائے یا فون بند ہو جائے، تب بھی ایک روپے کا نقصان نہ ہو۔",
            "why_en": "Guarantees offline resilience and persistence using LocalStorage and automatic JSON backup generation.",
            "how_ur": "جب بھی بل کٹتا ہے یا کھاتہ لکھا جاتا ہے، یہ فنکشنز فوری طور پر فون کی ہارڈ ڈرائیو میں ڈیٹا لکھ دیتے ہیں۔",
            "how_en": "Safely reads and writes POS entities with JSON parsing fallbacks to prevent runtime crashes.",
            "snippet": """export const saveStoredInvoices = (invoices: Invoice[]) => {
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
};"""
        },
        {
            "category": "Mobile Installation & Native App",
            "file": "src/App.tsx",
            "title_ur": "مرکزی ایپلیکیشن کنٹرولر اور ون کلک انسٹالیشن لسنر",
            "title_en": "Main App State Controller & PWA Install Listener",
            "why_ur": "پوری ایپ کی نیویگیشن، سیکیورٹی لاک، برانچ سلیکٹر اور موبائل پر 1-Click ڈائریکٹ انسٹال کا ہک یہاں سنبھالا جاتا ہے۔",
            "why_en": "Coordinates global tab state, user authorization, and captures the beforeinstallprompt event for seamless Android installation.",
            "how_ur": "beforeinstallprompt ایونٹ کو کیپچر کر کے اسٹیٹ میں محفوظ کرتا ہے تاکہ صارف بٹن دبا کر ایپ کو فون کی ہوم سکرین پر لگا سکے۔",
            "how_en": "Registers the beforeinstallprompt event listener and supplies deferredPrompt to modal triggers.",
            "snippet": """const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

useEffect(() => {
  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e);
  };
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
}, []);"""
        },
        {
            "category": "Mobile Installation & Native App",
            "file": "src/components/pos/DirectInstallModal.tsx",
            "title_ur": "ڈائریکٹ اینڈرائیڈ انسٹالیشن ماڈل",
            "title_en": "Direct Android Native Install & Chrome Guide Modal",
            "why_ur": "صارفین کو APK ڈاؤن لوڈ کے بعد انسٹال ڈھونڈنے میں دشواری ہوتی تھی۔ یہ ماڈل ۱ کلک میں فون کا اصلی انسٹال پرامپٹ کھولتا ہے۔",
            "why_en": "Allows users to trigger Android's native installation prompt directly with 1 tap or follow 3-dot visual guide.",
            "how_ur": "deferredPrompt.prompt() چلا کر براؤزر سے 'Install App?' کی منظوری لیتا ہے۔",
            "how_en": "Invokes the native prompt and falls back to an interactive step-by-step installation walkthrough.",
            "snippet": """const handleTriggerNativeInstall = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
  }
};"""
        },
        {
            "category": "Billing & Counter Operations",
            "file": "src/components/pos/BillingCounter.tsx",
            "title_ur": "کاؤنٹر بلنگ، بارکوڈ اسکینر اور ہول سیل/ریٹیل سوئچر",
            "title_en": "Fast Counter Billing with Barcode Scanner & Wholesale Switch",
            "why_ur": "دکان کے کاؤنٹر پر گاہکوں کا رش ہوتا ہے۔ یہ اسکرین ۳ سیکنڈ میں بل بنا کر تھرمل رسید نکالنے کے لیے بنائی گئی ہے۔",
            "why_en": "High-speed checkout with instant barcode search, cart calculations, wholesale/retail toggle, and thermal print triggers.",
            "how_ur": "بارکوڈ اسکین ہوتے ہی پروڈکٹ کارٹ میں شامل ہو جاتی ہے۔ کسٹمر کا پچھلا ادھار خودکار حساب کتاب میں جڑ جاتا ہے۔",
            "how_en": "Maintains local cart state, calculates subtotal, tax, discounts, and commits to invoices and customer khata ledger.",
            "snippet": """const handleAddToCart = (product: Product, quantity = 1) => {
  const price = pricingMode === 'wholesale' && product.wholesalePrice 
    ? product.wholesalePrice 
    : product.salePrice;
  // Adds item, recalculates totals instantly
};"""
        },
        {
            "category": "Customer Khata & Udhaar Ledger",
            "file": "src/components/pos/CustomerKhata.tsx",
            "title_ur": "کسٹمر کھاتہ، ادھار لیجر اور واٹس ایپ یاد دہانی",
            "title_en": "Customer Khata (Udhaar) Ledger & WhatsApp Payment Reminders",
            "why_ur": "سینیٹری اور پائپ کے کام میں پلمبرز اور ٹھیکیداروں کا ادھار چلتا ہے۔ یہ کھاتہ شفافیت اور بروقت وصولی کے لیے ہے۔",
            "why_en": "Tracks outstanding debit/credit balances per customer with 1-click WhatsApp payment reminders.",
            "how_ur": "ہر لین دین پر لیجر انٹری بنتی ہے اور سنگل کلک پر اردو میں واٹس ایپ میسج تیار ہوتا ہے۔",
            "how_en": "Updates customer balance and formats automated Urdu WhatsApp payment reminder links.",
            "snippet": """const sendWhatsAppReminder = (customer: Customer) => {
  const text = `محترم ${customer.name} صاحب، حیدر سینیٹری اینڈ پائپ اسٹور کی طرف سے آپ کا بقایا ادھار Rs. ${customer.balance.toLocaleString()} ہے۔ برائے مہربانی ادائیگی فرمائیں۔ شکریہ!`;
  window.open(`https://wa.me/${customer.phone}?text=${encodeURIComponent(text)}`);
};"""
        },
        {
            "category": "AI Plumbing Estimator",
            "file": "src/components/pos/PlumbingAIEstimator.tsx",
            "title_ur": "اے آئی پلمبنگ اور باتھ روم بجٹ ایسٹیمیٹر",
            "title_en": "AI Plumbing & Dream Bathroom Estimator",
            "why_ur": "گاہک کو خوابوں جیسا باتھ روم بنانے کے لیے پائپوں، ایلبوز، سینیٹری فٹنگز کا درست تخمینہ فوری فراہم کر کے اعتماد جیتنا۔",
            "why_en": "Provides dream-home sanitary cost estimations, fittings calculation, and builds customer trust instantly.",
            "how_ur": "باتھ روم سائز اور فکسچرز کی تعداد لے کر پی پی آر سی، پی وی سی اور سینیٹری اشیاء کا مکمل سامان بریک ڈاؤن بنا دیتا ہے۔",
            "how_en": "Uses generative rules and catalog pricing to produce instant material estimates and bill breakdowns.",
            "snippet": """const calculateBathroomEstimate = (bathroomsCount: number, quality: string) => {
  // Calculates PPRC pipes, sockets, elbows, commodes, basins, and mixer taps
  return estimateSummary;
};"""
        },
        {
            "category": "Multi-Branch Management",
            "file": "src/components/pos/BranchNetworkManager.tsx",
            "title_ur": "ملٹی برانچ نیٹ ورک اور انٹر برانچ اسٹاک ٹرانسفر",
            "title_en": "Multi-Branch Network & Stock Transfer Manager",
            "why_ur": "حیدر سینیٹری کی مختلف برانچوں (پشاور کینٹ، جی ٹی روڈ، حیات آباد) کے درمیان مال کی نقل و حرکت اور نفع نقصان کا کنٹرول۔",
            "why_en": "Centralizes multi-branch inventory, inter-branch stock transfers, and store-specific staff oversight.",
            "how_ur": "ایک برانچ سے دوسری برانچ میں مال ٹرانسفر ہونے پر فوری دونوں برانچوں کا اسٹاک بیلنس اپڈیٹ ہوتا ہے۔",
            "how_en": "Maintains branch IDs across products, invoices, and users with role-based branch filtering.",
            "snippet": """export interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  phone: string;
  managerName: string;
  totalProductsCount: number;
}"""
        },
        {
            "category": "Packaging & Standalone Offline Engine",
            "file": "scripts/build_packages.py",
            "title_ur": "سنگل فائل اور اے پی کے بلڈر انجن",
            "title_en": "Offline Single-File HTML & Android APK Builder",
            "why_ur": "پوری ویب ایپ کے درجنوں بنڈلز کو صرف ۱ سنگل HTML فائل اور ۱ اینڈرائیڈ APK میں پیک کرنا تاکہ بنا انٹرنیٹ چلے۔",
            "why_en": "Inlines all compiled JS, CSS, fonts, and assets into an autonomous offline application.",
            "how_ur": "پائتھون اسکرپٹ dist سے تمام اثاثے اٹھا کر سنگل فائل میں بند کرتا ہے اور درست اینڈرائیڈ زپ فائل بناتا ہے۔",
            "how_en": "Reads dist/index.html, replaces external assets with inlined tags, and generates haider_sanitary_pos_single_file.html.",
            "snippet": """def build_single_html():
    dist_dir = 'dist'
    index_html = open(os.path.join(dist_dir, 'index.html')).read()
    # Inlines all CSS and JS chunks into one single file
    open('public/haider_sanitary_pos_single_file.html', 'w').write(index_html)"""
        },
        {
            "category": "Cloud Hosting & Custom Domain",
            "file": "vercel.json & netlify.toml",
            "title_ur": "۲۴/۷ مفت ہوسٹنگ اور کسٹم ڈومین کنفیگریشن",
            "title_en": "Zero-Cost 24/7 Hosting & Custom Domain Routing",
            "why_ur": "ویب سائٹ کو ماہانہ فیس کے بغیر تاحیات مفت چلانا اور haidersanitary.com سے جوڑنا۔",
            "why_en": "Provides edge rewrites for single-page routing and SSL security for custom domains.",
            "how_ur": "سنگل پیج ایپلی کیشن کے تمام راؤٹس کو index.html پر ری ڈائریکٹ کرتا ہے تاکہ پیج ریفریش پر 404 ایرر نہ آئے۔",
            "how_en": "Configures serverless edge rewrites and aggressive asset caching headers.",
            "snippet": """{
  "version": 2,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}"""
        }
    ]

    # 1. Generate Markdown file
    md_content = """# 📚 حیدر سینیٹری اینڈ پائپ اسٹورز - شروع سے آج تک کی مکمل کوڈنگ اور آرکیٹیکچر ماسٹر بک
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
"""

    for item in file_catalog:
        md_content += f"""
### 📁 {item['file']} ({item['category']})
**عنوان:** {item['title_ur']} | *{item['title_en']}*

**یہ فائل کیوں بنائی گئی؟ (Why it exists):**
- {item['why_ur']}
- *English:* {item['why_en']}

**یہ کوڈ کس طرح کام کرتا ہے؟ (How it works):**
- {item['how_ur']}
- *English:* {item['how_en']}

```typescript
{item['snippet']}
```
---
"""

    md_path = "public/HAIDER_SANITARY_COMPLETE_CODE_FROM_DAY_0_TILL_TODAY.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"✅ Generated {md_path}")

    # 2. Generate a Complete Printable HTML Master Manual
    html_content = f"""<!DOCTYPE html>
<html lang="ur" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>حیدر سینیٹری اینڈ پائپ اسٹورز - شروع سے آج تک کی مکمل کوڈنگ بک</title>
  <style>
    body {{
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      margin: 0;
      padding: 20px;
      line-height: 1.6;
    }}
    .container {{
      max-width: 1000px;
      margin: 0 auto;
      background: #1e293b;
      padding: 30px;
      border-radius: 20px;
      border: 1px solid #334155;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }}
    h1, h2, h3 {{ color: #f59e0b; margin-top: 20px; }}
    h1 {{ border-bottom: 2px solid #f59e0b; padding-bottom: 10px; }}
    .badge {{
      background: #10b981;
      color: #022c22;
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 12px;
      display: inline-block;
    }}
    .card {{
      background: #0f172a;
      border: 1px solid #334155;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 25px;
    }}
    pre {{
      background: #020617;
      color: #38bdf8;
      padding: 15px;
      border-radius: 10px;
      overflow-x: auto;
      direction: ltr;
      text-align: left;
      font-size: 13px;
      border: 1px solid #1e293b;
    }}
    .print-btn {{
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #0f172a;
      font-weight: bold;
      padding: 12px 24px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 16px;
      margin-bottom: 20px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }}
    @media print {{
      body {{ background: #fff; color: #000; padding: 0; }}
      .container {{ background: #fff; border: none; box-shadow: none; max-width: 100%; }}
      .print-btn {{ display: none; }}
      pre {{ background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; }}
      h1, h2, h3 {{ color: #b45309; }}
    }}
  </style>
</head>
<body>
  <div class="container">
    <button class="print-btn" onclick="window.print()">🖨️ اس ڈاکیومنٹ کو PDF میں سیو کریں (Print to PDF)</button>
    
    <h1>📖 حیدر سینیٹری اینڈ پائپ اسٹورز - شروع سے آج تک کی مکمل کوڈنگ اور آرکیٹیکچر گائیڈ</h1>
    <p><strong>HaiderSanitary Complete Technical & Architectural Manual (Day 0 to Today)</strong></p>
    <p class="badge">۱۰۰٪ پروڈکشن ریڈی - زیرو ڈیٹا لاس - ۱-کلک موبائل انسٹالیشن</p>

    <h2>🌟 شروع سے آج تک کے سنگِ میل (All Milestones Completed)</h2>
    <ul>
      <li><strong>مرحلہ ۱ (گوگل اور نوڈز کولیبریشن):</strong> Express.js سرور اور Gemini AI اسسٹنٹ۔</li>
      <li><strong>مرحلہ ۲ (انوینٹری و بارکوڈ بلنگ):</strong> کاؤنٹر بلنگ، تھرمل پرنٹ اور بارکوڈ اسکیننگ۔</li>
      <li><strong>مرحلہ ۳ (زیرو ڈیٹا لاس):</strong> آف لائن لوکل اسٹوریج اور خودکار بیک اپ۔</li>
      <li><strong>مرحلہ ۴ (کھاتہ و ملٹی برانچ):</strong> پلمبرز کا ادھار لیجر، 3 برانچز اور واٹس ایپ انوائس۔</li>
      <li><strong>مرحلہ ۵ (سنگل آف لائن فائل):</strong> <code>haider_sanitary_pos_single_file.html</code> بنا سرور چلنے والی۔</li>
      <li><strong>مرحلہ ۶ (۱-کلک اینڈرائیڈ ایپ):</strong> بٹن دبا کر سیدھا موبائل ہوم اسکرین پر انسٹال ہونا۔</li>
      <li><strong>مرحلہ ۷ (مفت ۲۴/۷ ہوسٹنگ):</strong> Vercel اور Netlify پر لائیو اور کسٹم ڈومین کنکشن۔</li>
    </ul>

    <h2>💻 تمام کوڈ فائلز اور لائن بہ لائن تشریح (Code Explanations)</h2>
"""

    for item in file_catalog:
        html_content += f"""
    <div class="card">
      <h3>📁 {item['file']} — {item['title_ur']}</h3>
      <p><em>{item['title_en']} ({item['category']})</em></p>
      <p><strong>یہ کوڈ کیوں ضروری ہے؟</strong> {item['why_ur']}</p>
      <p><strong>یہ کیسے کام کرتا ہے؟</strong> {item['how_ur']}</p>
      <pre><code>{item['snippet']}</code></pre>
    </div>
"""

    html_content += """
    <h2>🌐 ہوسٹنگ اور کسٹم ڈومین کنفیگریشن</h2>
    <p>ویب سائٹ کو <strong>Vercel</strong> پر فری چلانے کے لیے <code>vercel.json</code> اور <strong>Netlify</strong> کے لیے <code>netlify.toml</code> شامل ہیں۔</p>
    <p>اپنی ڈومین (مثلاً <code>haidersanitary.com</code>) جوڑنے کے لیے DNS میں درج ذیل شامل کریں:</p>
    <pre><code>CNAME: www  ->  cname.vercel-dns.com
A Record: @  ->  76.76.21.21</code></pre>
  </div>
</body>
</html>"""

    html_path = "public/haider_sanitary_master_manual_printable.html"
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"✅ Generated {html_path}")

    # 3. Create Complete Source Code ZIP (excluding node_modules and dist)
    zip_path = "public/haider_sanitary_pos_source.zip"
    print(f"Creating 100% complete source archive: {zip_path}...")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk("."):
            # Exclude node_modules, .git, and dist
            if "node_modules" in root or ".git" in root or "dist" in root:
                continue
            for file in files:
                if file.endswith(".zip") and file != "haider_sanitary_pos_source.zip":
                    continue
                if file == "haider_sanitary_pos_source.zip":
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, ".")
                zipf.write(file_path, arcname)
    print(f"✅ Source archive updated: {zip_path} ({os.path.getsize(zip_path):,} bytes)")

if __name__ == "__main__":
    generate_master_markdown_and_html()
