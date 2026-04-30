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