import { sha256 } from "./utils";
import { redis } from "./redis";

export interface ExtractionPattern {
  regex?: string;
  rules?: string[];
  format?: string;
}

export interface MediMemoResult {
  summary: string;
  normalFindings: string[];
  abnormalFindings: Array<{
    test: string;
    value: string;
    status: string;
    explanation: string;
    urgency: "low" | "moderate" | "high";
  }>;
  redFlags: string[];
  nextSteps: string[];
  questionsForDoctor: string[];
}

/**
 * Extract text from PDF buffer using pdf-parse
 */
export async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
    const pdfParse = pdfParseModule.default;

    const data = await pdfParse(Buffer.from(buffer));

    // Clean the extracted text
    let cleanedText = data.text
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width characters
      .trim();

    if (!cleanedText || cleanedText.length < 10) {
      throw new Error("PDF appears to be empty or unreadable");
    }

    return cleanedText;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Find a representative exam block from the text
 */
export function findSampleExamBlock(text: string): string | null {
  // Split text into blocks by form feeds or multiple line breaks
  const blocks = text.split(/\f|\n\s*\n\s*\n/);

  for (const block of blocks) {
    const trimmedBlock = block.trim();
    if (trimmedBlock.length < 50) continue; // Skip very short blocks

    // Check for exam characteristics
    const hasTitle = /^[A-Z\s]{5,}/.test(trimmedBlock); // Uppercase title
    const hasResult = /RESULTADO|RESULT|VALOR|VALUE/i.test(trimmedBlock);
    const hasNumericValue = /\d+[,.]?\d*\s*[a-zA-Z\/%]+/.test(trimmedBlock); // Number with unit
    const hasReference = /REFERÊNCIA|REFERENCE|NORMAL|VALORES/i.test(
      trimmedBlock
    );

    if (hasTitle && (hasResult || hasNumericValue) && hasReference) {
      return trimmedBlock;
    }
  }

  return null;
}

/**
 * Generate extraction pattern using Ollama
 */
export async function generateExtractionPattern(
  sampleBlock: string
): Promise<ExtractionPattern> {
  const cacheKey = `pattern:${sha256(sampleBlock)}`;

  // Check cache first
  try {
    const cached = await redis.get(cacheKey);
    if (cached && typeof cached === "string") {
      console.log("Using cached extraction pattern");
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error("Cache check error:", error);
  }

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen2.5:72b",
        prompt: `Analyze this medical exam block and return a JSON object with a regex pattern or rules to extract exam names and values from similar blocks.

Focus ONLY on extracting "EXAME: valor" format. Ignore headers, footers, patient data, dates, codes, and other metadata.

Exam block to analyze:
${sampleBlock}

Return ONLY a JSON object with one of these structures:
{
  "regex": "pattern to match exam names and values",
  "rules": ["rule1", "rule2"],
  "format": "output format specification"
}

Be specific and precise. The regex should capture exam names and their corresponding values.`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const result = await response.json();
    const jsonString = result.response.trim();

    // Clean JSON string
    let cleanJson = jsonString;
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, "$1");
    }

    const pattern = JSON.parse(cleanJson);

    // Cache the pattern
    try {
      await redis.set(cacheKey, JSON.stringify(pattern), { ex: 3600 }); // 1 hour cache
    } catch (error) {
      console.error("Failed to cache pattern:", error);
    }

    return pattern;
  } catch (error) {
    console.error("Pattern generation error:", error);
    // Fallback to basic pattern
    return {
      regex: "([A-Z\\s]{3,}):\\s*([\\d,.]+\\s*[a-zA-Z\\/%]+)",
    };
  }
}

/**
 * Apply extraction pattern to full text
 */
export function applyExtractionPattern(
  fullText: string,
  pattern: ExtractionPattern
): string {
  if (pattern.regex) {
    try {
      const regex = new RegExp(pattern.regex, "gi");
      const matches = [...fullText.matchAll(regex)];

      return matches
        .map((match) => {
          const examName = match[1]?.trim() || match[0];
          const value = match[2]?.trim() || "";
          return `${examName}: ${value}`;
        })
        .filter((line) => line.length > 5)
        .join("\n");
    } catch (error) {
      console.error("Regex application error:", error);
    }
  }

  // Fallback to basic keyword filtering
  const lines = fullText.split("\n");
  const relevantLines = lines.filter((line) => {
    const trimmed = line.trim();
    return (
      trimmed.length > 10 &&
      /[A-Z]/.test(trimmed) &&
      /\d/.test(trimmed) &&
      !/PÁGINA|PAGE|DATA|DATE|PACIENTE|PATIENT/i.test(trimmed)
    );
  });

  return relevantLines.join("\n");
}

/**
 * Analyze cleaned text with LLM
 */
export async function analyzeWithLLM(
  cleanedText: string
): Promise<MediMemoResult> {
  const response = await fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      messages: [
        {
          role: "system",
          content: `You are a medical interpreter. Analyze the provided exam results and return a JSON object with medical interpretation. Be compassionate and clear. Use "we" and "let's" to be supportive.`,
        },
        {
          role: "user",
          content: `Analyze this medical data and return ONLY a JSON object with the exact structure specified:

{
  "summary": "One clear paragraph summarizing the overall health status in plain language.",
  "normalFindings": ["Test name and value – This is within normal range and means..."],
  "abnormalFindings": [
    {
      "test": "Glucose",
      "value": "110 mg/dL",
      "status": "High",
      "explanation": "This is above the normal range of 70–99. Elevated fasting glucose may indicate prediabetes.",
      "urgency": "low"
    }
  ],
  "redFlags": ["Any result that requires immediate medical attention."],
  "nextSteps": ["Call your doctor within 24 hours.", "Repeat test in 2 weeks."],
  "questionsForDoctor": ["Could my medication be affecting my results?", "Should I schedule a follow-up?"]
}

Medical data to analyze:
${cleanedText}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status}`);
  }

  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}
