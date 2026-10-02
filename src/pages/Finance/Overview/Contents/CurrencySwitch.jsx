import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { useLocale } from "../../../../hooks/useLocale";
import { CURRENCIES, segmentedSx } from "../functions/analyticsFormat";

// USD / TMT switch of the analytics pages. The two are reported separately and
// never converted, so it picks which one the charts and rankings show.
const CurrencySwitch = ({ value, onChange }) => {
  const { t } = useLocale();
  return (
    <Tooltip title={t("finance.analytics.noConversion")} arrow>
      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={(_e, next) => next && onChange(next)}
        sx={segmentedSx}
      >
        {CURRENCIES.map((c) => (
          <ToggleButton key={c} value={c}>
            {c}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Tooltip>
  );
};

export default CurrencySwitch;
