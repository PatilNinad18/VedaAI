import axios from "axios";

interface QuestionType {
  type: string;
  count: number;
  marks: number;
}

interface AssignmentParams {
  subject: string;
  className: string;
  questionTypes: QuestionType[];
}

export async function generateQuestionPaper(params: AssignmentParams) {
  const prompt = `
Generate a CBSE question paper.

Subject: ${params.subject}
Class: ${params.className}

Question Types:
${params.questionTypes
  .map((q) => `${q.type}: ${q.count} questions (${q.marks} marks)`)
  .join("\n")}

IMPORTANT:
- Return ONLY valid JSON
- Do NOT include explanation or text outside JSON

Format:
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
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        // model: "qwen/qwen3-next-80b-a3b-instruct:free",
        model: "meta-llama/llama-3.3-70b-instruct:free",
        // model: "openai/gpt-oss-120b:free",
        
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000", // 🔥 REQUIRED
          "X-Title": "VedaAI", // 🔥 REQUIRED
        },
        timeout: 30000, // prevent hanging
      }
    );

    const raw = res.data?.choices?.[0]?.message?.content;

    if (!raw) {
      throw new Error("Empty AI response");
    }

    console.log("[AI RAW]:", raw);

    // 🔥 safer JSON parsing
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response");
      }
      parsed = JSON.parse(jsonMatch[0]);
    }

    console.log("[AI PARSED]:", parsed);

    return parsed;

  } catch (err: any) {
    console.error("❌ AI ERROR FULL:", err.response?.data || err.message);

    if (err.response?.status === 401) {
      throw new Error("Invalid or missing OpenRouter API key");
    }

    throw new Error("AI generation failed");
  }
}