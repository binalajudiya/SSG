This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.

```mermaid
graph TD
    subgraph Sanity_Studio_Content_Management
        A[Content Update / Publish]
    end

    subgraph Sanity_Webhooks
        B1{Webhook 1:<br>Netlify Deploy Hook}
        B2{Webhook 2:<br>Trigger GitHub Actions}
    end

    subgraph Netlify_Hosting_and_Functions
        C1[Netlify Site: Next.js App]
        C2[Netlify Function:<br>sanity-webhook-trigger.js]
        C3[Netlify Environment Variables]
    end

    subgraph GitHub_Version_Control_and_CI_CD
        D1[GitHub Repo: main branch]
        D2[GitHub Actions:<br>deploy.yml Workflow]
        D3[GitHub Repo: gh-pages branch]
        D4[GitHub Webhook:<br>to Cloudways]
        D5[GitHub Repository Secrets]
    end

    subgraph Cloudways_Hosting_and_Git_Auto_Deploy
        E1[Cloudways Application]
        E2[Cloudways Script:<br>gitautodeploy.php]
        E3[Cloudways API Credentials]
    end

    subgraph Live_Sites
        F1[Live Site Primary:<br>Netlify CDN]
        F2[Live Site Secondary_Staging:<br>Cloudways Server]
    end

    %% <-- ADD BLANK LINE ABOVE THIS COMMENT

    %% Flow connections
    A --on Publish--> B1;
    A --on Publish--> B2;

    B1 --POST webhook--> C1;
    C1 --(pulls source code)--> D1;
    C1 --(builds & deploys)--> F1;

    B2 --POST webhook--> C2;
    C2 --(receives webhook & verifies)--> C3;
    C2 --(dispatches workflow via GitHub API)--> D2;

    D1 --(manual code push trigger)--> D2;

    D2 --(builds app, pulls latest Sanity data)--> A;
    D2 --(pushes built /out dir)--> D3;

    D3 --(on commit push)--> D4;

    D4 --POST webhook (with IDs)--> E2;
    E2 --(authenticates & calls Cloudways API)--> E3;
    E2 --(triggers internal git pull)--> E1;
    E1 --(pulls from)--> D3;
    E1 --(runs post-pull commands:<br>npm install, npm build)--> F2;

    %% Specifics on data/secrets
    B1 -.Secret: SANITY_WEBHOOK_SECRET.- C1;
    B2 -.Secret: SANITY_GH_ACTIONS_WEBHOOK_SECRET.- C2;
    C3 -.Holds: GITHUB_WORKFLOW_DISPATCH_TOKEN,<br>SANITY_GH_ACTIONS_WEBHOOK_SECRET,<br>SANITY_WEBHOOK_SECRET.- C2;
    D2 -.Uses Secret: GH_PAGES_TOKEN.- D5;
    D5 -.Holds: GH_PAGES_TOKEN,<br>GITHUB_ACTION_DEPLOY_TEMP_V3.- D2;
    D4 -.Parameters: server_id, app_id, git_url, branch_name.- E2;
    E2 -.Uses: API_KEY, EMAIL.- E3;
```