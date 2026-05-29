# SecurAgent

SecurAgent is a prototype AI agent marketplace where developers can publish agents or workflows, users can discover and verify them, and trusted agents can be run in sandboxed execution before deployment.

## MVP Features

- Marketplace listings for AI agents and workflows
- Publish section for script/API submissions
- Verification badges, audit score, permission review, and sandbox run output
- Ratings and review scoring interaction
- Recent execution tracking
- Product roadmap for automation, trust, monetization, and ecosystem scale
- Full-stack Node/Express API for agents, reviews, runs, and health checks
- Responsive desktop, tablet, and mobile app shell

## Local Development

```bash
npm install
npm run build
npm start
```

The full-stack app runs at `http://127.0.0.1:8080` by default.

For frontend-only development, run `npm run dev` and keep the API server running with `npm run server`.

## Production Build

```bash
npm run build
```

## Render

This app is configured as a Render Web Service through `render.yaml`.
