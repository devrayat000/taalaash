import { env } from "./utils";

// Function to encrypt text using AES encryption
export async function encrypt(text: string, key: Uint8Array): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const encodedText = new TextEncoder().encode(text);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "AES-CBC" },
    false,
    ["encrypt"]
  );
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv: iv, length: 128 },
    cryptoKey,
    encodedText
  );
  const encryptedBytes = new Uint8Array(encryptedData);
  const ivHex = Array.from(iv)
    .map((byte) => ("0" + byte.toString(16)).slice(-2))
    .join("");
  const encryptedTextHex = Array.from(encryptedBytes)
    .map((byte) => ("0" + byte.toString(16)).slice(-2))
    .join("");
  return ivHex + "." + encryptedTextHex;
}

// Function to decrypt AES encrypted text
export async function decrypt(
  encryptedText: string,
  key: Uint8Array
): Promise<string | null> {
  try {
    const [ivHex, encryptedTextHex] = encryptedText.split(".");
    const iv = Uint8Array.from(
      ivHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
    const encryptedBytes = Uint8Array.from(
      encryptedTextHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv: iv, length: 128 },
      cryptoKey,
      encryptedBytes
    );
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}

const secret_key = env("NEXT_PUBLIC_ENCRYPTION_KEY", "YourSecretKey1234");

export const encryptionKey = new TextEncoder().encode(secret_key).slice(0, 16); // Using first 16 bytes for 128-bit key
