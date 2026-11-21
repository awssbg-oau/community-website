# AWS Student Builder Group OAU

The community website for the AWS Student Builder Group at Obafemi Awolowo University, Ile-Ife. It shows what the group does, upcoming and past events, the team, member spotlights and how to join.

Built with [Astro](https://astro.build) as a fully static site, so any static host can serve the `dist/` folder as is.

## Pages

| Route | What it shows |
| :-- | :-- |
| `/` | Home: intro, next event, past events, team, voices and how to join |
| `/spotlight` | Builds, wins and moments from members |
| `/spotlight/<id>` | One spotlight entry |
| `/design` | The design system: colours, type, components and states |

## Getting Started

You need Node.js 22.23.4 or newer.

```sh
npm install
npm run dev
```

The dev server runs at `http://localhost:4321`.

| Command | Action |
| :-- | :-- |
| `npm run dev` | Start the local dev server |
| `npm run build` | Build the site into `dist/` |
| `npm run preview` | Serve the built site locally |

## Project Structure

```text
src/
├── components/         UI pieces: header, footer, event board, lead cards, mascot
├── content/            Markdown content, one file per entry
│   ├── events/
│   ├── showcase/
│   ├── team/
│   └── voices/
├── content.config.ts   Schemas for every content collection
├── data/site.json      Group name, intro, links and stats
├── layouts/            Base page layout
├── lib/                Event sorting and icon helpers
├── pages/              Routes
├── scripts/            Client-side motion and interactions
└── styles/             Design tokens and global styles
public/                 Static files served as is
```

## Updating Content

Most updates need no code changes. Add or edit a Markdown file in `src/content/` and the site picks it up on the next build. A wrong or missing field fails the build with a clear message.

### Events

Add a file to `src/content/events/`. Events that haven't ended when the site is built show as upcoming; the rest show as past events. The site is static, so rebuild after an event ends to move it to past.

```md
---
title: End-of-Year Hangout 2026
kind: hangout
start: 2026-12-05T12:00:00+01:00
end: 2026-12-05T18:00:00+01:00
mode: in-person
venue: Ọpọlọ Innovation Hub
meetup: https://www.meetup.com/aws-sbg-at-obafemi-awolowo-university/events/317175152/
---

A short description of the event.
```

- `kind`: `kickoff`, `workshop`, `talk`, `lab` or `hangout`
- `mode`: `online` or `in-person`
- Optional: `end`, `venueDetail`, `attended`, `highlight`, `photos`, `audience`
- Write times with the `+01:00` offset (WAT).

### Team

Add a file to `src/content/team/` with `name`, `role`, `unit` (`leadership`, `tech`, `events`, `community` or `design`) and `order`. `photo`, `linkedin`, `x`, `instagram` and `github` are optional.

### Spotlight

Add a file to `src/content/showcase/` with `title`, `kind` (`build`, `win` or `moment`), `by` and `date`. `stack`, `link` and `photo` are optional. The Markdown body becomes the entry's page.

### Voices

Add a file to `src/content/voices/` with `quote`, `name` and `detail`.

### Placeholder Entries

Entries marked `sample: true` are placeholders. Replace them with real details and remove the flag.

### Links and Stats

Group links (Meetup, membership form, LinkedIn, X) and the member count live in `src/data/site.json`.

## Design

Colours, type and spacing are tokens in `src/styles/tokens.css`. Change them there rather than in components. Run the dev server and open `/design` to see every token and component in one place.

## Links

- [Meetup](https://www.meetup.com/aws-sbg-at-obafemi-awolowo-university/)
- [Linktree](https://linktr.ee/awssbgoau)
- [LinkedIn](https://www.linkedin.com/company/aws-student-builder-group-oau)
- [X](https://x.com/awssbgoau)
