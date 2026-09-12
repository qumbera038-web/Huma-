import { GoogleGenAI } from "@google/genai";
import { validateGeminiApiKey, maskApiKey } from "./apiKeyValidator.ts";
import { ApiKeyPoolHealth, ApiKeyPoolItem } from "../types.ts";
import { formatGeminiErrorMessage } from "./errorHandler.ts";

interface InternalKeyEntry {
  id: string;
  key: string;
  status: "active" | "standby" | "rate_limited" | "error" | "untested";
  requestCount: number;
  errorCount: number;
  lastUsed: string | null;
  lastError: string | null;
  latencyMs: number | null;
  addedAt: string;
}

class ApiKeyPoolManager {
  private keys: InternalKeyEntry[] = [];
  private activeIndex: number = 0;
  private rotationCount: number = 0;
  private totalRequests: number = 0;
  private rateLimitEvents: number = 0;
  private lastRotatedAt: string | null = null;
  private clients: Map<string, GoogleGenAI> = new Map();

  constructor() {
    this.initializePool();
  }

  private initializePool() {
    const rawKeys: string[] = [];

    // 1. Check GEMINI_API_KEY
    if (process.env.GEMINI_API_KEY) {
      rawKeys.push(process.env.GEMINI_API_KEY);
    }

    // 2. Check numbered keys GEMINI_API_KEY_1 through GEMINI_API_KEY_6
    for (let i = 1; i <= 6; i++) {
      const numberedKey = process.env[`GEMINI_API_KEY_${i}`];
      if (numberedKey && !rawKeys.includes(numberedKey)) {
        rawKeys.push(numberedKey);
      }
    }

    // Filter valid keys
    const validKeys = rawKeys.filter((k) => {
      const val = validateGeminiApiKey(k);
      return val.isValid;
    });

    if (validKeys.length > 0) {
      this.keys = validKeys.map((key, idx) => ({
        id: `key-${Date.now()}-${idx}`,
        key: key.trim(),
        status: idx === 0 ? "active" : "standby",
        requestCount: 0,
        errorCount: 0,
        lastUsed: null,
        lastError: null,
        latencyMs: null,
        addedAt: new Date().toISOString(),
      }));
    } else {
      // Demo / Standby initial key entry
      const initialKey = process.env.GEMINI_API_KEY || "";
      this.keys = [
        {
          id: `key-init-0`,
          key: initialKey,
          status: initialKey ? "active" : "standby",
          requestCount: 0,
          errorCount: 0,
          lastUsed: null,
          lastError: null,
          latencyMs: null,
          addedAt: new Date().toISOString(),
        },
      ];
    }
    this.activeIndex = 0;
  }

  public getPoolHealth(): ApiKeyPoolHealth {
    const totalKeys = this.keys.length;
    const hasValidActiveKey = totalKeys > 0 && !!this.keys[this.activeIndex]?.key;

    let overallStatus: "healthy" | "standby" | "degraded" | "exhausted" = "standby";
    if (totalKeys === 0 || !hasValidActiveKey) {
      overallStatus = "standby";
    } else {
      const activeEntry = this.keys[this.activeIndex];
      const rateLimitedCount = this.keys.filter((k) => k.status === "rate_limited").length;
      const errorCount = this.keys.filter((k) => k.status === "error").length;

      if (rateLimitedCount === totalKeys || errorCount === totalKeys) {
        overallStatus = "exhausted";
      } else if (rateLimitedCount > 0 || errorCount > 0 || activeEntry.status === "rate_limited") {
        overallStatus = "degraded";
      } else {
        overallStatus = "healthy";
      }
    }

    const items: ApiKeyPoolItem[] = this.keys.map((k, idx) => ({
      id: k.id,
      index: idx,
      maskedKey: k.key ? maskApiKey(k.key) : "No Key Set (Standby)",
      status: idx === this.activeIndex ? (k.status === "rate_limited" ? "rate_limited" : "active") : k.status,
      requestCount: k.requestCount,
      errorCount: k.errorCount,
      lastUsed: k.lastUsed,
      lastError: k.lastError,
      latencyMs: k.latencyMs,
      addedAt: k.addedAt,
    }));

    return {
      status: overallStatus,
      rotationCount: this.rotationCount,
      currentIndex: this.activeIndex,
      activeKeyIndex: this.activeIndex,
      totalKeys,
      keys: items,
      items,
      totalRequests: this.totalRequests,
      rateLimitEvents: this.rateLimitEvents,
      lastRotatedAt: this.lastRotatedAt,
      algorithm: "Infinite Round-Robin with Automatic 429 Failover",
      activeModel: "gemini-2.5-flash",
    };
  }

  public getActiveClient(): { client: GoogleGenAI | null; key: string | null; index: number } {
    if (this.keys.length === 0) {
      return { client: null, key: null, index: -1 };
    }

    const entry = this.keys[this.activeIndex];
    if (!entry || !entry.key) {
      return { client: null, key: null, index: this.activeIndex };
    }

    const validation = validateGeminiApiKey(entry.key);
    if (!validation.isValid) {
      return { client: null, key: null, index: this.activeIndex };
    }

    let client = this.clients.get(entry.key);
    if (!client) {
      client = new GoogleGenAI({
        apiKey: validation.sanitizedKey || entry.key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build-keypool",
          },
        },
      });
      this.clients.set(entry.key, client);
    }

    return { client, key: entry.key, index: this.activeIndex };
  }

  public rotateKey(reason = "Manual Rotation"): ApiKeyPoolHealth {
    if (this.keys.length <= 1) {
      this.rotationCount++;
      this.lastRotatedAt = new Date().toISOString();
      return this.getPoolHealth();
    }

    const previousIndex = this.activeIndex;
    // Set old active to standby unless it was rate_limited
    if (this.keys[previousIndex] && this.keys[previousIndex].status === "active") {
      this.keys[previousIndex].status = "standby";
    }

    this.activeIndex = (this.activeIndex + 1) % this.keys.length;
    this.rotationCount++;
    this.lastRotatedAt = new Date().toISOString();

    // Mark new active key
    if (this.keys[this.activeIndex] && this.keys[this.activeIndex].status !== "rate_limited") {
      this.keys[this.activeIndex].status = "active";
    }

    console.log(`[API Key Pool] Rotated from index ${previousIndex} to ${this.activeIndex} (Reason: ${reason}). Total rotations: ${this.rotationCount}`);
    return this.getPoolHealth();
  }

  public addKey(rawKey: string): { success: boolean; message: string; pool: ApiKeyPoolHealth } {
    const trimmed = rawKey.trim();
    const validation = validateGeminiApiKey(trimmed);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.error || "Invalid API key format. Please enter a valid Gemini API key.",
        pool: this.getPoolHealth(),
      };
    }

    // Check duplicate
    const exists = this.keys.some((k) => k.key === trimmed);
    if (exists) {
      return {
        success: false,
        message: "This API key is already present in the pool.",
        pool: this.getPoolHealth(),
      };
    }

    // If existing keys are just empty placeholder, replace index 0
    if (this.keys.length === 1 && !this.keys[0].key) {
      this.keys[0].key = trimmed;
      this.keys[0].status = "active";
      this.keys[0].addedAt = new Date().toISOString();
      return {
        success: true,
        message: "Key added and activated as primary key #1.",
        pool: this.getPoolHealth(),
      };
    }

    const newIndex = this.keys.length;
    this.keys.push({
      id: `key-${Date.now()}-${newIndex}`,
      key: trimmed,
      status: "standby",
      requestCount: 0,
      errorCount: 0,
      lastUsed: null,
      lastError: null,
      latencyMs: null,
      addedAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: `API Key #${newIndex + 1} added to the round-robin pool.`,
      pool: this.getPoolHealth(),
    };
  }

  public removeKey(index: number): { success: boolean; message: string; pool: ApiKeyPoolHealth } {
    if (index < 0 || index >= this.keys.length) {
      return { success: false, message: "Invalid key index.", pool: this.getPoolHealth() };
    }

    if (this.keys.length <= 1) {
      // Clear instead of removing
      this.keys[0].key = "";
      this.keys[0].status = "standby";
      this.keys[0].requestCount = 0;
      this.keys[0].errorCount = 0;
      return { success: true, message: "Key cleared. Pool is in standby mode.", pool: this.getPoolHealth() };
    }

    const removed = this.keys.splice(index, 1);
    this.clients.delete(removed[0].key);

    if (this.activeIndex >= this.keys.length) {
      this.activeIndex = 0;
    }
    if (this.keys[this.activeIndex]) {
      this.keys[this.activeIndex].status = "active";
    }

    return {
      success: true,
      message: `Key #${index + 1} removed from pool.`,
      pool: this.getPoolHealth(),
    };
  }

  public recordRequest(index: number, success: boolean, durationMs: number, error?: any) {
    this.totalRequests++;
    if (index < 0 || index >= this.keys.length) return;

    const entry = this.keys[index];
    entry.requestCount++;
    entry.lastUsed = new Date().toISOString();
    entry.latencyMs = durationMs;

    if (!success) {
      entry.errorCount++;
      const formatted = formatGeminiErrorMessage(error);
      entry.lastError = formatted.message;

      // Rate limit or quota exhaustion triggers automatic rotation
      const statusStr = String(error?.status || error?.code || "");
      const is429 = statusStr.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED") || error?.message?.includes("quota");

      if (is429) {
        this.rateLimitEvents++;
        entry.status = "rate_limited";
        console.warn(`[API Key Pool] Key #${index + 1} hit rate limit / 429 quota. Rotating key...`);
        this.rotateKey(`Automatic 429 Rate-Limit on Key #${index + 1}`);
      } else {
        entry.status = "error";
      }
    } else {
      entry.status = "active";
      entry.lastError = null;
    }
  }

  /**
   * Execute a Gemini generation with automatic round-robin retry across the pool
   */
  public async executeWithRotation<T>(
    operation: (client: GoogleGenAI, key: string, index: number) => Promise<T>
  ): Promise<T> {
    const attempts = Math.max(this.keys.length, 1);
    let lastError: any = null;

    for (let i = 0; i < attempts; i++) {
      const { client, key, index } = this.getActiveClient();
      if (!client || !key) {
        throw new Error("No valid Gemini API keys configured in pool.");
      }

      const start = Date.now();
      try {
        const result = await operation(client, key, index);
        const duration = Date.now() - start;
        this.recordRequest(index, true, duration);
        return result;
      } catch (err: any) {
        const duration = Date.now() - start;
        this.recordRequest(index, false, duration, err);
        lastError = err;

        const isRateLimit =
          err?.status === 429 ||
          String(err?.message || "").includes("429") ||
          String(err?.message || "").includes("RESOURCE_EXHAUSTED");

        if (isRateLimit && this.keys.length > 1) {
          console.warn(`[API Key Pool] Retrying request with next rotated key in pool...`);
          continue;
        }

        throw err;
      }
    }

    throw lastError || new Error("All API keys in pool were exhausted or rate limited.");
  }
}

// Global Singleton Pool Instance
export const apiKeyPool = new ApiKeyPoolManager();
