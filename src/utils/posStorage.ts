import { Product, Customer, Invoice, StoreSettings, UserAccount, KhataTransaction, Branch, StaffAttendanceLog, WhatsAppOrder } from "../types";
import { 
  DEFAULT_STORE_SETTINGS, 
  DEFAULT_USERS, 
  DEFAULT_BRANCHES,
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_INVOICES,
  DEFAULT_ATTENDANCE_LOGS,
  DEFAULT_WHATSAPP_ORDERS
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
  THEME: "hps_pos_theme_v3",
};

export type AppTheme = "slate" | "light" | "navy" | "emerald" | "black" | "amber" | "3d";

export const getStoredTheme = (): AppTheme => {
  try {
    const raw = localStorage.getItem(KEYS.THEME);
    if (raw && ["slate", "light", "navy", "emerald", "black", "amber", "3d"].includes(raw)) {
      return raw as AppTheme;
    }
    return "3d"; // Default to 3D theme for HaiderSanitary dream showroom
  } catch {
    return "3d";
  }
};

export const saveStoredTheme = (theme: AppTheme) => {
  localStorage.setItem(KEYS.THEME, theme);
};

export const getStoredAttendanceLogs = (): StaffAttendanceLog[] => {
  try {
    const raw = localStorage.getItem(KEYS.ATTENDANCE);
    return raw ? JSON.parse(raw) : DEFAULT_ATTENDANCE_LOGS;
  } catch {
    return DEFAULT_ATTENDANCE_LOGS;
  }
};

export const saveStoredAttendanceLogs = (logs: StaffAttendanceLog[]) => {
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(logs));
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
    return raw ? JSON.parse(raw) : DEFAULT_WHATSAPP_ORDERS;
  } catch {
    return DEFAULT_WHATSAPP_ORDERS;
  }
};

export const saveStoredWhatsAppOrders = (orders: WhatsAppOrder[]) => {
  localStorage.setItem(KEYS.WHATSAPP_ORDERS, JSON.stringify(orders));
};

export const getStoredBranches = (): Branch[] => {
  try {
    const raw = localStorage.getItem(KEYS.BRANCHES);
    return raw ? JSON.parse(raw) : DEFAULT_BRANCHES;
  } catch {
    return DEFAULT_BRANCHES;
  }
};

export const saveStoredBranches = (branches: Branch[]) => {
  localStorage.setItem(KEYS.BRANCHES, JSON.stringify(branches));
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
    const parsed: Product[] = JSON.parse(raw);
    
    // Dynamic merge: If any product in INITIAL_PRODUCTS is missing from localStorage (e.g. newly added Haider Automation sensors), inject it
    let updated = [...parsed];
    let isChanged = false;
    INITIAL_PRODUCTS.forEach((initialProduct) => {
      const exists = parsed.some((p) => p.id === initialProduct.id || p.code === initialProduct.code);
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
};

export const getStoredCustomers = (): Customer[] => {
  try {
    const raw = localStorage.getItem(KEYS.CUSTOMERS);
    return raw ? JSON.parse(raw) : INITIAL_CUSTOMERS;
  } catch {
    return INITIAL_CUSTOMERS;
  }
};

export const saveStoredCustomers = (customers: Customer[]) => {
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
};

export const getStoredInvoices = (): Invoice[] => {
  try {
    const raw = localStorage.getItem(KEYS.INVOICES);
    return raw ? JSON.parse(raw) : INITIAL_INVOICES;
  } catch {
    return INITIAL_INVOICES;
  }
};

export const saveStoredInvoices = (invoices: Invoice[]) => {
  localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
};

export const getStoredSettings = (): StoreSettings => {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.storeName === "Haider Pipe & Sanitary Store") {
        parsed.storeName = "HaiderSanitary";
        saveStoredSettings(parsed);
      }
      return parsed;
    }
    return DEFAULT_STORE_SETTINGS;
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
};

export const saveStoredSettings = (settings: StoreSettings) => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

export const getStoredUsers = (): UserAccount[] => {
  try {
    const raw = localStorage.getItem(KEYS.USERS);
    if (!raw) return DEFAULT_USERS;
    const parsed: UserAccount[] = JSON.parse(raw);
    return parsed.map((u, idx) => ({
      ...u,
      hasPassword: u.hasPassword ?? (u.pin ? true : false),
      avatarUrl: u.avatarUrl || DEFAULT_USERS[idx % DEFAULT_USERS.length]?.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      counterStation: u.counterStation || (u.role === "admin" ? "Counter #1 (Main Executive Desk)" : u.role === "cashier" ? "Counter #1 (Cash & Billing)" : "Counter #2 (Dispatch & Stock)"),
    }));
  } catch {
    return DEFAULT_USERS;
  }
};

export const saveStoredUsers = (users: UserAccount[]) => {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
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
    if (raw) return JSON.parse(raw);
    
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
};

export const exportAllDataBackup = () => {
  const data = {
    exportedAt: new Date().toISOString(),
    appName: "HaiderSanitary POS",
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
  a.download = `haider-pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
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
};
