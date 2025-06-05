// netlify/functions/sanity-webhook-trigger.js
const fetch = require('node-fetch');
const crypto = require('crypto'); // Ensure crypto is imported

// Replace with your GitHub details
const GITHUB_OWNER = 'binalajudiya'; // Your GitHub username/organization
const GITHUB_REPO = 'SSG';          // Your GitHub repository name
const GITHUB_WORKFLOW_FILE = 'deploy.yml'; // The name of your workflow file

const SANITY_GH_ACTIONS_WEBHOOK_SECRET = process.env.SANITY_GH_ACTIONS_WEBHOOK_SECRET; // Or SANITY_GH_ACTIONS_WEBHOOK_SECRET

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const GITHUB_TOKEN = process.env.GITHUB_WORKFLOW_DISPATCH_TOKEN;
    if (!GITHUB_TOKEN) {
        console.error('GITHUB_WORKFLOW_DISPATCH_TOKEN is not set in Netlify environment variables.');
        return { statusCode: 500, body: 'Server configuration error: GitHub token missing.' };
    }
    console.log('Received event:', JSON.stringify(event, null, 2)); // Log the entire event for debugging
    console.log('Received headers:', JSON.stringify(event.headers, null, 2)); // Log the headers for debugging
    console.log('Received body:', event.body); // Log the raw body for debugging
    console.log('SANITY_GH_ACTIONS_WEBHOOK_SECRET length:', SANITY_GH_ACTIONS_WEBHOOK_SECRET ? SANITY_GH_ACTIONS_WEBHOOK_SECRET.length : 'not set'); // Log the length of the secret for debugging
    console.log('GITHUB_WORKFLOW_DISPATCH_TOKEN length:', GITHUB_TOKEN ? GITHUB_TOKEN.length : 'not set'); // Log the length of the GitHub token for debugging
    console.log('Event type:', event.headers['x-github-event']); // Log the GitHub event type for debugging
    console.log('Event source:', event.headers['x-github-delivery']); // Log the GitHub delivery ID for debugging
    console.log('Event source:', event.headers['x-sanity-webhook-signature']); // Log the Sanity webhook signature for debugging
    console.log('Event source:', event.headers['sanity-webhook-signature']); // Log the Sanity webhook signature for debugging

    try {
        //const body = JSON.parse(event.body);

        // --- Sanity Webhook Secret Verification (with all header logs) ---
        if (SANITY_GH_ACTIONS_WEBHOOK_SECRET) {
            const receivedSignatureHeader = event.headers['sanity-webhook-signature']; // Get the full header string
            const hmac = crypto.createHmac('sha256', SANITY_GH_ACTIONS_WEBHOOK_SECRET);
            const digest = hmac.update(event.body).digest('hex'); // Use RAW event.body

            // --- NEW CODE TO PARSE THE SIGNATURE HEADER ---
            let signatureToCompare;
            if (receivedSignatureHeader) {
                const parts = receivedSignatureHeader.split(',').map(part => part.trim());
                const v1Part = parts.find(part => part.startsWith('v1='));
                if (v1Part) {
                    signatureToCompare = v1Part.substring(3); // Extract the part after 'v1='
                }
            }
            // --- END NEW CODE ---

            console.log('--- Sanity Signature Debugging ---');
            console.log('Expected Digest (from function):', digest);
            console.log('Received Signature (from Sanity - v1 part):', signatureToCompare); // Now logs just the v1 part
            console.log('Length of SANITY_GH_ACTIONS_WEBHOOK_SECRET (in func):', SANITY_GH_ACTIONS_WEBHOOK_SECRET.length);
            console.log('ALL INCOMING HEADERS:', event.headers); // Keep for now
            console.log('--- End Sanity Signature Debugging ---');

            // --- MODIFIED COMPARISON ---
            if (!signatureToCompare || signatureToCompare !== digest) {
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