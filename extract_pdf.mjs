import fs from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const data = new Uint8Array(fs.readFileSync('Tai_lieu_THPT.pdf'));
const doc = await getDocument({ data }).promise;

console.log('Pages:', doc.numPages);
let fullText = '';

for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += `\n--- PAGE ${i} ---\n${pageText}\n`;
}

fs.writeFileSync('pdf_text_output.txt', fullText, 'utf-8');
console.log('Text length:', fullText.length);
console.log('Done!');
