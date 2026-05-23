# Coordination

Two Claude Code sessions on two laptops collaborate on this repo. There is no real-time channel between them — every handoff goes through git or the GitHub API.

## Identities

Both laptops are operated by the same human (GitHub: `wolfwdavid`, email: `cdw8481@nyu.edu`). Commits from either laptop will appear under that identity in git history. The Claude sessions are distinguished by **laptop tag**, not by GitHub user.

| Tag | Laptop (Windows user) | Role |
|---|---|---|
| **Claude-A** | `mkarurosun` | (set per session) |
| **Claude-B** | `Mkaru` | (set per session) |

Tags are per-laptop, not per-task. Reassign roles (builder/reviewer, frontend/backend, etc.) per work item.

## Channels

**1. GitHub Issues — primary async channel.**
Use for: questions, decisions, task assignment, status updates.

- Title prefix: `[Claude-A → Claude-B]` or `[Claude-B → Claude-A]` so the recipient is unambiguous. Use `[Claude-A & Claude-B]` for shared notes / decision logs.
- Reply via `gh issue comment <num> --body "..."`.
- Close the issue when the question is resolved.
- Label issues with `coordination` (Claude↔Claude chatter) vs `task` (actual work to be done) so it's easy to filter.

**2. Branches — work isolation.**
Each Claude works on its own branch. Naming:

- `claude-a/<short-feature-name>` — e.g. `claude-a/landing-hero`
- `claude-b/<short-feature-name>` — e.g. `claude-b/contact-form`
- `main` is protected by convention — only merge via PR.

Push frequently (every meaningful commit) so the other side can `git fetch` and see progress.

**3. Pull Requests — code review handoff.**
When work on a branch is ready for the other Claude to look at:

- Open PR against `main`.
- In the PR body, `@`-mention what you want reviewed and link any related issues.
- The other Claude reviews via `gh pr view <num>` / `gh pr diff <num>` and comments via `gh pr comment <num>` or `gh pr review <num>`.

**4. `tasks/todo.md` — shared scratchpad.**
Lightweight task board committed to the repo. Each Claude claims items by editing the file. Pull before editing to avoid conflicts.

## Conventions

- **No AI attribution in commits or PRs.** No `Co-Authored-By: Claude`, no "Generated with Claude Code." Messages describe the change, not the author.
- **Small, frequent commits.** The other Claude can only see what's been pushed. Stale local work blocks coordination.
- **Pull before you start.** Always `git pull --rebase origin main` before beginning new work on your branch.
- **Conflicts are a signal, not a problem.** If both Claudes touched the same file, that's a coordination failure earlier in the loop — discuss in an issue rather than blindly resolving.

## Polling

Neither Claude is notified when the other pushes or comments. The user prompts a check ("any answer yet?", "what did the other one say?") and the active Claude runs:

```
gh issue list --state open
gh issue view <num> --comments
git fetch && git log --all --oneline -20
```

## Bootstrap

When in doubt about who is doing what, open a `[Claude-X → Claude-Y]` issue and ask. Cheap to send, cheaper than overlapping work.
