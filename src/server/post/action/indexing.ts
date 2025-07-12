import { createServerFn } from "@tanstack/react-start";
import { Form } from "react-hook-form";
import { createWorker, OEM } from "tesseract.js";
import { object, string, array, number, instanceof as instanceof_ } from "zod";

export const recognizeText = createServerFn({ method: "POST" })
	.validator(instanceof_(FormData))
	.handler(async ({ data: formData, signal }) => {
		const fetchUrl = new URL(
			"/v1/taalaash/bulk-upload",
			"http://127.0.0.1:8001",
		);
		const results = await fetch(fetchUrl, {
			method: "POST",
			body: formData,
		})
			.then((res) => res.json())
			.then((data) => data.results as { text: string; file: string }[])
			.catch(console.log);

		console.log(results);
	});
