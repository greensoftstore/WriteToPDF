import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

async function modifyPdf(existingPdfBytes, textEntries, fontUrl) {
  // Load an existing PDF document
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Register the fontkit instance
  pdfDoc.registerFontkit(fontkit);

  // Load a custom font
  const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
  const customFont = await pdfDoc.embedFont(fontBytes);

  // Get the first page of the document
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Set font size and color
  const fontSize = 12;
  const color = rgb(0, 0, 0);

  // Write text entries
  for (const { text, x, y } of textEntries) {
    firstPage.drawText(text, {
      x: x,
      y: firstPage.getHeight() - y - fontSize, // Convert top-left to bottom-left
      size: fontSize,
      font: customFont,
      color: color,
    });
  }

  // Save the modified PDF and trigger download
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'output.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

document.getElementById('modify-pdf').addEventListener('click', async () => {
  const fileInput = document.getElementById('file-input');
  if (fileInput.files.length === 0) {
    alert('Please select a PDF file.');
    return;
  }

  const file = fileInput.files[0];
  const arrayBuffer = await file.arrayBuffer();
  const textEntries = [
    { text: 'नमस्ते दुनिया', x: 100, y: 100 },
    { text: 'यह एक परीक्षण है।', x: 200, y: 150 },
    { text: 'एक और पंक्ति।', x: 50, y: 200 },
  ];

  const fontUrl = 'https://oleksandrsoft.github.io/Noto_Sans_Devanagari/NotoSansDevanagari-Regular.ttf'; // Replace with the actual URL of your hosted font
  await modifyPdf(arrayBuffer, textEntries, fontUrl);
});