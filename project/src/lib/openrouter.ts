import { getGeminiResponse, streamGeminiResponse } from './gemini';

// NOTE: This file now exclusively uses Gemini. Name retained to avoid refactoring import paths elsewhere.

async function withRetry<T>(fn: () => Promise<T>, opts?: { retries?: number; baseDelayMs?: number }) {
  const retries = opts?.retries ?? 2;
  const baseDelayMs = opts?.baseDelayMs ?? 500;
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, delay));
      attempt++;
    }
  }
}

// Function to get AI response for PYQ-related questions
export async function getAIResponse(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]) {
  try {
    const allMessages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [
      {
        role: 'system' as const,
        content:
          'You are a helpful, concise assistant for SmartPYQ. Provide accurate, useful answers in clear language. When appropriate, add short step-by-step reasoning or examples. Use plain text only — do not use Markdown formatting (no **bold**, lists, headers, or code blocks). Keep responses focused and avoid unnecessary disclaimers.'
      },
      ...messages
    ];
    const geminiResp = await withRetry(() => getGeminiResponse(allMessages));
    return typeof geminiResp === 'string' ? geminiResp : JSON.stringify(geminiResp);
  } catch (error) {
    console.error('Error getting AI response (Gemini):', error);
    return "Sorry, I'm having trouble processing your request right now. Please try again later.";
  }
}

// Streaming variant for typing effect
export async function getAIResponseStream(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  onChunk: (delta: string) => void,
  opts?: { timeoutMs?: number }
) {
  try {
    const allMessages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [
      {
        role: 'system' as const,
        content:
          'You are a helpful, concise assistant for SmartPYQ. Provide accurate, useful answers in clear language. When appropriate, add short step-by-step reasoning or examples. Use plain text only — do not use Markdown formatting (no **bold**, lists, headers, or code blocks). Keep responses focused and avoid unnecessary disclaimers.'
      },
      ...messages
    ];
    const final = await streamGeminiResponse(allMessages, { onChunk, timeoutMs: opts?.timeoutMs });
    return typeof final === 'string' ? final : JSON.stringify(final);
  } catch (error) {
    console.error('Error streaming AI response (Gemini):', error);
    const fallback = "Sorry, I'm having trouble streaming a response right now.";
    onChunk(fallback);
    return fallback;
  }
}

// Function to get smart search suggestions
export async function getSearchSuggestions(query: string) {
  try {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a smart search assistant for SmartPYQ. Generate 3 relevant search suggestions as a JSON array. Example: ["JEE Main Physics 2020", "NEET Biology 2021", "CBSE Class 12 Math 2019"]'
      },
      {
        role: 'user' as const,
        content: `Provide 3 smart search suggestions for finding PYQ papers based on this query: "${query}". Format as a JSON array of strings.`
      }
    ];
    const geminiResp = await withRetry(() => getGeminiResponse(messages));
    const contentString = typeof geminiResp === 'string' ? geminiResp : JSON.stringify(geminiResp);
    try {
      return JSON.parse(contentString);
    } catch {
      return [contentString];
    }
  } catch (error) {
    console.error('Error getting search suggestions (Gemini):', error);
    return [];
  }
}

// Function to analyze PYQ patterns
export async function analyzePYQPatterns(examType: string, subject: string) {
  try {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are an exam pattern analysis expert for SmartPYQ. Provide concise, actionable insights about PYQ patterns. Focus on what students need to know to prepare effectively.'
      },
      {
        role: 'user' as const,
        content: `Analyze the PYQ patterns for ${examType} ${subject}. Provide insights on:\n1. Most frequently appearing topics\n2. Difficulty level distribution\n3. Recent trends\n4. Study recommendations\n\nFormat your response in a clear, structured way.`
      }
    ];
    const geminiResp = await withRetry(() => getGeminiResponse(messages));
    return typeof geminiResp === 'string' ? geminiResp : JSON.stringify(geminiResp);
  } catch (error) {
    console.error('Error analyzing PYQ patterns (Gemini):', error);
    return "Sorry, I'm having trouble analyzing PYQ patterns right now. Please try again later.";
  }
}