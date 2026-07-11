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
  muiTableBodyProps: {
    sx: (theme) => ({
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.secondary,
    }),
  },
  muiTableBodyRowProps: () => ({
    sx: (theme) => ({
      cursor: "pointer",
      transition: "background-color 0.2s ease",
      "&:hover": {
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.08)"
            : `${theme.palette.action.hover} !important`,
      },
    }),
  }),
  muiTablePaperProps: {
    sx: {
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 190px)",
      width: "100%",
      border: "1px solid",
      borderColor: (theme) =>
        theme.palette.mode === "dark" ? "#1e1e1e" : "#e5e7eb",
    },
  },

  // renderEmptyRowsFallback: () => NoData(),

  muiTableContainerProps: {
    sx: (theme) => ({
      flex: 1,
      overflow: "auto",
      position: "relative",
      "&::-webkit-scrollbar": {
        width: "8px",
      },
      "&::-webkit-scrollbar-track": {
        background: theme.palette.mode === "dark" ? "#1e1e1e" : "#f0f0f0",
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: theme.palette.mode === "dark" ? "#555" : "#c0c0c0",
        borderRadius: "4px",
        border: `2px solid ${
          theme.palette.mode === "dark" ? "#1e1e1e" : "#f0f0f0"
        }`,
      },
      scrollbarWidth: "thin",
      scrollbarColor: `${
        theme.palette.mode === "dark" ? "#555 #1e1e1e" : "#c0c0c0 #f0f0f0"
      }`,
    }),
  },
  muiTableHeadProps: {
    sx: {
      position: "sticky",
      top: 0,
      zIndex: 10,
      backgroundColor: "white",
    },
  },
  muiTableHeadCellProps: {
    sx: {
      fontSize: "15px",
      fontWeight: 600,
    },
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
    sx: {
      overflow: "visible",
    },
  },
  // defaultColumn: {
  //     maxSize: 600,
  //     minSize: 100,
  //     size: 130,
  // },
});
