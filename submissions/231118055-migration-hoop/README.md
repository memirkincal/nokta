Track: Voice Viz + Avatar Personas

# 231118055 - Nokta Nokta Final Week

## What this submission does

This final-week slice closes the loop between voice, face, forge, and human bridge:

- Microphone input is captured with `expo-av`.
- Voice level drives the waveform bars and the avatar mouth motion.
- The avatar is loaded from `avatar.glb` and switches persona tone between junior and senior modes.
- Audio transcript flows back into the analysis board and the chat helper.
- Forge cycles are visible on-screen, and two consecutive rollbacks automatically open the expert bridge.
- `AuditWidget` generates burn-in markdown reports from dictated runs and feeds them back into the forge loop.

## Expo link / QR

`PENDING_LOCAL_BUILD`

## Demo video

`PENDING_RECORDING`

## APK

- `app-release.apk`

## Included files

- `app/` - final Expo app
- `avatar.glb` - custom low-poly avatar asset
- `PERSONAS.md` - the two speaking personas
- `BRIDGE.md` - bridge call summary and protocol
- `FORGE.md` - ratchet ledger
- `audit-reports/` - three burn-in markdown reports

## Decision log

1. I chose the voice + avatar path because it shows the cleanest end-to-end loop: speak, see the wave, watch the face react, then turn the result into a report.
2. I kept two personas, `Junior-Sen` and `Senior-Sen`, because the demo is stronger when the avatar tone visibly changes without changing the product shape.
3. I used `expo-av` metering so the waveform and mouth motion stay tied to the same signal instead of being two unrelated animations.
4. I kept the bridge outside the main analysis path so normal demos remain fast, but the app can still open a human call the moment forge gets stuck twice.
5. `AuditWidget` stays available as a floating action so dictated reports can be saved without leaving the screen.
6. The app still falls back gracefully if AI configuration is missing, which keeps the demo usable in a classroom build.
7. I kept everything inside this submission folder so the repo root stays untouched.

## Human touch points

1

## AI tool log

| Area | Tool | Use |
|---|---|---|
| Voice | Codex | expo-av + speech recognition wiring |
| Avatar | Codex | GLB asset, persona switch, lipsync shell |
| Forge | Codex | cycle ledger, stuck heuristic, bridge trigger |
| Docs | Codex | README, PERSONAS.md, BRIDGE.md, FORGE.md, reports |

## Run

```bash
cd app
npm install
npx expo start
```
