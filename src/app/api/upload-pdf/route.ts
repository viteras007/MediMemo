import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { redis, CACHE_TTL, CACHE_KEY_PREFIX } from "../../../lib/redis";
import { sha256 } from "../../../lib/utils";
import { Ratelimit } from "@upstash/ratelimit";

export const runtime = "nodejs";

// Modelo configurável - altere aqui para trocar o modelo
const AI_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free";

// Rate limiter: 5 requests per 10 seconds per user
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true,
});

// Função para verificar se o conteúdo é seguro usando Llama Guard
async function isContentSafe(
  text: string
): Promise<{ safe: boolean; reason?: string }> {
  try {
    // Truncar texto para 3000 caracteres para evitar tokens excessivos
    const truncatedText = text.substring(0, 3000);

    console.log("Llama Guard call sent via Helicone");
    console.log("Helicone API Key for Guard:", !!process.env.HELICONE_API_KEY);

    const response = await fetch(
      "https://api.together.xyz/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
          "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
          "Helicone-Property-Model": "llama-guard",
          "Helicone-Cache": "false",
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-Guard-3-8B",
          messages: [
            {
              role: "system",
              content:
                "You are Llama Guard, a safety classifier. Analyze the following text and determine if it contains harmful content. Respond with 'SAFE' or 'UNSAFE' followed by a brief reason if unsafe.",
            },
            {
              role: "user",
              content: `Analyze this medical report text for safety: ${truncatedText}`,
            },
          ],
          temperature: 0.1,
          max_tokens: 100,
        }),
      }
    );

    if (!response.ok) {
      console.error("Llama Guard API error:", response.status);
      // Fail permissively - allow content if Llama Guard fails
      return { safe: true };
    }

    const result = await response.json();
    const content = result.choices[0].message.content.trim().toUpperCase();

    if (content.startsWith("SAFE")) {
      console.log("Llama Guard passed");
      return { safe: true };
    } else if (content.startsWith("UNSAFE")) {
      const reason = content.replace("UNSAFE", "").trim();
      console.log("Llama Guard blocked content:", reason);
      return { safe: false, reason };
    } else {
      // Unexpected response, fail permissively
      console.log("Llama Guard unexpected response:", content);
      return { safe: true };
    }
  } catch (error) {
    console.error("Llama Guard error:", error);
    // Fail permissively - allow content if Llama Guard fails
    return { safe: true };
  }
}

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

    // Generate cache key from PDF content hash
    const contentHash = sha256(extractedText);
    const cacheKey = `${CACHE_KEY_PREFIX}${contentHash}`;

    console.log("Cache key generated:", cacheKey.substring(0, 20) + "...");

    // Check cache for existing result
    let analyzedData = null;
    let cacheHit = false;

    try {
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        console.log("Cache hit - returning cached result");
        analyzedData = cachedResult;
        cacheHit = true;
      } else {
        console.log("Cache miss - processing with AI");
      }
    } catch (cacheError) {
      console.error("Cache check error:", cacheError);
      // Continue with AI processing if cache fails
    }

    // Only call AI if we don't have cached result
    if (!cacheHit) {
      try {
        // Content safety check with Llama Guard
        console.log("Checking content safety with Llama Guard...");
        const safetyCheck = await isContentSafe(extractedText);

        if (!safetyCheck.safe) {
          console.log("Content blocked by Llama Guard:", safetyCheck.reason);
          return NextResponse.json(
            {
              error: "Content not allowed",
              reason:
                safetyCheck.reason || "Content flagged as potentially harmful",
            },
            { status: 400 }
          );
        }

        console.log("Llama Guard passed - proceeding with medical analysis");
        console.log("Preparing to call Together AI API...");
        console.log("API Key exists:", !!process.env.TOGETHER_API_KEY);
        console.log(
          "Extracted text preview:",
          extractedText.substring(0, 200) + "..."
        );
        console.log("Using AI Model:", AI_MODEL);

        console.log("LLM call sent via Helicone");
        console.log("Helicone API Key exists:", !!process.env.HELICONE_API_KEY);
        console.log("User ID for tracking:", userId);
        console.log("Cache status:", cacheHit ? "hit" : "miss");

        const response = await fetch(
          "https://api.together.xyz/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
              "Content-Type": "application/json",
              "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
              "Helicone-Property-User-Id": userId,
              "Helicone-Cache": cacheHit ? "true" : "false",
            },
            body: JSON.stringify({
              model: AI_MODEL, // Usando a variável configurável
              messages: [
                {
                  role: "system",
                  content: `You are a highly experienced and cautious medical doctor. Your task is to interpret a patient's medical report and present the information in clear, compassionate, and accurate language.

### Rules:
- NEVER invent, assume, or guess values. Only use data explicitly present in the document.
- If a value or section is missing, omit it. Do not fabricate.
- Use only the patient's data. No generic advice.
- Explain abnormalities in simple terms, using analogies only if they improve clarity.
- Be kind, but precise. Avoid alarming language. Use "we" and "let's" to be supportive.
- Flag urgent issues clearly, but calmly.
- Respond ONLY with the JSON object. Do not include any other text, explanations, or formatting.`,
                },
                {
                  role: "user",
                  content:
                    `Analyze the following medical report and return ONLY a valid JSON object with the exact structure specified below. DO NOT include any explanations, thoughts, or additional text. Return only the JSON.

### Required JSON Structure:
{
  "summary": "One clear paragraph summarizing the overall health status in plain language.",
  "normalFindings": ["Test name and value – This is within normal range and means..."],
  "abnormalFindings": [
    {
      "test": "Glucose",
      "value": "110 mg/dL",
      "status": "High",
      "explanation": "This is above the normal range of 70–99. Elevated fasting glucose may indicate prediabetes.",
      "urgency": "low" // or "moderate", "high"
    }
  ],
  "redFlags": [
    "Any result that requires immediate medical attention (e.g., very high WBC, critical potassium)."
  ],
  "nextSteps": [
    "Call your doctor within 24 hours.",
    "Repeat liver function test in 2 weeks.",
    "Avoid strenuous activity until cleared."
  ],
  "questionsForDoctor": [
    "Could my medication be affecting my liver enzymes?",
    "Should I schedule a follow-up for my cholesterol?"
  ]
}

### Medical Report:
${extractedText}
              `.trim(),
                },
              ],
              temperature: 0.7,
              max_tokens: 2000,
            }),
          }
        );

        console.log("Together AI API Response Status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Together AI API Error Response:", errorText);
          throw new Error(
            `Together AI API error: ${response.status} - ${errorText}`
          );
        }

        const aiResponse = await response.json();
        console.log("Together AI API Success Response received");

        const jsonString = aiResponse.choices[0].message.content.trim();
        console.log(
          "AI Response content preview:",
          jsonString.substring(0, 200) + "..."
        );

        // Limpar a string JSON removendo crases, tags e outros caracteres indesejados
        let cleanJsonString = jsonString;

        // Remover crases markdown que envolvem o JSON
        if (cleanJsonString.startsWith("```")) {
          cleanJsonString = cleanJsonString.replace(
            /^```(?:json)?\s*([\s\S]*?)\s*```$/,
            "$1"
          );
        }

        // Remover possíveis tags de pensamento
        if (
          cleanJsonString.startsWith("<think>") ||
          cleanJsonString.includes("<think>")
        ) {
          // Tentar extrair apenas o JSON
          const jsonMatch = cleanJsonString.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            cleanJsonString = jsonMatch[0];
          }
        }

        // Trim final para garantir que não há espaços extras
        cleanJsonString = cleanJsonString.trim();

        // Tentar parsear o JSON retornado
        try {
          analyzedData = JSON.parse(cleanJsonString);
          console.log("JSON parsed successfully");
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          console.error("Problematic JSON string:", cleanJsonString);
          analyzedData = {
            error: "Failed to parse AI response as JSON",
            rawResponse: cleanJsonString,
          };
        }

        // Cache the successful result
        if (analyzedData && !analyzedData.error) {
          try {
            await redis.set(cacheKey, analyzedData, { ex: CACHE_TTL });
            console.log("Result cached successfully for 7 days");
          } catch (cacheError) {
            console.error("Failed to cache result:", cacheError);
            // Don't fail the request if caching fails
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
    } // Close the if (!cacheHit) block

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
