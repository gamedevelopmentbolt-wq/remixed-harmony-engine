export type PromptCategory =
  | "chatgpt-productivity"
  | "writing"
  | "coding"
  | "business-marketing"
  | "image-midjourney"
  | "image-dalle"
  | "viral-trending";

export interface AiPrompt {
  id: string;
  title: string;
  category: PromptCategory;
  description: string;
  prompt: string;
  tags?: string[];
}

export const promptCategories: { id: PromptCategory; label: string; blurb: string }[] = [
  { id: "chatgpt-productivity", label: "ChatGPT Productivity", blurb: "Save hours on email, meetings, planning and research." },
  { id: "writing", label: "Writing & Content", blurb: "Blog posts, hooks, rewrites, summaries and outlines." },
  { id: "coding", label: "Coding & Dev", blurb: "Debug, refactor, explain, and generate boilerplate." },
  { id: "business-marketing", label: "Business & Marketing", blurb: "Ads, landing pages, funnels, sales copy and SEO." },
  { id: "image-midjourney", label: "Midjourney", blurb: "Ready-to-paste Midjourney v6 / niji prompts." },
  { id: "image-dalle", label: "DALL·E / Image Gen", blurb: "Natural-language prompts for DALL·E, SDXL and Flux." },
  { id: "viral-trending", label: "Viral & Trending", blurb: "Prompt formats going viral on X, TikTok and Reddit right now." },
];

export const aiPrompts: AiPrompt[] = [
  // -------- ChatGPT productivity --------
  {
    id: "second-brain",
    title: "Turn ChatGPT into your second brain",
    category: "chatgpt-productivity",
    description: "Make ChatGPT ask you questions and organize your thoughts into a structured note.",
    prompt:
      "Act as my second brain. I will describe a topic, project, or problem in a messy stream of thought. Ask me 5 clarifying questions one at a time. After I answer, output a structured note with: Summary, Key Points (bullets), Open Questions, Next Actions, and Tags. Keep it under 300 words.",
    tags: ["notes", "thinking"],
  },
  {
    id: "email-shorter",
    title: "Rewrite any email to be shorter and clearer",
    category: "chatgpt-productivity",
    description: "Paste any email — get a version that's 40% shorter and easier to reply to.",
    prompt:
      "Rewrite the email below so it is 40% shorter, in a warm but direct tone, with a single clear ask at the end. Preserve all facts and dates. Return only the rewritten email.\n\nEmail:\n\"\"\"\n[PASTE EMAIL HERE]\n\"\"\"",
  },
  {
    id: "meeting-notes",
    title: "Summarize a meeting transcript into action items",
    category: "chatgpt-productivity",
    description: "Turn a messy transcript into decisions, action items and owners.",
    prompt:
      "You are a meticulous chief of staff. Given the meeting transcript below, produce:\n1. TL;DR (max 3 sentences)\n2. Decisions Made (bullets)\n3. Action Items as a table: Task | Owner | Due Date\n4. Open Questions\n5. Follow-up email draft to attendees\n\nTranscript:\n\"\"\"\n[PASTE TRANSCRIPT]\n\"\"\"",
  },
  {
    id: "explain-eli5",
    title: "Explain anything like I'm 5, then like I'm 25",
    category: "chatgpt-productivity",
    description: "Two-level explanation for learning fast.",
    prompt:
      "Explain [TOPIC] twice. First: 'ELI5' — 3 short paragraphs a curious 5-year-old could follow, with one concrete analogy. Then: 'For a smart adult' — 3 paragraphs with correct terminology, the underlying mechanism, and one common misconception.",
  },
  {
    id: "life-coach",
    title: "Weekly life-coach check-in",
    category: "chatgpt-productivity",
    description: "A structured weekly review that asks the right questions.",
    prompt:
      "Act as a no-nonsense life coach. Run a weekly review with me. Ask, one at a time: What went well? What didn't? What did I avoid? What's one thing I want to focus on next week? After I answer all four, give me a 5-bullet action plan and one honest observation about a pattern you noticed.",
  },
  {
    id: "learn-plan",
    title: "30-day self-study plan for any skill",
    category: "chatgpt-productivity",
    description: "A daily curriculum with resources and a weekly project.",
    prompt:
      "Design a 30-day self-study plan for [SKILL]. Assume I have 45 minutes per day. Output a day-by-day table with: Day | Focus | 1 free resource | 15-min exercise. End each week with a small project I can share publicly. Format as Markdown.",
  },
  {
    id: "decision-maker",
    title: "Decision-making framework prompt",
    category: "chatgpt-productivity",
    description: "Weigh options with a rigorous, unbiased framework.",
    prompt:
      "I need to decide between the following options: [OPTION A] vs [OPTION B]. Walk me through a structured decision using: (1) my goals, which you'll ask me to state, (2) 5 evaluation criteria you propose, (3) a weighted score table, (4) reversible vs irreversible analysis, (5) a final recommendation with the single strongest counter-argument.",
  },

  // -------- Writing & content --------
  {
    id: "blog-outline",
    title: "SEO blog post outline that actually ranks",
    category: "writing",
    description: "Search-intent-driven outline with H2/H3s and FAQ.",
    prompt:
      "Create an SEO blog post outline for the keyword: \"[KEYWORD]\". First identify the search intent (informational / commercial / transactional). Then output: proposed title (under 60 chars), meta description (under 155 chars), H2s and H3s covering all sub-topics ranking on page 1, a FAQ section with 5 questions, and internal-link ideas. Keep it skimmable.",
    tags: ["seo", "blog"],
  },
  {
    id: "hook-generator",
    title: "10 scroll-stopping hooks for any topic",
    category: "writing",
    description: "Hooks for X/Twitter, LinkedIn, TikTok and newsletters.",
    prompt:
      "Give me 10 scroll-stopping opening hooks about [TOPIC]. Mix these formats: contrarian take, curiosity gap, bold stat, personal story starter, list promise, mistake reveal, question, before/after, prediction, and 'nobody's talking about'. Each hook must be under 20 words.",
  },
  {
    id: "rewrite-tone",
    title: "Rewrite text in any tone or style",
    category: "writing",
    description: "Match the voice of any author, brand, or style.",
    prompt:
      "Rewrite the text below in the tone of [AUTHOR/BRAND — e.g. Paul Graham, Apple, Wes Anderson]. Preserve every fact. Match: sentence length, rhythm, vocabulary and punctuation quirks. Return only the rewritten version.\n\nText:\n\"\"\"\n[PASTE TEXT]\n\"\"\"",
  },
  {
    id: "summarize-long",
    title: "Summarize a long article in 3 layers",
    category: "writing",
    description: "One-liner, TL;DR, and detailed summary in one pass.",
    prompt:
      "Summarize the article below in three layers:\n• 1-sentence summary\n• TL;DR (5 bullets)\n• Detailed summary with headings for each major section\n\nAt the end, list 3 counter-arguments the author didn't address.\n\nArticle:\n\"\"\"\n[PASTE ARTICLE]\n\"\"\"",
  },
  {
    id: "twitter-thread",
    title: "Turn any idea into a viral X/Twitter thread",
    category: "writing",
    description: "Hook, 8-tweet body, and CTA — ready to schedule.",
    prompt:
      "Turn the idea below into a 10-tweet thread. Tweet 1 must be a scroll-stopping hook under 240 chars. Tweets 2–9 deliver one insight each with a short example. Tweet 10 is a CTA. Use short lines, plenty of white space, and no hashtags.\n\nIdea: [YOUR IDEA]",
  },
  {
    id: "cold-email",
    title: "Cold email that gets replies",
    category: "writing",
    description: "Personalized, honest, and 90 words or less.",
    prompt:
      "Write a cold email from me ([YOUR ROLE] at [YOUR COMPANY]) to [PROSPECT NAME], [PROSPECT ROLE] at [THEIR COMPANY]. Goal: [OFFER OR ASK]. Rules: max 90 words, one specific observation about their company, one clear ask, no fake compliments, no 'hope this finds you well'. Provide 3 subject line options.",
  },
  {
    id: "book-notes",
    title: "Extract the best ideas from any book",
    category: "writing",
    description: "Big ideas, quotes and a personal reading list.",
    prompt:
      "For the book \"[TITLE]\" by [AUTHOR], give me: (1) 5 big ideas, one paragraph each, (2) 3 direct quotes worth remembering, (3) how the ideas connect to [MY SITUATION], (4) 3 further books someone who loved this should read next.",
  },

  // -------- Coding & dev --------
  {
    id: "code-explain",
    title: "Explain any code line-by-line",
    category: "coding",
    description: "Great for reading unfamiliar codebases.",
    prompt:
      "Explain the code below to a mid-level developer. First: 2-sentence high-level summary. Then: annotated line-by-line explanation. Then: a list of possible bugs, edge cases, and how you'd test it.\n\n```\n[PASTE CODE]\n```",
  },
  {
    id: "refactor-clean",
    title: "Refactor messy code with reasoning",
    category: "coding",
    description: "Cleaner version with a diff-style rationale.",
    prompt:
      "Refactor the code below for readability and correctness. Requirements: keep the public API identical, no new dependencies, add types where missing. Output:\n1. The refactored code in one block.\n2. A bulleted 'what changed and why' section.\n3. Any bugs you fixed along the way.\n\n```\n[PASTE CODE]\n```",
  },
  {
    id: "debug-error",
    title: "Debug an error like a senior engineer",
    category: "coding",
    description: "Root cause, fix, and prevention — not just a patch.",
    prompt:
      "I'm getting this error:\n\n```\n[PASTE ERROR / STACK TRACE]\n```\n\nRelevant code:\n```\n[PASTE CODE]\n```\n\nWalk me through: (1) what the error actually means, (2) 3 most likely root causes ranked by probability, (3) how to confirm each, (4) the minimal fix, (5) how to prevent this class of bug in future.",
  },
  {
    id: "regex-builder",
    title: "Build & explain a regex from plain English",
    category: "coding",
    description: "With test cases you can paste into a regex tester.",
    prompt:
      "I need a regex that matches: [DESCRIBE IN PLAIN ENGLISH]. Provide: (1) the pattern in JavaScript flavor, (2) a plain-English breakdown of every group, (3) 5 strings it should match, (4) 5 strings it must NOT match, (5) an equivalent Python-flavor pattern.",
  },
  {
    id: "sql-from-english",
    title: "SQL query from plain English",
    category: "coding",
    description: "Includes schema questions and explains the plan.",
    prompt:
      "I want to answer this question with SQL: \"[QUESTION]\". My tables and columns: [PASTE SCHEMA]. First ask me any missing questions. Then produce: (1) the SQL query (Postgres flavor), (2) an English walkthrough of what each clause does, (3) an EXPLAIN-style note on likely performance issues.",
  },
  {
    id: "unit-tests",
    title: "Generate unit tests for any function",
    category: "coding",
    description: "Happy path, edge cases, and failure modes.",
    prompt:
      "Write comprehensive unit tests for the function below using [TEST FRAMEWORK — e.g. Vitest / Jest / Pytest]. Cover: happy path, boundary values, invalid inputs, and the top 3 failure modes. Use descriptive test names in the 'it should …' style.\n\n```\n[PASTE FUNCTION]\n```",
  },
  {
    id: "commit-message",
    title: "Perfect conventional commit message",
    category: "coding",
    description: "Follows conventional-commits, with body and footer.",
    prompt:
      "Given this git diff, write a Conventional Commit message. Include type(scope): subject (max 72 chars), a body explaining the 'why', and a footer with BREAKING CHANGE / refs if relevant.\n\nDiff:\n```\n[PASTE DIFF]\n```",
  },

  // -------- Business & marketing --------
  {
    id: "landing-page",
    title: "High-converting landing page copy",
    category: "business-marketing",
    description: "Hero, benefits, objections, social proof, CTA.",
    prompt:
      "Write landing page copy for [PRODUCT], which helps [AUDIENCE] achieve [OUTCOME]. Sections:\n1. Hero: headline, sub-headline, primary CTA.\n2. 3 benefit blocks (headline + 2 sentences each).\n3. 'How it works' in 3 steps.\n4. Objection-handling FAQ (5 items).\n5. Testimonial placeholders (3).\n6. Final CTA.\n\nTone: [TONE]. Read at a 7th-grade level.",
  },
  {
    id: "google-ad-copy",
    title: "10 Google Ads variants for A/B testing",
    category: "business-marketing",
    description: "Headline + description sets ready for Google Ads.",
    prompt:
      "Generate 10 Google Search Ad variants for [PRODUCT/OFFER]. For each: 3 headlines (max 30 chars each) and 2 descriptions (max 90 chars each). Mix angles: benefit, urgency, price, social proof, question, guarantee. Avoid superlatives that break Google's policies.",
  },
  {
    id: "seo-keywords",
    title: "Keyword cluster around a seed keyword",
    category: "business-marketing",
    description: "Grouped by intent, with a content plan.",
    prompt:
      "For the seed keyword \"[KEYWORD]\", generate a keyword cluster organized by search intent (informational, commercial, transactional, navigational). For each cluster: 5–8 keyword ideas, the best content format (blog / comparison / landing page / tool), and a suggested title. Present as a Markdown table.",
  },
  {
    id: "customer-persona",
    title: "Build a data-rich customer persona",
    category: "business-marketing",
    description: "Goals, pains, objections, and where they hang out.",
    prompt:
      "Build a customer persona for [PRODUCT]. Include: demographic snapshot, job/role, daily workflow, top 3 goals, top 3 pains, main objections to buying, where they discover new tools (channels), 5 direct quotes I might hear in a discovery call, and 3 competing solutions they probably use today.",
  },
  {
    id: "sales-page-vsl",
    title: "Video sales letter (VSL) script",
    category: "business-marketing",
    description: "Classic problem→agitate→solve→CTA structure.",
    prompt:
      "Write a 5-minute video sales letter script for [PRODUCT]. Structure: hook (15s), problem (60s), agitate (45s), introduce solution (60s), how it works (60s), proof (30s), offer + guarantee (45s), close + CTA (15s). Conversational, one idea per sentence, no jargon.",
  },
  {
    id: "brand-voice",
    title: "Define a brand voice guide from examples",
    category: "business-marketing",
    description: "Turn 3 sample texts into a reusable voice doc.",
    prompt:
      "Below are three pieces of copy from my brand. Reverse-engineer a brand voice guide. Include: 3 voice attributes (adjective + description), 3 'we say / we don't say' pairs, vocabulary rules, punctuation and formatting quirks, and one example rewrite of a boring sentence in-voice.\n\nSample 1: [PASTE]\nSample 2: [PASTE]\nSample 3: [PASTE]",
  },
  {
    id: "linkedin-post",
    title: "LinkedIn post that gets shared",
    category: "business-marketing",
    description: "Story-driven, whitespace-heavy, no cringe.",
    prompt:
      "Write a LinkedIn post about [INSIGHT / STORY]. Requirements: strong 1-line hook, short lines with white space, no emojis, one specific lesson, and a final line that invites replies. Max 220 words. Avoid the phrases 'thrilled to announce', 'game changer', 'humbled'.",
  },

  // -------- Midjourney --------
  {
    id: "mj-cinematic-portrait",
    title: "Cinematic portrait (Midjourney v6)",
    category: "image-midjourney",
    description: "Moody film-still portrait with anamorphic lens feel.",
    prompt:
      "cinematic portrait of [SUBJECT], soft rembrandt lighting, shallow depth of field, shot on Arri Alexa 65 with anamorphic lens, muted teal and amber palette, subtle film grain, skin texture visible, natural fabric detail --ar 4:5 --style raw --v 6",
  },
  {
    id: "mj-product-shot",
    title: "Studio product photography",
    category: "image-midjourney",
    description: "Clean commercial product shot on seamless backdrop.",
    prompt:
      "hyper-realistic product photography of [PRODUCT], seamless off-white paper backdrop, soft key light from top-left, subtle reflection on glossy surface, sharp focus, commercial catalog style, 85mm macro lens, ultra detailed, 8k --ar 1:1 --style raw --v 6",
  },
  {
    id: "mj-logo-flat",
    title: "Minimal flat vector logo",
    category: "image-midjourney",
    description: "Clean logo mark for a modern startup.",
    prompt:
      "minimalist flat vector logo of [CONCEPT], geometric shapes, two-color palette (deep navy and warm cream), clean negative space, centered on white background, no text, no gradients, no shadows --ar 1:1 --v 6",
  },
  {
    id: "mj-fantasy-landscape",
    title: "Epic fantasy landscape",
    category: "image-midjourney",
    description: "Wide painterly fantasy vista.",
    prompt:
      "epic fantasy landscape of [LOCATION], towering mountains, glowing bioluminescent forest, misty valleys, dramatic god rays, painted by Greg Rutkowski and Craig Mullins, matte painting, hyper detailed, cinematic composition --ar 21:9 --v 6",
  },
  {
    id: "mj-anime-niji",
    title: "Anime character (Niji v6)",
    category: "image-midjourney",
    description: "Studio-quality anime portrait with clean lineart.",
    prompt:
      "anime portrait of [CHARACTER], expressive eyes, soft cel shading, clean lineart, pastel color palette, subtle bloom, cherry blossom background, studio ghibli meets modern shounen style --ar 3:4 --niji 6",
  },
  {
    id: "mj-isometric-room",
    title: "Cozy isometric room illustration",
    category: "image-midjourney",
    description: "Warm, detailed miniature-room scene.",
    prompt:
      "cozy isometric [ROOM TYPE], warm ambient lighting, plants, books, coffee, tiny details, soft pastel palette, 3d render, blender style, ultra detailed, centered composition --ar 1:1 --v 6",
  },
  {
    id: "mj-street-photography",
    title: "Golden-hour street photography",
    category: "image-midjourney",
    description: "Candid documentary-style street shot.",
    prompt:
      "candid street photography in [CITY], golden hour light, long shadows, 35mm lens, Kodak Portra 400 film emulation, subtle grain, unposed subject, storytelling composition, layered background --ar 3:2 --style raw --v 6",
  },
  {
    id: "mj-scifi-concept",
    title: "Sci-fi concept art",
    category: "image-midjourney",
    description: "Painterly concept sheet for a sci-fi setting.",
    prompt:
      "sci-fi concept art of [SUBJECT], massive scale, atmospheric fog, volumetric lighting, gritty industrial detail, in the style of Syd Mead and Simon Stålenhag, cinematic wide shot --ar 16:9 --v 6",
  },

  // -------- DALL·E / image gen --------
  {
    id: "dalle-icon-set",
    title: "Consistent icon set (DALL·E / SDXL)",
    category: "image-dalle",
    description: "Matching flat icons in one visual style.",
    prompt:
      "A set of 9 flat vector icons on a plain white background, all in the same style: rounded corners, two-tone palette (soft blue and warm coral), thin uniform strokes, subtle inner shadow. Icons: [LIST 9 CONCEPTS]. Arrange in a 3x3 grid, evenly spaced.",
  },
  {
    id: "dalle-book-cover",
    title: "Modern non-fiction book cover",
    category: "image-dalle",
    description: "Clean typographic book cover mockup.",
    prompt:
      "A modern non-fiction book cover titled \"[TITLE]\" with subtitle \"[SUBTITLE]\". Bold sans-serif typography centered, abstract geometric background using [2 COLORS], author name at bottom, clean minimalist layout, professional publisher quality, hardcover mockup on a neutral surface.",
  },
  {
    id: "dalle-blog-hero",
    title: "Blog post hero image",
    category: "image-dalle",
    description: "Editorial-style illustration for an article header.",
    prompt:
      "Editorial illustration for a blog post about [TOPIC]. Flat vector style with subtle textures, warm limited color palette, one clear focal metaphor, plenty of empty space in the top-left for headline text, no lettering in the image itself. 16:9 aspect ratio.",
  },
  {
    id: "dalle-thumbnail",
    title: "YouTube thumbnail concept",
    category: "image-dalle",
    description: "High-contrast, high-CTR thumbnail composition.",
    prompt:
      "A YouTube thumbnail concept for a video titled \"[TITLE]\". High contrast, saturated colors, a surprised person on the left third, one bold prop or symbol on the right third, big empty area at top for 4-word overlay text (do not render text). Cinematic depth of field, punchy lighting.",
  },
  {
    id: "dalle-avatar",
    title: "Stylized profile avatar",
    category: "image-dalle",
    description: "Personal avatar with a specific illustration style.",
    prompt:
      "A stylized digital avatar of [DESCRIBE PERSON — hair, features, vibe], illustrated in a modern flat style with soft gradients and clean linework. Warm pastel background, centered head-and-shoulders framing, friendly expression, subtle rim light.",
  },
  {
    id: "dalle-tshirt",
    title: "T-shirt graphic design",
    category: "image-dalle",
    description: "Print-ready, bold graphic on transparent background.",
    prompt:
      "A bold t-shirt graphic about [THEME]. Retro screen-print style, 3-color palette, thick outlines, halftone shading, centered composition on a transparent background, no additional props or borders, high resolution suitable for DTG printing.",
  },

  // -------- Viral & trending prompt formats --------
  {
    id: "viral-roast-me",
    title: "Brutally honest 'roast my …'",
    category: "viral-trending",
    description: "The 'roast my resume / portfolio / product' trend.",
    prompt:
      "Brutally roast my [RESUME / LANDING PAGE / TWEET / PRODUCT] below. Be specific, funny, and mean but fair. Then, at the end, tell me the 3 things that would actually make it better. Don't be nice — I asked for the roast.\n\n\"\"\"\n[PASTE]\n\"\"\"",
  },
  {
    id: "viral-red-team",
    title: "Red-team my idea",
    category: "viral-trending",
    description: "Adversarial critique of any plan or product.",
    prompt:
      "You are a red team hired to destroy my idea below. List the 10 strongest reasons this will fail, ranked by likelihood. For each, describe the specific scenario and the earliest warning sign. Then propose the single change that would blunt the top 3 risks.\n\nIdea: [DESCRIBE]",
  },
  {
    id: "viral-so-what",
    title: "The infinite 'so what?' interrogator",
    category: "viral-trending",
    description: "Drills into any idea until it hits real value.",
    prompt:
      "I'll state an idea. Ask me 'so what?' seven times in a row, each time based on my previous answer. After the 7th answer, summarize what the idea is really about and whether it's worth pursuing.\n\nIdea: [YOUR IDEA]",
  },
  {
    id: "viral-6yo-teacher",
    title: "Teach it to me like a curious 6-year-old",
    category: "viral-trending",
    description: "The viral 'explain like I'm 6, then quiz me' format.",
    prompt:
      "Explain [TOPIC] to me like I'm a curious 6-year-old, using tiny words and one concrete example. Then ask me 3 simple questions to check I understood. Then re-explain any part I got wrong, still in kid-language.",
  },
  {
    id: "viral-personal-mba",
    title: "Personal MBA in one prompt",
    category: "viral-trending",
    description: "Trending 'condense a whole field into a curriculum'.",
    prompt:
      "Act as a professor. Design a self-taught mini-MBA in [FIELD] I can finish in 12 weeks at 5 hours/week. For each week: topic, 1 must-read (free), 1 optional book, 1 real-world exercise. End with a capstone project brief and how to evaluate it myself.",
  },
  {
    id: "viral-perspective",
    title: "Three experts, one problem",
    category: "viral-trending",
    description: "Simulate a panel debate across disciplines.",
    prompt:
      "Simulate a panel discussion between [EXPERT 1], [EXPERT 2] and [EXPERT 3] about my problem: [PROBLEM]. Each speaks in-character with their known worldview. They challenge each other. After 3 rounds, give me a synthesized recommendation.",
  },
  {
    id: "viral-worst-advice",
    title: "'Give me the worst advice possible'",
    category: "viral-trending",
    description: "Reverse-brainstorm: find the trap by inverting it.",
    prompt:
      "Give me the worst possible advice for [GOAL / SITUATION]. Be creative and specific — 10 pieces of terrible advice a real person might actually follow. Then invert each one to derive the actual smart move.",
  },
  {
    id: "viral-future-self",
    title: "Letter from your future self",
    category: "viral-trending",
    description: "Reflective prompt that's trending on TikTok and Reddit.",
    prompt:
      "Write a letter from my future self (5 years from now) to me today. I'm currently: [DESCRIBE YOURSELF, GOALS, FEARS]. The letter should describe what changed, the one habit that mattered most, the thing I worried about that didn't matter, and one warning. Warm, specific, no clichés.",
  },
  {
    id: "viral-book-in-day",
    title: "Turn a whole book into a 1-day workshop",
    category: "viral-trending",
    description: "The 'implement, don't just read' trend.",
    prompt:
      "Turn the book \"[TITLE]\" into a 1-day self-workshop I can run alone. Morning: key ideas (with page refs if possible). Midday: 3 exercises applying the ideas to my situation ([DESCRIBE]). Afternoon: a written reflection template. Evening: a 1-page personal action plan.",
  },
];
