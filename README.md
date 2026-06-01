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

# Testing
We use Cypress for End-to-End (E2E) testing.

## Run all tests
```bash
npx cypress run
```

## Run a specific test file

To run a single test spec, use the `--spec` flag followed by the path to the file:

```bash
npx cypress run --spec "cypress/e2e/competitive-positioning.cy.ts"
```

## Open Cypress Test Runner (Interactive UI)

To open the interactive runner and see the browser executing tests in real-time:

```bash
npx cypress open
```

