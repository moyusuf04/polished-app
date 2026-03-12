import { GoogleGenerativeAI } from '@google/generative-ai';

// Instantiate the Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || 'MISSING_API_KEY');

// We use the gemini-2.5-flash model as required by the Tech Design constraints
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function generateLessonContent(category: string, topic: string) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const prompt = `Act as a cultural educator. Create a 300-word lesson on the topic of "${topic}" in the category of "${category}".
Tone: Sleek, confident, and approachable.
Format the output as a JSON object with the following structure:
{
  "title": "A catchy, confident title",
  "difficulty": "Beginner/Intermediate/Advanced",
  "content_body": "The 300 word lesson content. Use paragraphs.",
  "convo_hooks": ["Hook 1 (e.g. 'Did you know...')", "Hook 2"],
  "thinking_prompt": "A critical thinking question under 200 characters for the user to reflect on."
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    // Clean potential markdown formatting
    const cleanedJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error('Error generating lesson from Gemini:', error);
    throw new Error('Failed to generate lesson content');
  }
}
