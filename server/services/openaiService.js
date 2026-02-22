import OpenAI from 'openai';

let client = null;

function getClient() {
  if (!client && process.env.OPENAI_API_KEY) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export async function humanizeWithOpenAI(text, options = {}) {
  const openai = getClient();
  if (!openai) throw new Error('OpenAI API key not configured');

  const style = options.style || 'natural';
  const intensity = options.intensity || 'medium';

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 4096,
    messages: [
      {
        role: 'system',
        content: `You are a skilled editor who rewrites text to sound authentically human-written. Style: ${style}. Intensity: ${intensity}. Remove AI-typical phrases, vary sentence structure, add personality, use concrete examples. Return ONLY the rewritten text.`,
      },
      { role: 'user', content: `Rewrite this text:\n\n${text}` },
    ],
  });

  return {
    humanized: completion.choices[0].message.content,
    provider: 'openai',
    style,
    intensity,
  };
}
