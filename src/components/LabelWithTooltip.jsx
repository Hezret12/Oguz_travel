import { Box, Tooltip } from "@mui/material";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";

const LabelWithTooltip = ({ label, tooltip, required = false }) => {
    return (
        <Box
            component="span"
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
        >
            <span>{label}</span>
            {required && (
                <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>
            )}
            {tooltip && (
                <Tooltip title={tooltip} arrow>
                    <HelpOutlineRoundedIcon
                        sx={{ fontSize: 16, cursor: "help", color: "text.secondary" }}
                        tabIndex={0}
                    />
                </Tooltip>
            )}
        </Box>
    );
};

export default LabelWithTooltip;