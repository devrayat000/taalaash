import { createServerFn } from "@tanstack/react-start";
import { Form } from "react-hook-form";
import { createWorker, OEM } from "tesseract.js";
import { object, string, array, number, instanceof as instanceof_ } from "zod";

export const recognizeText = createServerFn({ method: "POST" })
	.validator(instanceof_(FormData))
	.handler(async ({ data, signal }) => {
		const file = data.get("file");
		if (!(file instanceof File)) {
			throw new Error("Invalid file type");
		}

		const worker = await createWorker(["eng"], OEM.LSTM_ONLY, {
			gzip: true,
			corePath: "../../../../node_modules/tesseract.js-core",
			legacyCore: true,
		});

		signal.addEventListener("abort", () => {
			worker.terminate();
		});
		const result = await worker.detect(file);
		console.log(result.data);

		// return { text: result.data.text };
	});
