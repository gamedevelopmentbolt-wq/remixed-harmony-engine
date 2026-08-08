// International SEO keyword content for FR / DE / AR
// Rendered on each tool page as real on-page content Google can index,
// plus emitted in hreflang alternates and meta variants.

export interface I18nMeta {
  title: string;
  description: string;
  keywords?: string;
  body: string; // 1-2 sentences of natural language using target keywords
}

export interface I18nBundle {
  fr?: I18nMeta;
  es?: I18nMeta;
  de?: I18nMeta;
  ar?: I18nMeta;
}

export const toolI18n: Record<string, I18nBundle> = {
  "merge-pdf": {
    fr: { title: "Fusionner PDF gratuitement en ligne — sans inscription", description: "Combinez plusieurs fichiers PDF en un seul directement dans votre navigateur. 100% gratuit, sans filigrane, sans limite quotidienne.", body: "Fusionner PDF gratuit : notre outil combine plusieurs fichiers PDF en un seul document directement dans votre navigateur, sans téléversement sur un serveur. Idéal pour regrouper factures, rapports et scans en un seul PDF." },
    es: { title: "Unir PDF gratis online — sin registro", description: "Combina varios archivos PDF en uno solo directamente en tu navegador. Gratis, sin marca de agua ni límite diario.", body: "Unir PDF gratis: combina varios archivos PDF en un único documento dentro de tu navegador, sin subirlos a ningún servidor. Ideal para juntar facturas, informes y escaneos." },
    de: { title: "PDF zusammenfügen kostenlos online — ohne Anmeldung", description: "PDF-Dateien in einer Datei zusammenfügen — direkt im Browser, kostenlos, ohne Wasserzeichen und ohne Tageslimit.", body: "PDF zusammenfügen kostenlos: Kombinieren Sie mehrere PDF-Dateien zu einem einzigen Dokument direkt im Browser — ohne Upload, ohne Registrierung und ohne Grenzen bei der Anzahl der Dateien." },
    ar: { title: "دمج PDF مجاناً عبر الإنترنت — بدون تسجيل", description: "ادمج عدة ملفات PDF في ملف واحد داخل المتصفح مباشرة. مجاني تماماً، بدون علامة مائية أو حد يومي.", body: "دمج ملفات PDF مجاني بالكامل: يقوم هذا الأداة بدمج ملفات PDF المتعددة في ملف واحد داخل متصفحك مباشرة، دون رفع الملفات إلى أي خادم. مثالي لدمج الفواتير والتقارير والمسحوبات الضوئية." },
  },
  "compress-pdf": {
    fr: { title: "Compresser PDF en ligne — réduire la taille sans perte", description: "Compressez vos PDF pour email ou upload. Outil gratuit, 100% dans votre navigateur, sans inscription.", body: "Compresser PDF en ligne gratuit : réduisez la taille de vos fichiers PDF pour les envoyer par email ou WhatsApp, avec un contrôle précis sur la qualité — tout se passe dans votre navigateur." },
    es: { title: "Comprimir PDF online gratis — reducir tamaño", description: "Reduce el peso de tus PDF para enviarlos por correo o WhatsApp. Gratis y 100% en tu navegador.", body: "Comprimir PDF gratis: reduce el tamaño de archivos PDF grandes eligiendo el nivel de calidad, sin subir nada a internet." },
    de: { title: "PDF komprimieren kostenlos online — Dateigröße reduzieren", description: "PDF verkleinern für E-Mail und Upload — kostenlos, im Browser, ohne Qualitätsverlust bei mittlerer Stufe.", body: "PDF komprimieren kostenlos: Verkleinern Sie große PDF-Dateien für E-Mail-Versand oder WhatsApp mit wählbarer Qualitätsstufe — vollständig im Browser, ohne Upload." },
    ar: { title: "ضغط PDF مجاناً عبر الإنترنت — تصغير حجم الملف", description: "قلل حجم ملفات PDF لإرسالها عبر البريد الإلكتروني أو واتساب. أداة مجانية تعمل بالكامل في المتصفح.", body: "ضغط ملفات PDF مجاناً: يقلل هذا الأداة حجم ملف PDF مع الحفاظ على جودة مقبولة للقراءة، وكل شيء يتم داخل متصفحك بدون رفع الملف إلى الإنترنت." },
  },
  "pdf-word": {
    fr: { title: "Convertir PDF en Word gratuit — sans installation", description: "Convertisseur PDF en Word gratuit en ligne. Extrayez le texte de vos PDF en fichier .docx éditable.", body: "Convertisseur PDF gratuit en ligne : convertissez vos PDF en documents Word .docx éditables directement dans le navigateur, sans logiciel à installer." },
    es: { title: "Convertir PDF a Word gratis — sin instalar nada", description: "Convertidor de PDF a Word (.docx) editable, online y gratuito.", body: "Convertir PDF a Word gratis: extrae el texto de tus PDF a documentos .docx editables directamente en el navegador." },
    de: { title: "PDF in Word umwandeln kostenlos — online, ohne Installation", description: "Kostenloser PDF Konverter online: PDF in Word (.docx) umwandeln — bearbeitbar, im Browser, ohne Anmeldung.", body: "Kostenloser PDF Konverter online: Wandeln Sie PDFs in bearbeitbare Word-Dokumente (.docx) um — direkt im Browser, ohne Software-Installation." },
    ar: { title: "تحويل PDF إلى Word مجاناً — بدون تثبيت", description: "محول PDF مجاني عبر الإنترنت: حوّل ملفات PDF إلى Word قابلة للتحرير داخل المتصفح.", body: "محول PDF مجاني عبر الإنترنت: يحوّل ملفات PDF إلى مستندات Word قابلة للتحرير (.docx) داخل متصفحك مباشرة، دون الحاجة لتثبيت أي برنامج." },
  },
  "pdf-to-jpg": {
    fr: { title: "Convertir PDF en JPG en ligne — gratuit", description: "Transformez chaque page de votre PDF en image JPG haute qualité. Gratuit, sans inscription.", body: "Convertir PDF en JPG gratuit : chaque page de votre PDF devient une image JPG téléchargeable, avec un choix de résolution — 100% dans le navigateur." },
    es: { title: "Convertir PDF a JPG online gratis", description: "Convierte cada página de tu PDF en una imagen JPG de alta calidad.", body: "Convertir PDF a JPG gratis: cada página del PDF se exporta como imagen JPG con la resolución que elijas." },
    de: { title: "PDF in JPG umwandeln kostenlos online", description: "PDF-Seiten in JPG-Bilder umwandeln — hohe Qualität, direkt im Browser.", body: "PDF in JPG kostenlos umwandeln: Jede Seite Ihres PDFs wird als JPG-Bild in wählbarer Auflösung exportiert — vollständig im Browser." },
    ar: { title: "تحويل PDF إلى JPG مجاناً عبر الإنترنت", description: "حوّل صفحات PDF إلى صور JPG بجودة عالية داخل المتصفح.", body: "تحويل PDF إلى JPG مجاناً: تحويل كل صفحة من ملف PDF إلى صورة JPG بدقة تختارها، بالكامل داخل المتصفح." },
  },
  "image-to-pdf": {
    fr: { title: "Convertir image en PDF gratuit — JPG, PNG en un PDF", description: "Combinez plusieurs images JPG ou PNG en un seul fichier PDF, en ligne et gratuitement.", body: "Convertir image en PDF gratuit : combinez plusieurs photos JPG ou PNG en un seul PDF, dans l'ordre que vous choisissez." },
    es: { title: "Convertir imagen a PDF gratis — JPG y PNG a PDF", description: "Une varias imágenes JPG o PNG en un solo archivo PDF, online y gratis.", body: "Convertir imagen a PDF gratis: combina varias fotos JPG o PNG en un único PDF en el orden que quieras." },
    de: { title: "Bild in PDF umwandeln kostenlos", description: "JPG oder PNG in PDF umwandeln — mehrere Bilder zu einem PDF zusammenfügen, im Browser.", body: "Bild in PDF umwandeln kostenlos: Fassen Sie mehrere JPG- oder PNG-Fotos in einer PDF-Datei zusammen." },
    ar: { title: "تحويل الصور إلى PDF مجاناً", description: "ادمج صور JPG أو PNG في ملف PDF واحد، بدون رفع.", body: "تحويل الصور إلى PDF مجاناً: يجمع عدة صور JPG أو PNG في ملف PDF واحد بالترتيب الذي تختاره." },
  },
  "compress-image": {
    fr: { title: "Compresser image sans perte de qualité — gratuit", description: "Réduisez la taille de vos JPG et PNG tout en gardant la qualité. En ligne, sans inscription.", body: "Compresser image en ligne gratuit : réduit la taille de vos photos JPG et PNG pour le web et les emails, avec un contrôle de la qualité." },
    es: { title: "Comprimir imagen sin perder calidad — gratis", description: "Reduce el tamaño de tus JPG y PNG manteniendo la calidad.", body: "Comprimir imágenes gratis: reduce el peso de fotos JPG y PNG para web y correo con control de calidad." },
    de: { title: "Bild komprimieren online — verlustfrei verkleinern", description: "JPG und PNG kostenlos verkleinern ohne Qualitätsverlust — direkt im Browser.", body: "Bild komprimieren kostenlos: Verkleinern Sie JPG- und PNG-Dateien für Web und E-Mail mit einstellbarer Qualität." },
    ar: { title: "ضغط الصور بدون فقدان الجودة — مجاناً", description: "قلل حجم صور JPG وPNG مع الحفاظ على الجودة — عبر الإنترنت.", body: "ضغط الصور مجاناً: يقلل حجم صور JPG وPNG للاستخدام على الويب أو البريد الإلكتروني مع تحكم في الجودة." },
  },
  "image-converter": {
    fr: { title: "Convertisseur d'image JPG PNG WebP gratuit", description: "Convertissez vos images entre JPG, PNG et WebP en ligne, gratuitement.", body: "Convertisseur d'image gratuit : basculez entre JPG, PNG et WebP directement dans votre navigateur." },
    es: { title: "Convertidor de imágenes JPG PNG WebP gratis", description: "Convierte imágenes entre JPG, PNG y WebP online y gratis.", body: "Convertidor de imágenes gratis: cambia entre formatos JPG, PNG y WebP dentro del navegador." },
    de: { title: "Bildkonverter JPG PNG WebP kostenlos online", description: "Bilder zwischen JPG, PNG und WebP umwandeln — kostenlos im Browser.", body: "Bildkonverter kostenlos: Wandeln Sie Bilder zwischen JPG, PNG und WebP direkt im Browser um." },
    ar: { title: "محول الصور JPG PNG WebP مجاناً", description: "حوّل صورك بين JPG وPNG وWebP عبر الإنترنت مجاناً.", body: "محول الصور مجاناً: يحوّل الصور بين صيغ JPG وPNG وWebP داخل المتصفح مباشرة." },
  },
  "remove-background": {
    fr: { title: "Supprimer arrière-plan image gratuit — PNG transparent", description: "Détourez automatiquement le fond de vos photos et téléchargez un PNG transparent.", body: "Supprimer arrière-plan image gratuit : découpe automatiquement le sujet d'une photo et exporte un PNG transparent, sans inscription." },
    es: { title: "Quitar fondo de imagen gratis — PNG transparente", description: "Elimina el fondo de tus fotos automáticamente y descarga un PNG transparente.", body: "Quitar fondo de imagen gratis: recorta el sujeto de una foto automáticamente y lo exporta como PNG transparente." },
    de: { title: "Hintergrund entfernen kostenlos — transparentes PNG", description: "Bildhintergrund automatisch entfernen und als transparentes PNG herunterladen.", body: "Hintergrund entfernen kostenlos: Schneidet das Motiv automatisch aus einem Foto aus und exportiert ein transparentes PNG." },
    ar: { title: "إزالة خلفية الصور مجاناً — PNG شفاف", description: "أزل خلفية الصور تلقائياً واحصل على صورة PNG بخلفية شفافة.", body: "إزالة خلفية الصور مجاناً: تقتطع الموضوع من الصورة تلقائياً وتحفظها كـ PNG بخلفية شفافة." },
  },
  "qr-code-generator": {
    fr: { title: "Générateur QR Code gratuit en ligne — PNG et SVG", description: "Créez un QR code à partir de n'importe quel lien ou texte, à télécharger en PNG ou SVG.", body: "Générateur QR Code gratuit : créez un QR code depuis un lien, du texte ou un vCard, téléchargez en PNG ou SVG haute résolution." },
    es: { title: "Generador de códigos QR gratis — PNG y SVG", description: "Crea un código QR desde cualquier enlace o texto y descárgalo en PNG o SVG.", body: "Generador de QR gratis: crea códigos QR desde enlaces, texto o vCard y descárgalos en alta resolución." },
    de: { title: "QR Code Generator kostenlos online — PNG und SVG", description: "QR Code aus Link oder Text erstellen — Download als PNG oder SVG.", body: "QR Code Generator kostenlos: Erstellen Sie QR Codes aus URL, Text oder vCard und laden Sie sie als PNG oder SVG herunter." },
    ar: { title: "منشئ رمز QR مجاناً عبر الإنترنت — PNG و SVG", description: "أنشئ رمز QR من أي رابط أو نص وحمّله بصيغة PNG أو SVG.", body: "منشئ رموز QR مجاناً: أنشئ رمز QR لأي رابط أو نص أو بطاقة تعريف vCard وحمّله بجودة عالية." },
  },
  "split-pdf": {
    fr: { title: "Diviser un PDF en ligne — extraire des pages gratuitement", description: "Séparez un PDF en fichiers d'une page ou extrayez des plages précises. Gratuit, dans le navigateur.", body: "Diviser un PDF gratuit : séparez un fichier PDF en pages individuelles ou extrayez une plage précise, tout dans votre navigateur." },
    es: { title: "Dividir PDF online gratis — separar páginas", description: "Separa un PDF en páginas individuales y descárgalas en un ZIP.", body: "Dividir PDF gratis: separa un documento PDF en páginas sueltas listas para descargar, todo en el navegador." },
    de: { title: "PDF teilen kostenlos online — Seiten extrahieren", description: "PDF in einzelne Seiten aufteilen oder Seitenbereich extrahieren — kostenlos im Browser.", body: "PDF teilen kostenlos: Trennen Sie ein PDF in einzelne Seiten oder extrahieren Sie einen bestimmten Seitenbereich." },
    ar: { title: "تقسيم PDF مجاناً — استخراج صفحات", description: "قسّم ملف PDF إلى صفحات فردية أو استخرج نطاق صفحات محدد.", body: "تقسيم PDF مجاناً: يقسم ملف PDF إلى صفحات منفصلة أو يستخرج مجموعة صفحات محددة داخل المتصفح." },
  },
  "sign-pdf": {
    fr: { title: "Signer PDF en ligne gratuit — signature électronique", description: "Signez un PDF en dessinant ou tapant votre signature. Gratuit, sans compte.", body: "Signer PDF gratuit : dessinez ou tapez votre signature et placez-la sur n'importe quelle page d'un PDF." },
    es: { title: "Firmar PDF online gratis — firma digital", description: "Añade tu firma a cualquier PDF sin subirlo a un servidor.", body: "Firmar PDF gratis: dibuja o sube tu firma y colócala en cualquier página del documento, todo en local." },
    de: { title: "PDF unterschreiben online kostenlos — E-Signatur", description: "PDF elektronisch unterschreiben — Signatur zeichnen oder tippen, im Browser.", body: "PDF unterschreiben kostenlos: Zeichnen oder tippen Sie Ihre Unterschrift und platzieren Sie sie auf jeder PDF-Seite." },
    ar: { title: "توقيع PDF إلكترونياً مجاناً عبر الإنترنت", description: "وقّع ملف PDF بالرسم أو الكتابة، مجاناً وبدون تسجيل.", body: "توقيع PDF إلكترونياً مجاناً: ارسم توقيعك أو اكتبه وضعه على أي صفحة من ملف PDF." },
  },
  "protect-pdf": {
    fr: { title: "Protéger PDF par mot de passe — gratuit en ligne", description: "Ajoutez ou retirez un mot de passe d'un PDF, dans votre navigateur.", body: "Protéger PDF gratuit : ajoutez un mot de passe à un PDF ou retirez-en un que vous connaissez déjà, sans upload." },
    de: { title: "PDF mit Passwort schützen — kostenlos online", description: "PDF verschlüsseln oder Passwort entfernen — im Browser, ohne Upload.", body: "PDF schützen kostenlos: Fügen Sie ein Passwort zu einem PDF hinzu oder entfernen Sie eines, das Sie bereits kennen." },
    ar: { title: "حماية PDF بكلمة مرور — مجاناً عبر الإنترنت", description: "أضف كلمة مرور إلى PDF أو أزل كلمة تعرفها بالفعل، داخل المتصفح.", body: "حماية PDF بكلمة مرور مجاناً: أضف حماية بكلمة مرور إلى ملف PDF أو أزل كلمة مرور معروفة." },
  },
  "ocr": {
    fr: { title: "OCR en ligne gratuit — extraire texte d'image ou PDF", description: "Extrayez du texte réel et sélectionnable d'une image ou d'un PDF scanné.", body: "OCR gratuit en ligne : reconnaît le texte dans les images JPG, PNG et les PDF scannés, en français et 100+ langues." },
    es: { title: "OCR online gratis — extraer texto de imágenes", description: "Extrae texto de imágenes y escaneos con OCR, sin registro.", body: "OCR gratis online: reconoce y extrae el texto de fotos y documentos escaneados directamente en tu navegador." },
    de: { title: "OCR kostenlos online — Text aus Bild und PDF extrahieren", description: "Text aus Bildern oder gescannten PDFs extrahieren — Deutsch und 100+ Sprachen.", body: "OCR kostenlos: Erkennt Text in JPG, PNG und gescannten PDFs — Deutsch, Englisch und über 100 weitere Sprachen." },
    ar: { title: "OCR مجاناً — استخراج النص من الصور و PDF", description: "استخرج نصاً حقيقياً قابلاً للتحديد من صور أو ملفات PDF ممسوحة.", body: "OCR مجاني عبر الإنترنت: يتعرف على النصوص العربية والإنجليزية في الصور وملفات PDF الممسوحة ضوئياً." },
  },
  "heic-to-jpg": {
    fr: { title: "Convertir HEIC en JPG gratuit — photos iPhone", description: "Convertissez les photos HEIC de l'iPhone en JPG ou PNG dans le navigateur.", body: "Convertir HEIC en JPG gratuit : ouvre les photos HEIC prises sur iPhone et les convertit en JPG ou PNG lisibles partout." },
    de: { title: "HEIC in JPG umwandeln kostenlos — iPhone Fotos", description: "iPhone HEIC-Fotos in JPG oder PNG umwandeln — direkt im Browser.", body: "HEIC in JPG umwandeln kostenlos: Konvertiert iPhone HEIC-Fotos in universell lesbare JPG- oder PNG-Bilder." },
    ar: { title: "تحويل HEIC إلى JPG مجاناً — صور آيفون", description: "حوّل صور HEIC من آيفون إلى JPG أو PNG داخل المتصفح.", body: "تحويل HEIC إلى JPG مجاناً: يفتح صور HEIC الملتقطة بآيفون ويحولها إلى JPG أو PNG قابلة للعرض في أي مكان." },
  },
  "image-crop": {
    fr: { title: "Recadrer une image en ligne — 1:1, 16:9, story", description: "Recadrez vos images avec des ratios prédéfinis ou en freeform, gratuitement.", body: "Recadrer une image en ligne : formats prédéfinis pour Instagram, YouTube et TikTok, ou recadrage libre." },
    de: { title: "Bild zuschneiden online — 1:1, 16:9, Story", description: "Bilder mit voreingestellten Seitenverhältnissen oder frei zuschneiden — kostenlos im Browser.", body: "Bild zuschneiden online: Vordefinierte Seitenverhältnisse für Instagram, YouTube und TikTok oder freies Zuschneiden." },
    ar: { title: "قص الصور عبر الإنترنت — نسب جاهزة", description: "قص الصور بنسب جاهزة (1:1، 16:9، ستوري) أو بحرية.", body: "قص الصور عبر الإنترنت: نسب جاهزة لإنستغرام ويوتيوب وتيك توك أو قص حر بأي أبعاد." },
  },
  "favicon-generator": {
    fr: { title: "Générateur de favicon en ligne — pack complet", description: "Générez un pack favicon complet (16, 32, 180, 192, 512 px + ICO) à partir d'une image.", body: "Générateur de favicon gratuit : crée toutes les tailles nécessaires (16 à 512 px), un ICO et un manifest, dans le navigateur." },
    de: { title: "Favicon Generator online — komplettes Paket", description: "Vollständiges Favicon-Paket (16, 32, 180, 192, 512 px + ICO) aus einem Bild erzeugen.", body: "Favicon Generator kostenlos: Erzeugt alle benötigten Größen (16 bis 512 px), ICO und Manifest im Browser." },
    ar: { title: "منشئ Favicon كامل عبر الإنترنت", description: "أنشئ حزمة Favicon كاملة (16، 32، 180، 192، 512 بكسل + ICO).", body: "منشئ favicon مجاني: ينشئ جميع الأحجام المطلوبة (من 16 إلى 512 بكسل)، وملف ICO وmanifest داخل المتصفح." },
  },
  "svg-to-png": {
    fr: { title: "Convertir SVG en PNG en ligne — haute résolution", description: "Convertissez un SVG en PNG à la résolution de votre choix.", body: "Convertir SVG en PNG gratuit : exporte un SVG en PNG à la résolution exacte demandée, en gardant le ratio." },
    de: { title: "SVG in PNG umwandeln online — hohe Auflösung", description: "SVG in PNG umwandeln — Auflösung frei wählbar, direkt im Browser.", body: "SVG in PNG umwandeln kostenlos: Exportiert SVG als PNG in der von Ihnen gewünschten Auflösung." },
    ar: { title: "تحويل SVG إلى PNG بدقة عالية", description: "حوّل SVG إلى PNG بالدقة التي تختارها.", body: "تحويل SVG إلى PNG مجاناً: تصدير SVG كصورة PNG بالدقة المطلوبة مع الحفاظ على نسبة الأبعاد." },
  },
  "pdf-to-text": {
    fr: { title: "Extraire texte d'un PDF gratuit en ligne", description: "Extrayez le texte sélectionnable d'un PDF et téléchargez un fichier .txt.", body: "Extraire texte PDF gratuit : lit toutes les pages et exporte le texte en .txt, dans le navigateur." },
    de: { title: "Text aus PDF extrahieren kostenlos online", description: "Selektierbaren Text aus PDF extrahieren und als .txt herunterladen.", body: "Text aus PDF extrahieren kostenlos: Liest alle Seiten und exportiert den Text als .txt-Datei im Browser." },
    ar: { title: "استخراج النص من PDF مجاناً عبر الإنترنت", description: "استخرج النص القابل للتحديد من PDF وحمّله كملف .txt.", body: "استخراج النص من PDF مجاناً: يقرأ جميع الصفحات ويصدّر النص كملف .txt داخل المتصفح." },
  },
  "hash-text": {
    fr: { title: "Générer MD5, SHA-1, SHA-256 en ligne — gratuit", description: "Générez les empreintes MD5, SHA-1, SHA-256 et SHA-512 d'un texte.", body: "Générateur de hash gratuit : calcule MD5, SHA-1, SHA-256 et SHA-512 dans le navigateur avec l'API Web Crypto." },
    de: { title: "MD5, SHA-1, SHA-256 online generieren kostenlos", description: "MD5, SHA-1, SHA-256 und SHA-512 Prüfsummen für Text berechnen.", body: "Hash Generator kostenlos: Berechnet MD5, SHA-1, SHA-256 und SHA-512 im Browser mit der Web Crypto API." },
    ar: { title: "منشئ MD5 و SHA-256 عبر الإنترنت مجاناً", description: "احسب بصمات MD5 و SHA-1 و SHA-256 و SHA-512 للنصوص.", body: "منشئ التجزئة مجاناً: يحسب MD5 و SHA-1 و SHA-256 و SHA-512 داخل المتصفح باستخدام Web Crypto API." },
  },
};

export const langLabels: Record<string, { name: string; dir: "ltr" | "rtl"; heading: string }> = {
  fr: { name: "Français", dir: "ltr", heading: "Aussi disponible en français" },
  de: { name: "Deutsch", dir: "ltr", heading: "Auch auf Deutsch verfügbar" },
  ar: { name: "العربية", dir: "rtl", heading: "متوفر أيضاً بالعربية" },
};

export function getI18n(slug: string): I18nBundle | undefined {
  return toolI18n[slug];
}

// --- 2026-07-26: additions for new tools ---
Object.assign(toolI18n, {
  "pdf-to-csv": {
    fr: { title: "Convertir PDF en CSV gratuit — extraire les tableaux", description: "Extrayez les tableaux d'un PDF vers un fichier CSV compatible Excel et Google Sheets.", body: "Convertir PDF en CSV gratuit : extrait les tableaux d'un PDF texte et les enregistre en CSV — parfait pour factures, relevés et rapports." },
    de: { title: "PDF in CSV umwandeln kostenlos — Tabellen extrahieren", description: "Tabellen aus einem PDF in eine CSV-Datei extrahieren — direkt im Browser.", body: "PDF in CSV umwandeln kostenlos: Extrahiert Tabellen aus einem Text-PDF in eine CSV-Datei — ideal für Rechnungen und Berichte." },
    ar: { title: "تحويل PDF إلى CSV مجاناً — استخراج الجداول", description: "استخرج الجداول من ملف PDF إلى ملف CSV متوافق مع Excel.", body: "تحويل PDF إلى CSV مجاناً: يستخرج الجداول من ملف PDF نصي إلى ملف CSV — مثالي للفواتير والتقارير." },
  },
  "pdf-redact": {
    fr: { title: "Caviarder un PDF en ligne — supprimer texte confidentiel", description: "Masquez automatiquement tout mot ou phrase sensible dans un PDF, en ligne et sans upload.", body: "Caviarder PDF gratuit : masque automatiquement tout mot ou phrase confidentielle dans un PDF avec des rectangles noirs — 100% dans le navigateur." },
    de: { title: "PDF schwärzen online — vertraulichen Text entfernen", description: "Sensible Wörter oder Namen in einem PDF mit schwarzen Rechtecken schwärzen — im Browser.", body: "PDF schwärzen kostenlos: Überdeckt automatisch beliebige Wörter oder Phrasen in einem PDF mit schwarzen Rechtecken — direkt im Browser, ohne Upload." },
    ar: { title: "إخفاء نص في PDF — تنقيح المستندات", description: "أخفِ الكلمات أو العبارات الحساسة في ملف PDF بمستطيلات سوداء داخل المتصفح.", body: "تنقيح PDF مجاناً: يغطي تلقائياً أي كلمات أو عبارات حساسة في ملف PDF بمستطيلات سوداء — بالكامل داخل المتصفح." },
  },
  "image-upscaler": {
    fr: { title: "Agrandir une image sans perte — 2x 3x 4x gratuit", description: "Agrandissez vos photos 2×, 3× ou 4× avec un lissage haute qualité, dans le navigateur.", body: "Agrandir une image en ligne gratuit : mise à l'échelle multi-passes 2×, 3× ou 4× pour des bords plus nets qu'un redimensionnement classique." },
    de: { title: "Bild vergrößern ohne Qualitätsverlust — 2x 3x 4x", description: "Fotos 2×, 3× oder 4× vergrößern mit hochwertigem Multi-Pass-Scaling — direkt im Browser.", body: "Bild vergrößern kostenlos: Skaliert Fotos 2×, 3× oder 4× in mehreren Stufen für sichtbar schärfere Kanten als eine einfache Vergrößerung." },
    ar: { title: "تكبير الصور بدون فقدان الجودة — 2x و 3x و 4x", description: "كبّر الصور 2× أو 3× أو 4× مع تنعيم عالي الجودة داخل المتصفح.", body: "تكبير الصور مجاناً: تكبير 2× أو 3× أو 4× في مراحل متعددة للحصول على حواف أوضح من التكبير العادي." },
  },
  "audio-trimmer": {
    fr: { title: "Découper un fichier audio en ligne — MP3, WAV, M4A", description: "Coupez une section précise d'un fichier audio et téléchargez un WAV, dans le navigateur.", body: "Découper audio en ligne gratuit : sélectionnez un extrait précis d'un MP3, WAV ou M4A et exportez-le en WAV, sans upload." },
    de: { title: "Audio schneiden online — MP3, WAV, M4A trimmen", description: "Beliebigen Ausschnitt aus MP3, WAV oder M4A schneiden und als WAV herunterladen — im Browser.", body: "Audio schneiden kostenlos: Beliebigen Ausschnitt aus einer Audiodatei präzise ausschneiden und als WAV speichern — vollständig im Browser." },
    ar: { title: "قص الملفات الصوتية عبر الإنترنت — MP3 و WAV", description: "اقتطع جزءاً محدداً من ملف MP3 أو WAV أو M4A داخل المتصفح.", body: "قص الصوت مجاناً: اقتطع مقطعاً دقيقاً من ملف MP3 أو WAV أو M4A وصدّره كملف WAV، بالكامل داخل المتصفح." },
  },
  "json-to-sql": {
    fr: { title: "Convertir JSON en SQL — CREATE TABLE + INSERT", description: "Générez CREATE TABLE et INSERT SQL depuis un JSON, avec inférence de types automatique.", body: "Convertir JSON en SQL gratuit : produit des instructions CREATE TABLE et INSERT INTO depuis un tableau JSON avec inférence de types automatique." },
    de: { title: "JSON in SQL umwandeln — CREATE TABLE + INSERT", description: "Aus JSON automatisch CREATE TABLE- und INSERT-Anweisungen mit Typinferenz erzeugen.", body: "JSON in SQL umwandeln kostenlos: Erzeugt CREATE TABLE und INSERT INTO Anweisungen aus einem JSON-Array mit automatischer Typerkennung." },
    ar: { title: "تحويل JSON إلى SQL — CREATE TABLE و INSERT", description: "أنشئ عبارات CREATE TABLE و INSERT من JSON مع اكتشاف الأنواع تلقائياً.", body: "تحويل JSON إلى SQL مجاناً: يُنتج عبارات CREATE TABLE و INSERT INTO من مصفوفة JSON مع اكتشاف الأنواع تلقائياً." },
  },
  "html-minifier": {
    fr: { title: "Minifier HTML en ligne — gratuit, sans installation", description: "Supprimez commentaires et espaces inutiles pour alléger vos fichiers HTML.", body: "Minifier HTML gratuit : supprime commentaires et espaces superflus pour réduire la taille des fichiers HTML — 100% dans le navigateur." },
    de: { title: "HTML minifizieren online kostenlos", description: "Kommentare und überflüssige Leerzeichen aus HTML entfernen, um Dateien zu verkleinern.", body: "HTML minifizieren kostenlos: Entfernt Kommentare und überflüssige Leerzeichen zur Reduzierung der HTML-Dateigröße — direkt im Browser." },
    ar: { title: "تصغير HTML عبر الإنترنت مجاناً", description: "احذف التعليقات والمسافات الزائدة من ملفات HTML لتقليل حجمها.", body: "تصغير HTML مجاناً: يحذف التعليقات والمسافات الزائدة لتقليل حجم ملفات HTML — بالكامل داخل المتصفح." },
  },
  "mock-data": {
    fr: { title: "Générateur de données fictives — JSON et CSV", description: "Générez jusqu'à 10 000 lignes de données réalistes (noms, emails, dates) en JSON ou CSV.", body: "Générateur de données de test gratuit : jusqu'à 10 000 lignes réalistes (noms, emails, UUIDs, dates, booléens) exportées en JSON ou CSV." },
    de: { title: "Mock-Daten Generator — JSON und CSV kostenlos", description: "Bis zu 10.000 realistische Testdaten (Namen, E-Mails, Datumsangaben) als JSON oder CSV erzeugen.", body: "Mock-Daten Generator kostenlos: Erzeugt bis zu 10.000 realistische Zeilen (Namen, E-Mails, UUIDs, Daten, Booleans) als JSON oder CSV." },
    ar: { title: "منشئ بيانات تجريبية — JSON و CSV مجاناً", description: "أنشئ حتى 10,000 صف من البيانات الواقعية (أسماء، بريد، تواريخ) بصيغة JSON أو CSV.", body: "منشئ بيانات تجريبية مجاناً: يولّد حتى 10,000 صف من البيانات الواقعية (أسماء، بريد، UUID، تواريخ، قيم منطقية) بصيغة JSON أو CSV." },
  },
});
