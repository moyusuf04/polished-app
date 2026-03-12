# **Technical Design Document: Polished MVP**

## **Executive Summary**

This document outlines the architecture for **Polished**, a mobile-optimized web application designed to help users gain conversational breadth. To meet the founder's requirement for a **strictly $0 budget**, the system leverages the most generous free tiers available in 2026 for frontend, backend, and artificial intelligence. 1

## **1\. Primary Recommendation: The "Vibe-Coder" Stack**

Based on your preference for an AI-written codebase and a mobile-optimized web experience, the following stack is recommended:

* **Frontend:** **Next.js (App Router)** hosted on **Vercel**.  
  * *Why:* It is the modern industry standard for web apps. Vercel's free tier provides high-performance global hosting and a professional developer experience.  
* **Backend & Database:** **Supabase**.  
  * *Why:* It provides a production-grade PostgreSQL database, user authentication (including Anonymous Guest Mode), and 500MB of storage for $0. 2  
* **Content Generation:** **Gemini 2.5 Flash** (via Google AI Studio).  
  * *Why:* As of 2026, Google offers the most generous free tier, allowing up to **1,000 requests per day** for individuals—far exceeding OpenAI's standard trial credits.

### **Alternative Options Compared**

| Option | Pros | Cons | Cost | Time to MVP |
| :---- | :---- | :---- | :---- | :---- |
| **Next.js \+ Supabase** (Recommended) | Full code ownership; infinite flexibility. 1 | Learning curve for guiding the AI. | **$0** | 3-4 Weeks |
| **Softr \+ Airtable** | Zero code; fastest visual builder. 4 | High pricing for mobile ($49/mo); restricted logic. 5 | $0 (Web) / $49+ (Mobile) | 1-2 Weeks |
| **Bubble** | Most powerful no-code logic. | Steepest learning curve; vendor lock-in. | $29/mo (to launch) | 4-6 Weeks |

## **2\. System Architecture**

### **High-Level Data Flow**

1. **AI Script (Admin Mode):** Admin triggers a prompt to **Gemini 2.5 Flash** to generate a week of lessons.  
2. **Storage:** Lessons are stored in **Supabase** (Postgres).  
3. **Client Access:** Users arrive on the **Next.js** site. If they aren't signed in, **Supabase Anonymous Auth** creates a guest session.  
4. **Interaction:** User reads a lesson → User submits a reflection → Reflection is saved to the reflections table.  
5. **Peer Reveal:** Frontend queries the reflections table for that lesson ID and displays the 3 most recent entries.

## **3\. Database Schema (Supabase)**

SQL

\-- Users Table (Handled by Supabase Auth)  
\-- lessons  
{  
  id: uuid,  
  title: text,  
  category: text (Art, Film, Sport, History, Culture),  
  content\_body: text (\~300 words),  
  convo\_hooks: jsonb (List of hooks),  
  thinking\_prompt: text,  
  created\_at: timestamp  
}

\-- reflections  
{  
  id: uuid,  
  lesson\_id: uuid (foreign key),  
  user\_id: uuid (guest or permanent),  
  response\_text: text (limit 200 chars),  
  created\_at: timestamp  
}

## **4\. Key Feature Implementation Plans**

### **Feature 1: Anonymous Guest Mode**

**Approach:** Use Supabase's signInAnonymously() method. This allows users to "own" their reflections and progress without an email signup.

* **Logic:** When a user completes a lesson, the reflection is tied to their anon\_user\_id.  
* **Limit:** The AI agent will be instructed to add a counter in local storage. After 3 lessons, the UI will trigger a "Save your progress" modal for email registration.

### **Feature 2: AI Lesson Content Generation**

**Approach:** Instead of generating lessons live (which is slow for users), we will "pre-bake" them using a prompt library in Google AI Studio.

* **Prompt Architecture:** "Act as a cultural educator. Create a 300-word lesson on. Include 2 'Conversation Hooks' and one 'Reflection Prompt' under 200 characters. Tone: Sleek, confident, and approachable." 6

### **Feature 3: The "Blind Reveal" Discussion**

**Approach:** A standard React state-controlled view.

1. User sees the ReflectionInput component.  
2. Upon onSubmit, the reflection is written to Supabase.  
3. A useEffect hook then fetches the latest 3 peer reflections from the database and updates the UI to show the DiscussionFeed.

## **5\. Deployment & Cost Breakdown**

### **Hosting: Vercel (Hobby Tier)**

* **Cost:** $0  
* **Limits:** 100GB bandwidth/month (Support for \~5,000–10,000 unique monthly visitors).  
* **Commercial Note:** Vercel Hobby is for non-commercial use. Once you validate the concept and decide to charge, you should upgrade to the $20/mo Pro plan.

### **Database: Supabase (Free Tier)**

* **Cost:** $0  
* **Limits:** 50,000 Monthly Active Users (MAUs). Perfect for an MVP launch. 2

### **Content: Gemini API (Free Tier)**

* **Cost:** $0  
* **Limits:** 1,000 requests/day.

## **6\. AI Assistance Strategy (Google Antigravity / Cursor)**

To build this app, you should use the **Planner-Executor-Reviewer (PER)** loop:

1. **Planner:** Feed this Tech Design Doc into the "Agent Manager" and ask: *"Create a step-by-step implementation plan for the Polished MVP project structure."*  
2. **Executor:** Use prompts like: *"Generate a Next.js page for the 'Art' category that fetches lessons from Supabase and applies a sleek dark-mode design."*  
3. **Reviewer:** Ask: *"Review the database security rules (RLS) to ensure guests can only read their own reflections until they sign up."*

## **7\. Definition of Technical Success**

The MVP is technically successful when:

* \[ \] A mobile user can load the site in **\< 2 seconds**. 6  
* \[ \] A guest user can submit a reflection without an error.  
* \[ \] Peer reflections appear only *after* the user submits theirs.  
* \[ \] The total monthly operating cost is **exactly $0**.

---

*Technical Design for: Polished*

*Estimated Time to MVP: 8 Weeks*

*Initial Cost: $0 / month*

#### **Works cited**

1. The Ultimate Tech Stack for Your MVP in 2025 | Startupbricks Blog, accessed on March 7, 2026, [https://www.startupbricks.in/blog/ultimate-tech-stack-for-your-mvp-in-2025](https://www.startupbricks.in/blog/ultimate-tech-stack-for-your-mvp-in-2025)  
2. Supabase Pricing 2026 \[Complete Breakdown\]: Free Tier Limits, Pro Costs & Hidden Fees, accessed on March 7, 2026, [https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance)  
3. Supabase pricing in 2026: Free tier limits, plans & full breakdown | UI Bakery Blog, accessed on March 7, 2026, [https://uibakery.io/blog/supabase-pricing](https://uibakery.io/blog/supabase-pricing)  
4. Headway app review: The app I use to replace doomscrolling with self-improvement micro-lessons : r/ProductivityApps \- Reddit, accessed on March 7, 2026, [https://www.reddit.com/r/ProductivityApps/comments/1qcmlft/headway\_app\_review\_the\_app\_i\_use\_to\_replace/](https://www.reddit.com/r/ProductivityApps/comments/1qcmlft/headway_app_review_the_app_i_use_to_replace/)  
5. Plans and pricing \- Softr, accessed on March 7, 2026, [https://www.softr.io/pricing](https://www.softr.io/pricing)  
6. I scraped 500+ one-star App Store reviews so you don't have to. Here's what actually killed their ratings : r/vibecoding \- Reddit, accessed on March 7, 2026, [https://www.reddit.com/r/vibecoding/comments/1rg7sdh/i\_scraped\_500\_onestar\_app\_store\_reviews\_so\_you/](https://www.reddit.com/r/vibecoding/comments/1rg7sdh/i_scraped_500_onestar_app_store_reviews_so_you/)  
7. How to train your teachers on AI prompting (16-week implementation guide) \- SchoolAI, accessed on March 7, 2026, [https://schoolai.com/blog/training-teachers-ai-prompting](https://schoolai.com/blog/training-teachers-ai-prompting)