# Local AI Enhance

## Setup and cost

Enhance uses Chrome's built-in Prompt API (`LanguageModel`) and browser-managed Gemini Nano. No API key, cloud inference endpoint, or per-request API charge is used. The initial model download consumes bandwidth and disk space; inference consumes local compute. There is no application daily quota.

Use an up-to-date desktop Google Chrome (the API is documented for web from Chrome 148), on localhost or HTTPS. Chrome chooses the model: **do not select or install a model manually** in `chrome://on-device-internals`. This is a diagnostic page, not our model picker.

Chrome's documented requirements include macOS 13+, Windows 10/11, Linux, or Chromebook Plus; at least 22 GB free profile-volume storage; GPU with more than 4 GB VRAM, or CPU with at least 16 GB RAM and four cores; and an unmetered connection for download. Mobile is not supported. Browser policies and device eligibility can still prevent availability.

In the demo page's DevTools console:

```js
'LanguageModel' in globalThis
// If true:
await LanguageModel.availability({
  expectedInputs: [{ type: 'text', languages: ['en'] }],
  expectedOutputs: [{ type: 'text', languages: ['en'] }],
})
```

- `available`: the model is downloaded; the app still needs to initialize a session.
- `downloadable` / `downloading`: the model needs preparation/download.
- `unavailable` or missing API: inspect `chrome://on-device-internals` > Broker State, confirm hardware/storage requirements, update/restart Chrome, and check browser policies. This is not solved by adding an API key.

## Welcome and readiness

After the existing Basic Auth login, each page load shows a welcome panel with **Enable Enhance features** checked by default. **Continue** calls model creation directly within that click, preserving Chrome's user activation. Nothing downloads before consent. The demo remains usable while a bottom-left status displays preparation/download progress, followed by **AI ready** only after initialization succeeds.

Unchecking the checkbox skips all preparation and leaves Enhance off. **Enable Enhance** can start it later. Failure leaves the demo usable with **Retry AI preparation**. Selection Enhance appears only when ready.

A clean base session stays alive for the visit. Each rewrite uses a disposable clone, so previous passages never accumulate in the base. Page exit/unmount releases sessions. Chrome normally keeps model files between visits, but updates or storage cleanup can require another download; this cannot be guaranteed by the app.

No silent mock or cloud fallback exists. Preparation has a ten-minute timeout; individual rewrites have a separate two-minute timeout. Leaving the field or editing the note cancels that rewrite, not shared preparation. If setup times out, check browser download status and retry.

## Manual acceptance test

Use existing fictional demo passages, not real patient information. Source examples from `src/data/suggestions.js` or the original Eleos Platform Demo content.

1. Open `/clinician`, leave **Enable Enhance features** checked, and click **Continue**. Confirm the demo is usable while preparation runs and wait for **AI ready**. Paste a demo passage into a note field. Mere focus should not show Enhance.
2. Highlight fewer than five words; click Enhance. Expect the minimum-length error, with no inference.
3. Highlight five or more words within a larger passage. Click Enhance. The existing note must remain unchanged while loading and while the suggestion is previewed.
4. Inspect the rewrite: spelling/grammar/punctuation improved; clearer clinical language; no invented details, altered negations, doses, quantities, attribution, or certainty. An unchanged result for already-good text is acceptable.
5. Choose Use. Only the selected range should change; surrounding text and boundary whitespace must remain intact.
6. Repeat with Dismiss and Escape. Original text remains and keyboard focus returns to the textarea.
7. Select via keyboard, Tab to Enhance, press Enter, and navigate the preview with Tab. All actions must work without a mouse.
8. Start enhancement then edit the note, change fields, change note type/client/EHR, or navigate away. No stale suggestion may replace subsequent content.
9. Repeat in another EHR skin with the sidebar open. Quality checking and note dirty tracking should still work.
10. After the model is ready and the app is loaded, disconnect networking and repeat a rewrite. Local inference should continue; the app's own initial assets still need to load.
11. Reload and uncheck **Enable Enhance features** before Continue. Confirm Enhance is off, no session/download starts, and the demo works. Click **Enable Enhance** to prepare explicitly.
12. Reload with an unavailable model/browser. Continue should show an error with retry, not block the demo.

Model output is nondeterministic. Record Chrome version, model status, elapsed time, and clinical review outcomes rather than requiring an exact output string. Local inference is not itself a compliance certification; clinician review is required.

## Automated checks

```bash
node --test src/components/enhance/localEnhance.test.js
npm run test:e2e -- e2e/local-enhance.spec.ts
npm run build
```

Playwright mocks only the browser model API, not UI behavior. Tests cover selection, validation, range replacement, whitespace, keyboard interaction, cancellation/stale results, download states, failure states, and removal of `::` expansion. They do not establish real-model writing quality or availability.

The normal Playwright config uses port 5173; ensure it serves this checkout, not another worktree. Root typecheck has unrelated legacy errors.

References: [Prompt API](https://developer.chrome.com/docs/ai/prompt-api), [requirements](https://developer.chrome.com/docs/ai/get-started), [download UX](https://developer.chrome.com/docs/ai/inform-users-of-model-download).
