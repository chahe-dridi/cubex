# Contributing to cubex

Thanks for taking the time to contribute! 🎲

## Branching model

cubex uses a two-tier branch flow:

- **`master`** — the stable, released branch. It's what npm publishes and what
  `npm install github:chahe-dridi/cubex` installs. Nothing is pushed here
  directly; it only receives tested merges from `dev`.
- **`dev`** — the integration branch. Every change lands here first so features
  can be tested together before a release.
- **`feat/*`** (or `fix/*`, `docs/*`) — short-lived working branches, one per
  issue.

**Pull requests always target `dev`.** When `dev` is stable, a maintainer
merges it into `master` and cuts a new release.

```
feat/my-change  ──PR──▶  dev  ──(tested)──▶  master  ──▶  npm release
```

## Getting started

```bash
# Fork + clone, then:
cd cubex
npm install
npm run dev        # interactive demo at the printed localhost URL
```

## Making a change

1. **Claim an issue** — comment on the [issue](https://github.com/chahe-dridi/cubex/issues) so no one doubles up. No issue yet? Open one first.
2. **Branch off `dev`:**
   ```bash
   git checkout dev && git pull
   git checkout -b feat/short-description
   ```
3. **Make your change.** Match the existing code style — small, focused commits.
4. **Verify locally:**
   ```bash
   npm run dev          # check it works in the demo
   npm run build        # make sure the library still builds
   npm run build:demo   # make sure the demo site still builds
   ```
5. **Push and open a PR into `dev`:**
   ```bash
   git push -u origin feat/short-description
   ```
   Link the issue in the PR description (e.g. "Closes #1").

## Pull request checklist

- [ ] PR targets `dev` (not `master`)
- [ ] `npm run build` succeeds
- [ ] The demo (`npm run dev`) works with your change
- [ ] Linked the related issue
- [ ] No unrelated changes bundled in

## Commit messages

Short, present-tense, and prefixed by area where it helps, e.g.:

```
feat: respect prefers-reduced-motion
fix: correct slice direction on back face drag
docs: clarify palette merging
```

## Releases (maintainers)

1. Merge `dev → master` once stable.
2. Bump the version: `npm version patch|minor|major`.
3. Publish: `npm publish` (requires 2FA OTP).
4. Push tags: `git push --follow-tags`.

## Questions

Open a [discussion or issue](https://github.com/chahe-dridi/cubex/issues) — happy to help.
