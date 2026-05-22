import { GoogleGenAI } from "@google/genai";
import { Project, Section, Persona, GlobalExpertCheck, Question, BiasDetected, HeuristicsAlert } from "./nexusService";

// Helper to check if client-side Gemini can be initialized
export function getGeminiClient(apiKey: string): GoogleGenAI | null {
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error("Failed to initialize Google Gen AI:", error);
    return null;
  }
}

/**
 * System instruction enforcing the UX Research Heuristics Blueprint
 */
const SYSTEM_INSTRUCTION = `
You are an uncompromising Principal UX Researcher and methodological auditor. Your task is to translate raw project requirements and strategic goals into high-integrity, structured semi-structured interview guides.

You must rigidly enforce the timeline progression sequence:
1. Warm-Up / Rapport: low-stakes, easy questions about past/current context.
2. Core Behavioral Exploration: focused entirely on past and current actions. No speculative future questions.
3. Deep-Dive / Probing: conditional sub-questions to dig deeper.
4. Wrap-Up: open invitation for final thoughts.

You must audit the generated questions against the strict Bias Heuristics:
- NO Leading / Priming Questions (e.g., 'How much easier...' -> 'Walk me through how...')
- NO Double-Barreled Questions (e.g., 'What did you think of checkout and was payment fast?' -> split them)
- NO Speculative / Future Questions (e.g., 'Would you pay...' -> 'Tell me about the last time you bought...')
- NO Judgmental/Pre-Conditioned stems (e.g., 'How often do you read papers?' -> 'How do you stay up-to-date, if at all?')

To make the interactive workspace demo effective, you MUST intentionally find or create 1 to 2 questions with subtle biases in the initial guide. Flag these questions in the JSON output under 'bias_detected' with a severity (CRITICAL or WARNING), specify the exact 'highlighted_phrase' that is biased, explain the 'rationale', and supply the corrected 'neutral_text' so that users can review and fix them in the UI.

The rest of the questions should be neutralized by default and conform to these principles.
Use open-ended stems like 'Walk me through how...', 'Tell me about a time when...', 'Describe...'.
`;

/**
 * JSON Schema for Structured Outputs with Gemini
 */
const OUTPUT_SCHEMA = {
  type: "OBJECT",
  properties: {
    learning_objectives: {
      type: "STRING",
      description: "Overarching learning objectives and hypotheses."
    },
    sections: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          questions: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                label: { type: "STRING", description: "e.g. Q1 • WARM-UP, Q2 • CONTEXT" },
                type: { type: "STRING", description: "e.g. Rapport, Core Exploration, Drill Down" },
                original_text: { type: "STRING", description: "The initial question text (may contain minor bias for the 1-2 flagged items)." },
                neutral_text: { type: "STRING", description: "The fully neutralized version of the question." },
                probing_prompts: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "2-3 standby probing questions like 'Can you expand on that?'"
                },
                bias_detected: {
                  type: "OBJECT",
                  properties: {
                    severity: { type: "STRING", enum: ["CRITICAL", "WARNING"] },
                    issue_type: { type: "STRING", description: "e.g. Leading Language, Double-Barreled, Speculative" },
                    highlighted_phrase: { type: "STRING", description: "The exact words to highlight as biased." },
                    rationale: { type: "STRING", description: "The research justification for the warning." }
                  },
                  nullable: true
                }
              },
              required: ["label", "type", "original_text", "neutral_text", "probing_prompts"]
            }
          }
        },
        required: ["title", "questions"]
      }
    },
    expert_review: {
      type: "OBJECT",
      properties: {
        heuristic_score: { type: "STRING", description: "e.g. A-, B+, B-" },
        alerts: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              severity: { type: "STRING", enum: ["CRITICAL", "WARNING"] },
              target_section: { type: "STRING" },
              issue_type: { type: "STRING" },
              original_text: { type: "STRING" },
              suggested_fix: { type: "STRING" },
              rationale: { type: "STRING" }
            },
            required: ["severity", "target_section", "issue_type", "original_text", "suggested_fix", "rationale"]
          }
        },
        pacing_evaluation: { type: "STRING" },
        protocol_balance: { type: "STRING" }
      },
      required: ["heuristic_score", "alerts", "pacing_evaluation", "protocol_balance"]
    }
  },
  required: ["learning_objectives", "sections", "expert_review"]
};

export async function generateInterviewGuideWithGemini(
  apiKey: string,
  name: string,
  goals: string,
  targetAudience: string,
  rawRequirements: string,
  personas: Persona[],
  sectionsList: string[]
): Promise<Project> {
  const ai = getGeminiClient(apiKey);
  if (!ai) {
    throw new Error("Gemini AI client not initialized. Check API Key.");
  }

  const prompt = `
Generate a structured research interview guide for a project named "${name}".
Project Overview & Goals: ${goals}
Target Audience: ${targetAudience}
Raw Stakeholder Requirements: ${rawRequirements}
Target Personas: ${JSON.stringify(personas.map(p => ({ name: p.name, role: p.role, desc: p.description })))}
Requested Structural Sections: ${sectionsList.join(", ")}

Generate questions grouped under each of these requested structural sections. Ensure there are 1-2 questions with minor biases (like leading language or double-barreled) that you explicitly flag in the 'bias_detected' field and 'expert_review.alerts' list so we can show them in our interactive methodology auditor. The rest must be clean. Return the output as JSON conforming strictly to the requested schema.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: OUTPUT_SCHEMA as any,
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Gemini.");
    }

    const data = JSON.parse(text);

    // Map output data to Project structure
    const sections: Section[] = data.sections.map((sec: any, secIdx: number) => {
      const questions: Question[] = sec.questions.map((q: any, qIdx: number) => {
        const qId = `q-gen-${secIdx}-${qIdx}-${Date.now()}`;
        return {
          id: qId,
          label: q.label || `Q${qIdx + 1}`,
          type: q.type || "Exploration",
          original_text: q.original_text,
          neutral_text: q.neutral_text,
          current_text: q.original_text,
          probing_prompts: q.probing_prompts || [],
          bias_detected: q.bias_detected || null,
          comments: [],
          versions: [
            {
              version: 1,
              text: q.original_text,
              timestamp: new Date().toISOString(),
              author: "System AI"
            }
          ]
        };
      });

      return {
        id: `sec-gen-${secIdx}-${Date.now()}`,
        title: sec.title,
        questions
      };
    });

    // Map alerts with proper question_id linking
    const alerts: HeuristicsAlert[] = [];
    data.expert_review.alerts.forEach((alert: any) => {
      // Find matching question to link its ID
      let matchedQId = "";
      for (const s of sections) {
        const q = s.questions.find(qu => qu.original_text === alert.original_text);
        if (q) {
          matchedQId = q.id;
          break;
        }
      }

      alerts.push({
        severity: alert.severity,
        target_section: alert.target_section,
        question_id: matchedQId,
        issue_type: alert.issue_type,
        original_text: alert.original_text,
        suggested_fix: alert.suggested_fix,
        rationale: alert.rationale
      });
    });

    const total_questions = sections.reduce((acc, s) => acc + s.questions.length, 0);

    const expertReview: GlobalExpertCheck = {
      heuristic_score: data.expert_review.heuristic_score || "B",
      alerts,
      total_questions,
      pacing_evaluation: data.expert_review.pacing_evaluation || `Balanced pacing with ${total_questions} items.`,
      protocol_balance: data.expert_review.protocol_balance || "Optimal ratio of open-ended questions."
    };

    return {
      id: `project-${Date.now()}`,
      name,
      goals,
      targetAudience,
      rawRequirements,
      personas,
      sections,
      expertReview,
      status: "IN REVIEW",
      type: "Qualitative",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      collaborators: [
        { name: "System AI", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ai", role: "AI Generator" }
      ]
    };
  } catch (error) {
    console.error("Error generating guide with Gemini API:", error);
    throw error;
  }
}

export async function regenerateQuestionWithGemini(
  apiKey: string,
  question: Question,
  feedback: string,
  surroundingContext: string
): Promise<Question> {
  const ai = getGeminiClient(apiKey);
  if (!ai) {
    throw new Error("Gemini AI client not initialized.");
  }

  const prompt = `
You are the Heuristics Audit Engine. A researcher has left a comment on an interview guide question. 
Your task is to regenerate ONLY this specific question to address the feedback.

Original Question: "${question.current_text}"
Surrounding Context / Goals: "${surroundingContext}"
Researcher Feedback/Comments: "${feedback}"

Propose a new version of this question that:
1. Addresses the researcher's concerns directly.
2. Completely neutralizes any bias (leading, double-barreled, speculative).
3. Maintains open-ended stems.
4. Returns a single JSON block representing the updated question.

JSON Schema:
{
  "revised_text": "string",
  "probing_prompts": ["string"]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            revised_text: { type: "STRING" },
            probing_prompts: { type: "ARRAY", items: { type: "STRING" } }
          },
          required: ["revised_text", "probing_prompts"]
        },
        systemInstruction: "You are an expert UX research guide editor. Return JSON only.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response received");
    const data = JSON.parse(text);

    const nextVer = question.versions.length + 1;
    const newVersions = [
      ...question.versions,
      {
        version: nextVer,
        text: data.revised_text,
        timestamp: new Date().toISOString(),
        author: "System AI",
        commentUsed: feedback
      }
    ];

    return {
      ...question,
      current_text: data.revised_text,
      probing_prompts: data.probing_prompts || question.probing_prompts,
      bias_detected: null, // clear bias warning
      versions: newVersions
    };
  } catch (error) {
    console.error("Gemini regeneration failed, using local fallback:", error);
    throw error;
  }
}
