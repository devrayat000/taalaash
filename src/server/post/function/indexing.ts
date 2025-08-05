import { createServerFn } from "@tanstack/react-start";
import {
	recognizeTextFromFormData,
	recognizeTextSchema,
	indexDocuments,
	indexDocumentsSchema,
	bulkUploadWithOCR,
	bulkUploadWithOCRSchema,
} from "../service/indexing";

export const recognizeTextFn = createServerFn({ method: "POST" })
	.validator(recognizeTextSchema)
	.handler(async ({ data: formData, signal }) => {
		return await recognizeTextFromFormData(formData, signal);
	});

export const indexDocumentsFn = createServerFn({ method: "POST" })
	.validator(indexDocumentsSchema)
	.handler(async ({ data: params }) => {
		return await indexDocuments(params);
	});

export const bulkUploadWithOCRFn = createServerFn({ method: "POST" })
	.validator(bulkUploadWithOCRSchema)
	.handler(async ({ data: formData, signal }) => {
		return await bulkUploadWithOCR(formData, signal);
	});
