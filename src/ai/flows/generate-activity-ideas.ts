'use server';

/**
 * @fileOverview An AI agent for generating preschool activity ideas.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateActivityIdeasInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic or theme for the activity ideas, such as animals, colors, or seasons.'),
});
export type GenerateActivityIdeasInput = z.infer<
  typeof GenerateActivityIdeasInputSchema
>;

const GenerateActivityIdeasOutputSchema = z.object({
  activityIdeas: z
    .array(z.string())
    .describe('An array of creative and age-appropriate activity ideas.'),
});
export type GenerateActivityIdeasOutput = z.infer<
  typeof GenerateActivityIdeasOutputSchema
>;

export async function generateActivityIdeas(
  input: GenerateActivityIdeasInput
): Promise<GenerateActivityIdeasOutput> {
  return generateActivityIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActivityIdeasPrompt',
  input: {schema: GenerateActivityIdeasInputSchema},
  output: {schema: GenerateActivityIdeasOutputSchema},
  prompt: `You are a creative preschool teacher. Generate 5 unique and engaging activity ideas for preschool children based on the following topic:

Topic: {{{topic}}}

Format the output as a JSON object with an array of strings. Each string is a single activity idea.`,
});

const generateActivityIdeasFlow = ai.defineFlow(
  {
    name: 'generateActivityIdeasFlow',
    inputSchema: GenerateActivityIdeasInputSchema,
    outputSchema: GenerateActivityIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
