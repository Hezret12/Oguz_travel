import { useMemo, useState, useEffect } from "react";
import { Box, Button, TextField, Paper, Typography, IconButton, Tooltip, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { useForm } from "react-hook-form";
import { useLocale } from "../../../hooks/useLocale";
import PageHeader from "../../../components/PageHeader";
import CustomTextField from "../../../components/CustomTextField";
import CustomSelect from "../../../components/CustomSelect";
import CustomDatePicker from "../../../components/CustomDatePicker";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";

// Import API queries and mutations hooks
import { useGet } from "../../../hooks/CRUD/useGet";
import { useCreate } from "../../../hooks/CRUD/useCreate";
import { useUpdate } from "../../../hooks/CRUD/useUpdate";
import { useDelete } from "../../../hooks/CRUD/useDelete";
import { getAllVisaPackagesApi, getAllVisaCategoriesApi } from "../../../api/queries/getters";
import { addVisaPackageApi, addVisaCategoryApi } from "../../../api/queries/post";
import { updateVisaPackageApi, updateVisaCategoryApi } from "../../../api/queries/patch";
import { deleteVisaPackageApi } from "../../../api/queries/delete";

const Package = () => {
    const { t } = useLocale();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    // Category dialog states
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [categoryDialogMode, setCategoryDialogMode] = useState("create"); // "create" | "edit"
    const [categoryInputValue, setCategoryInputValue] = useState("");
    const [categoryInputError, setCategoryInputError] = useState("");

    const { control, handleSubmit, reset, watch, setValue } = useForm({
        defaultValues: {
            name: "",
            index_number: "",
            price: "",
            category_guid: "",
            description: "",
            sale_price: "",
            sale_start_date: "",
            sale_end_date: "",
        }
    });

    const selectedCategoryGuid = watch("category_guid");

    // Fetch Packages via API
    const { data: packageList, isLoading, refetch } = useGet({
        apiFn: getAllVisaPackagesApi,
        key: "visa-packages",
    });

    // Fetch Categories via API
    const { data: categoriesList, refetch: refetchCategories } = useGet({
        apiFn: getAllVisaCategoriesApi,
        key: "visa-categories",
    });

    const categories = useMemo(() => categoriesList || [], [categoriesList]);

    // Create Package mutation
    const { mutate: createVisaPackage } = useCreate({
        apiFn: addVisaPackageApi,
        key: "visa-packages",
        onSuccess: () => {
            setDialogOpen(false);
            setEditing(null);
            refetch();
        }
    });

    // Update Package mutation
    const { mutate: updateVisaPackage } = useUpdate({
        apiFn: updateVisaPackageApi,
        key: "visa-packages",
        idKey: "guid",
        onSuccessUpdate: () => {
            setDialogOpen(false);
            setEditing(null);
            refetch();
        }
    });

    // Delete Package mutation
    const { mutate: deleteVisaPackage } = useDelete({
        deleteFn: deleteVisaPackageApi,
        queryKey: "visa-packages",
        idKey: "guid",
        invalidateQueries: ["visa-packages"],
    });

    // Create Category mutation
    const { mutate: createVisaCategory } = useCreate({
        apiFn: addVisaCategoryApi,
        key: "visa-categories",
        onSuccess: () => {
            refetchCategories();
        }
    });

    // Update Category mutation
    const { mutate: updateVisaCategory } = useUpdate({
        apiFn: updateVisaCategoryApi,
        key: "visa-categories",
        idKey: "guid",
        onSuccessUpdate: () => {
            refetchCategories();
            refetch(); // Refetch package list to display updated category name
        }
    });

    const nextSortOrder = useMemo(() => {
        return (packageList?.length || 0) + 1;
    }, [packageList]);

    const openCreate = () => {
        setEditing(null);
        reset({
            name: "",
            index_number: String(nextSortOrder),
            price: "",
            category_guid: categories[0]?.guid || "",
            description: "",
            sale_price: "",
            sale_start_date: "",
            sale_end_date: "",
        });
        setDialogOpen(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        reset({
            name: item.name || "",
            index_number: String(item.sort_order || ""),
            price: String(item.price || ""),
            category_guid: item.category_guid || item.category?.guid || "",
            description: item.description || "",
            sale_price: item.sale_price !== undefined && item.sale_price !== null ? String(item.sale_price) : "",
            sale_start_date: item.sale_start_date || "",
            sale_end_date: item.sale_end_date || "",
        });
        setDialogOpen(true);
    };

    const openAddCategory = () => {
        setCategoryDialogMode("create");
        setCategoryInputValue("");
        setCategoryInputError("");
        setCategoryDialogOpen(true);
    };

    const openEditCategory = () => {
        if (!selectedCategoryGuid) return;
        const currentCategory = categories.find((c) => c.guid === selectedCategoryGuid);
        if (!currentCategory) return;
        setCategoryDialogMode("edit");
        setCategoryInputValue(currentCategory.name || "");
        setCategoryInputError("");
        setCategoryDialogOpen(true);
    };

    const handleSaveCategory = () => {
        const trimmed = categoryInputValue.trim();
        if (!trimmed) {
            setCategoryInputError(t("validation.required") || "Hökman girizilmeli");
            return;
        }

        if (categoryDialogMode === "create") {
            const exists = categories.some((c) => c.name?.toLowerCase() === trimmed.toLowerCase());
            if (exists) {
                const existing = categories.find((c) => c.name?.toLowerCase() === trimmed.toLowerCase());
                setValue("category_guid", existing.guid);
                setCategoryDialogOpen(false);
                return;
            }
            createVisaCategory({ name: trimmed }, {
                onSuccess: (res) => {
                    const newGuid = res.data?.data?.guid || res.data?.guid;
                    if (newGuid) {
                        setValue("category_guid", newGuid);
                    }
                }
            });
        } else {
            const currentCategory = categories.find((c) => c.guid === selectedCategoryGuid);
            if (!currentCategory) return;
            if (currentCategory.name === trimmed) {
                setCategoryDialogOpen(false);
                return;
            }
            const exists = categories.some((c) => c.name?.toLowerCase() === trimmed.toLowerCase() && c.guid !== selectedCategoryGuid);
            if (exists) {
                setCategoryInputError(t("categoryExists") || "Bu kategoriýa eýýäm bar!");
                return;
            }
            updateVisaCategory({ guid: selectedCategoryGuid, name: trimmed });
        }
        setCategoryDialogOpen(false);
    };

    const onSubmit = (data) => {
        const payload = {
            name: data.name,
            category_guid: data.category_guid,
            price: Number(data.price || 0),
            sort_order: Number(data.index_number || 0),
            table_type: "bukja",
            description: data.description || "",
            sale_price: data.sale_price ? Number(data.sale_price) : null,
            sale_start_date: data.sale_start_date || null,
            sale_end_date: data.sale_end_date || null,
        };

        if (editing) {
            updateVisaPackage({ ...payload, guid: editing.guid || editing.id });
        } else {
            createVisaPackage(payload);
        }
    };

    const handleDelete = (item) => {
        if (!window.confirm(t("common.deleteConfirm") || `"${item.name}" pozmak isleýärsiňizmi?`)) return;
        deleteVisaPackage(item.guid || item.id);
    };

    // Category map lookup
    const categoriesMap = useMemo(() => {
        return Object.fromEntries(categories.map((c) => [c.guid, c.name]));
    }, [categories]);

    // Calculate grouped tariffs by category name
    const groupedTariffs = useMemo(() => {
        const groups = {};
        (packageList || []).forEach((t) => {
            const guid = t.category_guid || t.category?.guid;
            const catName = guid ? (categoriesMap[guid] || t.category?.name || "Beýlekiler") : (t.category || "Beýlekiler");
            if (!groups[catName]) {
                groups[catName] = [];
            }
            groups[catName].push(t);
        });

        // Sort each category's items by sort_order
        Object.keys(groups).forEach((cat) => {
            groups[cat].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || String(a.name).localeCompare(String(b.name)));
        });

        return groups;
    }, [packageList, categoriesMap]);

    // Active sale helper function
    const checkIsOnSale = (item) => {
        if (!item.sale_price || Number(item.sale_price) <= 0) return false;
        if (!item.sale_start_date || !item.sale_end_date) return false;

        const parseLocalDate = (dateStr) => {
            if (typeof dateStr === 'string') {
                if (dateStr.includes('T')) {
                    const d = new Date(dateStr);
                    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
                }
                const parts = dateStr.split('-');
                if (parts.length === 3) {
                    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                }
            }
            const d = new Date(dateStr);
            return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        };

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const start = parseLocalDate(item.sale_start_date);
        start.setHours(0, 0, 0, 0);

        const end = parseLocalDate(item.sale_end_date);
        end.setHours(23, 59, 59, 999);

        return now >= start && now <= end;
    };

    const formatPrice = (price) => {
        const num = Number(price || 0);
        const parts = num.toFixed(2).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return `TMT ${parts[0]},${parts[1]}`;
    };

    return (
        <Box>
            <PageHeader
                title={t("sidebar.visa.package")}
                pageTitle={`${t("sidebar.visa.package")} | Oguz Travel`}
                addButtonText={t("create")}
                onAddClick={openCreate}
            />

            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : Object.keys(groupedTariffs).length === 0 ? (
                <Box sx={{ py: 6, textAlign: "center" }}>
                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
                        {t("noData") || "Maglumat tapylmady"}
                    </Typography>
                </Box>
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                        alignItems: "start",
                        gap: 4,
                        mt: 3
                    }}
                >
                    {Object.entries(groupedTariffs).map(([categoryName, items]) => (
                        <Paper
                            key={categoryName}
                            elevation={0}
                            sx={{
                                borderRadius: "16px",
                                border: "1px solid",
                                borderColor: "divider",
                                overflow: "hidden",
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)"
                            }}
                        >
                            {/* Category Solid Teal Header */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    bgcolor: "#0c8a7b",
                                    px: 3,
                                    py: 1.75,
                                    color: "#ffffff"
                                }}
                            >
                                <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.5px" }}>
                                    {categoryName.toUpperCase()}
                                </Typography>
                                <Box
                                    sx={{
                                        bgcolor: "rgba(255, 255, 255, 0.18)",
                                        color: "#ffffff",
                                        borderRadius: "20px",
                                        px: 2,
                                        py: 0.5,
                                        fontSize: "0.8rem",
                                        fontWeight: 700,
                                    }}
                                >
                                    {items.length} sany
                                </Box>
                            </Box>

                            {/* Sub-header columns indicator */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    py: 1.25,
                                    px: 3,
                                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#faf9f5',
                                    borderBottom: "1px solid",
                                    borderColor: "divider"
                                }}
                            >
                                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#8c7e6b", letterSpacing: "0.5px" }}>
                                    {t("columns.serviceName")?.toUpperCase() || "HYZMAT"}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#8c7e6b", letterSpacing: "0.5px" }}>
                                        {t("columns.price")?.toUpperCase() || "BAHASY"}
                                    </Typography>
                                    <Box sx={{ width: "72px" }} />
                                </Box>
                            </Box>

                            {/* Category Items list */}
                            <Box>
                                {items.map((item, index) => {
                                    const isOnSale = checkIsOnSale(item);
                                    return (
                                        <Box
                                            key={item.guid || item.id}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                py: 1.75,
                                                px: 3,
                                                borderBottom: index === items.length - 1 ? "none" : "1px solid",
                                                borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
                                                backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.01)' : '#ffffff',
                                                transition: "background-color 0.2s",
                                                "&:hover": {
                                                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#fcfcf8',
                                                },
                                                "&:hover .row-actions": {
                                                    opacity: 1,
                                                    visibility: "visible"
                                                }
                                            }}
                                        >
                                            {/* Left side: name and helper information */}
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "text.primary" }}>
                                                    {item.name}
                                                </Typography>
                                                {item.description && (
                                                    <Tooltip title={item.description} arrow placement="top">
                                                        <IconButton size="small" sx={{ p: 0.25, color: "text.secondary" }}>
                                                            <HelpOutlineRoundedIcon sx={{ fontSize: "16px" }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {isOnSale && (
                                                    <Box
                                                        sx={{
                                                            backgroundColor: "error.main",
                                                            color: "#ffffff",
                                                            borderRadius: "4px",
                                                            px: 0.75,
                                                            py: 0.1,
                                                            fontSize: "0.65rem",
                                                            fontWeight: 700,
                                                            textTransform: "uppercase"
                                                        }}
                                                    >
                                                        {t("sale") || "Indirim"}
                                                    </Box>
                                                )}
                                            </Box>

                                            {/* Right side: price and action controls */}
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                                                {isOnSale ? (
                                                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                                                        <Typography sx={{ textDecoration: "line-through", color: "text.secondary", fontSize: "0.85rem" }}>
                                                            {formatPrice(item.price)}
                                                        </Typography>
                                                        <Typography sx={{ fontWeight: 700, color: "error.main", fontSize: "0.95rem" }}>
                                                            {formatPrice(item.sale_price)}
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.95rem" }}>
                                                        {formatPrice(item.price)}
                                                    </Typography>
                                                )}

                                                {/* Actions container (shown smoothly on hover) */}
                                                <Box
                                                    className="row-actions"
                                                    sx={{
                                                        display: "flex",
                                                        gap: 0.5,
                                                        opacity: 0,
                                                        visibility: "hidden",
                                                        transition: "opacity 0.2s ease, visibility 0.2s ease",
                                                        width: "72px",
                                                        justifyContent: "flex-end"
                                                    }}
                                                >
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openEdit(item)}
                                                        sx={{
                                                            color: "#0c8a7b",
                                                            p: 0.5,
                                                            "&:hover": {
                                                                bgcolor: "rgba(12, 138, 123, 0.08)"
                                                            }
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDelete(item)}
                                                        sx={{
                                                            color: "error.main",
                                                            p: 0.5,
                                                            "&:hover": {
                                                                bgcolor: "rgba(239, 68, 68, 0.08)"
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Paper>
                    ))}
                </Box>
            )}

            <CustomDialog open={dialogOpen} close={() => setDialogOpen(false)} widthX={600}>
                <CustomDialogHeader
                    variant="h5"
                    title={editing ? t("edit") : t("create")}
                />
                <CustomForm handleSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1.5 }}>
                        {/* Category Selector */}
                        <Box sx={{ width: "100%" }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    mb: 0.75,
                                    fontWeight: 600,
                                    fontSize: "0.875rem",
                                    color: "text.primary",
                                }}
                            >
                                {t("columns.category")}
                                <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <CustomSelect
                                        name="category_guid"
                                        control={control}
                                        options={categories}
                                        getRowId={(item) => item.guid}
                                        getRowLabel={(item) => item.name}
                                        required
                                    />
                                </Box>
                                <IconButton
                                    onClick={openAddCategory}
                                    color="primary"
                                    sx={{
                                        height: "44px",
                                        width: "44px",
                                        borderRadius: "7px",
                                        border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.23)',
                                        "&:hover": {
                                            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                                        }
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>
                                <IconButton
                                    onClick={openEditCategory}
                                    disabled={!selectedCategoryGuid}
                                    color="primary"
                                    sx={{
                                        height: "44px",
                                        width: "44px",
                                        borderRadius: "7px",
                                        border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.23)',
                                        "&.Mui-disabled": {
                                            borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.12)',
                                        },
                                        "&:hover": {
                                            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                                        }
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Box>
                        </Box>

                        {/* Service Name */}
                        <CustomTextField
                            name="name"
                            control={control}
                            label={t("columns.serviceName") || "Hyzmat ady"}
                            required
                        />

                        {/* Description field */}
                        <CustomTextField
                            name="description"
                            control={control}
                            label={t("columns.description") || "Düşündiriş"}
                            multiline
                            rows={2}
                        />

                        {/* Price and Sort Order */}
                        <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                            <Box sx={{ flex: 1 }}>
                                <CustomTextField
                                    name="price"
                                    control={control}
                                    type="number"
                                    label={t("columns.price") || "Bahasy"}
                                    required
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <CustomTextField
                                    name="index_number"
                                    control={control}
                                    type="number"
                                    label={t("columns.sortOrder") || "Tertip belgisi"}
                                    required
                                />
                            </Box>
                        </Box>

                        {/* Sale Discount Settings Section */}
                        <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: "8px", p: 2, mt: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "error.main" }}>
                                {t("saleSettings") || "Arzanladyş / Indirim (Optional)"}
                            </Typography>
                            <CustomTextField
                                name="sale_price"
                                control={control}
                                type="number"
                                label={t("columns.salePrice") || "Arzanladyşly bahasy (Sale Price)"}
                            />
                            <Box sx={{ display: "flex", gap: 2, mt: 1.5 }}>
                                <Box sx={{ flex: 1 }}>
                                    <CustomDatePicker
                                        name="sale_start_date"
                                        control={control}
                                        label={t("columns.saleStartDate") || "Başlangyç senesi"}
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <CustomDatePicker
                                        name="sale_end_date"
                                        control={control}
                                        label={t("columns.saleEndDate") || "Gutarýan senesi"}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                    <FooterButton
                        loading={false}
                        onCancel={() => setDialogOpen(false)}
                        type="submit"
                        sx={{ mt: 3 }}
                    />
                </CustomForm>
            </CustomDialog>

            <CustomDialog open={categoryDialogOpen} close={() => setCategoryDialogOpen(false)} widthX={400}>
                <CustomDialogHeader
                    variant="h6"
                    title={categoryDialogMode === "edit" ? t("editCategory") || "Kategoriýany düzetmek" : t("addCategory") || "Täze kategoriýa goşmak"}
                />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1.5 }}>
                    <TextField
                        fullWidth
                        label={t("columns.category") || "Kategoriýa"}
                        value={categoryInputValue}
                        onChange={(e) => {
                            setCategoryInputValue(e.target.value);
                            if (e.target.value.trim()) setCategoryInputError("");
                        }}
                        error={Boolean(categoryInputError)}
                        helperText={categoryInputError}
                        autoFocus
                    />
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                        <Button onClick={() => setCategoryDialogOpen(false)} variant="outlined">
                            {t("cancel") || "Ýatyrmak"}
                        </Button>
                        <Button onClick={handleSaveCategory} variant="contained" color="primary">
                            {t("save") || "Ýatda sakla"}
                        </Button>
                    </Box>
                </Box>
            </CustomDialog>
        </Box>
    );
}

export default Package;