# Webhook Security Implementation Summary

## Overview

I've implemented webhook encryption and verification entirely on the TypeScript side as requested. The Python backend simply passes the signature through without doing any crypto work.

## How It Works

### 1. TypeScript Frontend (New Post Upload)

1. User uploads files through the form
2. `bulkUploadWithOCR` function is called
3. Files are uploaded to S3
4. **Webhook signing happens here**:
   - Gets `WEBHOOK_VERIFICATION_KEY` from environment
   - Creates HMAC-SHA256 signature of the OCR payload
   - Includes signature in `X-Webhook-Signature` header when sending to Python OCR service

### 2. Python OCR Backend (Receives Request)

1. Receives the OCR request from TypeScript with signature in headers
2. **No crypto work**: Simply stores the signature temporarily in Redis
3. Processes OCR tasks as usual
4. When sending webhook to TypeScript: **passes the stored signature through unchanged**

### 3. TypeScript Webhook Endpoint (Receives Webhook)

1. Receives webhook from Python backend
2. **Verification happens here**:
   - Extracts signature from `X-Webhook-Signature` header
   - Verifies HMAC signature against the payload
   - Only processes webhook if signature is valid

## Key Changes Made

### TypeScript Files Modified

1. **`src/lib/webhook-crypto.ts`** - Crypto utilities using Node.js Web Crypto API
2. **`src/lib/webhook-verification.ts`** - Webhook verification middleware
3. **`src/server/post/service/indexing.ts`** - Added signing to OCR requests
4. **`src/app/webhook/ocr.ts`** - Added verification to webhook handler

### Python Files Modified

1. **`v1/taalaash/upload.py`** - Extract signature from headers, store in Redis
2. **`v1/taalaash/queue.py`** - Pass stored signature to webhook (removed all crypto code)

## Flow Diagram

```
TypeScript Frontend
│
├── 1. Create HMAC signature of OCR payload
├── 2. Send to Python with X-Webhook-Signature header
│
Python OCR Backend
│
├── 3. Store signature in Redis (no crypto)
├── 4. Process OCR
├── 5. Send webhook with stored signature header
│
TypeScript Webhook
│
├── 6. Verify HMAC signature
└── 7. Process only if valid
```

## Environment Setup

Both TypeScript and Python need:

```bash
WEBHOOK_VERIFICATION_KEY=base64_encoded_key
WEBHOOK_KEY_ID=default
```

Generate keys with:

```bash
npm run generate:webhook-key
```

## Security Features

- HMAC-SHA256 signatures (industry standard)
- 5-minute timestamp tolerance (prevents replay attacks)
- Key rotation support via Key IDs
- All crypto work done in TypeScript/Node.js (as requested)
- Python backend is crypto-free (just passes signatures through)

## Benefits

- **Secure**: Prevents webhook tampering and replay attacks
- **Simple**: Python backend has no crypto dependencies
- **Flexible**: Easy to rotate keys and manage verification
- **Standard**: Uses Web Crypto API and HMAC-SHA256
- **Efficient**: Minimal performance impact
