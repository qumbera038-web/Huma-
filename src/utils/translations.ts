export type AppLanguage = 'en' | 'ur' | 'ps' | 'mix';

export const translations = {
  // Navigation & General
  pos: { en: 'POS Dashboard', ur: 'پی او ایس بلنگ', ps: 'د بلینګ ډشبورډ', mix: 'POS Dashboard (بلنگ)' },
  inventory: { en: 'Inventory', ur: 'انوینٹری / اسٹاک', ps: 'زیرمتون / سټاک', mix: 'Inventory (انوینٹری / اسٹاک)' },
  customers: { en: 'Customers & Khata', ur: 'گاہک اور کھاتہ', ps: 'پیرودونکي او کھاتہ', mix: 'Customers (گاہک اور کھاتہ)' },
  reports: { en: 'Sales Reports', ur: 'سیلز رپورٹ', ps: 'د پلور راپورونه', mix: 'Sales Reports (سیلز رپورٹ)' },
  branches: { en: 'Branches', ur: 'برانچز', ps: 'څانګې', mix: 'Branches (برانچز)' },
  whatsapp: { en: 'WhatsApp Hub', ur: 'واٹس ایپ ہب', ps: 'واټس اپ مرکز', mix: 'WhatsApp Hub (واٹس ایپ)' },
  ai_estimator: { en: 'Plumbing AI', ur: 'اے آئی تخمینہ', ps: 'د AI اټکل', mix: 'Plumbing AI (تخمینہ)' },
  settings: { en: 'Settings', ur: 'ترتیبات', ps: 'تنظیمات', mix: 'Settings (ترتیبات)' },
  theme: { en: 'Theme', ur: 'تھیم', ps: 'رنګ', mix: 'Theme (تھیم)' },
  language: { en: 'Language', ur: 'زبان', ps: 'ژبه', mix: 'Language (زبان)' },
  search: { en: 'Search...', ur: 'تلاش کریں...', ps: 'لټون...', mix: 'Search... (تلاش)' },
  save: { en: 'Save', ur: 'محفوظ کریں', ps: 'خوندي کړئ', mix: 'Save (محفوظ کریں)' },
  delete: { en: 'Delete', ur: 'حذف کریں', ps: 'ړنګ کړئ', mix: 'Delete (حذف کریں)' },
  cancel: { en: 'Cancel', ur: 'منسوخ کریں', ps: 'لغوه کړئ', mix: 'Cancel (منسوخ)' },
  add: { en: 'Add New', ur: 'نیا شامل کریں', ps: 'نوی اضافه کړئ', mix: 'Add New (نیا شامل کریں)' },
  total: { en: 'Total', ur: 'کل رقم', ps: 'ټوله', mix: 'Total (کل رقم)' },
  
  // Billing Counter (Dashboard / Individual Bill)
  billing_cart: { en: 'Current Bill', ur: 'موجودہ بل', ps: 'اوسنی بل', mix: 'Current Bill (موجودہ بل)' },
  customer_details: { en: 'Customer Details', ur: 'گاہک کی تفصیلات', ps: 'د پیرودونکي توضیحات', mix: 'Customer (گاہک تفصیلات)' },
  select_customer: { en: 'Walk-in Customer (Select...)', ur: 'عام گاہک (منتخب کریں...)', ps: 'عام پیرودونکی (غوره کړئ...)', mix: 'Walk-in (عام گاہک)' },
  item_name: { en: 'Item Name', ur: 'آئٹم کا نام', ps: 'د توکي نوم', mix: 'Item Name (آئٹم نام)' },
  price: { en: 'Price', ur: 'قیمت', ps: 'بیه', mix: 'Price (قیمت)' },
  qty: { en: 'Qty', ur: 'مقدار', ps: 'اندازه', mix: 'Qty (مقدار)' },
  subtotal: { en: 'Subtotal', ur: 'سب ٹوٹل', ps: 'سب ٹوٹل', mix: 'Subtotal (سب ٹوٹل)' },
  discount: { en: 'Discount', ur: 'رعایت / ڈسکاؤنٹ', ps: 'تخفیف', mix: 'Discount (ڈسکاؤنٹ)' },
  net_total: { en: 'Net Total', ur: 'کل بل', ps: 'خالص مجموعه', mix: 'Net Total (کل بل)' },
  paid_amount: { en: 'Amount Paid', ur: 'ادا شدہ رقم', ps: 'ورکړل شوې پیسې', mix: 'Amount Paid (ادا شدہ)' },
  change: { en: 'Change', ur: 'بقایا رقم', ps: 'باقي پیسې', mix: 'Change (بقایا)' },
  checkout: { en: 'Checkout & Save', ur: 'بل مکمل کریں', ps: 'بل بشپړ کړئ', mix: 'Checkout (بل مکمل کریں)' },
  print_bill: { en: 'Print Bill', ur: 'بل پرنٹ کریں', ps: 'بل چاپ کړئ', mix: 'Print Bill (پرنٹ کریں)' },
  clear_cart: { en: 'Clear Cart', ur: 'کارٹ صاف کریں', ps: 'کارټ خالي کړئ', mix: 'Clear Cart (صاف کریں)' },
  addToKhata: { en: 'Add to Khata', ur: 'کھاتے میں شامل کریں', ps: 'په کھاتہ کې اضافه کړئ', mix: 'Add to Khata (کھاتہ)' },
  cash: { en: 'Cash', ur: 'نقد', ps: 'نغدې', mix: 'Cash (نقد)' },
  card: { en: 'Card', ur: 'کارڈ', ps: 'کارت', mix: 'Card (کارڈ)' },
  transfer: { en: 'Transfer', ur: 'ٹرانسفر', ps: 'لیږد', mix: 'Transfer (ٹرانسفر)' },
  
  // Inventory (Individual)
  stock: { en: 'Stock', ur: 'اسٹاک', ps: 'سټاک', mix: 'Stock (اسٹاک)' },
  category: { en: 'Category', ur: 'کیٹیگری', ps: 'کټګوري', mix: 'Category (کیٹیگری)' },
  inventory_management: { en: 'Inventory & Stock Management', ur: 'انوینٹری اور اسٹاک مینجمنٹ', ps: 'د انوینٹری او سټاک مدیریت', mix: 'Stock Management (انوینٹری)' },
  add_item: { en: 'Add New Item', ur: 'نیا آئٹم شامل کریں', ps: 'نوی توکی اضافه کړئ', mix: 'Add Item (نیا آئٹم)' },
  total_items: { en: 'Total Items', ur: 'کل آئٹمز', ps: 'ټول توکي', mix: 'Total Items (کل آئٹمز)' },
  low_stock_alerts: { en: 'Low Stock Alerts', ur: 'کم اسٹاک الرٹس', ps: 'د کم سټاک خبرداری', mix: 'Low Stock Alerts (کم اسٹاک)' },
  total_stock_value: { en: 'Total Stock Value', ur: 'کل اسٹاک کی قیمت', ps: 'د ټول سټاک ارزښت', mix: 'Stock Value (اسٹاک قیمت)' },
  search_inventory: { en: 'Search inventory...', ur: 'انوینٹری تلاش کریں...', ps: 'انوینٹری لټون کړئ...', mix: 'Search (تلاش انوینٹری)' },
  purchase_price: { en: 'Purchase Price', ur: 'خرید قیمت', ps: 'د پیرود قیمت', mix: 'Purchase Price (خرید قیمت)' },
  sale_price: { en: 'Sale Price', ur: 'فروخت قیمت', ps: 'د پلور قیمت', mix: 'Sale Price (فروخت قیمت)' },
  actions: { en: 'Actions', ur: 'ایکشنز', ps: 'کړنې', mix: 'Actions (ایکشنز)' },
  edit: { en: 'Edit', ur: 'ترمیم کریں', ps: 'سمول', mix: 'Edit (ترمیم)' },
  low_stock: { en: 'Low Stock', ur: 'کم اسٹاک', ps: 'کم سټاک', mix: 'Low Stock (کم اسٹاک)' },
  in_stock: { en: 'In Stock', ur: 'اسٹاک میں موجود', ps: 'په سټاک کې', mix: 'In Stock (اسٹاک میں)' },
  search_items: { en: 'Search items by name, barcode...', ur: 'نام یا بارکوڈ سے تلاش کریں...', ps: 'په نوم یا بارکوډ لټون وکړئ...', mix: 'Search (تلاش نام/بارکوڈ)' },
  all_categories: { en: 'All Categories', ur: 'تمام کیٹیگریز', ps: 'ټولې کټګورۍ', mix: 'All Categories (تمام کیٹیگریز)' },
  out_of_stock: { en: 'Out of Stock', ur: 'اسٹاک ختم', ps: 'سټاک خلاص دی', mix: 'Out of Stock (اسٹاک ختم)' },
  quick_add: { en: 'Quick Add:', ur: 'فوری شامل کریں:', ps: 'ژر اضافه کړئ:', mix: 'Quick Add (فوری شامل)' },
  new_customer: { en: 'New Customer', ur: 'نیا گاہک', ps: 'نوی پیرودونکی', mix: 'New Customer (نیا گاہک)' },
  previous_udhaar: { en: 'Previous Udhaar', ur: 'پچھلا ادھار', ps: 'پخوانی پور', mix: 'Previous Udhaar (پچھلا ادھار)' },
  payment_method: { en: 'Payment Method', ur: 'ادائیگی کا طریقہ', ps: 'د تادیې طریقه', mix: 'Payment Method (ادائیگی)' },
  add_to_cart: { en: 'Add', ur: 'شامل کریں', ps: 'اضافه کړئ', mix: 'Add (شامل)' },
  
  // Mic & AI Reply Functions
  how_can_i_help: { en: 'How can I help you?', ur: 'میں آپ کی کیا مدد کر سکتا ہوں؟', ps: 'زه ستاسو څه مرسته کولی شم؟', mix: 'How can I help? (کیا مدد کروں؟)' },
  voice_command: { en: 'Voice Command', ur: 'وائس کمانڈ / بولیں', ps: 'غږیږ کمانډ', mix: 'Voice Command (وائس کمانڈ)' },
  speak_now: { en: 'Listening... Speak now', ur: 'سن رہا ہوں... بولیں', ps: 'اوریدل... اوس ووایاست', mix: 'Listening... (سن رہا ہوں)' },
  stop_listening: { en: 'Stop Listening', ur: 'سننا بند کریں', ps: 'اوریدل بند کړئ', mix: 'Stop (سننا بند کریں)' },
  estimating: { en: 'Estimating...', ur: 'تخمینہ لگایا جا رہا ہے...', ps: 'اټکل کیږي...', mix: 'Estimating... (تخمینہ)' },
  reply: { en: 'Reply', ur: 'جواب دیں', ps: 'ځواب ورکړئ', mix: 'Reply (جواب)' },
  send: { en: 'Send', ur: 'بھیجیں', ps: 'ولیږئ', mix: 'Send (بھیجیں)' },
  ask_ai: { en: 'Ask AI Assistant...', ur: 'اے آئی سے پوچھیں...', ps: 'د AI څخه پوښتنه وکړئ...', mix: 'Ask AI (اے آئی سے پوچھیں)' },
};

export const t = (key: keyof typeof translations, lang: AppLanguage): string => {
  return translations[key]?.[lang] || translations[key]?.['en'] || key;
};
