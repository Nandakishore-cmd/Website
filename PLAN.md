# Implementation Plan: Finish the Humanize System

## Current State Assessment

### What EXISTS and WORKS:
- **7-signal AI Detector** - fully implemented, tests pass (12/12)
- **Humanizer pipeline orchestrator** (`detector/humanizer/index.js`) - 5-stage pipeline with light/medium/heavy modes
- **Sentence parser** (`sentenceParser.js`) - uses tokenizer utility
- **Local transformer model wrapper** (`localModel.js`) - @xenova/transformers with LaMini-Flan-T5-248M
- **Synonym engine** (`synonymEngine.js`) - 77-word thesaurus, context-aware replacement
- **Sentence rewriter** (`sentenceRewriter.js`) - passive/active, split/merge, clause reorder
- **Discourse breaker** (`discourseBreaker.js`) - AI transition replacement
- **Vocabulary enricher** (`vocabularyEnricher.js`) - AI word replacement + contractions
- **Anti-detection** (`antiDetection.js`) - burstiness, perplexity, human imperfections
- **Self-verifier** (`selfVerifier.js`) - runs detector on output, flags AI sentences
- **Data files** - thesaurus.json (77 entries), aiPatterns.json, idioms.json
- **Frontend Humanizer page** - two-panel UI, style/strength selectors, copy button
- **API route** (`server/routes/humanize.js`) - proxies to detector service
- **Detector endpoint** (`detector/index.js`) - `/humanize` endpoint with dynamic import
- **Frontend hook** (`useHumanize.js`) + API service (`api.js`)

### What's BROKEN / INCOMPLETE:

1. **`@xenova/transformers` not installed/working** - The model paraphrasing (Stage 2) likely fails silently because the package may not be properly installed or the model (~250MB) hasn't been downloaded. The pipeline has a `catch` that falls back to rule-only mode.

2. **Thesaurus is too small** - Only 77 entries. Plan called for 2000+. This severely limits synonym replacement quality.

3. **Idioms.json is unused** - The idioms data exists but no code ever reads or uses idioms to inject into text.

4. **No "creative" style differentiation** - The `creative` style option exists in the UI but the pipeline doesn't do anything special for it (no metaphors, expressive language, or personality).

5. **No progress/streaming feedback** - Humanization can take 15-60s for heavy mode but the UI only shows a spinner. No progress updates.

6. **Agents dashboard is 100% fake** - Hardcoded simulated messages in `agentStream.js`, no real agent ↔ stream integration.

7. **No humanizer tests** - Zero test coverage for the humanizer pipeline.

8. **The `creative` and `academic` style transforms are minimal** - Only contractions expand/contract. No deeper style adaptation.

---

## Implementation Plan

### Phase 1: Fix the Local Transformer Model (Critical Path)
**Goal:** Make Stage 2 (model paraphrasing) actually work.

**Files to modify:**
- `detector/humanizer/localModel.js` — Add robust model loading with progress events, better error handling, model warm-up, and fallback to a smaller model if the primary fails
- `detector/index.js` — Add a `/humanize/status` endpoint that reports whether the model is loaded
- `detector/package.json` — Verify `@xenova/transformers` is properly listed

**What to do:**
1. Add a model pre-loading mechanism that starts downloading the model on server startup (not on first request)
2. Add a status endpoint so the frontend can show "Model loading..." vs "Ready"
3. Add proper timeout handling for model inference (per-sentence timeout)
4. If `@xenova/transformers` fails entirely (e.g., in constrained environments), implement a fallback sentence shuffling algorithm that still provides meaningful paraphrasing using just the rule engine

### Phase 2: Massively Expand the Thesaurus & Synonym Engine
**Goal:** Go from 77 to 500+ contextual synonym entries.

**Files to modify:**
- `detector/humanizer/data/thesaurus.json` — Expand from 77 to 500+ entries focusing on AI-typical vocabulary
- `detector/humanizer/synonymEngine.js` — Add POS-aware synonym replacement using `compromise` (already a dependency), so we don't replace nouns with verbs

**What to do:**
1. Expand thesaurus with categories: academic words, business jargon, tech terms, formal language, hedging words, intensifiers
2. Add POS tagging via `compromise` to ensure synonyms match grammatical context
3. Add word-frequency awareness — prefer common synonyms over rare ones to sound more human

### Phase 3: Implement Proper Style Differentiation
**Goal:** Make all 4 styles (natural, casual, academic, creative) produce meaningfully different output.

**Files to modify:**
- `detector/humanizer/vocabularyEnricher.js` — Add per-style word choice logic
- `detector/humanizer/antiDetection.js` — Adjust imperfection injection per style
- `detector/humanizer/discourseBreaker.js` — Style-aware transition choices
- `detector/humanizer/sentenceRewriter.js` — Style-specific structure patterns

**Style behaviors:**
- **Natural**: Current behavior (balanced)
- **Casual**: More contractions, slang, shorter sentences, informal connectors, first-person, sentence fragments
- **Academic**: Longer sentences, formal vocabulary, no contractions, citation-style hedging ("research suggests..."), passive voice preference
- **Creative**: Metaphors, varied sentence rhythm, sensory language, personality injection, rhetorical devices, occasional em-dashes and ellipses

### Phase 4: Use Idioms Data & Add Human Texture
**Goal:** Actually use the idioms.json data and inject more human texture.

**Files to modify:**
- `detector/humanizer/antiDetection.js` — Inject idioms and colloquialisms where appropriate
- `detector/humanizer/data/idioms.json` — Expand with context-appropriate categories

**What to do:**
1. Create idiom injection logic that inserts colloquial expressions into casual/natural text
2. Add "human texture" patterns: occasional typo-adjacent structures, em-dashes, parenthetical asides, sentence fragments
3. Make these context-sensitive (don't inject slang into academic text)

### Phase 5: Add Streaming Progress for Heavy Mode
**Goal:** Give the user real-time feedback during humanization.

**Files to modify:**
- `detector/index.js` — Add SSE endpoint `/humanize/stream` that streams progress events
- `server/routes/humanize.js` — Add streaming proxy route
- `client/src/hooks/useHumanize.js` — Add EventSource support for progress
- `client/src/pages/Humanizer.jsx` — Show progress stages, current step, estimated completion

**Progress events:**
1. "Parsing sentences..." (instant)
2. "Loading AI model..." (if first time, ~30s)
3. "Paraphrasing sentence X of Y..." (per-sentence)
4. "Applying rule transforms..." (fast)
5. "Anti-detection optimization..." (fast)
6. "Self-verification pass X..." (for heavy mode)
7. "Complete!"

### Phase 6: Make Agents Dashboard Show Real Activity
**Goal:** Replace fake hardcoded agent messages with real operational data.

**Files to modify:**
- `server/routes/agentStream.js` — Replace `simulateActivity()` with real event integration from agent process, or at minimum make the simulation more realistic with timestamps and varying content
- `agents/src/index.js` — Emit real events when cron jobs actually run

**Minimum viable approach:**
- Since agents can't make real HTTP requests (arXiv, GitHub) without internet, keep the cron structure but emit honest status events: "Health check: detector service offline", "Waiting for detection history data", etc.
- Remove the fake "Found 3 new papers" and "Accuracy: 94.2%" messages
- Show real system state instead of manufactured activity

### Phase 7: Add Humanizer Tests
**Goal:** Test coverage for the humanizer pipeline.

**Files to create:**
- `detector/tests/humanizer.test.js` — Integration tests for the full pipeline
- `detector/tests/synonymEngine.test.js` — Unit tests for synonym replacement
- `detector/tests/sentenceRewriter.test.js` — Unit tests for sentence transforms

**Test cases:**
1. Humanized output differs from input
2. Light mode is faster than heavy mode
3. Synonym replacement preserves sentence count
4. Style options produce different outputs
5. Self-verification actually runs detector
6. Empty/short text handling
7. Very long text handling

### Phase 8: Final Polish & Integration Testing
**Goal:** End-to-end verification.

**What to do:**
1. Run `npm test` across all workspaces — all must pass
2. Start the full stack (`npm run dev`) and test humanization end-to-end
3. Verify the frontend correctly displays results for all style/strength combinations
4. Check error states: what happens when detector is down, when model fails, when text is empty
5. Run `npm run build -w client` to verify production build works

---

## Execution Order

| # | Phase | Priority | Effort |
|---|-------|----------|--------|
| 1 | Fix transformer model | Critical | Medium |
| 2 | Expand thesaurus + POS-aware synonyms | High | Medium |
| 3 | Style differentiation | High | Medium |
| 4 | Idiom injection + human texture | Medium | Low |
| 5 | Streaming progress | Medium | Medium |
| 6 | Real agent activity | Low | Low |
| 7 | Tests | High | Medium |
| 8 | Final polish | Critical | Low |

Phases 1-4 are the core humanizer quality improvements.
Phase 5 is UX improvement.
Phase 6 is honesty improvement (stop faking).
Phase 7-8 are quality assurance.

---

## Files Summary

### Files to CREATE (3):
- `detector/tests/humanizer.test.js`
- `detector/tests/synonymEngine.test.js`
- `detector/tests/sentenceRewriter.test.js`

### Files to MODIFY (15):
- `detector/humanizer/localModel.js`
- `detector/humanizer/data/thesaurus.json`
- `detector/humanizer/synonymEngine.js`
- `detector/humanizer/vocabularyEnricher.js`
- `detector/humanizer/antiDetection.js`
- `detector/humanizer/discourseBreaker.js`
- `detector/humanizer/sentenceRewriter.js`
- `detector/humanizer/data/idioms.json`
- `detector/index.js`
- `server/routes/humanize.js`
- `server/routes/agentStream.js`
- `client/src/hooks/useHumanize.js`
- `client/src/pages/Humanizer.jsx`
- `agents/src/index.js`
- `detector/humanizer/index.js`
