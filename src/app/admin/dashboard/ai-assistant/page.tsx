
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { Lightbulb, Loader2 } from "lucide-react";
import { generateCreativeIdeas, CreativeIdea } from "@/ai/flows/creative-ideas-flow";
import { Skeleton } from "@/components/ui/skeleton";

type IdeaType = 'story' | 'activity';

export default function AiAssistantPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<IdeaType | null>(null);
    const [ideas, setIdeas] = useState<CreativeIdea[]>([]);

    const handleGenerate = async (type: IdeaType) => {
        setIsLoading(type);
        setIdeas([]);
        try {
            const result = await generateCreativeIdeas({ type });
            setIdeas(result.ideas);
            toast({
                title: t('yourNewIdeas'),
            });
        } catch (error) {
            console.error("Error generating ideas:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not generate ideas. Please try again.",
            });
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="py-6 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">
                    {t('aiAssistantTitle')}
                </h2>
                 <p className="text-lg text-muted-foreground">{t('aiAssistantSub')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('storyStarters')}</CardTitle>
                        <CardDescription>{t('storyStartersDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => handleGenerate('story')} disabled={!!isLoading}>
                            {isLoading === 'story' ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('generating')}</>
                            ) : (
                                <>{t('generateStoryStarters')}</>
                            )}
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>{t('activityIdeas')}</CardTitle>
                        <CardDescription>{t('activityIdeasDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => handleGenerate('activity')} disabled={!!isLoading}>
                             {isLoading === 'activity' ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('generating')}</>
                            ) : (
                                <>{t('generateActivityIdeas')}</>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
            
            {(isLoading || ideas.length > 0) && (
                <div>
                     <h3 className="text-2xl font-bold tracking-tight my-6">{t('yourNewIdeas')}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            Array.from({length: 3}).map((_, i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <Skeleton className="h-5 w-3/4 mb-2" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-5/6 mt-2" />
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                           ideas.map((idea, index) => (
                                <Card key={index}>
                                    <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                                         <Lightbulb className="w-6 h-6 text-accent" />
                                         <div className="flex-1">
                                            <CardTitle>{idea.title}</CardTitle>
                                         </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{idea.description}</p>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                     </div>
                </div>
            )}

        </div>
    );
}
