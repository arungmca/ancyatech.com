---
version: "alpha"
name: "Aurora UI"
description: "Vibrant gradient interface inspired by Northern Lights with mesh gradients, smooth color blends, flowing animations. Ideal for saas premium, creative tools, agência moderna, brand exclusiva. AI-ready template."
colors:
  primary: "#0080FF"
  secondary: "#FF1493"
  tertiary: "#00FFFF"

typography:
  h1:
    fontFamily: -apple-system, sans-serif
    fontSize: 2.25rem
    fontWeight: 700
  body-md:
    fontFamily: -apple-system, sans-serif
    fontSize: 1rem
    fontWeight: 400
  label-caps:
    fontFamily: -apple-system, sans-serif
    fontSize: 0.75rem
    fontWeight: 500
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    padding: 12px
---

## Overview

Vibrant gradient interface inspired by Northern Lights with mesh gradients, smooth color blends, flowing animations. Ideal for saas premium, creative tools, agência moderna, brand exclusiva. AI-ready template. Stripe changed everything. Around 2020, their landing page dropped those animated mesh gradients and suddenly every SaaS founder wanted "that Stripe look." But the technique itself goes deeper — mesh gradients existed in Illustrator for decades, largely ignored by web designers because CSS couldn't reproduce them. Then Figma shipped native mesh gradient plugins, Josh Comeau wrote about CSS gradient animations, and the floodgates opened.

The aurora aesthetic — those slow-moving, Northern Lights color fields — emerged as designers realized static gradients felt dated. Movement was the differentiator. CSS Houdini's @property rule finally let us animate color stops without JavaScript hacks, and suddenly you could get buttery 60fps gradient transitions with pure CSS. The performance story matters here: animated gradients done wrong will torch mobile batteries and trigger compositing nightmares.

By 2023, the trend matured. The best implementations use subtle, slow movement — think 8-12 second animation cycles — rather than the frantic color-shifting that plagued early attempts. Restraint won.

- Density: 5/10 — Balanced
- Variance: 4/10 — Moderate
- Motion: 6/10 — Expressive

- **Style:** Ethereal, Gradient, Premium, Animated
- **Keywords:** Vibrant gradients, smooth blend, Northern Lights effect, mesh gradient, luminous, atmospheric, abstract
- **Era:** 2020s Modern
- **Light/Dark:** ✓ Full / ✓ Full

## Colors

- **Electric Blue** (#0080FF) — Accent highlight, links and focus states
- **Magenta** (#FF1493) — Decorative accent, highlight elements
- **Cyan** (#00FFFF) — Accent highlight, links and focus states


## Typography

- **Display / Hero:** System UI stack (-apple-system, sans-serif) — Weight 700, tight tracking, used for headline impact
- **Body:** System UI stack (-apple-system, sans-serif) — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** System UI stack (-apple-system, sans-serif) — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem


## Layout

- **Grid:** CSS Grid primary. Max-width containment: 1280px centered with 1.5rem side padding.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Split-screen (text left, visual right).
- **Feature sections:** Zig-zag alternating text+image rows. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).


## Elevation & Depth

Large flowing CSS/SVG gradients, subtle 8-12s animations, depth via color layering, smooth morph

- **Physics:** Spring — stiffness 120, damping 20. Confident, weighted transitions.
- **Entry animations:** Fade + translate-Y (16px → 0) over 480ms ease-out. Staggered cascades for lists: 100ms between items.
- **Hover states:** Scale(1.03) + shadow lift over 200ms.
- **Page transitions:** Fade + slide (300ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.




## Shapes

Base corner radius: 4px. See rounded tokens in front matter for the full scale.

## Components

- **Primary Button:** Moderately rounded (0.75rem) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Moderately rounded (0.75rem) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.


## Do's and Don'ts

- No emojis in UI — use icon system only (Lucide, Heroicons)
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Mesh/flowing gradients applied
- Do 8-12s animation loop
- Do Complementary colors used
- Do Smooth color transitions
- Do Iridescent effect subtle
- Do Text contrast verified


## Use Case

SaaS premium, Creative tools, Agência moderna, Brand exclusiva

