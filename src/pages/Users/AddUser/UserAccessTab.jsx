import {
  Box,
  Divider,
  FormHelperText,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { useSidebarItems } from "../../../hooks/useSidebarItems";
import { useLocale } from "../../../hooks/useLocale";

const LEGACY_ACCESS_IDS = {
  "/": "dashboard_view",
};

const getAccessId = (item) => item.path;

const getSelectedAccessIds = (value, accessIds) =>
  accessIds.filter(
    (id) => value.includes(id) || value.includes(LEGACY_ACCESS_IDS[id]),
  );

const AccessRow = ({ item, selected, onToggle, isLast }) => (
  <>
    <Box
      component="label"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1,
        px: 0.5,
        cursor: "pointer",
        borderRadius: "8px",
        transition: "background 0.15s",
        "&:hover": { backgroundColor: "action.hover" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          color: selected ? "primary.main" : "text.disabled",
          transition: "color 0.15s",
          flexShrink: 0,
        }}
      >
        {item.icon}
      </Box>

      <Typography
        sx={{
          flex: 1,
          fontSize: 14,
          fontWeight: selected ? 600 : 400,
          color: selected ? "text.primary" : "text.secondary",
          transition: "all 0.15s",
        }}
      >
        {item.text}
      </Typography>

      <Switch
        checked={selected}
        onChange={onToggle}
        size="small"
        disableRipple
      />
    </Box>
    {!isLast && <Divider sx={{ opacity: 0.5 }} />}
  </>
);

const AccessGroup = ({ group, selectedAccessIds, onToggle }) => {
  const children = group.children ?? [group];
  const groupAccessIds = children.map(getAccessId);
  const selectedCount = groupAccessIds.filter((id) =>
    selectedAccessIds.includes(id),
  ).length;

  return (
    <Box
      sx={{
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      {group.isGroup && (
        <Box
          sx={{
            px: 1.5,
            py: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: "action.hover",
          }}
        >
          <Box sx={{ display: "flex", color: "text.secondary", flexShrink: 0 }}>
            {group.icon}
          </Box>
          <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {group.text}
          </Typography>
          <Typography variant="caption" sx={{ color: selectedCount ? "primary.main" : "text.disabled", fontWeight: 700 }}>
            {selectedCount}/{groupAccessIds.length}
          </Typography>
        </Box>
      )}

      <Box sx={{ px: 1.5 }}>
        {children.map((child, idx) => {
          const accessId = getAccessId(child);
          return (
            <AccessRow
              key={accessId}
              item={child}
              selected={selectedAccessIds.includes(accessId)}
              onToggle={() => onToggle(accessId)}
              isLast={idx === children.length - 1}
            />
          );
        })}
      </Box>
    </Box>
  );
};

const UserAccessTab = ({ control }) => {
  const { t } = useLocale();
  const sidebarItems = useSidebarItems();

  const permissionSidebarItems = sidebarItems
    .map((item) => {
      if (item.alwaysVisible) return null;
      if (item.isGroup && item.children) {
        const filteredChildren = item.children.filter((c) => !c.alwaysVisible);
        if (filteredChildren.length === 0) return null;
        return { ...item, children: filteredChildren };
      }
      return item;
    })
    .filter(Boolean);

  const allAccessIds = permissionSidebarItems.flatMap((item) =>
    item.isGroup ? item.children.map(getAccessId) : [getAccessId(item)],
  );

  return (
    <Controller
      name="permissions"
      control={control}
      render={({ field: { value = [], onChange }, fieldState: { error } }) => {
        const selectedAccessIds = getSelectedAccessIds(value, allAccessIds);

        const handleToggle = (accessId) => {
          if (selectedAccessIds.includes(accessId)) {
            onChange(selectedAccessIds.filter((id) => id !== accessId));
          } else {
            onChange([...selectedAccessIds, accessId]);
          }
        };

        return (
          <Box sx={{ pt: 1 }}>
            <Box
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                {t("users.selected") ?? "Selected"}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: selectedAccessIds.length ? "primary.main" : "text.disabled" }}>
                {selectedAccessIds.length} / {allAccessIds.length}
              </Typography>
            </Box>

            <Stack spacing={1.5}>
              {permissionSidebarItems.map((item) => (
                <AccessGroup
                  key={item.isGroup ? item.text : getAccessId(item)}
                  group={item}
                  selectedAccessIds={selectedAccessIds}
                  onToggle={handleToggle}
                />
              ))}
            </Stack>

            {error && (
              <FormHelperText error sx={{ mt: 1 }}>
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
