graph TD
    %% Define main components/subgraphs
    subgraph Sanity Studio (CMS)
        A[Content Update / Publish]
    end

    subgraph Sanity Webhooks
        B1(Webhook 1: Netlify Deploy Hook)
        B2(Webhook 2: Trigger GitHub Actions)
    end

    subgraph Netlify (Hosting & Functions)
        C1[Netlify Site: Next.js App]
        C2[Netlify Function: sanity-webhook-trigger.js]
        C3[Netlify Environment Variables]
    end

    subgraph GitHub (Version Control & CI/CD)
        D1[GitHub Repo: main branch]
        D2[GitHub Actions: deploy.yml Workflow]
        D3[GitHub Repo: gh-pages branch]
        D4[GitHub Webhook: to Cloudways]
        D5[GitHub Repository Secrets]
    end

    subgraph Cloudways (Hosting & Git Auto-Deploy)
        E1[Cloudways Application]
        E2[Cloudways Script: gitautodeploy.php]
        E3[Cloudways API Credentials]
    end

    subgraph Live Sites
        F1[Live Site (Primary): Netlify CDN]
        F2[Live Site (Secondary/Staging): Cloudways Server]
    end

    %% Define flow connections and labels
    A -- on Publish --> B1;
    A -- on Publish --> B2;

    B1 -- POST webhook --> C1;
    C1 -- pulls source code --> D1;
    C1 -- builds & deploys --> F1;

    B2 -- POST webhook --> C2;
    C2 -- (receives webhook & verifies) --> C3;
    C2 -- (dispatches workflow via GitHub API) --> D2;

    D1 -- (manual code push trigger) --> D2;

    D2 -- (builds app, pulls latest Sanity data) --> A; %% Implied data fetch from Sanity
    D2 -- (pushes built /out dir) --> D3;

    D3 -- (on commit push) --> D4;

    D4 -- POST webhook (with IDs) --> E2;
    E2 -- (authenticates & calls Cloudways API) --> E3;
    E2 -- (triggers internal git pull) --> E1;
    E1 -- pulls from --> D3;
    E1 -- (runs post-pull commands:<br>npm install, npm build) --> F2;

    %% Add specific labels for data/secrets
    B1 -. Secret: SANITY_WEBHOOK_SECRET .- C1;
    B2 -. Secret: SANITY_GH_ACTIONS_WEBHOOK_SECRET .- C2;
    C3 -. Holds: GITHUB_WORKFLOW_DISPATCH_TOKEN,<br>SANITY_GH_ACTIONS_WEBHOOK_SECRET,<br>SANITY_WEBHOOK_SECRET .- C2;
    D2 -. Uses Secret: GH_PAGES_TOKEN .- D5;
    D5 -. Holds: GH_PAGES_TOKEN,<br>GITHUB_ACTION_DEPLOY_TEMP_V3 .- D2;
    D4 -. Parameters: server_id, app_id,<br>git_url, branch_name .- E2;
    E2 -. Uses: API_KEY, EMAIL .- E3;