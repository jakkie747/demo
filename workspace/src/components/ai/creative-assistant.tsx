'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { generateActivityIdeasAction, generateStoryStartersAction, generateLessonPlanAction } from '@/actions/ai-actions';
import { Loader2, Wand2, Sparkles, BookCheck, ClipboardList, Telescope, Microscope, Lightbulb, GraduationCap } from 'lucide-react';
import { type GenerateLessonPlanOutput } from '@/ai/flows/generate-lesson-plan';
import { Separator } from '../ui/separator';
import { Skeleton } from "@/components/ui/skeleton";

const activityFormSchema = z.object({
  topic: z.string().min(2, { message: "Topic must be at least 2 characters." }),
});

const lessonPlanFormSchema = z.object({
  topic: z.string().min(2, { message: "Topic is required." }),
  ageGroup: z.string().min(2, { message: "Age group is required." }),
  duration: z.string().min(2, { message: "Duration is required." }),
});

export function CreativeAssistant() {
  const { t } = useLanguage();
  const [storyStarters, setStoryStarters] = useState<string[]>([]);
  const [activityIdeas, setActivityIdeas] = useState<string[]>([]);
  const [lessonPlan, setLessonPlan] = useState<GenerateLessonPlanOutput | null>(null);
  const [currentTopic, setCurrentTopic] = useState('');
  const [isStoryLoading, setIsStoryLoading] = useState(false);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [isLessonPlanLoading, setIsLessonPlanLoading] = useState(false);

  const activityForm = useForm<z.infer<typeof activityFormSchema>>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: { topic: "" },
  });

  const lessonPlanForm = useForm<z.infer<typeof lessonPlanFormSchema>>({
    resolver: zodResolver(lessonPlanFormSchema),
    defaultValues: { topic: "", ageGroup: "", duration: "" },
  });

  const handleGenerateStoryStarters = async () => {
    setIsStoryLoading(true);
    setStoryStarters([]);
    const result = await generateStoryStartersAction();
    if (Array.isArray(result)) {
      setStoryStarters(result);
    } else {
      console.error(result.error);
    }
    setIsStoryLoading(false);
  };

  const handleGenerateActivityIdeas = async (values: z.infer<typeof activityFormSchema>) => {
    setIsActivityLoading(true);
    setActivityIdeas([]);
    setCurrentTopic(values.topic);
    const result = await generateActivityIdeasAction({ topic: values.topic });
     if (Array.isArray(result)) {
      setActivityIdeas(result);
    } else {
      console.error(result.error);
    }
    setIsActivityLoading(false);
    activityForm.reset();
  };
  
  const handleGenerateLessonPlan = async (values: z.infer<typeof lessonPlanFormSchema>) => {
    setIsLessonPlanLoading(true);
    setLessonPlan(null);
    const result = await generateLessonPlanAction(values);
     if (result && 'title' in result) {
      setLessonPlan(result);
    } else {
      console.error(result.error);
    }
    setIsLessonPlanLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Quick Tools Column */}
        <div className="space-y-8">
          {/* Story Starters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <Wand2 className="text-primary"/>
                  {t.generateStoryStarters}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleGenerateStoryStarters} disabled={isStoryLoading} className="w-full">
                {isStoryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {t.generateStoryStarters}
              </Button>
              {isStoryLoading && (
                   <div className="space-y-2 pt-4">
                      {[...Array(5)].map((_, i) => (
                          <div key={i} className="p-4 border rounded-lg bg-muted/50 animate-pulse h-12" />
                      ))}
                  </div>
              )}
              {storyStarters.length > 0 && (
                <div className="pt-4">
                  <h3 className="font-bold mb-2 font-headline text-lg">{t.storyStarters}</h3>
                  <ul className="space-y-2">
                    {storyStarters.map((starter, index) => (
                      <li key={index} className="p-3 border rounded-lg bg-background flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-accent shrink-0 mt-1"/>
                        <span>{starter}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Ideas */}
          <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <Wand2 className="text-primary"/>
                  {t.generateActivityIdeas}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...activityForm}>
                <form onSubmit={activityForm.handleSubmit(handleGenerateActivityIdeas)} className="flex items-start gap-2">
                  <FormField
                    control={activityForm.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder={t.enterTopic} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isActivityLoading}>
                     {isActivityLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                     <span className="sr-only">Generate</span>
                  </Button>
                </form>
              </Form>
               {isActivityLoading && (
                   <div className="space-y-2 pt-4">
                      {[...Array(5)].map((_, i) => (
                          <div key={i} className="p-4 border rounded-lg bg-muted/50 animate-pulse h-12" />
                      ))}
                  </div>
              )}
              {activityIdeas.length > 0 && (
                <div className="pt-4">
                  <h3 className="font-bold mb-2 font-headline text-lg">{t.activityIdeas}: <span className="text-primary">{currentTopic}</span></h3>
                  <ul className="space-y-2">
                    {activityIdeas.map((idea, index) => (
                      <li key={index} className="p-3 border rounded-lg bg-background flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-accent shrink-0 mt-1"/>
                        <span>{idea}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lesson Plan Generator */}
        <Card className="lg:col-span-1">
           <CardHeader>
             <CardTitle className="flex items-center gap-2 font-headline text-xl">
                <BookCheck className="text-primary"/>
                {t.lessonPlanGenerator}
              </CardTitle>
              <CardDescription>{t.lessonPlanGeneratorDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...lessonPlanForm}>
              <form onSubmit={lessonPlanForm.handleSubmit(handleGenerateLessonPlan)} className="space-y-4">
                 <FormField
                  control={lessonPlanForm.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.lessonPlanTopic}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., The Solar System" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={lessonPlanForm.control}
                  name="ageGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.lessonPlanAgeGroup}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 4-5 year olds" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={lessonPlanForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.lessonPlanDuration}</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 45 minutes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLessonPlanLoading} className="w-full">
                   {isLessonPlanLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                   {t.generateLessonPlan}
                </Button>
              </form>
            </Form>

            {isLessonPlanLoading && (
              <div className="space-y-4 pt-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Separator />
                <Skeleton className="h-20 w-full" />
              </div>
            )}
            
            {lessonPlan && (
              <div className="pt-6 space-y-6">
                <div className="text-center">
                  <h2 className="font-headline text-2xl font-bold text-primary">{lessonPlan.title}</h2>
                </div>
                <Separator />

                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-headline"><GraduationCap /> {t.lessonPlanObjectives}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc space-y-1 pl-5">
                      {lessonPlan.objectives.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-headline"><ClipboardList /> {t.lessonPlanMaterials}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc space-y-1 pl-5">
                      {lessonPlan.materials.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-headline"><Telescope /> {t.lessonPlanProcedure}</CardTitle>
                  </Header>
                  <CardContent>
                    <ol className="list-decimal space-y-2 pl-5">
                       {lessonPlan.procedure.map((item, i) => <li key={i}>{item}</li>)}
                    </ol>
                  </CardContent>
                </Card>

                 <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-headline"><Microscope /> {t.lessonPlanAssessment}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{lessonPlan.assessment}</p>
                  </CardContent>
                </Card>

                 <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-headline"><Lightbulb /> {t.lessonPlanExtension}</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <ul className="list-disc space-y-1 pl-5">
                      {lessonPlan.extensionIdeas.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
