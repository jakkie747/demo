'use server';
/**
 * @fileOverview An AI agent that generates story starters for preschool teachers.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateStoryStartersInputSchema = z.object({
  count: z
    .number()
    .min(1)
    .max(5)
    .default(5)
    .describe('The number of story starters to generate.'),
});
export type GenerateStoryStartersInput = z.infer<typeof GenerateStoryStartersInputSchema>;

const GenerateStoryStartersOutputSchema = z.object({
  storyStarters: z.array(z.string()).describe('An array of story starters.'),
});
export type GenerateStoryStartersOutput = z.infer<typeof GenerateStoryStartersOutputSchema>;

export async function generateStoryStarters(
  input: GenerateStoryStartersInput
): Promise<GenerateStoryStartersOutput> {
  return generateStoryStartersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStoryStartersPrompt',
  input: {schema: GenerateStoryStartersInputSchema},
  output: {schema: GenerateStoryStartersOutputSchema},
  prompt: `You are a helpful AI assistant that generates story starters for preschool teachers.

  Generate {{count}} unique and age-appropriate story starters that can be used as writing prompts for preschool children. Focus on themes that are engaging, imaginative, and relevant to young children's experiences.

  The story starters should encourage creativity and critical thinking.

  Format the output as a JSON object with a single key called "storyStarters". The value of this key should be a JSON array containing the story starters.`,
});

const generateStoryStartersFlow = ai.defineFlow(
  {
    name: 'generateStoryStartersFlow',
    inputSchema: GenerateStoryStartersInputSchema,
    outputSchema: GenerateStoryStartersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
