export interface AbnormalFinding {
  test: string;
  value: string;
  status: "High" | "Low";
  explanation: string;
  urgency: "low" | "moderate" | "high";
}

export interface AnalyzedData {
  summary: string;
  normalFindings: string[];
  abnormalFindings: AbnormalFinding[];
  redFlags: string[];
  nextSteps: string[];
  questionsForDoctor: string[];
}

export interface AnalyzedDataError {
  error: string;
  details?: string;
}

export interface PipelineInfo {
  stage1: string;
  stage2: string;
  stage3: string;
  stage4: string;
  stage5: string;
  cacheHit: boolean;
}

export interface UploadResult {
  success: boolean;
  message: string;
  file: {
    originalName: string;
    size: number;
    mimetype: string;
  };
  extractedText: string;
  textLength: number;
  analyzedData: AnalyzedData | AnalyzedDataError;
  pipeline?: PipelineInfo;
}
