import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const ANALYSIS_PROMPT = `Analyze this text for AI-generation indicators. For each dimension, provide a score from 0 to 1 where 0 means definitely human-written and 1 means definitely AI-generated.

Dimensions:
1. vocabulary_predictability - How predictable/generic is the word choice?
2. syntactic_uniformity - How uniform/templated are the sentence structures?
3. semantic_coherence_pattern - Does it follow an overly logical/structured flow?
4. discourse_marker_usage - Overuse of transitions like "moreover", "furthermore"?
5. creativity_indicators - Lack of genuine creativity, humor, personal voice?

Return ONLY valid JSON with this exact structure:
{"vocabulary_predictability": 0.0, "syntactic_uniformity": 0.0, "semantic_coherence_pattern": 0.0, "discourse_marker_usage": 0.0, "creativity_indicators": 0.0}`;

export async function analyzeWithAI(text) {
  // Try Claude first, then OpenAI fallback
  try {
    return await analyzeWithClaude(text);
  } catch (claudeErr) {
    try {
      return await analyzeWithOpenAI(text);
    } catch (openaiErr) {
      // Both APIs unavailable - return null so weight is redistributed
      console.warn('AI meta-detection unavailable:', claudeErr.message, openaiErr.message);
      return null;
    }
  }
}

async function analyzeWithClaude(text) {
  const client = new Anthropic();
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    messages: [{ role: 'user', content: `${ANALYSIS_PROMPT}\n\nText to analyze:\n"""\n${text.slice(0, 4000)}\n"""` }],
  });

  const responseText = message.content[0].text;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in Claude response');

  const scores = JSON.parse(jsonMatch[0]);
  const composite = (
    scores.vocabulary_predictability * 0.20 +
    scores.syntactic_uniformity * 0.20 +
    scores.semantic_coherence_pattern * 0.20 +
    scores.discourse_marker_usage * 0.20 +
    scores.creativity_indicators * 0.20
  );

  return { score: Math.max(0, Math.min(1, composite)), details: scores, provider: 'claude' };
}

async function analyzeWithOpenAI(text) {
  const client = new OpenAI();
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 256,
    messages: [
      { role: 'system', content: ANALYSIS_PROMPT },
      { role: 'user', content: `Text to analyze:\n"""\n${text.slice(0, 4000)}\n"""` },
    ],
  });

  const responseText = completion.choices[0].message.content;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in OpenAI response');

  const scores = JSON.parse(jsonMatch[0]);
  const composite = (
    scores.vocabulary_predictability * 0.20 +
    scores.syntactic_uniformity * 0.20 +
    scores.semantic_coherence_pattern * 0.20 +
    scores.discourse_marker_usage * 0.20 +
    scores.creativity_indicators * 0.20
  );

  return { score: Math.max(0, Math.min(1, composite)), details: scores, provider: 'openai' };
}
