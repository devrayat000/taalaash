import { PDFDocument, PDFObject } from "pdf-lib";
import { cache } from "react";

const splitPdf = cache(async (pdfUrl: string, page: number) => {
  const existingPdfBytes = await fetch(pdfUrl, { cache: "force-cache" }).then(
    (res) => res.arrayBuffer()
  );
  const pdfSrcDoc = await PDFDocument.load(existingPdfBytes);
  const pdfNewDoc = await PDFDocument.create();
  const pages = await pdfNewDoc.copyPages(pdfSrcDoc, [page]);
  pages.forEach((page) => pdfNewDoc.addPage(page));

  return pdfNewDoc.saveAsBase64({ dataUri: true });
});

export default splitPdf;
