import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const FinanceLayout = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <Outlet />
    </Box>
  );
};

export default FinanceLayout;
