#!/usr/bin/env tsx

/**
 * Generate webhook verification keys
 * Usage: npm run generate:webhook-key
 */

import {
	generateKey,
	exportKey,
	generateKeyId,
} from "../src/lib/webhook-crypto.js";

async function generateWebhookKey() {
	try {
		console.log("🔑 Generating webhook verification key...\n");

		const key = await generateKey();
		const keyBase64 = await exportKey(key);
		const keyId = generateKeyId();

		console.log("Generated webhook verification credentials:");
		console.log("===============================================");
		console.log(`WEBHOOK_VERIFICATION_KEY=${keyBase64}`);
		console.log(`WEBHOOK_KEY_ID=${keyId}`);
		console.log("===============================================\n");

		console.log("Add these to your environment variables:");
		console.log("- In your Python backend .env file");
		console.log("- In your TypeScript/Node.js application environment\n");

		console.log("✅ Key generation complete!");
	} catch (error) {
		console.error("❌ Error generating key:", error);
		process.exit(1);
	}
}

generateWebhookKey();
