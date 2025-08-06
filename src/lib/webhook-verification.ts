/**
 * Webhook verification middleware for incoming webhook requests
 */

import { createMiddleware } from "@tanstack/react-start";
import { verifySignature, parseSignatureHeader } from "./webhook-crypto";

export interface WebhookVerificationResult {
	verified: boolean;
	error?: string;
}

/**
 * Verify incoming webhook request
 */
export function verifyWebhookRequest(
	request: Request,
	bodyText: string,
): WebhookVerificationResult {
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

		// Verify signature
		const result = verifySignature(bodyText, signature);

		return {
			verified: result.valid,
			error: result.error,
		};
	} catch (error) {
		return {
			verified: false,
			error:
				error instanceof Error ? error.message : "Unknown verification error",
		};
	}
}
