import { Product, Customer, Invoice, StoreSettings, UserAccount, KhataTransaction, Branch, StaffAttendanceLog, WhatsAppOrder, OnlineAiOrder, AiMarketingCampaign, MotionSnapshot, StaffMessage, BusinessExpense } from "../types";
import { 
  DEFAULT_STORE_SETTINGS, 
  DEFAULT_USERS, 
  DEFAULT_BRANCHES,
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_INVOICES,
  DEFAULT_ATTENDANCE_LOGS,
  DEFAULT_WHATSAPP_ORDERS,
  DEFAULT_AI_ORDERS,
  DEFAULT_AI_CAMPAIGNS,
  DEFAULT_MOTION_SNAPSHOTS,
  INITIAL_STAFF_MESSAGES,
  INITIAL_EXPENSES
} from "../data/posData";

const KEYS = {
  PRODUCTS: "hps_pos_products_v3",
  CUSTOMERS: "hps_pos_customers_v3",
  INVOICES: "hps_pos_invoices_v3",
  SETTINGS: "hps_pos_settings_v3",
  USERS: "hps_pos_users_v3",
  ACTIVE_USER: "hps_pos_active_user_v3",
  KHATA: "hps_pos_khata_txs_v3",
  BRANCHES: "hps_pos_branches_v3",
  ACTIVE_BRANCH: "hps_pos_active_branch_v3",
  ATTENDANCE: "hps_pos_attendance_logs_v3",
  WHATSAPP_ORDERS: "hps_pos_whatsapp_orders_v3",
  AI_ORDERS: "hps_pos_ai_orders_v3",
  AI_CAMPAIGNS: "hps_pos_ai_campaigns_v3",
  SNAPSHOTS: "hps_pos_motion_snapshots_v3",
  STAFF_MESSAGES: "hps_pos_staff_messages_v1",
  EXPENSES: "hps_pos_expenses_v1",
  THEME: "hps_pos_theme_v3",
  LAST_BACKUP: "hps_pos_last_backup_date",
  LAST_MAINTENANCE: "hps_pos_last_maintenance_date_v1",
  LAST_SAVE: "hps_pos_last_local_save_time_v3",
};

export const getMaintenanceStatus = (): { needsMaintenance: boolean; daysSince: number } => {
  const lastMaintenance = localStorage.getItem(KEYS.LAST_MAINTENANCE);
  if (!lastMaintenance) return { needsMaintenance: true, daysSince: 99 };
  
  const lastDate = new Date(lastMaintenance);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return {
    needsMaintenance: diffDays >= 3,
    daysSince: diffDays
  };
};

export const recordMaintenance = () => {
  localStorage.setItem(KEYS.LAST_MAINTENANCE, new Date().toISOString());
};

export const recordLocalDataSave = () => {
  try {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const dateStr = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
    const fullTimeStr = `${dateStr} ${timeStr}`;
    localStorage.setItem(KEYS.LAST_SAVE, fullTimeStr);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("hps_local_data_saved", { detail: { timestamp: fullTimeStr } }));
    }
  } catch (e) {
    console.error("Failed to record local save timestamp", e);
  }
};

export const getLastDataSaveTime = (): string => {
  try {
    const stored = localStorage.getItem(KEYS.LAST_SAVE);
    if (stored) return stored;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const dateStr = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
    return `${dateStr} ${timeStr}`;
  } catch {
    return "Just now";
  }
};

export type AppTheme = "uni" | "slate" | "light" | "navy" | "emerald" | "black" | "amber" | "3d";

export const getStoredTheme = (): AppTheme => {
  try {
    const raw = localStorage.getItem(KEYS.THEME);
    if (raw && ["uni", "slate", "light", "navy", "emerald", "black", "amber", "3d"].includes(raw)) {
      return raw as AppTheme;
    }
    return "uni"; // Default to clean Uniform (Uni) background
  } catch {
    return "uni";
  }
};

export const saveStoredTheme = (theme: AppTheme) => {
  localStorage.setItem(KEYS.THEME, theme);
};

export const getStoredStaffMessages = (): StaffMessage[] => {
  try {
    const raw = localStorage.getItem(KEYS.STAFF_MESSAGES);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_STAFF_MESSAGES;
  } catch {
    return INITIAL_STAFF_MESSAGES;
  }
};

export const saveStaffMessages = (messages: StaffMessage[]) => {
  localStorage.setItem(KEYS.STAFF_MESSAGES, JSON.stringify(messages));
  recordLocalDataSave();
};

export const addStaffMessage = (msgData: Omit<StaffMessage, "id" | "timestamp">): StaffMessage => {
  const currentMessages = getStoredStaffMessages();
  const newMessage: StaffMessage = {
    ...msgData,
    id: `staff-msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };
  const updatedMessages = [...currentMessages, newMessage];
  saveStaffMessages(updatedMessages);
  return newMessage;
};
export const getStoredExpenses = (): BusinessExpense[] => {
  try {
    const raw = localStorage.getItem(KEYS.EXPENSES);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_EXPENSES;
  } catch {
    return INITIAL_EXPENSES;
  }
};

export const saveExpenses = (expenses: BusinessExpense[]) => {
  localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  recordLocalDataSave();
};

export const addExpense = (expData: Omit<BusinessExpense, "id">): BusinessExpense => {
  const currentExpenses = getStoredExpenses();
  const newExpense: BusinessExpense = {
    ...expData,
    id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  };
  const updatedExpenses = [...currentExpenses, newExpense];
  saveExpenses(updatedExpenses);
  return newExpense;
};

export const getStoredAttendanceLogs = (): StaffAttendanceLog[] => {
  try {
    const raw = localStorage.getItem(KEYS.ATTENDANCE);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : DEFAULT_ATTENDANCE_LOGS;
  } catch {
    return DEFAULT_ATTENDANCE_LOGS;
  }
};

export const saveStoredAttendanceLogs = (logs: StaffAttendanceLog[]) => {
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(logs));
  recordLocalDataSave();
};

export const logStaffLogin = (user: UserAccount): StaffAttendanceLog => {
  const currentLogs = getStoredAttendanceLogs();
  const now = new Date();
  const todayDateStr = now.toISOString().slice(0, 10);
  
  // Format local 12-hour time (e.g. "08:30:15 AM")
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Check if this branch already had a login today
  const branchUserBranchId = user.branchId || "branch-1";
  const isFirstForBranchToday = !currentLogs.some(
    (l) => l.branchId === branchUserBranchId && l.loginDate === todayDateStr
  );

  // Determine punctuality (Standard shop opening: 08:45 AM or before is On-time/Early, after is Late)
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  let punctuality: "on_time" | "early" | "late" = "on_time";
  if (currentHour < 8 || (currentHour === 8 && currentMinute <= 30)) {
    punctuality = "early";
  } else if (currentHour === 8 || (currentHour === 9 && currentMinute <= 0)) {
    punctuality = "on_time";
  } else {
    punctuality = "late";
  }

  const newLog: StaffAttendanceLog = {
    id: `att-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    branchId: branchUserBranchId,
    branchName: user.branchName || "Branch 1 (Main HQ)",
    counterStation: user.counterStation || "Counter #1",
    timestamp: now.toISOString(),
    loginTime: timeStr,
    loginDate: todayDateStr,
    isFirstLoginOfDay: isFirstForBranchToday,
    punctualityStatus: punctuality,
  };

  const updatedLogs = [newLog, ...currentLogs.slice(0, 150)]; // keep last 150 entries
  saveStoredAttendanceLogs(updatedLogs);
  return newLog;
};

export const getStoredWhatsAppOrders = (): WhatsAppOrder[] => {
  try {
    const raw = localStorage.getItem(KEYS.WHATSAPP_ORDERS);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : DEFAULT_WHATSAPP_ORDERS;
  } catch {
    return DEFAULT_WHATSAPP_ORDERS;
  }
};

export const saveStoredWhatsAppOrders = (orders: WhatsAppOrder[]) => {
  localStorage.setItem(KEYS.WHATSAPP_ORDERS, JSON.stringify(orders));
  recordLocalDataSave();
};

export const getStoredBranches = (): Branch[] => {
  try {
    const raw = localStorage.getItem(KEYS.BRANCHES);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : DEFAULT_BRANCHES;
  } catch {
    return DEFAULT_BRANCHES;
  }
};

export const saveStoredBranches = (branches: Branch[]) => {
  localStorage.setItem(KEYS.BRANCHES, JSON.stringify(branches));
  recordLocalDataSave();
};

export const getActiveBranchId = (): string => {
  try {
    const raw = localStorage.getItem(KEYS.ACTIVE_BRANCH);
    return raw || "all"; // "all" for Super Admin overview, or "branch-1", "branch-2", "branch-3"
  } catch {
    return "all";
  }
};

export const setActiveBranchId = (branchId: string) => {
  localStorage.setItem(KEYS.ACTIVE_BRANCH, branchId);
};

export const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(KEYS.PRODUCTS);
    if (!raw) return INITIAL_PRODUCTS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_PRODUCTS;
    
    // Dynamic merge: If any product in INITIAL_PRODUCTS is missing from localStorage (e.g. newly added Qumber Automation sensors), inject it
    let updated = [...parsed];
    let isChanged = false;
    INITIAL_PRODUCTS.forEach((initialProduct) => {
      const exists = parsed.some((p) => p && (p.id === initialProduct.id || p.code === initialProduct.code));
      if (!exists) {
        updated.push(initialProduct);
        isChanged = true;
      }
    });
    
    if (isChanged) {
      saveStoredProducts(updated);
    }
    return updated;
  } catch {
    return INITIAL_PRODUCTS;
  }
};

export const saveStoredProducts = (products: Product[]) => {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  recordLocalDataSave();
};

export const getStoredCustomers = (): Customer[] => {
  try {
    const raw = localStorage.getItem(KEYS.CUSTOMERS);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : INITIAL_CUSTOMERS;
  } catch {
    return INITIAL_CUSTOMERS;
  }
};

export const saveStoredCustomers = (customers: Customer[]) => {
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  recordLocalDataSave();
};

export const getStoredInvoices = (): Invoice[] => {
  try {
    const raw = localStorage.getItem(KEYS.INVOICES);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : INITIAL_INVOICES;
  } catch {
    return INITIAL_INVOICES;
  }
};

export const saveStoredInvoices = (invoices: Invoice[]) => {
  localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  recordLocalDataSave();
};

export const getStoredSettings = (): StoreSettings => {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        !parsed.storeName ||
        parsed.storeName === "Qumber Pipe & Sanitary Store" ||
        parsed.storeName === "QumberSanitary" ||
        parsed.storeName === "Qumber Pipe And Sanitary Store"
      ) {
        parsed.storeName = "Haider Pipe and Sanitary Store";
      }
      if (!parsed.currencySymbol || parsed.currencySymbol === "Rs.") {
        parsed.currencySymbol = "PKR";
      }
      saveStoredSettings(parsed);
      return parsed;
    }
    return DEFAULT_STORE_SETTINGS;
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
};

export const saveStoredSettings = (settings: StoreSettings) => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  recordLocalDataSave();
};

export const getStoredUsers = (): UserAccount[] => {
  try {
    const raw = localStorage.getItem(KEYS.USERS);
    if (!raw) return DEFAULT_USERS;
    const parsed: UserAccount[] = JSON.parse(raw);
    let updated = false;
    const merged = parsed.map((u, idx) => {
      const defaultMatch = DEFAULT_USERS.find((du) => du.id === u.id) || DEFAULT_USERS[idx % DEFAULT_USERS.length];
      const hasPassword = u.hasPassword ?? (u.pin ? true : false);
      const avatarUrl = u.avatarUrl || defaultMatch?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80";
      const counterStation = u.counterStation || (u.role === "admin" ? "Counter #1 (Main Executive Desk)" : u.role === "cashier" ? "Counter #1 (Cash & Billing)" : "Counter #2 (Dispatch & Stock)");
      const cnic = u.cnic || defaultMatch?.cnic || "17301-8493012-1";
      const phone = u.phone || defaultMatch?.phone || "0300-5861463";
      const address = u.address || defaultMatch?.address || "Peshawar, Khyber Pakhtunkhwa";
      const secondContactName = u.secondContactName || defaultMatch?.secondContactName || "Tariq Ali";
      const secondContactRelation = u.secondContactRelation || defaultMatch?.secondContactRelation || "Brother / Guarantor";
      const secondContactPhone = u.secondContactPhone || defaultMatch?.secondContactPhone || "0301-9988776";
      const biometricRegistered = u.biometricRegistered ?? true;
      const biometricId = u.biometricId || defaultMatch?.biometricId || `BIO-${u.id.toUpperCase()}`;
      const biometricDate = u.biometricDate || defaultMatch?.biometricDate || "2026-01-15 09:00 AM";
      const faceRecognitionRegistered = u.faceRecognitionRegistered ?? true;
      const faceConfidence = u.faceConfidence || defaultMatch?.faceConfidence || 99.4;
      const kycCompleted = u.kycCompleted ?? true;
      const kycDate = u.kycDate || defaultMatch?.kycDate || "2026-01-15";

      if (!u.cnic || !u.secondContactName || u.kycCompleted === undefined) {
        updated = true;
      }

      return {
        ...u,
        hasPassword,
        avatarUrl,
        counterStation,
        cnic,
        phone,
        address,
        secondContactName,
        secondContactRelation,
        secondContactPhone,
        biometricRegistered,
        biometricId,
        biometricDate,
        faceRecognitionRegistered,
        faceConfidence,
        kycCompleted,
        kycDate,
      };
    });

    if (updated) {
      saveStoredUsers(merged);
    }
    return merged;
  } catch {
    return DEFAULT_USERS;
  }
};

export const saveStoredUsers = (users: UserAccount[]) => {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  recordLocalDataSave();
};

export const getActiveUser = (): UserAccount => {
  try {
    const users = getStoredUsers();
    const raw = localStorage.getItem(KEYS.ACTIVE_USER);
    if (raw) {
      const active = JSON.parse(raw);
      const matched = users.find((u) => u.id === active.id);
      if (matched) return matched;
    }
    return users[0] || DEFAULT_USERS[0];
  } catch {
    return DEFAULT_USERS[0];
  }
};

export const setActiveUser = (user: UserAccount) => {
  localStorage.setItem(KEYS.ACTIVE_USER, JSON.stringify(user));
};

export const getStoredKhata = (): KhataTransaction[] => {
  try {
    const raw = localStorage.getItem(KEYS.KHATA);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    
    return [
      {
        id: "tx-1",
        customerId: "cust-1",
        date: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
        type: "debit",
        amount: 25000,
        invoiceNumber: "133-2026-0042",
        description: "Master PPRC & PVC Fittings for 1-Kanal project",
        balanceAfter: 44500,
        paymentMode: "cash",
      },
      {
        id: "tx-2",
        customerId: "cust-1",
        date: new Date(Date.now() - 3600000 * 24).toISOString(),
        type: "credit",
        amount: 20000,
        description: "Meezan Bank Online Transfer (Trx #MZ-994821)",
        balanceAfter: 24500,
        paymentMode: "online_bank",
        bankName: "Meezan Bank",
        transactionRef: "MZ-9948210492",
        receiptImageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
        isVerified: true,
      },
      {
        id: "tx-3",
        customerId: "cust-2",
        date: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
        type: "debit",
        amount: 120000,
        invoiceNumber: "133-2026-0015",
        description: "Porta Commode Sets & CP fittings delivery",
        balanceAfter: 120000,
        paymentMode: "cash",
      },
      {
        id: "tx-4",
        customerId: "cust-2",
        date: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        type: "credit",
        amount: 35000,
        description: "Bank Alfalah Cheque #BA-849201 Cleared",
        balanceAfter: 85000,
        paymentMode: "cheque",
        bankName: "Bank Alfalah",
        chequeNumber: "BA-849201",
        chequeDate: "2026-08-25",
        receiptImageUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=600&auto=format&fit=crop&q=80",
        isVerified: true,
      },
    ];
  } catch {
    return [];
  }
};

export const saveStoredKhata = (txs: KhataTransaction[]) => {
  localStorage.setItem(KEYS.KHATA, JSON.stringify(txs));
  recordLocalDataSave();
};

export const exportAllDataBackup = () => {
  const data = {
    exportedAt: new Date().toISOString(),
    appName: "QumberSanitary POS",
    version: "2.0.0",
    settings: getStoredSettings(),
    branches: getStoredBranches(),
    products: getStoredProducts(),
    customers: getStoredCustomers(),
    invoices: getStoredInvoices(),
    khata: getStoredKhata(),
    attendanceLogs: getStoredAttendanceLogs(),
    whatsappOrders: getStoredWhatsAppOrders(),
    users: getStoredUsers(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `qumber-pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  localStorage.setItem(KEYS.LAST_BACKUP, new Date().toISOString().slice(0, 10));
};

export const getLastBackupDate = (): string | null => {
  return localStorage.getItem(KEYS.LAST_BACKUP);
};

export const resetAllData = () => {
  localStorage.removeItem(KEYS.PRODUCTS);
  localStorage.removeItem(KEYS.CUSTOMERS);
  localStorage.removeItem(KEYS.INVOICES);
  localStorage.removeItem(KEYS.SETTINGS);
  localStorage.removeItem(KEYS.USERS);
  localStorage.removeItem(KEYS.KHATA);
  localStorage.removeItem(KEYS.ACTIVE_USER);
  localStorage.removeItem(KEYS.BRANCHES);
  localStorage.removeItem(KEYS.ATTENDANCE);
  localStorage.removeItem(KEYS.WHATSAPP_ORDERS);
  localStorage.removeItem(KEYS.AI_ORDERS);
  localStorage.removeItem(KEYS.AI_CAMPAIGNS);
};

export const getStoredAiOrders = (): OnlineAiOrder[] => {
  try {
    const raw = localStorage.getItem(KEYS.AI_ORDERS);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : DEFAULT_AI_ORDERS;
  } catch {
    return DEFAULT_AI_ORDERS;
  }
};

export const saveStoredAiOrders = (orders: OnlineAiOrder[]) => {
  localStorage.setItem(KEYS.AI_ORDERS, JSON.stringify(orders));
  recordLocalDataSave();
};

export const getStoredAiCampaigns = (): AiMarketingCampaign[] => {
  try {
    const raw = localStorage.getItem(KEYS.AI_CAMPAIGNS);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : DEFAULT_AI_CAMPAIGNS;
  } catch {
    return DEFAULT_AI_CAMPAIGNS;
  }
};

export const saveStoredAiCampaigns = (campaigns: AiMarketingCampaign[]) => {
  localStorage.setItem(KEYS.AI_CAMPAIGNS, JSON.stringify(campaigns));
  recordLocalDataSave();
};

export const getStoredMotionSnapshots = (): MotionSnapshot[] => {
  try {
    const raw = localStorage.getItem(KEYS.SNAPSHOTS);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MOTION_SNAPSHOTS;
  } catch {
    return DEFAULT_MOTION_SNAPSHOTS;
  }
};

export const saveStoredMotionSnapshots = (snapshots: MotionSnapshot[]) => {
  localStorage.setItem(KEYS.SNAPSHOTS, JSON.stringify(snapshots));
  recordLocalDataSave();
};

export const addMotionSnapshot = (
  snapshotData: Omit<MotionSnapshot, "id" | "timestamp" | "timeFormatted" | "dateFormatted">
): MotionSnapshot => {
  const current = getStoredMotionSnapshots();
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateFormatted = now.toISOString().slice(0, 10);
  const newSnapshot: MotionSnapshot = {
    ...snapshotData,
    id: `snap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: now.toISOString(),
    timeFormatted,
    dateFormatted,
  };
  const updated = [newSnapshot, ...current];
  saveStoredMotionSnapshots(updated);
  return newSnapshot;
};
