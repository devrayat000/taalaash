import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function env(key: string): string | undefined;
export function env(key: string, fallback: string): string;
export function env(key: string, fallback?: string) {
  return process.env[key] || fallback;
}

env.int = (key: string, fallback?: number) => {
  const val = env(key);
  return val ? parseInt(val) : fallback;
};

env.bool = (key: string, fallback?: boolean) => {
  const val = env(key);
  return val ? val === "true" : fallback;
};

env.string = (key: string, fallback?: string) => {
  // @ts-ignore
  return env(key, fallback);
};

export async function createFile(
  fileUrl: string,
  type: `${string}/${string}` = "image/jpeg"
) {
  if (typeof window === "undefined") {
    return null;
  }

  const response = await fetch(fileUrl);
  const data = await response.blob();
  const metadata = { type };
  const fileName = fileUrl.split("/").pop();

  return new File([data], decodeURIComponent(fileName!), metadata);
}

export function getAvatarLetters(fullName: string): string {
  const words = fullName?.split(" ");

  if (words.length === 1) {
    // For a single word, take the first two characters
    return words[0].substring(0, 2).toUpperCase();
  } else {
    // For multiple words, take the first character of the first name and the first character of the last name
    const firstName = words[0].charAt(0);
    const lastName = words[words.length - 1].charAt(0);

    return (firstName + lastName).toUpperCase();
  }
}
