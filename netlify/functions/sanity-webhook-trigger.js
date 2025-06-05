// netlify/functions/sanity-webhook-trigger.js
const fetch = require('node-fetch');
const crypto = require('crypto');

const { isValidSignature } = require('@sanity/webhook');



// Replace with your GitHub details
const GITHUB_OWNER = 'binalajudiya'; // Your GitHub username/organization
const GITHUB_REPO = 'SSG';          // Your GitHub repository name
const GITHUB_WORKFLOW_FILE = 'deploy.yml'; // The name of your workflow file

const SANITY_GH_ACTIONS_WEBHOOK_SECRET = process.env.SANITY_GH_ACTIONS_WEBHOOK_SECRET; // Or SANITY_GH_ACTIONS_WEBHOOK_SECRET

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    console.log("SANITY_GH_ACTIONS_WEBHOOK_SECRET",SANITY_GH_ACTIONS_WEBHOOK_SECRET);
    const GITHUB_TOKEN = process.env.GITHUB_WORKFLOW_DISPATCH_TOKEN;
    if (!GITHUB_TOKEN) {
        console.error('GITHUB_WORKFLOW_DISPATCH_TOKEN is not set in Netlify environment variables.');
        return { statusCode: 500, body: 'Server configuration error: GitHub token missing.' };
    }
    // console.log('Received event:', JSON.stringify(event, null, 2)); // Log the entire event for debugging
    // console.log('Received headers:', JSON.stringify(event.headers, null, 2)); // Log the headers for debugging
      console.log('Received body:', event.body); // Log the raw body for debugging
    // console.log('SANITY_GH_ACTIONS_WEBHOOK_SECRET length:', SANITY_GH_ACTIONS_WEBHOOK_SECRET ? SANITY_GH_ACTIONS_WEBHOOK_SECRET.length : 'not set'); // Log the length of the secret for debugging
    // console.log('GITHUB_WORKFLOW_DISPATCH_TOKEN length:', GITHUB_TOKEN ? GITHUB_TOKEN.length : 'not set'); // Log the length of the GitHub token for debugging
    

    try {
        const rawBody = event.body; 

        // --- Sanity Webhook Secret Verification using @sanity/webhook ---
        if (!SANITY_GH_ACTIONS_WEBHOOK_SECRET) {
            console.error('SANITY_GH_ACTIONS_WEBHOOK_SECRET is not set in Netlify environment variables.');
            return { statusCode: 500, body: 'Server configuration error: Sanity secret missing.' };
        }

        try {
            // This is the core verification step
            const signature = event.headers['sanity-webhook-signature'];
            const isValid = isValidSignature(rawBody, signature, SANITY_GH_ACTIONS_WEBHOOK_SECRET);

            if (!isValid) {
                console.warn('Sanity webhook signature mismatch!');
                return { statusCode: 401, body: 'Unauthorized: Invalid Sanity signature' };
            }
            console.log('Sanity webhook signature successfully verified!');

        } catch (err) {
            console.error('Error verifying Sanity webhook signature:', err.message);
            return { statusCode: 401, body: `Unauthorized: Signature verification failed: ${err.message}` };
        }
        // --- End Sanity Webhook Verification ---

        // Now, parse the body, as it's guaranteed to be valid
        const body = JSON.parse(rawBody); 

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