import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

function Dashboard() {

  return (
    <Container maxWidth="xl" sx={{backgroundColor: 'skyblue', pt: 2}}>
      <Box sx={{display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', backgroundColor: 'lightgrey1'}}>      
        Dashboard
      </Box>
    </Container>
  );
}
export default Dashboard;