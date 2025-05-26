import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if the API key is defined
if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface GenerationResponse {
  htmlVersion: string;
  nextjsVersion: string;
}

export async function generate404Page(prompt: string): Promise<GenerationResponse> {
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

    const result = await model.generateContent([
      systemPrompt,
      prompt
    ]);

    const text = result.response.text();
    
    // Extract HTML and Next.js code from the response
    const htmlMatch = text.match(/HTML_VERSION:\s*```html\s*([\s\S]*?)\s*```/);
    const nextjsMatch = text.match(/NEXTJS_VERSION:\s*```tsx\s*([\s\S]*?)\s*```/);

    if (!htmlMatch || !nextjsMatch) {
      throw new Error("Failed to parse AI response correctly");
    }

    return {
      htmlVersion: htmlMatch[1].trim(),
      nextjsVersion: nextjsMatch[1].trim(),
    };
  } catch (error) {
    console.error("Error generating 404 page:", error);
    throw error;
  }
}