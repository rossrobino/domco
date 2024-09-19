# Contributing to domco

domco is open to contributions and is licensed under the MIT license. If you find a bug or have an idea feel free to create an issue to get feedback before going to the work of creating a PR.

## dependencies

domco currently has no dependencies other than Vite, please take this into consideration when contributing.

## scope

The scope of the project is to be a minimal wrapper to add server-side functionality to Vite. Some of the things that are outside the scope include adding a server framework, or a UI library into the core.

## clone

- Clone the monorepo and run `npm i` to install dependencies.

## packages

- `cd packages/domco` to change to the domco directory
- `npm run dev` to make changes
- `npm run test` to run Vitest

## tester

- Open a new terminal and run `cd apps/tester`
- `npm run dev` to start the tester
- You'll need to restart the dev server when there are changes to the Vite plugin code

## build

- Run `npm run build` in the root directory to build all projects and verify changes are working correctly
- If you made a change that requires a new version of a package, run `npm run changeset` from the root directory and create a changeset
