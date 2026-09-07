import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

import { validateGeminiApiKey } from "./src/utils/apiKeyValidator.ts";
import { formatGeminiErrorMessage } from "./src/utils/errorHandler.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Helper to execute with automatic retry on transient upstream errors (503/429)
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  initialDelayMs = 1000
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const formatted = formatGeminiErrorMessage(err);
      if (!formatted.isRetryable || attempt === maxRetries) {
        throw err;
      }
      const delay = initialDelayMs * Math.pow(2, attempt);
      console.warn(`[Gemini Retry] Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

// Lazy/Safe initialization for Google GenAI with structural validation
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  const validation = validateGeminiApiKey(apiKey);
  if (!validation.isValid) {
    throw new Error(validation.error || "GEMINI_API_KEY is invalid or missing.");
  }
  return new GoogleGenAI({
    apiKey: validation.sanitizedKey || apiKey!,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint with key verification
app.get("/api/health", (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  const validation = validateGeminiApiKey(key);
  res.json({
    status: "ok",
    hasApiKey: !!key,
    keyValid: validation.isValid,
    keyDetails: validation.details,
  });
});

// Non-streaming generate content
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const {
      prompt,
      model = "gemini-3.7-flash",
      systemInstruction,
      temperature,
      topP,
      thinkingLevel,
      responseMimeType,
      responseSchema,
      imageBase64,
      imageMimeType = "image/png",
    } = req.body;

    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: "Prompt or image is required." });
    }

    const ai = getGenAI();

    let input: any;
    if (imageBase64) {
      input = [
        {
          type: "image",
          data: imageBase64.replace(/^data:[^;]+;base64,/, ""),
          mime_type: imageMimeType,
        },
      ];
      if (prompt) {
        input.push({ type: "text", text: prompt });
      }
    } else {
      input = prompt;
    }

    const args: any = {
      model: model || "gemini-3.7-flash",
      input,
    };

    if (systemInstruction) args.system_instruction = systemInstruction;

    const genConfig: any = {};
    if (typeof temperature === "number") genConfig.temperature = temperature;
    if (typeof topP === "number") genConfig.top_p = topP;
    if (responseMimeType) genConfig.response_mime_type = responseMimeType;

    if (thinkingLevel && thinkingLevel !== "DEFAULT") {
      if (thinkingLevel === "LOW") {
        genConfig.thinking_level = "low";
      } else if (thinkingLevel === "HIGH") {
        genConfig.thinking_level = "high";
      } else if (thinkingLevel === "MINIMAL") {
        genConfig.thinking_level = "minimal";
      }
    }

    if (Object.keys(genConfig).length > 0) {
      args.generation_config = genConfig;
    }
    
    if (responseSchema) {
      args.response_format = responseSchema;
    }

    const startTime = Date.now();
    const interaction = await callWithRetry(() =>
      ai.interactions.create(args)
    );
    const durationMs = Date.now() - startTime;

    // Safely extract text from interaction steps for robustness
    let text = "";
    for (const step of interaction.steps || []) {
      if (step.type === 'model_output') {
        const textContent = step.content?.find((c: any) => c.type === 'text') as any;
        if (textContent && textContent.text) {
          text += textContent.text;
        }
      }
    }
    if (!text && interaction.output_text) {
      text = interaction.output_text;
    }

    res.json({
      text,
      usageMetadata: undefined,
      durationMs,
      model: model || "gemini-3.7-flash",
    });
  } catch (error: any) {
    console.error("Gemini Generate Error:", error);
    const formatted = formatGeminiErrorMessage(error);
    res.status(formatted.statusCode || 500).json({
      error: formatted.message,
      isRetryable: formatted.isRetryable,
      suggestedAction: formatted.suggestedAction,
    });
  }
});

// Streaming generate content (SSE)
app.post("/api/gemini/stream", async (req, res) => {
  try {
    const {
      prompt,
      model = "gemini-3.7-flash",
      systemInstruction,
      temperature,
      topP,
      thinkingLevel,
      responseMimeType,
      imageBase64,
      imageMimeType = "image/png",
    } = req.body;

    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: "Prompt or image is required." });
    }

    const ai = getGenAI();

    let input: any;
    if (imageBase64) {
      input = [
        {
          type: "image",
          data: imageBase64.replace(/^data:[^;]+;base64,/, ""),
          mime_type: imageMimeType,
        },
      ];
      if (prompt) {
        input.push({ type: "text", text: prompt });
      }
    } else {
      input = prompt;
    }

    const args: any = {
      model: model || "gemini-3.7-flash",
      input,
      stream: true,
    };

    if (systemInstruction) args.system_instruction = systemInstruction;

    const genConfig: any = {};
    if (typeof temperature === "number") genConfig.temperature = temperature;
    if (typeof topP === "number") genConfig.top_p = topP;
    if (responseMimeType) genConfig.response_mime_type = responseMimeType;

    if (thinkingLevel && thinkingLevel !== "DEFAULT") {
      if (thinkingLevel === "LOW") {
        genConfig.thinking_level = "low";
      } else if (thinkingLevel === "HIGH") {
        genConfig.thinking_level = "high";
      } else if (thinkingLevel === "MINIMAL") {
        genConfig.thinking_level = "minimal";
      }
    }

    if (Object.keys(genConfig).length > 0) {
      args.generation_config = genConfig;
    }

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = (await ai.interactions.create(args)) as any;

    for await (const event of stream) {
      if (event.event_type === "step.delta" && event.delta?.type === "text") {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error("Gemini Stream Error:", error);
    const formatted = formatGeminiErrorMessage(error);
    if (!res.headersSent) {
      res.status(formatted.statusCode || 500).json({
        error: formatted.message,
        isRetryable: formatted.isRetryable,
        suggestedAction: formatted.suggestedAction,
      });
    } else {
      res.write(
        `data: ${JSON.stringify({
          error: formatted.message,
          isRetryable: formatted.isRetryable,
        })}\n\n`
      );
      res.end();
    }
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
