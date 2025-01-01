# Contributing

## Prerequisites

- [NodeJS](https://nodejs.org/)
- [PNPM](https://pnpm.io/)

## Project Structure

This project utilizes pnpm monorepos with the following structure:
```
├── packages/
│   └── floating-ui-svelte/ # Package
└── sites/
    └── floating-ui-svelte.vercel.app/ # Documentation
```

## Development

1. Fork and clone the repository
2. Install dependencies: `pnpm i`
3. Start development: `pnpm build:watch`

## Branch

All pull requests should be created against the `main` branch.

### Branch Conventions

Please use the following naming convention when creating your pull request.

| Branch | Role |
| --- | --- |
| `docs/*` | Updates for the documentation site. |
| `feature/*` | When implementing a new feature. |
| `chore/*` | When implementing small changes. |
| `bugfix/*` | When implementing feature bugfixes. |

Keep branch names short and semantic, using dashes to separate words.

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
6. Commit and push the new changeset file.

Changesets use semantic version. We recommend the following convention.

| Version | Role |
| --- | --- |
| `major` | Do not use. Reserved for maintainers. |
| `minor` | For notable changes, such as a new features. |
| `patch` | For small changes, such as a chore or typo. |

Changeset descriptions will appear verbatim on the [Changelog](https://github.com/skeletonlabs/skeleton/blob/dev/packages/skeleton/CHANGELOG.md). Keep it short, semantic, and prefix this like branch names.

```md
---
'@skeletonlabs/floating-ui-svelte': minor
---

feat: Added a new useFoo hook.
```

> [!CAUTION]
> Only add a changeset when the change affects the library, documentation changes for example will not require a changeset.

## Tooling

### Formatting

This project makes use of [Biome](https://biomejs.dev/), to run the formatter:

```bash
pnpm format
```

### Testing

This project makes use of [Vitest](https://vitest.dev/), to run the tests:

```bash
pnpm test
```

To test and watch:

```bash
pnpm test:watch
```

### Building

This project makes use of [Svelte Package](https://svelte.dev/docs/kit/packaging), to run the build:

```bash
pnpm build
```

To build and watch:

```bash
pnpm build:watch
```