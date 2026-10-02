import { Box } from "@mui/material";
import { BASE_FARE_TEXT } from "../functions/baseFare";

// Fixed red "Base fare" label for the cost of sales, shown the same in every
// language. Renders as a span so it inherits the host Typography's size and
// weight. Chart series and legends that need a plain string use BASE_FARE_TEXT.
const BaseFareLabel = () => (
  <Box component="span" sx={{ color: "error.main" }}>
    {BASE_FARE_TEXT}
  </Box>
);

export default BaseFareLabel;
