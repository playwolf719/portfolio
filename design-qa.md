# Design QA

- Source visual truth: `/Users/dengchenbo/.codex/generated_images/019ef243-d5fa-7f32-a462-64f026498943/exec-68a85be8-29c1-4f02-ac56-61c49091b543.png`
- Implementation URL: `http://127.0.0.1:5173/`
- Primary implementation screenshot: `/Users/dengchenbo/myproj/testme/portfolio/qa-hero-1440-final.png`
- Desktop viewport: `1440 x 900`
- Mobile viewport: `390 x 844`
- State coverage: hero default, project row expanded, mobile navigation open/closed, experience timeline in progress, contact section active.

## Comparison evidence

- Full-view comparison: `/Users/dengchenbo/myproj/testme/portfolio/qa-full-comparison.png`
- Focused hero comparison: `/Users/dengchenbo/myproj/testme/portfolio/qa-compare-hero-final.png`
- Focused capabilities comparison: `/Users/dengchenbo/myproj/testme/portfolio/qa-compare-capabilities.png`
- Mobile hero: `/Users/dengchenbo/myproj/testme/portfolio/qa-mobile-hero-390.png`
- Mobile navigation: `/Users/dengchenbo/myproj/testme/portfolio/qa-mobile-hero-menu-390.png`

## Findings

- No actionable P0, P1, or P2 findings remain.
- Fonts and typography: Chinese system sans fallbacks preserve the target's high-contrast grotesk hierarchy. The hero and section headings use restrained negative tracking, readable line heights, and no broken desktop wraps. Small utility labels use a monospace stack as in the target.
- Spacing and layout rhythm: the full-bleed hero, four-column metric band, three-column capability section, timeline, technology index, and final CTA follow the target's editorial spacing and thin-divider structure. Mobile collapses to a single reading column without overlap or horizontal scrolling.
- Colors and tokens: porcelain white, graphite, pale cool-gray dividers, and one cobalt accent map closely to the source. Contrast remains legible across text, buttons, navigation, and timeline states.
- Image quality and asset fidelity: the orbital hero is implemented as a real antialiased WebGL scene with physically based materials, dynamic lighting, satellite motion, and a central B/D mark. No placeholder imagery, CSS illustration, handcrafted SVG, or raster substitute is used. The scene's exact orbital angle intentionally changes over time, so a still frame will not reproduce the generated mock's perspective pixel-for-pixel.
- Copy and content: portfolio copy uses resume facts and client-facing outcomes. The added selected-systems section is an intentional content expansion that preserves the source hierarchy while making the portfolio more useful to potential clients.
- Icons: all interface icons come from one Phosphor icon family with consistent optical weight and alignment.
- States and interactions: navigation, mobile menu, project expansion, metric counters, scroll reveals, timeline progress, contact links, magnetic CTA, pointer parallax, and reduced-motion behavior are implemented.
- Accessibility and responsiveness: semantic headings and controls, visible focus rings, 42px mobile menu target, `aria-expanded`, reduced-motion support, and keyboard-accessible links/buttons are present. Desktop and mobile screenshots show no clipping or collision.

## Patches made during QA

- Increased section heading width to remove a one-character desktop wrap.
- Added the visible email link beside the hero CTA to match the selected mock.
- Changed the hero CTA to the target's outlined treatment while retaining a filled final CTA.
- Added the B/D mark to the animated 3D core.
- Made the mobile navigation surface fully opaque for reliable text contrast.
- Corrected active navigation behavior for the final contact section.
- Removed Three.js deprecation warnings and verified a clean browser console.

## Motion enhancement QA

- Capability-section screenshot: `/Users/dengchenbo/myproj/testme/portfolio/qa-motion-capabilities.png`
- Pointer-tilt screenshot: `/Users/dengchenbo/myproj/testme/portfolio/qa-motion-tilt.png`
- Expanded-project screenshot: `/Users/dengchenbo/myproj/testme/portfolio/qa-motion-projects.png`
- Timeline screenshot: `/Users/dengchenbo/myproj/testme/portfolio/qa-motion-timeline.png`
- Browser console: no errors or warnings after the motion update.
- Scroll progress: verified as a continuously changing transform tied to document progress.
- Kinetic headings: all characters resolve to full opacity after their staggered entrance and retain one semantic heading label.
- Capability depth: three interactive tilt surfaces render without horizontal overflow; pointer movement produces a live 3D transform matrix.
- Project feedback: expansion remains functional and the active row receives scanning-edge and title-shift feedback.
- Timeline and technology motion: the timeline progress rail advances with scroll; technology icons run staggered float animations.
- Accessibility: all new continuous animations are disabled by the existing `prefers-reduced-motion` override.

## Follow-up polish

- P3: the Three.js production bundle is intentionally substantial; route-level or component-level lazy loading can further reduce initial JavaScript if deployment performance becomes the next priority.
- P3: the orbit label positions are fixed to preserve legibility while the 3D model rotates; they could be projected from 3D coordinates in a future precision pass.

final result: passed
