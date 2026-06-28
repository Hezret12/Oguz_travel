import { useMemo, useState } from 'react';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { useLocale } from '../../../hooks/useLocale';
import { getDefaultMRTOptions } from '../../../hooks/getDefaultMRTOptions';
import PageHeader from '../../../components/PageHeader';
import GlobalSearchInput from '../../../components/GlobalSearchInput';
import Pagination from '../../../components/Pagination';

const initialData = [
  { id: 'ta-1', pnr: 'TA1234', clientName: 'Ayna Mammedova', flight: 'IST-AYT', status: 'Confirmed', cabin: 'Economy' },
  { id: 'ta-2', pnr: 'TA2234', clientName: 'Serdar Annaguliyev', flight: 'IST-ANK', status: 'Pending', cabin: 'Business' },
  { id: 'ta-3', pnr: 'TA3234', clientName: 'Meryem Hudaeva', flight: 'ASB-IST', status: 'Ticketed', cabin: 'Economy' },
];

const TurkishAirlines = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const [searchQuery, setSearchQuery] = useState('');
  const [rowSelection, setRowSelection] = useState({});

  const filteredData = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();
    if (!normalizedQuery) return initialData;
    return initialData.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    );
  }, [searchQuery]);

  const columns = useMemo(
    () => [
      { accessorKey: 'pnr', header: 'PNR', size: 120 },
      { accessorKey: 'clientName', header: t('ticket.turkish.client') ?? 'Client', size: 220 },
      { accessorKey: 'flight', header: t('ticket.turkish.flight') ?? 'Flight', size: 140 },
      {
        accessorKey: 'status',
        header: t('ticket.turkish.status') ?? 'Status',
        size: 140,
        Cell: ({ cell }) => (
          <Chip size="small" label={cell.getValue()} sx={{ fontWeight: 700 }} />
        ),
      },
      { accessorKey: 'cabin', header: t('ticket.turkish.cabin') ?? 'Cabin', size: 120 },
    ],
    [t],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    columns,
    data: filteredData,
    state: { ...defaultMrtOptions.state, rowSelection },
    onRowSelectionChange: setRowSelection,
    renderTopToolbarCustomActions: () => (
      <GlobalSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t('search') ?? 'Search...'}
      />
    ),
    renderBottomToolbar: ({ table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      const pageCount = table.getPageCount();

      return (
        <Box
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 0.75,
            minHeight: '52px',
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <Box />
          <Pagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            pageSize={pageSize}
            totalRows={filteredData.length}
            onPageChange={(newIndex) => table.setPageIndex(newIndex)}
          />
        </Box>
      );
    },
    muiTablePaperProps: {
      sx: () => ({
        ...defaultMrtOptions.muiTablePaperProps?.sx,
      }),
    },
  });

  return (
    <>
      <PageHeader
        title={t('ticket.turkish.title') ?? 'Turkish Airlines'}
        pageTitle={`${t('ticket.turkish.title') ?? 'Turkish Airlines'} | Oguz Travel`}
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
        {[
          { label: t('ticket.turkish.totalBookings') ?? 'Bookings', value: initialData.length },
          { label: t('ticket.turkish.ticketed') ?? 'Ticketed', value: initialData.filter((row) => row.status === 'Ticketed').length },
          { label: t('ticket.turkish.pending') ?? 'Pending', value: initialData.filter((row) => row.status === 'Pending').length },
        ].map((card) => (
          <Card key={card.label} sx={{ flex: 1, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">{card.label}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>{card.value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <MaterialReactTable table={table} />
    </>
  );
};

export default TurkishAirlines;
