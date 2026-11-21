import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(['kickoff', 'workshop', 'talk', 'lab', 'hangout']),
    start: z.coerce.date(),
    end: z.coerce.date().optional(),
    mode: z.enum(['online', 'in-person']),
    venue: z.string(),
    venueDetail: z.string().optional(),
    meetup: z.string().url(),
    attended: z.number().int().nonnegative().optional(),
    highlight: z.string().optional(),
    photos: z.array(z.string()).default([]),
    audience: z.string().optional(),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    unit: z.enum(['leadership', 'tech', 'events', 'community', 'design']),
    order: z.number().int(),
    photo: z.string().optional(),
    linkedin: z.string().url().optional(),
    x: z.string().url().optional(),
    instagram: z.string().url().optional(),
    github: z.string().url().optional(),
    sample: z.boolean().default(false),
  }),
});

const voices = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/voices' }),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    detail: z.string(),
    sample: z.boolean().default(false),
  }),
});

const showcase = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/showcase' }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(['build', 'win', 'moment']),
    by: z.string(),
    date: z.coerce.date(),
    stack: z.array(z.string()).default([]),
    link: z.string().url().optional(),
    photo: z.string().optional(),
    sample: z.boolean().default(false),
  }),
});

export const collections = { events, team, voices, showcase };
