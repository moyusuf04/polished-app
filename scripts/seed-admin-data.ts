/**
 * Admin seed data script.
 * Run with: npx tsx scripts/seed-admin-data.ts
 * 
 * Seeds 3 categories, 10 lessons, and a simple prerequisite tree.
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('🌱 Seeding admin data...');

  // 1. Categories
  const categories = [
    { name: 'Art', description: 'Visual arts, movements, and masterpieces', theme_color: '#ef4444' },
    { name: 'Film', description: 'Cinema history and iconic films', theme_color: '#3b82f6' },
    { name: 'History', description: 'Key moments that shaped the world', theme_color: '#eab308' },
  ];

  const { data: cats, error: catErr } = await supabase.from('categories').upsert(categories, { onConflict: 'name' }).select();
  if (catErr) { console.error('Category seed error:', catErr); return; }
  console.log(`✅ Seeded ${cats.length} categories`);

  const artId = cats.find(c => c.name === 'Art')!.id;
  const filmId = cats.find(c => c.name === 'Film')!.id;
  const historyId = cats.find(c => c.name === 'History')!.id;

  // 2. Lessons
  const lessons = [
    { id: 'intro_impressionism', title: 'Intro to Impressionism', category_id: artId, category: 'Art', difficulty: 'Level 1: Foundation', status: 'published', position: 0, content_slides: [{ type: 'context', text: 'In the 1860s, a group of French painters rejected the rigid rules of academic art.' }, { type: 'insight', text: 'They painted outdoors, capturing light and movement instead of posed studio scenes.' }, { type: 'significance', text: 'This rebellion birthed modern art and changed how we see the world forever.' }] },
    { id: 'monet_water_lilies', title: "Monet's Water Lilies", category_id: artId, category: 'Art', difficulty: 'Level 1: Foundation', status: 'published', position: 1, content_slides: [{ type: 'context', text: 'Claude Monet spent the last 30 years of his life painting his garden in Giverny.' }, { type: 'insight', text: 'The Water Lilies series contains over 250 paintings of the same pond.' }, { type: 'significance', text: 'Monet proved that repetition is not redundancy — it is depth.' }] },
    { id: 'van_gogh_starry_night', title: "Van Gogh's Starry Night", category_id: artId, category: 'Art', difficulty: 'Level 2: Intermediate', status: 'published', position: 2, content_slides: [{ type: 'context', text: 'Van Gogh painted Starry Night from an asylum window in Saint-Rémy in 1889.' }, { type: 'insight', text: 'The swirling sky was not what he saw — it was what he felt.' }, { type: 'significance', text: 'It proved that art does not need to mirror reality to capture truth.' }] },
    { id: 'picasso_guernica', title: "Picasso's Guernica", category_id: artId, category: 'Art', difficulty: 'Level 2: Intermediate', status: 'draft', position: 3, content_slides: [{ type: 'context', text: 'In 1937, Nazi warplanes bombed the Basque town of Guernica during the Spanish Civil War.' }, { type: 'insight', text: 'Picasso responded with a massive mural that turned chaos into cubist geometry.' }, { type: 'significance', text: 'Guernica became the most powerful anti-war painting in history.' }] },
    { id: 'citizen_kane', title: 'Citizen Kane', category_id: filmId, category: 'Film', difficulty: 'Level 1: Foundation', status: 'published', position: 0, content_slides: [{ type: 'context', text: 'Orson Welles made Citizen Kane at age 25 with unprecedented creative control.' }, { type: 'insight', text: 'The film invented deep focus cinematography and non-linear storytelling.' }, { type: 'significance', text: 'It redefined what cinema could be as narrative art.' }] },
    { id: 'hitchcocks_psycho', title: "Hitchcock's Psycho", category_id: filmId, category: 'Film', difficulty: 'Level 1: Foundation', status: 'published', position: 1, content_slides: [{ type: 'context', text: 'Alfred Hitchcock killed the main character 30 minutes into the film.' }, { type: 'insight', text: 'This violated every storytelling convention of the era.' }, { type: 'significance', text: 'It proved that audience expectations are a tool to be weaponized.' }] },
    { id: 'kubrick_2001', title: '2001: A Space Odyssey', category_id: filmId, category: 'Film', difficulty: 'Level 2: Intermediate', status: 'draft', position: 2, content_slides: [{ type: 'context', text: 'Stanley Kubrick made a sci-fi film in 1968 that predicted video calls and AI.' }, { type: 'insight', text: 'The film has almost no dialogue — it communicates through visuals and music alone.' }, { type: 'significance', text: 'It proved cinema could be philosophical, not just entertaining.' }] },
    { id: 'french_revolution', title: 'The French Revolution', category_id: historyId, category: 'History', difficulty: 'Level 1: Foundation', status: 'published', position: 0, content_slides: [{ type: 'context', text: 'In 1789, a bankrupt France watched its starving masses storm the Bastille.' }, { type: 'insight', text: 'The revolution did not just topple a king — it toppled the concept of divine right.' }, { type: 'significance', text: 'Modern democracy, human rights, and republicanism trace back to this moment.' }] },
    { id: 'fall_of_rome', title: 'The Fall of Rome', category_id: historyId, category: 'History', difficulty: 'Level 1: Foundation', status: 'published', position: 1, content_slides: [{ type: 'context', text: 'The Western Roman Empire did not fall in a day — it decayed over centuries.' }, { type: 'insight', text: 'Internal corruption mattered more than barbarian invasions.' }, { type: 'significance', text: 'Rome teaches that empires are destroyed from within, not without.' }] },
    { id: 'industrial_revolution', title: 'The Industrial Revolution', category_id: historyId, category: 'History', difficulty: 'Level 2: Intermediate', status: 'draft', position: 2, content_slides: [{ type: 'context', text: 'In 18th century Britain, machines replaced hands for the first time in history.' }, { type: 'insight', text: 'It was not just a tech shift — it rewired society, class, and human identity.' }, { type: 'significance', text: 'Every modern comfort and crisis descends from this moment.' }] },
  ];

  const { data: insertedLessons, error: lessonErr } = await supabase.from('lessons').upsert(lessons, { onConflict: 'id' }).select();
  if (lessonErr) { console.error('Lesson seed error:', lessonErr); return; }
  console.log(`✅ Seeded ${insertedLessons.length} lessons`);

  // 3. Prerequisites (simple tree)
  const prerequisites = [
    { lesson_id: 'monet_water_lilies', prerequisite_id: 'intro_impressionism' },
    { lesson_id: 'van_gogh_starry_night', prerequisite_id: 'intro_impressionism' },
    { lesson_id: 'picasso_guernica', prerequisite_id: 'van_gogh_starry_night' },
    { lesson_id: 'hitchcocks_psycho', prerequisite_id: 'citizen_kane' },
    { lesson_id: 'kubrick_2001', prerequisite_id: 'citizen_kane' },
    { lesson_id: 'fall_of_rome', prerequisite_id: 'french_revolution' },
    { lesson_id: 'industrial_revolution', prerequisite_id: 'fall_of_rome' },
  ];

  const { error: prereqErr } = await supabase.from('lesson_prerequisites').upsert(prerequisites, { onConflict: 'lesson_id,prerequisite_id' });
  if (prereqErr) { console.error('Prerequisite seed error:', prereqErr); return; }
  console.log('✅ Seeded prerequisite tree');

  console.log('\n🎉 Seeding complete!');
}

seed().catch(console.error);
