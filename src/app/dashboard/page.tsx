"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { Search, FileText, Upload, AlertCircle } from "lucide-react";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { UploadResult } from "@/types";
import { toast } from "sonner";

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
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
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);

      toast.error("Failed to analyze PDF", {
        description:
          "We encountered an error while processing your medical report. Please try again or contact support if the problem persists.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCardClick = () => {
    fileInputRef.current?.click();
  };

  if (
    result &&
    result.analyzedData &&
    typeof result.analyzedData === "object" &&
    !("error" in result.analyzedData)
  ) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <ResultsDisplay result={result} />
      </div>
    );
  }

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
            className={`border-2 border-dashed transition-colors ${
              uploading
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 hover:border-gray-400 cursor-pointer"
            }`}
            onClick={uploading ? undefined : handleCardClick}
          >
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                {/* Medical document icon */}
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {uploading ? (
                    <Upload className="h-6 w-6 text-gray-600 animate-spin" />
                  ) : (
                    <FileText className="h-6 w-6 text-gray-600" />
                  )}
                </div>

                <div className="space-y-2">
                  {uploading ? (
                    <>
                      <h3 className="font-semibold text-gray-900">
                        Analyzing...
                      </h3>
                      <p className="text-sm text-gray-500">
                        Please wait while we process your report
                      </p>
                    </>
                  ) : file ? (
                    <>
                      <h3 className="font-semibold text-gray-900">
                        {file.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        (
                        {file.size < 1024 * 1024
                          ? `${(file.size / 1024).toFixed(1)} KB`
                          : `${(file.size / 1024 / 1024).toFixed(1)} MB`}
                        )
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold text-gray-900">
                        Upload PDF
                      </h3>
                      <p className="text-sm text-gray-500">
                        Medical report or lab results
                      </p>
                    </>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

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
                  <span className="relative">Analyzing...</span>
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
        </div>
      </div>
    </div>
  );
}
