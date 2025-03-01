import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function Status({ status, width, height }) {
  const w = width || '100%';
  const h = height || '20px';
  return (
    <Box sx={{ width: w,  height: h, display: 'flex', flexDirection: 'row', color: 'white', backgroundColor: 'black', borderRadius: 4, overflow: 'hidden'}}>
      {status.map((s, index) => (
        <Box key={index} sx={{width: s.percents, backgroundColor: s.backgroundColor, color: s.color, display: "grid", placeItems: 'center'}}>
          <Typography sx={{ fontSize: '14px' }}>{s.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export default Status;