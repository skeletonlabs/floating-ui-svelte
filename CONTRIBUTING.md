# Contributing

This project is created using [SvelteKit](https://kit.svelte.dev/), [Tailwind](https://tailwindcss.com/) for styling, and [pnpm](https://pnpm.io/) for package management.

## How to Contribute

Take care to read all contributions guidelines before you begin!

1. Learn how to [contribute to open source](https://opensource.guide/how-to-contribute/).
2. Follow a [step-by-step guide](https://github.com/firstcontributions/first-contributions) to practice your first contribution.
3. Locate an [open issue on GitHub](https://github.com/skeletonlabs/floating-ui-svelte/issues). Let us know you would like to volunteer.
4. Optionally, you may coordinate efforts on the `#contributors` channel within [Discord](https://discord.gg/EXqV7W8MtY).
5. If the maintainers approves your request, you'll be assigned to the issue.
6. Complete the work and submit a pull request and we'll review the changes.

> NOTE: non-trivial PRs submitted without our prior consent will be denied. Repeat offenders will be banned.

## Using PNPM

Floating UI Sveltes makes use of [PNPM](https://pnpm.io/).

1. [Install PNPM](https://pnpm.io/installation) on your local computer.
2. [Fork the repository](https://github.com/skeletonlabs/floating-ui-svelte) via your preferred option.
3. Use Git to clone the forked project to your local machine.
4. Point your terminal at the project.
5. Run `pnpm i` to install the required depedencies.
6. Run `pnpm dev` to start a local dev server.

## Project Structure

The floating UI Svelte project is built using SvelteKit to handle both the documentation and library assets.

| Path | Description |
| --- | --- |
| Documentation | Found in the `/src/routes` directory. |
| Library | Found in the `/src/lib` directory. |

## Branch

Floating UI Svelte uses two primary branches. All pull requests should be created again the `dev` branch.

| Branch | Description | Pull Requests |
| --- | --- | --- |
| `dev` | The developement branch. | Allowed |
| `main` | The release branch. | Never |

### PR Branch Conventions

Please use the following naming convention when creating your pull request.

| Branch     | Role                                  |
| ---------- | ------------------------------------- |
| `docs/*`   | Updates for the documentation site. |
| `feature/*`   | When implementing a new feature.      |
| `chore/*`  | When implementing small changes.      |
| `bugfix/*` | When implementing feature bugfixes.   |

Keep branch names short and semantic, using dashes to seperate words.

```
docs/getting-started-typo-fix
bugfix/fixed-use-floating-bug
```

## Changesets

[Changesets](https://github.com/changesets/changesets) are used to automatically generate the changelog for each release. Any contributions made to projects that live within the `/lib` directory must contain a Changeset. Use the following instructions to generate a changeset.

1. Make sure you're within local pull request feature branch.
2. Navigate to the root of the project.
3. Run `pnpm changeset` to trigger the Changeset CLI.
4. Follow the instructions when prompted.
5. Changeset are added to the `/.changeset` directory.
6. Commit and push the the new changeset file.

Changesets use semantic version. We recommend the following convention.

| Version | Role                                         |
| ------- | -------------------------------------------- |
| `major` | Do not use. Reserved for maintainers.        |
| `minor` | For notable changes, such as a new features. |
| `patch` | For small changes, such as a chore or typo.           |

Changeset descriptions will appear verbatim on the [Changelog](https://github.com/skeletonlabs/skeleton/blob/dev/packages/skeleton/CHANGELOG.md). Keep it short, semantic, and prefix this like branch names.

```mdx
---
'@skeletonlabs/floating-ui-svelte': minor
---

feat: Added a new useFoo hook.
```

## Tooling

Floating UI Svelte makes use of the following technology for improving the developer experience.

### Prettier

We use [Prettier](https://prettier.io/) for code formatting and linting.

```console
pnpm format
pnpm lint
```

### Test Suite

Unit tests are handled via [Vitest](https://vitest.dev/).

```console
pnpm vitest
```
