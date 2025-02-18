import { Box, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';

import { theme } from './Theme';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <Box sx={{ width: '100%', p: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} backgroundColor={theme.error.backgroundColor}>
      <Typography color={theme.error.color} sx={{pl: 1}}>{error.message}</Typography>
      <IconButton aria-label="close" onClick={() => resetErrorBoundary()} >
        <RefreshIcon />
      </IconButton>
    </Box>
  );
}

export default ErrorFallback;