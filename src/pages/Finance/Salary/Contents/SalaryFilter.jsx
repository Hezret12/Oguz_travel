import { memo } from "react";
import { MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import { useGet } from "../../../../hooks/CRUD/useGet";
import { getAllOfficeApi } from "../../../../api/queries/getters";

const SalaryFilter = ({ filters, onFilterChange }) => {
  const { t, selectedLang } = useLocale();
  const { data: offices = [] } = useGet({ apiFn: getAllOfficeApi, key: "office" });
  const officeList = Array.isArray(offices) ? offices : [];

  return (
    <Stack spacing={1}>
      <Typography variant="body2" sx={{ fontWeight: 650, fontSize: "13.5px" }}>
        {t("salary.office")}
      </Typography>
      <TextField
        select
        size="small"
        fullWidth
        value={filters?.office_guid ?? ""}
        onChange={(e) => onFilterChange("office_guid", e.target.value)}
        slotProps={{ select: { displayEmpty: true } }}
      >
        <MenuItem value="">{t("salary.allOffices")}</MenuItem>
        {officeList.map((office) => (
          <MenuItem key={office.guid} value={office.guid}>
            {selectedLang(office.shortName) || selectedLang(office.fullName)}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
};

export default memo(SalaryFilter);
