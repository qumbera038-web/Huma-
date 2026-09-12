export interface Product {
  id: string;
  code?: string;
  barcode?: string;
  name: string;
  nameUrdu?: string;
  brand?: string;
  size?: string;
  category: string;
  price?: number;
  salePrice?: number;
  costPrice?: number;
  wholesalePrice?: number;
  contractorPrice?: number;
  pricingTiers?: {
    retail: number;
    wholesale: number;
    contractor: number;
    activeTier?: "retail" | "wholesale" | "contractor";
  };
  marketTrend?: string;
  marketTrendUrdu?: string;
  initialSalePrice?: number;
  initialCostPrice?: number;
  quantity?: number;
  stockQuantity?: number;
  minStockAlert?: number;
  imageUrl?: string;
  branchId?: string;
  unit?: string;
  description?: string;
  [key: string]: any;
}

export interface PriceList {
  id: string;
  name: string;
  date: string;
  items: { productId: string; price: number }[];
  [key: string]: any;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  balance?: number;
  khataType?: "customer" | "supplier";
  branchId?: string;
  totalPurchases?: number;
  totalPaid?: number;
  totalCredit?: number;
  outstandingKhata?: number;
  creditLimit?: number;
  createdAt?: string;
  [key: string]: any;
}

export interface InvoiceItem {
  productId?: string;
  productName?: string;
  price?: number;
  quantity: number;
  total: number;
  product?: any;
  unitPrice?: number;
  [key: string]: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  total: number;
  [key: string]: any;
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax?: number;
  grandTotal: number;
  amountPaid: number;
  changeAmount?: number;
  balanceDue?: number;
  paymentMethod: string;
  paymentMode?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  cashierName: string;
  cashierId?: string;
  cashierRole?: string;
  cashierAvatar?: string;
  counterStation?: string;
  branchId?: string;
  branchName?: string;
  notes?: string;
  [key: string]: any;
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
  enableDailyBackup: boolean;
  [key: string]: any;
}

export interface UserAccount {
  id: string;
  name: string;
  role: "super_admin" | "admin" | "manager" | "cashier" | string;
  pin?: string;
  hasPassword?: boolean;
  avatarUrl?: string;
  counterStation?: string;
  phone?: string;
  branchId?: string;
  branchName?: string;
  cnic?: string;
  address?: string;
  secondContactName?: string;
  secondContactRelation?: string;
  secondContactPhone?: string;
  biometricRegistered?: boolean;
  biometricId?: string;
  biometricDate?: string;
  faceRecognitionRegistered?: boolean;
  faceConfidence?: number;
  kycCompleted?: boolean;
  kycDate?: string;
  [key: string]: any;
}

export interface KhataTransaction {
  id: string;
  customerId: string;
  customerName?: string;
  date: string;
  type: string;
  amount: number;
  description: string;
  recordedBy?: string;
  branchId?: string;
  invoiceNumber?: string;
  balanceAfter?: number;
  paymentMode?: string;
  bankName?: string;
  transactionRef?: string;
  chequeNumber?: string;
  receiptImageUrl?: string;
  chequeDate?: string;
  [key: string]: any;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  shortName: string;
  urduName: string;
  headName: string;
  headRole: string;
  headAvatar: string;
  phone: string;
  ptcl?: string;
  mobile?: string;
  address: string;
  cameraUrl?: string;
  hasCamera?: boolean;
  [key: string]: any;
}

export interface StaffAttendanceLog {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  date?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: string;
  branchId?: string;
  branchName?: string;
  counterStation?: string;
  timestamp?: string;
  loginTime?: string;
  loginDate?: string;
  isFirstLoginOfDay?: boolean;
  punctualityStatus?: string;
  notes?: string;
  [key: string]: any;
}

export interface WhatsAppOrder {
  id: string;
  customerName: string;
  phone?: string;
  customerPhone?: string;
  message?: string;
  itemsText?: string;
  estimatedTotal?: number;
  date: string;
  status: string;
  branchId?: string;
  branchName?: string;
  notes?: string;
  [key: string]: any;
}

export interface OnlineAiOrder {
  id: string;
  orderNumber?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  itemsSummary?: string;
  totalAmount?: number;
  date?: string;
  createdAt?: string;
  status: string;
  branchId?: string;
  assignedBranchId?: string;
  assignedBranchName?: string;
  source?: string;
  items?: any[];
  [key: string]: any;
}

export interface AiMarketingCampaign {
  id: string;
  title: string;
  platform?: string;
  content?: string;
  contentUrdu?: string;
  contentEnglish?: string;
  headlineUrdu?: string;
  headlineEnglish?: string;
  targetAudience?: string;
  generatedAt?: string;
  createdAt?: string;
  status?: string;
  campaignType?: string;
  suggestedOffer?: string;
  trustGuarantees?: string[];
  featuredCategories?: string[];
  suggestedHashtags?: string[];
  callToAction?: string;
  branchContacts?: any[];
  [key: string]: any;
}

export interface AiSalesChatMessage {
  id: string;
  sender: "ai" | "user" | string;
  text: string;
  timestamp: string;
  suggestedProducts?: Array<{
    name: string;
    price: number;
    category?: string;
    trustPoint?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface MotionSnapshot {
  id: string;
  branchId?: string;
  branchName?: string;
  cameraName?: string;
  category?: string;
  title?: string;
  description?: string;
  timestamp: string;
  timeFormatted?: string;
  dateFormatted?: string;
  imageUrl?: string;
  detectedObjects?: string[];
  motionScore?: number;
  isStaffRecognized?: boolean;
  threatLevel?: string;
  visitorType?: string;
  [key: string]: any;
}

export interface StaffMessage {
  id: string;
  senderId?: string;
  senderName?: string;
  senderRole?: string;
  recipientId?: string;
  branchId?: string;
  message?: string;
  text?: string;
  type?: string;
  isSecret?: boolean;
  timestamp: string;
  [key: string]: any;
}

export interface BusinessExpense {
  id: string;
  date?: string;
  monthYear?: string;
  description?: string;
  category?: string;
  amount?: number;
  paymentMethod?: string;
  branchId?: string;
  branchName?: string;
  recordedBy?: string;
  isRecurring?: boolean;
  [key: string]: any;
}

export interface ApiKeyPoolItem {
  id: string;
  maskedKey: string;
  status: "active" | "standby" | "rate_limited" | "error" | "untested";
  requestCount: number;
  errorCount: number;
  lastUsed: string | null;
  latencyMs: number | null;
  [key: string]: any;
}

export interface ApiKeyPoolHealth {
  totalKeys: number;
  activeKeyIndex?: number;
  currentIndex?: number;
  rotationCount: number;
  totalRequests: number;
  rateLimitEvents: number;
  lastRotatedAt: string | null;
  status?: string;
  keys?: any;
  algorithm?: string;
  activeModel?: string;
  items?: ApiKeyPoolItem[];
  [key: string]: any;
}

export type MessageType = "text" | "alert" | "order" | "inventory" | "system" | "secret" | string;
export type ExpenseCategory = string;
export type PaymentMethod = string;
export type MonthlyExpenseReport = any;
export type ProductCategory = string;
export type SnapshotCategory = string;
export type StaffPresence = string;
export type UserRole = string;
export type BranchCamera = any;



