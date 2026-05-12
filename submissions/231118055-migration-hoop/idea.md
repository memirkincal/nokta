# Nokta Migration & Hoop

## Thesis

Rough notes become more useful when they are not only deduplicated, but also reviewed by a human when the signal is uncertain. This slice turns pasted dots into idea cards, then escalates selected cards into a mentor review room so the final artifact keeps both machine clustering and human judgement.

## Problem

- Notes are scattered across WhatsApp exports, voice transcriptions, email drafts, and quick bullets.
- Similar ideas are often repeated with slightly different wording.
- When a card is unclear or high risk, there is no visible human review step.
- Review feedback is usually lost instead of being written back into the idea artifact.

## Solution

The app follows a short pipeline:

1. Normalize pasted fragments into note objects.
2. Cluster similar notes into idea cards.
3. Show provenance, confidence, and merge candidates.
4. Let the user keep a card separate, merge the closest match, or send the card to Hoop.
5. Capture a mentor transcript and write the result back into the card.

## Hoop extension

`nokta-hoop` is used as the inspiration for the human review slice. In this submission the selected card can enter a review room, where the app shows:

- review mode: HOOTL, HOTL, or HITL
- role: mentor, expert, or reviewer
- session timeline
- transcript text
- writeback note

If Stream env vars are available, the app tries a token-server handshake. If not, it keeps a deterministic local rehearsal so the demo still runs.

## Why this is different

- Provenance tags keep the source trail visible.
- Confidence rails make the cluster quality easy to read.
- Merge and keep-separate actions are explicit, not hidden in AI output.
- Mentor writeback turns the review step into a lasting artifact.

## Non-goals

- Full backend syncing
- Real production Stream infrastructure in this repo snapshot
- A marketplace, social feed, or large multi-screen product

## Summary

This is a focused Track C slice with a human review layer. It keeps the core submission small, but still shows a meaningful Nokta direction: capture, dedup, review, and write back.
