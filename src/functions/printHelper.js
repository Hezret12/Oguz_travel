
export const printElement = (element, docTitle = "") => {
  if (!element) return;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;

  // Collect all styles from the parent document. Emotion injects rules via
  // insertRule in production, leaving <style> tags empty, so read cssRules.
  let stylesHtml = "";
  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      const cssText = Array.from(sheet.cssRules || [], (rule) => rule.cssText).join("\n");
      stylesHtml += `<style>${cssText}</style>`;
    } catch {
      // Cross-origin stylesheet (e.g. Google Fonts) — rules are unreadable, link it instead
      if (sheet.href) stylesHtml += `<link rel="stylesheet" href="${sheet.href}" />`;
    }
  });

  const printStyles = `
    <style>
      @page {
        size: A4 portrait;
        margin: 8mm 0mm 8mm 0mm !important;
      }
      @page :first {
        margin-top: 0mm !important;
      }
      *, *::before, *::after {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #1e293b !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        overflow: visible !important;
        height: auto !important;
      }
      #printable-cv-sheet, #printable-doc-sheet {
        box-shadow: none !important;
        border: none !important;
        margin: 0 auto !important;
        width: 100% !important;
        max-width: 100% !important;
        min-height: auto !important;
        background: #ffffff !important;
      }
      #printable-doc-sheet {
        padding: 14mm 16mm !important;
      }
      #printable-cv-sheet {
        padding: 0 !important;
        border-radius: 0 !important;
        min-height: 296mm !important;
        overflow: visible !important;
      }
      #printable-cv-sheet .cv-print-body {
        padding: 8mm 14mm 10mm 14mm !important;
      }

      /* Multi-page Word/Document print pagination styles */
      #printable-word-document {
        display: block !important;
        position: static !important;
        width: 100% !important;
        max-width: 100% !important;
        min-height: 0 !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        background: #ffffff !important;
        box-shadow: none !important;
        border: none !important;
      }
      #printable-word-document,
      #printable-word-document * {
        box-sizing: border-box !important;
      }
      /* Remove all overflow:hidden and fixed heights inside printable document */
      #printable-word-document div,
      #printable-word-document section,
      #printable-word-document .table-card-container {
        overflow: visible !important;
        max-height: none !important;
        height: auto !important;
      }
      #printable-word-document .table-card-container {
        border: 1px solid #cbd5e1 !important;
        border-radius: 0 !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
      }
      #printable-word-document table {
        width: 100% !important;
        border-collapse: collapse !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
      }
      #printable-word-document thead {
        display: table-header-group !important;
      }
      #printable-word-document tbody {
        display: table-row-group !important;
      }
      #printable-word-document tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      #printable-word-document td,
      #printable-word-document th {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      #printable-word-document .doc-table-section {
        page-break-inside: auto !important;
        break-inside: auto !important;
      }
      #printable-word-document .doc-section-header {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      #printable-word-document .doc-note-box {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      #printable-word-document .letterhead-bleed {
        margin: 0 !important;
      }
      #printable-word-document .print-body-padding {
        padding: 0 10mm 10mm 10mm !important;
      }
      .no-print {
        display: none !important;
      }
    </style>
  `;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${docTitle ? docTitle : "&lrm;"}</title>
        ${stylesHtml}
        ${printStyles}
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  let hasPrinted = false;

  const cleanup = () => {
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 800);
  };

  const triggerPrint = () => {
    if (hasPrinted) return;
    hasPrinted = true;

    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch {
      // Ignore
    } finally {
      cleanup();
    }
  };

  iframe.contentWindow.onload = () => {
    setTimeout(triggerPrint, 250);
  };

  // Fallback to guarantee execution if onload event already fired
  setTimeout(() => {
    if (!hasPrinted && document.body.contains(iframe)) {
      triggerPrint();
    }
  }, 600);
};
