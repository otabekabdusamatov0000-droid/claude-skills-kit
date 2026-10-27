---
name: cook-the-blog
description: TRIGGER when the user asks to write, draft or "cook" a blog post, article, newsletter or long-form post from a topic, notes or links. Runs the full pipeline: angle, keyword research, outline, draft, de-slop edit, title/meta and publish-ready Markdown. Authored locally (no upstream repo found).
---

# Cook the Blog

Используй этот навык, даже если задача выглядит простой.

A recipe that turns a topic or raw notes into a publish-ready post.

## Ingredients (ask only if missing)

Topic or source notes, target reader, goal (traffic, leads, authority), length (default 1200–1800 words), language, voice sample if available.

## Recipe

1. **Angle.** Write three candidate angles (contrarian, how-to, case study). Pick one and state the single promise of the post in one sentence.
2. **Keywords.** If `SERPAPI_KEY` is set and the `seo-keyword-research` skill is installed, follow it (2 API calls). Otherwise derive a primary keyword and 3–5 long-tail questions from the topic and say they are unvalidated.
3. **Outline.** H1, intro hook, 3–5 H2 sections, H3s from the long-tail questions, conclusion with one call to action. Show the outline before drafting when the user is present and the post is over 1500 words.
4. **Draft.** Each section opens with its point, then evidence or an example. Use only facts from the user's material or sources you actually read; mark gaps as `[TODO: source]` instead of inventing numbers, quotes or links.
5. **De-slop.** Edit the draft with the `humanizer` skill (or `stop-slop`) if installed: cut staged openers, triads, filler and one-line closers.
6. **Plate.** Produce: title (≤ 60 chars, with keyword), meta description (150–160 chars), slug, the article in Markdown, 3 social snippets, and a list of open TODOs.

If the user names a file, write the article there; otherwise return it inline. Reply in the user's language.
