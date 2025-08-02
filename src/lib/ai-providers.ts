export interface AIProvider {
  name: string;
  analyzeText(text: string, userId: string): Promise<any>;
  isContentSafe(text: string): Promise<{ safe: boolean; reason?: string }>;
}

export interface AnalysisResult {
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

export class TogetherAIProvider implements AIProvider {
  name = "together-ai";

  async isContentSafe(text: string): Promise<{ safe: boolean; reason?: string }> {
    try {
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
        console.log("Llama Guard unexpected response:", content);
        return { safe: true };
      }
    } catch (error) {
      console.error("Llama Guard error:", error);
      return { safe: true };
    }
  }

  async analyzeText(text: string, userId: string): Promise<AnalysisResult> {
    const AI_MODEL = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free";

    console.log("LLM call sent via Helicone");
    console.log("Helicone API Key exists:", !!process.env.HELICONE_API_KEY);
    console.log("User ID for tracking:", userId);

    const response = await fetch(
      "https://api.together.xyz/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
          "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
          "Helicone-Property-User-Id": userId,
          "Helicone-Cache": "false",
        },
        body: JSON.stringify({
          model: AI_MODEL,
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
${text}
              `.trim(),
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Together AI API Error Response:", errorText);
      throw new Error(
        `Together AI API error: ${response.status} - ${errorText}`
      );
    }

    const aiResponse = await response.json();
    const jsonString = aiResponse.choices[0].message.content.trim();

    // Limpar a string JSON
    let cleanJsonString = jsonString;

    if (cleanJsonString.startsWith("```")) {
      cleanJsonString = cleanJsonString.replace(
        /^```(?:json)?\s*([\s\S]*?)\s*```$/,
        "$1"
      );
    }

    if (
      cleanJsonString.startsWith("<think>") ||
      cleanJsonString.includes("<think>")
    ) {
      const jsonMatch = cleanJsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJsonString = jsonMatch[0];
      }
    }

    cleanJsonString = cleanJsonString.trim();

    try {
      return JSON.parse(cleanJsonString);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Problematic JSON string:", cleanJsonString);
      throw new Error("Failed to parse AI response as JSON");
    }
  }
}

export class OllamaProvider implements AIProvider {
  name = "ollama";
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:11434") {
    this.baseUrl = baseUrl;
  }

  async isContentSafe(text: string): Promise<{ safe: boolean; reason?: string }> {
    try {
      const truncatedText = text.substring(0, 3000);

      console.log("Ollama safety check with Mistral");

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral",
          prompt: `You are a safety classifier. Analyze the following medical report text and determine if it contains harmful content. Respond with 'SAFE' or 'UNSAFE' followed by a brief reason if unsafe.

Text to analyze: ${truncatedText}`,
          stream: false,
        }),
      });

      if (!response.ok) {
        console.error("Ollama API error:", response.status);
        return { safe: true };
      }

      const result = await response.json();
      const content = result.response.trim().toUpperCase();

      if (content.startsWith("SAFE")) {
        console.log("Ollama safety check passed");
        return { safe: true };
      } else if (content.startsWith("UNSAFE")) {
        const reason = content.replace("UNSAFE", "").trim();
        console.log("Ollama safety check blocked content:", reason);
        return { safe: false, reason };
      } else {
        console.log("Ollama safety check unexpected response:", content);
        return { safe: true };
      }
    } catch (error) {
      console.error("Ollama safety check error:", error);
      return { safe: true };
    }
  }

  async analyzeText(text: string, userId: string): Promise<AnalysisResult> {
    console.log("Ollama analysis with Mistral model");

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral",
        prompt: `You are a highly experienced and cautious medical doctor. Your task is to interpret a patient's medical report and present the information in clear, compassionate, and accurate language.

### Rules:
- NEVER invent, assume, or guess values. Only use data explicitly present in the document.
- If a value or section is missing, omit it. Do not fabricate.
- Use only the patient's data. No generic advice.
- Explain abnormalities in simple terms, using analogies only if they improve clarity.
- Be kind, but precise. Avoid alarming language. Use "we" and "let's" to be supportive.
- Flag urgent issues clearly, but calmly.
- Respond ONLY with the JSON object. Do not include any other text, explanations, or formatting.

Analyze the following medical report and return ONLY a valid JSON object with the exact structure specified below. DO NOT include any explanations, thoughts, or additional text. Return only the JSON.

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
${text}`,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ollama API Error Response:", errorText);
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    const jsonString = aiResponse.response.trim();

    // Limpar a string JSON
    let cleanJsonString = jsonString;

    if (cleanJsonString.startsWith("```")) {
      cleanJsonString = cleanJsonString.replace(
        /^```(?:json)?\s*([\s\S]*?)\s*```$/,
        "$1"
      );
    }

    if (
      cleanJsonString.startsWith("<think>") ||
      cleanJsonString.includes("<think>")
    ) {
      const jsonMatch = cleanJsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanJsonString = jsonMatch[0];
      }
    }

    cleanJsonString = cleanJsonString.trim();

    try {
      return JSON.parse(cleanJsonString);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Problematic JSON string:", cleanJsonString);
      throw new Error("Failed to parse AI response as JSON");
    }
  }
}

// Factory function para criar o provider baseado na configuração
export function createAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || "ollama";
  
  switch (provider.toLowerCase()) {
    case "together":
    case "together-ai":
      return new TogetherAIProvider();
    case "ollama":
    default:
      return new OllamaProvider(process.env.OLLAMA_BASE_URL || "http://localhost:11434");
  }
} 