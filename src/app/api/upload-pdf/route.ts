import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const runtime = "nodejs";

// Modelo configurável - altere aqui para trocar o modelo
const AI_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free";

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
      // Importação correta para evitar o erro ENOENT
      const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
      const pdfParse = pdfParseModule.default;
      const data = await pdfParse(fileBuffer);
      extractedText = data.text
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n/g, "\n")
        .trim();
      console.log("PDF parsing completed. Text length:", extractedText.length);
    } catch (pdfError: unknown) {
      console.error("PDF Parse Error:", pdfError);
      const errorMessage =
        pdfError instanceof Error
          ? pdfError.message
          : "Unknown PDF parsing error";
      return NextResponse.json(
        {
          error: "Failed to extract text from PDF",
          details: errorMessage,
        },
        { status: 400 }
      );
    }

    // Chamar Together AI API para processar o texto
    let analyzedData = null;
    try {
      console.log("Preparing to call Together AI API...");
      console.log("API Key exists:", !!process.env.TOGETHER_API_KEY);
      console.log(
        "Extracted text preview:",
        extractedText.substring(0, 200) + "..."
      );
      console.log("Using AI Model:", AI_MODEL);

      const response = await fetch(
        "https://api.together.xyz/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
            "Content-Type": "application/json",
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
    } catch (aiError: unknown) {
      console.error("AI Analysis Error:", aiError);
      const errorMessage =
        aiError instanceof Error ? aiError.message : "Unknown AI error";
      analyzedData = {
        error: "Failed to analyze with AI",
        details: errorMessage,
      };
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
