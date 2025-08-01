"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { Search, FileText, Upload, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    file: { originalName: string; size: number; mimetype: string };
    extractedText: string;
    textLength: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a valid PDF file");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCardClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div className="max-w-4xl mx-auto w-full">
        <div className="max-w-md mx-auto space-y-6">
          {/* Upload Instructions */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              Upload your medical report
            </h1>
            <p className="text-gray-600">
              Get a clear, easy-to-understand explanation of your medical
              results
            </p>
          </div>

          {/* Upload Area */}
          <Card
            className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
            onClick={handleCardClick}
          >
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                {/* Medical document icon */}
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Upload PDF</h3>
                  <p className="text-sm text-gray-500">
                    Medical report or lab results
                  </p>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* File info */}
                {file && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                    <span className="text-gray-400">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="flex items-center justify-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generate button */}
          <div className="flex justify-center">
            <Button
              className="cursor-pointer relative group flex items-center bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 h-auto text-base overflow-hidden"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              <div className="h-[120px] w-10 bg-gradient-to-r from-white/10 via-white/50 to-white/10 absolute blur-sm -rotate-45 -left-16 group-hover:left-[150%] duration-500 delay-200" />
              {uploading ? (
                <>
                  <Upload className="h-5 w-5 mr-2 relative animate-spin" />
                  <span className="relative">Uploading...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2 relative" />
                  <span className="relative">Analyze Report</span>
                </>
              )}
              <BorderBeam colorFrom="#5d5d5d" colorTo="#ffffff" />
            </Button>
          </div>

          {/* Success message */}
          {result && (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                Upload Successful!
              </h4>
              <div className="text-sm text-green-700">
                <p>
                  <strong>File:</strong> {result.file.originalName}
                </p>
                <p>
                  <strong>Size:</strong>{" "}
                  {(result.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p>
                  <strong>Text extracted:</strong> {result.textLength}{" "}
                  characters
                </p>
              </div>
              {/* Show a preview of the extracted text */}
              <div className="mt-4 text-left">
                <h5 className="font-medium text-green-800 mb-2">
                  Text Preview:
                </h5>
                <div className="bg-white p-3 rounded border text-xs text-gray-700 max-h-32 overflow-y-auto">
                  {result.extractedText.length > 500
                    ? `${result.extractedText.substring(0, 500)}...`
                    : result.extractedText}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
