import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import DocumentList from "./DocumentList";
import DocumentEditor from "./DocumentEditor";
import {
  createNewDocument,
  serializeDocumentToBackend,
  deserializeBackendToDocument,
} from "./constants";
import { usePagginationGet } from "../../../hooks/usePagginationGet";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { getAllVisaDocsApi, getOneVisaDocApi } from "../../../api/queries/getters";
import { addVisaDocApi } from "../../../api/queries/post";
import { updateVisaDocApi } from "../../../api/queries/patch";
import { deleteVisaDocApi } from "../../../api/queries/delete";

const STORAGE_KEY = "oguz_travel_visa_documents";

const Package = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);

  // 1. Fetch all Visa Docs from Backend via usePagginationGet
  const {
    data: serverDocs,
    totalItems,
    isLoading,
    isFetching,
    refetch,
  } = usePagginationGet({
    apiFn: getAllVisaDocsApi,
    key: "visaDocs",
    params: { page, limit, search: searchQuery },
    options: {
      retry: false,
    },
  });

  // Local storage fallback state
  const [localDocs, setLocalDocs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [activeDocument, setActiveDocument] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // 2. Create Visa Doc Mutation
  const { mutate: createVisaDoc, isPending: isCreating } = useCreate({
    apiFn: addVisaDocApi,
    key: "visaDocs",
    onSuccess: (res) => {
      const created = res?.data?.data || res?.data;
      if (created) {
        const deserialized = deserializeBackendToDocument(created);
        setActiveDocument(deserialized);
      }
      refetch();
    },
  });

  // 3. Update Visa Doc Mutation
  const { mutate: updateVisaDoc, isPending: isUpdating } = useUpdate({
    apiFn: updateVisaDocApi,
    key: "visaDocs",
    idKey: "guid",
    onSuccessUpdate: (res) => {
      const updated = res?.data?.data || res?.data;
      if (updated) {
        const deserialized = deserializeBackendToDocument(updated);
        setActiveDocument(deserialized);
      }
      refetch();
    },
  });

  // 4. Delete Visa Doc Mutation
  const { mutate: deleteVisaDoc } = useDelete({
    deleteFn: deleteVisaDocApi,
    queryKey: "visaDocs",
    idKey: "guid",
    isPaginated: true,
  });

  // Decide active documents list (server data with fallback to local)
  const displayDocuments = Array.isArray(serverDocs) && serverDocs.length > 0 ? serverDocs : localDocs;

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localDocs));
    } catch {
      // Ignore
    }
  }, [localDocs]);

  // Open Document: Fetch full details if needed
  const handleSelectDocument = async (doc) => {
    const docGuid = doc.guid || doc.id;
    if (doc.tables && doc.tables.length > 0) {
      setActiveDocument(doc);
      return;
    }

    setIsLoadingDetail(true);
    try {
      const res = await getOneVisaDocApi(docGuid);
      const dataObj = res?.data?.data || res?.data;
      if (dataObj) {
        const fullDoc = deserializeBackendToDocument(dataObj);
        setActiveDocument(fullDoc);
      } else {
        setActiveDocument(doc);
      }
    } catch {
      setActiveDocument(doc);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCreateDocument = () => {
    const newDoc = createNewDocument();
    setActiveDocument(newDoc);
  };

  const handleSaveDocument = (updatedDoc) => {
    const isNew = !updatedDoc.guid && (!updatedDoc.id || String(updatedDoc.id).startsWith("doc-"));
    const payload = serializeDocumentToBackend(updatedDoc);

    // Also update local list for offline capability
    setLocalDocs((prev) => {
      const exists = prev.some((d) => (d.guid || d.id) === (updatedDoc.guid || updatedDoc.id));
      if (exists) {
        return prev.map((d) =>
          (d.guid || d.id) === (updatedDoc.guid || updatedDoc.id) ? updatedDoc : d
        );
      }
      return [updatedDoc, ...prev];
    });

    if (isNew) {
      createVisaDoc(payload);
    } else {
      updateVisaDoc(payload);
    }
  };

  const handleDeleteDocument = (docId, docGuid) => {
    const targetGuid = docGuid || docId;
    setLocalDocs((prev) => prev.filter((d) => (d.guid || d.id) !== targetGuid));
    if (activeDocument && (activeDocument.guid === targetGuid || activeDocument.id === targetGuid)) {
      setActiveDocument(null);
    }

    if (targetGuid && !String(targetGuid).startsWith("doc-")) {
      deleteVisaDoc(targetGuid);
    }
  };

  const handleBackToList = () => {
    setActiveDocument(null);
    refetch();
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
          key={activeDocument.guid || activeDocument.id}
          initialDocument={activeDocument}
          onBack={handleBackToList}
          onSave={handleSaveDocument}
          isSaving={isCreating || isUpdating}
        />
      ) : (
        <DocumentList
          documents={displayDocuments}
          isLoading={isLoading || isLoadingDetail}
          isFetching={isFetching}
          onRefetch={refetch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          page={page}
          limit={limit}
          setPage={setPage}
          setPageSize={setLimit}
          totalItems={totalItems || displayDocuments.length}
          onSelectDocument={handleSelectDocument}
          onCreateDocument={handleCreateDocument}
          onDeleteDocument={handleDeleteDocument}
        />
      )}
    </Box>
  );
};

export default Package;
