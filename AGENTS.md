# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Confirmed prototype direction

- Use React so portfolio content and animation parameters remain easy to edit.
- Use `tmp/copilot/e-signal.html` as the current visual source of truth (confirmed 2026-11-17), superseding the earlier white "orbital intelligence" direction.
- The signature visual is an interactive Canvas signal field: a 3D particle portrait in the hero (confirmed 2026-11-17: a cool male bust wearing sunglasses — not cartoonish; dark empty lenses with a lime glint, scan-line depth, head turns toward the pointer), morphing into the B/D monogram at metrics, then networks, frames, strata, a river, channels, and a signal ring as sections change. Preserve pointer repulsion and click ripple feedback.
- Keep the portrait large and horizontally centered on large screens, spanning most of the hero height; do not shrink it to fit above the title. Its nose bridge, nose tip and lips must remain recognizable, including behind the title-wide particle fade; enhance real scanned anatomy and shading, not cartoon outlines (confirmed 2026-11-17).
- Use the supplied `tmp/bg.mp3` as looping background music, attempting audible autoplay and retrying on the first interaction when the browser blocks it. Keep a visible header sound toggle and remember an explicit mute choice.
- Every email action copies the address to the clipboard and shows a toast; do not use `mailto:` links.
- Use a near-black background (#07080B), off-white text, muted gray, fine translucent borders, glass surfaces, and a single lime accent (#C6FF3D). Match the reference typography, oversized name, pill buttons, horizontal pinned project gallery, and timeline.
- Include rich but purposeful motion: kinetic hero entrance, continuous particle morphing, scroll reveals, metric counters, pointer spotlights, and an animated career timeline.
- Motion outside the hero must be clearly visible and feel more cinematic: kinetic headings, scroll progress, interactive depth, project scan feedback, pulsing timeline nodes, and animated technology icons. Preserve readability and reduced-motion support.
- Use “Benjamin Deng” everywhere the portfolio displays or describes the owner’s name, and “B/D” for the monogram; do not use the previous Chinese name or monogram.
- Include the owner's Bilibili presence (`https://space.bilibili.com/86627040`) alongside professional contact links. Ground any channel descriptions, featured videos, and audience metrics in supplied or verified information.
- Use the supplied resume as the factual source for portfolio content; keep Chinese and English versions aligned. Preserve unspecified employment dates and anonymized company names without guessing. Include the resume-linked YouTube channel (`https://www.youtube.com/@playwolf719`); do not invent channel topics or audience metrics.
