
'use server';
/**
 * @fileOverview An AI flow for generating creative ideas for a preschool.
 *
 * - generateCreativeIdeas - A function that generates ideas.
 * - CreativeIdeaInput - The input type for the function.
 * - CreativeIdeaOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CreativeIdeaInputSchema = z.object({
  type: z.enum(['story', 'activity']).describe("The type of creative idea to generate."),
});
export type CreativeIdeaInput = z.infer<typeof CreativeIdeaInputSchema>;

const CreativeIdeaSchema = z.object({
    title: z.string().describe("A short, catchy title for the idea (e.g., 'The Magical Paintbrush' or 'Nature Scavenger Hunt')."),
    description: z.string().describe("A one or two-sentence description of the idea. For stories, this is the opening line. For activities, this is a brief summary.")
});
export type CreativeIdea = z.infer<typeof CreativeIdeaSchema>;

const CreativeIdeaOutputSchema = z.object({
  ideas: z.array(CreativeIdeaSchema).length(5).describe("An array of exactly 5 creative ideas."),
});
export type CreativeIdeaOutput = z.infer<typeof CreativeIdeaOutputSchema>;


export async function generateCreativeIdeas(input: CreativeIdeaInput): Promise<CreativeIdeaOutput> {
  return creativeIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'creativeIdeasPrompt',
  input: { schema: CreativeIdeaInputSchema },
  output: { schema: CreativeIdeaOutputSchema },
  prompt: `You are an expert preschool teacher and child development specialist. Your task is to generate creative, age-appropriate, and engaging ideas for a classroom of 3-5 year olds, based on the type provided.

Your output must be an array of exactly 5 ideas.

If the request type is 'story':
You will generate 5 unique and imaginative story starters. Each starter should be a single, compelling sentence designed to capture a child's attention and spark their imagination.
- Example Titles: "The Lost Star", "If Animals Could Talk", "The Boy Who Could Fly".
- Example Descriptions: "Once upon a time, in a forest made of candy, lived a little gingerbread man who was afraid of getting wet."

If the request type is 'activity':
You will generate 5 unique and fun classroom activity ideas. The activities should be simple, requiring common classroom materials, and should promote learning through play.
- Example Titles: "Sensory Bin Fun", "Building Block Bonanza", "DIY Puppet Show".
- Example Descriptions: "Create a sensory bin with colored rice and hide small toys for children to find, enhancing their sense of touch."

Please generate 5 ideas for the following type: {{{type}}}.
`,
});

const creativeIdeasFlow = ai.defineFlow(
  {
    name: 'creativeIdeasFlow',
    inputSchema: CreativeIdeaInputSchema,
    outputSchema: CreativeIdeaOutputSchema,
  },
  async (input: CreativeIdeaInput) => {
    const { output } = await prompt(input);
    return output!;
  }
);
