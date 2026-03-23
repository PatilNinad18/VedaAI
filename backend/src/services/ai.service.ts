import axios from "axios";

export async function generateQuestionPaper(params) {
  const prompt = `
Generate a CBSE question paper.

Subject: ${params.subject}
Class: ${params.className}

Question Types:
${params.questionTypes.map(q =>
  `${q.type}: ${q.count} questions (${q.marks} marks)`
).join("\n")}

Return STRICT JSON:
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
    model: "openrouter/auto",
    messages: [
      {
        role: "user",
        content: "Say hello in JSON: {\"msg\":\"hello\"}"
      }
    ],
  },
  {
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
  }
);

console.log(res.data);

//     const raw = res.data.choices[0].message.content;

//     const jsonMatch = raw.match(/\{[\s\S]*\}/);
//     return JSON.parse(jsonMatch[0]);

  } catch (err) {
    console.error("[AI ERROR]", err);
    throw new Error("AI generation failed");
  }
}