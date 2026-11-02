Act as a Senior Frontend Engineer and Expert UI Designer.
Your task is to code a complete Landing Page on the first attempt.
- Landing Page Theme: Aurora UI
- Sections to add: Hero, Blog, Services, Contact page, Social Proof, Interactive Showcase, Testimonials, Pricing, Footer CTA & Navigation 

Generate the final code immediately following these definitions:

## Style

- **Name:** Aurora UI
- **Type:** Ethereal, Gradient, Premium, Animated
- **Keywords:** Vibrant gradients, smooth blend, Northern Lights effect, mesh gradient, luminous, atmospheric, abstract
- **Era:** 2020s Modern
- **Light/Dark:** ✓ Full / ✓ Full

## Color Palette

- **Primary:** Complementary: Blue-Orange, Purple-Yellow, Electric Blue #0080FF, Magenta #FF1493, Cyan #00FFFF
- **Secondary:** Smooth transitions (Blue→Purple→Pink→Teal), iridescent effects, blend modes (screen, multiply)

## Visual Effects

Large flowing CSS/SVG gradients, subtle 8-12s animations, depth via color layering, smooth morph

## AI Visual Direction

Create a vibrant gradient interface inspired by Northern Lights with mesh gradients, smooth color blends, flowing animations. Use complementary color pairs (blue-orange, purple-yellow), flowing background gradients, subtle continuous animations (8-12s loops), iridescent effects.

## CSS Technical

```css
background: conic-gradient or radial-gradient with multiple stops, animation: @keyframes gradient (8-12s), background-size: 200% 200%, filter: saturate(1.2), blend-mode: screen or multiply
```

## Design System Variables

```css
--gradient-colors: complementary pairs, --animation-duration: 8-12s, --blend-mode: screen, --color-saturation: 1.2, --effect: iridescent, --loop-smooth: true
```

## Implementation Checklist

- ☐ Mesh/flowing gradients applied
- ☐ 8-12s animation loop
- ☐ Complementary colors used
- ☐ Smooth color transitions
- ☐ Iridescent effect subtle
- ☐ Text contrast verified

## Execution Rules

1. Strictly follow the defined visual style.
2. Use high-quality inline SVG icons (Heroicons or Lucide style) — NEVER use emojis as icons.
3. Add `cursor-pointer` and smooth `hover` states (transition-all) on all interactive elements.
4. Required Page Structure:
   - Navbar (Logo + Links + CTA)
   - Hero Section (Impactful Headline + Subtitle + 2 buttons + 3D/Abstract visual element via CSS)
   - Features (3 cards with icons)
   - Testimonials (3 cards)
   - Pricing (3 tiers, highlight the middle one)
   - Final CTA
   - Full Footer with social links, privacy policy, terms of use, contact and SEO links.
5. All text content must be in English.
6. The visual must be CLEARLY distinct — do not create a "default Bootstrap" design. Force the use of the provided design system variables.
7. Use `<style>` tags in the head for custom classes (especially for complex backdrop-filter effects and animations) that Tailwind CDN doesn't cover.
8. Full Responsiveness: Layout must adapt perfectly to Mobile, Tablet and Desktop (vertical stack on mobile).
9. Include basic SEO, Viewport and Open Graph meta tags in `<head>`.
10. Footer must contain: Copyright 2026, Secondary navigation links and Social media icons.
11. Make the creative decisions needed to deliver the complete, functional result now.
