import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Extract the placeholder name from text like "{{Name}}" -> "Name"
 */
function extractPlaceholder(text) {
  const match = text.match(/\{\{(.+?)\}\}/);
  return match ? match[1] : null;
}

/**
 * Convert hex color to pdf-lib rgb
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return rgb(0, 0, 0);
  return rgb(
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  );
}

/**
 * Map fontFamily name to pdf-lib standard font
 */
function getStandardFont(fontFamily, fontWeight) {
  const isBold = fontWeight === 'bold';
  const map = {
    'Helvetica': isBold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica,
    'Times New Roman': isBold ? StandardFonts.TimesRomanBold : StandardFonts.TimesRoman,
    'Courier': isBold ? StandardFonts.CourierBold : StandardFonts.Courier,
  };
  return map[fontFamily] || (isBold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica);
}

const BATCH_SIZE = 50;

/**
 * Utility to embed images based on type
 */
async function embedImage(pdfDoc, dataUrl) {
  const response = await fetch(dataUrl);
  const buffer = await response.arrayBuffer();
  if (dataUrl.includes('png') || dataUrl.includes('image/png')) {
    return await pdfDoc.embedPng(buffer);
  }
  return await pdfDoc.embedJpg(buffer);
}

/**
 * Main generation function
 * @param {object} params
 * @param {string} params.backgroundImage - base64 or data URL of the background 
 * @param {number} params.imageWidth - original image width
 * @param {number} params.imageHeight - original image height
 * @param {Array} params.elements - array of text and image element configs
 * @param {Array} params.csvData - array of row objects
 * @param {object} params.mapping - { placeholderName: csvColumnHeader }
 * @param {Function} params.onProgress - callback(currentIndex, total)
 * @param {boolean} params.isPreview - whether this is a single preview generation
 * @returns {Promise<Blob|void>} The PDF Blob if isPreview is true, else nothing (triggers download)
 */
export async function generateCertificates({
  backgroundImage,
  imageWidth,
  imageHeight,
  elements,
  csvData,
  mapping,
  onProgress,
  isPreview = false,
}) {
  const zip = new JSZip();
  const folder = zip.folder('certificates');

  // Background image
  const bgBytes = await (await fetch(backgroundImage)).arrayBuffer();
  const isPng = backgroundImage.includes('png') || backgroundImage.includes('image/png');

  // Pre-load secondary images to avoid fetching them per-certificate
  const imageRefs = {};
  for (const el of elements) {
    if (el.type === 'image') {
      const resp = await fetch(el.src);
      const buf = await resp.arrayBuffer();
      const isPngEl = el.src.includes('png') || el.src.includes('image/png');
      imageRefs[el.id] = { buffer: buf, isPng: isPngEl };
    }
  }

  const limit = isPreview ? 1 : csvData.length;

  for (let i = 0; i < limit; i += BATCH_SIZE) {
    const batchEnd = Math.min(i + BATCH_SIZE, limit);

    for (let j = i; j < batchEnd; j++) {
      const row = csvData[j] || {};

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([imageWidth, imageHeight]);

      let embeddedImage = isPng ? await pdfDoc.embedPng(bgBytes) : await pdfDoc.embedJpg(bgBytes);
      page.drawImage(embeddedImage, { x: 0, y: 0, width: imageWidth, height: imageHeight });

      for (const el of elements) {
        if (el.type === 'text') {
          const placeholder = extractPlaceholder(el.text);
          const csvHeader = placeholder ? mapping[placeholder] : null;
          const textValue = csvHeader ? (row[csvHeader] || '') : el.text;

          const fontKey = getStandardFont(el.fontFamily, el.fontWeight);
          const font = await pdfDoc.embedFont(fontKey);

          const pdfX = el.x;
          // Canvas origin is top-left, PDF origin is bottom-left
          const pdfY = imageHeight - el.y - el.fontSize;

          page.drawText(textValue, {
            x: pdfX,
            y: pdfY,
            size: el.fontSize,
            font,
            color: hexToRgb(el.color),
          });
        } else if (el.type === 'image') {
          const { buffer, isPng: isElPng } = imageRefs[el.id];
          const embeddedElImage = isElPng ? await pdfDoc.embedPng(buffer) : await pdfDoc.embedJpg(buffer);
          
          const pdfX = el.x;
          // Also convert Y. Konva renders images from top-left.
          const pdfY = imageHeight - el.y - el.height;
          
          page.drawImage(embeddedElImage, {
            x: pdfX,
            y: pdfY,
            width: el.width,
            height: el.height,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();

      if (isPreview) {
        return new Blob([pdfBytes], { type: 'application/pdf' });
      }

      const firstMappedHeader = Object.values(mapping)[0];
      const nameValue = firstMappedHeader ? (row[firstMappedHeader] || `Certificate_${j + 1}`) : `Certificate_${j + 1}`;
      const safeName = nameValue.replace(/[^a-zA-Z0-9_\- ]/g, '').trim() || `Certificate_${j + 1}`;
      folder.file(`${safeName}_Certificate.pdf`, pdfBytes);
    }

    if (onProgress) onProgress(batchEnd, limit);

    if (batchEnd < limit && !isPreview) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  if (!isPreview) {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'certificates.zip');
  }
}
