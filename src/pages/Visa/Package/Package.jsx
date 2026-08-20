import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import DocumentList from "./DocumentList";
import DocumentEditor from "./DocumentEditor";
import { createNewDocument } from "./constants";

const STORAGE_KEY = "oguz_travel_visa_documents";

const Package = () => {
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Fallback on error
    }
    return [];
  });

  const [activeDocumentId, setActiveDocumentId] = useState(null);

  // Sync to localStorage whenever documents change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch {
      // Ignore write errors (e.g. quota exceeded)
    }
  }, [documents]);

  const activeDocument = documents.find((d) => d.id === activeDocumentId) || null;

  const handleSelectDocument = (doc) => {
    setActiveDocumentId(doc.id);
  };

  const handleCreateDocument = () => {
    const newDoc = createNewDocument();
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocumentId(newDoc.id);
  };

  const handleSaveDocument = (updatedDoc) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === updatedDoc.id ? updatedDoc : doc))
    );
  };

  const handleDeleteDocument = (docId) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    if (activeDocumentId === docId) {
      setActiveDocumentId(null);
    }
  };

  const handleBackToList = () => {
    setActiveDocumentId(null);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {activeDocument ? (
        <DocumentEditor
          key={activeDocument.id}
          initialDocument={activeDocument}
          onBack={handleBackToList}
          onSave={handleSaveDocument}
        />
      ) : (
        <DocumentList
          documents={documents}
          onSelectDocument={handleSelectDocument}
          onCreateDocument={handleCreateDocument}
          onDeleteDocument={handleDeleteDocument}
        />
      )}
    </Box>
  );
};

export default Package;
