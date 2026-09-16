
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

  // Collect all styles from the parent document
  let stylesHtml = "";
  const styleNodes = document.querySelectorAll("style, link[rel='stylesheet']");
  styleNodes.forEach((node) => {
    stylesHtml += node.outerHTML;
  });

  const printStyles = `
    <style>
      @page {
        size: A4 portrait;
        margin: 0mm !important; /* Suppresses browser headers (URL, title, date) and footers */
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
      }
      #printable-cv-sheet, #printable-word-document, #printable-doc-sheet {
        box-shadow: none !important;
        border: none !important;
        margin: 0 auto !important;
        width: 100% !important;
        max-width: 100% !important;
        min-height: auto !important;
        background: #ffffff !important;
      }
      #printable-cv-sheet, #printable-doc-sheet {
        padding: 14mm 16mm !important;
      }
      #printable-word-document {
        padding: 0 !important;
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
