export type UserRole = "admin" | "cashier" | "manager";

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
  isSuperAdmin?: boolean; // Haider Ali (Owner who can view all 3 branches & CCTV)
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
