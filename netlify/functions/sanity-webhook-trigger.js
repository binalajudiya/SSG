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
            const receivedSignatureHeader = event.headers['sanity-webhook-signature']; // Get the full header string
            const hmac = crypto.createHmac('sha256', SANITY_WEBHOOK_SECRET);
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
            console.log('Length of SANITY_GH_ACTIONS_WEBHOOK_SECRET (in func):', SANITY_WEBHOOK_SECRET.length);
            console.log('ALL INCOMING HEADERS:', event.headers); // Keep for now
            console.log('--- End Sanity Signature Debugging ---');

            // --- MODIFIED COMPARISON ---
            if (!signatureToCompare || signatureToCompare !== digest) {
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