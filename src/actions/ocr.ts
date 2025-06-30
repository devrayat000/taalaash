"use server";

import { env } from "@/lib/utils";

export async function getTextFromImage(_: string, formData: FormData) {
  //   const formData = new FormData();
  //   formData.append("file", image);
  const url = new URL(
    "/image-to-text",
    env("NEXT_PUBLIC_OCR_URL", "http://127.0.0.1:8000")
  );
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });
  const { text } = await response.json();
  return text as string;
}
