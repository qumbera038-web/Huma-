import { AiMarketingCampaign, OnlineAiOrder, Product, Branch } from "../types";

export interface MarketingCampaignOptions {
  campaignType: "dream_home" | "viral_social" | "trust_branding" | "plumber_special" | "seasonal_sale";
  targetAudience: string;
  language?: "bilingual" | "urdu" | "english";
  themeFocus?: string;
  customOffer?: string;
  featuredProducts?: string[];
}

export interface OrderAiOptions {
  inquiryText: string;
  inventoryContext?: string;
  branches?: Branch[];
}

export async function generateMarketingCampaign(
  options: MarketingCampaignOptions
): Promise<Partial<AiMarketingCampaign>> {
  const response = await fetch("/api/gemini/marketing-campaign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error ${response.status}`);
  }

  return await response.json();
}

export async function parseOnlineOrderWithAI(
  options: OrderAiOptions
): Promise<Partial<OnlineAiOrder>> {
  const response = await fetch("/api/gemini/order-ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error ${response.status}`);
  }

  return await response.json();
}

export async function chatWithSalesAdvisor(
  message: string,
  branchId: string,
  history: { sender: "user" | "ai"; text: string }[]
): Promise<{
  text: string;
  suggestedProducts?: { name: string; price: number; category: string; trustPoint: string }[];
  quickReplies?: string[];
  isFallback?: boolean;
}> {
  const response = await fetch("/api/gemini/chat-advisor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, branchId, history }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error ${response.status}`);
  }

  return await response.json();
}

export async function generateCustomAIContent(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const response = await fetch("/api/gemini/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, systemInstruction }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error ${response.status}`);
  }

  const data = await response.json();
  return data.text || "";
}
