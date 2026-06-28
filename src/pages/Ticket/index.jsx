import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const TicketLayout = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <Outlet />
    </Box>
  );
};

export default TicketLayout;
