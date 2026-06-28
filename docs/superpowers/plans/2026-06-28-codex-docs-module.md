# Codex Docs Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Codex usage guide module under the existing developer tools section.

**Architecture:** Follow the site's existing VuePress content pattern: a top-level overview markdown file plus a focused child directory for detailed pages. The sidebar exposes Codex as a sibling of Git inside `开发工具`.

**Tech Stack:** VuePress 2, vuepress-theme-hope, Markdown.

---

### Task 1: Add Codex Markdown Pages

**Files:**
- Create: `src/data/开发工具/Codex.md`
- Create: `src/data/开发工具/Codex/快速开始.md`
- Create: `src/data/开发工具/Codex/版本控制.md`
- Create: `src/data/开发工具/Codex/工作区与Worktree.md`
- Create: `src/data/开发工具/Codex/代码修改与审查.md`
- Create: `src/data/开发工具/Codex/技能Skills.md`
- Create: `src/data/开发工具/Codex/插件Plugins.md`
- Create: `src/data/开发工具/Codex/MCP.md`
- Create: `src/data/开发工具/Codex/自动化.md`
- Create: `src/data/开发工具/Codex/常见问题.md`

- [ ] Step 1: Create the overview page with links to each topic.
- [ ] Step 2: Create each detailed topic page with practical usage notes.
- [ ] Step 3: Keep the content concise and beginner-friendly.

### Task 2: Update Sidebar

**Files:**
- Modify: `src/.vuepress/sidebar.ts`

- [ ] Step 1: Add a `Codex` group under `/data/开发工具/`.
- [ ] Step 2: Keep it parallel to the existing `Git` group.
- [ ] Step 3: Include all Codex child pages in sidebar order.

### Task 3: Verify Build

**Files:**
- Read: `package.json`

- [ ] Step 1: Run `npm run docs:build`.
- [ ] Step 2: Confirm VuePress builds successfully.
- [ ] Step 3: If build fails due to content or sidebar links, fix the failing path and rerun.
