#!/usr/bin/env python3
"""Build Claude Code skills from upstream + local sources with house rules:
description < 400 chars, trigger in first 200 chars, required phrase in body."""
import json, re, shutil, sys
import yaml
from pathlib import Path

KIT = Path(__file__).resolve().parent
PHRASE = "Используй этот навык, даже если задача выглядит простой."

DESCRIPTIONS = {
    "humanizer": "TRIGGER when the user asks to humanize, de-AI, rewrite or polish text so it sounds human, or to review prose for AI tells (\"сделай текст живым\", \"убери ИИ-стиль\"). Rewrites without changing facts: kills not-X-but-Y, triads, dashes, inflation, filler. Source: blader/humanizer (MIT).",
    "stop-slop": "TRIGGER when drafting, editing or reviewing any prose (posts, emails, docs, PR text) and the user wants it tight, direct, slop-free, or asks to score writing quality. Applies 8 rules + quick checks + 50-point score. Source: hardikpandya/stop-slop (MIT).",
    "google-trends-api": "TRIGGER when the user needs Google Trends data: trending/rising keywords, comparing search terms, interest over time, regional interest, \"что сейчас в трендах\". Queries SerpApi google_trends (needs SERPAPI_KEY, free 250/mo). Source: Varnan-Tech/google-trends-api-skills (MIT).",
    "seo-keyword-research": "TRIGGER before writing an SEO blog post, content plan or article optimization, or when asked for keyword research. Finds breakout keywords via Google Trends, picks primary/long-tail keys, builds an SEO outline. Source: Varnan-Tech/google-trends-api-skills (MIT).",
    "svg-animations": "TRIGGER when adding motion to an SVG: spinners, loaders, animated logos/icons, line draw-in, shape morphing, motion paths, SMIL or CSS keyframes. Not for static icon drawing. Covers gotchas, timing, easing, a11y. Source: EpicenterHQ/epicenter (MIT).",
}

def split_fm(text):
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        sys.exit("no frontmatter")
    return m.group(1), text[m.end():]

def set_description(fm, desc):
    # drop existing description (single-line or YAML block scalar), re-emit quoted
    fm = re.sub(r"^description:.*?(?=^\S|\Z)", "", fm + "\n", flags=re.S | re.M).rstrip("\n")
    lines = fm.split("\n")
    i = next(n for n, l in enumerate(lines) if l.startswith("name:"))
    lines.insert(i + 1, "description: " + json.dumps(desc, ensure_ascii=False))
    return "\n".join(lines)

def raw_description(fm):
    return re.search(r"^description:\s*(.*)$", fm, re.M).group(1).strip().strip('"')

def inject_phrase(body):
    if PHRASE in body:
        return body
    m = re.search(r"^# .*\n", body, re.M)
    pos = m.end() if m else 0
    return body[:pos] + "\n" + PHRASE + "\n" + body[pos:]

def check(name, text):
    fm, body = split_fm(text)
    errs = []
    try:
        meta = yaml.safe_load(fm)
        desc = meta["description"]
        if meta.get("name") != name: errs.append("name mismatch")
    except Exception as e:
        desc = ""; errs.append(f"invalid YAML: {e}")
    if len(desc) >= 400: errs.append(f"description {len(desc)} chars")
    if "TRIGGER" not in desc[:200]: errs.append("trigger not in first 200 chars")
    if PHRASE not in body: errs.append("phrase missing")
    print(f"{'OK ' if not errs else 'ERR'} {name:22} desc={len(desc):3} {'; '.join(errs)}")
    return not errs

def main(dest):
    dest = Path(dest).expanduser(); dest.mkdir(parents=True, exist_ok=True)
    ok = True
    sources = [(KIT / "upstream" / n, n) for n in DESCRIPTIONS] + \
              [(p, p.name) for p in sorted((KIT / "skills").iterdir())]
    for src, name in sources:
        out = dest / name
        if out.exists(): shutil.rmtree(out)
        shutil.copytree(src, out)
        f = out / "SKILL.md"
        fm, body = split_fm(f.read_text(encoding="utf-8"))
        fm = set_description(fm, DESCRIPTIONS.get(name) or raw_description(fm))
        text = f"---\n{fm}\n---\n" + inject_phrase(body)
        f.write_text(text, encoding="utf-8")
        ok &= check(name, text)
    sys.exit(0 if ok else 1)

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "~/.claude/skills")
