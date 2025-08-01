import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();

    // Get the file from form data
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No PDF file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type || !file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Convert file to buffer (in memory)
    const fileBuffer = await file.arrayBuffer();

    // Return success response with file info
    return NextResponse.json({
      success: true,
      message: "PDF uploaded successfully",
      file: {
        originalName: file.name,
        size: file.size,
        mimetype: file.type,
        // Note: In a real application, you would process the PDF content here
        // For now, we're just returning the file info
      },
      // In a real application, you would extract text from the PDF here
      // and process it with AI for medical report interpretation
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      {
        error: "Failed to upload PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
