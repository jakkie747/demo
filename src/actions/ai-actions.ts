'use server';

import { generateActivityIdeas, GenerateActivityIdeasInput } from "@/ai/flows/generate-activity-ideas";
import { generateLessonPlan, GenerateLessonPlanInput } from "@/ai/flows/generate-lesson-plan";
import { generateStoryStarters } from "@/ai/flows/generate-story-starters";

export async function generateStoryStartersAction() {
  try {
    const result = await generateStoryStarters({ count: 5 });
    return result.storyStarters;
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate story starters.' };
  }
}

export async function generateActivityIdeasAction(input: GenerateActivityIdeasInput) {
   if (!input.topic) {
    return { error: 'Topic is required.' };
  }
  try {
    const result = await generateActivityIdeas(input);
    return result.activityIdeas;
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate activity ideas.' };
  }
}

export async function generateLessonPlanAction(input: GenerateLessonPlanInput) {
  if (!input.topic || !input.duration) {
    return { error: 'All fields are required.' };
  }
  try {
    const result = await generateLessonPlan(input);
    return result;
  } catch (error)
  {
    console.error(error);
    return { error: 'Failed to generate lesson plan.' };
  }
}
