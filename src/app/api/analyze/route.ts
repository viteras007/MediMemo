import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "../../../lib/redis";
import { sha256 } from "../../../lib/utils";
import {
  extractTextFromPDF,
  findSampleExamBlock,
  generateExtractionPattern,
  applyExtractionPattern,
  analyzeWithLLM,
  type MediMemoResult,
} from "../../../lib/pdf-processor";

export const runtime = "nodejs";

// Rate limiter: 10 requests per 10 seconds per user
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    console.log("=== Two-Stage LLM Pipeline Started ===");
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

    const maxSize = 50 * 1024 * 1024; // 50MB for large medical reports
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();

    if (fileBuffer.byteLength === 0) {
      return NextResponse.json({ error: "Empty file buffer" }, { status: 400 });
    }

    // Stage 1: Extract text from PDF
    console.log("Stage 1: Extracting text from PDF...");
    let extractedText: string;
    try {
      extractedText = await extractTextFromPDF(fileBuffer);
      console.log("Text extraction completed. Length:", extractedText.length);
    } catch (error) {
      console.error("Text extraction failed:", error);
      return NextResponse.json(
        {
          error:
            "Unable to read this PDF. Please try a different file or ensure it's not password-protected.",
          details: "PDF parsing failed",
        },
        { status: 400 }
      );
    }

    // Generate cache key for final result
    const contentHash = sha256(extractedText);
    const resultCacheKey = `pdf:${contentHash}`;
    const patternCacheKey = `pattern:${contentHash}`;

    // Check cache for final result
    let analyzedData: MediMemoResult | null = null;
    let cacheHit = false;

    try {
      const cachedResult = await redis.get(resultCacheKey);
      if (cachedResult && typeof cachedResult === "string") {
        console.log("Cache hit - returning cached result");
        analyzedData = JSON.parse(cachedResult);
        cacheHit = true;
      } else {
        console.log("Cache miss - processing with two-stage pipeline");
      }
    } catch (cacheError) {
      console.error("Cache check error:", cacheError);
    }

    // Only process if no cached result
    if (!cacheHit) {
      try {
        // Stage 2: Find sample exam block
        console.log("Stage 2: Finding sample exam block...");
        const sampleBlock = findSampleExamBlock(extractedText);

        if (!sampleBlock) {
          console.log("No sample block found, using fallback processing");
          // Fallback: use basic filtering
          const lines = extractedText.split("\n");
          const relevantLines = lines.filter((line) => {
            const trimmed = line.trim();
            return (
              trimmed.length > 10 &&
              /[A-Z]/.test(trimmed) &&
              /\d/.test(trimmed) &&
              !/PÁGINA|PAGE|DATA|DATE|PACIENTE|PATIENT/i.test(trimmed)
            );
          });
          const cleanedText = relevantLines.join("\n");

          console.log(
            "Fallback processing completed. Cleaned text length:",
            cleanedText.length
          );

          // Stage 5: Analyze with LLM
          console.log("Stage 5: Analyzing with LLM...");
          analyzedData = await analyzeWithLLM(cleanedText);
        } else {
          console.log("Sample block found. Length:", sampleBlock.length);

          // Stage 3: Generate extraction pattern
          console.log("Stage 3: Generating extraction pattern...");
          const pattern = await generateExtractionPattern(sampleBlock);
          console.log("Pattern generated:", pattern.regex ? "regex" : "rules");

          // Stage 4: Apply extraction pattern
          console.log("Stage 4: Applying extraction pattern...");
          const cleanedText = applyExtractionPattern(extractedText, pattern);
          console.log(
            "Pattern applied. Cleaned text length:",
            cleanedText.length
          );

          // Stage 5: Analyze with LLM
          console.log("Stage 5: Analyzing with LLM...");
          analyzedData = await analyzeWithLLM(cleanedText);
        }

        console.log("Two-stage pipeline completed successfully");

        // Cache the successful result
        if (analyzedData) {
          try {
            await redis.set(resultCacheKey, JSON.stringify(analyzedData), {
              ex: 3600,
            }); // 1 hour cache
            console.log("Result cached successfully");
          } catch (cacheError) {
            console.error("Failed to cache result:", cacheError);
          }
        }
      } catch (aiError: unknown) {
        console.error("Two-stage pipeline error:", aiError);
        const errorMessage =
          aiError instanceof Error ? aiError.message : "Unknown AI error";
        analyzedData = {
          summary:
            "We couldn't process this report completely. Please consult your doctor for interpretation.",
          normalFindings: [],
          abnormalFindings: [],
          redFlags: [],
          nextSteps: [
            "Consult your healthcare provider for proper interpretation of this medical report.",
          ],
          questionsForDoctor: [
            "Could you explain the key findings in this report?",
          ],
        };
      }
    }

    console.log("=== Two-Stage Pipeline Completed Successfully ===");

    // Return the structure expected by frontend
    return NextResponse.json({
      success: true,
      message: "PDF processed with two-stage LLM pipeline",
      file: {
        originalName: file.name,
        size: file.size,
        mimetype: file.type,
      },
      extractedText: extractedText,
      textLength: extractedText.length,
      analyzedData: analyzedData,
      pipeline: {
        stage1: "Text extraction completed",
        stage2: "Sample block identification completed",
        stage3: "Pattern generation completed",
        stage4: "Pattern application completed",
        stage5: "LLM analysis completed",
        cacheHit: cacheHit,
      },
    });
  } catch (error: unknown) {
    console.error("Two-stage pipeline error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to process PDF with two-stage pipeline",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
