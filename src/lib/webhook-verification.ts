/**
 * Webhook verification middleware for incoming webhook requests
 */

import {
	parseSignatureHeader,
	verifySignature,
	importKey,
	getKey,
	initializeKeyManager,
} from "./webhook-crypto";

export interface WebhookVerificationResult {
	verified: boolean;
	error?: string;
	keyId?: string;
}

/**
 * Verify incoming webhook request
 */
export async function verifyWebhookRequest(
	request: Request,
	bodyText: string,
): Promise<WebhookVerificationResult> {
	try {
		// Get signature header
		const signatureHeader = request.headers.get("X-Webhook-Signature");
		if (!signatureHeader) {
			return {
				verified: false,
				error: "Missing X-Webhook-Signature header",
			};
		}

		// Parse signature header
		const signature = parseSignatureHeader(signatureHeader);
		if (!signature) {
			return {
				verified: false,
				error: "Invalid signature header format",
			};
		}

		// Get verification key
		const keyBase64 = getKey(signature.keyId);
		if (!keyBase64) {
			return {
				verified: false,
				error: `Unknown key ID: ${signature.keyId}`,
			};
		}

		// Import key for verification
		const key = await importKey(keyBase64);

		// Verify signature
		const result = await verifySignature(bodyText, signature, key);

		return {
			verified: result.valid,
			error: result.error,
			keyId: signature.keyId,
		};
	} catch (error) {
		return {
			verified: false,
			error:
				error instanceof Error ? error.message : "Unknown verification error",
		};
	}
}

/**
 * Express-style middleware for webhook verification
 */
export function webhookVerificationMiddleware() {
	return async (request: Request, bodyText: string) => {
		// Initialize key manager if not already done
		if (process.env.NODE_ENV !== "production") {
			await initializeKeyManager();
		}

		const result = await verifyWebhookRequest(request, bodyText);

		if (!result.verified) {
			console.error("[WebhookVerification] Failed to verify webhook:", {
				error: result.error,
				keyId: result.keyId,
				headers: Object.fromEntries(request.headers.entries()),
			});

			return new Response(
				JSON.stringify({
					success: false,
					error: "Webhook verification failed",
					details: result.error,
				}),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		console.log("[WebhookVerification] Successfully verified webhook:", {
			keyId: result.keyId,
		});

		return null; // Verification passed
	};
}

/**
 * Initialize webhook verification system
 */
export async function initializeWebhookVerification(): Promise<void> {
	await initializeKeyManager();
	console.log("[WebhookVerification] Initialization complete");
}
