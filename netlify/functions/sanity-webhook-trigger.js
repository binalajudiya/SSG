// netlify/functions/sanity-webhook-trigger.js
const fetch = require('node-fetch'); // Use require for commonjs in Netlify Functions

// Replace with your GitHub details
const GITHUB_OWNER = 'binalajudiya'; // Your GitHub username/organization
const GITHUB_REPO = 'SSG';          // Your GitHub repository name
const GITHUB_WORKFLOW_FILE = 'deploy.yml'; // The name of your workflow file

// It's highly recommended to use a secret from Sanity for security
const TEST_NETLIFY_FUNCTION_KEY = process.env.TEST_NETLIFY_FUNCTION_KEY; // Will set in next step

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const GITHUB_TOKEN = process.env.GITHUB_WORKFLOW_DISPATCH_TOKEN;
    if (!GITHUB_TOKEN) {
        console.error('GITHUB_WORKFLOW_DISPATCH_TOKEN is not set in Netlify environment variables.');
        return { statusCode: 500, body: 'Server configuration error: GitHub token missing.' };
    }

    try {
        const body = JSON.parse(event.body);

        // --- Optional: Verify Sanity Webhook Secret (Highly Recommended) ---
        // Sanity sends a HMAC-SHA256 signature in the 'X-Sanity-Signature' header
        // You generate the expected signature and compare
        if (TEST_NETLIFY_FUNCTION_KEY) {
            const crypto = require('crypto');
            const signature = event.headers['x-sanity-signature'];
            const hmac = crypto.createHmac('sha256', TEST_NETLIFY_FUNCTION_KEY);
            const digest = hmac.update(event.body).digest('hex');

            if (!signature || signature !== digest) {
                console.warn('Sanity webhook signature mismatch!');
                return { statusCode: 401, body: 'Unauthorized: Invalid Sanity signature' };
            }
        }
        // --- End Sanity Webhook Secret Verification ---

        console.log('Received Sanity webhook. Triggering GitHub Actions workflow...');

        const response = await fetch(`https://api.github.com/repos/<span class="math-inline">\{GITHUB\_OWNER\}/</span>{GITHUB_REPO}/actions/workflows/${GITHUB_WORKFLOW_FILE}/dispatches`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'Netlify-Sanity-Webhook-Trigger' // Required by GitHub API
            },
            body: JSON.stringify({
                ref: 'main', // The branch where your 'deploy.yml' workflow resides
                // You can pass inputs to your workflow if needed, e.g.:
                // inputs: {
                //    message: 'Sanity content updated'
                // }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`GitHub API error: ${response.status} - ${errorText}`);
            return { statusCode: response.status, body: `Failed to trigger GitHub Actions: ${errorText}` };
        }

        console.log('Successfully dispatched GitHub Actions workflow.');
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'GitHub Actions workflow dispatched successfully.' })
        };

    } catch (error) {
        console.error('Error processing Sanity webhook:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to process webhook', details: error.message })
        };
    }
};