# [A Green Table | Play cards on a green table](https://green.vav.me)

Table top with a card deck implemented in Svelte + Sveltekit using tailwindcss. Connectivity is implemented with websockets.

## How to use

- Lift cards by clicking on the edge. This allows you to move it. On movement, the position is updated for other plays. Clicking places the card down.

- Group cards by moving them on top of each other. 

- Remove the first card by clicking on the middle.

- Create a card stack by click on the lock of a card face. Adding cards (by moving them onto it) will place it directly on top.

## Game Rules

Game rules can be implemented in the `utils/rules.ts`. The functions are called before actions are taken. If a rule returns `true` action will be taken.

## Svelte Adapter

The static adapter is used. This allows easy deployment to any service deploying static sites.

The deployment [green.vav.me](https://green.vav.me) is currently hosted by [Cloudflare Pages](https://pages.cloudflare.com)

# Developing

This repository uses [pnpm](https://pnpm.io). In general, `pnpm` can be replaced by `npm`, however `npm` cannot read `pnpm` lock files. This is somewhat of an issue because we depend on `@sveltejs/kit = next` and `@sveltejs/adapter-static = next` which sometimes introduces breaking changes.

## Dev server

```bash
pnpm dev
```

## Building

To create a production version of your app:

```bash
pnpm build
```

The production build can be previewed by `pnpm run preview`.