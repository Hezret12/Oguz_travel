import { createElement } from "react";
import TableEmptyState from "../components/TableEmptyState";

export const getDefaultMRTOptions = () => ({
  layoutMode: "table",
  editDisplayMode: "modal",
  createDisplayMode: "modal",
  initialState: {
    density: "compact",
    columnVisibility: {
      "mrt-row-actions": true,
    },
    pagination: {
      pageSize: 10,
      pageIndex: 0,
    },
  },
  enableRowActions: false,
  enableEditing: false,
  enableCreatingRow: true,
  enableColumnFilters: false,
  enableGlobalFilter: false,
  //   enableRowSelection: true,
  enableClickToRowSelect: true,
  enableBottomToolbar: true,
  enableSorting: false,
  enablePagination: true,
  enableColumnActions: false,
  enableStickyHeader: true,
  positionToolbarAlertBanner: "bottom",

  enableColumnOrdering: false,
  enableRowOrdering: false,
  displayColumnDefOptions: {
    "mrt-row-actions": {
      enableHiding: true,
    },
  },
  mrtTheme: (theme) => ({
    baseBackgroundColor: theme.palette.background.paper,
    pinnedRowBackgroundColor: theme.palette.background.paper,
    selectedRowBackgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(20, 184, 166, 0.12)"
        : "rgba(14, 133, 132, 0.08)",
  }),
  muiTablePaperProps: {
    sx: (theme) => ({
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 190px)",
      width: "100%",
      border: "1px solid",
      borderColor: "divider",
      backgroundColor: theme.palette.background.paper,
      boxShadow: "none",
      borderRadius: "12px",
      overflow: "hidden",
    }),
  },
  muiTableProps: {
    sx: (theme) => ({
      backgroundColor: theme.palette.background.paper,
    }),
  },
  muiTableBodyProps: {
    sx: (theme) => ({
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
    }),
  },
  muiTableBodyRowProps: () => ({
    sx: (theme) => ({
      cursor: "pointer",
      backgroundColor: theme.palette.background.paper,
      transition: "background-color 0.15s ease",
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.03) !important",
        ...theme.applyStyles("dark", {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
        }),
      },
    }),
  }),

  renderEmptyRowsFallback: () => createElement(TableEmptyState),

  muiTableContainerProps: {
    sx: (theme) => ({
      flex: 1,
      overflow: "auto",
      position: "relative",
      backgroundColor: theme.palette.background.paper,
      "&::-webkit-scrollbar": {
        width: "8px",
      },
      "&::-webkit-scrollbar-track": {
        background: "#f0f0f0",
        ...theme.applyStyles("dark", {
          background: "#1e1e1e",
        }),
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: "#c0c0c0",
        borderRadius: "4px",
        border: "2px solid #f0f0f0",
        ...theme.applyStyles("dark", {
          backgroundColor: "#555",
          border: "2px solid #1e1e1e",
        }),
      },
      scrollbarWidth: "thin",
      scrollbarColor: "#c0c0c0 #f0f0f0",
      ...theme.applyStyles("dark", {
        scrollbarColor: "#555 #1e1e1e",
      }),
    }),
  },
  muiTableHeadProps: {
    sx: (theme) => ({
      position: "sticky",
      top: 0,
      zIndex: 10,
      backgroundColor: theme.palette.background.paper,
    }),
  },
  muiTableHeadCellProps: ({ column }) => {
    const isPinned = column.getIsPinned();
    const pinnedShadowLight = !isPinned
      ? undefined
      : isPinned === "left"
        ? "4px 0 8px -2px rgba(0, 0, 0, 0.06) !important"
        : "-4px 0 8px -2px rgba(0, 0, 0, 0.06) !important";
    const pinnedShadowDark = !isPinned
      ? undefined
      : isPinned === "left"
        ? "4px 0 8px -2px rgba(0, 0, 0, 0.5) !important"
        : "-4px 0 8px -2px rgba(0, 0, 0, 0.5) !important";

    return {
      sx: (theme) => ({
        fontSize: "14px",
        fontWeight: 650,
        backgroundColor: theme.palette.background.paper,
        color: "#334155",
        borderBottom: `1px solid ${theme.palette.divider}`,
        ...(isPinned && { boxShadow: pinnedShadowLight }),
        ...theme.applyStyles("dark", {
          color: "#F8FAFC",
          ...(isPinned && { boxShadow: pinnedShadowDark }),
        }),
      }),
    };
  },
  muiTableBodyCellProps: ({ column }) => {
    const isPinned = column.getIsPinned();
    const pinnedShadowLight = !isPinned
      ? undefined
      : isPinned === "left"
        ? "4px 0 8px -2px rgba(0, 0, 0, 0.06) !important"
        : "-4px 0 8px -2px rgba(0, 0, 0, 0.06) !important";
    const pinnedShadowDark = !isPinned
      ? undefined
      : isPinned === "left"
        ? "4px 0 8px -2px rgba(0, 0, 0, 0.5) !important"
        : "-4px 0 8px -2px rgba(0, 0, 0, 0.5) !important";

    return {
      sx: (theme) => ({
        backgroundColor: theme.palette.background.paper,
        color: "#1E293B",
        borderBottom: `1px solid ${theme.palette.divider}`,
        ...(isPinned && { boxShadow: pinnedShadowLight }),
        ...theme.applyStyles("dark", {
          color: "#E2E8F0",
          ...(isPinned && { boxShadow: pinnedShadowDark }),
        }),
      }),
    };
  },

  muiBottomToolbarProps: {
    sx: (theme) => ({
      mt: "auto",
      borderTop: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
      px: 2,
      py: 0.75,
      minHeight: "52px",
      display: "flex",
      alignItems: "center",
    }),
  },
  muiPaginationProps: {
    color: "primary",
    shape: "rounded",
    showRowsPerPage: false,
    variant: "outlined",
  },
  paginationDisplayMode: "custom",
  muiTopToolbarProps: {
    sx: (theme) => ({
      overflow: "visible",
      backgroundColor: theme.palette.background.paper,
    }),
  },
  // defaultColumn: {
  //     maxSize: 600,
  //     minSize: 100,
  //     size: 130,
  // },
});
