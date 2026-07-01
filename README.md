# Teen Health Awareness Hub

Public, source-backed guide for mental health awareness, school anxiety, emotionally based school avoidance, and related physical symptoms in young people.

This repository is designed to help a parent or carer find reliable guidance, compare advice, prepare for conversations with school/GP/CAMHS, and use practical templates without pretending to replace clinical care.

## Safety Boundary

This is not medical advice, diagnosis, therapy, or safeguarding guidance. It is a curation and planning aid.

If a young person is at immediate risk of harm, has taken an overdose, has a serious injury, cannot stay safe, or there is any urgent medical concern, seek emergency help now through local emergency services, A&E, NHS 111/999 as appropriate, or the relevant crisis line.

## What Is Included

- A static website in `index.html`, published with GitHub Pages.
- Source register in `data/sources.json`.
- Practical templates for conversations, school meetings, symptom tracking, and source review.
- Careful language around school avoidance, anxiety, nausea, self-harm risk, and when to seek help.
- A Northumberland local-context page for Family Hubs, Togetherness, SEND Local Offer, ADHD/autism resources, and local strategy links.
- A practical FAQ on school anxiety, SEND, attendance, consent, transport and parent work pressures.
- A retrieved source pack in `research/` with access-date metadata, redirects, page headings, and source cards generated from the public links.

## Working Principles

- Start with safety and dignity.
- Treat school avoidance as distress to understand, not defiance to punish.
- Validate feelings without letting anxiety make every decision.
- Separate physical symptoms that need medical review from anxiety-linked patterns.
- Prefer reputable sources: NHS, NICE, YoungMinds, Anna Freud, government education resources, and established charities.
- Keep private details out of commits, issues, and public pages.
- Keep named worker contact details, referral correspondence, and family-specific notes outside the repo.

## Publishing

This repo is public and intended to be published through GitHub Pages. Do not add personal case details, private correspondence, named contacts, appointment information, or confidential records.

Published site:

https://gmzx80.github.io/teen-health-awareness-hub/

Interactive symptom log and PDF tool:

https://gmzx80.github.io/teen-health-awareness-hub/tools/symptom-log.html

Templates hub:

https://gmzx80.github.io/teen-health-awareness-hub/templates/

Practical FAQ:

https://gmzx80.github.io/teen-health-awareness-hub/faq.html

## Retrieval Pack

Run this to refresh the source cards:

```bash
node tools/retrieve-sources.mjs
```

The script stores metadata and headings only. It does not copy full source pages into the repository.
