"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  FileText,
  Heart,
  Shield,
  MessageCircle,
} from "lucide-react";
import { UploadResult } from "@/types";

interface ResultsDisplayProps {
  result: UploadResult;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  const { analyzedData } = result;

  // Only show results if analyzedData is valid and has the expected structure
  if (
    !analyzedData ||
    typeof analyzedData !== "object" ||
    "error" in analyzedData
  ) {
    return null;
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "moderate":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getStatusIcon = (status: string) => {
    return status === "High" ? "↗️" : "↘️";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Your Medical Report Analysis
        </h1>
        <p className="text-gray-600">
          Here&apos;s what we found in your medical report
        </p>
      </div>

      {/* Summary Card */}
      {analyzedData.summary && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <FileText className="h-5 w-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {analyzedData.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Abnormal Findings */}
      {analyzedData.abnormalFindings &&
        analyzedData.abnormalFindings.length > 0 && (
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <AlertTriangle className="h-5 w-5" />
                Findings That Need Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyzedData.abnormalFindings.map((finding, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getUrgencyColor(
                      finding.urgency
                    )}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getStatusIcon(finding.status)}
                        </span>
                        <h4 className="font-semibold">{finding.test}</h4>
                      </div>
                      <span className="font-mono text-sm bg-white px-2 py-1 rounded">
                        {finding.value}
                      </span>
                    </div>
                    <p className="text-sm opacity-90">{finding.explanation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Normal Findings */}
      {analyzedData.normalFindings &&
        analyzedData.normalFindings.length > 0 && (
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle className="h-5 w-5" />
                Normal Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {analyzedData.normalFindings.map((finding, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-800">{finding}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Red Flags */}
      {analyzedData.redFlags && analyzedData.redFlags.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="h-5 w-5" />
              Important Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyzedData.redFlags.map((flag, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200"
                >
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-800 font-medium">{flag}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {analyzedData.nextSteps && analyzedData.nextSteps.length > 0 && (
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <ArrowRight className="h-5 w-5" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyzedData.nextSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-purple-900">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions for Doctor */}
      {analyzedData.questionsForDoctor &&
        analyzedData.questionsForDoctor.length > 0 && (
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <MessageCircle className="h-5 w-5" />
                Questions to Ask Your Doctor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyzedData.questionsForDoctor.map((question, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      ?
                    </div>
                    <p className="text-indigo-900">{question}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Disclaimer */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">
                Important Disclaimer
              </h4>
              <p className="text-amber-800 text-sm">
                This analysis is for informational purposes only and should not
                replace professional medical advice. Always consult with your
                healthcare provider for proper diagnosis and treatment
                recommendations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Button */}
      <div className="flex justify-center pt-4">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
          <Heart className="h-4 w-4 mr-2" />
          Share with Family
        </Button>
      </div>
    </div>
  );
}
