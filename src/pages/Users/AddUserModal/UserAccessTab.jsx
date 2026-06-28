import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Controller } from "react-hook-form";
import { PERMISSIONS_DATA } from "./permissions";
import { useLocale } from "../../../hooks/useLocale";

const UserAccessTab = ({ control }) => {
  const { t } = useLocale();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Calculate total number of permissions in system
  const allPermissionIds = PERMISSIONS_DATA.reduce(
    (acc, group) => [...acc, ...group.items.map((item) => item.id)],
    []
  );
  const totalSystemPermissions = allPermissionIds.length;

  return (
    <Controller
      name="permissions"
      control={control}
      render={({ field: { value = [], onChange }, fieldState: { error } }) => {
        const selectedCount = value.length;

        // Select All Handler
        const handleSelectAll = () => {
          onChange(allPermissionIds);
        };

        // Clear All Handler
        const handleClearAll = () => {
          onChange([]);
        };

        // Parent Group Checkbox Toggle Handler
        const handleGroupToggle = (groupItemIds, isAllSelected) => {
          if (isAllSelected) {
            // Remove group items
            onChange(value.filter((id) => !groupItemIds.includes(id)));
          } else {
            // Add group items (avoid duplicates)
            const otherSelected = value.filter((id) => !groupItemIds.includes(id));
            onChange([...otherSelected, ...groupItemIds]);
          }
        };

        // Single Checkbox Toggle Handler
        const handleSingleToggle = (itemId) => {
          if (value.includes(itemId)) {
            onChange(value.filter((id) => id !== itemId));
          } else {
            onChange([...value, itemId]);
          }
        };

        return (
          <Box sx={{ mt: 2 }}>
            {/* Header section */}
            <Box
              sx={{
                p: 2,
                mb: 2.5,
                borderRadius: "12px",
                backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#e2e8f0"}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                {t("users.permissionsTitle") ?? "Permissions"}
              </Typography>

              <Stack
                direction="row"
                sx={{ flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}
                gap={1.5}
              >
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {selectedCount} / {totalSystemPermissions} {t("users.selected") ?? "Selected"}
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={handleSelectAll}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "13px",
                      color: "#2563eb",
                      "&:hover": { backgroundColor: "rgba(37,99,235,0.05)" },
                    }}
                  >
                    {t("users.selectAll") ?? "Select All"}
                  </Button>
                  <Box
                    sx={{
                      width: "1px",
                      backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "#e2e8f0",
                      alignSelf: "stretch",
                    }}
                  />
                  <Button
                    size="small"
                    variant="text"
                    onClick={handleClearAll}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "13px",
                      color: "#ef4444",
                      "&:hover": { backgroundColor: "rgba(239,68,68,0.05)" },
                    }}
                  >
                    {t("users.clearAll") ?? "Clear All"}
                  </Button>
                </Stack>
              </Stack>
            </Box>

            {/* Permissions Group Accordions */}
            <Stack spacing={1.5}>
              {PERMISSIONS_DATA.map((group) => {
                const groupItemIds = group.items.map((item) => item.id);
                const selectedGroupItems = groupItemIds.filter((id) => value.includes(id));
                const selectedGroupCount = selectedGroupItems.length;
                const totalGroupCount = group.items.length;

                const isAllSelected = selectedGroupCount === totalGroupCount;
                const isSomeSelected = selectedGroupCount > 0 && selectedGroupCount < totalGroupCount;

                return (
                  <Accordion
                    key={group.id}
                    sx={{
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0"}`,
                      borderRadius: "10px !important",
                      overflow: "hidden",
                      "&:before": { display: "none" },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ fontSize: 20 }} />}
                      sx={{
                        backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
                        minHeight: 48,
                        "& .MuiAccordionSummary-content": {
                          margin: "8px 0",
                          display: "flex",
                          alignItems: "center",
                        },
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isAllSelected}
                            indeterminate={isSomeSelected}
                            onClick={(e) => e.stopPropagation()} // Prevent expand on click
                            onChange={() => handleGroupToggle(groupItemIds, isAllSelected)}
                            sx={{
                              color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
                              "&.Mui-checked, &.MuiCheckbox-indeterminate": {
                                color: "#2563eb",
                              },
                            }}
                          />
                        }
                        label={
                          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>
                              {t("users.permissions.groups." + group.id) ?? group.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: selectedGroupCount > 0 ? "primary.main" : "text.secondary",
                                fontWeight: 700,
                              }}
                            >
                              ({selectedGroupCount}/{totalGroupCount})
                            </Typography>
                          </Stack>
                        }
                        sx={{ margin: 0, mr: 1 }}
                      />
                    </AccordionSummary>

                    <AccordionDetails
                      sx={{
                        p: 2.5,
                        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#e2e8f0"}`,
                      }}
                    >
                      <Grid container spacing={2}>
                        {group.items.map((item) => {
                          const isChecked = value.includes(item.id);
                          return (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={isChecked}
                                    onChange={() => handleSingleToggle(item.id)}
                                    sx={{
                                      color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                                      "&.Mui-checked": {
                                        color: "#2563eb",
                                      },
                                    }}
                                  />
                                }
                                label={
                                  <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                                    {t("users.permissions.items." + item.id) ?? item.label}
                                  </Typography>
                                }
                                sx={{ margin: 0, width: "100%" }}
                              />
                            </Grid>
                          );
                        })}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>

            {error && (
              <FormHelperText error sx={{ mx: 1, mt: 1 }}>
                {error.message}
              </FormHelperText>
            )}
          </Box>
        );
      }}
    />
  );
};

export default UserAccessTab;
