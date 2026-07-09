import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { useLocale } from '../../../hooks/useLocale';
import { getDefaultMRTOptions } from '../../../hooks/getDefaultMRTOptions';
import PageHeader from '../../../components/PageHeader';
import GlobalSearchInput from '../../../components/GlobalSearchInput';
import Pagination from '../../../components/Pagination';
import FilterDrawer from '../../../components/FilterDrawer';
import { useClientsQuery } from '../../../pages/Clients/hooks/useClientsQuery';
import { useB2BTickets } from './useB2BTickets';
import AddB2BTicketDialog from './AddB2BTicketDialog';

const formatDate = (value) => {
  if (!value) return '';
  const [year, month, day] = String(value).split('-');
  return `${day}.${month}.${year}`;
};

const currency = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const B2B = () => {
  const { t } = useLocale();
  const defaultMrtOptions = getDefaultMRTOptions();
  const { data: clients = [] } = useClientsQuery();
  const { tickets, addTicket, updateTicket, deleteTicket } = useB2BTickets();
  const [searchQuery, setSearchQuery] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectsOpen, setSelectsOpen] = useState({
    status: false,
    airline: false,
    tripType: false,
    office: false,
  });
  const [filters, setFilters] = useState({
    status: '',
    airline: '',
    tripType: '',
    office: '',
  });

  const clientById = useMemo(
    () => Object.fromEntries(clients.map((client) => [client.id, client])),
    [clients],
  );

  const filteredTickets = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return tickets.filter((ticket) => {
      const client = clientById[ticket.clientId];

      if (filters.status && ticket.status !== filters.status) return false;
      if (filters.airline && ticket.airline !== filters.airline) return false;
      if (filters.tripType && ticket.tripType !== filters.tripType) return false;
      if (filters.office && ticket.office !== filters.office) return false;
      if (!normalizedQuery) return true;

      return [
        ticket.ticketNo,
        ticket.pnr,
        ticket.status,
        ticket.airline,
        ticket.route,
        ticket.office,
        ticket.operator,
        ticket.operatorTwo,
        ticket.agent,
        ticket.agentFullName,
        ticket.agentPhoneNumber,
        client?.fullName,
        client?.passportNumber,
        client?.phoneNumber,
        client?.clientId,
      ].some((value) => String(value ?? '').toLowerCase().includes(normalizedQuery));
    });
  }, [tickets, filters, searchQuery, clientById]);

  const statusOptions = useMemo(
    () => Array.from(new Set(tickets.map((ticket) => ticket.status))).filter(Boolean),
    [tickets],
  );
  const airlineOptions = useMemo(
    () => Array.from(new Set(tickets.map((ticket) => ticket.airline))).filter(Boolean),
    [tickets],
  );
  const tripTypeOptions = useMemo(
    () => Array.from(new Set(tickets.map((ticket) => ticket.tripType))).filter(Boolean),
    [tickets],
  );
  const officeOptions = useMemo(
    () => Array.from(new Set(tickets.map((ticket) => ticket.office))).filter(Boolean),
    [tickets],
  );



  const columns = useMemo(
    () => [
      {
        id: 'rowNumber',
        header: '#',
        size: 60,
        enableSorting: false,
        Cell: ({ row, table }) => {
          const { pageIndex, pageSize } = table.getState().pagination ?? { pageIndex: 0, pageSize: 10 };
          return (
            <Box sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {pageIndex * pageSize + row.index + 1}
            </Box>
          );
        },
      },
      {
        accessorFn: (row) => row.ticketNo,
        id: 'ticketNo',
        header: t('columns.ticketNo', 'Ticket No'),
        size: 100,
      },
      {
        accessorFn: (row) => clientById[row.clientId]?.fullName ?? row.clientId,
        id: 'client',
        header: t('columns.client', 'Client'),
        size: 260,
        Cell: ({ row }) => {
          const client = clientById[row.original.clientId];
          if (!client) return row.original.clientId;

          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
              <Typography sx={{ fontWeight: 700 }}>{client.fullName}</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                {client.clientId} | Passport: {client.passportNumber}
              </Typography>
            </Box>
          );
        },
      },
      {
        accessorFn: (row) => row.pnr,
        id: 'pnr',
        header: 'PNR',
        size: 120,
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: t('columns.status', 'Status'),
        size: 120,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          const colorMap = {
            SALE: { bg: 'rgba(22, 163, 74, 0.12)', fg: '#16a34a' },
            REISSUE: { bg: 'rgba(37, 99, 235, 0.12)', fg: '#2563eb' },
            REFUND: { bg: 'rgba(239, 68, 68, 0.12)', fg: '#ef4444' },
          };
          const styles = colorMap[value] ?? colorMap.SALE;

          return (
            <Chip
              label={value}
              size="small"
              sx={{
                backgroundColor: styles.bg,
                color: styles.fg,
                fontWeight: 700,
              }}
            />
          );
        },
      },
      {
        accessorFn: (row) => row.airline,
        id: 'airline',
        header: t('columns.airline', 'Airline'),
        size: 160,
      },
      {
        accessorFn: (row) => row.route,
        id: 'route',
        header: t('columns.route', 'Route'),
        size: 180,
      },
      {
        accessorFn: (row) => row.cabinClass,
        id: 'cabinClass',
        header: t('columns.cabinClass', 'Class'),
        size: 120,
      },
      {
        accessorFn: (row) => row.tripType,
        id: 'tripType',
        header: t('columns.tripType', 'Trip Type'),
        size: 130,
      },
      {
        accessorFn: (row) => row.flightDate,
        id: 'flightDate',
        header: t('columns.flightDate', 'Flight Date'),
        size: 120,
        Cell: ({ cell }) => formatDate(cell.getValue()),
      },
      {
        accessorFn: (row) => row.netFare,
        id: 'netFare',
        header: t('columns.netFare', 'Net Fare'),
        size: 110,
        Cell: ({ cell }) => currency.format(Number(cell.getValue() ?? 0)),
      },
      {
        accessorFn: (row) => row.saleFare,
        id: 'saleFare',
        header: t('columns.saleFare', 'Sale Fare'),
        size: 110,
        Cell: ({ cell }) => currency.format(Number(cell.getValue() ?? 0)),
      },
      {
        accessorFn: (row) => row.profit,
        id: 'profit',
        header: t('columns.profit', 'Profit'),
        size: 100,
        Cell: ({ cell }) => {
          const profit = Number(cell.getValue() ?? 0);
          return (
            <Box sx={{ fontWeight: 700, color: profit >= 0 ? '#16a34a' : '#ef4444' }}>
              {currency.format(profit)}
            </Box>
          );
        },
      },
      {
        accessorFn: (row) => row.office,
        id: 'office',
        header: t('columns.office', 'Office'),
        size: 110,
      },
      {
        id: 'actions',
        header: t('columns.actions', 'Actions'),
        size: 100,
        enableSorting: false,
        muiTableHeadCellProps: { align: 'center' },
        muiTableBodyCellProps: { align: 'center' },
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Box
              component="button"
              onClick={(event) => {
                event.stopPropagation();
                setEditingTicket(row.original);
                setCreateOpen(true);
              }}
              sx={(theme) => ({
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: '7px',
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                color: theme.palette.text.secondary,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)',
                  borderColor: theme.palette.text.secondary,
                  color: theme.palette.text.primary,
                  transform: 'translateY(-1px)',
                },
                '&:active': { transform: 'scale(0.95)' },
              })}
            >
              <EditIcon sx={{ fontSize: 14 }} />
            </Box>

            <Box
              component="button"
              onClick={(event) => {
                event.stopPropagation();
                deleteTicket(row.original.id);
              }}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                borderRadius: '7px',
                border: '1px solid rgba(239,68,68,0.35)',
                backgroundColor: 'rgba(239,68,68,0.07)',
                color: '#ef4444',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                outline: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(239,68,68,0.15)',
                  borderColor: '#ef4444',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(239,68,68,0.25)',
                },
                '&:active': { transform: 'scale(0.95)' },
              }}
            >
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 14 }} />
            </Box>
          </Box>
        ),
      },
    ],
    [clientById, deleteTicket, t],
  );

  const table = useMaterialReactTable({
    ...defaultMrtOptions,
    enableColumnPinning: true,
    initialState: {
      ...defaultMrtOptions.initialState,
      columnPinning: {
        left: ['rowNumber'],
        right: ['actions'],
      },
    },
    columns,
    data: filteredTickets,
    state: {
      ...defaultMrtOptions.state,
      rowSelection,
    },
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    renderTopToolbarCustomActions: () => (
      <GlobalSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t('search', 'Search...')}
      />
    ),
    renderBottomToolbar: ({ table: mrtTable }) => {
      const { pageIndex, pageSize } = mrtTable.getState().pagination;
      const pageCount = mrtTable.getPageCount();

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
            totalRows={filteredTickets.length}
            onPageChange={(newIndex) => mrtTable.setPageIndex(newIndex)}
          />
        </Box>
      );
    },
    muiTablePaperProps: {
      sx: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      },
    },
    muiTableContainerProps: {
      sx: (theme) => ({
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        position: 'relative',
        borderTop: `1px solid ${theme.palette.divider}`,
        '&::-webkit-scrollbar': {
          width: '10px',
          height: '10px',
        },
        '&::-webkit-scrollbar-track': {
          background: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f0f0f0',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.mode === 'dark' ? '#555' : '#c0c0c0',
          borderRadius: '10px',
          border: `2px solid ${theme.palette.mode === 'dark' ? '#1e1e1e' : '#f0f0f0'}`,
        },
        scrollbarWidth: 'thin',
      }),
    },
    muiTableHeadProps: {
      sx: {
        position: 'sticky',
        top: 0,
        zIndex: 4,
      },
    },
    muiTableHeadCellProps: ({ column }) => ({
      sx: (theme) => ({
        ...(column.id === 'rowNumber' || column.id === 'actions'
          ? {
              position: 'sticky',
              zIndex: 3,
              backgroundColor: theme.palette.background.paper,
            }
          : {}),
      }),
    }),
    muiTableBodyCellProps: ({ column }) => ({
      sx: (theme) => ({
        ...(column.id === 'rowNumber' || column.id === 'actions'
          ? {
              position: 'sticky',
              zIndex: 2,
              backgroundColor: theme.palette.background.paper,
            }
          : {}),
      }),
    }),
    muiTableBodyRowProps: ({ row }) => ({
      sx: (theme) => ({
        cursor: 'pointer',
        backgroundColor: row.getIsSelected()
          ? theme.palette.mode === 'dark'
            ? 'rgba(0, 114, 229, 0.2) !important'
            : 'rgba(0, 114, 229, 0.1) !important'
          : 'inherit',
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        },
      }),
    }),
  });

  return (
    <Box>
      <PageHeader
        title={t('pages.ticket.b2b.title', 'B2B')}
        pageTitle={`${t('pages.ticket.b2b.title', 'B2B')} | Oguz Travel`}
        addButtonText={t('pages.ticket.b2b.addTicket', 'Add Ticket')}
        onAddClick={() => {
          setEditingTicket(null);
          setCreateOpen(true);
        }}
        filterButtonText={t('pages.ticket.filter', 'Filter')}
        onFilterClick={() => setIsFilterOpen(true)}
      />
     
        <MaterialReactTable table={table} />

      <FilterDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={() => setIsFilterOpen(false)}
        onReset={() => setFilters({ status: '', airline: '', tripType: '', office: '' })}
        onCancel={() => setIsFilterOpen(false)}
        title={t('pages.ticket.filter', 'Filter')}
      >
        <Stack spacing={2.5}>
          {[
            { label: t('columns.status', 'Status'), key: 'status', options: statusOptions },
            { label: t('columns.airline', 'Airline'), key: 'airline', options: airlineOptions },
            { label: t('columns.tripType', 'Trip Type'), key: 'tripType', options: tripTypeOptions },
            { label: t('columns.office', 'Office'), key: 'office', options: officeOptions },
          ].map((filterConfig) => (
            <FormControl key={filterConfig.key} fullWidth size="small">
              <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, color: 'text.primary' }}>
                {filterConfig.label}
              </Typography>
              <Select
                value={filters[filterConfig.key]}
                onChange={(event) =>
                  setFilters((previous) => ({ ...previous, [filterConfig.key]: event.target.value }))
                }
                open={selectsOpen[filterConfig.key]}
                onOpen={() => setSelectsOpen((previous) => ({ ...previous, [filterConfig.key]: true }))}
                onClose={() => setSelectsOpen((previous) => ({ ...previous, [filterConfig.key]: false }))}
                IconComponent={selectsOpen[filterConfig.key] ? KeyboardArrowUpIcon : KeyboardArrowDownIcon}
                displayEmpty
                sx={{
                  borderRadius: '10px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: '12px',
                      mt: '4px',
                    },
                  },
                }}
              >
                <MenuItem value="">
                  <em>{t('all', 'All')}</em>
                </MenuItem>
                {filterConfig.options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
        </Stack>
      </FilterDrawer>

      <AddB2BTicketDialog
        open={createOpen}
        ticket={editingTicket}
        onClose={() => {
          setCreateOpen(false);
          setEditingTicket(null);
        }}
        onSave={(values) => {
          if (editingTicket) {
            updateTicket(editingTicket.id, values);
          } else {
            addTicket(values);
          }
        }}
      />
    </Box>
  );
};

export default B2B;

