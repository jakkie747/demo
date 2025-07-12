'use server';
/**
 * @fileOverview An AI agent for generating preschool lesson plans.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLessonPlanInputSchema = z.object({
  topic: z
    .string()
    .describe('The main theme or subject of the lesson plan. For example: "The Solar System", "Community Helpers", "Spring".'),
  ageGroup: z
    .string()
    .describe('The target age group for the lesson. For example: "2-3 year olds", "4-5 year olds".'),
  duration: z
    .string()
    .describe('The estimated duration of the lesson. For example: "30 minutes", "1 hour".'),
});
export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

const GenerateLessonPlanOutputSchema = z.object({
    title: z.string().describe("A creative and catchy title for the lesson plan."),
    objectives: z.array(z.string()).describe("A list of clear learning objectives for the children."),
    materials: z.array(z.string()).describe("A list of all materials and resources needed for the lesson."),
    procedure: z.array(z.string()).describe("A step-by-step procedure for conducting the lesson, from introduction to conclusion."),
    assessment: z.string().describe("A brief description of how the teacher can assess the children's understanding."),
    extensionIdeas: z.array(z.string()).describe("A list of ideas to extend the lesson for advanced learners or for further exploration."),
});
export type GenerateLessonPlanOutput = z.infer<typeof GenerateLessonPlanOutputSchema>;

export async function generateLessonPlan(
  input: GenerateLessonPlanInput
): Promise<GenerateLessonPlanOutput> {
  return generateLessonPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonPlanPrompt',
  input: {schema: GenerateLessonPlanInputSchema},
  output: {schema: GenerateLessonPlanOutputSchema},
  prompt: `You are an expert early childhood educator with over 20 years of experience creating engaging and effective lesson plans for preschoolers.

You will generate a complete, age-appropriate lesson plan based on the provided topic, age group, and duration. The lesson plan should be creative, hands-on, and foster a love of learning.

Topic: {{{topic}}}
Age Group: {{{ageGroup}}}
Duration: {{{duration}}}

Structure the output as a JSON object with the specified fields.`,
});

const generateLessonPlanFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: GenerateLessonPlanInputSchema,
    outputSchema: GenerateLessonPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
