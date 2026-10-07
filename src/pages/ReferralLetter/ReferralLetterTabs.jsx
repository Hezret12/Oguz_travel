import { Box, Tab, Tabs } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useLocale } from "../../hooks/useLocale";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { usePagginationGet } from "../../hooks/usePagginationGet";
import { getAllReportsApi } from "../../api/queries/getters";
import { tabStyles } from "../Users/shared/modalStyles";
import ReferalLetter from "./index";
import LetterStockPage from "../Reports/ReferralLetter";
import TotalStockPill from "../Reports/ReferralLetter/components/TotalStockPill";

const STOCK_TAB = "stock";
// Only the total is needed, not the batches themselves.
const TOTAL_ONLY_PARAMS = { page: 1, limit: 1 };

const TABS = [
  { key: "letters", labelKey: "referralLetter.title" },
  { key: STOCK_TAB, labelKey: "referralLetter.stockTab" },
];

/**
 * The referral letters page: the letters themselves and the letter stock they are drawn
 * from, as two tabs. The tab lives in the URL (`?tab=stock`), so a link or a page reload
 * lands on the same tab. Each tab draws its own header and puts the tab switch in it.
 */
const ReferralLetterTabs = () => {
  const { t } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === STOCK_TAB ? STOCK_TAB : "letters";
  const activeLabel = t(TABS.find((tab) => tab.key === activeTab).labelKey);

  useDocumentTitle(`${activeLabel} | Oguz Travel`);

  const tabs = (
    <Tabs
      value={activeTab}
      onChange={(_, value) => setSearchParams(value === STOCK_TAB ? { tab: STOCK_TAB } : {})}
      sx={tabStyles}
    >
      {TABS.map((tab) => (
        <Tab key={tab.key} value={tab.key} label={t(tab.labelKey)} sx={{ minWidth: 160 }} />
      ))}
    </Tabs>
  );

  // The stock tab reads the total with its own list; the letters tab asks for it here, under
  // the same cache key, so adding or editing a stock batch refreshes it on both tabs.
  const { responseBody } = usePagginationGet({
    apiFn: getAllReportsApi,
    key: "reports",
    params: TOTAL_ONLY_PARAMS,
    options: { enabled: activeTab !== STOCK_TAB },
  });

  if (activeTab === STOCK_TAB) return <LetterStockPage tabs={tabs} />;

  return (
    <ReferalLetter
      tabs={
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          {tabs}
          <TotalStockPill count={responseBody?.total_report_count} />
        </Box>
      }
    />
  );
};

export default ReferralLetterTabs;
