/**
 * Formats and extracts clean, human-readable messages from Gemini API errors,
 * including nested JSON ApiError responses, 503 high demand, 429 rate limits, and authentication errors.
 */
export function formatGeminiErrorMessage(rawError: any): {
  message: string;
  statusCode?: number;
  isRetryable: boolean;
  suggestedAction?: string;
} {
  if (!rawError) {
    return {
      message: "An unknown error occurred.",
      isRetryable: true,
    };
  }

  let errText =
    typeof rawError === "string"
      ? rawError
      : rawError.message || JSON.stringify(rawError);

  // Parse nested JSON strings if present in message (e.g. ApiError: {"error": {"message": "..."}})
  try {
    const jsonMatch = errText.match(/{[\s\S]*}/);
    if (jsonMatch) {
      let parsed = JSON.parse(jsonMatch[0]);
      while (parsed && typeof parsed === "object") {
        if (parsed.error && typeof parsed.error === "object") {
          parsed = parsed.error;
        } else if (typeof parsed.error === "string") {
          try {
            parsed = JSON.parse(parsed.error);
          } catch {
            errText = parsed.error;
            break;
          }
        } else if (parsed.message) {
          errText = parsed.message;
          // In case message itself is a stringified JSON
          try {
            const inner = JSON.parse(parsed.message);
            if (inner?.error?.message) {
              errText = inner.error.message;
            } else if (inner?.message) {
              errText = inner.message;
            }
          } catch {
            // Keep current errText
          }
          break;
        } else {
          break;
        }
      }
    }
  } catch {
    // If parsing fails, proceed with regex matching
  }

  // 503 Model Unavailable / High demand
  if (
    errText.includes("503") ||
    errText.toLowerCase().includes("high demand") ||
    errText.toLowerCase().includes("unavailable") ||
    errText.toLowerCase().includes("overloaded")
  ) {
    return {
      statusCode: 503,
      message:
        "The selected model is currently experiencing temporary high demand upstream at Google. Please retry in a few moments or switch to an alternate model (such as gemini-2.5-flash or gemini-3.1-flash-lite).",
      isRetryable: true,
      suggestedAction: "Retry request or switch model",
    };
  }

  // 429 Rate limit / Quota exceeded
  if (
    errText.includes("429") ||
    errText.toLowerCase().includes("rate limit") ||
    errText.toLowerCase().includes("quota")
  ) {
    return {
      statusCode: 429,
      message:
        "API rate limit or quota exceeded. Please wait a brief moment before retrying.",
      isRetryable: true,
      suggestedAction: "Wait 10-20 seconds and retry",
    };
  }

  // 401 / 403 Invalid API key
  if (
    errText.includes("401") ||
    errText.includes("403") ||
    errText.toLowerCase().includes("api_key_invalid") ||
    errText.toLowerCase().includes("api key not valid")
  ) {
    return {
      statusCode: 401,
      message:
        "Invalid or unauthorized GEMINI_API_KEY. Please verify your API key in Google AI Studio settings.",
      isRetryable: false,
      suggestedAction: "Check GEMINI_API_KEY",
    };
  }

  return {
    message: errText.replace(/^ApiError:\s*/i, "").trim(),
    isRetryable: true,
  };
}
