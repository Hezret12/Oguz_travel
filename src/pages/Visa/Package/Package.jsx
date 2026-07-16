import { useMemo, useState, useEffect } from "react";
import { Box, Button, TextField, Tabs, Tab, Paper, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useLocale } from "../../../hooks/useLocale";
import PageHeader from "../../../components/PageHeader";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import CustomTextField from "../../../components/CustomTextField";
import CustomSelect from "../../../components/CustomSelect";
import { CustomDialog } from "../../../components/Dialog/CustomDialog";
import { CustomDialogHeader } from "../../../components/Dialog/CustomDialogHeader";
import { CustomForm } from "../../../components/Dialog/CustomForm";
import { FooterButton } from "../../../components/Dialog/FooterButton";

const MOCK_TARIFFS = [
    { id: "1", name: "Wiza goldaw we arza taýýarlamak", category: "Wiza", price: 150, sort_order: 1, table_type: "bukja" },
    { id: "2", name: "Doly bukja (Konsultasiýa + Terjime + Ätiýaçlandyryş)", category: "Bukja", price: 350, sort_order: 2, table_type: "bukja" },
    { id: "3", name: "Konsultasiýa hyzmaty", category: "Maslahat", price: 50, sort_order: 1, table_type: "ayry" },
    { id: "4", name: "Resminamalary terjime etmek (1 sahypa)", category: "Terjime", price: 30, sort_order: 2, table_type: "ayry" },
    { id: "5", name: "Ätiýaçlandyryş hyzmaty", category: "Ätiýaçlandyryş", price: 120, sort_order: 3, table_type: "ayry" },
];

const STORAGE_KEY = "service_tariffs";

const Package = () => {
    const { t } = useLocale();
    const [tariffs, setTariffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("bukja");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [bulkMode, setBulkMode] = useState(false);
    const [priceEdits, setPriceEdits] = useState({});

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            name: "",
            index_number: "",
            price: "",
            category: "",
        }
    });

    useEffect(() => {
        load();
    }, []);

    const load = () => {
        setLoading(true);
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_TARIFFS));
                setTariffs(MOCK_TARIFFS);
            } else {
                setTariffs(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Failed to load tariffs:", error);
        } finally {
            setLoading(false);
        }
    };

    const tabItems = useMemo(() => {
        return tariffs
            .filter((x) => x.table_type === activeTab)
            .sort(
                (a, b) =>
                    (a.sort_order || 0) - (b.sort_order || 0) ||
                    String(a.name).localeCompare(String(b.name))
            );
    }, [tariffs, activeTab]);

    const existingCategories = useMemo(() => {
        const cats = Array.from(new Set(tariffs.map((t) => t.category).filter(Boolean)));
        return cats.length > 0 ? cats : ["Wiza", "Maslahat", "Terjime", "Ätiýaçlandyryş"];
    }, [tariffs]);

    const nextSortOrder = useMemo(() => {
        return (tariffs.filter((t) => t.table_type === activeTab).length || 0) + 1;
    }, [tariffs, activeTab]);

    const openCreate = () => {
        setEditing(null);
        reset({
            name: "",
            index_number: String(nextSortOrder),
            price: "",
            category: existingCategories[0] || "",
        });
        setDialogOpen(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        reset({
            name: item.name || "",
            index_number: String(item.sort_order || ""),
            price: String(item.price || ""),
            category: item.category || "",
        });
        setDialogOpen(true);
    };

    const onSubmit = (data) => {
        const payload = {
            name: data.name,
            category: data.category,
            price: Number(data.price || 0),
            sort_order: Number(data.index_number || 0),
            table_type: activeTab,
        };

        let updated;
        if (editing) {
            updated = tariffs.map((t) =>
                t.id === editing.id ? { ...t, ...payload } : t
            );
        } else {
            const newId = String(Date.now());
            updated = [...tariffs, { id: newId, ...payload }];
        }

        setTariffs(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setDialogOpen(false);
        setEditing(null);
    };

    const handleDelete = (item) => {
        if (!window.confirm(t("common.deleteConfirm") || `"${item.name}" pozmak isleýärsiňizmi?`)) return;
        const updated = tariffs.filter((t) => t.id !== item.id);
        setTariffs(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const toggleBulk = () => {
        if (bulkMode) {
            exitBulk();
            return;
        }
        const map = {};
        tabItems.forEach((t) => {
            map[t.id] = String(t.price ?? 0);
        });
        setPriceEdits(map);
        setBulkMode(true);
    };

    const exitBulk = () => {
        setBulkMode(false);
        setPriceEdits({});
    };

    const onEditPrice = (id, value) => {
        setPriceEdits((prev) => ({ ...prev, [id]: value }));
    };

    const changedItems = useMemo(() => {
        if (!bulkMode) return [];
        return tabItems.filter((t) => {
            const v = priceEdits[t.id];
            return v !== undefined && v !== "" && Number(v) !== Number(t.price);
        });
    }, [bulkMode, tabItems, priceEdits]);

    const changedCount = changedItems.length;

    const changeTab = (newValue) => {
        if (bulkMode) exitBulk();
        setActiveTab(newValue);
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: "sort_order",
                header: "#",
                size: 60,
            },
            {
                accessorKey: "name",
                header: t("columns.serviceName") || "Hyzmat ady",
            },
            {
                accessorKey: "category",
                header: t("columns.category") || "Kategoriýa",
            },
            {
                accessorKey: "price",
                header: t("columns.price") || "Bahasy",
                Cell: ({ cell, row }) => {
                    if (bulkMode) {
                        return (
                            <TextField
                                value={priceEdits[row.original.id] ?? ""}
                                onChange={(e) => onEditPrice(row.original.id, e.target.value)}
                                type="number"
                                size="small"
                                sx={{ width: 100 }}
                            />
                        );
                    }
                    return `${cell.getValue()} TMT`;
                },
            },
            {
                id: "actions",
                header: t("columns.actions"),
                enableColumnFilter: false,
                enableSorting: false,
                size: 150,
                Cell: ({ row }) => {
                    if (bulkMode) return null;
                    return (
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => openEdit(row.original)}
                            >
                                {t("common.edit") || "Düzet"}
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleDelete(row.original)}
                            >
                                {t("common.delete") || "Poz"}
                            </Button>
                        </Box>
                    );
                },
            },
        ],
        [t, bulkMode, priceEdits]
    );

    const table = useMaterialReactTable({
        columns,
        data: tabItems,
        initialState: { density: "compact" },
        enableDensityToggle: false,
        enableFullScreenToggle: false,
        enableHiding: false,
        enableColumnFilters: false,
        enableGlobalFilter: false,
        state: { isLoading: loading },
    });

    return (
        <Box>
            <PageHeader
                title={t("sidebar.visa.package")}
                pageTitle={`${t("sidebar.visa.package")} | Oguz Travel`}
                addButtonText={activeTab === "bukja" ? t("common.create") : null}
                onAddClick={activeTab === "bukja" && !bulkMode ? openCreate : null}
            />

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3, width: "500px" }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => changeTab(newValue)}
                >
                    <Tab value="bukja" label={t("sidebar.visa.packages")} />
                    <Tab value="ayry" label={t("sidebar.visa.individualServices")} />
                </Tabs>
            </Box>

            <MaterialReactTable table={table} />

            <CustomDialog open={dialogOpen} close={() => setDialogOpen(false)} widthX={600}>
                <CustomDialogHeader
                    variant="h5"
                    title={editing ? t("common.edit") || "Tarif Düzeletmek" : t("common.create") || "Täze Tarif Goşmak"}
                />
                <CustomForm handleSubmit={handleSubmit(onSubmit)}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1.5 }}>
                        <CustomTextField
                            name="name"
                            control={control}
                            label={t("columns.serviceName") || "Hyzmat ady"}
                            required
                        />
                        <CustomSelect
                            name="category"
                            control={control}
                            label={t("columns.category") || "Kategoriýa"}
                            options={existingCategories}
                            getRowId={(item) => item}
                            getRowLabel={(item) => item}
                            required
                        />
                        <CustomTextField
                            name="price"
                            control={control}
                            type="number"
                            label={t("columns.price") || "Bahasy"}
                            required
                        />
                        <CustomTextField
                            name="index_number"
                            control={control}
                            type="number"
                            label={t("columns.sortOrder") || "Tertip belgisi"}
                            required
                        />
                    </Box>
                    <FooterButton
                        loading={false}
                        onCancel={() => setDialogOpen(false)}
                        type="submit"
                        sx={{ mt: 3 }}
                    />
                </CustomForm>
            </CustomDialog>
        </Box>
    );
}

export default Package;