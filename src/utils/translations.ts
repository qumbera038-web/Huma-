export type AppLanguage = 'en' | 'ur' | 'ps';

export const translations = {
  // Navigation & General
  pos: { en: 'POS Dashboard', ur: 'پی او ایس بلنگ', ps: 'د بلینګ ډشبورډ' },
  inventory: { en: 'Inventory', ur: 'انوینٹری / اسٹاک', ps: 'زیرمتون / سټاک' },
  customers: { en: 'Customers & Khata', ur: 'گاہک اور کھاتہ', ps: 'پیرودونکي او کھاتہ' },
  reports: { en: 'Sales Reports', ur: 'سیلز رپورٹ', ps: 'د پلور راپورونه' },
  branches: { en: 'Branches', ur: 'برانچز', ps: 'څانګې' },
  whatsapp: { en: 'WhatsApp Hub', ur: 'واٹس ایپ ہب', ps: 'واټس اپ مرکز' },
  ai_estimator: { en: 'Plumbing AI', ur: 'اے آئی تخمینہ', ps: 'د AI اټکل' },
  settings: { en: 'Settings', ur: 'ترتیبات', ps: 'تنظیمات' },
  theme: { en: 'Theme', ur: 'تھیم', ps: 'رنګ' },
  language: { en: 'Language', ur: 'زبان', ps: 'ژبه' },
  search: { en: 'Search...', ur: 'تلاش کریں...', ps: 'لټون...' },
  save: { en: 'Save', ur: 'محفوظ کریں', ps: 'خوندي کړئ' },
  delete: { en: 'Delete', ur: 'حذف کریں', ps: 'ړنګ کړئ' },
  cancel: { en: 'Cancel', ur: 'منسوخ کریں', ps: 'لغوه کړئ' },
  add: { en: 'Add New', ur: 'نیا شامل کریں', ps: 'نوی اضافه کړئ' },
  total: { en: 'Total', ur: 'کل رقم', ps: 'ټوله' },
  
  // Billing Counter (Dashboard / Individual Bill)
  billing_cart: { en: 'Current Bill', ur: 'موجودہ بل', ps: 'اوسنی بل' },
  customer_details: { en: 'Customer Details', ur: 'گاہک کی تفصیلات', ps: 'د پیرودونکي توضیحات' },
  select_customer: { en: 'Walk-in Customer (Select...)', ur: 'عام گاہک (منتخب کریں...)', ps: 'عام پیرودونکی (غوره کړئ...)' },
  item_name: { en: 'Item Name', ur: 'آئٹم کا نام', ps: 'د توکي نوم' },
  price: { en: 'Price', ur: 'قیمت', ps: 'بیه' },
  qty: { en: 'Qty', ur: 'مقدار', ps: 'اندازه' },
  subtotal: { en: 'Subtotal', ur: 'سب ٹوٹل', ps: 'سب ٹوٹل' },
  discount: { en: 'Discount', ur: 'رعایت / ڈسکاؤنٹ', ps: 'تخفیف' },
  net_total: { en: 'Net Total', ur: 'کل بل', ps: 'خالص مجموعه' },
  paid_amount: { en: 'Amount Paid', ur: 'ادا شدہ رقم', ps: 'ورکړل شوې پیسې' },
  change: { en: 'Change', ur: 'بقایا رقم', ps: 'باقي پیسې' },
  checkout: { en: 'Checkout & Save', ur: 'بل مکمل کریں', ps: 'بل بشپړ کړئ' },
  print_bill: { en: 'Print Bill', ur: 'بل پرنٹ کریں', ps: 'بل چاپ کړئ' },
  clear_cart: { en: 'Clear Cart', ur: 'کارٹ صاف کریں', ps: 'کارټ خالي کړئ' },
  addToKhata: { en: 'Add to Khata', ur: 'کھاتے میں شامل کریں', ps: 'په کھاتہ کې اضافه کړئ' },
  cash: { en: 'Cash', ur: 'نقد', ps: 'نغدې' },
  card: { en: 'Card', ur: 'کارڈ', ps: 'کارت' },
  transfer: { en: 'Transfer', ur: 'ٹرانسفر', ps: 'لیږد' },
  
  // Inventory (Individual)
  stock: { en: 'Stock', ur: 'اسٹاک', ps: 'سټاک' },
  category: { en: 'Category', ur: 'کیٹیگری', ps: 'کټګوري' },
  inventory_management: { en: 'Inventory & Stock Management', ur: 'انوینٹری اور اسٹاک مینجمنٹ', ps: 'د انوینٹری او سټاک مدیریت' },
  add_item: { en: 'Add New Item', ur: 'نیا آئٹم شامل کریں', ps: 'نوی توکی اضافه کړئ' },
  total_items: { en: 'Total Items', ur: 'کل آئٹمز', ps: 'ټول توکي' },
  low_stock_alerts: { en: 'Low Stock Alerts', ur: 'کم اسٹاک الرٹس', ps: 'د کم سټاک خبرداری' },
  total_stock_value: { en: 'Total Stock Value', ur: 'کل اسٹاک کی قیمت', ps: 'د ټول سټاک ارزښت' },
  search_inventory: { en: 'Search inventory...', ur: 'انوینٹری تلاش کریں...', ps: 'انوینٹری لټون کړئ...' },
  purchase_price: { en: 'Purchase Price', ur: 'خرید قیمت', ps: 'د پیرود قیمت' },
  sale_price: { en: 'Sale Price', ur: 'فروخت قیمت', ps: 'د پلور قیمت' },
  actions: { en: 'Actions', ur: 'ایکشنز', ps: 'کړنې' },
  edit: { en: 'Edit', ur: 'ترمیم کریں', ps: 'سمول' },
  low_stock: { en: 'Low Stock', ur: 'کم اسٹاک', ps: 'کم سټاک' },
  in_stock: { en: 'In Stock', ur: 'اسٹاک میں موجود', ps: 'په سټاک کې' },
  search_items: { en: 'Search items by name, barcode...', ur: 'نام یا بارکوڈ سے تلاش کریں...', ps: 'په نوم یا بارکوډ لټون وکړئ...' },
  all_categories: { en: 'All Categories', ur: 'تمام کیٹیگریز', ps: 'ټولې کټګورۍ' },
  out_of_stock: { en: 'Out of Stock', ur: 'اسٹاک ختم', ps: 'سټاک خلاص دی' },
  quick_add: { en: 'Quick Add:', ur: 'فوری شامل کریں:', ps: 'ژر اضافه کړئ:' },
  new_customer: { en: 'New Customer', ur: 'نیا گاہک', ps: 'نوی پیرودونکی' },
  previous_udhaar: { en: 'Previous Udhaar', ur: 'پچھلا ادھار', ps: 'پخوانی پور' },
  payment_method: { en: 'Payment Method', ur: 'ادائیگی کا طریقہ', ps: 'د تادیې طریقه' },
  add_to_cart: { en: 'Add', ur: 'شامل کریں', ps: 'اضافه کړئ' },
  
  // Mic & AI Reply Functions
  how_can_i_help: { en: 'How can I help you?', ur: 'میں آپ کی کیا مدد کر سکتا ہوں؟', ps: 'زه ستاسو څه مرسته کولی شم؟' },
  voice_command: { en: 'Voice Command', ur: 'وائس کمانڈ / بولیں', ps: 'غږیږ کمانډ' },
  speak_now: { en: 'Listening... Speak now', ur: 'سن رہا ہوں... بولیں', ps: 'اوریدل... اوس ووایاست' },
  stop_listening: { en: 'Stop Listening', ur: 'سننا بند کریں', ps: 'اوریدل بند کړئ' },
  estimating: { en: 'Estimating...', ur: 'تخمینہ لگایا جا رہا ہے...', ps: 'اټکل کیږي...' },
  reply: { en: 'Reply', ur: 'جواب دیں', ps: 'ځواب ورکړئ' },
  send: { en: 'Send', ur: 'بھیجیں', ps: 'ولیږئ' },
  ask_ai: { en: 'Ask AI Assistant...', ur: 'اے آئی سے پوچھیں...', ps: 'د AI څخه پوښتنه وکړئ...' },
};

export const t = (key: keyof typeof translations, lang: AppLanguage): string => {
  return translations[key]?.[lang] || translations[key]?.['en'] || key;
};
