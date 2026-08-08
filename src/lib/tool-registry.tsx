import { lazy, Suspense, type ComponentType } from "react";
import { Loader2 } from "lucide-react";
import { I18nProvider, LOCALE_META, dictionaries, localePath, type Locale } from "@/lib/i18n";

// Per-slug React.lazy — each tool ships in its own chunk and is only fetched
// when that tool is visited. Was previously ~90 eager imports at route load.
const lz = <K extends string>(load: () => Promise<Record<string, ComponentType>>, key: K) =>
  lazy(async () => ({ default: (await load())[key] }));

const registry: Record<string, ComponentType> = {
  "merge-pdf": lz(() => import("@/components/tools/MergePdfTool"), "MergePdfTool"),
  "pdf-editor": lz(() => import("@/components/tools/PdfEditorTool"), "PdfEditorTool"),
  "split-pdf": lz(() => import("@/components/tools/SplitPdfTool"), "SplitPdfTool"),
  "compress-pdf": lz(() => import("@/components/tools/CompressPdfTool"), "CompressPdfTool"),
  "pdf-to-jpg": lz(() => import("@/components/tools/PdfToJpgTool"), "PdfToJpgTool"),
  "image-to-pdf": lz(() => import("@/components/tools/ImageToPdfTool"), "ImageToPdfTool"),
  "compress-image": lz(() => import("@/components/tools/CompressImageTool"), "CompressImageTool"),
  "image-converter": lz(() => import("@/components/tools/ImageConverterTool"), "ImageConverterTool"),
  "qr-code-generator": lz(() => import("@/components/tools/QrCodeGeneratorTool"), "QrCodeGeneratorTool"),
  "csv-json": lz(() => import("@/components/tools/CsvJsonTool"), "CsvJsonTool"),
  "zip-files": lz(() => import("@/components/tools/ZipFilesTool"), "ZipFilesTool"),
  "ocr": lz(() => import("@/components/tools/OcrTool"), "OcrTool"),
  "pdf-word": lz(() => import("@/components/tools/PdfWordTool"), "PdfWordTool"),
  "remove-background": lz(() => import("@/components/tools/RemoveBackgroundTool"), "RemoveBackgroundTool"),
  "sign-pdf": lz(() => import("@/components/tools/SignPdfTool"), "SignPdfTool"),
  "protect-pdf": lz(() => import("@/components/tools/ProtectPdfTool"), "ProtectPdfTool"),
  "media-convert": lz(() => import("@/components/tools/MediaConvertTool"), "MediaConvertTool"),
  "rotate-pdf": lz(() => import("@/components/tools/RotatePdfTool"), "RotatePdfTool"),
  "image-resize": lz(() => import("@/components/tools/ImageResizeTool"), "ImageResizeTool"),
  "heic-to-jpg": lz(() => import("@/components/tools/HeicToJpgTool"), "HeicToJpgTool"),
  "pdf-to-pptx": lz(() => import("@/components/tools/PdfToPptxTool"), "PdfToPptxTool"),
  "file-hash": lz(() => import("@/components/tools/FileHashTool"), "FileHashTool"),
  "watermark-pdf": lz(() => import("@/components/tools/WatermarkPdfTool"), "WatermarkPdfTool"),
  "page-numbers-pdf": lz(() => import("@/components/tools/PageNumbersPdfTool"), "PageNumbersPdfTool"),
  "barcode-generator": lz(() => import("@/components/tools/BarcodeGeneratorTool"), "BarcodeGeneratorTool"),
  "color-palette": lz(() => import("@/components/tools/ColorPaletteTool"), "ColorPaletteTool"),
  "text-to-pdf": lz(() => import("@/components/tools/TextToPdfTool"), "TextToPdfTool"),
  "extract-images-pdf": lz(() => import("@/components/tools/ExtractImagesPdfTool"), "ExtractImagesPdfTool"),
  "meme-generator": lz(() => import("@/components/tools/MemeGeneratorTool"), "MemeGeneratorTool"),
  "json-format": lz(() => import("@/components/tools/JsonFormatTool"), "JsonFormatTool"),
  "base64": lz(() => import("@/components/tools/Base64Tool"), "Base64Tool"),
  "video-to-gif": lz(() => import("@/components/tools/VideoToGifTool"), "VideoToGifTool"),
  "pdf-translator": lz(() => import("@/components/tools/PdfTranslatorTool"), "PdfTranslatorTool"),
  "photo-id-maker": lz(() => import("@/components/tools/PhotoIdMakerTool"), "PhotoIdMakerTool"),
  "bulk-image-compress": lz(() => import("@/components/tools/BulkImageCompressTool"), "BulkImageCompressTool"),
  "pdf-word-ocr": lz(() => import("@/components/tools/PdfWordOcrTool"), "PdfWordOcrTool"),
  "salary-invoice-pk": lz(() => import("@/components/tools/SalaryInvoicePkTool"), "SalaryInvoicePkTool"),
  "age-calculator-hijri": lz(() => import("@/components/tools/AgeCalculatorHijriTool"), "AgeCalculatorHijriTool"),
  "resume-builder": lz(() => import("@/components/tools/ResumeBuilderTool"), "ResumeBuilderTool"),
  "file-size-reducer": lz(() => import("@/components/tools/FileSizeReducerTool"), "FileSizeReducerTool"),
  "qr-vcard-wifi": lz(() => import("@/components/tools/QrVcardWifiTool"), "QrVcardWifiTool"),
  "currency-converter": lz(() => import("@/components/tools/CurrencyConverterTool"), "CurrencyConverterTool"),
  "product-bg-remover": lz(() => import("@/components/tools/ProductBgRemoverTool"), "ProductBgRemoverTool"),
  "unit-converter": lz(() => import("@/components/tools/UnitConverterTool"), "UnitConverterTool"),
  "watermark-image": lz(() => import("@/components/tools/WatermarkImageTool"), "WatermarkImageTool"),
  "signature-maker": lz(() => import("@/components/tools/SignatureMakerTool"), "SignatureMakerTool"),
  "qr-scanner": lz(() => import("@/components/tools/QrScannerTool"), "QrScannerTool"),
  "word-counter": lz(() => import("@/components/tools/WordCounterTool"), "WordCounterTool"),
  "case-converter": lz(() => import("@/components/tools/CaseConverterTool"), "CaseConverterTool"),
  "color-converter": lz(() => import("@/components/tools/ColorConverterTool"), "ColorConverterTool"),
  "password-generator": lz(() => import("@/components/tools/PasswordGeneratorTool"), "PasswordGeneratorTool"),
  "url-encode": lz(() => import("@/components/tools/UrlEncodeTool"), "UrlEncodeTool"),
  "timestamp-converter": lz(() => import("@/components/tools/TimestampConverterTool"), "TimestampConverterTool"),
  "markdown-to-html": lz(() => import("@/components/tools/MarkdownToHtmlTool"), "MarkdownToHtmlTool"),
  "lorem-ipsum": lz(() => import("@/components/tools/LoremIpsumTool"), "LoremIpsumTool"),
  "text-diff": lz(() => import("@/components/tools/TextDiffTool"), "TextDiffTool"),
  "uuid-generator": lz(() => import("@/components/tools/UuidGeneratorTool"), "UuidGeneratorTool"),
  "regex-tester": lz(() => import("@/components/tools/RegexTesterTool"), "RegexTesterTool"),
  "line-tools": lz(() => import("@/components/tools/LineToolsTool"), "LineToolsTool"),
  "slugify": lz(() => import("@/components/tools/SlugifyTool"), "SlugifyTool"),
  "jwt-decoder": lz(() => import("@/components/tools/JwtDecoderTool"), "JwtDecoderTool"),
  "json-yaml": lz(() => import("@/components/tools/JsonYamlTool"), "JsonYamlTool"),
  "html-to-markdown": lz(() => import("@/components/tools/HtmlToMarkdownTool"), "HtmlToMarkdownTool"),
  "exif-remover": lz(() => import("@/components/tools/ExifRemoverTool"), "ExifRemoverTool"),
  "number-base": lz(() => import("@/components/tools/NumberBaseTool"), "NumberBaseTool"),
  "random-number": lz(() => import("@/components/tools/RandomNumberTool"), "RandomNumberTool"),
  "bmi-calculator": lz(() => import("@/components/tools/BmiCalculatorTool"), "BmiCalculatorTool"),
  "loan-calculator": lz(() => import("@/components/tools/LoanCalculatorTool"), "LoanCalculatorTool"),
  "text-repeat": lz(() => import("@/components/tools/TextRepeatTool"), "TextRepeatTool"),
  "image-to-base64": lz(() => import("@/components/tools/ImageToBase64Tool"), "ImageToBase64Tool"),
  "pdf-to-text": lz(() => import("@/components/tools/PdfToTextTool"), "PdfToTextTool"),
  "pdf-organize": lz(() => import("@/components/tools/PdfOrganizeTool"), "PdfOrganizeTool"),
  "pdf-crop": lz(() => import("@/components/tools/PdfCropTool"), "PdfCropTool"),
  "pdf-metadata-editor": lz(() => import("@/components/tools/PdfMetadataEditorTool"), "PdfMetadataEditorTool"),
  "image-crop": lz(() => import("@/components/tools/ImageCropTool"), "ImageCropTool"),
  "image-flip-rotate": lz(() => import("@/components/tools/ImageFlipRotateTool"), "ImageFlipRotateTool"),
  "svg-to-png": lz(() => import("@/components/tools/SvgToPngTool"), "SvgToPngTool"),
  "favicon-generator": lz(() => import("@/components/tools/FaviconGeneratorTool"), "FaviconGeneratorTool"),
  "epoch-diff": lz(() => import("@/components/tools/EpochDiffTool"), "EpochDiffTool"),
  "hash-text": lz(() => import("@/components/tools/HashTextTool"), "HashTextTool"),
  "color-contrast": lz(() => import("@/components/tools/ColorContrastTool"), "ColorContrastTool"),
  "css-gradient": lz(() => import("@/components/tools/CssGradientTool"), "CssGradientTool"),
  "box-shadow": lz(() => import("@/components/tools/BoxShadowTool"), "BoxShadowTool"),
  "cron-parser": lz(() => import("@/components/tools/CronParserTool"), "CronParserTool"),
  "percentage-calculator": lz(() => import("@/components/tools/PercentageCalculatorTool"), "PercentageCalculatorTool"),
  "image-to-ascii": lz(() => import("@/components/tools/ImageToAsciiTool"), "ImageToAsciiTool"),
  // 2026-07-26 additions:
  "pdf-to-csv": lz(() => import("@/components/tools/PdfToCsvTool"), "PdfToCsvTool"),
  "pdf-redact": lz(() => import("@/components/tools/PdfRedactTool"), "PdfRedactTool"),
  "image-upscaler": lz(() => import("@/components/tools/ImageUpscalerTool"), "ImageUpscalerTool"),
  "audio-trimmer": lz(() => import("@/components/tools/AudioTrimmerTool"), "AudioTrimmerTool"),
  "json-to-sql": lz(() => import("@/components/tools/JsonToSqlTool"), "JsonToSqlTool"),
  "html-minifier": lz(() => import("@/components/tools/HtmlMinifierTool"), "HtmlMinifierTool"),
  "css-beautify": lz(() => import("@/components/tools/CssBeautifyTool"), "CssBeautifyTool"),
  "mock-data": lz(() => import("@/components/tools/MockDataTool"), "MockDataTool"),
  "sql-formatter": lz(() => import("@/components/tools/SqlFormatterTool"), "SqlFormatterTool"),
  "yaml-formatter": lz(() => import("@/components/tools/YamlFormatterTool"), "YamlFormatterTool"),
  // 2026-07-27 AI additions (open-source models via @huggingface/transformers):
  "ai-summarizer": lz(() => import("@/components/tools/AiSummarizerTool"), "AiSummarizerTool"),
  "ai-image-caption": lz(() => import("@/components/tools/AiImageCaptionTool"), "AiImageCaptionTool"),
  "ai-transcribe": lz(() => import("@/components/tools/AiTranscribeTool"), "AiTranscribeTool"),
  "ai-upscale": lz(() => import("@/components/tools/AiUpscaleTool"), "AiUpscaleTool"),
  // 2026-07-29 additions:
  "invoice-generator": lz(() => import("@/components/tools/InvoiceGeneratorTool"), "InvoiceGeneratorTool"),
  "pdf-nup": lz(() => import("@/components/tools/PdfNupTool"), "PdfNupTool"),
  "photo-collage": lz(() => import("@/components/tools/PhotoCollageTool"), "PhotoCollageTool"),
  "csv-to-pdf": lz(() => import("@/components/tools/CsvToPdfTool"), "CsvToPdfTool"),
};

export { registry };

/**
 * Renders a tool in a given locale: sets dir/lang for RTL and provides the
 * i18n context so shared chrome inside tools is localized.
 */
export function LocalizedToolPage({ locale, slug }: { locale: Locale; slug: string }) {
  const Tool = registry[slug];
  const meta = LOCALE_META[locale];
  const t = dictionaries[locale];

  if (!Tool) {
    return (
      <div dir={meta.dir} lang={meta.tag} className="min-h-screen bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">{t.toolPage.eyebrow}</p>
          <h1 className="mt-3 font-mono text-4xl font-bold text-ink">{t.toolPage.notFoundTitle}</h1>
          <p className="mt-4 text-graphite/80">{t.toolPage.notFoundBody}</p>
          <a
            href={localePath(locale, "/")}
            className="mt-8 inline-flex h-10 items-center rounded-md border border-ink px-4 font-mono text-xs uppercase tracking-wider text-ink hover:bg-ink hover:text-paper"
          >
            <span aria-hidden className="me-2 inline-block rtl:rotate-180">←</span>
            {t.toolPage.backToTools}
          </a>
        </div>
      </div>
    );
  }

  return (
    <I18nProvider locale={locale}>
      <div dir={meta.dir} lang={meta.tag}>
        <Suspense
          fallback={
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-signal" aria-hidden />
            </div>
          }
        >
          <Tool />
        </Suspense>
      </div>
    </I18nProvider>
  );
}
