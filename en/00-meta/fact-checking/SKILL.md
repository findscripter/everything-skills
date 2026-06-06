---
name: fact-checking
title: Fact-Checking
description: Verify whether a claim, statistic, date, quote, or attribution is true and reliable; assess source credibility and catch hallucinations, misattributions, and fabricated citations. Triggers: fact-check, verify, debunk, source credibility, true or false.
domain: 通用/research
triggers: [fact-check, verify, debunk, source credibility, true or false, is this claim accurate, cross-check sources, detect misinformation, hallucinated citation, misattribution]
tags: [research, verification, sources]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [entity-research-dossier, news-sentiment-briefing, notebooklm-source-grounded-qa, citation-management]
combines_with: [entity-research-dossier, citation-management]
license: CC-BY-SA-4.0
source: 
source_license: 
---
## When to use

- You need to verify whether a claim, statistic, date, person, event, or quote is real and accurate.
- You need to assess the credibility of an information source (primary vs. secondary, authority, conflict of interest, recency).
- You suspect the content contains hallucinations, misattribution, inflated numbers, fabricated quotes, or wrong attribution.
- You want to cross-validate the key facts before shipping a report or conclusion.

Do NOT use this skill for:

- Subjective opinions, value judgments, aesthetic preferences, or predictions about the future — these are not falsifiable and are out of scope for fact-checking.
- Pure computation or logical-deduction problems — reason it out instead of "verifying" it; routing these here only slows you down.
- Content explicitly labeled as fictional, hypothetical, or illustrative.
- When you have no internet access and no local evidence to check against — mark it "Unverifiable" directly; never assume it is true.

## Steps

```
1. Atomize the claim
   - Break the content into the smallest verifiable units: subject + predicate + number/date/place.
   - When one sentence packs several facts, split them and check each separately.
   - Tag each unit by type: [DATA] [QUOTE] [EVENT] [ATTRIBUTION] [DEFINITION].

2. Frame the verification question
   - For each unit, write a question that evidence can confirm or refute.
   - Prioritize: high-risk and error-prone facts (specific numbers/dates/names) and the key premises the conclusion depends on.

3. Gather evidence (primary first)
   - Source priority: primary/original > authoritative body / peer-reviewed > mainstream secondary > personal/anonymous.
   - Cross-confirm with at least 2 mutually independent sources; independent = different origin — a reprint of the same wire story does NOT count as independent.
   - For quote claims, trace back to the original source and compare word-for-word; confirm it is not taken out of context.
   - For data claims, check that the metric definition, unit, time range, and statistical subject all match.

4. Assess source credibility (score each source)
   - Dimensions: authority / how primary it is / recency / conflict of interest / traceability.
   - When sources conflict, lean toward the more primary, more authoritative, and more recent one; record the disagreement.

5. Adjudicate and label
   - Give each unit a verdict: [TRUE] / [PARTLY TRUE] / [FALSE] / [MISLEADING] / [UNVERIFIABLE].
   - For [PARTLY TRUE] / [MISLEADING], explain which part is right and which part is off.
   - Attach an evidence chain: source + key excerpt + link/locator.

6. Screen for common distortions (targeted checks)
   - Misattribution: person/organization/time/place mismatched.
   - Hallucinated citation: a quote, reference, or figure that looks specific but cannot be found anywhere → mark [UNVERIFIABLE] or [FALSE].
   - Number drift: confused magnitude, units, or percent vs. percentage points.
   - Stale-as-true: was once correct but has since been updated or overturned.

7. Output
   - For each unit, give the verdict, a confidence level, and the evidence chain; preserve uncertainty and do not force a conclusion.
```

## Example

Minimal fact-check prompt:

```
Fact-check the following text unit by unit:
"<original claim>"
Requirements:
1. Atomize into smallest verifiable units and tag each by type;
2. Gather evidence for each unit independently, with at least 2 independent sources;
   quotes must be traced back to the original and compared word-for-word;
3. Adjudicate [TRUE / PARTLY TRUE / FALSE / MISLEADING / UNVERIFIABLE]
   + confidence + evidence chain (source / excerpt / link);
4. Run targeted screens for misattribution, fabricated quotes, number drift, stale info;
5. When there is no evidence, mark [UNVERIFIABLE] — never speculate.
```

Sample output fragment:

```
Unit 1 [DATA] "X grew revenue 35% in 2024"
  Verdict: FALSE (high confidence)
  Evidence: official annual report p.12 — actual YoY growth was 13% (metric: total revenue).
            Source A [annual report pdf] agrees with Source B [regulatory filing].
  Distortion type: number drift (35% vs. 13%).

Unit 2 [QUOTE] "Person Y said '...'"
  Verdict: UNVERIFIABLE
  Evidence: a search of primary speeches/writings found no such wording;
            secondary retellings cite no source. Recommend not relying on it.
```

## Notes

- Not falsifiable means not checkable: separate "statements of fact" from "opinions/predictions"; for the latter, only assess the quality of the supporting argument.
- Independent sources != multiple links: the same press release republished by many outlets is still a single source.
- Quotes must go back to the original; comparing from memory invites a second layer of hallucination.
- Distinguish "no evidence to support" from "evidence to refute": the former is [UNVERIFIABLE], only the latter is [FALSE].
- Mind recency: check the publication date of the evidence itself; do not adjudicate a present-day fact with a stale source.
- Preserve uncertainty: better to mark [UNVERIFIABLE] than to manufacture a false sense of certainty.
- Beware confirmation bias: actively seek disconfirming evidence instead of only retrieving sources that support the existing conclusion.
- Web sources can be polluted or copy each other's errors — AI-generated content especially so; favor authoritative primary sources.

## See also

- related: first-principles-thinking (judge from first principles whether a claim is plausible and locate the key premise most worth checking first).
- related: entity-research-dossier, citation-management — combine with these for deeper source gathering and reference tracking.
