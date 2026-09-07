import { useState } from "react";
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

const Package = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);

  // 1. Fetch all Visa Docs from Backend via usePagginationGet
  const {
    data: serverDocs = [],
    totalItems = 0,
    isLoading,
    isFetching,
    refetch,
  } = usePagginationGet({
    apiFn: getAllVisaDocsApi,
    key: "visaDocs",
    params: { page, limit, search: searchQuery },
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
  const { mutate: deleteVisaDoc, isPending: isDeleting } = useDelete({
    deleteFn: deleteVisaDocApi,
    queryKey: "visaDocs",
    idKey: "guid",
    isPaginated: true,
  });

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

    if (isNew) {
      createVisaDoc(payload);
    } else {
      updateVisaDoc(payload);
    }
  };

  const handleDeleteDocument = (docId, docGuid, options = {}) => {
    const targetGuid = docGuid || docId;
    if (activeDocument && (activeDocument.guid === targetGuid || activeDocument.id === targetGuid)) {
      setActiveDocument(null);
    }

    if (targetGuid && !String(targetGuid).startsWith("doc-")) {
      deleteVisaDoc(targetGuid, {
        onSuccess: () => {
          options?.onSuccess?.();
        },
        onError: (err) => {
          options?.onError?.(err);
        },
      });
    } else {
      options?.onSuccess?.();
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
          documents={serverDocs}
          isLoading={isLoading || isLoadingDetail}
          isFetching={isFetching}
          isDeleting={isDeleting}
          onRefetch={refetch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          page={page}
          limit={limit}
          setPage={setPage}
          setPageSize={setLimit}
          totalItems={totalItems || serverDocs.length}
          onSelectDocument={handleSelectDocument}
          onCreateDocument={handleCreateDocument}
          onDeleteDocument={handleDeleteDocument}
        />
      )}
    </Box>
  );
};

export default Package;
