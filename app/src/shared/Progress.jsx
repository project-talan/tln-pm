import { LinearProgress, Box } from '@mui/material';

function Progress() {
  return (
    <Box sx={{ width: '100%'}}>
      <LinearProgress color="secondary" elevation={0}/>
    </Box>
  );
}

export default Progress;