# Nokta Nokta - Voice, Avatar, Forge

## Thesis

The most convincing Nokta slice is not another static note board. It is a loop where the user speaks, the waveform reacts immediately, the avatar mouth moves in sync, the app turns the voice into a readable analysis, and the forge ledger decides when a human needs to step in. That loop makes the app feel alive instead of merely AI-powered.

## Problem

- Voice input often feels detached from the rest of the interface.
- Many demos hide the model behind a plain text box, so the user never sees the signal-to-output relationship.
- When a repair loop keeps failing, the app should not keep guessing forever.
- A good final-week demo needs face, voice, report, and human bridge in the same flow.

## Solution

This final slice keeps the note-analysis brain from the previous weeks, then adds three connected surfaces:

1. A live voice meter that uses `expo-av` metering to drive the bars.
2. A custom avatar loaded from `avatar.glb`, with two personas and a mouth that reacts to speech level.
3. A forge ledger that accumulates report cycles and automatically opens a human bridge after two consecutive rollbacks.

The app still accepts pasted notes, still runs the AI answer layer, and still generates burn-in audit reports. The difference is that the user can now watch the whole thing happen in one place: voice in, face alive, report out, forge updated, and expert bridge when the loop gets stuck.

## Why this is different

- The waveform is not decorative; it is the same signal that drives the avatar mouth.
- The avatar is not generic; the app switches between two personas with different tone labels.
- The forge ledger is not a log dump; it is a ratchet that can trigger a human call.
- The audit widget is not hidden; dictated reports can be saved from the same screen.
- The whole flow stays local-first so the demo does not collapse when the API is missing.

## Personas

- `Junior-Sen` - warm, exploratory, more playful.
- `Senior-Sen` - calm, concise, and decision-oriented.

## Non-goals

- A production-grade telephony stack
- A full avatar rigging pipeline editor inside the app
- A backend report sync service
- A social/feed layer

## Summary

This is the final Nokta slice where voice, avatar, forge, and human bridge all touch. It keeps the earlier note analysis layer, but makes the demo feel like one continuous system instead of isolated screens.
