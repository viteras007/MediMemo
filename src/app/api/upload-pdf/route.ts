import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
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
      // Importação correta para evitar o erro ENOENT
      const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
      const pdfParse = pdfParseModule.default;
      const data = await pdfParse(fileBuffer);
      extractedText = data.text
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n/g, "\n")
        .trim();
    } catch (pdfError: any) {
      console.error("PDF Parse Error:", pdfError);
      return NextResponse.json(
        {
          error: "Failed to extract text from PDF",
          details: pdfError.message || "Unknown PDF parsing error",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "PDF uploaded and text extracted successfully",
      file: {
        originalName: file.name,
        size: file.size,
        mimetype: file.type,
      },
      extractedText: extractedText,
      textLength: extractedText.length,
    });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload PDF",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
