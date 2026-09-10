export interface ApiKeyValidationResult {
  isValid: boolean;
  sanitizedKey?: string;
  error?: string;
  warning?: string;
  details?: {
    length: number;
    expectedLength: number;
    prefix: string;
    hasValidPrefix: boolean;
    hasValidFormat: boolean;
    isPlaceholder: boolean;
  };
}

/**
 * Standard regex pattern for Google Gemini API Keys:
 * - Begins with the prefix 'AIza' (typically 'AIzaSy')
 * - Followed by 35 URL-safe base64 characters (alphanumeric, underscores, hyphens)
 * - Total length of 39 characters
 */
const GEMINI_API_KEY_REGEX = /^AIza[0-9A-Za-z-_]{35}$/;

/**
 * Verifies the structure and formatting of a Gemini API key before attempting API calls.
 * 
 * @param apiKey The API key string to validate
 * @returns ApiKeyValidationResult containing validity status and detailed diagnostic messages
 */
export function validateGeminiApiKey(apiKey: string | undefined | null): ApiKeyValidationResult {
  if (!apiKey || typeof apiKey !== "string") {
    return {
      isValid: false,
      error: "API key is missing or undefined. Please configure GEMINI_API_KEY.",
      details: {
        length: 0,
        expectedLength: 39,
        prefix: "",
        hasValidPrefix: false,
        hasValidFormat: false,
        isPlaceholder: false,
      },
    };
  }

  const trimmed = apiKey.trim();

  // Explicit placeholder list check
  const placeholders = [
    "MY_GEMINI_API_KEY",
    "YOUR_API_KEY",
    "YOUR_GEMINI_API_KEY",
    "PLACEHOLDER",
    "API_KEY",
  ];

  if (placeholders.includes(trimmed.toUpperCase())) {
    return {
      isValid: false,
      sanitizedKey: trimmed,
      error: `API key is set to a placeholder value ('${trimmed}'). Please replace it with your actual Gemini API key from Google AI Studio.`,
      details: {
        length: trimmed.length,
        expectedLength: 39,
        prefix: trimmed.substring(0, 6),
        hasValidPrefix: trimmed.startsWith("AIza"),
        hasValidFormat: false,
        isPlaceholder: true,
      },
    };
  }

  // Check for common template regex placeholders
  const placeholderPatterns = [
    /^YOUR[_-]?API[_-]?KEY/i,
    /^MY[_-]?GEMINI[_-]?API[_-]?KEY/i,
    /^AIzaSyYourActual/i,
    /^AIzaSyYourKey/i,
    /^AIzaSy\.\.\./i,
    /^AIzaSyXXX/i,
    /^AIzaSy12345/i,
    /^placeholder/i,
    /^test/i,
    /^demo/i,
    /^fake/i,
  ];

  const isPlaceholder = placeholderPatterns.some((pattern) => pattern.test(trimmed));
  if (isPlaceholder) {
    return {
      isValid: false,
      sanitizedKey: trimmed,
      error: `API key is set to a placeholder value ('${trimmed}'). Please replace it with your actual Gemini API key from Google AI Studio.`,
      details: {
        length: trimmed.length,
        expectedLength: 39,
        prefix: trimmed.substring(0, 6),
        hasValidPrefix: trimmed.startsWith("AIza"),
        hasValidFormat: false,
        isPlaceholder: true,
      },
    };
  }

  const isAIza = trimmed.startsWith("AIza");
  const isAQ = trimmed.startsWith("AQ.") || trimmed.startsWith("ya29.");
  const length = trimmed.length;

  // Allow standard AIza keys (39 chars) or valid platform keys (AQ.* / ya29.* or general non-placeholders > 15 chars)
  if (length < 15) {
    return {
      isValid: false,
      sanitizedKey: trimmed,
      error: `API key is too short (${length} chars).`,
      details: {
        length,
        expectedLength: 39,
        prefix: trimmed.substring(0, 4),
        hasValidPrefix: false,
        hasValidFormat: false,
        isPlaceholder: false,
      },
    };
  }

  return {
    isValid: true,
    sanitizedKey: trimmed,
    details: {
      length,
      expectedLength: 39,
      prefix: trimmed.substring(0, 6),
      hasValidPrefix: isAIza || isAQ,
      hasValidFormat: true,
      isPlaceholder: false,
    },
  };
}

/**
 * Masks an API key for safe UI display and logging.
 * Retains the first 6 chars (e.g., 'AIzaSy') and the last 4 chars, masking the middle.
 *
 * @param key The API key string to mask
 * @returns Masked representation of the key
 */
export function maskApiKey(key?: string | null): string {
  if (!key || typeof key !== "string" || key.trim().length === 0) {
    return "••••••••";
  }
  const trimmed = key.trim();
  if (trimmed.length <= 8) {
    return "••••••••";
  }
  return `${trimmed.slice(0, 6)}••••••••••••••••••••••••••••${trimmed.slice(-4)}`;
}
