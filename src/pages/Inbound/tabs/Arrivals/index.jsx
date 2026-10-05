import { useMemo } from "react";
import { useLocale } from "../../../../hooks/useLocale";
import { useDateFormat } from "../../../../functions/generalHelpers";
import { getAllInboundArrivalsApi } from "../../../../api/queries/getters";
import { deleteInboundArrivalApi } from "../../../../api/queries/delete";
import InboundTable from "../../Contents/InboundTable";
import { GENDER_VALUES } from "../../constants";
import AddArrivalModal from "./AddArrivalModal";
import EditArrivalModal from "./EditArrivalModal";

const center = {
  muiTableHeadCellProps: { align: "center" },
  muiTableBodyCellProps: { align: "center" },
};

const ArrivalsTab = (props) => {
  const { t } = useLocale();
  const { formatChange } = useDateFormat();

  const columns = useMemo(() => {
    const dateCell = ({ cell }) => formatChange(cell.getValue(), { dateOnly: true });

    return [
      {
        accessorKey: "full_name",
        id: "full_name",
        header: t("inbound.fields.fullName"),
        size: 240,
      },
      {
        id: "gender",
        header: t("columns.gender"),
        size: 90,
        accessorFn: (row) =>
          GENDER_VALUES.includes(row.gender) ? t(`inbound.gender.${row.gender}`) : row.gender,
        ...center,
      },
      {
        accessorKey: "birth_date",
        id: "birth_date",
        header: t("columns.dateOfBirth"),
        size: 120,
        Cell: dateCell,
        ...center,
      },
      {
        accessorKey: "passport_number",
        id: "passport_number",
        header: t("inbound.fields.passport"),
        size: 150,
        ...center,
      },
      {
        accessorKey: "citizenship",
        id: "citizenship",
        header: t("inbound.fields.citizenship"),
        size: 120,
        ...center,
      },
      {
        accessorKey: "invitation_number",
        id: "invitation_number",
        header: t("inbound.fields.invitationNumber"),
        size: 140,
        ...center,
      },
      {
        accessorKey: "voucher_number",
        id: "voucher_number",
        header: t("inbound.fields.voucherNumber"),
        size: 160,
        ...center,
      },
      {
        accessorKey: "entry_date",
        id: "entry_date",
        header: t("inbound.fields.entryDate"),
        size: 120,
        Cell: dateCell,
        ...center,
      },
      {
        accessorKey: "exit_date",
        id: "exit_date",
        header: t("inbound.fields.exitDate"),
        size: 120,
        Cell: dateCell,
        ...center,
      },
      {
        accessorKey: "entry_border",
        id: "entry_border",
        header: t("inbound.fields.entryBorder"),
        size: 130,
        ...center,
      },
      {
        accessorKey: "exit_border",
        id: "exit_border",
        header: t("inbound.fields.exitBorder"),
        size: 130,
        ...center,
      },
      {
        accessorKey: "note",
        id: "note",
        header: t("columns.note"),
        size: 200,
      },
    ];
  }, [t, formatChange]);

  return (
    <InboundTable
      {...props}
      tab="arrivals"
      apiFn={getAllInboundArrivalsApi}
      deleteFn={deleteInboundArrivalApi}
      columns={columns}
      AddModal={AddArrivalModal}
      EditModal={EditArrivalModal}
    />
  );
};

export default ArrivalsTab;
