# Privacy model

## Default behavior

The product is privacy-first for divination inputs.

- The browser does not store consultation records in `localStorage`.
- The browser does not store wishes, incense counts, names, birthdays, places, questions, boards, or AI readings locally.
- The frontend does not automatically create Cloudflare D1 consultation records after an AI reading finishes.
- Generated results live only in the current page state unless a future explicit user action stores or shares them.

## Remote APIs

The Cloudflare Pages Functions still expose consultation APIs for future explicit save/share flows:

- `POST /api/consultations`
- `GET /api/consultations/:id`

These APIs must not be called automatically from normal question submission. Any future use must be tied to an explicit user action such as "Save result" or "Create share link", and the UI must clearly explain that the result will be stored remotely.

## Current frontend policy

- `/divine/:skill` calls only the chart calculation API and the AI reading stream during normal use.
- `/tools/:tool` keeps helper-tool results in memory only.
- The "recent records" UI has been removed.
- The "my records" rail entry has been removed from the main pages.

## Verification checklist

- `rg "localStorage|qk_recent_records|qk_incense|qk_wish|最近记录|我的记录" frontend/src` should not find active storage or record UI.
- `rg "persistConsultation|createConsultationRecord" frontend/src/views` should not find automatic persistence calls.
- Browser verification should confirm no `qk_` keys appear in `localStorage` after using divination and tool pages.
