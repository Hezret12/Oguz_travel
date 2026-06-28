import { Box, Typography } from '@mui/material';

const ClientOption = ({ client, dense = false }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: dense ? 0.2 : 0.4 }}>
      <Typography sx={{ fontWeight: 700, fontSize: dense ? '0.9rem' : '0.95rem', lineHeight: 1.3 }}>
        {client.fullName}
      </Typography>
      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
        Client ID: {client.clientId}
      </Typography>
      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
        Passport: {client.passportNumber}
      </Typography>
      <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
        Phone: +993 {client.phoneNumber}
      </Typography>
    </Box>
  );
};

export default ClientOption;
