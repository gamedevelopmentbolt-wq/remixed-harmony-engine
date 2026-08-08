// HowTo step lists for a handful of high-traffic tools. The tool route emits
// these as schema.org HowTo JSON-LD when present, which historically helps win
// featured snippets on "how to …" queries. Keep steps concrete, short, and
// grounded in what the tool actually does on the page.

export interface HowToStep {
  name: string;
  text: string;
}

export const howToSteps: Record<string, HowToStep[]> = {
  "merge-pdf": [
    { name: "Open the tool", text: "Go to the Merge PDF tool — nothing to install." },
    { name: "Add your PDFs", text: "Drop two or more PDF files onto the dropzone, or click to select them." },
    { name: "Reorder", text: "Drag files up or down to set the final page order." },
    { name: "Merge", text: "Click Merge — your browser combines the files locally, without uploading." },
    { name: "Download", text: "Download the single merged PDF." },
  ],
  "split-pdf": [
    { name: "Open the tool", text: "Go to the Split PDF tool." },
    { name: "Add your PDF", text: "Drop the PDF you want to split into the dropzone." },
    { name: "Choose the split", text: "Pick single-page split or a page range." },
    { name: "Split", text: "Click Split — the tool creates one PDF per page (or per range) in your browser." },
    { name: "Download the ZIP", text: "Download the resulting ZIP containing every split PDF." },
  ],
  "compress-pdf": [
    { name: "Open the tool", text: "Go to the Compress PDF tool." },
    { name: "Add your PDF", text: "Drop the PDF you need to shrink into the dropzone." },
    { name: "Pick a quality", text: "Choose a compression preset — higher compression = smaller file, lower fidelity." },
    { name: "Compress", text: "Click Compress — your browser re-encodes each page locally." },
    { name: "Download", text: "Download the smaller PDF. See the before/after size for confirmation." },
  ],
  "image-converter": [
    { name: "Open the tool", text: "Go to the Image Converter." },
    { name: "Add images", text: "Drop one or more JPG, PNG or WEBP images into the dropzone." },
    { name: "Pick a target format", text: "Choose JPG, PNG or WEBP and (optional) a quality." },
    { name: "Convert", text: "Click Convert — every image is re-encoded in your browser." },
    { name: "Download", text: "Download each converted image, or grab them all as a ZIP." },
  ],
  "pdf-to-jpg": [
    { name: "Open the tool", text: "Go to the PDF to JPG tool." },
    { name: "Add your PDF", text: "Drop the PDF you want to rasterize into the dropzone." },
    { name: "Choose resolution", text: "Pick an output DPI — higher DPI means larger, sharper JPGs." },
    { name: "Convert", text: "Click Convert. Each page is rendered to a JPG locally in your browser." },
    { name: "Download", text: "Download the individual JPGs or a single ZIP." },
  ],
  "ocr": [
    { name: "Open the tool", text: "Go to the OCR tool. Recognition runs in your browser using Tesseract." },
    { name: "Add your image or PDF", text: "Drop a scanned image or PDF into the dropzone." },
    { name: "Pick a language", text: "Choose the primary language of the document — matters most for accuracy." },
    { name: "Recognize", text: "Click Recognize. Text is extracted locally, no server upload." },
    { name: "Copy or download", text: "Copy the recognized text or download it as a .txt file." },
  ],
  "remove-background": [
    { name: "Open the tool", text: "Go to the Remove Background tool." },
    { name: "Add a photo", text: "Drop a JPG or PNG photo of the subject into the dropzone." },
    { name: "Process", text: "The neural network runs locally in your browser and separates subject from background." },
    { name: "Download", text: "Download a clean transparent PNG — ready for design or product photos." },
  ],
  "qr-code-generator": [
    { name: "Open the tool", text: "Go to the QR Code Generator." },
    { name: "Enter text or a URL", text: "Type or paste the content you want the QR code to encode." },
    { name: "Tweak (optional)", text: "Adjust size and error-correction level if you need it printable and scannable at small sizes." },
    { name: "Download", text: "Download the QR code as PNG or SVG." },
  ],
};

export const getHowToSteps = (slug: string): HowToStep[] | undefined => howToSteps[slug];