# Backend, In Motion

An interactive, English language guide to backend concepts, from fundamentals to whole systems. Each lesson advances one step at a time through an animated system diagram.

**Live site:** https://backend-in-motion.vercel.app/

## What is inside

- 54 lessons across 10 chapters, with beginner, intermediate, and advanced labels
- Step-by-step isometric diagrams and concise explanations
- Interactive traffic, failure, replay, and pause controls
- Searchable course navigation and local progress tracking
- Responsive layout and light/dark themes

The diagrams and metrics are illustrative teaching scenarios, not measurements from a live backend. Some lessons use bespoke scenes; others use reusable visual components with lesson-specific steps and content.

## Run locally

This is a static site with no build step. Serve this directory with any static file server, for example:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Deployment

The `main` branch is connected to Vercel. Commits to `main` deploy automatically to the live site; other branches receive preview deployments.

## Site owner

[@amirpvry on GitHub](https://github.com/amirpvry) · [amirmahdi.alipooor@gmail.com](mailto:amirmahdi.alipooor@gmail.com)

## Project context

The visual direction was inspired by [Designed to Scale](https://designed-to-scale.vercel.app/). Backend, In Motion has its own curriculum, interface, and diagrams. The project was developed with AI assistance.
