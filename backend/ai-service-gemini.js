import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ─── VALIDATION ─────────────────────────────────

const QuestionSchema = z.object({
  text: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  marks: z.number(),
});

const SectionSchema = z.object({
  title: z.string(),
  questionType: z.string(),
  instruction: z.string(),
  questions: z.array(QuestionSchema),
});

const OutputSchema = z.object({
  sections: z.array(SectionSchema),
});

// ─── MAIN FUNCTION ──────────────────────────────

export async function generateQuestionPaper(params) {
  const prompt = `
You are an expert CBSE paper setter.

Generate a HIGH-QUALITY question paper.

STRICT RULES:
- Subject: ${params.subject}
- Class: ${params.className}
- No generic questions
- No placeholders
- Real exam-level questions only

Question Types:
${params.questionTypes.map(q =>
  `${q.type}: ${q.count} questions (${q.marks} marks each)`
).join("\n")}

Return ONLY JSON:
{
  "sections": [
    {
      "title": "Section A",
      "questionType": "...",
      "instruction": "...",
      "questions": [
        {
          "text": "...",
          "difficulty": "easy|medium|hard",
          "marks": number
        }
      ]
    }
  ]
}
`;

  try {
    console.log("[AI] Using NEW Gemini SDK");

    const response = await ai.models.generateContent({
      model: "gemini-pro", // NOW this will work
      contents: prompt,
    });

    const raw = response.text;

    if (!raw) throw new Error("Empty response");

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      parsed = JSON.parse(raw.slice(start, end + 1));
    }

    return OutputSchema.parse(parsed);
  } catch (err) {
    console.error("[AI ERROR]", err);
    throw new Error("AI generation failed");
  }
}