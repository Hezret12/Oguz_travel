import { useMemo } from "react";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";
import { getAllInboundInvitationsApi } from "../../../../api/queries/getters";
import { deleteInboundInvitationApi } from "../../../../api/queries/delete";
import InboundTable from "../../Contents/InboundTable";
import AddInvitationModal from "./AddInvitationModal";
import EditInvitationModal from "./EditInvitationModal";

const center = {
  muiTableHeadCellProps: { align: "center" },
  muiTableBodyCellProps: { align: "center" },
};

// A zero is shown dimmed, so the filled counts stand out.
const countCell = (color) => {
  const CountCell = ({ cell }) => {
    const value = Number(cell.getValue() || 0);
    return (
      <Box
        component="span"
        sx={{ fontWeight: 700, color: value > 0 ? color : "text.disabled" }}
      >
        {value}
      </Box>
    );
  };
  return CountCell;
};

const InvitationsTab = (props) => {
  const { t } = useLocale();

  const columns = useMemo(
    () => [
      {
        id: "report_month",
        header: t("inbound.fields.reportMonth"),
        size: 130,
        accessorFn: (row) =>
          dayjs(row.report_month).isValid() ? dayjs(row.report_month).format("MM.YYYY") : "",
        ...center,
      },
      {
        accessorKey: "country",
        id: "country",
        header: t("inbound.fields.country"),
        size: 200,
      },
      {
        accessorKey: "submitted_count",
        id: "submitted_count",
        header: t("inbound.fields.submittedCount"),
        size: 190,
        Cell: countCell("text.primary"),
        ...center,
      },
      {
        accessorKey: "granted_count",
        id: "granted_count",
        header: t("inbound.fields.grantedCount"),
        size: 170,
        Cell: countCell("success.main"),
        ...center,
      },
      {
        accessorKey: "refused_count",
        id: "refused_count",
        header: t("inbound.fields.refusedCount"),
        size: 170,
        Cell: countCell("error.main"),
        ...center,
      },
      {
        accessorKey: "pending_count",
        id: "pending_count",
        header: t("inbound.fields.pendingCount"),
        size: 170,
        Cell: countCell("warning.main"),
        ...center,
      },
      {
        accessorKey: "note",
        id: "note",
        header: t("columns.note"),
        size: 220,
      },
    ],
    [t],
  );

  return (
    <InboundTable
      {...props}
      tab="invitations"
      apiFn={getAllInboundInvitationsApi}
      deleteFn={deleteInboundInvitationApi}
      columns={columns}
      AddModal={AddInvitationModal}
      EditModal={EditInvitationModal}
    />
  );
};

export default InvitationsTab;
