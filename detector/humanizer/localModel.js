let pipeline = null;
let loading = false;

/**
 * Load the local transformer model (downloads once, then cached).
 * Uses @xenova/transformers for 100% local CPU inference.
 */
async function loadModel() {
  if (pipeline) return pipeline;
  if (loading) {
    // Wait for loading to complete
    while (loading) {
      await new Promise(r => setTimeout(r, 100));
    }
    return pipeline;
  }

  loading = true;
  try {
    const { pipeline: createPipeline } = await import('@xenova/transformers');
    pipeline = await createPipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-248M', {
      quantized: true,
    });
    return pipeline;
  } catch (err) {
    console.error('Failed to load transformer model:', err.message);
    return null;
  } finally {
    loading = false;
  }
}

/**
 * Paraphrase a sentence using local transformer model.
 */
export async function paraphraseSentence(sentence) {
  try {
    const model = await loadModel();
    if (!model) return sentence; // fallback to original

    const prompt = `Paraphrase the following sentence while keeping the same meaning: ${sentence}`;
    const result = await model(prompt, {
      max_new_tokens: 150,
      temperature: 0.7,
      do_sample: true,
    });

    const output = result[0]?.generated_text?.trim();
    // Only use model output if it's reasonable
    if (output && output.length > 10 && output.length < sentence.length * 3) {
      return output;
    }
    return sentence;
  } catch {
    return sentence; // graceful fallback
  }
}

/**
 * Paraphrase multiple sentences in batch.
 */
export async function paraphraseBatch(sentences) {
  const results = [];
  for (const sentence of sentences) {
    const paraphrased = await paraphraseSentence(sentence);
    results.push(paraphrased);
  }
  return results;
}
