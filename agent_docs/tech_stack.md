# Tech Stack & Tools
- **Frontend:** Next.js (App Router)
- **Backend:** Supabase (Postgres + Auth)
- **Database:** Supabase Postgres
- **Styling:** Vanilla CSS or standard Next.js setup
- **AI Content Generation:** Gemini 2.5 Flash API
- **Deployment:** Vercel

```javascript
// Example Next.js Page Structure
export default async function Page() {
  return (
    <main className="dark">
      <h1>Polished</h1>
    </main>
  );
}
```

## Error Handling
```javascript
// Example error handling for Supabase
const { data, error } = await supabase.from('lessons').select('*');
if (error) {
  console.error("Database Error:", error.message);
  throw new Error("Failed to load lessons");
}
```

## Naming Conventions
- Components: PascalCase (e.g., `DiscussionFeed.tsx`)
- Utils/Hooks: camelCase (e.g., `useGuestAuth.ts`)
- Database Tables: snake_case (e.g., `lessons`, `reflections`)
