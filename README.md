# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```

# Deploy

## Vercel

The first time the vercel connection must be configured:

```bash
$ npm i -g vercel
$ vercel login
...
$ vercel --prod
? Set up and deploy “~/<path>/insights-web”? yes
? Which scope should contain your project? Equipo8
? Found project “equipo8/insights-web”. Link to it? yes
🔗  Linked to equipo8/insights-web (created .vercel and added it to .gitignore)
? Would you like to pull environment variables now? yes
> Downloading `development` Environment Variables for equipo8/insights-web
✅  Created .env.local file
...
```

Next time only `vercel --prod` is necessary.
---
# Development
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
---

# Testing

We use Cypress for End-to-End (E2E) testing with code coverage via `@cypress/code-coverage`.

## Run all tests

Starts the server automatically, runs all specs, and generates a coverage report:

```bash
npm run test:e2e
```

## Run a specific test file

```bash
npm run test:e2e:sales
npm run test:e2e:audiences
npm run test:e2e:executive
npm run test:e2e:competitive
npm run test:e2e:auth
```

## Open Cypress Test Runner (Interactive UI)

To open the interactive runner and see the browser executing tests in real-time:

```bash
npm run cypress:open
```

> The server must be running separately when using the interactive runner:
> ```bash
> npm run dev:babel
> ```
> Use `dev:babel` instead of `dev` — the standard `dev` uses Turbopack which disables code coverage instrumentation.

## View coverage report

After running tests, open the HTML report:

```bash
# macOS / Linux
open coverage/lcov-report/index.html

# Windows
start coverage/lcov-report/index.html
```

## Check coverage thresholds

Fails if coverage is below the minimum thresholds (50% branches/functions, 70% lines/statements):

```bash
npm run coverage:check
```