// Content collections — V7 §10: copy-deck.md is parsed (never edited) into
// src/data/copy/*.json by setup/extract-copy.mjs; this collection is the
// typed gateway pages consume. Schema is permissive at G4 (stubs render
// generically); it tightens per-page as G5 builds the real layouts.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const copy = defineCollection({
  loader: glob({
    pattern: ['*.json', '!footer.json'],
    base: './src/data/copy',
    // page JSONs carry a "slug" field (the live URL path); without this the
    // glob loader would adopt it as the entry id — ids stay filename-based
    generateId: ({ entry }) => entry.replace(/\.json$/, ''),
  }),
  schema: z
    .object({
      slug: z.string(),
      deckSection: z.string().optional(),
      title: z.string(),
      sections: z.array(z.record(z.string(), z.any())).default([]),
    })
    .passthrough(),
});

export const collections = { copy };
