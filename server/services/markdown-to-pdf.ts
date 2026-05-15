/**
 * Markdown to PDF Converter
 * 
 * Replaces markdown-pdf library with puppeteer for more reliable
 * markdown → HTML → PDF conversion.
 */

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

/**
 * Convert markdown file to PDF
 * @param mdFilePath Path to markdown file
 * @param outputPdfPath Path where PDF should be saved
 */
export async function convertMarkdownToPdf(
  mdFilePath: string,
  outputPdfPath: string
): Promise<void> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const markdownContent = await fs.readFile(mdFilePath, 'utf-8');
    const htmlContent = markdownToHtml(markdownContent);

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Ensure output directory exists
    const outputDir = path.dirname(outputPdfPath);
    await fs.mkdir(outputDir, { recursive: true });

    await page.pdf({
      path: outputPdfPath,
      format: 'A4',
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    console.log(`✓ PDF generated: ${outputPdfPath}`);
  } finally {
    await browser.close();
  }
}

/**
 * Simple markdown to HTML converter
 * Handles basic markdown syntax for document generation
 */
function markdownToHtml(markdown: string): string {
  let html = markdown
    // Headings
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    // Line breaks (single)
    .replace(/\n/g, '<br>');

  // Wrap in HTML structure with styling
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Document</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        h1, h2, h3 { color: #2c3e50; margin-top: 20px; margin-bottom: 10px; }
        h1 { border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { border-bottom: 2px solid #3498db; padding-bottom: 5px; }
        code {
          background: #f4f4f4;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        pre {
          background: #f4f4f4;
          padding: 12px;
          border-left: 4px solid #3498db;
          overflow-x: auto;
        }
        pre code {
          background: none;
          padding: 0;
          border-radius: 0;
        }
        a {
          color: #3498db;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        blockquote {
          border-left: 4px solid #bbb;
          margin: 0;
          padding-left: 16px;
          color: #666;
        }
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 10px 0;
        }
        table, th, td {
          border: 1px solid #ddd;
        }
        th, td {
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f4f4f4;
        }
      </style>
    </head>
    <body>
      <p>${html}</p>
    </body>
    </html>
  `;
}
