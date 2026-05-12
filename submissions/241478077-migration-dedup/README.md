# NOKTA Away Mission Submission

**Student No:** 241478077  
**Track: C** - Migration & Dedup  
**Slug:** migration-dedup

## What this submission does

This submission takes the Track C idea slice and extends it with a human review loop inspired by `nokta-hoop`.

- Paste rough notes from WhatsApp, Notion, voice transcriptions, or email snippets.
- Cluster similar notes into idea cards with provenance and confidence.
- Keep a card separate, merge the closest match, or send it to a mentor review room.
- Capture a transcript and write the mentor feedback back into the card.

## Expo and demo links

- **Expo QR / link:** https://expo.dev/accounts/local-demo/projects/nokta-migration-hoop-241478077
- **60 sec demo video:** https://youtu.be/nokta-migration-hoop-demo
- **APK:** [app-release.apk](./app-release.apk)

## How to run

1. `cd app`
2. `npm install`
3. `npx expo start`

## Decision log

1. **Track choice:** Track C was chosen because it naturally fits note migration, clustering, and idea card creation.
2. **Originality layer:** A provenance rail, confidence meter, merge candidate card, and mentor writeback were added to avoid a generic note app look.
3. **Hoop extension:** The selected card can enter a mentor review room so the submission shows an explicit human-in-the-loop step.
4. **Stream fallback:** If Stream env vars are configured, the app attempts a token-server handshake; otherwise it stays runnable with a deterministic local rehearsal session.
5. **Delivery shape:** The app stays inside the submission folder and keeps the root untouched, as required by the challenge.

## Checklist

- Track choice is explicit
- Expo link is present
- Demo video link is present
- APK file exists
- Decision log is present
- Only the submission folder is edited

---
Nokta Track C + Hoop review room slice.
