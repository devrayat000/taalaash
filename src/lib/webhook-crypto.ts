/**
 * Webhook encryption and verification utilities using Web Crypto API
 */

import { webcrypto } from "node:crypto";

// Use Node.js crypto if available, fallback to global crypto
const crypto = webcrypto || globalThis.crypto;

const ALGORITHM = "HMAC";
const HASH = "SHA-256";
const TOLERANCE_MS = 5 * 60 * 1000; // 5 minutes tolerance

export interface WebhookSignature {
	timestamp: string;
	signature: string;
	keyId: string;
}

/**
 * Generate a new HMAC key for webhook signing
 */
export async function generateKey(): Promise<CryptoKey> {
	return await crypto.subtle.generateKey(
		{
			name: ALGORITHM,
			hash: HASH,
		},
		true, // extractable
		["sign", "verify"],
	);
}

/**
 * Export a CryptoKey to base64 string for storage/transmission
 */
export async function exportKey(key: CryptoKey): Promise<string> {
	const keyBuffer = await crypto.subtle.exportKey("raw", key);
	return btoa(String.fromCharCode(...new Uint8Array(keyBuffer)));
}

/**
 * Import a base64 key string back to CryptoKey
 */
export async function importKey(keyBase64: string): Promise<CryptoKey> {
	const keyBuffer = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
	return await crypto.subtle.importKey(
		"raw",
		keyBuffer,
		{
			name: ALGORITHM,
			hash: HASH,
		},
		false, // not extractable for security
		["verify"],
	);
}

/**
 * Create a signature for webhook payload (for sending)
 */
export async function createSignature(
	payload: string,
	key: CryptoKey,
	keyId: string,
	timestamp?: string,
): Promise<WebhookSignature> {
	const ts = timestamp || Date.now().toString();
	const signaturePayload = `${ts}.${payload}`;

	const encoder = new TextEncoder();
	const data = encoder.encode(signaturePayload);

	const signatureBuffer = await crypto.subtle.sign(ALGORITHM, key, data);

	const signature = btoa(
		String.fromCharCode(...new Uint8Array(signatureBuffer)),
	);

	return {
		timestamp: ts,
		signature,
		keyId,
	};
}

/**
 * Verify a webhook signature (for receiving)
 */
export async function verifySignature(
	payload: string,
	webhookSignature: WebhookSignature,
	key: CryptoKey,
): Promise<{ valid: boolean; error?: string }> {
	try {
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

		const encoder = new TextEncoder();
		const data = encoder.encode(signaturePayload);

		// Decode the signature
		const signatureBuffer = Uint8Array.from(
			atob(webhookSignature.signature),
			(c) => c.charCodeAt(0),
		);

		// Verify the signature
		const isValid = await crypto.subtle.verify(
			ALGORITHM,
			key,
			signatureBuffer,
			data,
		);

		return { valid: isValid };
	} catch (error) {
		return {
			valid: false,
			error:
				error instanceof Error ? error.message : "Unknown verification error",
		};
	}
}

/**
 * Parse webhook signature from header value
 * Expected format: "t=<timestamp>,v1=<signature>,kid=<keyId>"
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

		if (parsed.t && parsed.v1 && parsed.kid) {
			return {
				timestamp: parsed.t,
				signature: parsed.v1,
				keyId: parsed.kid,
			};
		}

		return null;
	} catch {
		return null;
	}
}

/**
 * Create signature header value
 * Format: "t=<timestamp>,v1=<signature>,kid=<keyId>"
 */
export function createSignatureHeader(signature: WebhookSignature): string {
	return `t=${signature.timestamp},v1=${signature.signature},kid=${signature.keyId}`;
}

/**
 * Generate a secure key ID
 */
export function generateKeyId(): string {
	const buffer = new Uint8Array(16);
	crypto.getRandomValues(buffer);
	return Array.from(buffer, (byte) => byte.toString(16).padStart(2, "0")).join(
		"",
	);
}

/**
 * Webhook key management for storing/retrieving verification keys
 */
const keys = new Map<string, string>(); // keyId -> base64Key

/**
 * Store a verification key
 */
export function storeKey(keyId: string, keyBase64: string): void {
	keys.set(keyId, keyBase64);
}

/**
 * Get a verification key
 */
export function getKey(keyId: string): string | undefined {
	return keys.get(keyId);
}

/**
 * Remove a verification key
 */
export function removeKey(keyId: string): boolean {
	return keys.delete(keyId);
}

/**
 * List all key IDs
 */
export function getKeyIds(): string[] {
	return Array.from(keys.keys());
}

/**
 * Initialize with environment variables or default keys
 */
export async function initializeKeyManager(): Promise<void> {
	// Try to load keys from environment variables
	const defaultKeyBase64 = process.env.WEBHOOK_VERIFICATION_KEY;
	const defaultKeyId = process.env.WEBHOOK_KEY_ID || "default";

	if (defaultKeyBase64) {
		storeKey(defaultKeyId, defaultKeyBase64);
		console.log(`[WebhookKeyManager] Loaded verification key: ${defaultKeyId}`);
	} else {
		// Generate a default key for development
		const key = await generateKey();
		const keyBase64 = await exportKey(key);
		storeKey(defaultKeyId, keyBase64);
		console.warn(
			`[WebhookKeyManager] Generated default verification key: ${defaultKeyId}`,
		);
		console.warn(
			`[WebhookKeyManager] Set WEBHOOK_VERIFICATION_KEY=${keyBase64} in your environment`,
		);
	}
}
