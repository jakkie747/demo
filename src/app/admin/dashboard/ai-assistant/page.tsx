'use client';
import { CreativeAssistant } from "@/components/ai/creative-assistant";
import { useLanguage } from "@/context/LanguageContext";

export default function AiAssistantPage() {
    const { t } = useLanguage();
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">{t('aiAssistant')}</h1>
        <p className="text-muted-foreground">{t('aiAssistantDesc')}</p>
      </div>
      <CreativeAssistant />
    </div>
  );
}
