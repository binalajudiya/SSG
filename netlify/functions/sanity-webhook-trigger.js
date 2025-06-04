// netlify/functions/sanity-webhook-trigger.js
const fetch = require('node-fetch');
const crypto = require('crypto'); // Ensure crypto is imported here if not already

// ... (rest of your existing code for GITHUB_OWNER, GITHUB_REPO, etc.) ...

const SANITY_WEBHOOK_SECRET = process.env.SANITY_GH_ACTIONS_WEBHOOK_SECRET; // Or SANITY_GH_ACTIONS_WEBHOOK_SECRET

exports.handler = async function(event, context) {
    // ... (rest of your existing code for httpMethod check and GITHUB_TOKEN check) ...

    try {
        // Keep this parsing, but ensure the HMAC uses the raw event.body
        const body = JSON.parse(event.body);

        // --- Sanity Webhook Secret Verification (with debug logs) ---
        if (SANITY_WEBHOOK_SECRET) {
            const signature = event.headers['x-sanity-signature']; // This is what Sanity sent
            const hmac = crypto.createHmac('sha256', SANITY_WEBHOOK_SECRET);
            const digest = hmac.update(event.body).digest('hex'); // IMPORTANT: Use RAW event.body here

            console.log('--- Sanity Signature Debugging ---');
            console.log('Expected Digest (from function):', digest);
            console.log('Received Signature (from Sanity):', signature);
            // console.log('Raw Event Body (from Sanity):', event.body); // UNCOMMENT WITH CAUTION - MAY CONTAIN SENSITIVE DATA
            console.log('Length of SANITY_WEBHOOK_SECRET (in func):', SANITY_WEBHOOK_SECRET.length);
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