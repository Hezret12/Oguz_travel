import { memo, useMemo, useState, useCallback } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Typography,
  Menu,
  MenuItem,
  ButtonBase,
  alpha,
} from "@mui/material";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import AppAvatarGroup from "../../../components/AppAvatarGroup";
import ColumnActionButtons from "../../../components/ColumnActionButtons";
import Pagination from "../../../components/Pagination";
import StatusChip from "../../../components/StatusChip";
import StackedCell from "../../../components/inputs/StackCell";
import TableEmptyState from "../../../components/TableEmptyState";
import { getDefaultMRTOptions } from "../../../hooks/getDefaultMRTOptions";
import { useLocale } from "../../../hooks/useLocale";
import { useDateFormat } from "../../../functions/generalHelpers";
import {
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
} from "../../../functions/statusChipConfigs";
import {
  TASK_STATUS_ITEMS,
  getTaskAssignees,
  getTaskAttachments,
  getTaskStart,
  getTaskEnd,
  isTaskOverdue,
} from "../functions/taskMeta";

function TaskListTable({
  tasks = [],
  isLoading = false,
  isFetching = false,
  isError = false,
  page = 1,
  limit = 10,
  pageCount = 0,
  totalItems = 0,
  onPageChange,
  sortBy = "",
  sortOrder = "asc",
  onSortChange,
  onMoveTaskStatus,
  onEditTask,
  onDeleteTask,
}) {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();
  const defaultMrtOptions = useMemo(() => getDefaultMRTOptions(), []);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [statusTask, setStatusTask] = useState(null);

  const handleStatusMenuClose = useCallback(() => {
    setStatusMenuAnchor(null);
    setStatusTask(null);
  }, []);

  const columns = useMemo(
    () => [
      {
        id: "index_number",
        header: "#",
        size: 50,
        enableSorting: false,
        Cell: ({ row }) =>
          row.original.index_number ?? (page - 1) * limit + row.index + 1,
      },
      {
        accessorKey: "title",
        header: t("task.title"),
        size: 280,
        Cell: ({ row }) => (
          <StackedCell
            primary={row.original.title || row.original.description}
            secondary={row.original.title ? row.original.description : null}
          />
        ),
      },
      {
        accessorKey: "status",
        header: t("columns.status"),
        size: 140,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        // Clickable so the status can be switched without opening the edit modal.
        Cell: ({ row }) => (
          <ButtonBase
            onClick={(e) => {
              e.stopPropagation();
              setStatusMenuAnchor(e.currentTarget);
              setStatusTask(row.original);
            }}
            sx={{
              gap: 0.25,
              px: 1,
              py: 0.25,
              borderRadius: "6px",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <StatusChip
              status={Number(row.original.status) || 1}
              config={TASK_STATUS_CONFIG}
            />
            <KeyboardArrowDownIcon
              sx={{ fontSize: 16, color: "text.secondary" }}
            />
          </ButtonBase>
        ),
      },
      {
        accessorKey: "priority",
        header: t("task.priority"),
        size: 110,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => (
          <StatusChip status={cell.getValue()} config={TASK_PRIORITY_CONFIG} />
        ),
      },
      {
        id: "assignees",
        header: t("task.assignees"),
        size: 185,
        minSize: 175,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const assigneesList = getTaskAssignees(row.original);
          if (assigneesList.length === 0) return "—";
          return <AppAvatarGroup items={assigneesList} max={6} size={26} />;
        },
      },
      {
        accessorKey: "start_date",
        header: t("task.startDate"),
        size: 130,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => formatChange(getTaskStart(row.original)) || "—",
      },
      {
        accessorKey: "end_date",
        header: t("task.endDate"),
        size: 130,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const formatted = formatChange(getTaskEnd(row.original));
          if (!formatted) return "—";

          const isOverdue = isTaskOverdue(row.original);

          return (
            <Typography
              component="span"
              sx={{
                fontSize: "inherit",
                fontWeight: isOverdue ? 650 : "inherit",
                color: isOverdue ? "error.main" : "inherit",
              }}
            >
              {formatted}
            </Typography>
          );
        },
      },
      {
        id: "attachments",
        header: t("task.attachments"),
        size: 90,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row }) => {
          const count = getTaskAttachments(row.original).length;
          if (count === 0) return "—";
          return (
            <Box
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
            >
              <AttachFileOutlinedIcon
                sx={{ fontSize: 15, color: "text.secondary" }}
              />
              {count}
            </Box>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: t("columns.createdAt"),
        size: 130,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ cell }) => formatChange(cell.getValue()),
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 110,
        enableSorting: false,
        muiTableHeadCellProps: { align: "center" },
        muiTableBodyCellProps: { align: "center" },
        Cell: ({ row, table }) => (
          <ColumnActionButtons
            row={row}
            table={table}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ),
      },
    ],
    [t, formatChange, page, limit, onEditTask, onDeleteTask],
  );

  const sorting = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : []),
    [sortBy, sortOrder],
  );

  const mrtState = useMemo(
    () => ({
      isLoading: false,
      showLoadingOverlay: isLoading || isFetching,
      showSkeletons: false,
      showProgressBars: false,
      showAlertBanner: isError,
      pagination: { pageIndex: page - 1, pageSize: limit },
      sorting,
    }),
    [isLoading, isFetching, isError, page, limit, sorting],
  );

  const muiTableBodyProps = useMemo(
    () => ({
      sx: (theme) => ({
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.secondary,
        opacity: isLoading || isFetching ? 0 : 1,
        pointerEvents: isLoading || isFetching ? "none" : "auto",
        transition: "opacity 0.15s ease",
      }),
    }),
    [isLoading, isFetching],
  );

  // The page sits inside the TaskFlow layout (own header + board toggle), so the
  // paper fills its flex parent instead of the default fixed viewport height.
  const muiTablePaperProps = useMemo(
    () => ({
      sx: (theme) => ({
        ...defaultMrtOptions.muiTablePaperProps.sx(theme),
        height: "100%",
      }),
    }),
    [defaultMrtOptions],
  );

  const renderEmptyRowsFallback = useCallback(() => {
    if (isLoading || isFetching) return null;
    return <TableEmptyState title={t("task.noTasksFound")} />;
  }, [isLoading, isFetching, t]);

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    enableColumnPinning: true,
    enableTopToolbar: false,
    columns,
    data: tasks || [],
    initialState: {
      ...defaultMrtOptions.initialState,
      columnPinning: {
        left: ["index_number"],
        right: ["actions"],
      },
    },
    state: mrtState,
    muiTableBodyProps,
    muiTablePaperProps,
    getRowId: (row) => row.guid,

    // Server-side options
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    enableSorting: true,
    pageCount,
    rowCount: totalItems,

    onSortingChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(sorting) : updater;
      if (next && next.length > 0) {
        onSortChange?.(next[0].id, next[0].desc ? "desc" : "asc");
      } else {
        onSortChange?.("", "asc");
      }
    },

    renderEmptyRowsFallback,

    renderBottomToolbar: () => (
      <Box
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 0.75,
          minHeight: "52px",
          borderTop: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Box />
        <Pagination
          pageIndex={page - 1}
          pageCount={pageCount}
          totalRows={totalItems}
          onPageChange={(newIndex) => onPageChange?.(newIndex + 1)}
        />
      </Box>
    ),
  });

  return (
    <>
      <MaterialReactTable table={table} />

      {/* Quick status switcher, opened from the status cell */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "12px",
              minWidth: 170,
              boxShadow: 3,
              border: "1px solid",
              borderColor: "divider",
              p: 0.5,
            },
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            py: 0.75,
            display: "block",
            fontWeight: 700,
            color: "text.secondary",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {t("task.changeStatus")}
        </Typography>

        {TASK_STATUS_ITEMS.map((item) => {
          const isSelected = Number(statusTask?.status) === item.id;
          const Icon = item.Icon;

          return (
            <MenuItem
              key={item.id}
              onClick={() => {
                if (statusTask) onMoveTaskStatus?.(statusTask.guid, item.id);
                handleStatusMenuClose();
              }}
              selected={isSelected}
              sx={{
                py: 0.6,
                px: 1.25,
                borderRadius: "8px",
                my: 0.25,
                gap: 1.25,
                "&.Mui-selected": {
                  bgcolor: alpha(item.color, 0.12),
                },
              }}
            >
              <Icon sx={{ fontSize: 16, color: item.color }} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: "0.8125rem",
                  color: isSelected ? item.color : "text.primary",
                }}
              >
                {t(item.labelKey)}
              </Typography>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}

export default memo(TaskListTable);
