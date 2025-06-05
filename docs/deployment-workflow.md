# Automated Sanity to Multi-Platform Deployment Pipeline

## Overall Goal

To automatically deploy content changes from Sanity Studio to both a Netlify-hosted Next.js application (for immediate updates) and a Cloudways-hosted application (via GitHub `gh-pages` for broader deployment/backup/staging) whenever content is published in Sanity.

---

## Key Components

1.  **Sanity Studio:** Your headless CMS where content is managed and updated.
2.  **Netlify:** Hosting provider for your Next.js application (primary live site) and serverless functions that act as intermediaries.
3.  **GitHub:** Your central code repository (`main` branch for source, `gh-pages` branch for built static output) and Continuous Integration/Continuous Deployment (CI/CD) platform (GitHub Actions).
4.  **Cloudways:** Hosting provider for a separate application (secondary/staging live site), configured for automated Git deployments.

---

## Detailed Workflow Flow

This section outlines the precise sequence of events and actions involved in your automated deployment pipeline.

### Phase 1: Content Update & Sanity Triggers

This phase initiates the entire pipeline when content is modified in your CMS.

* **Trigger:** You make a content change (e.g., create, update, delete a document) and `Publish` it within your Sanity Studio.

* **Sanity Webhook 1: "Netlify Deploy on Content Changes"**
    * **Purpose:** To trigger a build of your primary Netlify-hosted website.
    * **URL:** `https://api.netlify.com/build_hooks/68400a585737f444c9641864` (Your unique Netlify Build Hook URL).
    * **Secret in Sanity:** Uses a specific secret string you configured in Sanity for this webhook, which Netlify's internal build hook system verifies.
    * **Trigger Conditions:** Configured in Sanity to fire on content `Create`, `Update`, and `Delete` events.
    * **Action:** Sanity sends a `POST` request to this URL. Netlify receives it, verifies the `X-Sanity-Signature` header, and triggers a build of your Next.js application on Netlify.
    * **Output:** Your primary live site hosted on **Netlify** (`https://sanity-next-app.netlify.app/`) gets updated with the latest content.

* **Sanity Webhook 2: "Trigger Github Actions"**
    * **Purpose:** To trigger your GitHub Actions workflow, which will update the `gh-pages` branch.
    * **URL:** `https://sanity-next-app.netlify.app/.netlify/functions/sanity-webhook-trigger` (This points to your Netlify Function).
    * **Secret in Sanity:** Uses a *different* specific secret string (`SANITY_GH_ACTIONS_WEBHOOK_SECRET`) unique to this webhook. This is critical for security and distinguishing this webhook from the first one.
    * **Trigger Conditions:** Configured in Sanity to fire on content `Create`, `Update`, and `Delete` events.
    * **Action:** Sanity sends a `POST` request to this URL.
    * **Output:** The request is received by your Netlify Function, initiating Phase 2's GitHub dispatch.

### Phase 2: Netlify's Role (Initial Build & GitHub Dispatch)

This phase ensures your primary Netlify site is updated and then dispatches the GitHub Actions workflow for the `gh-pages` update.

* **Netlify Site (Next.js Application):**
    * **Code Location:** Your Next.js source code resides in the `main` branch of your GitHub repository.
    * **Process (triggered by Sanity Webhook 1):** Netlify automatically pulls your `main` branch, installs dependencies, runs your configured build command (e.g., `npm run build`), which fetches the latest content from Sanity Studio, and then deploys the generated static files to Netlify's CDN. This ensures your primary live site is always up-to-date.

* **Netlify Function (`sanity-webhook-trigger.js`):**
    * **Code Location:** `your-repo/.netlify/functions/sanity-webhook-trigger.js`.
    * **Environment Variables (configured in Netlify Site Settings for your site):**
        * `SANITY_GH_ACTIONS_WEBHOOK_SECRET`: **Crucial.** This variable stores the secret string that *must* exactly match the secret configured in Sanity Webhook 2. It's used by your function to verify the incoming `X-Sanity-Signature` header from Sanity, ensuring the webhook is authentic.
        * `GITHUB_WORKFLOW_DISPATCH_TOKEN`: **Crucial.** This variable stores a GitHub Personal Access Token (PAT) with `repo` and `workflow` scopes.
    * **Process (triggered by Sanity Webhook 2):**
        1.  Receives the `POST` request from Sanity Webhook 2.
        2.  Uses the `@sanity/webhook` npm package and `SANITY_GH_ACTIONS_WEBHOOK_SECRET` to verify the authenticity of the incoming webhook request by checking the `X-Sanity-Signature` header.
        3.  **Authentication Check:** If the signature verification fails, the function returns an "Unauthorized" error, and the process stops. This prevents unauthorized triggers of your GitHub workflow.
        4.  If the signature is valid, the function constructs an API request to GitHub's `workflow_dispatch` endpoint.
        5.  Uses `GITHUB_WORKFLOW_DISPATCH_TOKEN` in the Authorization header to authenticate with the GitHub API.
        6.  Dispatches the `deploy.yml` workflow on your GitHub repository (specifically targeting the `main` branch where `deploy.yml` resides).
    * **Output:** A new run of your `deploy.yml` GitHub Actions workflow is initiated.

### Phase 3: GitHub Actions Deployment

This phase is the core CI/CD pipeline that builds your application and updates the `gh-pages` branch.

* **`deploy.yml` Workflow:**
    * **Code Location:** `your-repo/.github/workflows/deploy.yml`.
    * **Triggers:**
        * `push` to `main` branch (for direct code pushes by developers).
        * `workflow_dispatch` (triggered by your Netlify Function when Sanity content changes).
    * **GitHub Repository Secrets (configured in GitHub Repository Settings):**
        * `GH_PAGES_TOKEN`: **Crucial.** A GitHub Personal Access Token (PAT) with `repo` scope (or at least `contents: write`) that allows GitHub Actions to push commits.
        * `GITHUB_ACTION_DEPLOY_TEMP_V3`: (You mentioned this; ensure `GH_PAGES_TOKEN` is the one actively used in your workflow for pushing, as this might be a test or backup PAT).
    * **Process:**
        1.  **Checkout Code:** Pulls the latest source code from your `main` branch.
        2.  **Setup Environment:** Sets up Node.js.
        3.  **Install Dependencies:** Runs `npm ci` to install project dependencies.
        4.  **Build Application:** Runs `npm run build` (or `npm run build && npm run export`), which executes your Next.js build process. During this process, the application will again fetch the *latest* content directly from Sanity Studio. This generates the static output (`out/` directory).
        5.  **Deploy to `gh-pages`:** Uses the `peaceiris/actions-gh-pages` action. This action takes the contents of your `out/` directory, creates a new commit on your `gh-pages` branch, and pushes it to your GitHub repository. It uses the `GH_PAGES_TOKEN` for authentication.
    * **Output:** A new commit appears on your `gh-pages` branch, containing the updated static files reflecting the latest Sanity content.

**Phase 4: Cloudways Deployment**

This phase ensures your Cloudways application is updated with the latest static files from GitHub.

* **GitHub Webhook (to Cloudways):**
    * **Purpose:** To notify Cloudways of new changes on `gh-pages`.
    * **URL:** `https://your-domain.com/gitautodeploy.php?server_id=1473756&app_id=5575302&git_url=git@github.com:binalajudiya/SSG.git&branch_name=gh-pages` (This URL contains the necessary parameters for Cloudways).
    * **Trigger:** Configured in GitHub to fire on a `push` event to the `gh-pages` branch.
    * **Action:** GitHub sends a `POST` request to this URL.
    * **Output:** The request is received by your `gitautodeploy.php` script on your Cloudways server.

* **Cloudways `gitautodeploy.php` Script:**
    * **Code Location:** On your Cloudways server (e.g., in your application's `public_html` directory).
    * **API Credentials (hardcoded in the script):**
        * `EMAIL`: Your Cloudways account email.
        * `API_KEY`: Your Cloudways API key.
    * **Process:**
        1.  Receives the webhook request from GitHub.
        2.  Uses the `EMAIL` and `API_KEY` to authenticate with the Cloudways API (`/oauth/access_token` endpoint).
        3.  **Authentication Check:** If authentication fails, the script logs an error and stops.
        4.  Makes a `POST` request to the Cloudways API's `/git/pull` endpoint (`/git/pull`), passing the `server_id`, `app_id`, `git_url`, and `branch_name` obtained from the incoming GitHub webhook URL.
        5.  Cloudways's internal system receives this API call.
        6.  **Cloudways internal system:** Performs a `git pull` operation on your Cloudways application, fetching the latest commits from the `gh-pages` branch of your specified Git URL.
        7.  **Cloudways Post-Pull Commands:** (Crucial: These are configured directly in your Cloudways application's Deployment/Git settings)
            * Typically, `npm install` to update dependencies.
            * Typically, `npm run build` (or `npm run export`) to build the Next.js application within the Cloudways environment.
    * **Output:** Your secondary/staging live site hosted on **Cloudways** gets updated with the latest content reflecting the `gh-pages` branch.

---

### **Key Secrets and IDs Overview:**

It's critical to ensure these values are precisely matched between their source and where they are used.

| Variable Name                          | Type         | Value Source                                         | Configured Location                                            | Used By                                              | Purpose                                                                    |
| :------------------------------------- | :----------- | :--------------------------------------------------- | :------------------------------------------------------------- | :----------------------------------------------------- | :------------------------------------------------------------------------- |
| `SANITY_WEBHOOK_SECRET`                | String/Secret | Your unique string                                   | Sanity Webhook 1 ("Netlify Deploy"), Netlify Build Hook settings | Netlify's internal build hook system                   | Verifies authenticity of Sanity's build hook triggers.                   |
| `SANITY_GH_ACTIONS_WEBHOOK_SECRET`     | String/Secret | Your unique string (different from above)            | Sanity Webhook 2 ("Trigger Github Actions"), Netlify Env Vars  | Netlify Function (`sanity-webhook-trigger.js`)         | Verifies authenticity of Sanity webhook triggering GitHub Actions.       |
| `GITHUB_WORKFLOW_DISPATCH_TOKEN`       | GitHub PAT     | PAT with `repo` & `workflow` scopes                  | Netlify Env Variables                                          | Netlify Function (`sanity-webhook-trigger.js`)         | Authenticates with GitHub API to dispatch workflows.                     |
| `GH_PAGES_TOKEN`                       | GitHub PAT     | PAT with `repo` scope                                | GitHub Repository Secrets                              | GitHub Actions `deploy.yml` (`peaceiris/actions-gh-pages`) | Authenticates GitHub Actions to push `out/` to `gh-pages`.                |
| `API_KEY` (Cloudways)                  | String/Secret | From Cloudways Dashboard -> API page                 | Hardcoded in `gitautodeploy.php`                               | `gitautodeploy.php` script                             | Authenticates with Cloudways API to trigger Git operations.              |
| `EMAIL` (Cloudways)                    | String         | Your Cloudways account email                         | Hardcoded in `gitautodeploy.php`                               | `gitautodeploy.php` script                             | Authenticates with Cloudways API.                                        |
| `server_id`                            | ID             | From Cloudways Dashboard (Server details)            | GitHub Webhook URL (parameter)                                 | `gitautodeploy.php` script                             | Identifies the target server for Cloudways Git pull.                     |
| `app_id`                               | ID             | From Cloudways Dashboard (Application details)       | GitHub Webhook URL (parameter)                                 | `gitautodeploy.php` script                             | Identifies the target application for Cloudways Git pull.                |
| `git_url` (`git@github.com:binalajudiya/SSG.git`) | String         | SSH Git URL of your GitHub repository              | GitHub Webhook URL (parameter)                                 | `gitautodeploy.php` script                             | Specifies the source repository for Cloudways Git pull.                  |
| `branch_name` (`gh-pages`)             | String         | Name of the branch to pull (e.g., `gh-pages`)      | GitHub Webhook URL (parameter)                                 | `gitautodeploy.php` script                             | Specifies the branch to pull from.                                       |
| `GITHUB_ACTION_DEPLOY_TEMP_V3`         | GitHub PAT     | (Used as a test/backup PAT in previous steps)        | GitHub Repository Secrets                                      | (Ensure `GH_PAGES_TOKEN` is the one actively used)   | A test or backup PAT, ensure it's not inadvertently being used instead.  |
