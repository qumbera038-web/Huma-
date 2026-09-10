export type UserRole = "admin" | "cashier" | "manager" | "assistant_manager" | "branch_owner" | "bill_maker" | "helper" | "stock_manager" | "driver";

export type MessageType = "text" | "voice" | "video_call_log" | "image" | "file";

export interface StaffMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  type: MessageType;
  branchId: string;
  mediaUrl?: string; // For voice recordings, photos, or documents
  callDuration?: string; // For call history entries
  isSecret?: boolean; // End-to-end encryption flag
}

export interface StaffPresence {
  userId: string;
  isOnline: boolean;
  lastSeen?: string;
  status?: "active" | "away" | "busy" | "on_call";
}

export interface BranchCamera {
  id: string;
  name: string; // e.g. "Counter #1 Cash Cam", "Main Entrance & Showcase", "Warehouse & Pipe Stock"
  location: string; // "Counter Area", "Stock Yard", "Entry Gate"
  isLive: boolean;
  status: "recording" | "online" | "motion_detected" | "standby";
  resolution: string; // "1080p Full HD", "4K 60FPS"
  fps: number;
  feedType: "sanitary_shop" | "counter_cash" | "pipe_stock" | "front_view";
  snapshotUrl: string;
  ipAddress: string;
}

export interface Branch {
  id: string; // "branch-1", "branch-2", "branch-3"
  code: string; // "BR-01", "BR-02", "BR-03"
  name: string; // "Branch 1 - Main Head Office (حیدر علی)", "Branch 2 - City Market Outlet (چھوٹا بھائی)", "Branch 3 - Highway Bypass (کزن حسد)"
  shortName: string;
  urduName: string;
  headName: string;
  headRole: string;
  headAvatar?: string;
  phone: string;
  ptcl?: string;
  mobile?: string;
  whatsapp?: string;
  address: string;
  isMainBranch?: boolean;
  onlineStatus: "active" | "online" | "idle";
  staffCount: number;
  dailyTarget?: number;
  cameras: BranchCamera[];
}

export type ExpenseCategory = "salary" | "rent" | "utility_bill" | "transport" | "food" | "marketing" | "repair_maintenance" | "office_supplies" | "other";

export interface BusinessExpense {
  id: string;
  date: string; // ISO date
  monthYear: string; // e.g. "2026-09" for easy grouping/filtering
  description: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  branchId: string;
  branchName: string;
  recordedBy: string;
  receiptUrl?: string;
  isRecurring?: boolean;
}

export interface MonthlyExpenseReport {
  monthYear: string; // e.g. "September 2026"
  totalAmount: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
  expenses: BusinessExpense[];
}

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  pin: string; // Empty string if PIN is removed
  hasPassword?: boolean; // false if password/pin removed (Google-style passwordless quick login)
  avatarUrl?: string; // photo or avatar image URL
  counterStation?: string; // e.g. "Counter #1 (Main Terminal)", "Counter #2 (Plumbing Desk)"
  email?: string;
  phone?: string;
  branchId?: string; // "branch-1" | "branch-2" | "branch-3"
  branchName?: string;
  isSuperAdmin?: boolean; // Super Admin (Owner who can view all 3 branches & CCTV)
  
  // Mandatory KYC & Biometric Security Fields
  cnic?: string; // Pakistani CNIC e.g. "17301-8493012-1"
  cnicFrontUrl?: string; // CNIC Front Side picture upload / capture
  cnicBackUrl?: string; // CNIC Back Side picture upload / capture
  address?: string; // Residential / permanent address
  secondContactName?: string; // 2nd person name (Emergency contact / guarantor / relative)
  secondContactRelation?: string; // e.g. "Father", "Brother", "Guarantor", "Uncle"
  secondContactPhone?: string; // e.g. "0300-1122334"
  biometricRegistered?: boolean; // Fingerprint biometric verified
  biometricId?: string; // Cryptographic biometric registration token
  biometricDate?: string; // Biometric scan timestamp
  faceRecognitionRegistered?: boolean; // Live Face ID verified
  faceConfidence?: number; // AI Face recognition match confidence (e.g. 99.4%)
  faceScanData?: string; // Snapshot or facial vector hash
  kycCompleted?: boolean; // True once 1st login mandatory verification is done
  kycDate?: string; // Date of KYC completion
  bloodGroup?: string; // e.g. "B+", "O+", "A+"
  emergencyNotes?: string;
}

export type ProductCategory = 
  | "Basin Mixer"
  | "Wall Shower"
  | "Shower Mixer"
  | "Bib Cock"
  | "Stop Cock"
  | "Waste"
  | "Toilet"
  | "Bath Set"
  | "PPRC Pipes & Fittings"
  | "PVC / UPVC Pipes"
  | "Sanitary Ware & Ceramics"
  | "Faucets & Taps"
  | "Valves & Brass Fittings"
  | "GI & Iron Pipes"
  | "Water Tanks & Pumps"
  | "Hardware & Tools"
  | string;

export interface Product {
  id: string;
  code: string; // e.g. PPRC-025, PVC-4IN
  name: string;
  category: ProductCategory;
  brand: string; // Master, IIL, Popular, Sonex, Faisal, Porta, Marcopolo
  size?: string; // 1/2", 3/4", 1", 2", 3", 4", 110mm, 25mm
  color?: string; // White, Ivory, Chrome, Matte Black, etc.
  unit: "piece" | "foot" | "length" | "bundle" | "box" | "set" | "roll";
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  minStockAlert: number;
  barcode?: string;
  branchId?: string;
  imageUrl?: string; // Product photo URL
  productDescription?: string; // Detailed description in Urdu/English
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  total: number;
}

export type PaymentMethod = "cash" | "bank_transfer" | "credit_khata" | "card" | "cheque";

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. HPS-2026-0012
  date: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: PaymentMethod;
  cashierName: string;
  cashierId?: string;
  cashierRole?: string;
  cashierAvatar?: string;
  counterStation?: string;
  branchId?: string;
  branchName?: string;
  printedBy?: string;
  printedAt?: string;
  notes?: string;
  status?: "completed" | "cancelled";
  cancelledAt?: string;
  cancelledBy?: string;
  cancelledReason?: string;
  customerPhotoSnapshot?: string; // Counter motion camera snapshot of payer at billing checkout
  dispatchProofSnapshot?: string; // Gate exit snapshot of goods carrier / driver
  dispatchStatus?: "pending_dispatch" | "dispatched_verified";
  dispatchedAt?: string;
  dispatchedToName?: string;
  vehicleNumber?: string; // e.g. "Suzuki Ravi KHI-8891", "Rickshaw #4", "Customer Hand Carry"
}

export type SnapshotCategory = "motion_unknown" | "payment_counter" | "goods_dispatch";

export interface MotionSnapshot {
  id: string;
  timestamp: string; // ISO string
  timeFormatted: string; // e.g. "03:45:12 PM"
  dateFormatted: string; // e.g. "2026-09-08"
  branchId: string;
  branchName: string;
  cameraName: string; // e.g. "Main Entrance Motion Cam", "Billing Counter Cam", "Yard Gate Exit Cam"
  category: SnapshotCategory;
  imageUrl: string; // Photo captured by motion camera or webcam
  title: string; // e.g. "Unknown Person Detected at Gate", "Invoice #HPS-2026-0045 Cash Payment", "Pipe Loading Pickup Dispatch"
  description?: string;
  
  // Specific to Unknown Visitor Motion:
  isStaffRecognized?: boolean;
  threatLevel?: "normal" | "suspicious" | "cleared";
  visitorType?: "unregistered_visitor" | "customer_entry" | "after_hours_motion" | "delivery_staff";
  
  // Specific to Payment Counter:
  invoiceId?: string;
  invoiceNumber?: string;
  customerName?: string;
  amountPaid?: number;
  paymentMethod?: string;
  cashierName?: string;
  
  // Specific to Goods Dispatch / Exit:
  receiverName?: string;
  receiverPhone?: string;
  vehicleNumber?: string; // e.g. "Suzuki Ravi KHI-8891", "Rickshaw Loading #44", "Customer Hand Carry"
  itemsSummary?: string; // e.g. "12x PPRC Pipes, 4x Basin Mixers"
  gateOfficerName?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalPurchases: number;
  outstandingKhata: number; // Udhaar balance
  creditLimit: number;
  createdAt: string;
}

export interface KhataTransaction {
  id: string;
  customerId: string;
  date: string;
  type: "debit" | "credit";
  amount: number;
  invoiceNumber?: string;
  description: string;
  balanceAfter: number;
  paymentMode?: "cash" | "online_bank" | "cheque" | "easypaisa_jazzcash";
  bankName?: string; // e.g. "Meezan Bank", "HBL", "Bank Alfalah", "EasyPaisa", "JazzCash"
  transactionRef?: string; // Trx ID or Slip Number
  chequeNumber?: string;
  chequeDate?: string;
  receiptImageUrl?: string; // Image/Slip photo to prevent party disputes
  isVerified?: boolean;
}

export interface StaffAttendanceLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  branchId: string;
  branchName: string;
  counterStation: string;
  timestamp: string; // ISO string
  loginTime: string; // e.g. "08:30:15 AM"
  loginDate: string; // e.g. "2026-08-28"
  isFirstLoginOfDay?: boolean; // Marks official shop opening time
  punctualityStatus: "on_time" | "early" | "late";
}

export interface WhatsAppOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  branchId: string;
  branchName: string;
  itemsText: string;
  estimatedTotal: number;
  date: string;
  status: "new" | "confirmed" | "ready" | "dispatched" | "completed" | "cancelled";
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  ntn?: string;
  currencySymbol: string;
  receiptFooter: string;
  lowStockThreshold: number;
  enableDailyBackup?: boolean;
}

export type TabType = "playground" | "code-generator" | "migration" | "models";
export type SupportedLanguage = "python" | "typescript";

export interface ModelSpec {
  id: string;
  name: string;
  category: "text" | "multimodal" | "audio" | "image" | "video";
  contextWindow: string;
  maxOutput: string;
  description: string;
  bestFor: string;
  isDefault?: boolean;
  requiresPaidKey?: boolean;
}

export interface PromptPreset {
  id: string;
  title: string;
  description: string;
  prompt: string;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
  thinkingLevel?: "DEFAULT" | "LOW" | "HIGH" | "MINIMAL";
  responseMimeType?: string;
  responseSchema?: any;
  hasImage?: boolean;
  sampleImageUrl?: string;
}

export interface PlaygroundConfig {
  prompt: string;
  model: string;
  systemInstruction: string;
  temperature: number;
  topP: number;
  thinkingLevel: "DEFAULT" | "LOW" | "HIGH" | "MINIMAL";
  responseMimeType: string;
  isStreaming: boolean;
  imageBase64?: string;
  imageMimeType?: string;
  imageName?: string;
}

export interface GenerationResult {
  text: string;
  durationMs?: number;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  model?: string;
  error?: string;
}

export interface ConversationMessage {
  id: string;
  timestamp: string;
  role: "user" | "model";
  text: string;
  model?: string;
  systemInstruction?: string;
  durationMs?: number;
  tokens?: number;
  imageName?: string;
}

export interface ConversationSession {
  app: string;
  sessionId: string;
  exportedAt: string;
  sessionConfig: {
    model: string;
    systemInstruction?: string;
    temperature: number;
    topP: number;
    thinkingLevel: string;
    responseMimeType?: string;
    isStreaming: boolean;
  };
  messageCount: number;
  messages: ConversationMessage[];
}

export interface OnlineAiOrderItem {
  productId?: string;
  productCode?: string;
  productName: string;
  brand?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  stockStatus: "in_stock" | "low_stock" | "transfer_required" | "out_of_stock";
  branchAvailability?: {
    branchId: string;
    branchName: string;
    availableStock: number;
  }[];
}

export interface OnlineAiOrder {
  id: string;
  orderNumber: string; // e.g. "AI-ORD-8801"
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  source: "whatsapp" | "online_web" | "voice_bot" | "social_ad";
  assignedBranchId: string; // "branch-1" | "branch-2" | "branch-3"
  assignedBranchName: string;
  status: "new_inquiry" | "ai_verified" | "assigned" | "dispatched" | "delivered" | "cancelled";
  items: OnlineAiOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: "cod" | "bank_transfer" | "credit_khata";
  rawInquiryText: string;
  aiConfidence: number; // 0 to 100
  aiNotes: string;
  crossBranchNotes?: string;
  transferRecommended?: boolean;
  sourceBranchTransfer?: string;
  createdAt: string;
  invoiceId?: string;
}

export interface AiMarketingCampaign {
  id: string;
  title: string;
  campaignType: "dream_home" | "viral_social" | "trust_branding" | "plumber_special" | "seasonal_sale";
  targetAudience: string;
  headlineUrdu: string;
  headlineEnglish: string;
  contentUrdu: string;
  contentEnglish: string;
  suggestedOffer: string;
  trustGuarantees: string[];
  featuredCategories: string[];
  suggestedHashtags: string[];
  callToAction: string;
  branchContacts: {
    branchName: string;
    phone: string;
    whatsapp: string;
    location: string;
  }[];
  createdAt: string;
}

export interface AiSalesChatMessage {
  id: string;
  sender: "user" | "ai" | "system";
  text: string;
  timestamp: string;
  branchTag?: string;
  suggestedProducts?: {
    name: string;
    price: number;
    category: string;
    trustPoint: string;
  }[];
  quickReplies?: string[];
}

export interface ApiKeyPoolItem {
  id: string;
  index: number;
  maskedKey: string;
  status: "active" | "standby" | "rate_limited" | "error" | "untested";
  requestCount: number;
  errorCount: number;
  lastUsed?: string | null;
  lastError?: string | null;
  latencyMs?: number | null;
  addedAt?: string;
}

export interface ApiKeyPoolHealth {
  status: "healthy" | "standby" | "degraded" | "exhausted";
  rotationCount: number;
  currentIndex: number;
  totalKeys: number;
  keys: ApiKeyPoolItem[];
  totalRequests: number;
  rateLimitEvents: number;
  lastRotatedAt?: string | null;
  algorithm: string;
  activeModel: string;
}
