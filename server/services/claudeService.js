import Anthropic from '@anthropic-ai/sdk';

let client = null;

function getClient() {
  if (!client && process.env.ANTHROPIC_API_KEY) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function humanizeWithClaude(text, options = {}) {
  const anthropic = getClient();
  if (!anthropic) throw new Error('Anthropic API key not configured');

  const style = options.style || 'natural';
  const intensity = options.intensity || 'medium';

  const styleGuides = {
    casual: 'Write in a relaxed, conversational tone. Use contractions, informal language, and occasional humor.',
    academic: 'Write in a scholarly but accessible style. Use proper citations-style language but avoid being stilted.',
    creative: 'Write with vivid imagery, varied rhythm, and unique word choices. Show personality.',
    natural: 'Write as a thoughtful, articulate person would. Vary sentence structure, show personality, and use natural transitions.',
  };

  const intensityGuides = {
    light: 'Make minimal changes. Preserve the original structure and meaning. Just smooth out obvious AI patterns.',
    medium: 'Rewrite with moderate changes. Vary sentence structure, replace generic phrases, add natural transitions.',
    heavy: 'Substantially rewrite while preserving the core meaning. Change structure, vocabulary, and flow significantly.',
  };

  const systemPrompt = `You are a skilled editor who rewrites text to sound authentically human-written.

Style: ${styleGuides[style] || styleGuides.natural}
Intensity: ${intensityGuides[intensity] || intensityGuides.medium}

Rules:
- Remove AI-typical phrases ("it's important to note", "furthermore", "in conclusion", "moreover", "additionally")
- Vary sentence length naturally — mix short punchy sentences with longer complex ones
- Add personality and voice — occasional asides, qualifications, or personal touches
- Use concrete examples instead of abstract generalizations
- Avoid perfect parallel structure in lists
- Don't start consecutive sentences the same way
- Use contractions where natural
- Return ONLY the rewritten text, nothing else`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: `Rewrite this text:\n\n${text}` }],
  });

  return {
    humanized: message.content[0].text,
    provider: 'claude',
    style,
    intensity,
  };
}
