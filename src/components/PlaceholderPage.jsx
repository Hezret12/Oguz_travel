import { Box, Paper, Typography } from '@mui/material';

const PlaceholderPage = ({ title, description }) => (
  <Box sx={{ py: 2 }}>
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  </Box>
);

export default PlaceholderPage;
