import { GoogleGenAI } from "@google/genai";

// Ensure the API key is defined
if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface GenerationResponse {
  htmlVersion: string;
  nextjsVersion: string;
}

export async function generate404Page(prompt: string): Promise<GenerationResponse> {
  console.log('Starting generate404Page with prompt:', prompt);

  try {
    const systemPrompt = `
You are an expert web developer specializing in creating beautiful 404 pages. 
The user will provide a description of what they want in a 404 page. 
Generate TWO versions:
1. A pure HTML/CSS version (no JavaScript)
2. A Next.js component version using TailwindCSS

Format your response EXACTLY like this (with no additional text):

HTML_VERSION:
\`\`\`html
<!DOCTYPE html>
<html>
<!-- Your HTML code here -->
</html>
\`\`\`

NEXTJS_VERSION:
\`\`\`tsx
// Your Next.js component here
\`\`\`

Both versions should be visually similar but appropriately implemented for their respective formats.
Make the designs visually appealing, with good typography, spacing, and possibly imagery (described using HTML comments).
The Next.js version should use proper conventions including 'use client' directive if needed.

DESIGN GUIDELINES:
- Use vibrant, eye-catching color schemes with gradients
- Incorporate creative animations where appropriate
- Use modern design principles with clean typography
- Include interactive elements when possible
- Consider using icons and visual elements to enhance the design
- Make the 404 page memorable and unique
- Ensure the design is fully responsive
`;

    const fullPrompt = `${systemPrompt}\n\nUSER_DESCRIPTION:\n${prompt}`;

    console.log('Calling model.generateContent with final composed prompt...');

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullPrompt,
    });

    const text = result.text || "";
    console.log('Model response received, length:', text.length);

    const htmlMatch = text.match(/HTML_VERSION:\s*```html\s*([\s\S]*?)\s*```/);
    const nextjsMatch = text.match(/NEXTJS_VERSION:\s*```tsx\s*([\s\S]*?)\s*```/);

    if (!htmlMatch || !nextjsMatch) {
      console.error('Failed to parse AI response: HTML or Next.js section missing');
      throw new Error("Failed to parse AI response correctly");
    }

    return {
      htmlVersion: htmlMatch[1].trim(),
      nextjsVersion: nextjsMatch[1].trim(),
    };
  } catch (error) {
    console.error('Error generating 404 page:', error);
    throw error;
  }
}
