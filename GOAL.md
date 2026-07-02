# UI Design System Goal

## Task

Redesign the Yule Suangua frontend into a production-grade UI system inspired by the provided reference board, with a blended visual direction:

- Retro: paper texture, seal red, old gold, serif rhythm, restrained borders.
- Technology: geometric grids, luminous tracks, precise controls, data panels.
- Youth: lighter spacing, clear calls to action, approachable cards, mobile-first flows.
- Nature: ink mountains, bamboo/leaf motifs, jade green, soft air and water gradients.

The implementation must cover the actual app screens, not just a static mockup:

- Web home page.
- Mobile home layout.
- Divination/chat workflow page.
- Card patterns.
- Form controls.
- Buttons and states.
- Reusable visual tokens and component classes.

## Success Criteria

- App builds with `npm run build`.
- Main pages render without broken Chinese text or malformed template syntax.
- UI tokens are centralized enough for future reuse.
- Desktop and mobile layouts are responsive and usable.
- Buttons, forms, cards, badges, nav, empty/loading/error states share one coherent design language.
- No Obsidian sync is performed unless the user explicitly asks for sync.
- Project work is kept on E drive; final exported artifacts, if any, can be copied to the Codex outputs directory only when needed.

## Architecture Direction

- Keep the current Vue 3 + Vite stack.
- Avoid introducing a large UI library; implement a focused app-specific design system in CSS and Vue views.
- Use CSS custom properties for color, spacing, radius, typography, shadows, and motion.
- Use semantic component classes such as `.ds-button`, `.ds-card`, `.ds-field`, `.ds-badge`, `.oracle-shell`.
- Preserve existing API integration points in `src/api/divine.js`.
- Make backend offline mode graceful so the frontend can still be reviewed locally.

## Progress Log

### 2026-07-02

- Cloned `zaz52/yulesuangua` to `E:\CodexWork\yulesuangua-ui\yulesuangua` to avoid putting project work on C drive.
- Identified frontend stack: Vue 3, Vite, vue-router.
- Found two main screens: `src/views/Home.vue` and `src/views/Divine.vue`.
- Risk found: existing Chinese UI text appears mojibaked in source/output and must be replaced with valid Chinese copy.
- Rebuilt the global CSS design system in `frontend/src/style.css`.
- Rebuilt `frontend/src/views/Home.vue` into a combined web homepage and design-system showcase covering palette, typography, motifs, cards, controls, buttons, states, and mobile preview.
- Rebuilt `frontend/src/views/Divine.vue` into a responsive divination workbench with side navigation, forms, chat input, loading, empty, and result states.
- Replaced broken API fallback copy in `frontend/src/api/divine.js`.
- Fixed missing Vue style closing tags found by the production build.
- Added Vite dev/preview proxy configuration so `/api` requests from the frontend are forwarded to `http://127.0.0.1:5000` by default. This fixes the local-preview case where the UI showed "backend disconnected" even when a backend can run separately.
- Created project scripts `scripts/start-backend.ps1` and `scripts/start-frontend.ps1` so local services can be started without relying on the broken system `python` launcher.
- Added `backend\.env.example` and an ignored local `backend\.env` configured for OpenRouter's free models router by default. The user still must provide their own legitimate API key in `LLM_API_KEY`.
- Updated `scripts/start-backend.ps1` to load `backend\.env` before starting FastAPI.
- Switched local provider configuration to NVIDIA NIM (`https://integrate.api.nvidia.com/v1`) and selected the tested model `meta/llama-3.1-8b-instruct`.
- Fixed `backend/llm_client.py` so external OpenAI-compatible mode uses `LLM_MODEL` from the environment instead of accidentally sending the SDK-only default model name.
- Investigated the reported mismatch on `https://suanguan.netlify.app/`.
- Fixed Netlify deployment configuration so Netlify builds from `frontend`, runs `npm run build`, and publishes `frontend/dist`.
- Removed public-facing design-system demo sections from the homepage. The homepage now keeps only the real product hero, divination entrances, and a concise usage flow. The design tokens/classes remain in CSS for reuse, but demo UI no longer appears as extra user content.

## Verification Log

- Done: installed frontend dependencies with `npm install`.
- Done: `npm run build` passes.
- Done: browser smoke test on `http://127.0.0.1:4189` for desktop home, mobile home, desktop divination, and mobile divination.
- Done: browser checks confirmed no mojibake, no horizontal overflow, and no console errors in the main render paths.
- Done: interaction test from home to `/divine/bazi`, filling form and submitting, returns a clear offline-backend message without 404 noise.
- Done: visual screenshot sanity check for desktop homepage and mobile divination page.
- Done: source scan found no common mojibake fragments in edited frontend files.
- Done: verified the new Vite preview proxy with a temporary local mock API on port 5000; `/api/health` through the frontend preview returned JSON and the divination page no longer showed the disconnected-backend message.
- Note: system `python` still points to a broken C-drive Python launcher path, so backend startup uses the non-C-drive Python runtime below instead.
- Done: found usable non-C-drive Python runtime at `E:\uv-python\cpython-3.12.12-windows-x86_64-none\python.exe`.
- Done: created `backend\.venv`, installed the minimal backend dependency set, and started FastAPI on `http://127.0.0.1:5000`.
- Done: `http://127.0.0.1:5000/api/health` returns `{"status":"ok","llm_mode":"unavailable"}`.
- Done: `http://127.0.0.1:5173/api/health` proxies to the backend successfully.
- Done: browser check on `http://127.0.0.1:5173/divine/bazi` opens the page and no longer shows the disconnected-backend text.
- Done: NVIDIA API key is loaded by the backend; `/api/health` returns `llm_mode: external`.
- Done: direct NVIDIA chat completion test succeeds with `meta/llama-3.1-8b-instruct`.
- Done: real backend SSE endpoint `POST /api/divine/bazi` returns streamed `data:` chunks.
- Done: reran `npm run build` after the Netlify/homepage cleanup.
- Done: cleaned stale ignored `frontend/dist` output and rebuilt so old design-system demo bundles no longer remain locally.
- Done: scanned source and rebuilt assets for old public demo strings (`Design System`, `Components`, `#system`, `#components`, `查看设计系统`) and found none.
- Done: started local Vite preview on `http://127.0.0.1:4190`; `/` and `/divine/bazi` both return HTTP 200.
- Done: `git diff --check` reports no whitespace errors.
- Done: committed and pushed `9c88dcd fix: align Netlify homepage deployment` to `origin/main`.
- Done: verified GitHub remote `main` points to `9c88dcd`.
- Note: `https://suanguan.netlify.app/` still served the previous asset file during post-push verification, so Netlify had not completed or had not triggered a deploy from the updated GitHub commit at that time.
- Done: authorized Netlify CLI via user-approved ticket and deployed production site `suanguan` with deploy ID `6a464e7c55707306e2bc188a`.
- Done: verified production URL `https://suanguan.netlify.app/` now serves the rebuilt asset containing the new homepage copy (`选择你的测算方式`, `三步完成一次问卦`) and no old demo strings (`Design System`, `Components`, `查看设计系统`).
- Done: verified `https://suanguan.netlify.app/divine/bazi` returns HTTP 200 after production deploy.
- Done: performed a content/completeness audit of the production site. Key gap found: `https://suanguan.netlify.app/api/health` returns the frontend HTML fallback rather than backend JSON, so the production site currently opens correctly but does not have a live backend API wired to the frontend.
- New work started: fill the content gaps found in the audit by adding production-facing disclaimer copy, privacy/trust notes, richer method guidance, SEO/social metadata, and clearer backend-unavailable messaging. Then verify and redeploy the Netlify frontend. Backend deployment will be attempted separately if a deploy target can be accessed from the current environment.
- Done: added SEO metadata, keywords, Open Graph/Twitter metadata, and corrected favicon/title text in `frontend/index.html`.
- Done: added homepage guidance for what to ask, required preparation, privacy boundaries, and a clear rational-use disclaimer.
- Done: added divination-page privacy note and disclaimer card, and clarified the production backend-unavailable response.
- Done: `npm run build` passes after the content additions.
- Done: deployed the updated frontend to Netlify production with deploy ID `6a46510509565810ad266d67`.
- Done: verified production contains the new SEO/guide/privacy/disclaimer copy and does not contain old mojibake fragments in the active JS bundle.
- Blocked for now: backend deployment cannot be completed from the current environment without an accessible backend hosting target or CLI/API credentials for Render/Railway/Fly/etc. Current production frontend still needs `VITE_API_BASE_URL` pointed at a deployed FastAPI backend before real AI推演 works online.
- Done: upgraded the divination workflow so every method has its own information form: Bazi birth profile, Yinyuan relationship profile, Fojiao consultation background, and Qimen event profile.
- Done: form submission now composes method-specific messages while preserving the existing `/api/divine/{skill}` backend contract.
- Done: `npm run build` passes after the per-method forms.
- Done: deployed the updated frontend to Netlify production with deploy ID `6a465388818d7500a7ae638d`.
- Done: verified production bundle contains all four method-specific form sections and no old mojibake fragments; `/divine/bazi`, `/divine/yinyuan`, `/divine/fojiao`, and `/divine/qimen` all return HTTP 200.
- Done: added a Netlify Functions API backend under `frontend/netlify/functions/api.mjs` and routed `/api/*` to it before the SPA fallback.
- Done: configured Netlify production environment variables for the NVIDIA OpenAI-compatible endpoint and redeployed with deploy ID `6a4655e4f8c42b105ac50720`.
- Done: verified production `/api/health` returns JSON `{"status":"ok","llm_mode":"external","runtime":"netlify-functions"}` instead of HTML.
- Done: verified production `/api/divine/skills` returns the skill list and `POST /api/divine/bazi` returns `text/event-stream` content.

## Review Notes

- Obsidian sync intentionally skipped until the user explicitly requests it.
- Current implementation keeps backend API contracts unchanged.
- Final review found the only working-tree changes are the intended frontend files plus `GOAL.md`.
- The `/api` proxy target can be overridden with `VITE_DEV_API_TARGET`, for example `VITE_DEV_API_TARGET=https://your-backend.example.com`.
- Current backend health is connected and external LLM mode is active.
- No public/shared API keys were added. Only legitimate provider configuration templates were added.
