import { InteractiveReader } from "@/components/InteractiveReader";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Find lesson by ID
  const { data: lesson } = await supabase
    .from('lessons')
    .select(`
      *,
      category:categories(name)
    `)
    .eq('id', slug)
    .single();

  if (!lesson) {
    notFound();
  }

  // Format to match LessonData interface expectations for InteractiveReader
  const formattedLesson = {
    id: lesson.id,
    content_slides: lesson.content_slides || [],
    convo_hooks: lesson.convo_hooks || [],
    reflection_prompt: lesson.reflection_prompt || 'What is your take?',
  };

  return (
    <main className="min-h-screen bg-black">
      <InteractiveReader
        title={lesson.title}
        category={(lesson.category as any)?.name || 'Unknown'}
        difficulty={lesson.difficulty || 'Level 1: Foundation'}
        lessonData={formattedLesson}
        onBack={() => {
          window.location.href = '/hub';
        }}
      />
    </main>
  );
}
