/**
 * Webhook encryption and verification utilities using Node.js crypto
 */

import { createHmac, timingSafeEqual } from "node:crypto";

const ALGORITHM = "sha256";
const TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes tolerance

export interface WebhookSignature {
	timestamp: string;
	signature: string;
}

const WEBHOOK_SIGNING_KEY = process.env.WEBHOOK_SIGNING_KEY;

/**
 * Create a signature for webhook payload (for sending)
 */
export function createSignature(
	payload: string,
	timestamp?: string,
): WebhookSignature {
	if (!WEBHOOK_SIGNING_KEY) {
		throw new Error("WEBHOOK_SIGNING_KEY environment variable is not set");
	}

	const ts = timestamp || Date.now().toString();
	const signaturePayload = `${ts}.${payload}`;

	const key = Buffer.from(WEBHOOK_SIGNING_KEY, "base64");
	const signature = createHmac(ALGORITHM, key)
		.update(signaturePayload, "utf8")
		.digest("base64");

	return {
		timestamp: ts,
		signature,
	};
}

/**
 * Verify a webhook signature (for receiving)
 */
export function verifySignature(
	payload: string,
	webhookSignature: WebhookSignature,
): { valid: boolean; error?: string } {
	try {
		if (!WEBHOOK_SIGNING_KEY) {
			return {
				valid: false,
				error: "WEBHOOK_SIGNING_KEY environment variable is not set",
			};
		}

		// Check timestamp tolerance
		const currentTime = Date.now();
		const signatureTime = Number.parseInt(webhookSignature.timestamp);

		if (Number.isNaN(signatureTime)) {
			return { valid: false, error: "Invalid timestamp format" };
		}

		const timeDiff = Math.abs(currentTime - signatureTime);
		if (timeDiff > TOLERANCE_MS) {
			return {
				valid: false,
				error: `Timestamp outside tolerance window. Diff: ${timeDiff}ms, Max: ${TOLERANCE_MS}ms`,
			};
		}

		// Reconstruct the signed payload
		const signaturePayload = `${webhookSignature.timestamp}.${payload}`;

		// Create expected signature
		const key = Buffer.from(WEBHOOK_SIGNING_KEY, "base64");
		const expectedSignature = createHmac(ALGORITHM, key)
			.update(signaturePayload, "utf8")
			.digest("base64");

		// Use timing-safe comparison
		const providedSignature = Buffer.from(webhookSignature.signature, "base64");
		const expectedSignatureBuffer = Buffer.from(expectedSignature, "base64");

		if (providedSignature.length !== expectedSignatureBuffer.length) {
			return { valid: false, error: "Signature length mismatch" };
		}

		const isValid = timingSafeEqual(providedSignature, expectedSignatureBuffer);

		return { valid: isValid };
	} catch (error) {
		console.log("[WebhookCrypto] Error verifying signature:", error);
		return {
			valid: false,
			error:
				error instanceof Error ? error.message : "Unknown verification error",
		};
	}
}

/**
 * Parse webhook signature from header value
 * Expected format: "t=<timestamp>,v1=<signature>"
 */
export function parseSignatureHeader(header: string): WebhookSignature | null {
	try {
		const parts = header.split(",");
		const parsed: Record<string, string> = {};

		for (const part of parts) {
			const [key, value] = part.trim().split("=", 2);
			if (key && value) {
				parsed[key] = value;
			}
		}

		if (parsed.t && parsed.v1) {
			return {
				timestamp: parsed.t,
				signature: parsed.v1,
			};
		}

		return null;
	} catch {
		return null;
	}
}
