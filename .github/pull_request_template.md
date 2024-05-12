## Linked Issue

Closes #{issueNumber}

## Description

{description}

## Changesets

We use [Changesets](https://github.com/changesets/changesets) to automatically create our changelog per each release. Any changes or additions to the Library assets in `/lib` must be documented with a new Changeset. This can be done as follows:

1. Navigate to the root of the project on your feature branch.
2. Run `pnpm changeset` to trigger the Changeset CLI.
3. Follow the instructions when prompted.
    - Changesets should be either `minor` or `patch`. Never `major`.
    - Prefix your Changeset description using: `feature:`, `chore:` or `bugfix:`.
4. Changeset `.md` files are added to the `/.changeset` directory.
5. Commit and push the the new changeset file.

## Checklist

Please read and apply all [contribution requirements](https://github.com/skeletonlabs/floating-ui-svelte/blob/chore/main/CONTRIBUTING.md).

- [ ] PR targets the `dev` branch (NEVER `master`)
- [ ] All website documentation is current with your changes
- [ ] Ensure Prettier formatting is current - run `pnpm format`
- [ ] Ensure Prettier linting is current - run `pnpm format`
- [ ] All test cases are passing - run `pnpm test`
- [ ] Includes a changeset (if relevant; see above)
