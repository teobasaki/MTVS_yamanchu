# Yamanchu Live Cheering-Seat Demo

Standalone live-game demo for a presentation flow.

## Run

```bash
npm install
npm run dev -- --port 5183
```

Build:

```bash
npm run build
```

## Demo Flow

1. Use the `Next Situation` button in the header to advance the timeline.
2. Top of the 8th, slow moment: react with one of four emojis. The reaction is reflected in the report.
3. Bottom of the 8th, stadium wave: press `Jump!` to trigger sequential character jumps.
4. Bottom of the 9th, Lee Min-seok at bat: choose `Home Run` in the prediction popup to bet 10,000P.
5. Home run animation, prediction-rate graph, and double points reward.
6. End of game: emotional sync report and updated personality card.
7. Send "간맥콜?" to Minji -> Minji accepts -> pub recommendation -> mock payment.

## Safeguards

- If Three.js rendering fails, the ErrorBoundary displays a CSS fallback.
- The full flow still works without Three.js.
