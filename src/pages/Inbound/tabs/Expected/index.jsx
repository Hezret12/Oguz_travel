import { useMemo } from "react";
import dayjs from "dayjs";
import { useLocale } from "../../../../hooks/useLocale";
import { useDateFormat } from "../../../../functions/generalHelpers";
import StackedCell from "../../../../components/inputs/StackCell";
import { getAllInboundExpectedApi } from "../../../../api/queries/getters";
import { deleteInboundExpectedApi } from "../../../../api/queries/delete";
import InboundTable from "../../Contents/InboundTable";
import AddExpectedModal from "./AddExpectedModal";
import EditExpectedModal from "./EditExpectedModal";

const center = {
  muiTableHeadCellProps: { align: "center" },
  muiTableBodyCellProps: { align: "center" },
};

// Both days count: 04.02 – 08.02 is a 5-day trip.
const tripDays = (row) => {
  const start = dayjs(row.start_date);
  const end = dayjs(row.end_date);
  return start.isValid() && end.isValid() ? end.diff(start, "day") + 1 : null;
};

const ExpectedTab = (props) => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();

  const columns = useMemo(
    () => [
      {
        accessorKey: "country",
        id: "country",
        header: t("inbound.fields.country"),
        size: 160,
      },
      {
        accessorKey: "tourists_count",
        id: "tourists_count",
        header: t("inbound.fields.touristsCount"),
        size: 120,
        ...center,
      },
      {
        id: "period",
        header: t("inbound.fields.tripPeriod"),
        size: 210,
        accessorFn: (row) => row.start_date,
        Cell: ({ row }) => {
          const days = tripDays(row.original);
          return (
            <StackedCell
              primary={`${formatChange(row.original.start_date, { dateOnly: true })} – ${formatChange(row.original.end_date, { dateOnly: true })}`}
              secondary={days ? t("inbound.days", { count: days }) : ""}
            />
          );
        },
      },
      {
        accessorKey: "route",
        id: "route",
        header: t("inbound.fields.route"),
        size: 340,
      },
      {
        accessorKey: "transport",
        id: "transport",
        header: t("inbound.fields.transport"),
        size: 170,
      },
      {
        accessorKey: "note",
        id: "note",
        header: t("columns.note"),
        size: 200,
      },
    ],
    [t, formatChange],
  );

  return (
    <InboundTable
      {...props}
      tab="expected"
      apiFn={getAllInboundExpectedApi}
      deleteFn={deleteInboundExpectedApi}
      columns={columns}
      AddModal={AddExpectedModal}
      EditModal={EditExpectedModal}
    />
  );
};

export default ExpectedTab;
