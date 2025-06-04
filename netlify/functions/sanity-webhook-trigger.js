// netlify/functions/sanity-webhook-trigger.js
const fetch = require('node-fetch');
const crypto = require('crypto'); // Ensure crypto is imported

// ... (rest of your existing code for GITHUB_OWNER, GITHUB_REPO, etc.) ...

const SANITY_GH_ACTIONS_WEBHOOK_SECRET = process.env.SANITY_GH_ACTIONS_WEBHOOK_SECRET; // Or SANITY_GH_ACTIONS_WEBHOOK_SECRET

exports.handler = async function(event, context) {
    // ... (rest of your existing code for httpMethod check and GITHUB_TOKEN check) ...

    try {
        const body = JSON.parse(event.body);

        // --- Sanity Webhook Secret Verification (with all header logs) ---
        if (SANITY_GH_ACTIONS_WEBHOOK_SECRET) {
            const signature = event.headers['x-sanity-signature']; // This is what Sanity sent
            const hmac = crypto.createHmac('sha256', SANITY_GH_ACTIONS_WEBHOOK_SECRET);
            const digest = hmac.update(event.body).digest('hex');

            console.log('--- Sanity Signature Debugging ---');
            console.log('Expected Digest (from function):', digest);
            console.log('Received Signature (from Sanity):', signature); // Still 'undefined'
            console.log('Length of SANITY_GH_ACTIONS_WEBHOOK_SECRET (in func):', SANITY_GH_ACTIONS_WEBHOOK_SECRET.length);

            // --- ADD THIS LINE TO LOG ALL HEADERS ---
            console.log('ALL INCOMING HEADERS:', event.headers);
            // --- END OF NEW LINE ---

            console.log('--- End Sanity Signature Debugging ---');


            if (!signature || signature !== digest) {
                console.warn('Sanity webhook signature mismatch!');
                return { statusCode: 401, body: 'Unauthorized: Invalid Sanity signature' };
            }
        }
        // --- End Sanity Webhook Secret Verification ---

        // ... (rest of your existing code for GitHub API dispatch) ...

    } catch (error) {
        console.error('Error processing Sanity webhook:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to process webhook', details: error.message })
        };
    }
};