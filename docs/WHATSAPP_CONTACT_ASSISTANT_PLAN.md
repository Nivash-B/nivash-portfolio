# WhatsApp Contact Assistant Plan

## TL;DR / Mental model

The existing “Start a conversation” button opens a small, on-brand guided dialog. The visitor chooses only **Hiring** or **Project**, then WhatsApp opens with a matching message addressed to Nivash.

## Overview

This is a lightweight contact router, not an AI chatbot. It gives visitors one simple choice before handing the conversation to Nivash on WhatsApp.

## Goals and non-goals

- Goal: make WhatsApp contact clear, fast, polished, and mobile-friendly.
- Goal: preserve the current portfolio visual system and accessibility.
- Non-goal: collect or store visitor information.
- Non-goal: automatically send a WhatsApp message.
- Non-goal: run an automated WhatsApp Business bot.

## Scope

### v1

- Open a modal dialog from “Start a conversation”.
- Show exactly two options: Hiring and Project.
- Open `wa.me/916379722055` with a fixed, pre-filled message for the selected option.
- Support close button, backdrop click, Escape, focus restoration, desktop, and mobile.

### v2 / later

- Optional name or message field.
- Optional analytics event for each choice.

### Out of scope

- WhatsApp Business Cloud API, backend webhooks, automated replies, database, or admin UI.

## Decisions summary

- Use a native HTML dialog with a small JavaScript controller.
- Keep both WhatsApp messages fixed in the HTML so there is no untrusted URL construction.
- Open WhatsApp in a new tab/app; the visitor presses Send.
- Lock background scrolling while the dialog is open and restore the prior position on close.

## Reuse map

| Feature need | Existing pattern/helper | Evidence |
|---|---|---|
| Trigger styling | Existing light contact button | `index.html` contact actions; `styles.css` `.button-light` |
| Visual language | Contact section green, paper, gold palette | `styles.css` `.contact` and CSS variables |
| Arrow icon | Existing inline action-arrow SVG | `index.html` contact button |
| Press feedback | Existing `is-pressing` binding | `script.js` action targets |
| Scroll restoration | Existing menu position restore approach | `script.js` `openMenu` / `closeMenu` |

## Data model and migrations

No data model, storage, migration, or cookies are required.

## Backend design

No backend or API is required. WhatsApp receives only the message the visitor explicitly chooses to open.

## Frontend design

- Replace the mail link with an accessible dialog trigger button.
- Add a compact dialog containing an assistant introduction and two choice cards.
- Hiring message: “Hi Nivash, I viewed your portfolio and would like to discuss a hiring opportunity.”
- Project message: “Hi Nivash, I viewed your portfolio and would like to discuss a project.”
- Stack choices vertically on small screens and keep the dialog within the dynamic viewport.

## Permissions, security, and audit

- No permissions or authentication are needed.
- Use HTTPS `wa.me` links with `noopener noreferrer`.
- Store no personal information and perform no background submission.

## Edge cases

- If JavaScript is unavailable, each WhatsApp option remains a normal usable link.
- If the WhatsApp app is unavailable, the link can open WhatsApp Web/browser handling.
- Repeated opens must not duplicate handlers or lose the page scroll position.
- Escape, close button, and backdrop click must close without navigation.

## Test plan

- Verify the trigger opens the dialog.
- Verify exactly two choices and correct pre-filled WhatsApp URLs.
- Verify close button, Escape, backdrop close, focus restoration, and scroll restoration.
- Verify desktop and mobile bounds with no horizontal overflow.
- Verify no console errors or warnings.

## Implementation checklist

- [x] Add dialog markup and WhatsApp links.
- [x] Add responsive dialog styling and motion-reduction fallback.
- [x] Add dialog open/close and scroll-lock controller.
- [x] Rebuild minified CSS and JavaScript.
- [x] Run interaction and responsive tests.
- [x] Commit and push.

## Open questions

None. The user locked the v1 choices to Hiring and Project only.
