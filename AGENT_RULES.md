# AYUSH-Care: Master AI Agent & Team Collaboration Rules

> This file is automatically loaded by AI coding assistants (Cursor, Windsurf, Claude Code, Antigravity, Copilot).
> Refer to `docs/TEAM_AGENT_RULEBOOK.md` for the full technical breakdown.

## Universal Laws for this Codebase:
1. **Zero Emojis Policy:** Do NOT use emojis anywhere in UI, code, comments, or commit messages. Use Lucide SVG icons.
2. **Kiosk Layout Geometry:** Every patient screen must fit strictly in `h-[calc(100vh-76px)] max-h-[calc(100vh-76px)] overflow-hidden`. No vertical scrollbars allowed.
3. **GIGW Flat Design:**
   - Palette: `#0B5FA5` (Primary Blue), `#2F7D4F` (Prakriti Green), `#E07B1A` (Saffron Accent), `#EAEDF0` (Canvas).
   - Surfaces: `bg-white border border-[#CED4DA] rounded-[3px]`.
   - Zero drop shadows (`shadow-none`).
4. **State Management:** Always use `useSessionStore` in `client/src/stores/sessionStore.ts`. Do not create new stores.
5. **Deterministic Logic:** Prakriti calculations and red-flag emergency detection must execute via pure arithmetic (no LLM prompts).
6. **No Random Dependencies:** Use existing libraries (React, Tailwind CSS, Lucide React, Zustand, FastAPI, Pydantic v2).
7. **Strict Type Safety:** No `any` in TypeScript. All FastAPI endpoints must specify `response_model`.
