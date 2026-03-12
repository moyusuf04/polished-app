# **Product Requirements Document: Polished MVP**

## **Product Overview**

**App Name:** Polished **Tagline:** Conversational breadth for the ambitious. **Launch Goal:** Validate that users will engage with bite-sized cultural lessons and use them to think critically. Specifically, proving the "learning → reflection → conversation" loop works without requiring highbrow commitment. 1 **Target Launch:** 8–12 weeks.

## **Who It's For**

### **Primary User: The "Aspiring Insider"**

Curious, ambitious young professionals or students who want to hold their own in social and professional discussions but lack early exposure to certain cultural topics.

**Their Current Pain:**

* **Social Friction:** Feeling left out of office or networking conversations about film, art, or history.  
* **Content Overwhelm:** Traditional courses feel like "homework"; social media feeds offer info without application. 3  
* **Efficiency Needs:** They have "dead time" (commutes, coffee lines) but don't want to waste it on mindless scrolling. 1

**What They Need:**

* **High-Signal Content:** Short, structured, and practical knowledge.  
* **Low Barrier to Entry:** Ability to try the value before committing to an account. 6  
* **Critical Thinking Hooks:** Not just facts, but a "take" or perspective they can use.

### **Example User Story**

"Meet Alex, a recent grad who stays quiet at team lunches when art or film history comes up. He spends 3 minutes on Polished while waiting for the bus, reads a hook about *Impressionism*, and types a quick reflection. Now he feels ready to contribute a unique point of view at lunch today."

## **The Problem We're Solving**

Modern learning is "broken" for the skill fitness era; 96% of long-form online course starters never finish. 5 Meanwhile, social media provides "fancier doomscrolling" without retention. 7 Polished bridges the gap by providing structured micro-lessons with a mandatory reflection step to ensure conversational readiness. 8

**Why Existing Solutions Fall Short:**

* **Blinkist/Headway:** Excellent for book summaries but often stop at consumption without encouraging critical reflection or community "takes." 9  
* **Online Courses:** Too formal and demand hours of study. 5

## **User Journey**

### **Discovery → First Use → Success**

1. **Discovery Phase**  
   * **How they find us:** Shared links on Instagram or Twitter/X.  
   * **What catches attention:** A specific lesson link (e.g., "The 3 minutes you need to talk about *The Godfather*").  
   * **Decision trigger:** Anonymous entry via **Guest Mode**. 6  
2. **Onboarding (First 5 Minutes)**  
   * **Land on:** A mobile-optimized category hub (Art, Film, Sport, History, Culture).  
   * **First action:** Tap a lesson and read \~300 words of curated AI content.  
   * **Quick win:** Submit a \<200-character reflection and instantly see 3 peer perspectives.  
3. **Core Usage Loop**  
   * **Trigger:** Daily "Conversational Drop" (habitual morning check).  
   * **Action:** Read Lesson → Answer Prompt.  
   * **Reward:** Unlocking the "Reveal" (peer responses) and a sense of conversational confidence.  
4. **Success Moment**  
   * **"Aha\!" moment:** Using a "Polished" hook in a real-life meeting and receiving positive social validation.

## **MVP Features**

### **Must Have for Launch**

#### **1\. AI-Generated Micro-Lesson Feed**

* **What:** Curated lessons (\~300 words) with quick facts and 2–3 "Conversational Hooks."  
* **User Story:** As a busy professional, I want to learn one specific cultural angle fast so I don't feel lost in conversations.  
* **Priority:** P0 (Critical)

#### **2\. The \<200-Character "Reflection Box"**

* **What:** A mandatory input field at the end of a lesson to practice critical thinking.  
* **User Story:** As a learner, I want to articulate my own "take" so I can remember it for real-life use.  
* **Success Criteria:** Character counter works; saves response to the database.  
* **Priority:** P0 (Critical)

#### **3\. Peer Response Reveal**

* **What:** A blind reveal: once the user submits, they see a small feed of other users' responses.  
* **User Story:** As a student, I want to see how others interpreted the lesson to refine my own perspective.  
* **Priority:** P0 (Critical)

#### **4\. Anonymous Guest Mode**

* **What:** Allow 3 lesson completions before requiring an email signup.  
* **User Story:** As a first-time visitor, I want to try the app without a "signup wall." 6  
* **Priority:** P0 (Critical)

### **NOT in MVP (Saving for Later)**

* **Streaks & Badges:** Habit-forming gamification. 11  
* **AI Cultural Personas:** Chatting with historical figures (e.g., "Ask Socrates a question"). 5  
* **User Progress Tracking:** Long-term growth dashboards. 13

## **How We'll Know It's Working**

### **Launch Success Metrics (First 30 Days)**

| Metric | Target | Measure |
| :---- | :---- | :---- |
| **Completion Rate** | 70% of started lessons | Google Analytics / Supabase events |
| **Day 2 Retention** | 25% | Cohort analysis of returning users 14 |
| **Response Rate** | 50% of lesson finishers | Percentage of users who submit a reflection |

## **Look & Feel**

**Design Vibe:** Bite-sized, curious, approachable, sleek, and confident.

**Visual Principles:**

1. **Dark Mode by Default:** \#1 UX request for learning apps to reduce eye strain. 6  
2. **"Magazine" Typography:** Premium serif fonts for lessons to feel "polished." 15  
3. **Frictionless UI:** One-click navigation; no hidden menus. 16

**Key Screens:**

1. **The Pod Hub:** Category-based navigation.  
2. **The Reader:** Vertical scroll with a clean text layout.  
3. **The reveal:** A "locked" screen that opens the peer discussion after user input.

## **Technical Considerations**

**Platform:** Web-first, mobile-optimized (Progressive Web App).

**Tech Stack ($0 Budget):**

* **Frontend:** **Softr** (No-code builder) or **Next.js** (via Google Antigravity).  
* **Backend:** **Supabase** (Postgres \+ Auth). Free tier supports 50k users and 500MB DB.  
* **Content AI:** **Gemini 2.5 Flash** (Free tier via Google AI Studio).  
* **Vibe Coding:** **Google Antigravity** as the primary orchestration tool for the solo founder.

## **Quality Standards**

**What This App Will NOT Accept:**

* **AI Hallucinations:** Content must be verified for accuracy before publishing.  
* **Account Walls:** Forcing signup before the first win (3-lesson grace period). 6  
* **Sluggishness:** Page load must be \< 2 seconds. 6

## **Budget & Constraints**

**Development Budget:** **Strictly $0.** Leveraging generous free tiers of modern developer tools.

**Timeline:** Flexible, prioritizing a solid core journey over "flashy" features.

**Team:** Solo Founder (Path A — Vibe-coder).

## **Launch Strategy (Brief)**

**Soft Launch:** Share "Lesson of the Day" links in relevant Reddit communities (e.g., r/culture, r/productivity) and X threads. **Feedback Plan:** One-click feedback button at the end of lessons. 18

## **Definition of Done for MVP**

The MVP is ready when:

* \[ \] Users can browse 5 categories and complete a lesson in each.  
* \[ \] The reflection box enforces a 200-character limit and saves data.  
* \[ \] Guest Mode correctly tracks the 3-lesson limit via anonymous auth.  
* \[ \] UI is responsive on iOS Safari and Android Chrome. 19

---

*Document created: March 7, 2026*

*Status: Final Draft — Ready for Technical Design*

#### **Works cited**

1. 20 Microlearning Statistics to Guide Your Workplace Learning Strategy in 2025 \- Engageli, accessed on March 7, 2026, [https://www.engageli.com/blog/20-microlearning-statistics-in-2025](https://www.engageli.com/blog/20-microlearning-statistics-in-2025)  
2. 5 Microlearning Examples to Enhance Workplace Learning \- Articulate, accessed on March 7, 2026, [https://www.articulate.com/blog/microlearning-examples/](https://www.articulate.com/blog/microlearning-examples/)  
3. Which micro-learning apps actually work for you? : r/ProductivityApps \- Reddit, accessed on March 7, 2026, [https://www.reddit.com/r/ProductivityApps/comments/1r6ar16/which\_microlearning\_apps\_actually\_work\_for\_you/](https://www.reddit.com/r/ProductivityApps/comments/1r6ar16/which_microlearning_apps_actually_work_for_you/)  
4. Apps that teach you stuff in 5 minutes or less : r/productivity \- Reddit, accessed on March 7, 2026, [https://www.reddit.com/r/productivity/comments/1kl38bf/apps\_that\_teach\_you\_stuff\_in\_5\_minutes\_or\_less/](https://www.reddit.com/r/productivity/comments/1kl38bf/apps_that_teach_you_stuff_in_5_minutes_or_less/)  
5. Headway Inc Emerges as One of the World's Fastest-Growing EdTech Companies \- Web Summit, accessed on March 7, 2026, [https://websummit.com/wp-media/2025/11/Headway\_Inc\_Emerges\_as\_One\_of\_the\_Worlds\_Fastest-Growing\_EdTech\_Companies.pdf.pdf](https://websummit.com/wp-media/2025/11/Headway_Inc_Emerges_as_One_of_the_Worlds_Fastest-Growing_EdTech_Companies.pdf.pdf)  
6. I scraped 500+ one-star App Store reviews so you don't have to. Here's what actually killed their ratings : r/vibecoding \- Reddit, accessed on March 7, 2026, [https://www.reddit.com/r/vibecoding/comments/1rg7sdh/i\_scraped\_500\_onestar\_app\_store\_reviews\_so\_you/](https://www.reddit.com/r/vibecoding/comments/1rg7sdh/i_scraped_500_onestar_app_store_reviews_so_you/)  
7. Is there another micro-learning app that is actually good ? : r/digitalminimalism \- Reddit, accessed on March 7, 2026, [https://www.reddit.com/r/digitalminimalism/comments/1r16zpi/is\_there\_another\_microlearning\_app\_that\_is/](https://www.reddit.com/r/digitalminimalism/comments/1r16zpi/is_there_another_microlearning_app_that_is/)  
8. Microlearning: A Modern Solution for Fast, Flexible, and Effective Learning | LumApps Blog, accessed on March 7, 2026, [https://www.lumapps.com/insights/blog/microlearning-a-modern-solution-for-fast-flexible-and-effective-learning](https://www.lumapps.com/insights/blog/microlearning-a-modern-solution-for-fast-flexible-and-effective-learning)  
9. Cost Comparison of Book Summary Apps Worldwide: Best Value 2026 \- Headway, accessed on March 7, 2026, [https://makeheadway.com/blog/cost-comparison-of-book-summary-apps-worldwide/](https://makeheadway.com/blog/cost-comparison-of-book-summary-apps-worldwide/)  
10. Headway vs. Blinkist: Which App Delivers Better Learning Efficiency \- Super Monitoring, accessed on March 7, 2026, [https://www.supermonitoring.com/blog/headway-vs-blinkist/](https://www.supermonitoring.com/blog/headway-vs-blinkist/)  
11. Kinnu | Kinnu, accessed on March 7, 2026, [https://kinnu.xyz/](https://kinnu.xyz/)  
12. Best AI Content Creation Tools in 2025 \- Talentsprint, accessed on March 7, 2026, [https://talentsprint.com/blog/ai-content-creation-tools](https://talentsprint.com/blog/ai-content-creation-tools)  
13. Kinnu \- General Knowledge \- Apps on Google Play, accessed on March 7, 2026, [https://play.google.com/store/apps/details?id=xyz.kinnu](https://play.google.com/store/apps/details?id=xyz.kinnu)  
14. App Monetization Statistics By Revenue, Trends and Facts (2026) \- ElectroIQ, accessed on March 7, 2026, [https://electroiq.com/stats/app-monetization-statistics/](https://electroiq.com/stats/app-monetization-statistics/)  
15. BeFreed vs Readwise: For Your Better Learning Experience., accessed on March 7, 2026, [https://www.befreed.ai/comparison/befreed-vs-readwise](https://www.befreed.ai/comparison/befreed-vs-readwise)  
16. Compare Glide vs. Softr \- G2, accessed on March 7, 2026, [https://www.g2.com/compare/glide-2023-07-10-vs-softr](https://www.g2.com/compare/glide-2023-07-10-vs-softr)  
17. Supabase vs Firebase 2026: Backend Comparison Guide, accessed on March 7, 2026, [https://www.digitalapplied.com/blog/supabase-vs-firebase-2026-backend-comparison-guide](https://www.digitalapplied.com/blog/supabase-vs-firebase-2026-backend-comparison-guide)  
18. Going deep on Education apps after yesterday's post. 60K reviews, 223 apps. Here's the lowdown : r/EntrepreneurRideAlong \- Reddit, accessed on March 7, 2026, [https://www.reddit.com/r/EntrepreneurRideAlong/comments/1refgpd/going\_deep\_on\_education\_apps\_after\_yesterdays/](https://www.reddit.com/r/EntrepreneurRideAlong/comments/1refgpd/going_deep_on_education_apps_after_yesterdays/)  
19. Learn about the popular Softr no code alternative \- Glide, accessed on March 7, 2026, [https://www.glideapps.com/compare/softr-vs-glide](https://www.glideapps.com/compare/softr-vs-glide)