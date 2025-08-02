import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "../../../lib/redis";
import { createAIProvider } from "../../../lib/ai-providers";
import {
  createCacheManager,
  generateCacheKey,
} from "../../../lib/cache-manager";

export const runtime = "nodejs";

// Rate limiter: 5 requests per 10 seconds per user
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true,
});

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    console.log("=== PDF Upload Started ===");
    console.log("User ID:", userId);

    // Rate limiting check
    const { success, reset, remaining } = await ratelimit.limit(userId);

    if (!success) {
      console.log("Rate limited user:", userId);
      return NextResponse.json(
        {
          error:
            "Too many requests. Please wait a moment before uploading another file.",
          retryAfter: reset,
        },
        { status: 429 }
      );
    }

    console.log("Rate limit check passed. Remaining:", remaining);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file uploaded" },
        { status: 400 }
      );
    }

    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    if (fileBuffer.length === 0) {
      return NextResponse.json({ error: "Empty file buffer" }, { status: 400 });
    }

    let extractedText = "";

    try {
      console.log("Starting PDF parsing...");
      const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
      const pdfParse = pdfParseModule.default;

      // Primeira tentativa: parsing normal
      let data;
      try {
        data = await pdfParse(fileBuffer);
      } catch {
        // Segunda tentativa: com buffer limpo
        console.log("First attempt failed, trying with cleaned buffer...");
        const cleanedBuffer = Buffer.from(fileBuffer);
        data = await pdfParse(cleanedBuffer);
      }

      extractedText = data.text
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n/g, "\n")
        .trim();

      if (!extractedText || extractedText.length < 10) {
        throw new Error("PDF appears to be empty or unreadable");
      }

      console.log("PDF parsing completed. Text length:", extractedText.length);
    } catch (pdfError: unknown) {
      console.error("PDF Parse Error:", pdfError);
      return NextResponse.json(
        {
          error:
            "Unable to read this PDF. Please try a different file or ensure it's not password-protected.",
          details: "PDF parsing failed",
        },
        { status: 400 }
      );
    }

    // Initialize AI provider and cache manager
    const aiProvider = createAIProvider();
    const cacheManager = createCacheManager();

    console.log("Using AI Provider:", aiProvider.name);
    console.log("Cache enabled:", cacheManager.isEnabled());

    // Generate cache key and check cache
    const cacheKey = generateCacheKey(extractedText);
    let analyzedData = null;
    let cacheHit = false;

    if (cacheManager.isEnabled()) {
      try {
        const cachedResult = await cacheManager.get(cacheKey);
        if (cachedResult) {
          console.log("Cache hit - returning cached result");
          analyzedData = cachedResult;
          cacheHit = true;
        } else {
          console.log("Cache miss - processing with AI");
        }
      } catch (cacheError) {
        console.error("Cache check error:", cacheError);
      }
    }

    // Only call AI if we don't have cached result
    if (!cacheHit) {
      try {
        // Content safety check
        console.log("Checking content safety...");
        const safetyCheck = await aiProvider.isContentSafe(extractedText);

        if (!safetyCheck.safe) {
          console.log("Content blocked:", safetyCheck.reason);
          return NextResponse.json(
            {
              error: "Content not allowed",
              reason:
                safetyCheck.reason || "Content flagged as potentially harmful",
            },
            { status: 400 }
          );
        }

        console.log("Safety check passed - proceeding with medical analysis");
        console.log(
          "Extracted text preview:",
          extractedText.substring(0, 200) + "..."
        );

        // Analyze with AI
        analyzedData = await aiProvider.analyzeText(extractedText, userId);
        console.log("AI analysis completed successfully");

        // Cache the successful result
        if (analyzedData && !analyzedData.error && cacheManager.isEnabled()) {
          try {
            await cacheManager.set(cacheKey, analyzedData);
            console.log("Result cached successfully");
          } catch (cacheError) {
            console.error("Failed to cache result:", cacheError);
          }
        }
      } catch (aiError: unknown) {
        console.error("AI Analysis Error:", aiError);
        const errorMessage =
          aiError instanceof Error ? aiError.message : "Unknown AI error";
        analyzedData = {
          error: "Failed to analyze with AI",
          details: errorMessage,
        };
      }
    }

    console.log("=== Process Completed Successfully ===");

    // Retornar a estrutura esperada pelo frontend
    return NextResponse.json({
      success: true,
      message: "PDF uploaded and analyzed successfully",
      file: {
        originalName: file.name,
        size: file.size,
        mimetype: file.type,
      },
      extractedText: extractedText,
      textLength: extractedText.length,
      analyzedData: analyzedData,
    });
  } catch (error: unknown) {
    console.error("Upload Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to upload PDF",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
